import type { WhyExplanation } from "./types";

const WHY: Record<string, Omit<WhyExplanation, "depth">> = {
  greeting: {
    heardArabic: "السلام عليكم",
    heardTransliteration: "as-salāmu ʿalaykum",
    usefulMeaning: "Peace be upon you — a greeting. The usual reply is wa ʿalaykumu s-salām.",
    pattern: "Arabic greetings often come in pairs: one person opens, the other returns.",
    examples: [
      {
        arabic: "وعليكم السلام",
        transliteration: "wa ʿalaykumu s-salām",
        meaning: "And peace be upon you",
      },
      {
        arabic: "أهلاً",
        transliteration: "ahlan",
        meaning: "Hi / welcome",
      },
    ],
  },
  ana: {
    heardArabic: "أنا يوسف",
    heardTransliteration: "ana Yūsuf",
    usefulMeaning: "I am Yusuf. أنا points at the speaker.",
    pattern: "ana + name (or later, ana + other facts about yourself). Swap the name; keep أنا.",
    examples: [
      { arabic: "أنا سامي", transliteration: "ana Sāmī", meaning: "I am Sami" },
      { arabic: "أنا من مصر", transliteration: "ana min Miṣr", meaning: "I am from Egypt" },
    ],
  },
  ismi: {
    heardArabic: "اسمي يوسف",
    heardTransliteration: "ismī Yūsuf",
    usefulMeaning: "My name is Yusuf.",
    pattern: "ism = name. The -ī sound can mean “my.” ismī = my name.",
    examples: [
      { arabic: "بيتي", transliteration: "baytī", meaning: "my house" },
      { arabic: "كتابي", transliteration: "kitābī", meaning: "my book" },
      { arabic: "أخي", transliteration: "akhī", meaning: "my brother" },
    ],
  },
  min: {
    heardArabic: "أنا من مصر",
    heardTransliteration: "ana min Miṣr",
    usefulMeaning: "I am from Egypt.",
    pattern: "min = from. ana min + place tells people where you are from.",
    examples: [
      { arabic: "أنا من نيجيريا", transliteration: "ana min Nījīriyā", meaning: "I am from Nigeria" },
      { arabic: "هو من لبنان", transliteration: "huwa min Lubnān", meaning: "He is from Lebanon" },
    ],
  },
  uhibbu_an: {
    heardArabic: "أحب أن ألعب",
    heardTransliteration: "uḥibbu an alʿab",
    usefulMeaning: "I like to play / I like to [do something].",
    pattern: "uḥibbu an + action. Swap the action; keep the frame.",
    examples: [
      { arabic: "أحب أن أقرأ", transliteration: "uḥibbu an aqraʾ", meaning: "I like to read" },
      { arabic: "أحب أن أتعلم", transliteration: "uḥibbu an ataʿallam", meaning: "I like to learn" },
    ],
  },
  uridu: {
    heardArabic: "أريد القهوة",
    heardTransliteration: "urīdu al-qahwa",
    usefulMeaning: "I want the coffee.",
    pattern: "urīdu + thing. Later: urīdu an + action (I want to…).",
    examples: [
      { arabic: "أريد كتاباً", transliteration: "urīdu kitāban", meaning: "I want a book" },
      { arabic: "لا أريد", transliteration: "lā urīdu", meaning: "I don't want" },
    ],
  },
  size: {
    heardArabic: "الكبيرة أم الصغيرة",
    heardTransliteration: "al-kabīra am al-ṣaghīra",
    usefulMeaning: "The large one or the small one?",
    pattern: "kabīr/kabīra = big. ṣaghīr/ṣaghīra = small. The extra -a often marks feminine nouns like qahwa.",
    examples: [
      { arabic: "القهوة الكبيرة", transliteration: "al-qahwa al-kabīra", meaning: "the large coffee" },
      { arabic: "القهوة الصغيرة", transliteration: "al-qahwa al-ṣaghīra", meaning: "the small coffee" },
    ],
  },
  indi: {
    heardArabic: "عندي أخ",
    heardTransliteration: "ʿindī akh",
    usefulMeaning: "I have a brother.",
    pattern: "ʿindī = I have (literally “at me”). ʿindī + person/thing.",
    examples: [
      { arabic: "عندي كتاب", transliteration: "ʿindī kitāb", meaning: "I have a book" },
      { arabic: "عندي أخت", transliteration: "ʿindī ukht", meaning: "I have a sister" },
    ],
  },
  lianna: {
    heardArabic: "لأن",
    heardTransliteration: "liʾanna",
    usefulMeaning: "because — a reason after an opinion or preference.",
    pattern: "Statement + liʾanna + reason. Lets you connect two thoughts.",
    examples: [
      {
        arabic: "أحب نيويورك لأن عائلتي هنا",
        transliteration: "uḥibbu New York liʾanna ʿāʾilatī hunā",
        meaning: "I like New York because my family is here",
      },
      {
        arabic: "أقرأ لأنّه مفيد",
        transliteration: "aqraʾ liʾannahu mufīd",
        meaning: "I read because it is useful",
      },
    ],
  },
  time: {
    heardArabic: "أستيقظ في السابعة",
    heardTransliteration: "astayqiẓu fī as-sābiʿa",
    usefulMeaning: "I wake up at seven.",
    pattern: "fī + time. astayqiẓu = I wake up.",
    examples: [
      { arabic: "في الثامنة", transliteration: "fī ath-thāmina", meaning: "at eight" },
      { arabic: "بعد ذلك", transliteration: "baʿda dhālik", meaning: "after that" },
    ],
  },
  farewell: {
    heardArabic: "إلى اللقاء",
    heardTransliteration: "ilā al-liqāʾ",
    usefulMeaning: "Until we meet / goodbye.",
    pattern: "A complete farewell you can reuse at the end of any conversation.",
    examples: [
      { arabic: "مع السلامة", transliteration: "maʿa as-salāma", meaning: "goodbye (go in safety)" },
    ],
  },
};

export function guessWhyKey(arabic: string | null | undefined) {
  if (!arabic) return null;
  if (/أنا|انا/.test(arabic) && !/اسم/.test(arabic) && !/من /.test(arabic)) return "ana";
  if (/اسم/.test(arabic)) return "ismi";
  if (/أحب أن|احب ان/.test(arabic)) return "uhibbu_an";
  if (/أريد|اريد/.test(arabic)) return "uridu";
  if (/كبير|صغير/.test(arabic)) return "size";
  if (/عندي/.test(arabic)) return "indi";
  if (/لأن|لان/.test(arabic)) return "lianna";
  if (/أستيقظ|السابعة|الثامنة/.test(arabic)) return "time";
  if (/سلام/.test(arabic)) return "greeting";
  if (/لقاء|سلامة/.test(arabic)) return "farewell";
  if (/من /.test(arabic)) return "min";
  return null;
}

export function explainWhy(
  key: string | null,
  sophistication: "beginner" | "intermediate" | "advanced" = "beginner",
  overheard?: { arabic?: string; transliteration?: string },
): WhyExplanation | null {
  const resolved = key && WHY[key] ? key : guessWhyKey(overheard?.arabic ?? null);
  if (!resolved) return null;
  const base = WHY[resolved];
  if (!base) return null;
  const heard = {
    ...base,
    heardArabic: overheard?.arabic || base.heardArabic,
    heardTransliteration: overheard?.transliteration || base.heardTransliteration,
  };
  if (sophistication === "advanced" && resolved === "ismi") {
    return {
      ...heard,
      depth: "advanced",
      pattern:
        "The attached ي is ياء المتكلم, the first-person singular possessive. ism + ī → ismī.",
    };
  }
  return { ...heard, depth: sophistication };
}

export function whySophistication(sessionCount: number) {
  if (sessionCount >= 8) return "advanced" as const;
  if (sessionCount >= 3) return "intermediate" as const;
  return "beginner" as const;
}
