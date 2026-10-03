# 1. Record decisions

Date: 2026-10-02
Status: Accepted

## Context

Engineering decisions for this project are made explicitly, one at a time, before
code is written. The reasoning behind them is easy to lose once the conversation
that produced it is gone, and it must be explainable later (to reviewers, in
interviews, or to a future contributor).

## Decision

Each significant decision gets a short record in `docs/decisions/`, numbered in
order, using Michael Nygard's format: Context, Decision, Consequences.
Source: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions

A record is never edited to change its meaning. If a decision is reversed, a new
record supersedes it and the old one's status is updated to point to it.

## Consequences

- Every decision has a written "why", including the costs accepted.
- Small overhead per decision.
