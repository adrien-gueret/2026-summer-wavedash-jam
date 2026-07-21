import type { CharacterId, PreferenceDefinition } from "@/types";

/**
 * The canonical character preference profiles — the single source of truth for
 * gameplay rules. Every character has exactly three conditions:
 *   - one main positive condition worth +6;
 *   - one secondary positive condition worth +3;
 *   - one negative condition worth between -4 and -8.
 *
 * These conditions are identical across every level and game mode. Levels never
 * enable, disable, replace or override them. A condition only comes into play
 * when its target characters are present (see isPreferenceApplicable); a
 * table-based condition such as an end-seat preference is active whenever its
 * owner is present. Conditions targeting several characters use "once"
 * aggregation: they trigger a single time if at least one target satisfies
 * them, never once per matching target.
 *
 * A preference is always evaluated from its owner's perspective. Positive
 * points reward fulfilment, negative points penalize a triggered condition.
 */
export const PREFERENCES: Record<string, PreferenceDefinition> = {
  /* -------------------------------- Martha ------------------------------ */
  "martha-next-to-grandchild": {
    id: "martha-next-to-grandchild",
    ownerId: "martha",
    description: "Wants to sit next to at least one grandchild.",
    target: {
      type: "characters",
      characterIds: ["julie", "andrew", "danielle", "zach"],
    },
    condition: "adjacent",
    points: 6,
  },
  "martha-opposite-henry": {
    id: "martha-opposite-henry",
    ownerId: "martha",
    description: "Would like to sit opposite Henry.",
    target: { type: "character", characterId: "henry" },
    condition: "opposite",
    points: 3,
  },
  "martha-not-end-seat": {
    id: "martha-not-end-seat",
    ownerId: "martha",
    description: "Does not want an end seat.",
    target: { type: "none" },
    condition: "end-seat",
    points: -4,
  },

  /* --------------------------------- Henry ------------------------------- */
  "henry-next-to-rex": {
    id: "henry-next-to-rex",
    ownerId: "henry",
    description: "Wants to sit next to Rex.",
    target: { type: "character", characterId: "rex" },
    condition: "adjacent",
    points: 6,
  },
  "henry-end-seat": {
    id: "henry-end-seat",
    ownerId: "henry",
    description: "Would like an end seat.",
    target: { type: "none" },
    condition: "end-seat",
    points: 3,
  },
  "henry-not-next-to-andrew-or-danielle": {
    id: "henry-not-next-to-andrew-or-danielle",
    ownerId: "henry",
    description: "Does not want to sit next to Andrew or Danielle.",
    target: { type: "characters", characterIds: ["andrew", "danielle"] },
    condition: "adjacent",
    points: -4,
  },

  /* --------------------------------- Rex --------------------------------- */
  "rex-next-to-bree": {
    id: "rex-next-to-bree",
    ownerId: "rex",
    description: "Wants to sit next to Bree.",
    target: { type: "character", characterId: "bree" },
    condition: "adjacent",
    points: 6,
  },
  "rex-next-to-henry-or-paul": {
    id: "rex-next-to-henry-or-paul",
    ownerId: "rex",
    description: "Would like to sit next to Henry or Paul.",
    target: { type: "characters", characterIds: ["henry", "paul"] },
    condition: "adjacent",
    points: 3,
  },
  "rex-not-next-to-susan-or-karl": {
    id: "rex-not-next-to-susan-or-karl",
    ownerId: "rex",
    description: "Does not want to sit next to Susan or Karl.",
    target: { type: "characters", characterIds: ["susan", "karl"] },
    condition: "adjacent",
    points: -4,
  },

  /* -------------------------------- Bree --------------------------------- */
  "bree-next-to-rex": {
    id: "bree-next-to-rex",
    ownerId: "bree",
    description: "Wants to sit next to Rex.",
    target: { type: "character", characterId: "rex" },
    condition: "adjacent",
    points: 6,
  },
  "bree-next-to-andrew-or-danielle": {
    id: "bree-next-to-andrew-or-danielle",
    ownerId: "bree",
    description: "Wants to sit next to Andrew or Danielle.",
    target: { type: "characters", characterIds: ["andrew", "danielle"] },
    condition: "adjacent",
    points: 3,
  },
  "bree-not-next-to-susan": {
    id: "bree-not-next-to-susan",
    ownerId: "bree",
    description: "Cannot stand sitting next to Susan.",
    target: { type: "character", characterId: "susan" },
    condition: "adjacent",
    points: -8,
  },

  /* -------------------------------- Susan -------------------------------- */
  "susan-next-to-julie": {
    id: "susan-next-to-julie",
    ownerId: "susan",
    description: "Wants to sit next to Julie.",
    target: { type: "character", characterId: "julie" },
    condition: "adjacent",
    points: 6,
  },
  "susan-opposite-martha": {
    id: "susan-opposite-martha",
    ownerId: "susan",
    description: "Would like to sit opposite Martha.",
    target: { type: "character", characterId: "martha" },
    condition: "opposite",
    points: 3,
  },
  "susan-not-next-to-bree-or-karl": {
    id: "susan-not-next-to-bree-or-karl",
    ownerId: "susan",
    description: "Does not want to sit next to Bree or Karl.",
    target: { type: "characters", characterIds: ["bree", "karl"] },
    condition: "adjacent",
    points: -6,
  },

  /* --------------------------------- Karl -------------------------------- */
  "karl-next-to-julie": {
    id: "karl-next-to-julie",
    ownerId: "karl",
    description: "Wants to sit next to Julie.",
    target: { type: "character", characterId: "julie" },
    condition: "adjacent",
    points: 6,
  },
  "karl-next-to-henry": {
    id: "karl-next-to-henry",
    ownerId: "karl",
    description: "Would like to sit next to Henry.",
    target: { type: "character", characterId: "henry" },
    condition: "adjacent",
    points: 3,
  },
  "karl-not-near-susan": {
    id: "karl-not-near-susan",
    ownerId: "karl",
    description: "Does not want to sit next to or opposite Susan.",
    target: { type: "character", characterId: "susan" },
    condition: "adjacent-or-opposite",
    points: -4,
  },

  /* -------------------------------- Paul --------------------------------- */
  "paul-next-to-angela": {
    id: "paul-next-to-angela",
    ownerId: "paul",
    description: "Wants to sit next to Angela.",
    target: { type: "character", characterId: "angela" },
    condition: "adjacent",
    points: 6,
  },
  "paul-next-to-rex-or-susan": {
    id: "paul-next-to-rex-or-susan",
    ownerId: "paul",
    description: "Wants to sit next to Rex or Susan.",
    target: { type: "characters", characterIds: ["rex", "susan"] },
    condition: "adjacent",
    points: 3,
  },
  "paul-not-end-seat": {
    id: "paul-not-end-seat",
    ownerId: "paul",
    description: "Does not want an end seat.",
    target: { type: "none" },
    condition: "end-seat",
    points: -4,
  },

  /* -------------------------------- Angela ------------------------------- */
  "angela-next-to-zach": {
    id: "angela-next-to-zach",
    ownerId: "angela",
    description: "Wants to sit next to Zach.",
    target: { type: "character", characterId: "zach" },
    condition: "adjacent",
    points: 6,
  },
  "angela-next-to-bree": {
    id: "angela-next-to-bree",
    ownerId: "angela",
    description: "Would like to sit next to Bree.",
    target: { type: "character", characterId: "bree" },
    condition: "adjacent",
    points: 3,
  },
  "angela-not-next-to-martha-or-susan": {
    id: "angela-not-next-to-martha-or-susan",
    ownerId: "angela",
    description: "Does not want to sit next to Martha or Susan.",
    target: { type: "characters", characterIds: ["martha", "susan"] },
    condition: "adjacent",
    points: -4,
  },

  /* -------------------------------- Julie -------------------------------- */
  "julie-next-to-zach": {
    id: "julie-next-to-zach",
    ownerId: "julie",
    description: "Wants to sit next to Zach.",
    target: { type: "character", characterId: "zach" },
    condition: "adjacent",
    points: 6,
  },
  "julie-next-to-andrew-or-danielle": {
    id: "julie-next-to-andrew-or-danielle",
    ownerId: "julie",
    description: "Would like to sit next to Andrew or Danielle.",
    target: { type: "characters", characterIds: ["andrew", "danielle"] },
    condition: "adjacent",
    points: 3,
  },
  "julie-not-next-to-susan-or-karl": {
    id: "julie-not-next-to-susan-or-karl",
    ownerId: "julie",
    description: "Does not want to sit next to Susan or Karl.",
    target: { type: "characters", characterIds: ["susan", "karl"] },
    condition: "adjacent",
    points: -8,
  },

  /* -------------------------------- Andrew ------------------------------- */
  "andrew-next-to-danielle": {
    id: "andrew-next-to-danielle",
    ownerId: "andrew",
    description: "Wants to sit next to Danielle.",
    target: { type: "character", characterId: "danielle" },
    condition: "adjacent",
    points: 6,
  },
  "andrew-next-to-zach": {
    id: "andrew-next-to-zach",
    ownerId: "andrew",
    description: "Would like to sit next to Zach.",
    target: { type: "character", characterId: "zach" },
    condition: "adjacent",
    points: 3,
  },
  "andrew-not-next-to-martha-or-henry": {
    id: "andrew-not-next-to-martha-or-henry",
    ownerId: "andrew",
    description: "Does not want to sit next to Martha or Henry.",
    target: { type: "characters", characterIds: ["martha", "henry"] },
    condition: "adjacent",
    points: -4,
  },

  /* -------------------------------- Danielle ----------------------------- */
  "danielle-next-to-andrew": {
    id: "danielle-next-to-andrew",
    ownerId: "danielle",
    description: "Wants to sit next to Andrew.",
    target: { type: "character", characterId: "andrew" },
    condition: "adjacent",
    points: 6,
  },
  "danielle-next-to-martha": {
    id: "danielle-next-to-martha",
    ownerId: "danielle",
    description: "Would like to sit next to Martha.",
    target: { type: "character", characterId: "martha" },
    condition: "adjacent",
    points: 3,
  },
  "danielle-not-next-to-henry": {
    id: "danielle-not-next-to-henry",
    ownerId: "danielle",
    description: "Does not want to sit next to Henry.",
    target: { type: "character", characterId: "henry" },
    condition: "adjacent",
    points: -4,
  },

  /* --------------------------------- Zach -------------------------------- */
  "zach-next-to-julie": {
    id: "zach-next-to-julie",
    ownerId: "zach",
    description: "Wants to sit next to Julie.",
    target: { type: "character", characterId: "julie" },
    condition: "adjacent",
    points: 6,
  },
  "zach-next-to-andrew-or-danielle": {
    id: "zach-next-to-andrew-or-danielle",
    ownerId: "zach",
    description: "Would like to sit next to Andrew or Danielle.",
    target: { type: "characters", characterIds: ["andrew", "danielle"] },
    condition: "adjacent",
    points: 3,
  },
  "zach-not-next-to-paul-or-angela": {
    id: "zach-not-next-to-paul-or-angela",
    ownerId: "zach",
    description: "Does not want to sit next to Paul or Angela.",
    target: { type: "characters", characterIds: ["paul", "angela"] },
    condition: "adjacent",
    points: -4,
  },
};

export function getPreference(id: string): PreferenceDefinition {
  const preference = PREFERENCES[id];
  if (!preference) {
    throw new Error(`Unknown preference id: ${id}`);
  }
  return preference;
}

/** Every target character a preference is measured against. */
export function preferenceTargetIds(
  preference: PreferenceDefinition,
): CharacterId[] {
  switch (preference.target.type) {
    case "character":
      return [preference.target.characterId];
    case "characters":
      return preference.target.characterIds;
    case "none":
      return [];
  }
}

/**
 * Whether a preference can ever come into play given the guests invited to a
 * level. Every character always carries the same set of preferences, but a
 * target-dependent condition only matters when at least one valid target is
 * present:
 * - the owner must be one of the level's guests;
 * - a `character` target must also be present (and not be the owner);
 * - a `characters` target needs at least one present member (other than the
 *   owner);
 * - a `none` target (a seat-based condition such as end-seat) is active
 *   whenever the owner is present.
 *
 * A condition that is not applicable is inactive: it awards no points and is
 * not considered fulfilled/unfulfilled/avoided/violated, so it is hidden from
 * the in-level preference UI.
 */
export function isPreferenceApplicable(
  preference: PreferenceDefinition,
  presentCharacterIds: readonly CharacterId[],
): boolean {
  if (!presentCharacterIds.includes(preference.ownerId)) {
    return false;
  }

  if (preference.target.type === "none") {
    return true;
  }

  return preferenceTargetIds(preference).some(
    (targetId) =>
      targetId !== preference.ownerId && presentCharacterIds.includes(targetId),
  );
}

/**
 * The preferences that apply to a level, derived from the guests present rather
 * than hand-listed per level. Insertion order of PREFERENCES is preserved so a
 * character's preferences always appear in the same order.
 */
export function getActivePreferencesForLevel(
  presentCharacterIds: readonly CharacterId[],
): PreferenceDefinition[] {
  return Object.values(PREFERENCES).filter((preference) =>
    isPreferenceApplicable(preference, presentCharacterIds),
  );
}

/** Every canonical preference belonging to the given owner. */
export function getPreferencesForOwner(
  ownerId: CharacterId,
): PreferenceDefinition[] {
  return Object.values(PREFERENCES).filter(
    (preference) => preference.ownerId === ownerId,
  );
}
