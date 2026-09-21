export function stripArabicDiacritics(text: string) {
  return text.replace(/[\u064B-\u065F\u0670]/g, "");
}

export function normalize(text: string) {
  return stripArabicDiacritics(text)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/[؟?!.،,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function addDays(iso: string, days: number) {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
