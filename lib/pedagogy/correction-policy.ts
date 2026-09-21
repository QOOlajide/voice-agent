export function recastGreeting() {
  return "أهلاً!";
}

export function recastName(name: string) {
  return `أهلاً يا ${name}!`;
}

export function recastOrigin(placeArabic: string, codeSwitch: boolean) {
  return codeSwitch
    ? `آه، أنت من ${placeArabic}.`
    : `جميل، أنت من ${placeArabic}.`;
}

export function recastLike(verbArabic: string, codeSwitch: boolean) {
  return codeSwitch
    ? `آه، تحب أن ${verbArabic}!`
    : `جميل! أنت تحب أن ${verbArabic}. وأنا أيضًا.`;
}

export function recastWant(thingArabic: string, codeSwitch: boolean) {
  return codeSwitch
    ? `آه، تريد ${thingArabic}.`
    : `طيب، تريد ${thingArabic}.`;
}

export function recastPossession(thingArabic: string) {
  return `آه، عندك ${thingArabic}.`;
}

export function recastReason(reason: string) {
  return `فهمت، لأن ${reason}.`;
}

export function recastFarewell(name?: string) {
  return name ? `إلى اللقاء يا ${name}!` : "إلى اللقاء!";
}

export function acknowledgeOffTopic() {
  return "جميل. طيب...";
}
