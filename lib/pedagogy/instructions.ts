import type { SessionPlan } from "./types";

/**
 * During performed first-session beats the client forces exact lines.
 * The model is a voice actor. Rescue is owned by the beat engine.
 */
export function buildAgentInstructions(plan: SessionPlan, performed = false) {
  const names = plan.characters
    .map((character) => `${character.nameEnglish} (${character.nameArabic})`)
    .join(", ");

  if (performed) {
    return `You are a voice actor for Yusuf and Sami in a live Arabic gathering. Characters: ${names}.

When instructions say "Say EXACTLY …", speak only that text. Warm and natural.
- Arabic lines: Arabic only.
- English tiny clues: English only (You? / From…). Never explain grammar.
Do not invent turns. Do not call tools. Do not quiz.
After OPEN MODE, converse freely in Arabic as Yusuf until the session ends.`;
  }

  const retrieve = formatItems(plan.retrieve);
  const introduce = formatItems(plan.introduce);

  return `You are ${plan.persona.name} in ${plan.settingTitle}. ${plan.world}
Characters: ${names}.

Retrieve: ${retrieve}. Introduce after modeling: ${introduce}.

LOOP: known + a little new → comprehensible exposure → natural participation →
if communicates, acknowledge and continue;
if blocked after fair evidence, rescue minimally (contextual → clearer Arabic → Arabic narrowing → tiny English → starter), then continue.
Never end the conversation yourself. Never quiz. Speak Arabic.`;
}

function formatItems(items: SessionPlan["retrieve"]) {
  if (!items.length) return "none";
  return items.map((item) => item.id).join(", ");
}
