import { MAGIC_SENTENCES } from "./magic-sentences";

export function responseFrameFor(id: string) {
  return MAGIC_SENTENCES[id]?.frame;
}

export function fadeFrame(id: string, productionConfidence: number) {
  const sentence = MAGIC_SENTENCES[id];
  if (!sentence) return undefined;
  if (productionConfidence >= 0.7) return undefined;
  if (productionConfidence >= 0.5 && sentence.fadedFrame) return sentence.fadedFrame;
  return sentence.frame;
}
