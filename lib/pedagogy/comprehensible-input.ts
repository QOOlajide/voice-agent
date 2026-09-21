import type { LearnerProfile } from "./types";
import { knows } from "./learner-model";

/** Speech should be mostly known + inferable + a little new. */
export function noveltyBudget(profile: LearnerProfile) {
  const knownCount = Object.values(profile.languageItems).filter(
    (item) => item.productionConfidence >= 0.4,
  ).length;
  if (knownCount === 0) return { introduce: 2, retrieve: 0 };
  if (knownCount < 4) return { introduce: 1, retrieve: 2 };
  return { introduce: 1, retrieve: 3 };
}

export function canIntroduce(profile: LearnerProfile, id: string) {
  return !knows(profile, id, 0.35);
}
