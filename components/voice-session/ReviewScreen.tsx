"use client";

import { useState } from "react";
import type { ReviewCard, ReviewRating, SessionSummaryLine } from "@/lib/pedagogy/types";

type ReviewScreenProps = {
  summary: SessionSummaryLine[];
  cards: ReviewCard[];
  onRate: (cardId: string, rating: ReviewRating) => void;
  onDone: () => void;
};

const RATINGS: { id: ReviewRating; label: string }[] = [
  { id: "again", label: "Again" },
  { id: "hard", label: "Hard" },
  { id: "good", label: "Good" },
  { id: "easy", label: "Easy" },
];

export function ReviewScreen({ summary, cards, onRate, onDone }: ReviewScreenProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = cards[index];
  const done = cards.length === 0 || index >= cards.length;

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 font-sans text-white">
        <p className="text-sm font-light tracking-wide text-white/60">Saved for next time.</p>
        <button
          type="button"
          onClick={onDone}
          className="mt-8 rounded-full border border-emerald-400/70 px-6 py-2 text-sm tracking-wide hover:bg-emerald-950/40"
        >
          Return
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black px-6 py-10 font-sans text-white">
      <div className="mx-auto w-full max-w-lg">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
          Today you
        </p>
        <ul className="mt-3 space-y-2">
          {summary.map((line) => (
            <li key={line.id} className="text-sm font-light leading-relaxed text-white/70">
              {line.text}
            </li>
          ))}
        </ul>
        {summary.length === 0 ? (
          <p className="mt-3 text-sm font-light text-white/50">
            You showed up. Next time, stay in the conversation a little longer.
          </p>
        ) : null}

        <div className="mt-10 rounded-2xl border border-white/10 bg-zinc-950/70 p-6">
          <p className="text-[11px] tracking-[0.2em] text-white/35">
            {index + 1} / {cards.length}
          </p>
          <p className="mt-4 text-2xl font-light tracking-wide text-white">{card.transliteration}</p>
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-8 rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 hover:text-white"
            >
              Reveal
            </button>
          ) : (
            <div className="mt-6 space-y-3 text-sm font-light">
              <p dir="rtl" className="text-xl text-white">
                {card.arabic}
              </p>
              <p className="text-white/70">{card.meaning}</p>
              {card.pattern ? <p className="text-white/45">{card.pattern}</p> : null}
              <div className="flex flex-wrap gap-2 pt-4">
                {RATINGS.map((rating) => (
                  <button
                    key={rating.id}
                    type="button"
                    onClick={() => {
                      onRate(card.id, rating.id);
                      setRevealed(false);
                      setIndex((current) => current + 1);
                    }}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs tracking-wide text-white/75 hover:border-emerald-400/50 hover:text-white"
                  >
                    {rating.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
