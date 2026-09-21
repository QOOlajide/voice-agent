"use client";

import { useEffect, useMemo, useState } from "react";
import { SessionControls } from "./SessionControls";

export type VoiceSessionProps = {
  durationSeconds?: number;
  onEndSession?: () => void;
};

type Beat = {
  arabic: string;
  english?: string;
  focus?: "yusuf" | "sami" | "learner";
  gesture?: "self" | "learner";
};

const beats: Beat[] = [
  { arabic: "السَّلَامُ عَلَيْكُمْ", english: "Hello.", focus: "yusuf" },
  { arabic: "أَنَا يُوسُف", english: "Me — Yusuf.", focus: "yusuf", gesture: "self" },
  { arabic: "وَأَنْتَ؟", english: "You?", focus: "learner", gesture: "learner" },
  { arabic: "أَنَا…", focus: "learner" },
];

function Person({ name, active, tone }: { name: string; active: boolean; tone: "sand" | "blue" }) {
  const fill = tone === "sand" ? "#d9a56f" : "#7ca6c9";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative transition-all duration-500 ${active ? "scale-105" : "opacity-75"}`}>
        <div className={`absolute -inset-5 rounded-full border transition-all duration-500 ${active ? "border-amber-300/80 shadow-[0_0_45px_rgba(252,211,77,.35)]" : "border-transparent"}`} />
        <svg width="126" height="190" viewBox="0 0 126 190" aria-hidden>
          <circle cx="63" cy="35" r="26" fill={fill} />
          <path d="M30 84c0-24 15-38 33-38s33 14 33 38v57H30z" fill={fill} />
          <path d="M31 91 8 137" stroke={fill} strokeWidth="16" strokeLinecap="round" />
          <path d="m95 91 23 46" stroke={fill} strokeWidth="16" strokeLinecap="round" />
          <path d="m48 138-9 45M78 138l9 45" stroke={fill} strokeWidth="18" strokeLinecap="round" />
        </svg>
      </div>
      <span className={`rounded-full px-4 py-1 text-sm tracking-wide transition ${active ? "bg-white text-stone-900" : "bg-white/10 text-white/70"}`}>{name}</span>
    </div>
  );
}

export function VoiceSession({ durationSeconds = 300, onEndSession }: VoiceSessionProps) {
  const [beat, setBeat] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const current = beats[beat];

  useEffect(() => {
    setShowHint(false);
    const hint = window.setTimeout(() => setShowHint(true), 3600);
    const next = window.setTimeout(() => setBeat((value) => Math.min(value + 1, beats.length - 1)), 7200);
    return () => { window.clearTimeout(hint); window.clearTimeout(next); };
  }, [beat]);

  const status = useMemo(() => beat === beats.length - 1 ? "Your turn" : "Listen", [beat]);

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#15130f] font-sans text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,#3a3226_0%,#201c16_42%,#11100d_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#2b271f]" />
      <div className="absolute left-1/2 top-[56%] h-px w-[76%] -translate-x-1/2 bg-white/10" />

      <section className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-between px-6 pb-24 pt-10">
        <div className="text-center">
          <div className="mb-3 text-[11px] uppercase tracking-[.35em] text-white/35">{status}</div>
          <div dir="rtl" className="min-h-14 text-3xl font-medium text-white/95 sm:text-4xl">{current.arabic}</div>
          <div className={`mt-3 h-6 text-sm text-amber-100/70 transition-opacity duration-500 ${showHint && current.english ? "opacity-100" : "opacity-0"}`}>
            {current.english}
          </div>
        </div>

        <div className="flex w-full max-w-2xl items-end justify-around pb-28">
          <Person name="يوسف" active={current.focus === "yusuf"} tone="sand" />
          <Person name="سامي" active={current.focus === "sami"} tone="blue" />
        </div>

        <button
          type="button"
          aria-label="Speak"
          onClick={() => setBeat((value) => Math.min(value + 1, beats.length - 1))}
          className={`absolute bottom-10 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full border transition-all ${current.focus === "learner" ? "border-amber-300 bg-amber-300 text-stone-950 shadow-[0_0_50px_rgba(252,211,77,.35)]" : "border-white/20 bg-white/10 text-white"}`}
        >
          <span className="text-2xl">●</span>
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[.28em] text-white/30">hold to speak</div>
      </section>

      <SessionControls durationSeconds={durationSeconds} onEndSession={onEndSession} />
    </main>
  );
}
