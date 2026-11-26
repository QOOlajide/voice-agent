# KalamAI

KalamAI is an adaptive Arabic conversational voice agent designed to help learners develop spoken fluency through immersive, low-stakes conversations and progressively tailored assistance when they struggle.

## Motivation

Studying Arabic and conversing in Arabic are two distinct challenges. Learners may accumulate substantial vocabulary and grammatical knowledge through formal study, yet struggle to recall and apply that knowledge during spontaneous conversations.

KalamAI stems from my own experience as an Arabic learner: having acquired vocabulary through formal study but lacking consistent access to a conversation partner with whom to reinforce it.

While existing conversational AI applications provide valuable opportunities for language practice, my experience highlighted a need for more consistent proficiency-aware interactions and structured assistance when learners struggle.

KalamAI explores an approach that combines natural, unscripted dialogue with programmatically controlled difficulty and progressive assistance. The objective is to maintain immersion while adapting the conversation to the learner, rather than expecting the learner to adapt to the conversation.

The goal is not to replace traditional Arabic studies or human interaction, but to complement them through accessible, low-stakes conversational practice.

**Live demo:** [https://main.d2wqpxfz1qlk4j.amplifyapp.com/](https://main.d2wqpxfz1qlk4j.amplifyapp.com/)

The UI walks through a sensory-isolated session: welcome, a timed immersive arena, then a completed screen. There are no subtitles during the call. Transcript and grammar review are the intended next step and are not built yet. The app currently uses the browser microphone API only; the audio connection is not built yet.

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
