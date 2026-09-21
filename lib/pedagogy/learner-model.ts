import { clamp01, nowIso } from "./normalize";
import type {
  LanguageItemType,
  LearnerLanguageItem,
  LearnerProfile,
  MasteryState,
} from "./types";

export function emptyItem(
  id: string,
  type: LanguageItemType = "magic-sentence",
): LearnerLanguageItem {
  return {
    id,
    type,
    mastery: "new",
    recognitionConfidence: 0,
    productionConfidence: 0,
    spontaneousConfidence: 0,
    scaffoldLevel: 0,
    requiresTransliteration: true,
    requiresNativeLanguage: true,
    encounterCount: 0,
    modeledCount: 0,
    heardWithReferent: 0,
    successfulRetrievals: 0,
    failedRetrievals: 0,
    lastEncounteredAt: null,
    nextReviewAt: null,
  };
}

export function getItem(
  profile: LearnerProfile,
  id: string,
): LearnerLanguageItem | undefined {
  return profile.languageItems[id];
}

export function upsertItem(
  profile: LearnerProfile,
  id: string,
  type: LanguageItemType,
  patch: Partial<LearnerLanguageItem>,
): LearnerLanguageItem {
  const current = profile.languageItems[id] ?? emptyItem(id, type);
  const next = { ...current, ...patch, id, type };
  profile.languageItems[id] = next;
  return next;
}

export function deriveMastery(item: LearnerLanguageItem): MasteryState {
  if (item.spontaneousConfidence >= 0.8 && item.productionConfidence >= 0.75) {
    return "automatic";
  }
  if (item.spontaneousConfidence >= 0.55) return "spontaneous-use";
  if (item.productionConfidence >= 0.7 && item.scaffoldLevel <= 0) {
    return "unsupported-production";
  }
  if (item.productionConfidence >= 0.45) return "supported-production";
  if (item.productionConfidence > 0) return "scaffolded-production";
  if (item.recognitionConfidence >= 0.4) return "recognized";
  if (item.encounterCount > 0 || item.modeledCount > 0) return "introduced";
  return "new";
}

export function markEncountered(item: LearnerLanguageItem) {
  item.encounterCount += 1;
  item.lastEncounteredAt = nowIso();
  item.recognitionConfidence = clamp01(item.recognitionConfidence + 0.12);
  item.mastery = deriveMastery(item);
}

export function markModeled(item: LearnerLanguageItem, withReferent: boolean) {
  item.modeledCount += 1;
  item.lastEncounteredAt = nowIso();
  item.recognitionConfidence = clamp01(item.recognitionConfidence + 0.18);
  if (withReferent) item.heardWithReferent += 1;
  item.mastery = deriveMastery(item);
}

export function markRetrievalSuccess(
  item: LearnerLanguageItem,
  opts: { scaffolded: boolean; spontaneous: boolean },
) {
  item.successfulRetrievals += 1;
  item.lastEncounteredAt = nowIso();
  item.productionConfidence = clamp01(
    item.productionConfidence + (opts.scaffolded ? 0.08 : 0.16),
  );
  if (!opts.scaffolded) {
    item.scaffoldLevel = Math.max(0, item.scaffoldLevel - 1);
    item.requiresNativeLanguage = false;
    if (item.successfulRetrievals >= 2) item.requiresTransliteration = false;
  }
  if (opts.spontaneous) {
    item.spontaneousConfidence = clamp01(item.spontaneousConfidence + 0.2);
  }
  item.mastery = deriveMastery(item);
}

export function markRetrievalFailure(item: LearnerLanguageItem) {
  item.failedRetrievals += 1;
  item.lastEncounteredAt = nowIso();
  item.productionConfidence = clamp01(item.productionConfidence - 0.12);
  item.scaffoldLevel = Math.min(4, item.scaffoldLevel + 1);
  item.mastery = deriveMastery(item);
}

export function markNativeLanguageNeeded(item: LearnerLanguageItem) {
  item.requiresNativeLanguage = true;
}

export function knows(profile: LearnerProfile, id: string, min = 0.4) {
  const item = profile.languageItems[id];
  return Boolean(item && item.productionConfidence >= min);
}

export function encountered(profile: LearnerProfile, id: string) {
  const item = profile.languageItems[id];
  if (!item) {
    if (id === "ana" || id === "ismi") {
      return (profile.languageItems.ana_ismi?.encounterCount ?? 0) > 0;
    }
    return false;
  }
  return item.encounterCount > 0 || item.modeledCount > 0;
}

export function createProfile(): LearnerProfile {
  return {
    id: "local-learner",
    likes: [],
    completedSettingIds: [],
    sessionCount: 0,
    languageItems: {},
    reviewCards: [],
    moments: [],
  };
}
