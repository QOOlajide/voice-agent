# 16. Scenes are scenarios; goals and target words are separate and can vary per user

Date: 2026-11-12
Status: Accepted

## Context

The spec ties one goal and one fixed set of target words to each seed
(decision 4: "Free-flowing conversation with a goal"). The owner's picture of
a scene is a scenario, a "POV" moment ("you just left the mosque, a brother
walks up"), after which the conversation can go anywhere, the way real
conversations after the mosque do.

## Decision

1. **A scene is a scenario**: a setting and an opening moment. The talk may
   drift anywhere inside it; changing the subject is the design, not an edge
   case.
2. **Goals and target words are different things.**
   - Goal: what the learner should accomplish ("buy the book", "catch up with
     the brother").
   - Target words: the new words the scene may teach.
   - Known words (the word bank, from onboarding) are a third thing: they are
     already per user.
3. **Both goals and target words can vary per user.** The same scene can have
   different goals (specific or general).
4. **Where scenes come from:** pre-made scene cards, and later custom scenes
   the user types, from which a seed is generated.
5. **Later, not now:** drift with no seed at all; beginners (spec: "v1 is
   Talk only, for intermediate learners").

### For v1 (approved)

6. **One goal per scene, made of steps.** Each step is required or
   optional. Bookshop example: pick a book (optional), which edition
   (optional), pay at the register (required).
7. **The engine, not the LLM, chooses the steps:** required steps always
   happen (that is "goal reached"); optional steps depend on the learner's
   level; when time runs low, the remaining optional steps are skipped so
   the goal can still be reached.
7a. **Detecting a step: hybrid.** Khālid's model reports a step through a
    tool call (e.g. `step_done("pay")`); the engine records it, keeps the
    state and decides what happens next. This follows the Pipecat Flows
    pattern (the LLM calls a function; in dynamic flows the application
    decides the next node) and dialogue state tracking (a small state updated
    every turn), not a framework. Rejected: an engine rule alone (brittle:
    learners phrase an action many ways) and the judge alone (can be wrong,
    and runs a turn late). The time limit still guarantees an end.
    Sources: https://docs.pipecat.ai/guides/features/pipecat-flows ,
    https://arxiv.org/pdf/2207.14627
8. **The scene ends** when the goal is reached or the time limit runs out;
   Khālid wraps up.
9. **Target words per learner** = the seed's words minus those the learner
   already knows. A stronger learner gets fewer new words but more steps to
   practise in.
10. **Level comes from both:** the onboarding assessment (level, books
    studied, vocabulary check) determines the starting level, so a learner
    cannot simply claim one; how they actually speak in scenes refines it.
    The spec does not yet update the level from speech.

## Consequences

- The level check rule "no unplanned new words beyond the seed's target
  words" must use the learner's target words, not only the seed's.
- Open: how target words adapt when the learner struggles or the talk drifts;
  hidden goals from last time (needs the word bank, M3); generating custom
  scenes safely; how fast a goal is reached depends on the learner's level.
