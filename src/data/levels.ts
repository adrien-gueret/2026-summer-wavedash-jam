import type { LevelDefinition } from "@/types";

import {
  getActivePreferencesForLevel,
  preferenceTargetIds,
} from "./preferences";
import { tableForSix } from "./tables";

export type LevelListEntry = {
  id: string;
  number: number;
  title: string;
  isPlayable: boolean;
  definition?: LevelDefinition;
};

export const LEVELS: LevelDefinition[] = [
  {
    id: "1",
    title: "A Cosy Table for Five",
    description:
      "Martha and Henry welcome Paul, Angela and young Zach. Seat all five guests to make the evening as warm as possible.",
    tables: [tableForSix],
    characterIds: ["martha", "henry", "paul", "angela", "zach"],
    initialSeating: {
      "seat-0": null,
      "seat-1": null,
      "seat-2": null,
      "seat-3": null,
      "seat-4": null,
      "seat-5": null,
    },
  },
  {
    id: "2",
    title: "A Small Family Dinner",
    description:
      "Everyone is waiting. Seat all six guests to make the dinner as harmonious as possible.",
    tables: [tableForSix],
    characterIds: ["martha", "henry", "andrew", "danielle", "rex", "bree"],
    initialSeating: {
      "seat-0": null,
      "seat-1": null,
      "seat-2": null,
      "seat-3": null,
      "seat-4": null,
      "seat-5": null,
    },
  },
  {
    id: "3",
    title: "A Delicate Balance",
    description:
      "Paul, Angela and Zach join Susan, Karl and Julie. Seat all six guests so the evening stays as peaceful as possible.",
    tables: [tableForSix],
    characterIds: ["paul", "angela", "zach", "susan", "karl", "julie"],
    initialSeating: {
      "seat-0": null,
      "seat-1": null,
      "seat-2": null,
      "seat-3": null,
      "seat-4": null,
      "seat-5": null,
    },
  },
  {
    id: "4",
    title: "TODO",
    description: "TODO",
    tables: [tableForSix],
    characterIds: ["martha", "henry", "paul", "angela", "zach"],
    initialSeating: {
      "seat-0": null,
      "seat-1": null,
      "seat-2": null,
      "seat-3": null,
      "seat-4": null,
      "seat-5": null,
    },
  },
];

export const LEVEL_LIST: LevelListEntry[] = Array.from(
  { length: 10 },
  (_, index) => {
    const number = index + 1;
    const definition = LEVELS[index];

    return {
      id: definition ? definition.id : String(number),
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
