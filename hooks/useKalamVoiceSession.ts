"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applyMoment, applyRecordedFields } from "@/lib/pedagogy/apply-moments";
import { nowIso, uid } from "@/lib/pedagogy/normalize";
import {
  exactSpeechInstruction,
  firstSessionBeats,
  openConversationInstruction,
  type PerformedBeat,
  type RescueStep,
} from "@/lib/pedagogy/performed-beats";
import {
  detectLanguage,
  observeParticipation,
} from "@/lib/pedagogy/participation-observe";
import { applyScenePatch, emptyScene } from "@/lib/pedagogy/scene-state";
import type {
  LearnerProfile,
  LearningMoment,
  LearningMomentType,
  Scaffold,
  SceneState,
  SessionPlan,
  Turn,
  VisualContext,
} from "@/lib/pedagogy/types";
import { visualFor } from "@/lib/pedagogy/visual-grounding";
import { guessWhyKey } from "@/lib/pedagogy/why-policy";
import { createOpenAIRealtimeAgent } from "@/lib/voice/openai-realtime";
import type { ConnectionState, RecordedMoment, VoiceAgent } from "@/lib/voice/types";

type LiveScaffold = Scaffold & { whyKey?: string | null };

export type SessionSnapshot = {
  moments: LearningMoment[];
  turns: Turn[];
  profile: LearnerProfile;
};

export type UseKalamVoiceSessionArgs = {
  plan: SessionPlan;
  profile: LearnerProfile;
  audioElement: HTMLAudioElement | null;
};

type EngineMode = "script" | "open";
type ScriptPhase = "idle" | "speaking" | "holding" | "waiting" | "rescuing" | "recasting";

function clearTimer(ref: { current: number | null }) {
  if (ref.current != null) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

export function useKalamVoiceSession({
  plan,
  profile,
  audioElement,
}: UseKalamVoiceSessionArgs) {
  const useScript =
    plan.settingId === "meet-someone" && plan.learner.sessionCount === 0;
  const beatsRef = useRef<PerformedBeat[]>(useScript ? firstSessionBeats() : []);

  const [connection, setConnection] = useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [learnerSpeaking, setLearnerSpeaking] = useState(false);
  const [encouraging, setEncouraging] = useState(false);
  const [scaffold, setScaffold] = useState<LiveScaffold | null>(null);
  const [visual, setVisual] = useState<VisualContext | null>(
    visualFor(plan.visualIds[0] ?? "gathering"),
  );
  const [scene, setScene] = useState<SceneState>(() =>
    emptyScene(plan.characters.map((c) => c.id)),
  );
  const [whyOpen, setWhyOpen] = useState(false);
  const [beatId, setBeatId] = useState(beatsRef.current[0]?.id ?? "open");
  const [lastAgentArabic, setLastAgentArabic] = useState("");
  const [lastWhyKey, setLastWhyKey] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);

  const agentRef = useRef<VoiceAgent | null>(null);
  const profileRef = useRef(profile);
  const momentsRef = useRef<LearningMoment[]>([]);
  const turnsRef = useRef<Turn[]>([]);
  const sceneRef = useRef(scene);
  const endedRef = useRef(false);
  const whyOpenRef = useRef(false);
  const agentSpeakingRef = useRef(false);
  const learnerSpeakingRef = useRef(false);
  const modeRef = useRef<EngineMode>(useScript ? "script" : "open");
  const phaseRef = useRef<ScriptPhase>("idle");
  const beatIndexRef = useRef(0);
  const rescueIndexRef = useRef(-1);
  const silenceStartedRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const rescueLineIndexRef = useRef(0);
  const pendingStructuresRef = useRef<string[]>([]);
  const learnerNameRef = useRef(profile.givenName);
  const learnerOriginRef = useRef(profile.origin);
  const lastLearnerRef = useRef("");
  const speechArmedRef = useRef(false);
  const heardSpeechRef = useRef(false);
  const runBeatAtRef = useRef<(index: number) => void>(() => {});
  const advanceRef = useRef<() => void>(() => {});
  const onSpeechEndedRef = useRef<() => void>(() => {});

  profileRef.current = profile;
  sceneRef.current = scene;

  const patchScene = useCallback((patch: Parameters<typeof applyScenePatch>[1]) => {
    setScene((prev) => {
      const next = applyScenePatch(prev, patch);
      sceneRef.current = next;
      return next;
    });
  }, []);

  const pushMoment = useCallback((payload: RecordedMoment) => {
    const moment: LearningMoment = {
      id: uid("moment"),
      type: payload.type as LearningMomentType,
      languageItemIds: payload.languageItemIds ?? [],
      arabic: payload.arabic,
      transliteration: payload.transliteration,
      meaning: payload.meaning,
      note: payload.note,
      at: nowIso(),
    };
    momentsRef.current.push(moment);
    applyMoment(profileRef.current, moment);
    applyRecordedFields(profileRef.current, {
      learnerName: payload.learnerName,
      learnerOrigin: payload.learnerOrigin,
      learnerLike: payload.learnerLike,
    });
  }, []);

  const stageBeat = useCallback(
    (beat: PerformedBeat) => {
      patchScene({
        speaker: beat.speaker === "learner" ? "yusuf" : beat.speaker,
        lookAt: beat.lookAt ?? null,
        gestureKind: beat.gesture ?? "none",
        gestureTarget:
          beat.lookAt ?? (beat.gesture === "point-self" ? beat.speaker : "learner"),
        pulseNameTag: beat.pulse ?? null,
        ...(beat.enter ? { enter: beat.enter } : {}),
      });
      if (beat.visualId) setVisual(visualFor(beat.visualId));
    },
    [patchScene],
  );

  const speakLine = useCallback(
    (speaker: PerformedBeat["speaker"], say: string, language: "ar" | "en") => {
      const who = speaker === "learner" ? "yusuf" : speaker;
      speechArmedRef.current = true;
      heardSpeechRef.current = false;
      agentRef.current?.speakExact(exactSpeechInstruction(who, say, language));
    },
    [],
  );

  const enterOpenMode = useCallback(() => {
    modeRef.current = "open";
    phaseRef.current = "idle";
    setBeatId("open");
    setScaffold(null);
    clearTimer(holdTimerRef);
    agentRef.current?.setLearnerCreatesResponse(true);
    agentRef.current?.speakExact(
      openConversationInstruction({
        learnerName: learnerNameRef.current,
        learnerOrigin: learnerOriginRef.current,
        pendingStructures: pendingStructuresRef.current,
      }),
    );
  }, []);

  const runBeatAt = useCallback(
    (index: number) => {
      const beat = beatsRef.current[index];
      if (!beat) {
        enterOpenMode();
        return;
      }
      beatIndexRef.current = index;
      rescueIndexRef.current = -1;
      setHintLevel(0);
      setScaffold(null);
      setBeatId(beat.id);
      clearTimer(holdTimerRef);
      phaseRef.current = "speaking";
      stageBeat(beat);
      speakLine(beat.speaker, beat.say, beat.language);
    },
    [enterOpenMode, speakLine, stageBeat],
  );
  runBeatAtRef.current = runBeatAt;

  const advanceBeat = useCallback(() => {
    const next = beatIndexRef.current + 1;
    if (next >= beatsRef.current.length) {
      enterOpenMode();
      return;
    }
    runBeatAt(next);
  }, [enterOpenMode, runBeatAt]);
  advanceRef.current = advanceBeat;

  const performRescue = useCallback(
    (step: RescueStep, index: number) => {
      const beat = beatsRef.current[beatIndexRef.current];
      if (!beat) return;
      rescueIndexRef.current = index;
      setHintLevel(index + 1);
      rescueLineIndexRef.current = 0;
      phaseRef.current = "rescuing";
      silenceStartedRef.current = null;
      const line = step.lines[0];
      if (!line) return;
      stageBeat({
        ...beat,
        say: line.say,
        language: line.language,
        speaker: line.speaker ?? beat.speaker,
        lookAt: line.lookAt ?? beat.lookAt,
        gesture: line.gesture,
        pulse: line.pulse,
        visualId: line.visualId ?? beat.visualId,
      });
      if (line.visualId) setVisual(visualFor(line.visualId));
      if (step.rung === "response-starter") {
        setScaffold({
          required: true,
          types: ["response-starter"],
          responseStarter: line.say,
          rescueRung: "response-starter",
        });
      } else {
        setScaffold(null);
      }
      speakLine(line.speaker ?? beat.speaker, line.say, line.language);
    },
    [speakLine, stageBeat],
  );

  const handleParticipationSuccess = useCallback(
    (
      beat: PerformedBeat,
      outcome: Extract<ReturnType<typeof observeParticipation>, { status: "communicated" }>,
      scaffolded: boolean,
    ) => {
      setScaffold(null);
      setEncouraging(false);
      silenceStartedRef.current = null;
      clearTimer(holdTimerRef);

      if (outcome.name) {
        learnerNameRef.current = outcome.name;
        patchScene({ learnerGivenName: outcome.name, pulseNameTag: "learner" });
      }
      if (outcome.place) {
        learnerOriginRef.current = outcome.place;
        setVisual(visualFor("nigeria"));
      }

      const itemId = beat.goal === "give-origin" ? "ana_min" : "ana";
      if (beat.goal === "identify-self" && !outcome.usedAnaFrame) {
        pendingStructuresRef.current = [
          ...new Set([...pendingStructuresRef.current, "ana+identity"]),
        ];
      }
      if (beat.goal === "give-origin" && !(outcome.usedAnaFrame && outcome.usedMinFrame)) {
        pendingStructuresRef.current = [
          ...new Set([...pendingStructuresRef.current, "ana_min+place"]),
        ];
      }

      pushMoment({
        type: scaffolded
          ? "scaffolded-production"
          : outcome.completeness === "full"
            ? "unsupported-retrieval"
            : "spontaneous-use",
        languageItemIds: [itemId],
        learnerName: outcome.name,
        learnerOrigin: outcome.place,
        note: outcome.name ? `name:${outcome.name}` : undefined,
      });

      const template =
        outcome.completeness === "full"
          ? beat.recastFull ?? beat.recastPartial
          : beat.recastPartial ?? beat.recastFull;
      const say = (template ?? "آه!")
        .replaceAll("{name}", outcome.name ?? learnerNameRef.current ?? "")
        .replaceAll("{place}", outcome.place ?? "نيجيريا");

      phaseRef.current = "recasting";
      speakLine(beat.speaker, say, "ar");
    },
    [patchScene, pushMoment, speakLine],
  );

  const handleLearnerTranscript = useCallback(
    (text: string) => {
      if (modeRef.current !== "script") return;
      if (phaseRef.current !== "waiting") return;
      if (text === lastLearnerRef.current) return;
      lastLearnerRef.current = text;

      const beat = beatsRef.current[beatIndexRef.current];
      if (!beat || beat.kind !== "participation" || !beat.goal) return;

      const outcome = observeParticipation(text, beat.goal);
      const scaffolded = rescueIndexRef.current >= 0;

      if (outcome.status === "communicated") {
        handleParticipationSuccess(beat, outcome, scaffolded);
        return;
      }

      if (outcome.status === "incomplete-frame" && beat.rescue) {
        const idx = beat.rescue.findIndex((s) => s.rung === "response-starter");
        if (idx >= 0 && idx > rescueIndexRef.current) {
          performRescue(beat.rescue[idx], idx);
        }
        return;
      }

      if (outcome.status === "blocked" && outcome.reason === "confusion" && beat.rescue) {
        const tiny = beat.rescue.findIndex((s) => s.rung === "tiny-clue");
        const next = Math.max(rescueIndexRef.current + 1, tiny);
        if (next >= 0 && next < beat.rescue.length && next > rescueIndexRef.current) {
          performRescue(beat.rescue[next], next);
        }
      }
    },
    [handleParticipationSuccess, performRescue],
  );

  const onSpeechEnded = useCallback(() => {
    if (modeRef.current !== "script") return;
    const beat = beatsRef.current[beatIndexRef.current];
    if (!beat) return;

    if (phaseRef.current === "rescuing") {
      const step = beat.rescue?.[rescueIndexRef.current];
      if (!step) return;
      const lineIndex = rescueLineIndexRef.current;
      if (lineIndex + 1 < step.lines.length) {
        phaseRef.current = "holding";
        holdTimerRef.current = window.setTimeout(() => {
          rescueLineIndexRef.current = lineIndex + 1;
          const line = step.lines[lineIndex + 1];
          stageBeat({
            ...beat,
            say: line.say,
            language: line.language,
            speaker: line.speaker ?? beat.speaker,
            lookAt: line.lookAt ?? beat.lookAt,
            gesture: line.gesture,
            pulse: line.pulse,
            visualId: line.visualId ?? beat.visualId,
          });
          if (line.visualId) setVisual(visualFor(line.visualId));
          phaseRef.current = "rescuing";
          if (step.rung === "response-starter") {
            setScaffold({
              required: true,
              types: ["response-starter"],
              responseStarter: line.say,
              rescueRung: "response-starter",
            });
          }
          speakLine(line.speaker ?? beat.speaker, line.say, line.language);
        }, step.lines[lineIndex]?.holdMs ?? 400);
        return;
      }
      phaseRef.current = "waiting";
      silenceStartedRef.current = Date.now();
      setEncouraging(true);
      return;
    }

    if (phaseRef.current === "recasting") {
      phaseRef.current = "holding";
      holdTimerRef.current = window.setTimeout(() => advanceRef.current(), 900);
      return;
    }

    if (phaseRef.current !== "speaking") return;

    if (beat.modelItems?.length) {
      pushMoment({ type: "modeled", languageItemIds: beat.modelItems });
    }

    if (beat.kind === "open") {
      enterOpenMode();
      return;
    }

    if (beat.kind === "participation") {
      phaseRef.current = "waiting";
      silenceStartedRef.current = Date.now();
      setEncouraging(false);
      return;
    }

    // Exposure: continue. No rescue. Conversation does not stall.
    phaseRef.current = "holding";
    holdTimerRef.current = window.setTimeout(
      () => advanceRef.current(),
      beat.holdMs ?? 1600,
    );
  }, [enterOpenMode, pushMoment, speakLine, stageBeat]);
  onSpeechEndedRef.current = onSpeechEnded;

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (
        endedRef.current ||
        whyOpenRef.current ||
        modeRef.current !== "script" ||
        phaseRef.current !== "waiting" ||
        agentSpeakingRef.current ||
        learnerSpeakingRef.current ||
        !silenceStartedRef.current
      ) {
        return;
      }
      const beat = beatsRef.current[beatIndexRef.current];
      if (!beat || beat.kind !== "participation" || !beat.rescue?.length) return;

      const elapsed = Date.now() - silenceStartedRef.current;
      if (elapsed >= 3500) setEncouraging(true);

      const nextIndex = rescueIndexRef.current + 1;
      if (nextIndex < beat.rescue.length) {
        const step = beat.rescue[nextIndex];
        if (elapsed >= step.afterSilenceMs) {
          performRescue(step, nextIndex);
        }
        return;
      }

      // Rescue exhausted — still continue the scene (never end the session here)
      const last = beat.rescue[beat.rescue.length - 1];
      if (elapsed >= last.afterSilenceMs + 7000) {
        silenceStartedRef.current = null;
        phaseRef.current = "recasting";
        speakLine(beat.speaker, "طَيِّب…", "ar");
      }
    }, 400);
    return () => window.clearInterval(interval);
  }, [performRescue, speakLine]);

  useEffect(() => {
    whyOpenRef.current = whyOpen;
  }, [whyOpen]);

  useEffect(() => {
    learnerSpeakingRef.current = learnerSpeaking;
    if (learnerSpeaking) {
      setEncouraging(false);
      silenceStartedRef.current = null;
    }
  }, [learnerSpeaking]);

  useEffect(() => {
    const was = agentSpeakingRef.current;
    agentSpeakingRef.current = agentSpeaking;
    if (agentSpeaking) {
      heardSpeechRef.current = true;
      silenceStartedRef.current = null;
      return;
    }
    if (was && heardSpeechRef.current && speechArmedRef.current) {
      speechArmedRef.current = false;
      heardSpeechRef.current = false;
      onSpeechEndedRef.current();
    }
  }, [agentSpeaking]);

  useEffect(() => {
    if (!scene.pulsing && !scene.gesture) return;
    const t = window.setTimeout(() => {
      setScene((prev) => ({ ...prev, pulsing: null, gesture: null }));
    }, 1600);
    return () => window.clearTimeout(t);
  }, [scene.pulsing, scene.gesture]);

  const connect = useCallback(async () => {
    if (!audioElement) return;
    setError(null);
    setConnection("connecting");

    const tokenResponse = await fetch("/api/realtime/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, performed: useScript }),
    });
    const tokenPayload = (await tokenResponse.json()) as { value?: string; error?: string };
    if (!tokenResponse.ok || !tokenPayload.value) {
      setConnection("error");
      setError(tokenPayload.error ?? "Could not start a live session");
      return;
    }

    const agent = createOpenAIRealtimeAgent({
      onConnectionState: (state) => {
        setConnection(state);
        if (state === "connected" && useScript) {
          window.setTimeout(() => runBeatAtRef.current(0), 500);
        }
      },
      onAgentSpeaking: setAgentSpeaking,
      onLearnerSpeaking: setLearnerSpeaking,
      onTranscript: ({ speaker, text }) => {
        turnsRef.current.push({
          id: uid("turn"),
          speaker,
          characterId: speaker === "agent" ? sceneRef.current.speaker ?? undefined : "learner",
          transcript: text,
          startedAt: nowIso(),
          endedAt: nowIso(),
          detectedLanguage: detectLanguage(text),
          scaffoldUsed: [],
        });
        if (speaker === "agent") {
          setLastAgentArabic(text);
          setLastWhyKey((c) => c ?? guessWhyKey(text));
        } else {
          handleLearnerTranscript(text);
        }
      },
      onScaffold: setScaffold,
      onClearScaffold: () => setScaffold(null),
      onVisual: (id) => setVisual(visualFor(id) ?? visualFor("gathering")),
      onScene: patchScene,
      onModeling: ({ languageItemIds, withReferent }) => {
        pushMoment({
          type: "modeled",
          languageItemIds,
          note: withReferent ? undefined : "no-referent",
        });
      },
      onPhase: () => {},
      onMoment: pushMoment,
      onError: (message) => {
        setError(message);
        setConnection("error");
      },
    });

    agentRef.current = agent;
    try {
      await agent.connect({
        ephemeralKey: tokenPayload.value,
        audioElement,
        suppressAutoResponse: useScript,
      });
      if (useScript) {
        agent.setLearnerCreatesResponse(false);
      } else {
        modeRef.current = "open";
        agent.setLearnerCreatesResponse(true);
        agent.speakExact(
          openConversationInstruction({
            learnerName: learnerNameRef.current,
            learnerOrigin: learnerOriginRef.current,
            pendingStructures: [],
          }),
        );
      }
    } catch (caught) {
      setConnection("error");
      setError(caught instanceof Error ? caught.message : "Could not connect");
    }
  }, [audioElement, handleLearnerTranscript, patchScene, plan, pushMoment, useScript]);

  const disconnect = useCallback(() => {
    endedRef.current = true;
    clearTimer(holdTimerRef);
    agentRef.current?.disconnect();
    agentRef.current = null;
  }, []);

  const openWhy = useCallback(() => {
    setWhyOpen(true);
    agentRef.current?.pause();
    pushMoment({ type: "why-insight", languageItemIds: lastWhyKey ? [lastWhyKey] : [] });
  }, [lastWhyKey, pushMoment]);

  const closeWhy = useCallback(() => {
    setWhyOpen(false);
    agentRef.current?.resume();
  }, []);

  const hint = useCallback(() => {
    if (modeRef.current !== "script" || phaseRef.current !== "waiting") return;
    const beat = beatsRef.current[beatIndexRef.current];
    if (!beat?.rescue?.length) return;
    const next = Math.min(rescueIndexRef.current + 1, beat.rescue.length - 1);
    if (next <= rescueIndexRef.current) return;
    performRescue(beat.rescue[next], next);
  }, [performRescue]);

  const snapshot = useCallback((): SessionSnapshot => {
    return {
      moments: [...momentsRef.current],
      turns: [...turnsRef.current],
      profile: profileRef.current,
    };
  }, []);

  return {
    connection,
    error,
    agentSpeaking,
    learnerSpeaking,
    encouraging,
    scaffold,
    visual,
    scene,
    whyOpen,
    hintLevel,
    phaseId: beatId,
    lastAgentArabic,
    lastWhyKey,
    connect,
    disconnect,
    openWhy,
    closeWhy,
    hint,
    snapshot,
  };
}
