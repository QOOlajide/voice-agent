# Architecture: the whole project on one page

```
┌──────────────────────────── BROWSER (M4) ────────────────────────────┐
│  Screens: onboarding · scene picker · live scene · summary · word bank│
│  Mic in / speaker out          shows client events (cue, hint, end)   │
└───────────────┬──────────────────────────────────▲───────────────────┘
                │ audio (WebRTC)                    │ audio + events
┌───────────────▼──────────── VOICE SERVER (M2, Pipecat) ──────────────┐
│ turn detection → TRANSCRIBER → [ENGINE ①] → KHĀLID (LLM) → [ENGINE ②] → VOICE (TTS)
│                                    │                          │           │
│                              JUDGE (LLM, background) ─────────┘           │
└───────────────┬──────────────────────────────────────────────────────────┘
                │ imports (in-process)
┌───────────────▼──────────────── ENGINE (M1, pure Python) ────────────────┐
│ normalize → matcher → ladder/step-down → directives      ← ① each learner turn
│ check_line (level check + CAMeL adapter)                 ← ② each Khālid line
│ slips · keyterms · event log → summary · config + seeds                  │
└───────────────┬──────────────────────────────────────────────────────────┘
                │
┌───────────────▼────── DATA + OPS (M3, M5) ───────┐
│ Postgres: users, word bank, sessions, EVENTS     │
│ Audio storage · REST API (FastAPI)               │
│ Tracing/metrics (OpenTelemetry → Langfuse)        │
└──────────────────────────────────────────────────┘
```

## Parts, in build order

🔬 = research-heavy · ⌨️ = mostly coding

| # | Part | Type | What to research or read |
|---|---|---|---|
| 1 | normalize | ⌨️ | `re`, `str.translate`, CAMeL Tools character lists |
| 2 | types + config loading | ⌨️ | pydantic docs: Models, validation |
| 3 | matcher | 🔬⌨️ | "After the Dars" matcher; regex; `difflib` |
| 4 | ladder + step-down | ⌨️ | the State design pattern |
| 5 | event log | 🔬 | event sourcing basics; how others log events |
| 6 | level check + CAMeL adapter | 🔬 | CAMeL Tools morphology; the Adapter pattern |
| 7 | slips, keyterms, directives | 🔬⌨️ | prompting LLMs to follow instructions |
| 8 | engine API + summary + CLI | ⌨️ | snapshot testing |
| 9 | CI | ⌨️ | GitHub Actions + uv docs |
| 10 | voice pipeline (M2) | 🔬 | Pipecat custom processors; choosing STT/LLM/TTS |
| 11 | data + API (M3) | 🔬⌨️ | Postgres schema; FastAPI |
| 12 | screens (M4) | 🔬 | Pipecat client / RTVI; UI kit choice |
| 13 | production (M5) | 🔬 | deploy, tracing, alerts |

## The loop for each part

1. **Research:** how others built it, plus the docs for best practice
   (deep for 🔬, light for ⌨️).
2. **The owner outlines the approach**, informed by the research.
3. **Build in small slices:** Claude implements one slice and shows the code,
   the test output and a short explanation of the important lines.
4. **The owner checks and approves** → commit → next slice.
