import { normalize } from "./normalize";

export type TurnClass =
  | "silence"
  | "confusion"
  | "code-switch-answer"
  | "incomplete-frame"
  | "arabic-answer"
  | "other";

const ARABIC_CHAR = /[\u0600-\u06FF]/;
const LATIN_CHAR = /[A-Za-z]/;
const CONFUSION =
  /\b(what|huh|sorry|pardon|repeat|meaning|mean|translate|english)\b|ماذا|ما هذا|لا أفهم|لا افهم/;

const ANA = /^(ana|أنا|انا)$/;
const ISMI = /^(ism[iī]|اسمي)$/;

export function detectLanguage(text: string): "ar" | "en" | "mixed" | "unknown" {
  const arabic = ARABIC_CHAR.test(text);
  const latin = LATIN_CHAR.test(text);
  if (arabic && latin) return "mixed";
  if (arabic) return "ar";
  if (latin) return "en";
  return "unknown";
}

/**
 * Silence and confusion are comprehension problems.
 * An English answer that already names someone is not — recast.
 * أنا / اسمي alone is a production problem (offer the starter, let them finish).
 */
export function classifyLearnerTurn(transcript: string, expected: "ana" | "ismi" | "other" = "other"): TurnClass {
  const raw = transcript.trim();
  if (!raw) return "silence";

  const n = normalize(raw);
  if (CONFUSION.test(n)) return "confusion";

  const parts = n.split(/\s+/).filter(Boolean);
  const onlyFrame =
    (expected === "ana" && parts.length === 1 && ANA.test(parts[0])) ||
    (expected === "ismi" && parts.length === 1 && ISMI.test(parts[0]));
  if (onlyFrame) return "incomplete-frame";

  const hasArabic = ARABIC_CHAR.test(raw);
  const hasLatin = LATIN_CHAR.test(raw);
  if (hasLatin && !hasArabic) return "code-switch-answer";
  if (hasArabic) return "arabic-answer";
  return "other";
}
