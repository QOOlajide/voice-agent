import {
  emptyItem,
  markEncountered,
  markModeled,
  markNativeLanguageNeeded,
  markRetrievalFailure,
  markRetrievalSuccess,
  upsertItem,
} from "./learner-model";
import { extractReviewCards } from "./review-policy";
import type { LanguageItemType, LearnerProfile, LearningMoment, SettingId } from "./types";

function itemType(id: string): LanguageItemType {
  if (["wa", "lakin", "lianna", "aw", "thumma"].includes(id)) return "connector";
  if (["ma_ismuka", "wa_anta"].includes(id)) return "question-word";
  if (["ahlan_ya", "tasharraftu"].includes(id)) return "reaction";
  if (["alab", "aqra", "ataallam", "asbah", "usafir", "qahwa"].includes(id)) {
    return "vocabulary";
  }
  return "magic-sentence";
}

function expandIds(ids: string[]) {
  return ids.flatMap((id) => {
    if (id === "ana_ismi") return ["ana", "ismi"];
    return [id];
  });
}

export function applyMoment(profile: LearnerProfile, moment: LearningMoment) {
  profile.moments = [...profile.moments, moment].slice(-200);

  if (moment.note?.startsWith("name:")) {
    profile.givenName = moment.note.slice(5).trim() || profile.givenName;
  }

  for (const id of expandIds(moment.languageItemIds)) {
    const item = upsertItem(profile, id, itemType(id), {});
    if (moment.type === "modeled") {
      markModeled(item, moment.note !== "no-referent");
      continue;
    }
    markEncountered(item);

    switch (moment.type) {
      case "unsupported-retrieval":
        markRetrievalSuccess(item, { scaffolded: false, spontaneous: false });
        break;
      case "spontaneous-use":
        markRetrievalSuccess(item, { scaffolded: false, spontaneous: true });
        break;
      case "scaffolded-production":
        markRetrievalSuccess(item, { scaffolded: true, spontaneous: false });
        break;
      case "code-switch":
        markNativeLanguageNeeded(item);
        markRetrievalSuccess(item, { scaffolded: true, spontaneous: false });
        break;
      case "correction":
        markRetrievalFailure(item);
        break;
      default:
        break;
    }
  }
}

export function applyRecordedFields(
  profile: LearnerProfile,
  fields: { learnerName?: string; learnerOrigin?: string; learnerLike?: string },
) {
  if (fields.learnerName) profile.givenName = fields.learnerName;
  if (fields.learnerOrigin) profile.origin = fields.learnerOrigin;
  if (fields.learnerLike && !profile.likes.includes(fields.learnerLike)) {
    profile.likes = [...profile.likes, fields.learnerLike];
  }
}

export function finalizeSession(
  profile: LearnerProfile,
  sessionMoments: LearningMoment[],
  settingId: SettingId,
): LearnerProfile {
  const next: LearnerProfile = {
    ...profile,
    languageItems: { ...profile.languageItems },
    likes: [...profile.likes],
    completedSettingIds: [...profile.completedSettingIds],
    reviewCards: [...profile.reviewCards],
    moments: profile.moments.length
      ? [...profile.moments]
      : [...profile.moments, ...sessionMoments],
  };

  next.sessionCount += 1;
  if (!next.completedSettingIds.includes(settingId)) {
    next.completedSettingIds.push(settingId);
  }

  const freshCards = extractReviewCards(sessionMoments);
  const existingIds = new Set(next.reviewCards.map((card) => card.languageItemId));
  for (const card of freshCards) {
    if (existingIds.has(card.languageItemId)) {
      next.reviewCards = next.reviewCards.map((current) =>
        current.languageItemId === card.languageItemId
          ? { ...current, arabic: card.arabic, transliteration: card.transliteration, meaning: card.meaning, dueAt: card.dueAt }
          : current,
      );
    } else {
      next.reviewCards.push(card);
    }
  }

  return next;
}

export function emptyMomentItem(id: string) {
  return emptyItem(id, itemType(id));
}
