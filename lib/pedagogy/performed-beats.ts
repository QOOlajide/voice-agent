import type { CharacterId, GestureKind, RescueRung } from "./types";

/**
 * Exposure: give evidence. No production. No rescue.
 * Participation: natural opportunity after evidence. Rescue only if blocked.
 */
export type BeatKind = "exposure" | "participation" | "acknowledge" | "open";

export type PerformedBeat = {
  id: string;
  kind: BeatKind;
  speaker: CharacterId;
  say: string;
  language: "ar" | "en";
  lookAt?: CharacterId;
  gesture?: GestureKind;
  pulse?: CharacterId;
  enter?: CharacterId;
  /** Environment / place highlight (Egypt, Nigeria, …). */
  visualId?: string;
  modelItems?: string[];
  /** Pause after speech before auto-advancing (exposure) or waiting (participation). */
  holdMs?: number;
  /** Participation only. */
  goal?: ParticipationGoal;
  rescue?: RescueStep[];
  /** Warm recast after sufficient communication. `{name}` / `{place}` filled. */
  recastFull?: string;
  recastPartial?: string;
};

export type ParticipationGoal = "identify-self" | "give-origin";

export type RescueStep = {
  rung: RescueRung;
  /** May be multiple sequential lines performed as one rescue. */
  lines: Array<{
    say: string;
    language: "ar" | "en";
    speaker?: CharacterId;
    lookAt?: CharacterId;
    gesture?: GestureKind;
    pulse?: CharacterId;
    visualId?: string;
    holdMs?: number;
  }>;
  /** Silence after the participation ask before this rung fires. */
  afterSilenceMs: number;
};

export function exactSpeechInstruction(
  speaker: CharacterId,
  say: string,
  language: "ar" | "en",
) {
  const who = speaker === "sami" ? "Sami" : "Yusuf";
  if (language === "en") {
    return `You are ${who}. Say EXACTLY this English and nothing else. Soft. No Arabic. No explanation. No tools.\n\n${say}`;
  }
  return `You are ${who}. Say EXACTLY this Arabic and nothing else. Warm, natural. No English. No explanation. No tools.\n\n${say}`;
}

export function openConversationInstruction(opts: {
  learnerName?: string;
  learnerOrigin?: string;
  pendingStructures: string[];
  initialCalibration?: "unknown" | "minimal" | "basic" | "beyond-basic";
}) {
  const name = opts.learnerName ? ` Learner name: ${opts.learnerName}.` : "";
  const origin = opts.learnerOrigin ? ` They are from ${opts.learnerOrigin}.` : "";
  const calibration = opts.initialCalibration ?? "unknown";
  const calibrationInstruction = calibration === "beyond-basic"
    ? " The learner spontaneously demonstrated Arabic beyond the beginner probe. Increase conversational complexity immediately, but one step at a time. Keep observing every response and move complexity up or down based on demonstrated comprehension and production; do not force beginner beats they have already surpassed."
    : calibration === "basic"
      ? " The learner handled the initial probe in basic Arabic. Continue near that level, probe gently upward, and adjust complexity after every response."
      : " The learner has not yet demonstrated language beyond the simple probe. Keep the conversation comprehensible and increase complexity only as their responses provide evidence.";
  const pending = opts.pendingStructures.length
    ? ` Create natural social reasons to reuse (do not drill): ${opts.pendingStructures.join(", ")}.`
    : "";
  return `OPEN MODE. You are Yusuf with Sami in a small gathering.${name}${origin}${calibrationInstruction}
Continue a real Arabic conversation until the session ends. Known + a little new. Demonstrate with your life before asking.
STRICT TURN RULE: make exactly ONE conversational move, normally one short sentence or one short question (maximum two short sentences only when needed for comprehensibility), then STOP speaking and wait for the learner. Never answer your own question. Never continue into a monologue. Never produce several conversational turns in one response.
After each learner response, use that response as evidence: acknowledge it naturally, adjust the next move's complexity up or down, make one next conversational move, then STOP and wait again.
Rescue ONLY after a fair participation opportunity and only if they are blocked: (1) contextual re-model with gesture (2) clearer repetition (3) Arabic narrowing (4) tiny English one-job clue then Arabic (5) response starter.
Never quiz. Never "repeat after me". Never end the conversation yourself.${pending}
Speak Arabic.`;
}

/**
 * First session: meet Yusuf → identity evidence → participation → origin evidence → participation → reinforce → open.
 * Rescue sits only inside participation waits.
 */
export function firstSessionBeats(): PerformedBeat[] {
  return [
    // ——— Exposure: greeting (no production, no rescue) ———
    {
      id: "greet",
      kind: "exposure",
      speaker: "yusuf",
      say: "السَّلَامُ عَلَيْكُمْ",
      language: "ar",
      lookAt: "learner",
      gesture: "wave",
      pulse: "yusuf",
      modelItems: ["as_salamu"],
      holdMs: 2800,
    },

    // ——— Exposure: identity evidence ———
    {
      id: "self-1",
      kind: "exposure",
      speaker: "yusuf",
      say: "أَنَا يُوسُف",
      language: "ar",
      lookAt: "learner",
      gesture: "point-self",
      pulse: "yusuf",
      modelItems: ["ana"],
      holdMs: 2000,
    },
    {
      id: "other-1",
      kind: "exposure",
      speaker: "yusuf",
      say: "هُوَ سَامِي",
      language: "ar",
      lookAt: "sami",
      gesture: "point-other",
      pulse: "sami",
      modelItems: ["huwa"],
      holdMs: 2000,
    },
    {
      id: "self-2",
      kind: "exposure",
      speaker: "yusuf",
      say: "أَنَا يُوسُف",
      language: "ar",
      gesture: "point-self",
      pulse: "yusuf",
      modelItems: ["ana"],
      holdMs: 1800,
    },

    // ——— Participation: identity (rescue available) ———
    {
      id: "ask-you",
      kind: "participation",
      speaker: "yusuf",
      say: "وَأَنْتَ؟",
      language: "ar",
      lookAt: "learner",
      gesture: "point-learner",
      pulse: "learner",
      goal: "identify-self",
      holdMs: 600,
      recastFull: "آه، {name}! أَهْلًا يَا {name}.",
      recastPartial: "آه، {name}! أَهْلًا يَا {name}.",
      rescue: [
        {
          rung: "contextual-cue",
          afterSilenceMs: 4500,
          lines: [
            {
              say: "أَنَا يُوسُف",
              language: "ar",
              gesture: "point-self",
              pulse: "yusuf",
              holdMs: 900,
            },
            {
              say: "وَأَنْتَ؟",
              language: "ar",
              lookAt: "learner",
              gesture: "point-learner",
              pulse: "learner",
            },
          ],
        },
        {
          rung: "contextual-cue",
          afterSilenceMs: 10000,
          lines: [
            {
              say: "أَنَا يُوسُف… وَأَنْتَ؟",
              language: "ar",
              lookAt: "learner",
              gesture: "point-learner",
              pulse: "yusuf",
            },
          ],
        },
        {
          rung: "arabic-narrowing",
          afterSilenceMs: 15500,
          lines: [
            {
              say: "أَنَا يُوسُف… أَنْتَ…؟",
              language: "ar",
              lookAt: "learner",
              gesture: "point-learner",
              pulse: "learner",
            },
          ],
        },
        {
          rung: "tiny-clue",
          afterSilenceMs: 21000,
          lines: [
            { say: "You?", language: "en", lookAt: "learner", holdMs: 700 },
            {
              say: "وَأَنْتَ؟",
              language: "ar",
              lookAt: "learner",
              gesture: "point-learner",
            },
          ],
        },
        {
          rung: "response-starter",
          afterSilenceMs: 26500,
          lines: [
            {
              say: "أَنَا…",
              language: "ar",
              lookAt: "learner",
              gesture: "point-learner",
            },
          ],
        },
      ],
    },

    // ——— Exposure: origin (no production, no rescue) ———
    {
      id: "origin-self-1",
      kind: "exposure",
      speaker: "yusuf",
      say: "أَنَا مِنْ مِصْرَ",
      language: "ar",
      gesture: "point-self",
      pulse: "yusuf",
      visualId: "egypt",
      modelItems: ["ana_min"],
      holdMs: 2200,
    },
    {
      id: "origin-other",
      kind: "exposure",
      speaker: "yusuf",
      say: "سَامِي مِنَ السُّعُودِيَّةِ",
      language: "ar",
      lookAt: "sami",
      gesture: "point-other",
      pulse: "sami",
      visualId: "saudi",
      modelItems: ["ana_min"],
      holdMs: 2200,
    },
    {
      id: "origin-self-2",
      kind: "exposure",
      speaker: "yusuf",
      say: "أَنَا مِنْ مِصْرَ",
      language: "ar",
      gesture: "point-self",
      pulse: "yusuf",
      visualId: "egypt",
      modelItems: ["ana_min"],
      holdMs: 1800,
    },

    // ——— Participation: origin ———
    {
      id: "ask-origin",
      kind: "participation",
      speaker: "yusuf",
      say: "وَأَنْتَ؟",
      language: "ar",
      lookAt: "learner",
      gesture: "point-learner",
      pulse: "learner",
      visualId: "nigeria",
      goal: "give-origin",
      holdMs: 600,
      recastFull: "آه! مِنْ {place}!",
      recastPartial: "آه، {place}!",
      rescue: [
        {
          rung: "contextual-cue",
          afterSilenceMs: 4500,
          lines: [
            {
              say: "أَنَا مِنْ مِصْرَ",
              language: "ar",
              gesture: "point-self",
              pulse: "yusuf",
              visualId: "egypt",
              holdMs: 1000,
            },
            {
              say: "وَأَنْتَ؟",
              language: "ar",
              lookAt: "learner",
              gesture: "point-learner",
              visualId: "nigeria",
              pulse: "learner",
            },
          ],
        },
        {
          rung: "contextual-cue",
          afterSilenceMs: 10000,
          lines: [
            {
              say: "أَنَا… مِنْ… مِصْرَ",
              language: "ar",
              gesture: "point-self",
              visualId: "egypt",
              holdMs: 900,
            },
            {
              say: "وَأَنْتَ؟",
              language: "ar",
              lookAt: "learner",
              visualId: "nigeria",
            },
          ],
        },
        {
          rung: "arabic-narrowing",
          afterSilenceMs: 15500,
          lines: [
            {
              say: "أَنَا مِنْ…",
              language: "ar",
              lookAt: "learner",
              gesture: "point-learner",
              visualId: "nigeria",
            },
          ],
        },
        {
          rung: "tiny-clue",
          afterSilenceMs: 21000,
          lines: [
            { say: "From…", language: "en", lookAt: "learner", holdMs: 700 },
            {
              say: "وَأَنْتَ؟",
              language: "ar",
              lookAt: "learner",
              visualId: "nigeria",
            },
          ],
        },
        {
          rung: "response-starter",
          afterSilenceMs: 26500,
          lines: [
            {
              say: "أَنَا مِنْ…",
              language: "ar",
              lookAt: "learner",
              visualId: "nigeria",
            },
          ],
        },
      ],
    },

    // ——— Reinforce: natural reuse, light ———
    {
      id: "confirm-origin",
      kind: "exposure",
      speaker: "sami",
      say: "أَنْتَ مِنْ نِيجِيرِيَا؟",
      language: "ar",
      lookAt: "learner",
      visualId: "nigeria",
      modelItems: ["ana_min"],
      holdMs: 2500,
    },
    {
      id: "identity-reuse",
      kind: "participation",
      speaker: "sami",
      say: "وَأَنْتَ؟",
      language: "ar",
      lookAt: "learner",
      gesture: "point-learner",
      pulse: "learner",
      goal: "identify-self",
      recastFull: "آه، {name}! أَهْلًا يَا {name}.",
      recastPartial: "آه، {name}! أَهْلًا يَا {name}.",
      rescue: [
        {
          rung: "contextual-cue",
          afterSilenceMs: 5000,
          lines: [
            { say: "أَنَا سَامِي", language: "ar", speaker: "sami", gesture: "point-self", pulse: "sami", holdMs: 900 },
            { say: "وَأَنْتَ؟", language: "ar", speaker: "sami", lookAt: "learner", gesture: "point-learner", pulse: "learner" },
          ],
        },
        {
          rung: "response-starter",
          afterSilenceMs: 11000,
          lines: [{ say: "أَنَا…", language: "ar", speaker: "sami", lookAt: "learner", gesture: "point-learner" }],
        },
      ],
    },
    {
      id: "sami-welcome",
      kind: "exposure",
      speaker: "sami",
      say: "أَهْلًا",
      language: "ar",
      lookAt: "learner",
      gesture: "wave",
      holdMs: 1500,
    },

    // ——— Open: keep talking until the timer ———
    {
      id: "open",
      kind: "open",
      speaker: "yusuf",
      say: "تَشَرَّفْتُ",
      language: "ar",
      lookAt: "learner",
      modelItems: ["tasharraftu"],
      holdMs: 1200,
    },
  ];
}
