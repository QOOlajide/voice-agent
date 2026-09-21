"use client";

import { useEffect, useRef, useState } from "react";
import { useKalamVoiceSession, type SessionSnapshot } from "@/hooks/useKalamVoiceSession";
import { explainWhy, whySophistication } from "@/lib/pedagogy/why-policy";
import type { LearnerProfile, SessionPlan } from "@/lib/pedagogy/types";
import { ScaffoldOverlay } from "./ScaffoldOverlay";
import { SessionControls } from "./SessionControls";
import { VisualWorld } from "./VisualWorld";
import { WhyOverlay } from "./WhyOverlay";

export type VoiceSessionProps = {
  durationSeconds?: number;
  plan: SessionPlan;
  profile: LearnerProfile;
  onEndSession: (snapshot: SessionSnapshot) => void;
};

export function VoiceSession({
  durationSeconds = 300,
  plan,
  profile,
  onEndSession,
}: VoiceSessionProps) {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const session = useKalamVoiceSession({
    plan,
    profile,
    audioElement,
  });
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    if (!audioElement) return;
    void session.connect();
    return () => session.disconnect();
    // Start once the audio element is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioElement]);

  const why = session.whyOpen
    ? explainWhy(session.lastWhyKey, whySophistication(plan.learner.sessionCount), {
        arabic: session.lastAgentArabic,
      })
    : null;

  const end = () => {
    const snap = sessionRef.current.snapshot();
    sessionRef.current.disconnect();
    onEndSession(snap);
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#15130f] font-sans text-white">
      <audio ref={setAudioElement} className="hidden" />
      <VisualWorld
        visual={session.visual}
        scene={session.scene}
        characters={plan.characters}
        agentSpeaking={session.agentSpeaking}
        encouraging={session.encouraging}
      />

      <ScaffoldOverlay scaffold={session.scaffold} />

      {session.connection === "connecting" ? (
        <p className="absolute left-1/2 top-[18%] z-10 -translate-x-1/2 text-sm font-light tracking-wide text-white/45">
          Stepping in…
        </p>
      ) : null}
      {session.error ? (
        <p className="absolute left-1/2 top-[18%] z-10 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 text-center text-sm font-light text-red-200/80">
          {session.error}
        </p>
      ) : null}

      <SessionControls durationSeconds={durationSeconds} onEndSession={end} />

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex items-end justify-between px-6">
        <button
          type="button"
          onClick={session.openWhy}
          className="pointer-events-auto rounded-full border border-white/15 bg-black/30 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55 transition hover:text-white/85"
        >
          Why?
        </button>
        <button
          type="button"
          onClick={session.hint}
          className="pointer-events-auto rounded-full border border-white/15 bg-black/30 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55 transition hover:text-white/85"
        >
          Hint
        </button>
      </div>

      {session.whyOpen ? <WhyOverlay why={why} onResume={session.closeWhy} /> : null}
    </main>
  );
}
