# 6. Stuck phrases: Arabic script and English, no Latin transliteration

Date: 2026-10-31
Status: Accepted

## Context

The engine recognises stuck phrases ("aʿid min faḍlik", "lam afham", ...) in the
text the transcriber produces. The engine never hears audio; typing only stands
in for the transcriber during development.

Two sources describe the phrases: `CLAUDE.md`'s rules table (one canonical form
per phrase) and the stage-1 JavaScript matcher in the "After the Dars" page,
which also accepts Latin transliterations people type (`aid`, `a3id`, `fadlak`).

A transcriber set to Arabic is expected to output Arabic script, not Latin
transliteration. Learners who struggle are likely to fall back to their own
language.

## Decision

The stuck-phrase list covers:
1. **Arabic script**, including the spelling variants transcribers produce
   (with or without hamza and vowel marks, handled by normalization);
2. **English** equivalents (`CLAUDE.md`: "English equivalents are accepted").

**Latin transliteration is not supported.** It is how people type Arabic, not
what a transcriber outputs. Typed tests use Arabic script.

Scope: English is the only fallback language for now. Learners without English
as a fallback are out of scope for v1.

## Consequences

- Differs from `CLAUDE.md`, whose normalization includes Latin rules ("strip
  Latin diacritics (ṭ→t); drop ʿ ʾ"). Those rules are not needed while Latin
  input is unsupported.
- Unknown until M0: whether the chosen transcriber, set to Arabic, writes English
  speech in Arabic letters (e.g. ريبيت بليز). The phrase list lives in config,
  so variants found in M0 can be added without code changes.
