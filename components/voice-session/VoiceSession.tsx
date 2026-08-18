"use client";

import { Orb } from "./Orb";
import { SessionControls } from "./SessionControls";

export type VoiceSessionProps = {
  durationSeconds?: number;
  onEndSession?: () => void;
};

export function VoiceSession({
  durationSeconds = 300,
  onEndSession,
}: VoiceSessionProps) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black font-sans text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.92)_100%)]" />

      <div className="flex h-full w-full items-center justify-center">
        <Orb />
      </div>

      <SessionControls durationSeconds={durationSeconds} onEndSession={onEndSession} />
    </div>
  );
}
