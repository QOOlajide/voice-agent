# 11. Hesitation is detected from timing, not punctuation

Date: 2026-11-04
Status: Accepted. Changes the engine spec's stuck-phrase table, which listed
"…" as a hesitation signal.

## Context

The engine spec lists hesitation as: "uhh", "hmm", "…", empty transcript →
rung 2. Whether a transcriber writes "…" for a pause is undocumented and varies
by provider; transcribers are known instead to invent text on silence (e.g.
Whisper producing "Thank you" from silent audio:
https://www.news.cornell.edu/stories/2024/06/ai-speech-text-can-hallucinate-violent-language).

## Decision

1. Hesitation is detected by **timing**: the silence timer / voice activity
   detection in turn-taking (Smart Turn, spec decision 14), not by punctuation
   characters in the transcript.
2. Normalization keeps a **crash-prevention** guarantee only: text that is only
   punctuation or noise (e.g. "…", "؟؟") normalizes to "" without error.

## Consequences

- "…" is no longer a hesitation signal in the matcher.
- Text fillers ("uhh", "hmm") and the empty transcript are decided when the
  matcher and turn-taking are built.
- Silence turned into invented words ("شكراً") is a separate risk, handled by
  voice-activity gating and tested in M0.
