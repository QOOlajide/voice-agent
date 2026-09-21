export type LanguageItemType =
  | "magic-sentence"
  | "vocabulary"
  | "connector"
  | "question-word"
  | "preposition"
  | "reaction"
  | "grammar-pattern"
  | "phrase";

export type MasteryState =
  | "new"
  | "introduced"
  | "recognized"
  | "scaffolded-production"
  | "supported-production"
  | "unsupported-production"
  | "spontaneous-use"
  | "automatic";

export type RescueRung =
  | "wait"
  | "contextual-cue"
  | "arabic-narrowing"
  | "tiny-clue"
  | "response-starter";

export type ScaffoldType =
  | "none"
  | "visual"
  | "contextual-cue"
  | "arabic-narrowing"
  | "tiny-clue"
  | "response-starter"
  | "response-frame"
  | "transliteration"
  | "contextual-vocabulary"
  | "native-anchor"
  | "full-translation";

export type CharacterId = "yusuf" | "sami" | "learner";

export type GestureKind =
  | "none"
  | "wave"
  | "point-self"
  | "point-other"
  | "point-learner"
  | "nod";

export type SceneProximity = "absent" | "far" | "near";

export type SceneGesture = {
  kind: GestureKind;
  target: CharacterId;
};

export type SceneState = {
  speaker: CharacterId | null;
  lookAt: CharacterId | null;
  gesture: SceneGesture | null;
  pulsing: CharacterId | null;
  present: CharacterId[];
  proximity: Record<CharacterId, SceneProximity>;
  learnerGivenName?: string;
};

export type ScenePatch = {
  speaker?: CharacterId;
  lookAt?: CharacterId | null;
  gestureKind?: GestureKind;
  gestureTarget?: CharacterId;
  pulseNameTag?: CharacterId | null;
  enter?: CharacterId;
  learnerGivenName?: string;
};

export type Character = {
  id: CharacterId;
  nameEnglish: string;
  nameArabic: string;
  nameTransliteration: string;
  tone: "sand" | "blue";
};

export type CommunicativeFunction =
  | "return-greeting"
  | "identify-self"
  | "give-name"
  | "give-origin"
  | "give-residence"
  | "express-like"
  | "express-want"
  | "give-possession"
  | "give-reason"
  | "ask-back"
  | "farewell"
  | "free";

export type VisualKind =
  | "agent-identity"
  | "place"
  | "action"
  | "selection"
  | "possession"
  | "relation"
  | "atmosphere";

export type VisualContext = {
  kind: VisualKind;
  id: string;
  labelArabic?: string;
  labelTransliteration?: string;
  caption?: string;
};

export type ContextualVocab = {
  id: string;
  transliteration: string;
  arabic: string;
  gloss: string;
  cue: string;
};

export type Scaffold = {
  required: boolean;
  types: ScaffoldType[];
  transliteration?: string;
  responseFrame?: string;
  responseStarter?: string | null;
  arabicNarrowing?: string | null;
  tinyClue?: string | null;
  nativeLanguageAnchor?: string | null;
  fullTranslation?: string | null;
  visualContext?: VisualContext | null;
  vocabularyOptions?: ContextualVocab[];
  rescueRung?: RescueRung;
};

export type AgentResponseContract = {
  spokenArabic: string;
  teachingIntent: string;
  knownLanguageUsed: string[];
  newLanguageIntroduced: string[];
  expectedCommunicativeFunction: CommunicativeFunction | null;
  scaffold: Scaffold;
  retrievalTargets: string[];
  potentialLearningMoments: LearningMomentType[];
  whyKey: string | null;
  visual: VisualContext | null;
  scene: SceneState | null;
};

export type LearnerLanguageItem = {
  id: string;
  type: LanguageItemType;
  mastery: MasteryState;
  recognitionConfidence: number;
  productionConfidence: number;
  spontaneousConfidence: number;
  scaffoldLevel: number;
  requiresTransliteration: boolean;
  requiresNativeLanguage: boolean;
  encounterCount: number;
  modeledCount: number;
  heardWithReferent: number;
  successfulRetrievals: number;
  failedRetrievals: number;
  lastEncounteredAt: string | null;
  nextReviewAt: string | null;
};

export type LearningMomentType =
  | "modeled"
  | "vocabulary-discovery"
  | "structure-discovery"
  | "successful-inference"
  | "scaffolded-production"
  | "unsupported-retrieval"
  | "spontaneous-use"
  | "correction"
  | "code-switch"
  | "why-insight"
  | "learner-question"
  | "successful-follow-up"
  | "conversational-initiative";

export type LearningMoment = {
  id: string;
  type: LearningMomentType;
  languageItemIds: string[];
  arabic?: string;
  transliteration?: string;
  meaning?: string;
  note?: string;
  at: string;
};

export type Turn = {
  id: string;
  speaker: "agent" | "learner";
  characterId?: CharacterId;
  transcript: string;
  startedAt: string;
  endedAt: string;
  detectedLanguage: "ar" | "en" | "mixed" | "unknown";
  scaffoldUsed: ScaffoldType[];
  communicativeFunction?: CommunicativeFunction;
};

export type WhyExample = {
  arabic: string;
  transliteration: string;
  meaning: string;
};

export type WhyExplanation = {
  heardArabic: string;
  heardTransliteration: string;
  usefulMeaning: string;
  pattern: string;
  examples: WhyExample[];
  depth: "beginner" | "intermediate" | "advanced";
};

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type ReviewCard = {
  id: string;
  languageItemId: string;
  transliteration: string;
  arabic: string;
  meaning: string;
  pattern?: string;
  related?: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  personal: boolean;
};

export type SessionSummaryLine = {
  id: string;
  text: string;
};

export type LearnerProfile = {
  id: string;
  givenName?: string;
  origin?: string;
  originArabic?: string;
  likes: string[];
  completedSettingIds: string[];
  sessionCount: number;
  languageItems: Record<string, LearnerLanguageItem>;
  reviewCards: ReviewCard[];
  moments: LearningMoment[];
};

export type SettingId =
  | "meet-someone"
  | "cafe"
  | "hobbies"
  | "family"
  | "daily-routine";

export type ConversationSetting = {
  id: SettingId;
  title: string;
  world: string;
  communicativeNeeds: string[];
  visualIds: string[];
  characterIds: CharacterId[];
  magicSentenceIds: string[];
  whyKeys: string[];
  vocabularyOptions: ContextualVocab[];
};

export type PlannedItem = {
  id: string;
  frame?: string;
  meaning?: string;
  reason: string;
};

export type AgentPersona = {
  name: string;
  nameArabic: string;
  originArabic: string;
  originEnglish: string;
  likes: string[];
};

export type KnownFrameSnapshot = {
  id: string;
  frame: string;
  productionConfidence: number;
  requiresTransliteration: boolean;
  requiresNativeLanguage: boolean;
};

export type LearnerSnapshot = {
  givenName?: string;
  origin?: string;
  likes: string[];
  sessionCount: number;
  knownFrames: KnownFrameSnapshot[];
};

export type ChoreographyPhase = {
  id: string;
  speaker: CharacterId;
  intent: string;
  modelItemIds: string[];
  productionItemId?: string;
  minModelsBeforeAsk: number;
  socialReason?: string;
  enter?: CharacterId;
  nextOn: "continue" | "learner-communicated" | "modeled";
};

export type SessionPlan = {
  settingId: SettingId;
  settingTitle: string;
  world: string;
  communicativeNeeds: string[];
  visualIds: string[];
  characters: Character[];
  choreography: ChoreographyPhase[];
  retrieve: PlannedItem[];
  strengthen: PlannedItem[];
  introduce: PlannedItem[];
  conversationalGoal: string;
  persona: AgentPersona;
  learner: LearnerSnapshot;
  utteranceLength: "short" | "medium" | "long";
  controlShare: "agent-led" | "agent-led-with-askback" | "shared" | "learner-led";
};
