"use client";

import { useEffect, useRef, useState } from "react";

type SessionControlsProps = {
  durationSeconds?: number;
  onEndSession?: () => void;
};

function formatTime(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (clamped % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function SessionControls({
  durationSeconds = 300,
  onEndSession,
}: SessionControlsProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const onEndSessionRef = useRef(onEndSession);
  onEndSessionRef.current = onEndSession;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remaining === 0) {
      onEndSessionRef.current?.();
    }
  }, [remaining]);

  return (
    <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
      <time
        dateTime={`PT${remaining}S`}
        className="font-sans text-sm font-light tabular-nums tracking-[0.28em] text-white/70"
      >
        {formatTime(remaining)}
      </time>
      <button
        type="button"
        onClick={onEndSession}
        className="rounded-full border border-red-500/50 bg-red-950/50 px-5 py-2 font-sans text-xs font-medium tracking-[0.18em] text-red-100 shadow-[0_0_22px_rgba(220,38,38,0.55)] transition-colors hover:bg-red-900/55 hover:shadow-[0_0_28px_rgba(239,68,68,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
      >
        End Session
      </button>
    </div>
  );
}
