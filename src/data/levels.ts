import type { LevelDefinition } from "@/types";

import {
  getActivePreferencesForLevel,
  preferenceTargetIds,
} from "./preferences";
import { ovalTableForSix } from "./tables";

/**
 * Level 1: "A Cosy Table for Five".
 *
 * A gentle introduction seating the grandparents, Paul and Angela and their
 * son Zach. Everyone starts in the waiting area and the table is empty. Each
 * character always carries the same preferences (defined once in
 * data/preferences.ts); the game derives which ones apply here from the guests
 * present, so a preference whose target is absent is simply left out. The
 * completion target and the best/worst achievable scores are likewise derived
 * from the level's rules (see computeTargetScore, computePerfectScore,
 * computeWorstScore), not stored here. Submission is only allowed once every
 * guest has a seat.
 */
const levelOne: LevelDefinition = {
  id: "1",
  number: 1,
  title: "A Cosy Table for Five",
  description:
    "Martha and Henry welcome Paul, Angela and young Zach. Seat all five guests to make the evening as warm as possible.",
  unlockedByDefault: true,
  tables: [ovalTableForSix],
  characterIds: ["martha", "henry", "paul", "angela", "zach"],
  initialSeating: {
    "seat-0": null,
    "seat-1": null,
    "seat-2": null,
    "seat-3": null,
    "seat-4": null,
    "seat-5": null,
  },
};

/**
 * Level 2: "A Small Family Dinner".
 *
 * Seat the six guests as harmoniously as possible. Like every level, the rules
 * come from the shared preference profiles; only those whose owner and at least
 * one target are present here contribute.
 */
const levelTwo: LevelDefinition = {
  id: "2",
  number: 2,
  title: "A Small Family Dinner",
  description:
    "Everyone is waiting. Seat all six guests to make the dinner as harmonious as possible.",
  unlockedByDefault: false,
  tables: [ovalTableForSix],
  characterIds: ["martha", "henry", "andrew", "danielle", "rex", "bree"],
  initialSeating: {
    "seat-0": null,
    "seat-1": null,
    "seat-2": null,
    "seat-3": null,
    "seat-4": null,
    "seat-5": null,
  },
};

/**
 * Level 3: "A Delicate Balance".
 *
 * Seats the two youngest branches together: Paul, Angela and their son Zach
 * alongside Susan, her former partner Karl and their daughter Julie. With old
 * tensions in the room, finding a peaceful arrangement takes some care.
 */
const levelThree: LevelDefinition = {
  id: "3",
  number: 3,
  title: "A Delicate Balance",
  description:
    "Paul, Angela and Zach join Susan, Karl and Julie. Seat all six guests so the evening stays as peaceful as possible.",
  unlockedByDefault: false,
  tables: [ovalTableForSix],
  characterIds: ["paul", "angela", "zach", "susan", "karl", "julie"],
  initialSeating: {
    "seat-0": null,
    "seat-1": null,
    "seat-2": null,
    "seat-3": null,
    "seat-4": null,
    "seat-5": null,
  },
};

/**
 * All ten level slots. Only Levels 1 to 3 are fully defined and playable in
 * this proof of concept; Levels 4 to 10 are locked placeholders driven by data
 * so the select screen never hardcodes ten JSX blocks.
 */
export type LevelListEntry = {
  id: string;
  number: number;
  title: string;
  isPlayable: boolean;
  definition?: LevelDefinition;
};

export const LEVELS: LevelDefinition[] = [levelOne, levelTwo, levelThree];

export const LEVEL_LIST: LevelListEntry[] = Array.from(
  { length: 10 },
  (_, index) => {
    const number = index + 1;
    const definition = LEVELS.find((level) => level.number === number);

    return {
      id: String(number),
      number,
      title: definition ? definition.title : "Locked",
      isPlayable: Boolean(definition),
      definition,
    };
  },
);

export function getLevel(levelId: string): LevelDefinition | undefined {
  return LEVELS.find((level) => level.id === levelId);
}

/**
 * Returns the next playable level after the given one (by level number), or
 * `undefined` when the given level is the last one that exists. Used to decide
 * whether the result modal offers "Next Level" (navigate onward) or "Next"
 * (finish the game and head to the congratulations screen).
 */
export function getNextLevel(levelId: string): LevelDefinition | undefined {
  const current = getLevel(levelId);
  if (!current) {
    return undefined;
  }
  return LEVELS.filter((level) => level.number > current.number).sort(
    (a, b) => a.number - b.number,
  )[0];
}

/**
 * Reports level-configuration inconsistencies. Currently this catches a level
 * that invites a character whose active end-seat preference cannot be honoured
 * because none of its tables declare any end seats. Such a condition must never
 * be silently treated as inactive — end-seat preferences stay active whenever
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
