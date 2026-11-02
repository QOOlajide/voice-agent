# 8. Normalization: our own code, CAMeL Tools' character lists as reference

Date: 2026-11-02
Status: Accepted

## Context

Before matching stuck phrases, the learner's text is cleaned so the many forms
of one sentence become one (engine spec, Normalization): "drop punctuation incl.
؟ ،; Arabic: strip harakat/tanwīn/tatwīl, unify أ إ آ ٱ → ا, ى → ي; collapse
spaces" (the Latin rules are dropped by decision 6).

CAMeL Tools already provides these as functions. Reading their source shows each
is a one-line `re.sub` or `str.replace`:
- `normalize_alef_ar`: `[إأٱآ]` (إ أ ٱ آ) → `ا` (ا)
- `normalize_alef_maksura_ar`: `ى` (ى) → `ي` (ي)
- `dediac_ar`: deletes every character in `AR_DIAC_CHARSET` =
  `ً`–`ْ` (tanwīn and harakat) and `ٰ` (dagger alef)
(https://github.com/CAMeL-Lab/camel_tools, `camel_tools/utils/normalize.py`,
`dediac.py`, `charsets.py`; MIT licence)

Options:
- **Use CAMeL Tools' functions:** expert-maintained, but installs CAMeL Tools and
  its large dependencies (torch, transformers) now, for three one-liners.
- **Write our own from scratch:** small and dependency-free, but we must find
  every character ourselves and may miss some.
- **Write our own, using CAMeL Tools' character lists as the reference.**

## Decision

Write our own normalization with Python's `re` and `str` (no new dependency),
using CAMeL Tools' character sets as the reference, credited in the code.

- Tatwīl (`ـ`) is added ourselves: the spec requires stripping it, and
  `AR_DIAC_CHARSET` does not include it.
- Teh marbuta is **not** normalized (ة stays ة). Transcriber variants such as
  طبعه vs طبعة are left to fuzzy matching (decision 7).

## Consequences

- No large dependency until the level check needs CAMeL Tools' morphology
  (step 5).
- We own the character lists; tests must cover each character class.
- If CAMeL Tools updates its lists, ours do not change automatically.
