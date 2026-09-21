import { magicSentence } from "./magic-sentences";
import { rescueTargetFor, rungAt, scaffoldForRung } from "./rescue-ladder";
import type { LearnerLanguageItem, Scaffold } from "./types";

export type ScaffoldDecisionInput = {
  itemId?: string;
  item?: LearnerLanguageItem;
  hintLevel: number;
  speakerName?: string;
};

/**
 * Live help is the rescue ladder. Full translation is not a live rung.
 * Introduction clues are spoken by the character, not decided here.
 */
export function decideScaffold(input: ScaffoldDecisionInput): Scaffold {
  if (!input.itemId) {
    return { required: false, types: ["none"], rescueRung: "wait" };
  }
  const target = rescueTargetFor(input.itemId, input.speakerName);
  return scaffoldForRung(target, input.hintLevel);
}

export function currentRung(itemId: string | undefined, hintLevel: number) {
  if (!itemId) return "wait" as const;
  const sentence = magicSentence(itemId);
  return rungAt(sentence?.rescueSequence ?? [], hintLevel);
}
