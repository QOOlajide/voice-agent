import { normalize } from "./normalize";

export type LanguageEvidence = {
  arabicUsed: boolean;
  anaFrameDemonstrated: boolean;
  englishReliance: boolean;
};

export type SelfIdEvaluation = {
  goal: "identify_self";
  communicated: boolean;
  reason: "empty" | "incomplete" | "identified";
  language: LanguageEvidence;
};

const ARABIC_CHAR = /[\u0600-\u06FF]/;
const LATIN_CHAR = /[A-Za-z]/;

/** Frames that introduce an identity. They are not the identity. */
const FRAME_PREFIXES = [
  "my name is",
  "i am",
  "i'm",
  "im",
  "ana",
  "انا",
  "ismi",
  "ismī",
  "اسمي",
];

function stripLeadingFrame(normalized: string) {
  for (const prefix of FRAME_PREFIXES) {
    if (normalized === prefix) return "";
    if (normalized.startsWith(`${prefix} `)) return normalized.slice(prefix.length).trim();
  }
  return normalized;
}

/**
 * After وَأَنْتَ؟ the communicative goal is: Yusuf can tell who the learner is.
 * أنا… is language evidence, not the pass/fail rule.
 * كوام communicates. أنا alone does not. English can communicate and still
 * show reliance on English.
 */
export function extractGivenName(transcript: string): string | undefined {
  const identity = stripLeadingFrame(normalize(transcript.trim()));
  if (!identity) return undefined;
  const token = identity.split(/\s+/).find((part) => part.length >= 2);
  if (!token || ANA_ONLY.test(token) || ISMI_ONLY.test(token)) return undefined;
  return token;
}

const ANA_ONLY = /^(ana|أنا|انا)$/;
const ISMI_ONLY = /^(ism[iī]|اسمي)$/;

export function evaluateSelfIdentification(transcript: string): SelfIdEvaluation {
  const raw = transcript.trim();
  const arabicUsed = ARABIC_CHAR.test(raw);
  const englishReliance = LATIN_CHAR.test(raw);

  if (!raw) {
    return {
      goal: "identify_self",
      communicated: false,
      reason: "empty",
      language: { arabicUsed: false, anaFrameDemonstrated: false, englishReliance: false },
    };
  }

  const parts = normalize(raw).split(/\s+/).filter(Boolean);
  const anaIndex = parts.findIndex((part) => part === "انا");
  const ismiIndex = parts.findIndex((part) => part === "اسمي" || part === "ismi");
  const anaFrameDemonstrated =
    (anaIndex !== -1 && anaIndex < parts.length - 1) ||
    (ismiIndex !== -1 && ismiIndex < parts.length - 1);
  const identity = stripLeadingFrame(parts.join(" "));

  return {
    goal: "identify_self",
    communicated: identity.length > 0,
    reason: identity.length > 0 ? "identified" : "incomplete",
    language: { arabicUsed, anaFrameDemonstrated, englishReliance },
  };
}
