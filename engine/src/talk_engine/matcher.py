"""Recognize stuck phrases in what the learner said (decisions 7, 13, 14).

The matcher only recognizes; deciding what happens next is the ladder's job.
"""

import re
from collections.abc import Iterable
from typing import Literal

from pydantic import BaseModel, ConfigDict

from talk_engine.config import Action, EngineConfig, StuckPhrase
from talk_engine.normalize import normalize

Language = Literal["ar", "en"]
Patterns = tuple[str, ...]  # one language's patterns, any number of them
LanguagePatterns = tuple[Language, Patterns]  # e.g. ("ar", ("لم افهم", ...))


class StuckMatch(BaseModel):
    """What the matcher found: which stuck phrase, and the term if one was named.

    `matched_text` and `missed_term` are in normalized form (no vowel marks, one
    alef, ي not ى, no punctuation, lowercase), not as the learner said them. The
    raw transcript is kept separately by the caller.
    """

    model_config = ConfigDict(frozen=True)

    phrase_id: str
    action: Action
    entry_rung: int | None
    language: Language
    pattern: str  # the config pattern that matched, exactly as written in the file
    matched_text: str  # the part of the normalized learner text that matched
    missed_term: str | None  # the term the learner named, if any (not yet resolved)


class StuckMatcher:
    """Finds the first stuck phrase, in config order, inside the learner's text."""

    def __init__(self, config: EngineConfig) -> None:
        # Compile every pattern once. Each is wrapped in \b...\b so it only matches
        # whole words ("اعد" must not match inside "ساعده"); pattern authors do not
        # have to remember this.
        entries: list[tuple[StuckPhrase, Language, str, re.Pattern[str]]] = []
        for phrase in config.stuck_phrases:
            # Exactly two: Arabic, then English. A new language changes this type.
            by_language: tuple[LanguagePatterns, LanguagePatterns] = (
                ("ar", phrase.patterns_ar),  # Arabic first (decision 14)
                ("en", phrase.patterns_en),
            )
            for language, patterns in by_language:
                for pattern in patterns:
                    compiled = re.compile(rf"\b(?:{pattern})\b")
                    entries.append((phrase, language, pattern, compiled))
        # A tuple, not a list: once built, no code can add, remove or reorder
        # patterns. One matcher is shared by every conversation.
        self._patterns = tuple(entries)

    def match(self, text: str) -> StuckMatch | None:
        """Return the first stuck phrase found in `text`, or None if there is none.

        `text` is normalized here, so callers cannot forget to. The phrase is
        searched for anywhere in the text, so fillers around it ("امم", "يعني")
        do not prevent a match; they stay in the raw transcript as data.
        """
        clean = normalize(text)
        for phrase, language, pattern, compiled in self._patterns:
            found = compiled.search(clean)
            if found:
                return StuckMatch(
                    phrase_id=phrase.id,
                    action=phrase.action,
                    entry_rung=phrase.entry_rung,
                    language=language,
                    pattern=pattern,
                    matched_text=found.group(0),
                    missed_term=found.groupdict().get("missed_term"),
                )
        return None


def resolve_term(term: str, target_words: Iterable[str]) -> str | None:
    """Return the target word or phrase the learner named inside `term`, or None.

    `term` is a StuckMatch.missed_term: everything after the trigger, raw, so it
    may hold fillers ("يعني طبعة امم") or several words ("البيت الجديد").
    Exact matching only (decision 14): a target counts when it appears in the
    term as whole words, after normalizing both. The longest target wins (most
    words, then most letters; on a tie, the first in `target_words`), so
    "البيت الجديد" beats "البيت". The target is returned as written in the
    seed. None means the engine asks "which word?" (engine spec).
    """
    padded = f" {normalize(term)} "  # spaces at both ends make whole-word checks
    best: str | None = None
    best_size = (0, 0)
    for target in target_words:
        needle = normalize(target)
        size = (len(needle.split()), len(needle))
        if needle and f" {needle} " in padded and size > best_size:
            best, best_size = target, size
    return best


def said_nothing(text: str) -> bool:
    """Return True if `text` says nothing once cleaned: empty, spaces or "…".

    A fact about the text, not a judgement: silence does not mean confusion
    (the learner may be thinking, or the transcriber may have missed them).
    The ladder decides what it means, together with silence timing (decision
    11), tone (idea 2c) and transcriber status (decision 14).
    """
    return normalize(text) == ""
