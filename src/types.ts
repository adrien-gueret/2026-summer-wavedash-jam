// Domain model for Table for Trouble.

/* ----------------------------- Characters ------------------------------ */

export type CharacterId =
  | "martha"
  | "henry"
  | "rex"
  | "bree"
  | "susan"
  | "karl"
  | "paul"
  | "angela"
  | "julie"
  | "andrew"
  | "danielle"
  | "zach";

export type CharacterTag = "adult" | "child" | "teen";

export type CharacterDefinition = {
  id: CharacterId;
  displayName: string;
  familyRole: string;
  /** A short, player-friendly biography shown on the About the Family page. */
  description: string;
  /** A concise role label shown under the portrait on a family-tree node. */
  treeLabel: string;
  tags: CharacterTag[];
};

/* -------------------------------- Table -------------------------------- */

export type SeatId = string;

export type SeatPair = readonly [SeatId, SeatId];

export type SeatDefinition = {
  id: SeatId;
  label: string;
  position: {
    x: number;
    y: number;
  };
};

export type TableDefinition = {
  id: string;
  seats: SeatDefinition[];
  adjacentSeatPairs: SeatPair[];
  oppositeSeatPairs: SeatPair[];
  /**
   * The seats that count as "end" seats for end-seat preferences. Declared
   * explicitly here and never inferred from seat indices or coordinates.
   */
  endSeatIds: SeatId[];
};

/**
 * A mapping of seat id to the character currently occupying it, or `null` when
 * the seat is empty. Every seat of the table is always present as a key.
 */
export type SeatingPlan = Record<SeatId, CharacterId | null>;

/** Where a dragged guest can be dropped: onto a seat, or back to the tray. */
export type DropTarget = { type: "seat"; seatId: SeatId } | { type: "tray" };

/* ----------------------------- Preferences ----------------------------- */

/**
 * Who a preference is measured against. A `character` target names a single
 * relative; a `characters` target is satisfied once when at least one of the
 * listed relatives satisfies the condition ("once" aggregation); `none` is used
 * by seat-based conditions such as end-seat that depend only on the owner.
 */
export type PreferenceTarget =
  | {
      type: "character";
      characterId: CharacterId;
    }
  | {
      type: "characters";
      characterIds: CharacterId[];
    }
  | {
      type: "none";
    };

export type PreferenceCondition =
  "adjacent" | "opposite" | "end-seat" | "adjacent-or-opposite";

export type PreferenceDefinition = {
  id: string;
  ownerId: CharacterId;
  description: string;
  target: PreferenceTarget;
  condition: PreferenceCondition;
  /** Positive values reward fulfilment, negative values penalize violation. */
  points: number;
};

/* -------------------------------- Levels ------------------------------- */

export type LevelDefinition = {
  id: string;
  title: string;
  description: string;
  tables: TableDefinition[];
  characterIds: CharacterId[];
  initialSeating: SeatingPlan;
};

/* ------------------------------ Scoring -------------------------------- */

export type PreferenceEvaluationStatus =
  "inactive" | "pending" | "fulfilled" | "unfulfilled" | "avoided" | "violated";

export type PreferenceEvaluation = {
  preferenceId: string;
  ownerId: CharacterId;
  isTriggered: boolean;
  pointsAwarded: number;
  status: PreferenceEvaluationStatus;
};

export type CharacterScoreBreakdown = {
  characterId: CharacterId;
  score: number;
  preferences: PreferenceEvaluation[];
};

export type ScoreResult = {
  total: number;
  characters: CharacterScoreBreakdown[];
};

/** The facial expression used to illustrate a character's current mood. */
export type CharacterExpression = "neutral" | "happy" | "sad";

/**
 * How a seated guest relates to the currently inspected character's
 * preferences: "wanted" for a guest they like sitting near, "unwanted" for one
 * they would rather avoid. Used to highlight the relevant seats.
 */
export type SeatRelation = "wanted" | "unwanted";

/* ------------------------------- State --------------------------------- */

export type PersistentState = {
  unlockedLevelIds: string[];
  completedLevelIds: string[];
  bestScoresByLevelId: Record<string, number>;
  worstScoresByLevelId: Record<string, number>;
};

export type UIState = Record<string, never>;

/* ----------------------------- Family tree ----------------------------- */

/** Whether a couple are still together or have separated. */
export type PartnerRelationshipStatus = "current" | "former";

export type PartnerRelationship = {
  firstCharacterId: CharacterId;
  secondCharacterId: CharacterId;
  status: PartnerRelationshipStatus;
};

export type ParentChildRelationship = {
  parentIds: CharacterId[];
  childIds: CharacterId[];
};

export type FamilyTreeDefinition = {
  partnerRelationships: PartnerRelationship[];
  parentChildRelationships: ParentChildRelationship[];
};
