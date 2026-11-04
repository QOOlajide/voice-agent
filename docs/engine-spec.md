# Talk — conversation engine (M1)

Talk is a speak-first app where an **intermediate** learner of **fuṣḥā** (Modern Standard Arabic) has unscripted, real-time voice conversations with a character in an everyday scene. This repo starts with the **engine**: the rules that keep the character at the learner's level and rescue the learner when they get lost.

Full product spec (architecture, decisions, sources): https://claude.ai/code/artifact/93e586b3-e615-4962-874d-fa3e91258662

## What the engine is — and isn't

- **Is:** pure Python logic. Text in, decisions out. Deterministic given the same inputs and config.
- **Isn't:** audio, networking, databases, or UI. No provider SDK is imported by the engine package.
- The character's model and the judge sit behind **interfaces** (`DialogueModel`, `Judge`). Tests use fakes; a real adapter can be added in M1 for the CLI only.
- Later (M2), the engine is plugged into a Pipecat pipeline as two processors: one after transcription (classify the learner's turn, choose a directive) and one between the character's model and text-to-speech (check each line before it's spoken). Design the API so that's a thin wrapper.

## Stack

- Python 3.12, `uv` for packaging, `pytest`, `pydantic` v2 for data types.
- **CAMeL Tools** for Arabic morphology (reducing words to base forms for the level check). MIT license.
- Regex: the patterns in `config/engine.config.json` were written for JavaScript and use `(?<word>…)` named groups. Python's `re` needs `(?P<word>…)` — convert on load, or use the `regex` package, which accepts both. Add a test that every pattern compiles.

## Inputs and outputs

```
start_scene(seed, learner_profile, config) -> SceneState
on_learner_turn(state, LearnerTurn) -> TurnDecision
check_line(state, line_text) -> LineCheck          # every sentence the character produces, before TTS
on_line_spoken(state, spoken_text, interrupted) -> None   # only text actually played counts as "heard"
on_judge_result(state, JudgeResult) -> list[Event]
end_scene(state) -> Summary
```

- `LearnerTurn`: `text_understanding` (transcript with keyterms), `text_honest` (transcript without keyterms), `confidence` (0–1), optional word timestamps.
- `TurnDecision`: a `Directive` for the character (kind + plain-language instruction + constraints), `events` (for the log), `client_events` (state pill, prop cue, hint cloud, word-bank update, scene end), and `keyterms` for the next learner turn.
- `LineCheck`: `ok`, `reasons` (e.g. `unknown_words`, `english_outside_rung4`, `missing_vowels`), `known_ratio`, and a `fix_instruction` for regeneration.

## Rules

### Stuck phrases → entry rung
Defined in `config/engine.config.json`, **matched in array order** (specific phrases before the general ones they contain). Matching runs on normalized text (see Normalization).

| Learner says | Engine does |
|---|---|
| lam afham (I didn't understand) | ladder from rung 1 |
| aʿid min faḍlik (repeat, please) | rung 2 |
| hesitation: "uhh", "hmm", "…", empty transcript | rung 2 |
| mā maʿnā X? | rung 3 on word X only |
| fahimtu … lākin lam afham X | rung 3 on word X only |
| mā taʿnī bi-dhālik? | rung 3 on the character's last phrase |
| hal taqṣidu X? | character confirms or corrects |
| lam afham again, mid-ladder | next rung |

- English equivalents are accepted; the character models the Arabic phrase **once** (log `phrase_modelled`).
- If the named word can't be resolved against the seed's target words, the character asks "Ayy kalimah?" (which word?).
- `aʿid` twice in one scene → slower pace for the rest of the scene.
- Phrase tracking per learner: `unseen → modelled → used`. **Passive only.** Help is never gated on saying a phrase (`gateHelpOnPhrase` must stay false).

### The rescue ladder
| Rung | Directive to the character | Constraint |
|---|---|---|
| 1 | Context cue: gesture or prop (emit a `cue` client event with a seed prop id) | no new words, no English |
| 2 | Repeat the same words, slower, in chunks | nothing simplified yet |
| 3 | Explain using known words, ideally with a prop | Arabic only |
| 4 | English for the key word only, then ask again in Arabic | ≤ 3 English words |
| 5 | Response starter: "Qul: …" | Arabic |
| fallback | brief full explanation in English | then step down |

- Stop the moment the learner succeeds.
- After a successful rescue: **one** concept-check question proving the meaning landed. Wrong answer → resume the ladder.
- An answer that communicates but skips the target word gets **no** rescue; the target returns later.

### Step-down
One integer 0–2. Unresolved item (fallback used) → +1 (max 2). Each success → −1 (min 0).
- 2: yes/no questions, known words only, slightly slower.
- 1: either/or or short questions that lead back to the missed word.
- 0: normal.

### Level control (`check_line`)
- Reduce each word to its base form with CAMeL Tools; compare to the learner's word bank.
- Pass if ≥ **95%** of words are known or rusty, no unplanned new words beyond the seed's target words, and no English outside rung 4.
- **Voweled output is required** (audience: students of knowledge). Fail the line if vowel marks are missing beyond a threshold; the fix instruction asks for full tashkeel. (A diacritizer fallback is evaluated later — keep it behind an interface.)
- At most 2 regenerations, then accept the simplest version and log `level_check_gave_up`.

### Slips, recasts and iʿrāb
- A slip worth fixing → the next directive includes a **recast**: the character re-says the learner's sentence correctly inside the reply. Never a correction screen; never shaming.
- **Iʿrāb leniency:** a missing case ending on the **last word of a sentence** is NOT a slip (pausal form, waqf). Other case-ending slips → gentle recast only.
- Near-miss on a scene word (e.g. qādimah vs qadīmah), or the two transcripts disagree on a target word → **gentle echo** first ("Al-qadīmah? Tafaḍḍal."). Same slip again in the scene → slow side-by-side contrast.
- `confidence` below threshold → character asks "Hal taqṣidu …?" instead of guessing.

### Keyterms
Built every turn: seed target words + stuck phrases + content words from the character's last line. Returned in `TurnDecision.keyterms` and logged.

### Scene end
The scene ends when the seed's goal is reached (`goal_reached_when` in the seed). The character wraps up naturally; emit `scene_end`.

### Summary (`end_scene`)
Built **only from the event log**: words rescued (with the rung needed), words used unprompted, recasts, unresolved items (queued to return in later scenes), slips. Word statuses: `new`, `rusty`, `known`, `confirmed`, `used`; words that needed rung 4 or the fallback are flagged to resurface more often.

## Normalization (for matching)
Lowercase; strip Latin diacritics (ṭ→t); drop ʿ ʾ ' ` and hyphens; drop punctuation incl. ؟ ،; Arabic: strip harakat/tanwīn/tatwīl, unify أ إ آ ٱ → ا, ى → ي; collapse spaces. Match keys use the longest match, and the current turn's target words win ties.

## Files
- `config/engine.config.json` — stuck phrases, hesitation patterns, ladder rules. Versioned; every session records the version.
- `seeds/bookshop.seed.json` — the first scene seed. A seed is a frame (setting, character, goal, target words, props), **not a script**.
- `tests/fixtures/matcher_cases.json` — 24 matcher cases, several from a real practice session. Port these first; all must pass.

## Suggested layout
```
src/talk_engine/
  types.py        # pydantic models
  normalize.py    # norm()
  matcher.py      # stuck phrases, hesitation, word resolution
  ladder.py       # rung state machine, step-down, pace
  level.py        # check_line: coverage, English, vowels (CAMeL behind an interface)
  slips.py        # recast / echo / contrast decisions, iʿrāb leniency
  keyterms.py
  directives.py   # builds the instruction text for the character
  summary.py
  engine.py       # the public API above
cli.py            # type as the learner; fake or real character model
tests/
```

## Definition of done (M1)
1. All 24 matcher cases pass; every config pattern compiles.
2. Unit tests for: each entry rung, ladder progression to fallback, stop-on-success, concept check pass/fail, step-down transitions, pace slowdown, phrase states, keyterm building, iʿrāb leniency, echo-then-contrast, scene end.
3. `check_line` tests on fixed sentences: passes known-word lines, fails unknown-heavy lines, fails English outside rung 4, fails unvoweled lines.
4. A CLI where you type as the learner through the bookshop seed and see each directive, check result and event.
5. The summary for a scripted test conversation matches an expected snapshot.

## Engineering bar
Beyond the happy path, always: bad or empty input never crashes the engine; config and seeds are validated on load with clear errors; every decision emits an event (so sessions can be replayed and debugged); versions of config, seed and prompts are recorded; code stays readable for another engineer (types, small modules, docstrings on public functions).
