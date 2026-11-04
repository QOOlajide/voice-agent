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
