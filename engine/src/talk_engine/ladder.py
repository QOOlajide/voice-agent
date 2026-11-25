"""The rescue ladder's state (decision 17; engine spec: The rescue ladder, Step-down).

This slice holds only the state. How it changes, `transition(state, event)`,
comes next.
"""

from enum import IntEnum
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator


class LadderStep(IntEnum):
    """Where the ladder is. Each has a name and a number; rungs 1-5 are in order."""

    NOT_RESCUING = 0
    CUE = 1  # rung 1: gesture or prop, no new words, no English
    REPEAT = 2  # rung 2: same words, slower, in chunks
    EXPLAIN = 3  # rung 3: known words, ideally with a prop
    ENGLISH_WORD = 4  # rung 4: English for the key word only (at most 3 words)
    STARTER = 5  # rung 5: response starter, "Qul: ..."
    FALLBACK = 6  # brief full explanation in English
    CONCEPT_CHECK = 7  # one question proving the meaning landed


class LadderState(BaseModel):
    """Everything the ladder remembers between learner turns. Frozen: each turn
    makes a new state, so the old one stays intact for the event log."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    step: LadderStep = LadderStep.NOT_RESCUING
    step_down: int = Field(default=0, ge=0, le=2)  # 0 normal, 2 easiest
    term: str | None = None  # the word being rescued, if the learner named one
    recent_rescues: tuple[bool, ...] = ()  # recent turns: was each one a rescue?
    successes_in_a_row: int = Field(default=0, ge=0)
    failures_at_max: int = Field(default=0, ge=0)  # failed rescues in a row at 2

    @model_validator(mode="after")
    def _no_term_outside_a_rescue(self) -> Self:
        if self.step is LadderStep.NOT_RESCUING and self.term is not None:
            raise ValueError("a term is only kept during a rescue")
        return self
