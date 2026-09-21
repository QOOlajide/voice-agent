import { magicSentence } from "./magic-sentences";
import { nowIso, uid } from "./normalize";
import type {
  LearningMoment,
  ReviewCard,
  SessionSummaryLine,
} from "./types";

export function extractReviewCards(moments: LearningMoment[]): ReviewCard[] {
  const seen = new Set<string>();
  const cards: ReviewCard[] = [];

  for (const moment of moments) {
    for (const languageItemId of moment.languageItemIds) {
      if (seen.has(languageItemId) || cards.length >= 7) continue;
      const sentence = magicSentence(languageItemId);
      const transliteration = moment.transliteration ?? sentence?.frame ?? "";
      const arabic = moment.arabic ?? sentence?.arabic ?? "";
      const meaning = moment.meaning ?? sentence?.meaning ?? "";
      if (!transliteration && !arabic) continue;
      seen.add(languageItemId);
      cards.push({
        id: uid("card"),
        languageItemId,
        transliteration,
        arabic,
        meaning,
        pattern: sentence ? `${sentence.frame} — ${sentence.meaning}` : undefined,
        dueAt: nowIso(),
        intervalDays: 0,
        ease: 2.5,
        personal: moment.type === "code-switch",
      });
    }
  }

  return cards.slice(0, 7);
}

export function summarizeSession(moments: LearningMoment[]): SessionSummaryLine[] {
  const lines: SessionSummaryLine[] = [];
  const types = new Set(moments.map((moment) => moment.type));

  if (types.has("unsupported-retrieval")) {
    lines.push({
      id: "retrieve",
      text: "Remembered something from earlier without being shown the answer first.",
    });
  }
  if (
    moments.some((moment) =>
      moment.languageItemIds.some((id) => id === "ana" || id === "ismi" || id === "ana_ismi"),
    )
  ) {
    lines.push({ id: "name", text: "Introduced yourself in Arabic." });
  }
  if (moments.some((moment) => moment.languageItemIds.includes("ana_min"))) {
    lines.push({ id: "origin", text: "Said where you are from." });
  }
  if (moments.some((moment) => moment.languageItemIds.includes("uhibbu_an"))) {
    lines.push({
      id: "like",
      text: moments.some((moment) => moment.type === "unsupported-retrieval")
        ? "Used “uḥibbu an…” independently."
        : "Talked about something you like to do.",
    });
  }
  if (moments.some((moment) => moment.languageItemIds.includes("uridu"))) {
    lines.push({ id: "want", text: "Expressed what you want." });
  }
  if (moments.some((moment) => moment.languageItemIds.includes("lianna"))) {
    lines.push({ id: "reason", text: "Gave a reason with liʾanna." });
  }
  if (types.has("code-switch")) {
    lines.push({
      id: "bridge",
      text: "Used English as a bridge — Kalam modeled the Arabic and kept going.",
    });
  }
  if (types.has("why-insight")) {
    lines.push({ id: "why", text: "Looked inside a pattern with Why?" });
  }
  if (types.has("successful-follow-up") || types.has("conversational-initiative")) {
    lines.push({ id: "ask", text: "Took a turn steering the conversation." });
  }
  if (types.has("scaffolded-production") && !types.has("unsupported-retrieval")) {
    lines.push({
      id: "help",
      text: "Needed a frame to speak — next time Kalam will try retrieval first.",
    });
  }

  return lines.slice(0, 6);
}

export function scheduleAfterRating(card: ReviewCard, rating: "again" | "hard" | "good" | "easy") {
  const next = { ...card };
  if (rating === "again") {
    next.intervalDays = 0;
    next.ease = Math.max(1.3, next.ease - 0.2);
  } else if (rating === "hard") {
    next.intervalDays = Math.max(1, Math.round(next.intervalDays * 1.2) || 1);
    next.ease = Math.max(1.3, next.ease - 0.05);
  } else if (rating === "good") {
    next.intervalDays = next.intervalDays === 0 ? 3 : Math.round(next.intervalDays * next.ease);
  } else {
    next.intervalDays = next.intervalDays === 0 ? 7 : Math.round(next.intervalDays * next.ease * 1.3);
    next.ease += 0.1;
  }
  const due = new Date();
  due.setDate(due.getDate() + next.intervalDays);
  next.dueAt = due.toISOString();
  return next;
}
