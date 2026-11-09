# Working on this repo

Talk (repo: voice-agent): a speak-first app where intermediate learners of fuṣḥā
talk with a character (Khālid) in everyday scenes. The Python conversation
engine lives in `engine/`; the Next.js web app is at the root.

- Product overview, in plain English: `docs/overview.md`
- Engine spec (M1): `docs/engine-spec.md`. Decision records that cite
  "`CLAUDE.md` line N" mean this engine spec (it was originally named CLAUDE.md).
- Every decision and why: `docs/decisions/` (one file per decision)
- Full product spec: https://claude.ai/code/artifact/93e586b3-e615-4962-874d-fa3e91258662

## How we work (the owner's working agreement)

The owner is learning to engineer, not vibe code. They steer; Claude supports.

1. **One small step at a time.** Never several steps in one go.
2. **Work part by part, following `docs/architecture.md`:** research (how
   others built it + docs), the owner outlines the approach, then Claude
   implements one small slice at a time. Each slice: show the code, the test
   output and a short explanation of the important lines; the owner approves
   before it is committed. Deep dives only when the owner asks.
3. **Every decision is the owner's** and is made explicit. Claude gives a
   recommendation with a one-line trade-off and a docs link; the owner approves
   or changes it. Record it in
   `docs/decisions/` (Context, Decision, Consequences).
4. **No black boxes.** Paste the exact code or command and its output into the
   message every time. Never just say "tests pass".
5. **Quote the spec word for word** when clarifying, instead of sending the owner
   to look it up.
6. **Short messages, plain words.** Define every new term.
7. **Checkpoints** every few steps: a short question to confirm the owner is not
   lost.
8. **Review card** with every code change: correctness, bad input, determinism,
   performance, security, state/idempotency, testability. Say which apply.
9. Verify claims (run it, check the docs) before stating them; say plainly when
   something could not be verified.
10. **After every major product or code decision**, run the fundamentals
    checklist in `docs/fundamentals-checklist.md`: pick the 3–7 fundamentals
    that applied, and for each give decision → benefit → cost/risk → what would
    change the decision.

## Where we are

- Decisions 1–12 recorded. Architecture and build order: `docs/architecture.md`. `engine/` is a uv library (Python 3.12, Ruff, strict
  pyright, pytest); normalize + 24 test runs.
- Part 1 (normalize) is done: `engine/src/talk_engine/normalize.py` + tests.
- Part 2, slice 1 (stuck-phrase config) is done: `engine/config/engine.config.json`,
  `engine/src/talk_engine/config.py` + tests (decision 12).
- **Next step:** part 3, the matcher. Decide first: fillers around stuck phrases
  ("امم", "يعني", "umm") and whole-sentence match vs search; log each match as an
  event.
- Open:
  - `engine.config.json`, `bookshop.seed.json` and the matcher test cases do not
    exist yet; they will be written from decisions 6–7 and the "After the Dars"
    matcher (https://claude.ai/artifact/3ay25r8EkeJKo4Tkc6hdZ6).
  - Build order: engine skeleton in the terminal first, then a thin voice layer
    (proposed, not yet decided).
  - Who detects "goal reached", and the backstop so a scene always ends.
  - No CI yet.

## Checks (run from `engine/`)

```bash
uv run ruff check . && uv run ruff format --check . && uv run pyright && uv run pytest
```
