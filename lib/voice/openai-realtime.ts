import { isCharacterId } from "../pedagogy/scene-state";
import type { GestureKind, Scaffold, ScaffoldType, ScenePatch } from "../pedagogy/types";
import type { RecordedMoment, VoiceAgent, VoiceAgentHandlers } from "./types";

type RealtimeEvent = {
  type: string;
  name?: string;
  call_id?: string;
  arguments?: string;
  transcript?: string;
  item?: {
    type?: string;
    call_id?: string;
    name?: string;
    arguments?: string;
    content?: Array<{ type?: string; transcript?: string; text?: string }>;
    role?: string;
  };
  response?: { status?: string };
  error?: { message?: string };
};

export function createOpenAIRealtimeAgent(handlers: VoiceAgentHandlers): VoiceAgent {
  let pc: RTCPeerConnection | null = null;
  let dc: RTCDataChannel | null = null;
  let localStream: MediaStream | null = null;
  let paused = false;
  let responseHasAudio = false;
  const pendingCalls = new Set<string>();

  function send(event: Record<string, unknown>) {
    if (dc?.readyState === "open") {
      dc.send(JSON.stringify(event));
    }
  }

  function setMicEnabled(enabled: boolean) {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  function handleFunctionCall(name: string, rawArgs: string, callId: string) {
    let args: Record<string, unknown> = {};
    try {
      args = rawArgs ? (JSON.parse(rawArgs) as Record<string, unknown>) : {};
    } catch {
      args = {};
    }

    if (name === "stage_scene") {
      const patch: ScenePatch = {};
      if (isCharacterId(args.speaker) && args.speaker !== "learner") patch.speaker = args.speaker;
      if (isCharacterId(args.lookAt)) patch.lookAt = args.lookAt;
      if (typeof args.gestureKind === "string") patch.gestureKind = args.gestureKind as GestureKind;
      if (isCharacterId(args.gestureTarget)) patch.gestureTarget = args.gestureTarget;
      if (args.pulseNameTag === null) patch.pulseNameTag = null;
      else if (isCharacterId(args.pulseNameTag)) patch.pulseNameTag = args.pulseNameTag;
      if (isCharacterId(args.enter) && args.enter !== "learner") patch.enter = args.enter;
      if (typeof args.learnerGivenName === "string") patch.learnerGivenName = args.learnerGivenName;
      handlers.onScene?.(patch);
    } else if (name === "note_modeling") {
      const ids = Array.isArray(args.languageItemIds)
        ? args.languageItemIds.filter((id): id is string => typeof id === "string")
        : [];
      handlers.onModeling?.({
        languageItemIds: ids,
        withReferent: args.withReferent !== false,
      });
    } else if (name === "advance_phase" && typeof args.phaseId === "string") {
      handlers.onPhase?.(args.phaseId);
    } else if (name === "present_scaffold") {
      const types = Array.isArray(args.types) ? (args.types as ScaffoldType[]) : [];
      const tinyClue = typeof args.tinyClue === "string" ? args.tinyClue : undefined;
      const scaffold: Scaffold & { whyKey?: string | null } = {
        required: types.length > 0,
        types,
        responseFrame: typeof args.responseFrame === "string" ? args.responseFrame : undefined,
        responseStarter:
          typeof args.responseStarter === "string" ? args.responseStarter : undefined,
        arabicNarrowing:
          typeof args.arabicNarrowing === "string" ? args.arabicNarrowing : undefined,
        tinyClue,
        transliteration:
          typeof args.transliteration === "string" ? args.transliteration : undefined,
        nativeLanguageAnchor:
          typeof args.nativeLanguageAnchor === "string"
            ? args.nativeLanguageAnchor
            : tinyClue ?? null,
        fullTranslation: typeof args.fullTranslation === "string" ? args.fullTranslation : null,
        vocabularyOptions: Array.isArray(args.vocabularyOptions)
          ? (args.vocabularyOptions as Scaffold["vocabularyOptions"])
          : undefined,
        whyKey: typeof args.whyKey === "string" ? args.whyKey : null,
        rescueRung: types.includes("response-starter")
          ? "response-starter"
          : types.includes("tiny-clue")
            ? "tiny-clue"
            : types.includes("arabic-narrowing")
              ? "arabic-narrowing"
              : types.includes("contextual-cue")
                ? "contextual-cue"
                : "wait",
      };
      handlers.onScaffold?.(scaffold);
    } else if (name === "set_visual" && typeof args.visualId === "string") {
      handlers.onVisual?.(args.visualId);
    } else if (name === "clear_scaffold") {
      handlers.onClearScaffold?.();
    } else if (name === "record_moment") {
      handlers.onMoment?.(args as RecordedMoment);
    }

    send({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: JSON.stringify({ ok: true }),
      },
    });
    pendingCalls.delete(callId);
    if (!responseHasAudio) {
      send({ type: "response.create" });
    }
  }

  function onEvent(event: RealtimeEvent) {
    switch (event.type) {
      case "error":
        handlers.onError?.(event.error?.message ?? "Realtime error");
        break;
      case "input_audio_buffer.speech_started":
        handlers.onLearnerSpeaking?.(true);
        break;
      case "input_audio_buffer.speech_stopped":
        handlers.onLearnerSpeaking?.(false);
        break;
      case "response.created":
        responseHasAudio = false;
        break;
      case "response.output_audio.delta":
      case "response.audio.delta":
        responseHasAudio = true;
        handlers.onAgentSpeaking?.(true);
        break;
      case "response.output_audio.done":
      case "response.audio.done":
      case "response.done":
        handlers.onAgentSpeaking?.(false);
        break;
      case "conversation.item.input_audio_transcription.completed":
        if (event.transcript) {
          handlers.onTranscript?.({ speaker: "learner", text: event.transcript });
        }
        break;
      case "response.output_audio_transcript.done":
      case "response.audio_transcript.done":
        if (event.transcript) {
          handlers.onTranscript?.({ speaker: "agent", text: event.transcript });
        }
        break;
      case "response.function_call_arguments.done":
        if (event.name && event.call_id) {
          pendingCalls.add(event.call_id);
          handleFunctionCall(event.name, event.arguments ?? "{}", event.call_id);
        }
        break;
      case "response.output_item.done":
        if (event.item?.type === "function_call" && event.item.call_id && event.item.name) {
          if (!pendingCalls.has(event.item.call_id)) {
            handleFunctionCall(
              event.item.name,
              event.item.arguments ?? "{}",
              event.item.call_id,
            );
          }
        }
        if (event.item?.role === "assistant") {
          const text = event.item.content
            ?.map((part) => part.transcript ?? part.text ?? "")
            .join(" ")
            .trim();
          if (text) handlers.onTranscript?.({ speaker: "agent", text });
        }
        break;
      default:
        break;
    }
  }

  return {
    async connect({ ephemeralKey, audioElement, suppressAutoResponse = false }) {
      handlers.onConnectionState?.("connecting");
      pc = new RTCPeerConnection();
      audioElement.autoplay = true;
      pc.ontrack = (event) => {
        audioElement.srcObject = event.streams[0];
      };

      localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStream.getTracks().forEach((track) => pc?.addTrack(track, localStream!));

      dc = pc.createDataChannel("oai-events");
      dc.addEventListener("open", () => {
        handlers.onConnectionState?.("connected");
        if (!suppressAutoResponse) {
          send({ type: "response.create" });
        }
      });
      dc.addEventListener("message", (message) => {
        try {
          onEvent(JSON.parse(String(message.data)) as RealtimeEvent);
        } catch {
          // ignore malformed frames
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        const detail = await sdpResponse.text();
        handlers.onConnectionState?.("error");
        handlers.onError?.(detail || "Could not start the voice session");
        throw new Error(detail || "realtime calls failed");
      }

      await pc.setRemoteDescription({
        type: "answer",
        sdp: await sdpResponse.text(),
      });
    },

    pause() {
      paused = true;
      setMicEnabled(false);
      send({ type: "response.cancel" });
      send({
        type: "session.update",
        session: {
          audio: {
            input: {
              turn_detection: {
                type: "semantic_vad",
                eagerness: "low",
                create_response: false,
                interrupt_response: false,
              },
            },
          },
        },
      });
    },

    resume() {
      if (!paused) return;
      paused = false;
      setMicEnabled(true);
      send({
        type: "session.update",
        session: {
          audio: {
            input: {
              turn_detection: {
                type: "semantic_vad",
                eagerness: "low",
                create_response: true,
                interrupt_response: false,
              },
            },
          },
        },
      });
      send({
        type: "response.create",
        response: {
          instructions:
            "The learner inspected a pattern and is back. Continue the exact conversation as the same character. Do not recap the grammar. Speak Arabic.",
        },
      });
    },

    sendHint(instruction: string) {
      send({
        type: "response.create",
        response: { instructions: instruction },
      });
    },

    speakExact(instruction: string) {
      send({ type: "response.cancel" });
      send({
        type: "response.create",
        response: { instructions: instruction },
      });
    },

    setLearnerCreatesResponse(enabled: boolean) {
      send({
        type: "session.update",
        session: {
          audio: {
            input: {
              turn_detection: {
                type: "semantic_vad",
                eagerness: "low",
                create_response: enabled,
                interrupt_response: false,
              },
            },
          },
        },
      });
    },

    disconnect() {
      handlers.onConnectionState?.("disconnected");
      try {
        send({ type: "session.update", session: { type: "realtime" } });
      } catch {
        // closing
      }
      dc?.close();
      pc?.getSenders().forEach((sender) => sender.track?.stop());
      pc?.close();
      localStream?.getTracks().forEach((track) => track.stop());
      dc = null;
      pc = null;
      localStream = null;
    },
  };
}
