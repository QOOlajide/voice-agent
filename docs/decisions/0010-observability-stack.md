# 10. Observability: four signals, lean tools

Date: 2026-11-03
Status: Accepted

## Context

Talk's hardest failures are not crashes but slow or wrong model calls: a slow
reply from Khālid, a line rejected twice by the level check, a judge reply in
the wrong shape. Generic web observability (errors, CPU, uptime) does not show
which prompt, which response, how many tokens, or which stage was slow.

The bot runs on EC2 (decision 9), which makes CloudWatch logs and a
self-run Prometheus + Grafana natural choices. The product spec (decision 22)
chose OpenTelemetry tracing from Pipecat into Langfuse.

A generic recommendation listed six tools (Sentry, CloudWatch, Prometheus/
Grafana, X-Ray, Better Stack, PostHog); for one developer that is too many to
set up and maintain at once.

## Decision

Separate four signals, each with one tool:

| Signal | Question it answers | Tool | When |
|---|---|---|---|
| Product events | what happened for the learner? | the engine's event log (Postgres) | M1 |
| Logs | what did the code do? | structured JSON logs → CloudWatch | M1 habit; CloudWatch from M2 |
| Metrics + alerts | how is it doing over time? | Prometheus + Grafana (per-stage latency, rescue usage, health check) | M2 |
| Per-turn LLM detail | what exactly happened in this turn? | OpenTelemetry → Langfuse (prompt, reply, tokens, timings) | M2 |
| Errors | what crashed, and where? | Sentry (frontend + backend) | M2/M4 |

Langfuse and Prometheus overlap but answer different questions: Prometheus gives
numbers over time ("95th-percentile LLM latency is 1.4 s"); Langfuse shows one
turn in detail. Both are kept.

Not adopted for now: AWS X-Ray (OpenTelemetry + Langfuse covers tracing), uptime
services (a Grafana alert on the health check covers v1), PostHog session replay
(recording learners needs explicit consent).

## Consequences

- More services to run on one instance (Prometheus, Grafana, possibly a
  self-hosted Langfuse); their resource use must be checked, or Langfuse Cloud
  used instead.
- Vendor prices change often; check each tool's current pricing when adopting it.
- Traces contain learner transcripts, so they follow the same retention period
  as audio (product spec, Observability: "Privacy in traces").
