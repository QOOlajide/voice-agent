import { SETTINGS, settingById } from "../content/settings";
import { conversationControlShare, preferredUtteranceLength } from "./complexity-policy";
import { noveltyBudget } from "./comprehensible-input";
import { choreographyFor } from "./introduction-choreography";
import { encountered, knows } from "./learner-model";
import { MAGIC_SENTENCES, magicSentence } from "./magic-sentences";
import { shouldAttemptRetrieval } from "./retrieval-policy";
import type {
  LearnerProfile,
  PlannedItem,
  SessionPlan,
  SettingId,
} from "./types";

function planned(id: string, reason: string): PlannedItem {
  const sentence = magicSentence(id);
  return {
    id,
    frame: sentence?.frame,
    meaning: sentence?.meaning,
    reason,
  };
}

export function chooseSetting(profile: LearnerProfile): SettingId {
  if (!encountered(profile, "ana") || !encountered(profile, "ismi")) {
    return "meet-someone";
  }
  if (!knows(profile, "ana_min", 0.25) && profile.sessionCount < 2) {
    return "meet-someone";
  }
  if (!encountered(profile, "uridu")) return "cafe";
  if (!encountered(profile, "indi")) return "family";
  if (!encountered(profile, "lianna")) return "hobbies";
  if (!profile.completedSettingIds.includes("daily-routine")) return "daily-routine";
  return profile.sessionCount % 2 === 0 ? "hobbies" : "cafe";
}

export function planSession(profile: LearnerProfile): SessionPlan {
  const settingId = chooseSetting(profile);
  const setting = settingById(settingId);
  const budget = noveltyBudget(profile);
  const { characters, phases } = choreographyFor(settingId, profile.sessionCount);
  const personaCharacter = characters[0];

  const retrieve: PlannedItem[] = [];
  const strengthen: PlannedItem[] = [];
  const introduce: PlannedItem[] = [];

  const firstMeeting = settingId === "meet-someone" && profile.sessionCount === 0;

  for (const id of setting.magicSentenceIds) {
    const item = profile.languageItems[id];
    if (shouldAttemptRetrieval(item) && retrieve.length < Math.max(budget.retrieve, 1)) {
      retrieve.push(planned(id, "previously produced — retrieve before reteaching"));
      continue;
    }
    if (item && item.productionConfidence > 0 && item.productionConfidence < 0.55) {
      strengthen.push(planned(id, "becoming weak — restore only if retrieval fails"));
      continue;
    }
    if (!item || item.encounterCount === 0) {
      const cap = firstMeeting ? setting.magicSentenceIds.length : budget.introduce;
      if (introduce.length < cap) {
        introduce.push(planned(id, "new in this setting — model with a visible referent first"));
      }
    }
  }

  if (retrieve.length === 0 && profile.sessionCount > 0) {
    for (const [id, item] of Object.entries(profile.languageItems)) {
      if (shouldAttemptRetrieval(item) && MAGIC_SENTENCES[id]) {
        retrieve.push(planned(id, "due for conversational retrieval"));
        if (retrieve.length >= budget.retrieve) break;
      }
    }
  }

  const conversationalGoal = firstMeeting
    ? "Zero-knowledge learner completes a tiny real exchange: greet, أنا + name, then اسمي after it has been modeled twice."
    : introduce[0]?.id === "lianna"
      ? "Learner gives one reason for a preference."
      : introduce[0]?.id === "uridu"
        ? "Learner expresses a real want in this setting."
        : introduce[0]?.id === "indi"
          ? "Learner talks about someone they have in their life."
          : "Learner reuses known Arabic and adds one new move.";

  return {
    settingId,
    settingTitle: setting.title,
    world: setting.world,
    communicativeNeeds: setting.communicativeNeeds,
    visualIds: setting.visualIds,
    characters,
    choreography: phases,
    retrieve,
    strengthen,
    introduce,
    conversationalGoal,
    persona: {
      name: personaCharacter?.nameEnglish ?? "Yusuf",
      nameArabic: personaCharacter?.nameArabic ?? "يوسف",
      originArabic: "مصر",
      originEnglish: "Egypt",
      likes: ["football", "reading"],
    },
    learner: {
      givenName: profile.givenName,
      origin: profile.origin,
      likes: profile.likes,
      sessionCount: profile.sessionCount,
      knownFrames: Object.values(profile.languageItems)
        .filter((item) => item.encounterCount > 0 || item.modeledCount > 0)
        .map((item) => ({
          id: item.id,
          frame: magicSentence(item.id)?.frame ?? item.id,
          productionConfidence: item.productionConfidence,
          requiresTransliteration: item.requiresTransliteration,
          requiresNativeLanguage: item.requiresNativeLanguage,
        })),
    },
    utteranceLength: preferredUtteranceLength(profile),
    controlShare: conversationControlShare(profile),
  };
}

export function settingVocab(settingId: SettingId) {
  return SETTINGS[settingId].vocabularyOptions;
}
