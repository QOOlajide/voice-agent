import type { Scaffold } from "./types";

/**
 * Translation is scaffolding, not the experience.
 * Tiny clues are not translations: they name the job of the utterance.
 * Do not translate merely because language is new.
 */
export function shouldExposeNativeLanguage(scaffold: Scaffold) {
  return (
    scaffold.types.includes("tiny-clue") ||
    scaffold.types.includes("native-anchor") ||
    scaffold.types.includes("full-translation")
  );
}

export function rememberTranslationNeed(required: boolean) {
  return required;
}

export function isFullTranslation(scaffold: Scaffold) {
  return scaffold.types.includes("full-translation");
}
