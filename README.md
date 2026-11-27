# KalamAI

KalamAI is an adaptive Arabic conversational voice agent designed to help learners develop spoken fluency through immersive, low-stakes conversations and progressively tailored assistance when they struggle.

## Motivation

Studying Arabic and conversing in Arabic are two distinct challenges. Learners may accumulate substantial vocabulary and grammatical knowledge through formal study, yet struggle to recall and apply that knowledge during spontaneous conversations.

KalamAI stems from my own experience as an Arabic learner: having acquired vocabulary through formal study but lacking consistent access to a conversation partner with whom to reinforce it.

While existing conversational AI applications provide valuable opportunities for language practice, my experience highlighted a need for more consistent proficiency-aware interactions and structured assistance when learners struggle.

KalamAI explores an approach that combines natural, unscripted dialogue with programmatically controlled difficulty and progressive assistance. The objective is to maintain immersion while adapting the conversation to the learner, rather than expecting the learner to adapt to the conversation.

The goal is not to replace traditional Arabic studies or human interaction, but to complement them through accessible, low-stakes conversational practice.

## Immersive Conversational Practice

KalamAI aims to recreate the contextual and visual cues naturally available during real-world conversations. Scenes are designed to evolve as the conversation progresses, rather than serve as static backgrounds.

For example, if a learner encounters the unfamiliar word كِتَاب during a conversation in a bookstore, Khālid could hold up a book to communicate its meaning without resorting to translation. If the learner continues to struggle, the adaptive conversation engine progressively adjusts the assistance provided.

Visual changes can support both ordinary conversation and rescue ladder assistance. The current specification favors pre-generated, faceless, human-reviewed visual assets, while the implementation of dynamic scene progression and synchronization with speech remains under investigation.

See [Scene visuals and research](docs/ideas.md) and [Scene design decisions](docs/decisions/0016-scenes-goals-target-words.md).

## Current Development Status

KalamAI is under active development.

**Implemented:**
- A voice-first session interface.
- Arabic text normalization.
- Configurable, deterministic detection of expressions of confusion.
- Scene-specific vocabulary resolution.
- Validated rescue ladder state models.

**Under development:**
- Immersive conversational environments incorporating interactive props, faceless visual representations, and scene-specific contextual cues.
- Rescue ladder transitions and progressive assistance.
- Dynamic conversational difficulty adjustment.
- Learner-specific proficiency checking.
- Real-time voice pipeline integration.

**Available now:** [Voice-first interface demo](https://main.d2wqpxfz1qlk4j.amplifyapp.com/). The demo showcases the session interface only; immersive scene interactions, adaptive assistance, and the integrated real-time voice pipeline are not yet available. The adaptive conversation engine is being developed and tested independently.

## Architecture

**Target architecture (not fully implemented):**

```text
BROWSER ──audio──► VOICE SERVER (Pipecat)
                       Transcriber
                            │
                            ▼
                       ENGINE ①
             Normalize → Matcher → Ladder → Directive
                            │
                            ▼
                       Khālid (LLM)
                            │
                            ▼
                       ENGINE ②
                    Proficiency check
                            │
                            ▼
                      Text-to-speech
                            │
BROWSER ◄──────audio────────┘
```

The planned scene interface also responds to contextual assistance from the rescue ladder and to ordinary conversational progression. The specification defines prop cue events for rescue assistance; the mechanism for ordinary visual progression is still under investigation.

KalamAI is designed around the separation of natural dialogue generation from programmatic control of conversational difficulty and assistance.

Rather than delegating all conversational decisions to a large language model, the architecture introduces two complementary engines:

- **Adaptive conversation engine:** Processes learner utterances, detects expressions of confusion, determines appropriate assistance, and adjusts conversational difficulty.
- **Proficiency-checking engine:** Evaluates generated dialogue against the learner's proficiency before it is delivered as speech.

This separation is intended to preserve the flexibility of LLM-generated conversations while making key assistance and difficulty-control decisions more predictable, testable, and independently maintainable.

The engines are designed to operate independently of the real-time voice infrastructure, allowing their core logic to be tested without requiring live audio connections or LLM calls.

See [Architecture](docs/architecture.md) for the complete system design.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS
- TypeScript

## Getting Started

Clone the repository:

```bash
git clone https://github.com/QOOlajide/voice-agent.git
cd voice-agent
```

### Run the frontend

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and grant microphone access when prompted.

### Set up the Python engine

Requires Python 3.12 or later and uv.

Install uv by following the [official installation instructions](https://docs.astral.sh/uv/getting-started/installation/). On macOS with Homebrew:

```bash
brew install uv
```

Verify the installation:

```bash
uv --version
```

From the repository root:

```bash
cd engine
uv sync --locked
```

### Run the engine tests

From the `engine/` directory:

```bash
uv run pytest
```

The frontend and Python engine currently operate independently. Running both does not establish a complete real-time conversational session.

## Testing and Engineering Practices

KalamAI's conversation engine is designed to be independently testable without requiring live audio connections or external LLM services.

Development emphasizes:

- **Deterministic behavior:** Predictable and reproducible assistance decisions.
- **Failure-oriented testing:** Deliberately introducing defects to verify that tests detect incorrect behavior.
- **Input and state validation:** Pydantic models prevent invalid configurations and rescue ladder states.
- **Static analysis:** Pyright in strict mode and Ruff for linting and formatting.
- **Reproducible environments:** Dependency management through uv and a version-controlled lockfile.
- **Documented engineering decisions:** Architectural decisions, alternatives, trade-offs, and lessons learned are recorded throughout development.

See the [Engineering Journal](docs/journal.md) and [Architecture Decision Records](docs/decisions/) for detailed examples and rationale.

## Repo

[https://github.com/QOOlajide/voice-agent](https://github.com/QOOlajide/voice-agent)
