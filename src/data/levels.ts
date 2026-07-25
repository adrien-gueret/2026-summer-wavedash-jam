import type { LevelDefinition, SeatingPlan, TableDefinition } from "@/types";

import {
  getActivePreferencesForLevel,
  preferenceTargetIds,
} from "./preferences";
import {
  tableForEight,
  tableForSix,
  tableForTen,
  tableForTwelve,
} from "./tables";

export type LevelListEntry = {
  id: string;
  number: number;
  title: string;
  definition: LevelDefinition;
};

/** An all-empty seating plan covering every seat of the given tables. */
export function emptySeating(tables: TableDefinition[]): SeatingPlan {
  const plan: SeatingPlan = {};
  for (const table of tables) {
    for (const seat of table.seats) {
      plan[seat.id] = null;
    }
  }
  return plan;
}

/**
 * The dinner campaign: ten seatings that escalate from a cosy table for five
 * to the entire family at one table. The guest lists change every level while
 * the classic banquet-table layout stays familiar, so the difficulty comes
 * from the guests and their relationships rather than the geometry. The
 * per-character preferences in `data/preferences.ts` are fixed and shared; each
 * level simply activates the subset whose owner and targets are invited.
 *
 * Odd guest counts (five in Dinners 1-2, eleven in Dinner 9) sit at the next
 * even table with one empty seat so every table keeps clean opposite pairs.
 */
const levelData: Array<Omit<LevelDefinition, "initialSeating">> = [
  {
    id: "1",
    title: "A Cosy Table for Five",
    description:
      "Martha and Henry welcome Paul, Angela and young Zach. Seat all five guests to make the evening as warm as possible.",
    tables: [tableForSix],
    characterIds: ["martha", "henry", "paul", "angela", "zach"],
    story: {
      targetScoreMessage:
        "Dinner saved. It was not perfect, but everyone made it through dessert.",
      perfectScoreMessage:
        "The first dinner ends with full plates, warm smiles and not a single awkward silence.",
      worstScoreMessage:
        "Zach is sulking, Angela wants to leave, and Henry has stopped pretending to enjoy himself.",
    },
  },
  {
    id: "2",
    title: "The Other Side of the Family",
    description:
      "Martha promised Rex and Bree a quiet dinner with Andrew and Danielle. She may have underestimated how much the seating plan matters.",
    tables: [tableForSix],
    characterIds: ["martha", "rex", "bree", "andrew", "danielle"],
    story: {
      targetScoreMessage:
        "Not flawless, but the children are fed and nobody left early. A solid dinner.",
      perfectScoreMessage:
        "The children are happy, the adults are relaxed, and Martha is already planning the next dinner.",
      worstScoreMessage:
        "Andrew and Danielle are arguing, Martha is offended, and dessert has been cancelled.",
    },
  },
  {
    id: "3",
    title: "Grandpa Joins the Table",
    description:
      "Henry is back at the table, and everyone has a preferred place. What was simple yesterday is suddenly much less obvious.",
    tables: [tableForSix],
    characterIds: ["martha", "henry", "rex", "bree", "andrew", "danielle"],
    story: {
      targetScoreMessage:
        "A few grumbles, a few smiles - Henry stayed at the table, so call it a win.",
      perfectScoreMessage:
        "Even Henry admits that the evening was surprisingly pleasant.",
      worstScoreMessage:
        "Henry has found the quietest room in the house. Unfortunately, it is not the dining room.",
    },
  },
  {
    id: "4",
    title: "Susan Has Opinions",
    description:
      "Susan has joined Rex and Bree for dinner. Nobody remembers who invited her, and Bree is trying very hard to remain polite.",
    tables: [tableForEight],
    characterIds: [
      "martha",
      "henry",
      "rex",
      "bree",
      "andrew",
      "danielle",
      "susan",
    ],
    story: {
      targetScoreMessage:
        "Bree and Susan traded only a couple of sharp looks. The dinner survives.",
      perfectScoreMessage:
        "Susan and Bree make it through dinner without a single sharp remark. A minor miracle.",
      worstScoreMessage:
        "Bree and Susan are no longer speaking. Everyone else wishes they had started sooner.",
    },
  },
  {
    id: "5",
    title: "The Ex Factor",
    description:
      "Susan and Karl have both come for Julie. Paul and Angela promised to keep things civil; Zach just wants to sit with his cousin.",
    tables: [tableForSix],
    characterIds: ["susan", "karl", "paul", "angela", "julie", "zach"],
    story: {
      targetScoreMessage:
        "The evening had its tense moments, but Julie still got to enjoy her cousin.",
      perfectScoreMessage:
        "Susan and Karl behave, Julie enjoys herself, and Paul does not need to mediate once.",
      worstScoreMessage:
        "Susan and Karl are arguing, Julie is trapped in the middle, and Paul has given up on diplomacy.",
    },
  },
  {
    id: "6",
    title: "Adults Only",
    description:
      "The children have been sent elsewhere for the evening. Unfortunately, the adults are perfectly capable of creating trouble on their own.",
    tables: [tableForEight],
    characterIds: [
      "martha",
      "henry",
      "rex",
      "bree",
      "susan",
      "karl",
      "paul",
      "angela",
    ],
    story: {
      targetScoreMessage:
        "The adults bickered a little, yet everyone stayed seated until dessert.",
      perfectScoreMessage:
        "Eight adults, zero arguments. Historians will question whether this dinner ever happened.",
      worstScoreMessage:
        "No children were invited, yet the evening still ends with someone storming out.",
    },
  },
  {
    id: "7",
    title: "The Grown-Ups Are Outnumbered",
    description:
      "Four younger guests, four adults, and no separate kids' table. Henry is already regretting this arrangement.",
    tables: [tableForEight],
    characterIds: [
      "henry",
      "bree",
      "susan",
      "angela",
      "julie",
      "andrew",
      "danielle",
      "zach",
    ],
    story: {
      targetScoreMessage:
        "A little chaos, a little patience - somehow the table held together.",
      perfectScoreMessage:
        "The younger guests have fun, the adults keep their patience, and nobody asks for a separate table.",
      worstScoreMessage:
        "The adults lose control of the table. The younger guests will be discussing this dinner for years.",
    },
  },
  {
    id: "8",
    title: "Everyone Has an Opinion",
    description:
      "The guest list has grown faster than the table. Everyone knows someone they want nearby - and someone they absolutely do not.",
    tables: [tableForTen],
    characterIds: [
      "martha",
      "henry",
      "rex",
      "bree",
      "susan",
      "angela",
      "julie",
      "andrew",
      "danielle",
      "zach",
    ],
    story: {
      targetScoreMessage:
        "Ten opinions, one table, and a dinner that mostly went to plan.",
      perfectScoreMessage:
        "Ten guests, one table, and somehow every conversation lands in exactly the right place.",
      worstScoreMessage:
        "Every conversation becomes the wrong conversation. The table has achieved perfect disharmony.",
    },
  },
  {
    id: "9",
    title: "Zach Has Other Plans",
    description:
      "Zach has found a very convenient excuse to stay home. The other eleven are determined to prove that the dinner can still work.",
    tables: [tableForTwelve],
    characterIds: [
      "martha",
      "henry",
      "rex",
      "bree",
      "susan",
      "karl",
      "paul",
      "angela",
      "julie",
      "andrew",
      "danielle",
    ],
    story: {
      targetScoreMessage:
        "Eleven guests, plenty of near-misses, but the dinner comes together.",
      perfectScoreMessage:
        "Zach receives photos of a suspiciously peaceful dinner and almost regrets staying home.",
      worstScoreMessage:
        "Zach's excuse suddenly looks less convenient and more prophetic.",
    },
  },
  {
    id: "10",
    title: "One Big Happy Family",
    description:
      "Martha has finally gathered the entire family around one table. One big happy family. In theory.",
    tables: [tableForTwelve],
    characterIds: [
      "martha",
      "henry",
      "rex",
      "bree",
      "susan",
      "karl",
      "paul",
      "angela",
      "julie",
      "andrew",
      "danielle",
      "zach",
    ],
    story: {
      targetScoreMessage:
        "The whole family at one table, and against the odds, dinner is saved.",
      perfectScoreMessage:
        "Against every law of family gatherings, the whole family has a perfect evening.",
      worstScoreMessage:
        "The entire family agrees on one thing: this dinner should never have happened.",
    },
  },
];

/**
 * Precomputed worst / target / perfect totals keyed by level id. Generated
 * offline by brute-forcing every seating (see `scripts/computeLevelStats.ts`)
 * so the game never enumerates permutations at runtime. Recompute and update
 * these whenever a roster, table or preference rule changes.
 */
const SCORE_STATS: Record<string, LevelDefinition["scoreStats"]> = {
  "1": { worst: -16, target: 8, perfect: 17 },
  "2": { worst: -2, target: 24, perfect: 36 },
  "3": { worst: -10, target: 24, perfect: 48 },
  "4": { worst: -34, target: 15, perfect: 48 },
  "5": { worst: -24, target: 7, perfect: 19 },
  "6": { worst: -31, target: 7, perfect: 39 },
  "7": { worst: -25, target: 13, perfect: 37 },
  "8": { worst: -33, target: 21, perfect: 66 },
  "9": { worst: -46, target: 13, perfect: 64 },
  "10": { worst: -48, target: 18, perfect: 76 },
};

export const LEVELS: LevelDefinition[] = levelData.map((level) => ({
  ...level,
  initialSeating: emptySeating(level.tables),
  scoreStats: SCORE_STATS[level.id],
}));

export const LEVEL_LIST: LevelListEntry[] = LEVELS.map((definition, index) => ({
  id: definition.id,
  number: index + 1,
  title: definition.title,
  definition,
}));

export function getLevel(levelId: string): LevelDefinition | undefined {
  return LEVELS.find((level) => level.id === levelId);
}

/**
 * Returns the level's display number: its 1-based position in the `LEVELS`
 * array. Returns 0 when the id is unknown.
 */
export function getLevelNumber(levelId: string): number {
  return LEVELS.findIndex((level) => level.id === levelId) + 1;
}

/**
 * Returns the next playable level after the given one (by array order), or
 * `undefined` when the given level is the last one that exists. Used to decide
 * whether the result modal offers "Next Level" (navigate onward) or "Next"
 * (finish the game and head to the congratulations screen).
 */
export function getNextLevel(levelId: string): LevelDefinition | undefined {
  const index = LEVELS.findIndex((level) => level.id === levelId);
  if (index === -1) {
    return undefined;
  }
  return LEVELS[index + 1];
}

/**
 * Reports level-configuration inconsistencies. Currently this catches a level
 * that invites a character whose active end-seat preference cannot be honoured
 * because none of its tables declare any end seats. Such a condition must never
 * be silently treated as inactive - end-seat preferences stay active whenever
 * their owner is present, so a missing endSeatIds is a genuine authoring bug.
 * Returns a list of human-readable problems (empty when the level is valid).
 */
export function validateLevel(level: LevelDefinition): string[] {
  const problems: string[] = [];

  const hasEndSeats = level.tables.some((table) => table.endSeatIds.length > 0);

  if (!hasEndSeats) {
    const endSeatOwners = getActivePreferencesForLevel(level.characterIds)
      .filter(
        (preference) =>
          preference.condition === "end-seat" &&
          preferenceTargetIds(preference).length === 0,
      )
      .map((preference) => preference.ownerId);

    for (const ownerId of new Set(endSeatOwners)) {
      problems.push(
        `Level ${level.id} invites ${ownerId}, who has an end-seat preference, ` +
          "but none of its tables declare any end seats (endSeatIds is empty).",
      );
    }
  }

  return problems;
}
