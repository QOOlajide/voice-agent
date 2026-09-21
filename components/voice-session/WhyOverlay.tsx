"use client";

import type { WhyExplanation } from "@/lib/pedagogy/types";

type WhyOverlayProps = {
  why: WhyExplanation | null;
  onResume: () => void;
};

export function WhyOverlay({ why, onResume }: WhyOverlayProps) {
  if (!why) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/90 p-6 text-left shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
          What you heard
        </p>
        <p dir="rtl" className="mt-2 text-xl font-medium text-white">
          {why.heardArabic}
        </p>
        <p className="mt-1 font-sans text-sm font-light text-white/55">{why.heardTransliteration}</p>

        <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
          Useful meaning
        </p>
        <p className="mt-2 text-sm font-light leading-relaxed text-white/80">{why.usefulMeaning}</p>

        <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
          Pattern
        </p>
        <p className="mt-2 text-sm font-light leading-relaxed text-white/80">{why.pattern}</p>

        <ul className="mt-4 space-y-2">
          {why.examples.slice(0, 3).map((example) => (
            <li key={example.arabic} className="text-sm font-light text-white/65">
              <span dir="rtl" className="text-white">
                {example.arabic}
              </span>
              <span className="text-white/35"> · </span>
              {example.transliteration}
              <span className="text-white/35"> — </span>
              {example.meaning}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onResume}
          className="mt-6 w-full rounded-full border border-emerald-400/70 px-4 py-2 text-sm font-medium tracking-wide text-white transition-colors hover:bg-emerald-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
        >
          Resume
        </button>
      </div>
    </div>
  );
}
