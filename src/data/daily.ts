import type { CharacterId, LevelDefinition, TableDefinition } from "@/types";

import { emptySeating } from "./levels";
import { getActivePreferencesForLevel } from "./preferences";
import { tableForEight, tableForSix } from "./tables";

/**
 * The full, fixed roster the daily draw picks from. Declared as an explicit
 * ordered array (rather than reading object keys) so the seeded shuffle is
 * stable regardless of how `CHARACTERS` happens to be enumerated.
 */
const CHARACTER_POOL: CharacterId[] = [
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
];

/** Smallest and largest guest counts a daily dinner can draw. */
const MIN_GUESTS = 5;
const MAX_GUESTS = 8;

/**
 * How many times the draw may advance its seed looking for a roster that
 * activates at least one preference before it gives up and keeps the last
 * roster anyway. Large enough that a fun roster is found in practice.
 */
const MAX_REROLLS = 64;

/** Prefix of the synthetic level id, e.g. `daily-2026-07-24`. */
export const DAILY_LEVEL_ID_PREFIX = "daily-";

/**
 * Placeholder flavour text shared by every daily dinner. The wording is
 * intentionally generic (the guests change every day) and is meant to be
 * refined later.
 */
const DAILY_DESCRIPTION =
  "Another day, another questionable family dinner. Seat today's guests, keep " +
  "the peace... or deliberately ruin everything.";

const DAILY_STORY = {
  targetScoreMessage:
    "The plates are empty and nobody has stormed out. Today's dinner is a success.",
  perfectScoreMessage:
    "Against all expectations, today's family dinner was absolutely perfect.",
  worstScoreMessage:
    "Raised voices, awkward silences and one very broken evening. A perfect disaster.",
};

/**
 * A small, fast, deterministic PRNG (mulberry32). Given the same seed it always
 * produces the same sequence, which is what makes the daily dinner identical
 * for every player.
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The UTC calendar date, formatted as `YYYY-MM-DD`. */
export function getDailyDateKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Milliseconds remaining until the next daily dinner unlocks, i.e. the next
 * UTC midnight. Since the draw is keyed on the UTC calendar date, the puzzle
 * rolls over at 00:00 UTC.
 */
export function msUntilNextDaily(date: Date = new Date()): number {
  const nextMidnightUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
  );
  return nextMidnightUtc - date.getTime();
}

/** Turns a `YYYY-MM-DD` key into a stable integer seed. */
function dateKeyToSeed(dateKey: string): number {
  return Number(dateKey.replace(/-/g, ""));
}

/** A seeded Fisher-Yates shuffle that never mutates its input. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

/** The banquet table that seats the given guest count (rounded up to 6 or 8). */
function tableForGuestCount(guestCount: number): TableDefinition {
  return guestCount <= 6 ? tableForSix : tableForEight;
}

/**
 * Draws the roster for a daily seed. Advances the PRNG until it lands on a
 * roster that activates at least one preference (so the puzzle is never flat),
 * falling back to the last draw after `MAX_REROLLS` attempts.
 */
function drawRoster(random: () => number): CharacterId[] {
  let roster: CharacterId[] = [];
  for (let attempt = 0; attempt < MAX_REROLLS; attempt += 1) {
    const guestCount =
      MIN_GUESTS + Math.floor(random() * (MAX_GUESTS - MIN_GUESTS + 1));
    roster = shuffle(CHARACTER_POOL, random).slice(0, guestCount);
    if (getActivePreferencesForLevel(roster).length > 0) {
      return roster;
    }
  }
  return roster;
}

/** The player-facing title, e.g. `Dinner of the day 2026/07/24`. */
function titleForDateKey(dateKey: string): string {
  return `Dinner of the day ${dateKey.replace(/-/g, "/")}`;
}

/**
 * Builds today's (or a given day's) daily dinner. The result is fully
 * determined by the UTC date, so every player gets the same guests, table and
 * title on the same day. No precomputed `scoreStats` are attached: with at most
 * eight guests the score bounds are cheap enough to brute-force at runtime (see
 * `game/scoring.ts`).
 */
export function getDailyLevel(
  dateKey: string = getDailyDateKey(),
): LevelDefinition {
  const random = mulberry32(dateKeyToSeed(dateKey));
  const characterIds = drawRoster(random);
  const tables = [tableForGuestCount(characterIds.length)];

  return {
    id: `${DAILY_LEVEL_ID_PREFIX}${dateKey}`,
    title: titleForDateKey(dateKey),
    description: DAILY_DESCRIPTION,
    tables,
    characterIds,
    initialSeating: emptySeating(tables),
    story: DAILY_STORY,
  };
}
