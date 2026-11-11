"""Tests for the stuck-phrase matcher, start-up half (decision 14).

The tests for match() come with match() itself.
"""

from pathlib import Path

from talk_engine.config import load_config
from talk_engine.matcher import StuckMatcher

CONFIG_PATH = Path(__file__).parent.parent / "config" / "engine.config.json"
# _patterns is private; these tests read it on purpose, to check start-up.
PATTERNS = StuckMatcher(load_config(CONFIG_PATH))._patterns  # pyright: ignore[reportPrivateUsage]


def test_every_config_pattern_is_compiled() -> None:
    assert len(PATTERNS) == 18


def test_order_is_config_order_with_arabic_before_english() -> None:
    order = [(phrase.id, language) for phrase, language, _, _ in PATTERNS]
    assert order[:3] == [
        ("understood_but_not", "ar"),
        ("understood_but_not", "en"),
        ("what_do_you_mean", "ar"),
    ]
    assert order[-1] == ("didnt_understand", "en")


def test_each_pattern_is_kept_as_written_and_compiled_as_whole_words() -> None:
    _, _, pattern, compiled = next(e for e in PATTERNS if e[2] == "لم افهم")
    assert pattern == "لم افهم"  # as written in the config, for the event log
    assert compiled.pattern == r"\b(?:لم افهم)\b"


def test_patterns_cannot_be_changed_after_start_up() -> None:
    assert isinstance(PATTERNS, tuple)
