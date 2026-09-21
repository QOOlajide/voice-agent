import type { CharacterId, ScenePatch, SceneProximity, SceneState } from "./types";

const IDS: CharacterId[] = ["yusuf", "sami", "learner"];

export function emptyScene(present: CharacterId[]): SceneState {
  const proximity = {
    yusuf: "absent",
    sami: "absent",
    learner: "near",
  } as Record<CharacterId, SceneProximity>;

  present.forEach((id, index) => {
    proximity[id] = index === 0 ? "near" : "far";
  });

  return {
    speaker: present[0] ?? "yusuf",
    lookAt: null,
    gesture: null,
    pulsing: null,
    present: present.length ? [...present] : ["yusuf"],
    proximity,
  };
}

export function applyScenePatch(scene: SceneState, patch: ScenePatch): SceneState {
  const next: SceneState = {
    ...scene,
    proximity: { ...scene.proximity },
    present: [...scene.present],
  };

  if (patch.speaker) next.speaker = patch.speaker;
  if (patch.lookAt !== undefined) next.lookAt = patch.lookAt;
  if (patch.pulseNameTag !== undefined) next.pulsing = patch.pulseNameTag;
  if (patch.learnerGivenName) next.learnerGivenName = patch.learnerGivenName;

  if (patch.gestureKind && patch.gestureKind !== "none") {
    next.gesture = {
      kind: patch.gestureKind,
      target: patch.gestureTarget ?? patch.lookAt ?? "learner",
    };
  } else if (patch.gestureKind === "none") {
    next.gesture = null;
  }

  if (patch.enter) {
    if (!next.present.includes(patch.enter)) next.present.push(patch.enter);
    next.proximity[patch.enter] = "near";
  }

  return next;
}

export function clearTransientScene(scene: SceneState): SceneState {
  return {
    ...scene,
    gesture: null,
    pulsing: null,
    lookAt: null,
  };
}

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && IDS.includes(value as CharacterId);
}
