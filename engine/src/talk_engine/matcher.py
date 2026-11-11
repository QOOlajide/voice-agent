"""Recognize stuck phrases in what the learner said (decisions 7, 13, 14).

The matcher only recognizes; deciding what happens next is the ladder's job.
"""

import re
from typing import Literal

from pydantic import BaseModel, ConfigDict

from talk_engine.config import Action, EngineConfig, StuckPhrase

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
        found: list[tuple[StuckPhrase, Language, str, re.Pattern[str]]] = []
        for phrase in config.stuck_phrases:
            # Exactly two: Arabic, then English. A new language changes this type.
            by_language: tuple[LanguagePatterns, LanguagePatterns] = (
                ("ar", phrase.patterns_ar),  # Arabic first (decision 14)
                ("en", phrase.patterns_en),
            )
            for language, patterns in by_language:
                for pattern in patterns:
                    compiled = re.compile(rf"\b(?:{pattern})\b")
                    found.append((phrase, language, pattern, compiled))
        # A tuple, not a list: once built, no code can add, remove or reorder
        # patterns. One matcher is shared by every conversation.
        self._patterns = tuple(found)
