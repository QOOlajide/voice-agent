# 17. The rescue ladder: a frozen state, a pure transition, help that eases off gradually

Date: 2026-11-22
Status: Accepted (states, counts and rules); events and transitions to be outlined next

## Context

The engine spec defines a five-rung rescue ladder plus an English fallback,
"Stop the moment the learner succeeds", one concept check after a successful
rescue, and step-down: "One integer 0–2. Unresolved item (fallback used) → +1
(max 2). Each success → −1 (min 0)." The spec does not say why step-down
exists, why 0–2, or what happens when a learner keeps failing at the easiest
level.

Research (part 4):
- **Contingent tutoring** (Wood et al. 1978; Wood & Wood 1999): raise help
  after a failure, lower it after a success. The ladder is the first half,
  step-down the second. A replication reportedly found no benefit (described
  in a blog post by Carl Hendrick; not verified).
- **Intelligent tutoring systems** (CTAT/Cognitive Tutors, OATutor,
  ASSISTments): hints run general → specific and end in a bottom-out hint
  that gives the answer (our fallback); hint sequences are stored as ordered
  data in content files, not code; Cognitive Tutors give a hint unasked on
  "a student's 3rd error in a subgoal" (AUTOHELP). Risk: hint gaming,
  rushing through hints to reach the answer.
- **Dynamic difficulty adjustment** (games): change difficulty "with
  moderation" to avoid the "rubber band" effect.
- **Wheel-spinning** (Beck & Gong 2013): learners who keep practising without
  progress need a different intervention, not more of the same.
- **One owner of the state** (IntelliCode, arXiv 2512.18669): a single writer
  validates state changes; matches the hybrid in decision 16.

## Decision

1. **States** (`IntEnum`, so each has a name and a number in order):
   not rescuing, rungs 1–5 (cue, repeat, explain, English word, starter),
   fallback, concept check. The concept check is a state because the same
   event means something different there: a right answer ends the rescue, a
   wrong one resumes the ladder (spec).
2. **Names and numbers.** Numbers keep the sequence; names leave room to test
   a different sequence for some learners later.
3. **Step-down runs alongside the ladder**, not as a ladder state: it lasts
   across rescues.
4. **The ladder remembers counts, not events:** rescues in the last 5 turns,
   successes in a row, failed rescues in a row at step-down 2, and the term
   being rescued.
5. **Step-down goes up (+1)** when a rescue fails (fallback used) **and** when
   there are 3 rescues within the last 5 turns, even if each succeeded: a
   learner struggling with many terms is failing repeatedly.
6. **Step-down goes down (−1) after 2 successes in a row**, not after every
   success, to avoid the rubber-band effect (one lucky answer snapping
   Khālid back to normal). Trade-off: help stays slightly longer than the
   original contingent rule.
7. **Last resort, in order:** at step-down 2, the **first** failed rescue
   shrinks the goal to its required steps (decision 16); one more failed
   rescue after that ends the scene gently. The time limit stays the
   backstop. Changed from "3 failed rescues in a row at step-down 2": the
   owner worked out that this meant 5 failed rescues in all (two to reach
   step-down 2, then three more), each up to 6 rungs long, far too slow
   for a learner already at yes/no questions. The "3" was borrowed loosely
   from Beck & Gong's mastery threshold (three correct in a row), which is
   about learning a skill, not about failures. Counts live in
   `failures_at_max` (1 → shrink, 2 → end); the thresholds go in the
   config.
   Rejected: stepping out of the scene to practise the word (it would feel
   like more teaching).
8. **"Not trying" vs struggling** cannot be told apart from words alone; the
   default is to treat it as struggling. Tone and vocal cues (idea 2c) may
   help later.
9. **A pure transition function**, `transition(state, event) → new state`,
   instead of objects that change themselves (the classic State pattern):
   no setup to test, the answer depends only on its inputs, and every turn
   leaves the old state intact for the event log and replay.
10. **The state is a frozen pydantic model**, not a frozen dataclass. Both
    freeze; pydantic checks values on creation with one line per rule
    (`Field(ge=0, le=2)` for step-down; a dataclass needs a hand-written
    `__post_init__`), gives JSON for the event log (`model_dump_json()`), and
    matches the rest of the engine. No new dependency: pydantic is already
    used (decision 12).
11. **No state-machine library** (python-statemachine, pytransitions): a new
    dependency for about 8 states, where one small function is clearer.

12. **A "success" is any turn that communicates**, normal answers included,
    not only a rescue that succeeded: step-down is about the difficulty of
    the whole conversation, and coping with normal turns is the best sign
    the learner is ready for more.
13. **Engine ② gets stricter with step-down.** The spec's level check allows
    95% known words, but step-down 2 promises "known words only". The level
    check will use the current step-down level to tighten (for example,
    100% known at level 2); exact thresholds to tune, in the config.

14. **The state is strict, and its term is never empty.** `strict=True`:
    values of the wrong type (`True` or `"1"` for step-down, `"3"` for the
    step) are refused instead of converted, because only our code builds
    states and a wrong type is a bug. Loading from JSON (replay) still works.
    `term` has `min_length=1`: a real word or `None`, never `""`.
    The state's guards raise `ValueError`. pydantic converts only
    `ValueError` (and `AssertionError`) into a `ValidationError`; other
    exceptions escape unconverted. `assert` is not used for guards because
    `python -O` / `PYTHONOPTIMIZE=1` deletes it. New states are built with
    `model_validate`, because `model_copy(update=…)` skips validation.
15. **Named `LadderStep`, not `Step`**, because "step" already means a goal
    step (decision 16).

16. **What "communicates" means** (the judge's field, undefined in the spec;
    it decides the ladder's "answered" vs "still stuck"). From the
    learner's side: **the learner got their meaning across: what they said
    makes clear what they wanted to say, in reply to what Khālid asked or
    said.** It does not require correct grammar, the target word or good
    pronunciation (slips, "on target" and recasts cover those). An answer
    that communicates but skips the target word counts as answered (spec:
    "gets no rescue; the target returns later"). The judge can only judge
    it from the words said. First labelled examples, Khālid having asked
    "أيّ طبعة تريد؟":

    | Learner says | Communicates? |
    |---|---|
    | الطبعة الثانية | yes |
    | الثاني (a slip, no target word) | yes |
    | أريد… هذا (pointing at a book) | yes |
    | أريد كتاب (does not answer which edition) | no |
    | طبعة… لا أعرف… كتاب (no clear meaning) | no |

    These start the hand-labelled set the judge must agree with (spec:
    agreement ≥ 85%).

17. **The ladder's events** (inputs to `transition`, one per learner turn),
    each a small frozen, strict pydantic model; `LadderEvent` is their union:
    - `LearnerStuck(entry_rung, term)`: the matcher found a stuck phrase
      (also "لم أفهم" again mid-ladder). Translated once from the matcher's
      `StuckMatch`, so the ladder does not depend on who noticed (later the
      judge or silence timing can raise it too).
    - `LearnerAnswered(used_english, english_parts)`: the learner got their
      meaning across (item 16).
    - `LearnerStillStuck`: an answer during a rescue that did not
      communicate; only the judge can say this, so it is unused until then.
    - `SaidNothing`: `said_nothing()` is True; changes no state for now
      (decision 14).
    The same events apply in every state; the state decides what they mean.
    They live in `ladder.py`, next to their only user (Fowler: a domain
    event captures "things that can trigger a change to the state").
18. **English answers are a field, not a new event.** All English ("the
    second one") or a mix ("أريد the second edition") is still
    `LearnerAnswered`, with `used_english=True` and the English parts. The
    turn moves on normally: Khālid models the Arabic once (for a mix, gives
    the Arabic for the English part, recast-style, noted for review). It
    counts as neither a success nor a failure for step-down. Rejected: a
    separate event with a substate that waits for the Arabic, because the
    spec says phrase tracking is "Passive only. Help is never gated on
    saying a phrase". Research: learners switch languages for missing
    words, emotion and identity (Park et al. 2025, arXiv 2512.23136).
    To verify at the voice step: how `used_english` is detected (in Arabic
    mode Deepgram wrote English in Arabic letters; whether `multi` reports a
    language per word is unverified).

Open (outline next): the full list of events; the transitions; whether the
rung order lives in `engine.config.json` (the spec's "ladder rules", and how
OATutor and CTAT store hint sequences) or in code; the "لم أفهم" four times in
a row gap (hint gaming).
Also open: the ladder keeps **one** term at a time (spec: "rung 3 on word X
only"; anything else unresolved "returns later"). If a learner is stuck on
two separate words at once, should the state hold a list of terms instead?

## Consequences

- Fundamentals touched (rule 10):
  - **State design pattern / state machines** → clear states and events →
    one more concept to learn → a much larger ladder would justify a library.
  - **Immutability** → every turn's state is kept for logging and replay → a
    new object per turn (negligible) → none expected.
  - **KISS / YAGNI** → one function, no library → we write the transition
    logic ourselves → many more states or features like diagrams.
  - **Testing** → table-driven tests (state, event → expected state) →
    the table must cover every state → none expected.
  - **Validation** → impossible values refused at creation → pydantic's small
    overhead per object (measured earlier at about 0.24 µs more than a
    dataclass) → none expected.
- All thresholds (3 in 5 turns, 2 in a row, 3 failures) are starting guesses
  to tune, and belong in the config.
