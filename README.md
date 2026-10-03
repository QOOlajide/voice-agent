# Kalam AI

Voice-only Arabic practice. Speak now, review later.

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
