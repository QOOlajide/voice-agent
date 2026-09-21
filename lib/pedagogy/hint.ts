import { decideScaffold } from "./scaffold-policy";
import {
  nextRescueLevel,
  rescueInstruction,
  rescueTargetFor,
  scenePatchForRung,
  type RescueFailure,
  nextRescueLevelForFailure,
} from "./rescue-ladder";
import type { CharacterId, ChoreographyPhase, Scaffold } from "./types";

export function nextHintLevel(current: number, sequenceLength = 4) {
  return nextRescueLevel(current, sequenceLength);
}

export function scaffoldForHint(
  productionItemId: string | undefined,
  hintLevel: number,
  speakerName?: string,
): Scaffold {
  return decideScaffold({
    itemId: productionItemId,
    hintLevel,
    speakerName,
  });
}

export function hintInstructionFor(
  phase: ChoreographyPhase | undefined,
  hintLevel: number,
  speaker: CharacterId,
) {
  const itemId = phase?.productionItemId ?? phase?.modelItemIds[0];
  if (!itemId) {
    return "The learner is quiet. Stay in character. Repeat the last Arabic once, warmly, then wait. No English yet.";
  }
  const target = rescueTargetFor(itemId);
  return rescueInstruction(target, hintLevel, speaker);
}

export function hintScenePatch(
  phase: ChoreographyPhase | undefined,
  hintLevel: number,
  speaker: CharacterId,
) {
  const itemId = phase?.productionItemId ?? phase?.modelItemIds[0];
  if (!itemId) return null;
  return scenePatchForRung(rescueTargetFor(itemId), hintLevel, speaker);
}

export function escalateForFailure(
  productionItemId: string | undefined,
  current: number,
  failure: RescueFailure,
) {
  if (!productionItemId) return current + 1;
  const target = rescueTargetFor(productionItemId);
  return nextRescueLevelForFailure(target.sequence, current, failure);
}

export function hintInstruction(hintLevel: number, scaffold: Scaffold) {
  const clue = scaffold.tinyClue ?? scaffold.nativeLanguageAnchor ?? "";
  const starter = scaffold.responseStarter ?? scaffold.responseFrame ?? "";
  const narrowing = scaffold.arabicNarrowing ?? "";
  if (scaffold.rescueRung === "contextual-cue" || hintLevel <= 1) {
    return "The learner froze. Contextual cue only: look / point / pulse. No English.";
  }
  if (scaffold.rescueRung === "arabic-narrowing") {
    return `Escalate once: Arabic narrowing only. Speak "${narrowing}". No English.`;
  }
  if (scaffold.rescueRung === "tiny-clue") {
    return `Escalate once: one-job English "${clue}". Then Arabic again. Do not translate the whole turn.`;
  }
  if (scaffold.rescueRung === "response-starter") {
    return `Last live rescue: speak the starter "${starter}" and wait for them to finish.`;
  }
  return "Wait. Do not rescue yet.";
}
