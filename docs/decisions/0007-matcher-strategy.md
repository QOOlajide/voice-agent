# 7. Matcher: patterns with optional parts; resolving an unnamed word

Date: 2026-10-31
Status: Accepted

## Context

Learners rarely say stuck phrases in a tidy, fixed form. For "what does X mean?"
they may say ما معنى كلمة X؟, ما معنى الكلمة؟, ما معنى X, or stop after ما معنى
because they did not catch the word at all.

Options considered:
- **Patterns with optional parts** (regular expressions): fast, predictable,
  testable; variants must be anticipated, but they live in config and can be
  added as real transcripts arrive.
- **Keywords anywhere**: catches almost everything but gives false alarms, since
  negation matters (فهمت "I understood" vs لم أفهم "I didn't understand").
- **Ask an AI whether the learner is stuck**: understands any wording, but adds a
  model call before Khālid can reply, costs money and is not deterministic. The
  spec requires the matcher to run "in milliseconds".

## Decision

1. Stuck phrases are matched with **regular-expression patterns with optional
   parts** (e.g. ما معنى, then optionally كلمة / الكلمة, then optionally the word),
   checked in order, specific phrases before the general ones they contain.
2. When a "what does X mean?" phrase names **no word**, the engine resolves it
   from the words in Khālid's last line that the learner does not know (from the
   level check), instead of always asking:

   | Unknown words in Khālid's last line | Engine does |
   |---|---|
   | exactly 1 | rescue that word |
   | several, exactly 1 of them a scene target word | rescue the target word |
   | several, with 0 or 2+ target words | ask "Ayy kalimah?" (which word?) |
   | 0 | ask "Ayy kalimah?" (the word bank may be wrong) |

   This extends `CLAUDE.md`, which only says to ask "Ayy kalimah?" when the
   named word cannot be resolved.

## Consequences

- The matcher stays fast and deterministic; every pattern gets a test.
- Phrasings we did not anticipate are missed until added to config. M0 recordings
  and the first users' transcripts are the source for new variants.
- Rescuing an unnamed word depends on the word bank being accurate; when it is
  not, the fallback is to ask.
