# KalamAI

KalamAI is an adaptive Arabic conversational voice agent designed to help learners develop spoken fluency through immersive, low-stakes conversations and progressively tailored assistance when they struggle.

## Motivation

Studying Arabic and conversing in Arabic are two distinct challenges. Learners may accumulate substantial vocabulary and grammatical knowledge through formal study, yet struggle to recall and apply that knowledge during spontaneous conversations.

KalamAI stems from my own experience as an Arabic learner: having acquired vocabulary through formal study but lacking consistent access to a conversation partner with whom to reinforce it.

While existing conversational AI applications provide valuable opportunities for language practice, my experience highlighted a need for more consistent proficiency-aware interactions and structured assistance when learners struggle.

KalamAI explores an approach that combines natural, unscripted dialogue with programmatically controlled difficulty and progressive assistance. The objective is to maintain immersion while adapting the conversation to the learner, rather than expecting the learner to adapt to the conversation.

The goal is not to replace traditional Arabic studies or human interaction, but to complement them through accessible, low-stakes conversational practice.

**Live demo:** [https://main.d2wqpxfz1qlk4j.amplifyapp.com/](https://main.d2wqpxfz1qlk4j.amplifyapp.com/)

## Current Development Status

KalamAI is under active development.

**Implemented:**
- An immersive, voice-first session interface.
- Arabic text normalization.
- Configurable, deterministic detection of expressions of confusion.
- Scene-specific vocabulary resolution.
- Validated rescue ladder state models.

**Under development:**
- Rescue ladder transitions and progressive assistance.
- Dynamic conversational difficulty adjustment.
- Learner-specific proficiency checking.
- Real-time voice pipeline integration.

The live demo currently showcases the user interface. The adaptive conversation engine is being developed and tested independently.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS
- TypeScript

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The browser will ask for microphone access when a session starts.

## Repo

[https://github.com/QOOlajide/voice-agent](https://github.com/QOOlajide/voice-agent)
