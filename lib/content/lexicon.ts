import { normalize } from "../pedagogy/normalize";

export type Place = { keys: string[]; arabic: string; english: string };
export type Hobby = { keys: string[]; arabicVerb: string; english: string; itemId: string };

export const PLACES: Place[] = [
  { keys: ["nigeria", "نيجيريا", "nījīriyā", "nijiriya"], arabic: "نيجيريا", english: "Nigeria" },
  { keys: ["egypt", "مصر", "miṣr", "misr"], arabic: "مصر", english: "Egypt" },
  { keys: ["america", "usa", "united states", "أمريكا", "الولايات"], arabic: "أمريكا", english: "America" },
  { keys: ["britain", "england", "uk", "بريطانيا"], arabic: "بريطانيا", english: "Britain" },
  { keys: ["canada", "كندا"], arabic: "كندا", english: "Canada" },
  { keys: ["france", "فرنسا"], arabic: "فرنسا", english: "France" },
  { keys: ["lebanon", "لبنان"], arabic: "لبنان", english: "Lebanon" },
  { keys: ["syria", "سوريا"], arabic: "سوريا", english: "Syria" },
  { keys: ["jordan", "الأردن", "اردن"], arabic: "الأردن", english: "Jordan" },
  { keys: ["morocco", "المغرب"], arabic: "المغرب", english: "Morocco" },
  { keys: ["saudi", "السعودية"], arabic: "السعودية", english: "Saudi Arabia" },
  { keys: ["palestine", "فلسطين"], arabic: "فلسطين", english: "Palestine" },
  { keys: ["india", "الهند"], arabic: "الهند", english: "India" },
  { keys: ["pakistan", "باكستان"], arabic: "باكستان", english: "Pakistan" },
  { keys: ["china", "الصين"], arabic: "الصين", english: "China" },
  { keys: ["japan", "اليابان"], arabic: "اليابان", english: "Japan" },
  { keys: ["new york", "نيويورك"], arabic: "نيويورك", english: "New York" },
  { keys: ["boston", "بوسطن"], arabic: "بوسطن", english: "Boston" },
];

export const HOBBIES: Hobby[] = [
  { keys: ["read", "reading", "quran", "qur", "أقرأ", "اقرا", "aqra", "kitab", "كتاب"], arabicVerb: "تقرأ", english: "read", itemId: "aqra" },
  { keys: ["play", "football", "soccer", "ألعب", "العب", "alʿab", "alab", "كرة"], arabicVerb: "تلعب كرة القدم", english: "play football", itemId: "alab" },
  { keys: ["learn", "study", "أتعلم", "ataʿallam", "ataallam"], arabicVerb: "تتعلم", english: "learn", itemId: "ataallam" },
  { keys: ["swim", "swimming", "أسبح", "asbah", "asbaḥ"], arabicVerb: "تسبح", english: "swim", itemId: "asbah" },
  { keys: ["travel", "سافر", "usafir", "usāfir"], arabicVerb: "تسافر", english: "travel", itemId: "usafir" },
  { keys: ["write", "أكتب", "aktub"], arabicVerb: "تكتب", english: "write", itemId: "aktub" },
  { keys: ["listen", "music", "أسمع", "asmaʿ"], arabicVerb: "تستمع", english: "listen", itemId: "astami" },
];

export const LIKES_VOCAB = [
  { id: "alab", transliteration: "alʿab", arabic: "ألعب", gloss: "I play", cue: "⚽" },
  { id: "aqra", transliteration: "aqraʾ", arabic: "أقرأ", gloss: "I read", cue: "📖" },
  { id: "ataallam", transliteration: "ataʿallam", arabic: "أتعلم", gloss: "I learn", cue: "🎓" },
  { id: "asbah", transliteration: "asbaḥ", arabic: "أسبح", gloss: "I swim", cue: "🏊" },
];

export const WANT_VOCAB = [
  { id: "qahwa", transliteration: "qahwa", arabic: "قهوة", gloss: "coffee", cue: "☕" },
  { id: "shay", transliteration: "shāy", arabic: "شاي", gloss: "tea", cue: "🍵" },
  { id: "ma", transliteration: "māʾ", arabic: "ماء", gloss: "water", cue: "💧" },
];

export function matchPlace(text: string): Place | undefined {
  const n = normalize(text);
  return PLACES.find((place) => place.keys.some((key) => n.includes(key)));
}

export function matchHobby(text: string): Hobby | undefined {
  const n = normalize(text);
  return HOBBIES.find((hobby) => hobby.keys.some((key) => n.includes(key)));
}

export function extractAfter(text: string, markers: string[]) {
  const n = normalize(text);
  for (const marker of markers) {
    const index = n.indexOf(marker);
    if (index >= 0) {
      const rest = n.slice(index + marker.length).trim();
      if (rest) return rest.split(" ")[0] ? n.slice(index + marker.length).trim() : rest;
    }
  }
  return undefined;
}
