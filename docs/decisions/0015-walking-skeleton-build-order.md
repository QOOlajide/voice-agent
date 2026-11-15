# 15. Build a walking skeleton: matcher, ladder, then voice

Date: 2026-11-15
Status: Accepted

## Context

`docs/architecture.md` builds all nine engine parts before the voice
pipeline (part 10). The biggest unknowns are in voice, not the engine: end of
turn in Arabic, language mixing, and silence transcribed as invented words.
They cannot be measured until real audio flows. Real Deepgram transcripts are
also needed to replace the guessed stuck-phrase patterns (decision 13,
layer 5). The ladder stays in because rescue is the product question: can
learners learn Arabic through conversation alone?

A walking skeleton is the thinnest version of the whole app working end to
end, grown afterwards.

## Decision

Build order:

1. Finish the matcher (`match()`).
2. Ladder + step-down (part 4).
3. One small seed: a scene, one goal made of steps, starting target words,
   a time limit (decision 16).
4. Voice pipeline (part 10): mic → Smart Turn → Deepgram → engine → Khālid →
   TTS, on one simple page, with a timeout on every provider call.

Then the remaining engine parts: event log, level check + CAMeL adapter,
slips/keyterms/directives, engine API + summary + CLI, CI.

## Consequences

- The owner reaches real conversations, and the voice risks, much sooner.
- Some rework in the voice layer as the engine grows.
- Accepted risk: with no level check yet, nothing keeps Khālid at the
  learner's level in the first voice version.
- Events are printed to the terminal until the event log exists.
- Provider fallbacks follow the spec's reliability table later; the skeleton
  has timeouts only.
