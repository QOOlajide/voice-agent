"""Tests for the ladder state (decision 17)."""

import pytest
from pydantic import ValidationError

from talk_engine.ladder import LadderState, LadderStep


def test_a_new_state_starts_calm() -> None:
    state = LadderState()
    assert state.step is LadderStep.NOT_RESCUING
    assert state.step_down == 0
    assert state.term is None
    assert state.recent_rescues == ()
    assert (state.successes_in_a_row, state.failures_at_max) == (0, 0)


def test_rungs_are_numbered_in_order() -> None:  # the spec's rungs 1-5
    rungs = [
        LadderStep.CUE,
        LadderStep.REPEAT,
        LadderStep.EXPLAIN,
        LadderStep.ENGLISH_WORD,
        LadderStep.STARTER,
    ]
    assert [int(r) for r in rungs] == [1, 2, 3, 4, 5]
    assert LadderStep.STARTER < LadderStep.FALLBACK < LadderStep.CONCEPT_CHECK


@pytest.mark.parametrize("step_down", [-1, 3])
def test_step_down_outside_0_to_2_is_refused(step_down: int) -> None:
    with pytest.raises(ValidationError, match="step_down"):
        LadderState(step_down=step_down)


@pytest.mark.parametrize("field", ["successes_in_a_row", "failures_at_max"])
def test_negative_counts_are_refused(field: str) -> None:
    with pytest.raises(ValidationError, match=field):
        LadderState.model_validate({field: -1})


def test_a_term_outside_a_rescue_is_refused() -> None:
    with pytest.raises(ValidationError, match="only kept during a rescue"):
        LadderState(term="طبعة")


def test_a_term_during_a_rescue_is_kept() -> None:
    state = LadderState(step=LadderStep.EXPLAIN, term="طبعة")
    assert state.term == "طبعة"


def test_unknown_field_is_refused() -> None:  # a typo like "step_dwon"
    with pytest.raises(ValidationError, match="step_dwon"):
        LadderState.model_validate({"step_dwon": 1})


def test_state_cannot_be_changed_after_creation() -> None:
    state = LadderState()
    with pytest.raises(ValidationError, match="frozen"):
        state.step_down = 2  # type: ignore[misc]


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("step", 3),  # a bare number instead of LadderStep.EXPLAIN
        ("step", "3"),  # text instead of the enum
        ("step_down", True),  # yes/no instead of a level
        ("step_down", "1"),  # text instead of a number
    ],
)
def test_values_of_the_wrong_type_are_refused_not_converted(
    field: str, value: object
) -> None:
    with pytest.raises(ValidationError, match=field):
        LadderState.model_validate({field: value})


def test_an_empty_term_is_refused() -> None:  # lookup can never find ""
    with pytest.raises(ValidationError, match="term"):
        LadderState(step=LadderStep.EXPLAIN, term="")


def test_a_saved_state_loads_back_from_json() -> None:  # replay from the event log
    state = LadderState(
        step=LadderStep.EXPLAIN,
        step_down=1,
        term="طبعة",
        recent_rescues=(False, True),
        successes_in_a_row=0,
        failures_at_max=0,
    )
    assert LadderState.model_validate_json(state.model_dump_json()) == state
