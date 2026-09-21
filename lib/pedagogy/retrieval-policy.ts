import type { LearnerLanguageItem } from "./types";

/** Retrieval before reteaching. If we believe they know it, give them a chance. */
export function shouldAttemptRetrieval(item?: LearnerLanguageItem) {
  if (!item) return false;
  return (
    item.productionConfidence >= 0.35 ||
    item.successfulRetrievals > 0 ||
    item.mastery === "unsupported-production" ||
    item.mastery === "spontaneous-use" ||
    item.mastery === "automatic"
  );
}

export function scaffoldLevelForReturn(item?: LearnerLanguageItem) {
  if (!item) return 2;
  if (shouldAttemptRetrieval(item)) return 0;
  if (item.recognitionConfidence >= 0.5) return 1;
  return 2;
}
