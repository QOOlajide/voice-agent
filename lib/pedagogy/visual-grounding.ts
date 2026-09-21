import type { VisualContext } from "./types";

export const VISUALS: Record<string, VisualContext> = {
  gathering: {
    kind: "atmosphere",
    id: "gathering",
    caption: "A small gathering",
  },
  egypt: {
    kind: "place",
    id: "egypt",
    labelArabic: "مصر",
    labelTransliteration: "Miṣr",
    caption: "Egypt",
  },
  saudi: {
    kind: "place",
    id: "saudi",
    labelArabic: "السعودية",
    labelTransliteration: "as-Suʿūdiyya",
    caption: "Saudi Arabia",
  },
  nigeria: {
    kind: "place",
    id: "nigeria",
    labelArabic: "نيجيريا",
    labelTransliteration: "Nījīriyā",
    caption: "Nigeria",
  },
  football: {
    kind: "action",
    id: "football",
    labelArabic: "كرة القدم",
    labelTransliteration: "kurat al-qadam",
    caption: "Playing football",
  },
  reading: {
    kind: "action",
    id: "reading",
    labelArabic: "قراءة",
    labelTransliteration: "qirāʾa",
    caption: "Reading",
  },
  coffeeLarge: {
    kind: "selection",
    id: "coffee-large",
    labelArabic: "الكبيرة",
    labelTransliteration: "al-kabīra",
    caption: "The large coffee",
  },
  coffeeSmall: {
    kind: "selection",
    id: "coffee-small",
    labelArabic: "الصغيرة",
    labelTransliteration: "al-ṣaghīra",
    caption: "The small coffee",
  },
  brother: {
    kind: "relation",
    id: "brother",
    labelArabic: "أخ",
    labelTransliteration: "akh",
    caption: "A brother",
  },
  morning: {
    kind: "atmosphere",
    id: "morning",
    labelArabic: "صباح",
    labelTransliteration: "ṣabāḥ",
    caption: "Early morning",
  },
};

export function visualFor(id: string): VisualContext | null {
  return VISUALS[id] ?? Object.values(VISUALS).find((visual) => visual.id === id) ?? null;
}
