import type { LearnerProfile } from "./types";

export function preferredUtteranceLength(profile: LearnerProfile) {
  if (profile.sessionCount === 0) return "short";
  const avgProduction =
    Object.values(profile.languageItems).reduce(
      (sum, item) => sum + item.productionConfidence,
      0,
    ) / Math.max(1, Object.keys(profile.languageItems).length);
  if (avgProduction >= 0.6) return "long";
  if (avgProduction >= 0.35) return "medium";
  return "short";
}

export function conversationControlShare(profile: LearnerProfile) {
  if (profile.sessionCount === 0) return "agent-led";
  if (profile.sessionCount < 4) return "agent-led-with-askback";
  if (profile.sessionCount < 8) return "shared";
  return "learner-led";
}
