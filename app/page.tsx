"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CompletedScreen } from "@/components/voice-session/CompletedScreen";
import { VoiceSession } from "@/components/voice-session/VoiceSession";
import { WelcomeScreen } from "@/components/voice-session/WelcomeScreen";

type SessionStatus = "welcome" | "active" | "completed";

export default function HomePage() {
  const [status, setStatus] = useState<SessionStatus>("welcome");
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopMicrophone = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  useEffect(() => () => stopMicrophone(), [stopMicrophone]);

  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });
      mediaStreamRef.current = stream;
    } catch {
      mediaStreamRef.current = null;
    }
  }, []);

  const beginSession = useCallback(() => {
    setStatus("active");
    void startMicrophone();
  }, [startMicrophone]);

  const endSession = useCallback(() => {
    stopMicrophone();
    setStatus("completed");
  }, [stopMicrophone]);

  if (status === "welcome") {
    return <WelcomeScreen onBeginSession={beginSession} />;
  }

  if (status === "active") {
    return <VoiceSession durationSeconds={300} onEndSession={endSession} />;
  }

  return <CompletedScreen />;
}
