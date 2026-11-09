"""Load and validate engine.config.json (engine spec: Files; decisions 6, 7, 11).

The config is checked once, when it loads: a broken file stops the engine with a
clear error instead of misbehaving mid-conversation.
"""

import re
import unicodedata
from pathlib import Path
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from talk_engine.normalize import normalize

# What the engine does when a stuck phrase matches.
Action = Literal["ladder", "repeat", "rescue_term", "rescue_last_line", "confirm"]

# Regex syntax that contains letters: named-group openers and escapes.
_REGEX_SYNTAX = re.compile(r"\(\?P<\w+>|\\.")

# Actions that need to know which term the learner asked about.
_TERM_ACTIONS = {"rescue_term", "confirm"}


def _check_pattern(pattern: str) -> str:
    """Return `pattern` if it compiles and is written in normalized form."""
    try:
        re.compile(pattern)
    except re.error as err:
        raise ValueError(f"pattern does not compile: {pattern!r} ({err})") from err
    # Learner text is normalized before matching, so patterns must already be in
    # that form (e.g. ا not أ, ي not ى, no vowel marks, lowercase). Regex syntax
    # is removed first so only the literal words are checked: named-group
    # openers like (?P<missed_term> and escapes like \S.
    literal = _REGEX_SYNTAX.sub("", pattern)
    if (
        literal != literal.strip()
        or "  " in literal
        or any(ch.isspace() and ch != " " for ch in literal)
    ):
        raise ValueError(
            f"pattern {pattern!r} has stray spaces: no leading, trailing or double "
            "spaces, and no tabs or newlines (normalized text never has them)"
        )
    for ch in literal:
        if ch.isalpha() or unicodedata.category(ch).startswith("M"):
            if normalize(ch) != ch:
                raise ValueError(
                    f"pattern {pattern!r} is not in normalized form: "
                    f"{ch!r} (U+{ord(ch):04X}) would become {normalize(ch)!r}"
                )
    return pattern


class StuckPhrase(BaseModel):
    """One phrase a learner says when stuck, and what the engine does about it."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    id: str = Field(min_length=1)
    action: Action
    entry_rung: int | None = Field(default=None, ge=1, le=5)
    patterns_ar: tuple[str, ...] = Field(min_length=1)
    # English, in English letters and in Arabic letters (decision 6; the
    # transcriber may write English speech either way).
    patterns_en: tuple[str, ...] = ()

    @field_validator("patterns_ar", "patterns_en")
    @classmethod
    def _patterns_are_valid(cls, patterns: tuple[str, ...]) -> tuple[str, ...]:
        return tuple(_check_pattern(p) for p in patterns)

    @model_validator(mode="after")
    def _action_matches_fields(self) -> Self:
        if self.action == "confirm" and self.entry_rung is not None:
            raise ValueError(f"{self.id}: 'confirm' does not start a rescue rung")
        if self.action != "confirm" and self.entry_rung is None:
            raise ValueError(f"{self.id}: '{self.action}' needs an entry_rung")
        if self.action in _TERM_ACTIONS:
            for p in (*self.patterns_ar, *self.patterns_en):
                if "(?P<missed_term>" not in p:
                    raise ValueError(
                        f"{self.id}: every pattern needs a (?P<missed_term>...) group"
                    )
        return self


class EngineConfig(BaseModel):
    """The whole engine config. Stuck phrases are matched in this order."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    version: str = Field(min_length=1)
    stuck_phrases: tuple[StuckPhrase, ...] = Field(min_length=1)

    @model_validator(mode="after")
    def _ids_are_unique(self) -> Self:
        ids = [p.id for p in self.stuck_phrases]
        duplicates = sorted({i for i in ids if ids.count(i) > 1})
        if duplicates:
            raise ValueError(f"duplicate stuck phrase ids: {duplicates}")
        return self


def load_config(path: Path) -> EngineConfig:
    """Read and validate the config at `path`. Raises ValueError naming the file."""
    try:
        return EngineConfig.model_validate_json(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as err:
        raise ValueError(f"invalid engine config {path}:\n{err}") from err
