import type {
  CharacterExpression,
  CharacterId,
  CharacterScoreBreakdown,
  LevelDefinition,
  PreferenceDefinition,
  PreferenceEvaluation,
  PreferenceEvaluationStatus,
  ScoreResult,
  SeatId,
  SeatPair,
  SeatingPlan,
} from "@/types";

import {
  getActivePreferencesForLevel,
  isPreferenceApplicable,
  preferenceTargetIds,
} from "@/data/preferences";

import {
  areSeatsRelated,
  collectAdjacentPairs,
  collectEndSeatIds,
  collectOppositePairs,
  collectSeatIds,
} from "./geometry";
import { getSeatByCharacter } from "./seating";

function resolveStatus(
  points: number,
  isTriggered: boolean,
): PreferenceEvaluationStatus {
  const isPositive = points >= 0;

  if (isPositive) {
    return isTriggered ? "fulfilled" : "unfulfilled";
  }

  return isTriggered ? "violated" : "avoided";
}

/**
 * The seat relationships a preference is measured against, gathered from every
 * table in the level. `adjacent-or-opposite` combines both pair sets so a
 * single condition can trigger on either relationship.
 */
function pairsForCondition(
  condition: PreferenceDefinition["condition"],
  level: LevelDefinition,
): SeatPair[] {
  switch (condition) {
    case "adjacent":
      return collectAdjacentPairs(level.tables);
    case "opposite":
      return collectOppositePairs(level.tables);
    case "adjacent-or-opposite":
      return [
        ...collectAdjacentPairs(level.tables),
        ...collectOppositePairs(level.tables),
      ];
    case "end-seat":
      return [];
  }
}

/**
 * Evaluates a single preference from its owner's perspective against the
 * current seating plan.
 *
 * A preference that is not applicable to the level (none of its target
 * characters are invited) is `inactive`: it awards no points and is neither
 * fulfilled/unfulfilled nor avoided/violated. While its owner is still waiting
 * to be seated the preference is `pending`: it cannot be judged yet, so it also
 * awards no points and shows only what is at stake. Multi-target conditions use
 * "once" aggregation — they trigger a single time when at least one target
 * satisfies the relationship, never once per matching target.
 */
export function evaluatePreference(
  preference: PreferenceDefinition,
  seatingPlan: SeatingPlan,
  level: LevelDefinition,
): PreferenceEvaluation {
  if (!isPreferenceApplicable(preference, level.characterIds)) {
    return {
      preferenceId: preference.id,
      ownerId: preference.ownerId,
      isTriggered: false,
      pointsAwarded: 0,
      status: "inactive",
    };
  }

  const seatByCharacter = getSeatByCharacter(seatingPlan);
  const ownerSeatId: SeatId | undefined = seatByCharacter[preference.ownerId];

  // The owner has not taken a seat yet, so the condition cannot be judged.
  if (!ownerSeatId) {
    return {
      preferenceId: preference.id,
      ownerId: preference.ownerId,
      isTriggered: false,
      pointsAwarded: 0,
      status: "pending",
    };
  }

  const pairs = pairsForCondition(preference.condition, level);
  const isTriggered =
    preference.condition === "end-seat"
      ? collectEndSeatIds(level.tables).includes(ownerSeatId)
      : preferenceTargetIds(preference).some((targetId) => {
          if (targetId === preference.ownerId) {
            return false;
          }
          if (!level.characterIds.includes(targetId)) {
            return false;
          }
          const targetSeatId = seatByCharacter[targetId];
          return (
            Boolean(targetSeatId) &&
            areSeatsRelated(ownerSeatId, targetSeatId, pairs)
          );
        });

  const pointsAwarded = isTriggered ? preference.points : 0;

  return {
    preferenceId: preference.id,
    ownerId: preference.ownerId,
    isTriggered,
    pointsAwarded,
    status: resolveStatus(preference.points, isTriggered),
  };
}

/**
 * Computes the full harmony score for a seating plan by evaluating every
 * active preference and grouping the results per character. Inactive
 * preferences are left out entirely, so they never appear in a breakdown nor
 * affect the total. The total is the sum of all awarded points and can be
 * negative.
 */
export function computeSeatingScore(
  level: LevelDefinition,
  seatingPlan: SeatingPlan,
): ScoreResult {
  const evaluations = getActivePreferencesForLevel(level.characterIds).map(
    (preference) => evaluatePreference(preference, seatingPlan, level),
  );

  const breakdownByCharacter = new Map<CharacterId, CharacterScoreBreakdown>();

  for (const characterId of level.characterIds) {
    breakdownByCharacter.set(characterId, {
      characterId,
      score: 0,
      preferences: [],
    });
  }

  let total = 0;

  for (const evaluation of evaluations) {
    total += evaluation.pointsAwarded;

    const breakdown = breakdownByCharacter.get(evaluation.ownerId);
    if (breakdown) {
      breakdown.score += evaluation.pointsAwarded;
      breakdown.preferences.push(evaluation);
    }
  }

  return {
    total,
    characters: level.characterIds.map((characterId) =>
      breakdownByCharacter.get(characterId)!,
    ),
  };
}

/**
 * Maps a character's harmony score to a facial expression: happy when they
 * come out ahead, sad when their preferences are violated, neutral otherwise.
 */
export function expressionForScore(score: number): CharacterExpression {
  if (score > 0) {
    return "happy";
  }
  if (score < 0) {
    return "sad";
  }
  return "neutral";
}

function* permutations<T>(items: T[]): Generator<T[]> {
  if (items.length <= 1) {
    yield items.slice();
    return;
  }
  for (let index = 0; index < items.length; index += 1) {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const perm of permutations(rest)) {
      yield [items[index], ...perm];
    }
  }
}

/**
 * The percentile of all possible seating scores used as a level's completion
 * target. At 80, only the top ~20% of every conceivable seating meets or beats
 * it, so it rewards a genuinely good plan without demanding the optimum.
 */
const TARGET_PERCENTILE = 80;

type LevelScoreStats = { worst: number; best: number; target: number };

const scoreStatsCache = new Map<string, LevelScoreStats>();

/**
 * Statistics over every possible seating of a level's guests: the lowest and
 * highest achievable totals plus the target score (a percentile of the whole
 * distribution). When a level ships precomputed `scoreStats` (generated offline
 * by `scripts/computeLevelStats.ts`) those values are used directly, so the
 * game never enumerates the up-to-12! permutations at runtime. Otherwise the
 * stats are brute-forced from the level's characters, preferences and table
 * geometry — only viable for small tables — and memoized per level id.
 */
function computeScoreStats(level: LevelDefinition): LevelScoreStats {
  if (level.scoreStats !== undefined) {
    const { worst, target, perfect } = level.scoreStats;
    return { worst, best: perfect, target };
  }

  const cached = scoreStatsCache.get(level.id);
  if (cached !== undefined) {
    return cached;
  }

  const seatIds = collectSeatIds(level.tables);
  const emptyPlan: SeatingPlan = {};
  for (const seatId of seatIds) {
    emptyPlan[seatId] = null;
  }

  const totals: number[] = [];
  for (const seatOrder of permutations(seatIds)) {
    const plan: SeatingPlan = { ...emptyPlan };
    level.characterIds.forEach((characterId, index) => {
      plan[seatOrder[index]] = characterId;
    });
    totals.push(computeSeatingScore(level, plan).total);
  }
  totals.sort((first, second) => first - second);

  const rank = Math.ceil((TARGET_PERCENTILE / 100) * totals.length);
  const targetIndex = Math.min(totals.length - 1, Math.max(0, rank - 1));

  const stats: LevelScoreStats = {
    worst: totals[0],
    best: totals[totals.length - 1],
    target: totals[targetIndex],
  };
  scoreStatsCache.set(level.id, stats);
  return stats;
}

/** The highest harmony total achievable for a level. */
export function computePerfectScore(level: LevelDefinition): number {
  return computeScoreStats(level).best;
}

/** The lowest harmony total achievable for a level. */
export function computeWorstScore(level: LevelDefinition): number {
  return computeScoreStats(level).worst;
}

/**
 * The completion target for a level: the TARGET_PERCENTILE-th percentile of all
 * possible seating scores.
 */
export function computeTargetScore(level: LevelDefinition): number {
  return computeScoreStats(level).target;
}
