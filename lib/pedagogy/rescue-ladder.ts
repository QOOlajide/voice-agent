import { magicSentence } from "./magic-sentences";
import { CHARACTERS } from "../content/characters";
import type {
  CharacterId,
  GestureKind,
  RescueRung,
  Scaffold,
  ScaffoldType,
} from "./types";

export type RescueFailure =
  | "silence"
  | "confusion"
  | "code-switch-answer"
  | "incomplete-frame";

export type RescueTarget = {
  itemId: string;
  sequence: RescueRung[];
  tinyClue: string;
  arabicNarrowing?: string;
  responseStarter?: string;
  gesture: GestureKind;
  pulse?: CharacterId;
};

const DEFAULT_SEQUENCE: RescueRung[] = [
  "contextual-cue",
  "arabic-narrowing",
  "tiny-clue",
  "response-starter",
];

export const RUNG_DELAY_MS = 4500;

export function rescueTargetFor(itemId: string, speakerName = "Yusuf"): RescueTarget {
  const sentence = magicSentence(itemId);
  const tiny = (sentence?.tinyClue ?? "You?").replace("{name}", speakerName);
  return {
    itemId,
    sequence: sentence?.rescueSequence?.length ? sentence.rescueSequence : DEFAULT_SEQUENCE,
    tinyClue: tiny,
    arabicNarrowing: sentence?.arabicNarrowing,
    responseStarter: sentence?.responseStarter,
    gesture: itemId === "ismi" || itemId === "ma_ismuka" ? "point-learner" : "point-learner",
    pulse: "learner",
  };
}

/** hintLevel 0 = waiting. 1 = first rung in the item's sequence. */
export function nextRescueLevel(current: number, sequenceLength: number) {
  if (sequenceLength <= 0) return current;
  return Math.min(sequenceLength, current + 1);
}

export function rungAt(sequence: RescueRung[], hintLevel: number): RescueRung {
  if (hintLevel <= 0) return "wait";
  return sequence[Math.min(hintLevel, sequence.length) - 1] ?? "wait";
}

/**
 * Silence climbs one rung.
 * Confusion skips ahead to the tiny English clue (comprehension failure).
 * An English answer that already communicates is not a rescue — recast.
 * An incomplete frame (said أنا with no name) jumps to the response starter.
 */
export function nextRescueLevelForFailure(
  sequence: RescueRung[],
  current: number,
  failure: RescueFailure,
) {
  if (failure === "code-switch-answer") return sequence.length + 1;
  if (failure === "confusion") {
    const tiny = sequence.indexOf("tiny-clue");
    const desired = tiny >= 0 ? tiny + 1 : current + 1;
    return Math.min(sequence.length, Math.max(current + 1, desired));
  }
  if (failure === "incomplete-frame") {
    const starter = sequence.indexOf("response-starter");
    const desired = starter >= 0 ? starter + 1 : current + 1;
    return Math.min(sequence.length, Math.max(current + 1, desired));
  }
  return nextRescueLevel(current, sequence.length);
}

export function scaffoldForRung(target: RescueTarget, hintLevel: number): Scaffold {
  const rung = rungAt(target.sequence, hintLevel);
  const types: ScaffoldType[] = [];

  if (rung === "wait" || rung === "contextual-cue") {
    if (rung === "contextual-cue") types.push("contextual-cue");
    return {
      required: types.length > 0,
      types: types.length ? types : ["none"],
      rescueRung: rung,
    };
  }

  if (rung === "arabic-narrowing" && target.arabicNarrowing) {
    types.push("arabic-narrowing");
    return {
      required: true,
      types,
      arabicNarrowing: target.arabicNarrowing,
      rescueRung: rung,
    };
  }

  if (rung === "tiny-clue") {
    types.push("tiny-clue");
    return {
      required: true,
      types,
      tinyClue: target.tinyClue,
      nativeLanguageAnchor: target.tinyClue,
      rescueRung: rung,
    };
  }

  if (rung === "response-starter" && target.responseStarter) {
    types.push("response-starter");
    return {
      required: true,
      types,
      responseStarter: target.responseStarter,
      responseFrame: target.responseStarter,
      rescueRung: rung,
    };
  }

  return { required: false, types: ["none"], rescueRung: rung };
}

export function rescueInstruction(target: RescueTarget, hintLevel: number, speaker: CharacterId) {
  const rung = rungAt(target.sequence, hintLevel);
  const who = CHARACTERS[speaker as keyof typeof CHARACTERS]?.nameEnglish ?? "Yusuf";

  if (rung === "contextual-cue") {
    return `${who} is on. The learner froze. Do not speak English. Call stage_scene with speaker="${speaker}", lookAt="learner", gestureKind="${target.gesture}", gestureTarget="learner"${target.pulse ? `, pulseNameTag="${target.pulse}"` : ""}. Then wait. If you must speak, only the same Arabic again.`;
  }
  if (rung === "arabic-narrowing") {
    return `${who} is on. Still stuck. Speak only this Arabic fragment, slowly: "${target.arabicNarrowing ?? ""}". Call stage_scene (lookAt=learner) and present_scaffold with types ["arabic-narrowing"] and arabicNarrowing="${target.arabicNarrowing ?? ""}". No English.`;
  }
  if (rung === "tiny-clue") {
    return `${who} is on. Still stuck. Speak the one-job English clue "${target.tinyClue}" — that is the entire English utterance. Then repeat the Arabic. Call present_scaffold with types ["tiny-clue"] and tinyClue="${target.tinyClue}". Do not explain grammar. Do not translate the whole turn.`;
  }
  if (rung === "response-starter") {
    return `${who} is on. Still stuck. Start the answer for them. Speak "${target.responseStarter ?? ""}" and wait for them to finish. Call present_scaffold with types ["response-starter"] and responseStarter="${target.responseStarter ?? ""}". No translation.`;
  }
  return `${who} is on. Wait. The learner may still answer. Do not rescue yet.`;
}

export function scenePatchForRung(target: RescueTarget, hintLevel: number, speaker: CharacterId) {
  const rung = rungAt(target.sequence, hintLevel);
  if (rung === "wait") return null;
  return {
    speaker,
    lookAt: "learner" as const,
    gestureKind: rung === "contextual-cue" || rung === "arabic-narrowing" ? target.gesture : "none",
    gestureTarget: "learner" as const,
    pulseNameTag: target.pulse ?? null,
  };
}
