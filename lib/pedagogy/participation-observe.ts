import { normalize } from "./normalize";
import { extractGivenName } from "./evaluate-goal";
import type { ParticipationGoal } from "./performed-beats";

export type ParticipationOutcome =
  | { status: "blocked"; reason: "silence" | "confusion" }
  | { status: "incomplete-frame" }
  | {
      status: "communicated";
      completeness: "full" | "partial";
      name?: string;
      place?: string;
      usedAnaFrame: boolean;
      usedMinFrame: boolean;
      /** Rough diagnostic signal only: should the scripted beginner probe continue? */
      complexitySignal: "minimal" | "basic" | "beyond-basic";
    };

const ARABIC_CHAR = /[\u0600-\u06FF]/;
const CONFUSION =
  /\b(what|huh|sorry|pardon|repeat|meaning|mean|translate|english)\b|ماذا|ما هذا|لا أفهم|لا افهم/;

const PLACE_HINTS = [
  "nigeria",
  "نيجيريا",
  "nijiriya",
  "nījīriyā",
  "egypt",
  "مصر",
  "america",
  "أمريكا",
  "england",
  "بريطانيا",
  "canada",
  "كندا",
  "france",
  "فرنسا",
  "saudi",
  "السعودية",
];

/**
 * Observe a participation attempt.
 * Communication success ≠ full structure demonstration.
 * Partial success (name only / place only) still ends rescue and continues.
 */
export function observeParticipation(
  transcript: string,
  goal: ParticipationGoal,
): ParticipationOutcome {
  const raw = transcript.trim();
  if (!raw) return { status: "blocked", reason: "silence" };

  const n = normalize(raw);
  if (CONFUSION.test(n)) return { status: "blocked", reason: "confusion" };

  const parts = n.split(/\s+/).filter(Boolean);
  const complexitySignal = parts.length >= 4 ? "beyond-basic" : parts.length >= 2 ? "basic" : "minimal";
  if (parts.length === 1 && (parts[0] === "انا" || parts[0] === "ana")) {
    return { status: "incomplete-frame" };
  }
  if (goal === "give-origin" && parts.length === 1 && (parts[0] === "من" || parts[0] === "min")) {
    return { status: "incomplete-frame" };
  }

  if (goal === "identify-self") {
    const name = extractGivenName(raw);
    if (!name) {
      // Anything spoken that isn't confusion — treat carefully
      if (parts.length >= 1 && !CONFUSION.test(n)) {
        // Single unknown token likely a name
        const token = parts[parts.length - 1];
        if (token && token !== "انا" && token !== "ana") {
          return {
            status: "communicated",
            completeness: parts[0] === "انا" || parts[0] === "ana" ? "full" : "partial",
            name: token,
            usedAnaFrame: parts[0] === "انا" || parts[0] === "ana",
            usedMinFrame: false,
            complexitySignal,
          };
        }
      }
      return { status: "blocked", reason: "confusion" };
    }
    const usedAnaFrame = /\b(ana|انا)\b/.test(n) || /أنا/.test(raw);
    return {
      status: "communicated",
      completeness: usedAnaFrame ? "full" : "partial",
      name,
      usedAnaFrame,
      usedMinFrame: false,
      complexitySignal,
    };
  }

  // give-origin
  const usedMinFrame = /\b(min|من)\b/.test(n) || /مِن/.test(raw);
  const usedAnaFrame = /\b(ana|انا)\b/.test(n) || /أنا/.test(raw);
  const leftover = parts
    .filter((p) => p !== "انا" && p !== "ana" && p !== "من" && p !== "min")
    .join(" ");
  const place = PLACE_HINTS.find((key) => n.includes(normalize(key))) ?? (leftover || undefined);

  if (!place && !usedMinFrame) {
    return { status: "blocked", reason: "confusion" };
  }

  if (!place) return { status: "incomplete-frame" };

  const full = usedAnaFrame && usedMinFrame;
  return {
    status: "communicated",
    completeness: full ? "full" : "partial",
    place,
    usedAnaFrame,
    usedMinFrame,
    complexitySignal,
  };
}

export function detectLanguage(text: string): "ar" | "en" | "mixed" | "unknown" {
  const arabic = ARABIC_CHAR.test(text);
  const latin = /[A-Za-z]/.test(text);
  if (arabic && latin) return "mixed";
  if (arabic) return "ar";
  if (latin) return "en";
  return "unknown";
}
