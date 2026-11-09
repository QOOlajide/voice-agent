# 13. Stuck detection is layered; no AI call before every reply

Date: 2026-11-09
Status: Accepted

## Context

The stuck phrases in `engine.config.json` are regex patterns, and regex only
catches the phrasings someone wrote down. A learner who says "I'm totally lost"
or an unexpected Arabic variant is missed, gets no rescue, and the core feature
fails silently. The English patterns in Arabic letters (decision 12) are
guesses.

The obvious alternative: ask an AI model on every learner turn, "is this
learner stuck, and on what?" It understands any phrasing.

## Decision

**Detect "stuck" in layers, each catching what the previous one misses:**

| Layer | Catches | Cost |
|---|---|---|
| 1. Regex patterns (config) | common phrasings, exactly | instant, deterministic |
| 2. Fuzzy matching (`difflib`, as in decision 7) | near-spellings | instant |
| 3. Silence / hesitation timing (decision 11) | learners who say nothing | instant |
| 4. The judge, in the background | answers that do not communicate | one turn late |
| 5. Learning from real transcripts | new phrasings over time | a periodic review |

**No AI call before every reply.** Rejected because:
1. **Latency.** It would sit between the learner and Khālid on every turn. The
   engine spec wants the matcher to run "in milliseconds", and end-of-turn
   latency is a headline metric (decision 5).
2. **Cost.** One more model call on every turn, for every learner.
3. **Determinism and testing.** The engine must give the same output for the
   same input (engine spec) and be testable without network calls; an AI
   classifier gives neither.
4. **Failure isolation.** If the classifier is slow or down, rescue stops; the
   rule layers keep working, and the judge already supplies semantic
   understanding without blocking the conversation.

**Layer 5 turns the guesses into evidence.** Every turn logs the raw and
normalized transcript (decision 10). When a learner was stuck but no pattern
matched (the judge, or a later stuck phrase, shows it), that phrasing is added
to the config, with a test.

## Consequences

- Some stuck moments are caught one turn late (by the judge) instead of
  immediately. Acceptable: the learner is not left stranded, and the miss is
  logged and fixed.
- Requires the raw-transcript logging and a way to find "missed" turns in the
  logs; built with the event log.
- Revisit if a fast, cheap, local classifier proves more accurate than the
  layers on real transcripts without hurting latency.

## Interview answer

"Why not just ask an LLM whether the learner is stuck? Because it would add a
model call, latency and cost before every single reply, and make the core
rescue logic nondeterministic and untestable offline. Instead I layer cheap,
deterministic checks (regex, fuzzy matching, silence timing) and use the
background judge as a semantic safety net. Misses are logged, and each real
phrasing we missed becomes a new pattern with a test, so the rules improve from
evidence."
