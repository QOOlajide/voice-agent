# Ideas backlog

Ideas worth keeping, not yet decided. Each moves to `docs/decisions/` when chosen.

## 1. Insights after a conversation (from Talkpal)
Talkpal does real-time conversations but gives no insights or record of what the
learner said, and it was unclear how to end a call. Already covered by the spec:
the post-scene summary and word bank, and an "End scene" button on the live
scene. The live scene stays text-free on purpose ("scaffolding is spoken, not
shown"). Talk's differentiator: difficulty that adapts (rescue ladder,
step-down).

## 2. Scene visuals as contextual clues (under discussion)
Scenes are a core part of the pitch: images that also act as clues. Spec: images
generated once per seed and stored, faceless, human-reviewed; the `cue` event
shows a prop over the scene (rescue rung 1). Options raised: AI-generated images,
or Unsplash photos that change as the conversation progresses (many contain
faces, so filtering is needed); highlighting the important part of the scene.

## 3. Facial cues for "stuck" detection (parked)
Faces carry real signals, but software reading a face without context is
unreliable (a squint can mean confusion, concentration, glare or needing
glasses). Also: the spec is voice-only and faceless; the EU AI Act restricts
emotion recognition in education settings (Article 5). Revisit only with:
opt-in camera and clear consent; processing on the device; used as a hint
combined with voice signals (hesitation, stuck phrases), never alone; and a test
showing it catches stuck moments that voice misses.

### 2a. "Live" scenes: the vision and the research to do (parked)
Vision: the scene feels live; when the learner is stuck on "book", Khālid's
hands hold the book up. Faceless hands fit the spec. Two ways to build it:
generated during the conversation (unique, but seconds of delay and no face
check) or prepared once per prop and played instantly on the `cue` event (the
spec's choice: "nothing is generated during a conversation").

Research before deciding (M2 spike / M4):
- **Praktika:** the closest product; streams audio so the avatar's mouth matches
  the speech. Note the spec chose faceless partly to avoid uncanny lip-sync.
- **Talkpal:** its call mode lets you just call and talk freely.
- Audio-to-visual latency; cost of generating images; how others generate
  faceless images reliably; faceless asset sources (e.g. CGTrader).

### 2b. Focus on what the learner can do; the teacher lets small gaps go (parked)
Turning every mistake into a learning moment, even a discreet one, can feel
overwhelming, and the learner already gets feedback in the summary. Idea:
Khālid focuses on what the learner does understand. When the learner doesn't
understand something that is not pivotal, Khālid, the teacher, says
"لا بأس إن شاء الله" and carries on; he only works on the gap when it blocks
the goal (decision 16: goals made of steps). Only the teacher can truly judge
whether a gap is pivotal for the conversation.

Fits the spec's direction ("Help escalates only as far as needed";
"explicit contrast only on repeated slips"). To decide later: how Khālid's
judgement fits with the engine's control (e.g. he reports "gap not pivotal"
the way he reports a step, and the engine records it, like the hybrid in
decision 16).

### 2c. Tone and vocal cues (open question, raise during the voice part)
The cascaded pipeline (speech → text → LLM → text → speech) drops the
learner's tone: Khālid sees words, not whether the learner is joking,
frustrated, unsure or confident. That is the trade made so the engine can
check Khālid's line before the learner hears it (speech-to-speech models
hear tone directly; see OpenAI "Hello GPT-4o" and the Moshi paper,
arXiv 2410.00037).

Directions to research, not decided:
1. **Tone classifier (owner's priority):** a model listening to the same
   audio, outputting a label ("unsure", "laughing"…) that the engine passes
   to Khālid in the directive. "Unsure" vs "confident" matters most for a
   tutor: it should change how much the ladder helps.
2. **Timing signals:** pauses, restarts, slow speech, from word timestamps.
3. **Expressive voice for Khālid:** TTS that can sound encouraging or laugh.
4. **Speech-to-speech:** already in the spec's "Later" list.

Claude: bring this up whenever the work touches the voice pipeline, the
ladder's inputs or the directive.
