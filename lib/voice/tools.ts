export const REALTIME_TOOLS = [
  {
    type: "function" as const,
    name: "stage_scene",
    description:
      "Show who is speaking and what the body is doing. Call this every agent turn. One voice; the UI carries identity.",
    parameters: {
      type: "object",
      properties: {
        speaker: { type: "string", enum: ["yusuf", "sami"] },
        lookAt: { type: "string", enum: ["yusuf", "sami", "learner"] },
        gestureKind: {
          type: "string",
          enum: ["none", "wave", "point-self", "point-other", "point-learner", "nod"],
        },
        gestureTarget: { type: "string", enum: ["yusuf", "sami", "learner"] },
        pulseNameTag: { type: "string", enum: ["yusuf", "sami", "learner"] },
        enter: { type: "string", enum: ["yusuf", "sami"] },
        learnerGivenName: { type: "string" },
      },
      required: ["speaker"],
    },
  },
  {
    type: "function" as const,
    name: "note_modeling",
    description:
      "Record that you just demonstrated a structure with a visible referent (pointing, name tag, object). Call this instead of expecting production.",
    parameters: {
      type: "object",
      properties: {
        languageItemIds: { type: "array", items: { type: "string" } },
        withReferent: { type: "boolean" },
      },
      required: ["languageItemIds"],
    },
  },
  {
    type: "function" as const,
    name: "advance_phase",
    description: "Move to the next hidden social phase when the current communicative goal is done.",
    parameters: {
      type: "object",
      properties: {
        phaseId: { type: "string" },
      },
      required: ["phaseId"],
    },
  },
  {
    type: "function" as const,
    name: "present_scaffold",
    description:
      "Show the current rescue rung only. Tiny clues are one-job English. Never dump a full translation on a retrieval attempt.",
    parameters: {
      type: "object",
      properties: {
        types: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "visual",
              "contextual-cue",
              "arabic-narrowing",
              "tiny-clue",
              "response-starter",
              "response-frame",
              "transliteration",
              "contextual-vocabulary",
              "native-anchor",
              "full-translation",
            ],
          },
        },
        responseFrame: { type: "string" },
        responseStarter: { type: "string" },
        arabicNarrowing: { type: "string" },
        tinyClue: { type: "string" },
        transliteration: { type: "string" },
        nativeLanguageAnchor: { type: "string" },
        fullTranslation: { type: "string" },
        whyKey: {
          type: "string",
          description: "Pattern key: greeting, ana, ismi, min, uhibbu_an, uridu, size, indi, lianna, time, farewell",
        },
        vocabularyOptions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              transliteration: { type: "string" },
              arabic: { type: "string" },
              gloss: { type: "string" },
              cue: { type: "string" },
            },
            required: ["id", "transliteration", "arabic", "gloss"],
          },
        },
      },
      required: ["types"],
    },
  },
  {
    type: "function" as const,
    name: "set_visual",
    description:
      "Ground the current utterance in an environment or object. Use an id from the setting’s visual list. Demonstration, not a picture dictionary.",
    parameters: {
      type: "object",
      properties: {
        visualId: { type: "string" },
      },
      required: ["visualId"],
    },
  },
  {
    type: "function" as const,
    name: "clear_scaffold",
    description: "Hide production help once the learner is speaking or after they succeed.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function" as const,
    name: "record_moment",
    description: "Record evidence about what the learner just did. Call this on every meaningful learner turn.",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: [
            "modeled",
            "vocabulary-discovery",
            "structure-discovery",
            "successful-inference",
            "scaffolded-production",
            "unsupported-retrieval",
            "spontaneous-use",
            "correction",
            "code-switch",
            "why-insight",
            "learner-question",
            "successful-follow-up",
            "conversational-initiative",
          ],
        },
        languageItemIds: { type: "array", items: { type: "string" } },
        arabic: { type: "string" },
        transliteration: { type: "string" },
        meaning: { type: "string" },
        note: { type: "string" },
        learnerName: { type: "string" },
        learnerOrigin: { type: "string" },
        learnerLike: { type: "string" },
      },
      required: ["type", "languageItemIds"],
    },
  },
];
