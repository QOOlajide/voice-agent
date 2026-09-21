import { charactersFor } from "../content/characters";
import type { Character, CharacterId, ChoreographyPhase, SettingId } from "./types";

export function choreographyFor(
  settingId: SettingId,
  sessionCount: number,
): { characters: Character[]; phases: ChoreographyPhase[] } {
  if (settingId === "meet-someone" && sessionCount === 0) {
    return {
      characters: charactersFor(["yusuf", "sami"]),
      phases: FIRST_MEETING,
    };
  }
  if (settingId === "meet-someone") {
    return {
      characters: charactersFor(["yusuf", "sami"]),
      phases: RETURN_MEETING,
    };
  }
  return {
    characters: charactersFor(["yusuf"]),
    phases: genericPhases(settingId),
  };
}

export function primarySpeaker(characters: Character[]): CharacterId {
  return characters[0]?.id ?? "yusuf";
}

const FIRST_MEETING: ChoreographyPhase[] = [
  {
    id: "greet",
    speaker: "yusuf",
    intent:
      "Yusuf turns to the learner, waves, and greets in Arabic. If they freeze, one-job English: Hello. Then greet again. Do not explain the greeting. They may say nothing — continue.",
    modelItemIds: ["as_salamu"],
    productionItemId: "wa_alaykum",
    minModelsBeforeAsk: 0,
    nextOn: "continue",
  },
  {
    id: "self-name",
    speaker: "yusuf",
    intent:
      "Yusuf points to himself: أنا يوسف. Pulse Yusuf's name tag. Tiny clue: Me — Yusuf. Repeat أنا يوسف.",
    modelItemIds: ["ana"],
    minModelsBeforeAsk: 0,
    nextOn: "modeled",
  },
  {
    id: "other-name",
    speaker: "yusuf",
    intent: "Yusuf points to Sami: هو سامي. Pulse Sami's tag. Then back to himself: أنا يوسف.",
    modelItemIds: ["huwa", "ana"],
    minModelsBeforeAsk: 0,
    nextOn: "modeled",
  },
  {
    id: "ask-you",
    speaker: "yusuf",
    intent:
      "Yusuf looks at the learner: وأنت؟ Do not expect أنا + name until they have heard أنا يوسف with a referent. Rescue: point, then You?, then أنا…",
    modelItemIds: ["wa_anta"],
    productionItemId: "ana",
    minModelsBeforeAsk: 1,
    socialReason: "Yusuf still does not know who they are.",
    nextOn: "learner-communicated",
  },
  {
    id: "social-enter",
    speaker: "sami",
    intent:
      "Sami walks over and greets: السلام عليكم. Same structure, new social reason — a new person arrived.",
    modelItemIds: ["as_salamu"],
    enter: "sami",
    minModelsBeforeAsk: 0,
    nextOn: "continue",
  },
  {
    id: "social-confirm",
    speaker: "sami",
    intent: "Sami points at Yusuf: يوسف؟ Yusuf nods. Then Sami looks at the learner: وأنت؟",
    modelItemIds: ["wa_anta"],
    productionItemId: "ana",
    minModelsBeforeAsk: 1,
    socialReason: "Sami genuinely needs to know who this person is.",
    nextOn: "learner-communicated",
  },
  {
    id: "model-name-q",
    speaker: "sami",
    intent:
      "Do not suddenly expect ما اسمك؟ as production. Sami asks Yusuf ما اسمك؟ Yusuf answers immediately اسمي يوسف. Pulse Yusuf's tag.",
    modelItemIds: ["ma_ismuka", "ismi"],
    minModelsBeforeAsk: 0,
    nextOn: "modeled",
  },
  {
    id: "model-name-q-2",
    speaker: "yusuf",
    intent: "Yusuf asks Sami ما اسمك؟ Sami: اسمي سامي. Pulse Sami's tag. The question has now been heard twice, followed by names twice.",
    modelItemIds: ["ma_ismuka", "ismi"],
    minModelsBeforeAsk: 0,
    nextOn: "modeled",
  },
  {
    id: "ask-name",
    speaker: "yusuf",
    intent:
      "Yusuf turns to the learner: ما اسمك؟ Rescue: look at name-tag area, then اسمك…؟, then Your name?, then اسمي…",
    modelItemIds: ["ma_ismuka"],
    productionItemId: "ismi",
    minModelsBeforeAsk: 2,
    socialReason: "They have heard the question and the answer frame twice.",
    nextOn: "learner-communicated",
  },
  {
    id: "open",
    speaker: "yusuf",
    intent:
      "Recast naturally (تشرفت يا [name]) and continue the meeting. Same method for anything new: model with your own life, tiny clue only where the scene cannot, retrieve before reteaching.",
    modelItemIds: ["tasharraftu"],
    minModelsBeforeAsk: 0,
    nextOn: "continue",
  },
];

const RETURN_MEETING: ChoreographyPhase[] = [
  {
    id: "greet",
    speaker: "yusuf",
    intent: "Greet in Arabic. Retrieve the return greeting before reteaching it.",
    modelItemIds: ["as_salamu"],
    productionItemId: "wa_alaykum",
    minModelsBeforeAsk: 0,
    nextOn: "learner-communicated",
  },
  {
    id: "retrieve-name",
    speaker: "sami",
    intent: "Sami joins. New social reason to reuse أنا / اسمي. Do not reteach if they produce.",
    modelItemIds: [],
    productionItemId: "ismi",
    minModelsBeforeAsk: 0,
    enter: "sami",
    socialReason: "A second person needs the name again.",
    nextOn: "learner-communicated",
  },
  {
    id: "open",
    speaker: "yusuf",
    intent: "Retrieve known frames from the learner's life. Introduce at most one new move, modeled first.",
    modelItemIds: [],
    minModelsBeforeAsk: 1,
    nextOn: "continue",
  },
];

function genericPhases(settingId: SettingId): ChoreographyPhase[] {
  const introduceId =
    settingId === "cafe"
      ? "uridu"
      : settingId === "family"
        ? "indi"
        : settingId === "hobbies"
          ? "lianna"
          : "askunu_fi";

  return [
    {
      id: "greet",
      speaker: "yusuf",
      intent: "Greet in Arabic. Retrieve before reteaching.",
      modelItemIds: ["as_salamu"],
      productionItemId: "wa_alaykum",
      minModelsBeforeAsk: 0,
      nextOn: "learner-communicated",
    },
    {
      id: "model-new",
      speaker: "yusuf",
      intent: `Model the new move with YOUR life before asking. Item: ${introduceId}. Tiny English only if the scene cannot carry the meaning.`,
      modelItemIds: [introduceId],
      minModelsBeforeAsk: 0,
      nextOn: "modeled",
    },
    {
      id: "ask-new",
      speaker: "yusuf",
      intent: "Ask so they have a real reason to use the same structure. Climb the rescue ladder on silence. Recast, never quiz.",
      modelItemIds: [],
      productionItemId: introduceId,
      minModelsBeforeAsk: 1,
      nextOn: "learner-communicated",
    },
    {
      id: "open",
      speaker: "yusuf",
      intent: "Stay in the world. Retrieve known language. One new move at most.",
      modelItemIds: [],
      minModelsBeforeAsk: 0,
      nextOn: "continue",
    },
  ];
}

export function phaseIndex(phases: ChoreographyPhase[], id: string) {
  const index = phases.findIndex((phase) => phase.id === id);
  return index < 0 ? 0 : index;
}
