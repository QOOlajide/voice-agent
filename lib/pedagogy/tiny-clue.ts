import { CHARACTERS } from "../content/characters";
import { magicSentence } from "./magic-sentences";
import type { LearnerLanguageItem } from "./types";

export function fillClue(template: string | undefined, speakerId?: string) {
  if (!template) return null;
  const character = speakerId === "sami" ? CHARACTERS.sami : CHARACTERS.yusuf;
  return template
    .replace("{name}", character.nameEnglish)
    .replace("{place}", character.id === "yusuf" ? "Egypt" : "Jordan");
}

export function introductionClue(
  itemId: string,
  item: LearnerLanguageItem | undefined,
  speakerId?: string,
) {
  const sentence = magicSentence(itemId);
  if (!sentence) return null;
  const heard = (item?.modeledCount ?? 0) + (item?.encounterCount ?? 0);
  if (heard > 0) return null;
  if (!sentence.tinyClueOnIntroduce) return null;
  return fillClue(sentence.modelClue ?? sentence.tinyClue, speakerId);
}

export function shouldSpeakIntroductionClue(itemId: string, item?: LearnerLanguageItem) {
  return Boolean(introductionClue(itemId, item));
}
