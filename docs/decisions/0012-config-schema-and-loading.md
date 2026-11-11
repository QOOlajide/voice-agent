# 12. Stuck-phrase config: schema, validation and loading

Date: 2026-11-09
Status: Accepted

## Context

The matcher needs a list of stuck phrases and what to do for each. The engine
spec puts them in `config/engine.config.json` and requires: "config and seeds
are validated on load with clear errors" and "add a test that every pattern
compiles". A broken config must stop the engine at startup, not misbehave in
the middle of a conversation.

## Decision

**Schema (`engine/src/talk_engine/config.py`, pydantic models).** Each stuck
phrase has `id` (a label for the event log, not words the learner says),
`action` (`ladder`, `repeat`, `rescue_term`, `rescue_last_line`, `confirm`),
`entry_rung` (1–5; none for `confirm`), `patterns_ar` (at least one) and
`patterns_en` (English in English letters *and* in Arabic letters, because a
transcriber set to Arabic wrote English speech as Arabic letters, e.g.
انترستينج). The file has a `version` and an ordered list of phrases.

**Coding choices and why:**
- `extra="forbid"`: unknown field names (typos such as `entry_rugn`) are
  refused instead of silently ignored.
- `frozen=True` and tuples: the loaded config cannot be changed by accident
  while the engine runs; tuples also keep the match order explicit.
- `Literal` for `action`: only known actions are accepted, and pyright can check
  every place that handles them.
- Validators refuse: patterns that do not compile; patterns not written in
  normalized form (أ, ى, vowel marks, capitals); stray spaces (leading,
  trailing, double, tabs); term actions without a `(?P<missed_term>...)` group;
  rescues without a rung, `confirm` with one; duplicate ids.
- **Refuse, don't clean.** Normalizing a pattern on load would destroy it:
  `normalize("(اعد|كرر)( من فضلك)?")` returns `"اعد كرر من فضلك"`, because regex
  symbols count as punctuation. Refusing keeps the file the single source of
  truth: what you read is exactly what is matched.
- Regex syntax (`(?P<name>`, `\S`) is skipped before checking letters; the
  first version flagged the `P` as an uppercase letter, and the tests caught it.
- `load_config(path)` wraps any error with the file path, so the message says
  which file is broken. (pydantic's `ValidationError` is a `ValueError`.)
- `كلم[ةه]` accepts ة or ه: the playground transcript wrote القيامه for القيامة.

**Test design (`engine/tests/test_config.py`).** A helper `_phrase(...)`
returns one valid phrase and each test overrides only the field it tests (the
"object mother" pattern): one change per test, and one place to update when the
schema grows. Tests go through `model_validate(dict)`, the same path as JSON,
and use `pytest.raises(..., match=...)` so each fails only for the intended
reason. One test loads the real file; one checks specific phrases come before
the general ones they contain.

## Consequences

- The Arabic-letter English spellings (اي دونت اندرستاند, ريبيت, وات دز … مين)
  are guesses; replace them with real ones from M0 transcripts.
- Not handled yet: fillers around stuck phrases ("امم", "يعني", "umm") and
  whether to match the whole sentence or search inside it; decided in the
  matcher (part 3). Proving a phrase was checked is the matcher's event log.
- Slow ("catastrophic") regexes are not checked; acceptable while we write the
  patterns ourselves.

## Interview answer

"The stuck phrases live in a validated config. Pydantic refuses typos, broken
regexes and patterns that could never match normalized text, so a bad config
stops the engine at startup with a message naming the file. I refuse unclean
patterns rather than cleaning them, because normalizing a regex destroys its
syntax. The tests each change one field of a known-good entry, so every failure
points at one cause, and they caught a bug in my own validator."
