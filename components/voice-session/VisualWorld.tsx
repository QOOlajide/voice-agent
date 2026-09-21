"use client";

import type { Character, SceneState, VisualContext } from "@/lib/pedagogy/types";

const ATMOSPHERE: Record<string, string> = {
  gathering: "from-[#3a3226] via-[#201c16] to-[#11100d]",
  egypt: "from-amber-900/50 via-stone-950 to-[#11100d]",
  saudi: "from-emerald-950/50 via-stone-950 to-[#11100d]",
  nigeria: "from-green-900/40 via-stone-950 to-[#11100d]",
  football: "from-green-900/50 via-emerald-950 to-[#11100d]",
  reading: "from-orange-950/40 via-neutral-950 to-[#11100d]",
  "coffee-large": "from-amber-800/40 via-stone-950 to-[#11100d]",
  "coffee-small": "from-stone-800/40 via-neutral-950 to-[#11100d]",
  brother: "from-sky-950/40 via-slate-950 to-[#11100d]",
  morning: "from-yellow-900/25 via-orange-950/40 to-[#11100d]",
};

function Person({
  character,
  active,
  speaking,
  pulsing,
  gesture,
  lookAtLearner,
  proximity,
}: {
  character: Character;
  active: boolean;
  speaking: boolean;
  pulsing: boolean;
  gesture: SceneState["gesture"];
  lookAtLearner: boolean;
  proximity: "absent" | "far" | "near";
}) {
  if (proximity === "absent") return null;
  const fill = character.tone === "sand" ? "#d9a56f" : "#7ca6c9";
  const far = proximity === "far";
  const g = gesture?.kind ?? "none";
  const pointingHere =
    (g === "point-other" && gesture?.target === character.id) ||
    (g === "point-self" && gesture?.target === character.id);

  return (
    <div
      className={`flex flex-col items-center gap-3 transition-all duration-700 ${
        far ? "translate-y-6 scale-90 opacity-55" : "translate-y-0 scale-100 opacity-100"
      } ${lookAtLearner ? "translate-y-2" : ""}`}
    >
      <div
        className={`relative transition-all duration-500 ${active ? "scale-105" : "opacity-80"} ${
          speaking ? "animate-speak-breathe" : ""
        }`}
      >
        <div
          className={`absolute -inset-5 rounded-full border transition-all duration-500 ${
            active || speaking
              ? "border-amber-300/80 shadow-[0_0_45px_rgba(252,211,77,.35)]"
              : "border-transparent"
          }`}
        />
        <svg
          width="126"
          height="190"
          viewBox="0 0 126 190"
          aria-hidden
          className={`origin-top transition-transform duration-500 ${
            g === "nod" ? "animate-nod" : ""
          } ${lookAtLearner ? "rotate-[3deg]" : ""}`}
        >
          <circle cx="63" cy="35" r="26" fill={fill} />
          <path d="M30 84c0-24 15-38 33-38s33 14 33 38v57H30z" fill={fill} />
          <path
            d={g === "wave" && active ? "M31 91 4 48" : "M31 91 8 137"}
            stroke={fill}
            strokeWidth="16"
            strokeLinecap="round"
            className={g === "wave" && active ? "animate-wave-arm" : ""}
          />
          <path
            d={
              g === "point-self" && active
                ? "m95 91 4 28"
                : g === "point-learner" && active
                  ? "m95 91 38 64"
                  : pointingHere
                    ? "m95 91 42 8"
                    : "m95 91 23 46"
            }
            stroke={fill}
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path d="m48 138-9 45M78 138l9 45" stroke={fill} strokeWidth="18" strokeLinecap="round" />
        </svg>
      </div>
      <span
        className={`rounded-full px-4 py-1 text-sm tracking-wide transition ${
          pulsing
            ? "animate-tag-pulse bg-amber-200 text-stone-900"
            : active
              ? "bg-white text-stone-900"
              : "bg-white/10 text-white/70"
        }`}
      >
        {character.nameArabic}
      </span>
    </div>
  );
}

export function VisualWorld({
  visual,
  scene,
  characters,
  agentSpeaking,
  encouraging,
}: {
  visual: VisualContext | null;
  scene: SceneState;
  characters: Character[];
  agentSpeaking: boolean;
  encouraging?: boolean;
}) {
  const atmosphere = ATMOSPHERE[visual?.id ?? "gathering"] ?? ATMOSPHERE.gathering;
  const yusuf = characters.find((character) => character.id === "yusuf");
  const sami = characters.find((character) => character.id === "sami");
  const placeLabel = visual?.labelArabic;

  return (
    <div className={`absolute inset-0 bg-gradient-to-b ${atmosphere} transition-colors duration-700`}>
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#2b271f]" />
      <div className="absolute left-1/2 top-[56%] h-px w-[76%] -translate-x-1/2 bg-white/10" />

      {placeLabel ? (
        <p
          dir="rtl"
          className="absolute left-1/2 top-[14%] z-[1] -translate-x-1/2 font-sans text-4xl font-light tracking-[0.35em] text-white/15 transition-opacity duration-700 md:text-6xl"
        >
          {placeLabel}
        </p>
      ) : null}

      <div className="absolute inset-x-0 bottom-[22%] flex items-end justify-center gap-16 px-8 md:gap-28">
        {yusuf ? (
          <Person
            character={yusuf}
            active={scene.speaker === "yusuf"}
            speaking={agentSpeaking && scene.speaker === "yusuf"}
            pulsing={scene.pulsing === "yusuf"}
            gesture={scene.speaker === "yusuf" ? scene.gesture : null}
            lookAtLearner={scene.lookAt === "learner" && scene.speaker === "yusuf"}
            proximity={scene.proximity.yusuf}
          />
        ) : null}
        {sami ? (
          <Person
            character={sami}
            active={scene.speaker === "sami"}
            speaking={agentSpeaking && scene.speaker === "sami"}
            pulsing={scene.pulsing === "sami"}
            gesture={scene.speaker === "sami" ? scene.gesture : null}
            lookAtLearner={scene.lookAt === "learner" && scene.speaker === "sami"}
            proximity={scene.proximity.sami}
          />
        ) : null}
      </div>

      <LearnerTag
        name={scene.learnerGivenName}
        pulsing={scene.pulsing === "learner"}
        pointed={
          encouraging ||
          scene.lookAt === "learner" ||
          scene.gesture?.target === "learner"
        }
      />
    </div>
  );
}

function LearnerTag({
  name,
  pulsing,
  pointed,
}: {
  name?: string;
  pulsing: boolean;
  pointed: boolean;
}) {
  return (
    <div className="absolute bottom-[11%] left-1/2 z-10 -translate-x-1/2">
      <span
        className={`block min-w-[5.5rem] rounded-full border px-4 py-1 text-center text-sm tracking-wide transition ${
          pulsing
            ? "animate-tag-pulse border-amber-200 bg-amber-200 text-stone-900"
            : pointed
              ? "border-white/40 bg-white/15 text-white/80"
              : "border-white/10 bg-white/5 text-white/35"
        }`}
      >
        {name || "—"}
      </span>
    </div>
  );
}
