import { magicSentence } from "./magic-sentences";
import type { LearnerLanguageItem } from "./types";

/**
 * Production is fair only after the learner has heard the pieces with a
 * visible referent enough times to build a response.
 */
export function canRequestProduction(item: LearnerLanguageItem | undefined, itemId: string) {
  const sentence = magicSentence(itemId);
  const needed = sentence?.minHeardBeforeProduction ?? 1;
  if (needed <= 0) return true;
  const modeled = item?.modeledCount ?? 0;
  const withReferent = item?.heardWithReferent ?? 0;
  return modeled >= needed && withReferent >= Math.min(needed, 1);
}

export function remainingModels(item: LearnerLanguageItem | undefined, itemId: string) {
  const sentence = magicSentence(itemId);
  const needed = sentence?.minHeardBeforeProduction ?? 1;
  const modeled = item?.modeledCount ?? 0;
  return Math.max(0, needed - modeled);
}
