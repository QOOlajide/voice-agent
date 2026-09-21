import type { ConversationSetting, SettingId } from "../pedagogy/types";

export const SETTINGS: Record<SettingId, ConversationSetting> = {
  "meet-someone": {
    id: "meet-someone",
    title: "Meeting someone",
    world:
      "A small gathering. Yusuf is already there. Sami is nearby. Name tags exist; nothing else is labeled. This is a first meeting, not a lesson.",
    communicativeNeeds: [
      "greet",
      "introduce-self",
      "ask-and-give-name",
      "react",
      "close",
    ],
    visualIds: ["gathering", "egypt", "saudi", "nigeria"],
    characterIds: ["yusuf", "sami"],
    magicSentenceIds: [
      "as_salamu",
      "ana",
      "huwa",
      "wa_anta",
      "ismi",
      "ma_ismuka",
      "ahlan_ya",
      "tasharraftu",
    ],
    whyKeys: ["greeting", "ana", "ismi"],
    vocabularyOptions: [],
  },
  cafe: {
    id: "cafe",
    title: "Café",
    world: "A café. Wanting something, choosing size, and receiving it can be shown in the scene.",
    communicativeNeeds: ["greet", "express-want", "choose-size", "thank", "close"],
    visualIds: ["coffeeLarge", "coffeeSmall"],
    characterIds: ["yusuf"],
    magicSentenceIds: ["as_salamu", "wa_alaykum", "uridu", "ila_alliqa"],
    whyKeys: ["greeting", "uridu", "size", "farewell"],
    vocabularyOptions: [
      { id: "qahwa", transliteration: "qahwa", arabic: "قهوة", gloss: "coffee", cue: "☕" },
      { id: "shay", transliteration: "shāy", arabic: "شاي", gloss: "tea", cue: "🍵" },
      { id: "ma", transliteration: "māʾ", arabic: "ماء", gloss: "water", cue: "💧" },
    ],
  },
  family: {
    id: "family",
    title: "Family",
    world: "Talking about people you have in your life. Possession and relations matter here.",
    communicativeNeeds: ["greet", "talk-about-family", "ask-back", "close"],
    visualIds: ["brother"],
    characterIds: ["yusuf"],
    magicSentenceIds: ["as_salamu", "wa_alaykum", "indi", "ila_alliqa"],
    whyKeys: ["greeting", "indi", "ismi", "farewell"],
    vocabularyOptions: [
      { id: "akh", transliteration: "akh", arabic: "أخ", gloss: "brother", cue: "👤" },
      { id: "ukht", transliteration: "ukht", arabic: "أخت", gloss: "sister", cue: "👤" },
    ],
  },
  hobbies: {
    id: "hobbies",
    title: "Hobbies",
    world: "Preferences and reasons. A chance to connect two thoughts.",
    communicativeNeeds: ["retrieve-likes", "give-a-reason", "ask-back", "close"],
    visualIds: ["football", "reading"],
    characterIds: ["yusuf"],
    magicSentenceIds: ["uhibbu_an", "lianna", "ila_alliqa"],
    whyKeys: ["uhibbu_an", "lianna", "farewell"],
    vocabularyOptions: [
      { id: "alab", transliteration: "alʿab", arabic: "ألعب", gloss: "I play", cue: "⚽" },
      { id: "aqra", transliteration: "aqraʾ", arabic: "أقرأ", gloss: "I read", cue: "📖" },
      { id: "usafir", transliteration: "usāfir", arabic: "أسافر", gloss: "I travel", cue: "✈️" },
    ],
  },
  "daily-routine": {
    id: "daily-routine",
    title: "Daily routine",
    world: "A day unfolding. Times, before/after, and simple narration.",
    communicativeNeeds: ["share-a-time", "sequence-events", "ask-back", "close"],
    visualIds: ["morning"],
    characterIds: ["yusuf"],
    magicSentenceIds: ["askunu_fi", "ila_alliqa"],
    whyKeys: ["time", "farewell"],
    vocabularyOptions: [
      { id: "sabaa", transliteration: "as-sābiʿa", arabic: "السابعة", gloss: "seven", cue: "7️⃣" },
      { id: "thamina", transliteration: "ath-thāmina", arabic: "الثامنة", gloss: "eight", cue: "8️⃣" },
    ],
  },
};

export function settingById(id: SettingId) {
  return SETTINGS[id];
}

export const SETTING_ORDER: SettingId[] = [
  "meet-someone",
  "cafe",
  "family",
  "hobbies",
  "daily-routine",
];
