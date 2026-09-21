import type { Scaffold, ScenePatch, SessionPlan } from "../pedagogy/types";

export type ConnectionState = "idle" | "connecting" | "connected" | "disconnected" | "error";

export type VoiceAgentHandlers = {
  onConnectionState?: (state: ConnectionState) => void;
  onAgentSpeaking?: (speaking: boolean) => void;
  onLearnerSpeaking?: (speaking: boolean) => void;
  onTranscript?: (turn: { speaker: "agent" | "learner"; text: string }) => void;
  onScaffold?: (scaffold: Scaffold & { whyKey?: string | null }) => void;
  onClearScaffold?: () => void;
  onVisual?: (visualId: string) => void;
  onScene?: (patch: ScenePatch) => void;
  onModeling?: (payload: { languageItemIds: string[]; withReferent: boolean }) => void;
  onPhase?: (phaseId: string) => void;
  onMoment?: (payload: RecordedMoment) => void;
  onError?: (message: string) => void;
};

export type RecordedMoment = {
  type: string;
  languageItemIds: string[];
  arabic?: string;
  transliteration?: string;
  meaning?: string;
  note?: string;
  learnerName?: string;
  learnerOrigin?: string;
  learnerLike?: string;
};

export type VoiceAgent = {
  connect(opts: {
    ephemeralKey: string;
    audioElement: HTMLAudioElement;
    /** When true, do not auto-start a free response — the beat engine drives speech. */
    suppressAutoResponse?: boolean;
  }): Promise<void>;
  pause(): void;
  resume(): void;
  sendHint(instruction: string): void;
  /** Cancel any in-flight response, then speak from these instructions only. */
  speakExact(instruction: string): void;
  /** Toggle whether learner speech auto-triggers a model response. */
  setLearnerCreatesResponse(enabled: boolean): void;
  disconnect(): void;
};

export type SessionTokenRequest = {
  plan: SessionPlan;
};
