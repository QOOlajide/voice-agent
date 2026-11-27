# Engineering journal

Talking points for discussing the project: what was built, what went wrong,
how it was caught and what changed. Decisions themselves live in
`docs/decisions/`; this journal is the story around them.

## Tests over time

Test runs (a test with several example rows runs once per row), measured
with `pytest --collect-only` at every commit that changed the tests:

| Date | Commit | Runs | What changed |
|---|---|---|---|
| 2026-10-30 | `c57ee3e` | 1 | engine created; smoke test only |
| 2026-11-04 | `30a01ba` | 24 | normalize (part 1): 15 tests, 23 runs |
| 2026-11-09 | `fd1c3e9` | 45 | stuck-phrase config (part 2): 21 runs |
| 2026-11-11 | `0a527ba` | 49 | matcher start-up half: 4 runs |
| 2026-11-16 | `c5a324d` | 109 | matcher finished: `match()`, resolution, said nothing |
| 2026-11-16 | `0310730` | 109 | two result tests merged into one parametrized test |
| 2026-11-18 | `686e777` | 108 | determinism test removed |
| 2026-11-25 | `22d567d` | 118 | ladder state (part 4, slice 1): 10 runs |
| 2026-11-27 | `4a12a5f` | 124 | ladder state: strict types, non-empty term: 6 runs |

## Tests that were wrong, or caught something

Each entry: what happened → how it was found → what changed → the lesson.

### Normalize (part 1)
- **Unicode failure modes found by testing failure modes.** A separate hamza
  mark (ا + ٔ) and the ligature ﻻ did not normalize like their ordinary
  forms. Found by writing tests for inputs that look the same but are
  stored differently. Fixed by adding Unicode NFKC as step 0 (decision 8).
  Lesson: text that looks identical is not always identical.
- **A test dropped, a test kept.** Of two candidate tests, one was dropped
  as redundant; punctuation-only input becoming "" was kept as crash
  prevention. Lesson: every test needs a failure it guards against.

### Config (part 2)
- **The validator flagged its own patterns.** The check "patterns must be
  in normalized form" rejected the `P` in `(?P<…>` and the `S` in `\S` as
  uppercase English letters; 4 tests failed. Fixed by stripping regex syntax
  before checking letters. Lesson: the tests caught a bug in the checking
  code, not in the data.
- **A missing test, added after the owner questioned the test list.**
  Patterns with stray spaces (double, leading, trailing, tabs) would never
  match normalized text, and nothing checked for them. Added 4 rows.
  Lesson: review the test list itself, not just the code.

### Matcher (part 3)
- **A test exposed a dead config line.** The test "the result names the
  pattern that matched" expected "من فضلك كرر" to be caught by the line
  `من فضلك (اعد|كرر)`. It failed: under search, the line
  `(اعد|كرر)( من فضلك)?` always matches first, so the second line could
  never fire. Removed it (decision 14, item 7). Lesson: write the expected
  answer before running; the assistant's belief was wrong, and only the
  test showed it.
- **A test that passed for the wrong reason.** "مكتبة" was meant to prove
  that "كتاب" is not matched inside a longer word, but "مكتبة" does not
  contain "كتاب" at all. Replaced by "الكتابة", which does. Found by
  re-reading the tests before committing. Lesson: a passing test proves
  nothing until you know why it passes.
- **A "tie" test that was not a tie.** It used "كتاب" (4 letters) against
  "قلم" (3), so length decided, not the tie rule. Replaced by "قلم" and
  "باب", 3 letters each. Lesson: check the test exercises the rule its name
  claims.
- **Break-it checks: proving tests can fail.** Each rule was broken on
  purpose for one run: whole-word check removed → 2 failed; ties to the last
  target → 1 failed; longest-wins removed → 3 failed; old one-word capture →
  4 failed. Punctuation cleaning switched off → 3 of 7 failed, and the 4 that
  passed revealed a second protection: the `\b` word boundary trims trailing
  punctuation. Lesson: a test you have never seen fail is a guess.
- **A row changed because the design changed.** "ما معنى طبعة، يا أستاذ"
  first expected "طبعة"; under capture-everything (decision 14, item 8) the
  matcher keeps "طبعة يا استاذ" raw and resolution picks "طبعة". The row
  still checks what it is for: no comma.
- **Two tests merged.** "Carries what the ladder needs" (Arabic) and
  "labelled English" checked the same behaviour, so they became one
  parametrized test, and the English row gained checks for action and rung.
  Asked whether this breaks testing fundamentals: no, one behaviour per test
  still holds ("DAMP, not DRY").
- **A test removed because it proved nothing.** "Same input twice gives an
  equal result" could not fail: the matcher has no state and no randomness.
  Removed; to revisit if the matcher gains state.
- **Test rows labelled by evidence.** For `said_nothing`, an empty transcript
  is documented for Deepgram; punctuation-only is plausible; spaces, "…" and
  a line break are assumptions, kept as cheap insurance and to be checked
  against real transcripts at the voice step.
- **Known weak spot, kept on purpose.** In "the result names the pattern",
  two rows use input identical to the pattern text, so they cannot tell the
  pattern apart from the learner's words. The owner chose to keep them.

### Ladder (part 4)
- **A pydantic trap found before it bit.** The ladder state is frozen, and
  the pydantic equivalent of `dataclasses.replace` is `model_copy(update=…)`.
  A quick check showed it does not validate: `step_down=5` was accepted
  silently, skipping the `Field(ge=0, le=2)` guard. `model_validate` refused
  it. So the transition function (slice 2) must build each new state with
  `model_validate`, with a test. Lesson: check what a convenience method
  skips before relying on it.
- **`raise ValueError`, not `assert`, for the state's guard.** The guard
  "no term outside a rescue" raises `ValueError`. Checked: pydantic turns
  only `ValueError` (and `AssertionError`) into a `ValidationError`; a
  `TypeError` or `RuntimeError` escapes unconverted. And `python -O` (or
  `PYTHONOPTIMIZE=1`) deletes `assert` statements: a two-line demo ran past
  a false assert. Tests are unaffected: with optimization on, the normalize
  tests still passed (23), and pytest warned that only asserts outside test
  files are ignored, because it rewrites asserts in test files. Lesson:
  `assert` in tests, `raise` in code the program depends on.

- **A probe found silent conversions.** Feeding the ladder state odd inputs
  showed pydantic's default "lax mode" accepted `step=3`, `step="3"`,
  `step_down=True` and `step_down="1"`, quietly converting them, and accepted
  an empty `term=""`. Only our own code builds these states, so a wrong type
  means a bug that should fail loudly. Fix: `strict=True` and
  `min_length=1` on `term`. The 5 new refusal tests failed before the fix
  (no error was raised) and passed after it. A sixth test checked that
  strict mode does not break replay: a state saved as JSON (where `step` is
  the number 3) still loads back exactly, so pydantic's JSON leniency for
  enums holds. Lesson: probe a model with wrong inputs, not only right ones;
  "it accepted it" can be the bug.

### Product decisions that changed the code
- **Silence is not confusion.** `is_hesitation` was renamed `said_nothing`
  and the spec's "empty transcript → rung 2" changed: the learner may be
  thinking, or the transcriber may have missed them. The same for fillers
  ("uhh" is often followed by speech). Decision 14, items 10–11.
- **Multi-word terms.** A learner may ask about "البيت الجديد", not one
  word. An AI suggestion (stop at a list of known fillers) was tested on
  harder inputs and failed on 4 of 7; chosen instead: capture everything,
  then resolve against the seed's target words. Decision 14, items 8–9.
