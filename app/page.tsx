"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CompletedScreen } from "@/components/voice-session/CompletedScreen";
import { ProcessingScreen } from "@/components/voice-session/ProcessingScreen";
import { ReviewScreen } from "@/components/voice-session/ReviewScreen";
import { VoiceSession } from "@/components/voice-session/VoiceSession";
import { WelcomeScreen } from "@/components/voice-session/WelcomeScreen";
import type { SessionSnapshot } from "@/hooks/useKalamVoiceSession";
import { finalizeSession } from "@/lib/pedagogy/apply-moments";
import { createProfile } from "@/lib/pedagogy/learner-model";
import {
  extractReviewCards,
  scheduleAfterRating,
  summarizeSession,
} from "@/lib/pedagogy/review-policy";
import { planSession } from "@/lib/pedagogy/session-planning";
import type { LearnerProfile, ReviewCard, ReviewRating, SessionSummaryLine } from "@/lib/pedagogy/types";
import { loadProfile, saveProfile } from "@/lib/persistence/learner-store";

type SessionStatus = "welcome" | "active" | "processing" | "review" | "completed";

export default function HomePage() {
  const [status, setStatus] = useState<SessionStatus>("welcome");
  const [profile, setProfile] = useState<LearnerProfile>(createProfile);
  const [summary, setSummary] = useState<SessionSummaryLine[]>([]);
  const [cards, setCards] = useState<ReviewCard[]>([]);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const plan = useMemo(() => planSession(profile), [profile]);

  const beginSession = useCallback(() => {
    setStatus("active");
  }, []);

  const endSession = useCallback(
    (snapshot: SessionSnapshot) => {
      const next = finalizeSession(snapshot.profile, snapshot.moments, plan.settingId);
      saveProfile(next);
      setProfile(next);
      setSummary(summarizeSession(snapshot.moments));
      const fresh = extractReviewCards(snapshot.moments);
      setCards(fresh);
      setStatus("processing");
      window.setTimeout(() => {
        setStatus(fresh.length > 0 ? "review" : "completed");
      }, 900);
    },
    [plan.settingId],
  );

  const rateCard = useCallback((cardId: string, rating: ReviewRating) => {
    setProfile((current) => {
      const next: LearnerProfile = {
        ...current,
        reviewCards: current.reviewCards.map((card) =>
          card.id === cardId ? scheduleAfterRating(card, rating) : card,
        ),
      };
      saveProfile(next);
      return next;
    });
  }, []);

  if (status === "welcome") {
    return <WelcomeScreen onBeginSession={beginSession} />;
  }

  if (status === "active") {
    return <VoiceSession durationSeconds={300} plan={plan} profile={profile} onEndSession={endSession} />;
  }

  if (status === "processing") {
    return <ProcessingScreen />;
  }

  if (status === "review") {
    return (
      <ReviewScreen
        summary={summary}
        cards={cards}
        onRate={rateCard}
        onDone={() => setStatus("completed")}
      />
    );
  }

  return <CompletedScreen />;
}
