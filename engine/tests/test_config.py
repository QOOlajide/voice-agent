"""Tests for loading and validating engine.config.json."""

import json
from pathlib import Path
from typing import Any

import pytest
from pydantic import ValidationError

from talk_engine.config import EngineConfig, StuckPhrase, load_config

CONFIG_PATH = Path(__file__).parent.parent / "config" / "engine.config.json"


def _phrase(**overrides: Any) -> dict[str, Any]:
    """A valid stuck phrase, with any fields replaced by `overrides`."""
    base: dict[str, Any] = {
        "id": "didnt_understand",
        "action": "ladder",
        "entry_rung": 1,
        "patterns_ar": ["لم افهم"],
    }
    return base | overrides


# --- the real config file ---------------------------------------------------


def test_shipped_config_loads() -> None:
    config = load_config(CONFIG_PATH)
    assert config.version
    assert len(config.stuck_phrases) == 6


def test_specific_phrases_come_before_general_ones() -> None:
    # "فهمت … لكن لم افهم" contains "لم افهم", so it must be checked first.
    ids = [p.id for p in load_config(CONFIG_PATH).stuck_phrases]
    assert ids.index("understood_but_not") < ids.index("didnt_understand")


# --- what a broken config must be refused for -------------------------------


def test_unknown_field_is_refused() -> None:  # a typo like "entry_rugn"
    with pytest.raises(ValidationError, match="entry_rugn"):
        StuckPhrase.model_validate(_phrase(entry_rugn=1))


def test_pattern_that_does_not_compile_is_refused() -> None:
    with pytest.raises(ValidationError, match="does not compile"):
        StuckPhrase.model_validate(_phrase(patterns_ar=["لم (افهم"]))


@pytest.mark.parametrize("pattern", ["لم أفهم", "ما معنى", "لَم افهم", "I don t"])
def test_pattern_not_in_normalized_form_is_refused(pattern: str) -> None:
    with pytest.raises(ValidationError, match="not in normalized form"):
        StuckPhrase.model_validate(_phrase(patterns_ar=[pattern]))


@pytest.mark.parametrize("pattern", ["لم  افهم", " لم افهم", "لم افهم ", "لم\tافهم"])
def test_pattern_with_stray_spaces_is_refused(pattern: str) -> None:
    with pytest.raises(ValidationError, match="stray spaces"):
        StuckPhrase.model_validate(_phrase(patterns_ar=[pattern]))


def test_term_action_needs_a_missed_term_group() -> None:
    with pytest.raises(ValidationError, match="missed_term"):
        StuckPhrase.model_validate(
            _phrase(action="rescue_term", entry_rung=3, patterns_ar=["ما معني"])
        )


def test_rescue_needs_an_entry_rung() -> None:
    with pytest.raises(ValidationError, match="needs an entry_rung"):
        StuckPhrase.model_validate(_phrase(entry_rung=None))


def test_confirm_must_not_have_an_entry_rung() -> None:
    with pytest.raises(ValidationError, match="does not start a rescue rung"):
        StuckPhrase.model_validate(
            _phrase(action="confirm", patterns_ar=[r"هل تقصد (?P<missed_term>.+)"])
        )


def test_rung_outside_1_to_5_is_refused() -> None:
    with pytest.raises(ValidationError):
        StuckPhrase.model_validate(_phrase(entry_rung=6))


def test_phrase_without_arabic_patterns_is_refused() -> None:
    with pytest.raises(ValidationError):
        StuckPhrase.model_validate(_phrase(patterns_ar=[]))


def test_duplicate_ids_are_refused() -> None:
    with pytest.raises(ValidationError, match="duplicate"):
        EngineConfig.model_validate(
            {"version": "1", "stuck_phrases": [_phrase(), _phrase()]}
        )


# --- loading behaviour --------------------------------------------------------


def test_config_cannot_be_changed_after_loading() -> None:
    config = load_config(CONFIG_PATH)
    with pytest.raises(ValidationError, match="frozen"):
        config.version = "hacked"  # type: ignore[misc]


def test_load_error_names_the_file(tmp_path: Path) -> None:
    bad = tmp_path / "engine.config.json"
    bad.write_text(json.dumps({"version": "1", "stuck_phrases": []}))
    with pytest.raises(ValueError, match="invalid engine config .*engine.config.json"):
        load_config(bad)


def test_missing_file_gives_a_clear_error(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="invalid engine config"):
        load_config(tmp_path / "nope.json")
