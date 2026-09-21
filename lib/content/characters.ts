import type { Character, CharacterId } from "../pedagogy/types";

export const CHARACTERS: Record<Exclude<CharacterId, "learner">, Character> = {
  yusuf: {
    id: "yusuf",
    nameEnglish: "Yusuf",
    nameArabic: "يوسف",
    nameTransliteration: "Yūsuf",
    tone: "sand",
  },
  sami: {
    id: "sami",
    nameEnglish: "Sami",
    nameArabic: "سامي",
    nameTransliteration: "Sāmī",
    tone: "blue",
  },
};

export function characterById(id: CharacterId): Character | null {
  if (id === "learner") return null;
  return CHARACTERS[id];
}

export function charactersFor(ids: CharacterId[]): Character[] {
  return ids
    .map((id) => characterById(id))
    .filter((character): character is Character => Boolean(character));
}
