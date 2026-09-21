"use client";

import type { Scaffold } from "@/lib/pedagogy/types";

/**
 * Live help is performed by the character.
 * The overlay only echoes a response starter when that rung is active —
 * never a translation card, never constant English.
 */
export function ScaffoldOverlay({ scaffold }: { scaffold: Scaffold | null }) {
  if (!scaffold?.required) return null;
  const starter =
    scaffold.types.includes("response-starter") &&
    (scaffold.responseStarter || scaffold.responseFrame);
  if (!starter) return null;

  return (
    <div className="pointer-events-none absolute bottom-36 left-1/2 z-10 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 text-center">
      <p dir="rtl" className="text-2xl font-medium tracking-wide text-white/85">
        {scaffold.responseStarter || scaffold.responseFrame}
      </p>
    </div>
  );
}
