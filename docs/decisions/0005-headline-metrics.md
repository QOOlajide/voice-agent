# 5. Headline product metrics

Date: 2026-10-30
Status: Accepted

## Context

A product is judged on three layers: whether people come back (engagement),
whether the system works well (quality), and whether it achieves its purpose
(here: learning). Comparable products and guides:
- Duolingo's most-watched metric is Current User Retention Rate: the share of
  today's active learners who return the next day.
  (https://www.customerexperiencedive.com/news/duolingos-user-retention-hits-all-time-high-as-app-boosts-stickiness/827499/)
- Voice-agent evaluation treats end-of-turn latency as the primary
  user-perceived metric, reported as percentiles.
  (https://langchain.com/blog/how-to-evaluate-voice-agents-execution-outcomes-and-experience,
  https://hamming.ai/blog/how-to-evaluate-voice-agents)
- Studies of AI conversation tutors mostly rely on learners' self-reports; few
  measure learning objectively.
  (https://arxiv.org/pdf/2508.05156)

The engine's event log records facts, so learning can be measured from what
happened rather than from self-reports.

## Decision

Three headline metrics, one per layer:

1. **Retention (engagement):** share of learners who come back for a second
   scene.
2. **End-of-turn latency (quality):** time from the learner finishing speaking
   to Khālid starting, reported at the 50th and 95th percentile. (The spec's
   alert threshold is a typical response time above 1.5 s.)
3. **Rescues resolved without English (learning):** of all rescues the learner
   triggered, the share resolved at rungs 1–3, before rung 4 introduces English.

A metric for transcription accuracy was considered and left out: it cannot be
measured live without knowing what the learner really said, and it is already
covered before launch by the M0 transcription harness.

## Consequences

- The event log (step 3) must capture what these need: one record per session
  per learner with timestamps (retention); per-turn latency (latency); for each
  rescue, the rung reached and whether it ended resolved or in the fallback
  (rescues).
- Exact definitions (e.g. the time window for "come back") are set when the
  events are designed.
- Rung numbers are internal. Learner-facing screens describe rescues in plain
  language ("worked it out in Arabic, no English needed").
- Latency can only be measured from M2 (voice); retention needs real learners.
  M1 can already compute the rescue metric from typed sessions.
