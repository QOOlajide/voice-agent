# Talk — the whole product on one page

**What it is:** an intermediate learner of fuṣḥā *speaks* with a character (Khālid) in an everyday scene, like a bookshop. The **engine** keeps Khālid at the learner's level and rescues them when they get lost.

Full engine spec: `docs/engine-spec.md` · Decisions: `docs/decisions/`

---

## The 4 actors

| Actor | Job | AI? |
|---|---|---|
| **Transcriber** | Learner's speech → text | Outside AI service |
| **Engine** *(our code)* | Spots "I'm stuck" → picks a rescue → tells Khālid what to do → checks his lines → **writes the diary** | ❌ Plain Python rules |
| **Khālid** | Says the actual sentences | Outside AI |
| **Judge** | Grades each learner answer, in the background | Outside AI (separate from Khālid) |

The engine **never hears or speaks**: text in, decisions out. That's why it can be built and tested by *typing*.

---

## One turn

1. Learner speaks → **transcriber** → text.
2. **Engine (job 1):** is this a stuck phrase? → which rescue rung? → writes a **directive** for Khālid.
3. **Khālid** writes a sentence following the directive.
4. **Engine (job 2), the level check:** ≥95% known words? no English (except rung 4)? vowel marks present?
   Fail → Khālid rewrites it (max 2 tries).
5. Voice speaks it → learner hears it. Only what was actually played counts as "heard".
6. **Judge** (in the background) grades the learner's answer.
7. Every decision goes into the **diary** (event log).

---

## Stuck phrases → where rescue starts

| Learner says | Engine does |
|---|---|
| *lam afham* (I didn't understand) | rung 1 |
| *aʿid min faḍlik* (repeat, please), or "uhh…", or silence | rung 2 |
| *mā maʿnā X?* (what does X mean?) | rung 3, on X only |
| *fahimtu … lākin lam afham X* | rung 3, on X only |
| *mā taʿnī bi-dhālik?* (what do you mean by that?) | rung 3, on Khālid's last phrase |
| *hal taqṣidu X?* (do you mean X?) | Khālid confirms or corrects |
| *lam afham* again, mid-rescue | next rung |

Recognised in **Arabic script and English** (decision 6). Help is **never** withheld for not saying the "right" phrase.

**The missed term** (the term the learner didn't catch): if they name it, it's fuzzy-matched against Khālid's last line; if they don't, the engine works it out by elimination, or asks "أيّ كلمة؟" (decision 7).

## The rescue ladder

1. Gesture or prop (no new words) → 2. Same words, slower → 3. Simpler Arabic → 4. One English word → 5. "Qul: …" (say: …) → **fallback:** short English explanation.

Stops the moment the learner gets it, then **one** check question to prove it landed.

## Step-down

One number, 0–2. A failed rescue makes Khālid easier (yes/no questions); each success eases back to normal.

## Slips

Khālid **re-says the learner's sentence correctly** inside his reply (a recast). No correction screens. A missing case ending on the **last word** isn't a slip.

---

## What the judge steers (one turn late)

The judge runs **in parallel** with Khālid's reply, so its result shapes Khālid's **next** directive: recasts of slips · step-down easing · concept check passed/failed · "communicated but skipped the target".
Stuck phrases and the rescue ladder **don't** need the judge. If the judge fails, those adjustments just don't happen for that turn; the conversation never stops.

## How a scene ends

When the seed's **goal** is reached, Khālid wraps up → `scene_end` → summary.
⚠️ **Open:** who detects "goal reached" (engine rule or judge)? And what's the backstop so it always ends?

## The summary, built ONLY from the diary

| Item | Written by | Always complete? |
|---|---|---|
| Words rescued (+ rung) | Engine | ✅ |
| Unresolved items | Engine | ✅ |
| Words used unprompted | Judge | Usually (missing if the judge failed that turn) |
| Recasts / slips | Judge (+ re-transcription after the scene) | Usually |

---

## Build plan

**M0** test transcribers on your voice · **M1 the engine, text only ← we are here** · **M2** voice · **M3** word bank & onboarding · **M4** real screens · **M5** production.

## Decisions made (`docs/decisions/`)

1. Write every decision down.
2. One repo; engine in `engine/`; web app stays where it is.
3. **uv** (pinned versions, Python 3.12, engine is a library) · **Ruff** (default rules + bugbear + import sort) · **pyright strict** (relaxed only in the CAMeL Tools adapter).
4. Removed the unused LiveKit packages.
5. **Headline metrics:** retention (came back for a 2nd scene) · end-of-turn latency (50th/95th percentile) · rescues resolved without English (rungs 1–3).
6. Stuck phrases in **Arabic script and English** only; no Latin transliteration.
7. **Matcher:** regex patterns with optional parts · an unnamed term is worked out from Khālid's last line · half-heard terms are fuzzy-matched · a "known" word asked about becomes rusty.

## Still open

- Normalization design (next step).
- The config, seed and matcher test-case files.
- Build order: engine skeleton first, then a thin voice layer?
- Who detects "goal reached", and the backstop.
