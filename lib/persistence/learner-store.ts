import { createProfile } from "../pedagogy/learner-model";
import type { LearnerLanguageItem, LearnerProfile } from "../pedagogy/types";

const KEY = "kalam:learner-v3";
const PREV_KEY = "kalam:learner-v2";

function migrateItem(item: Partial<LearnerLanguageItem> & { id: string }): LearnerLanguageItem {
  return {
    id: item.id,
    type: item.type ?? "magic-sentence",
    mastery: item.mastery ?? "new",
    recognitionConfidence: item.recognitionConfidence ?? 0,
    productionConfidence: item.productionConfidence ?? 0,
    spontaneousConfidence: item.spontaneousConfidence ?? 0,
    scaffoldLevel: item.scaffoldLevel ?? 0,
    requiresTransliteration: item.requiresTransliteration ?? true,
    requiresNativeLanguage: item.requiresNativeLanguage ?? true,
    encounterCount: item.encounterCount ?? 0,
    modeledCount: item.modeledCount ?? 0,
    heardWithReferent: item.heardWithReferent ?? 0,
    successfulRetrievals: item.successfulRetrievals ?? 0,
    failedRetrievals: item.failedRetrievals ?? 0,
    lastEncounteredAt: item.lastEncounteredAt ?? null,
    nextReviewAt: item.nextReviewAt ?? null,
  };
}

function migrate(raw: LearnerProfile): LearnerProfile {
  const profile = { ...createProfile(), ...raw };
  if (!profile.completedSettingIds) profile.completedSettingIds = [];
  if (!profile.likes) profile.likes = [];
  if (!profile.languageItems) profile.languageItems = {};
  if (!profile.reviewCards) profile.reviewCards = [];
  if (!profile.moments) profile.moments = [];

  const items: Record<string, LearnerLanguageItem> = {};
  for (const [id, item] of Object.entries(profile.languageItems)) {
    items[id] = migrateItem({ ...item, id });
  }
  if (items.ana_ismi && !items.ana) {
    items.ana = { ...items.ana_ismi, id: "ana" };
    items.ismi = { ...items.ana_ismi, id: "ismi" };
  }
  profile.languageItems = items;
  return profile;
}

export function loadProfile(): LearnerProfile {
  if (typeof window === "undefined") return createProfile();
  try {
    const raw = window.localStorage.getItem(KEY) ?? window.localStorage.getItem(PREV_KEY);
    if (!raw) return createProfile();
    return migrate(JSON.parse(raw) as LearnerProfile);
  } catch {
    return createProfile();
  }
}

export function saveProfile(profile: LearnerProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(profile));
}
