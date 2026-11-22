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
7. **Last resort, in order:** at step-down 2, after 3 failed rescues in a
   row, shrink the goal to its required steps (decision 16); end the scene
   gently only if that fails too. The time limit stays the backstop.
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

Open (outline next): the full list of events; the transitions; whether the
rung order lives in `engine.config.json` (the spec's "ladder rules", and how
OATutor and CTAT store hint sequences) or in code; the "لم أفهم" four times in
a row gap (hint gaming).

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
