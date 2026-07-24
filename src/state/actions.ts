import type { DailyObjective, PersistentState } from "@/types";

import { getNextLevel } from "@/data/levels";
/* Persistent actions */

/**
 * Records the outcome of a submitted seating plan.
 * - Updates the best score for the level when the new score is higher.
 * - Updates the worst score for the level when the new score is lower, so the
 *   "disaster" challenge can track the lowest harmony ever reached.
 * - Marks the level as completed when the score reaches its target.
 * - Unlocks the next level (when one exists) as soon as the level is
 *   completed, so progression opens up one level at a time.
 */
export function submitLevelResult(
  state: PersistentState,
  payload: { levelId: string; score: number; targetScore: number },
): PersistentState {
  const { levelId, score, targetScore } = payload;

  const previousBest = state.bestScoresByLevelId[levelId];
  const bestScore =
    previousBest === undefined ? score : Math.max(previousBest, score);

  const previousWorst = state.worstScoresByLevelId?.[levelId];
  const worstScore =
    previousWorst === undefined ? score : Math.min(previousWorst, score);

  const isCompleted =
    score >= targetScore || state.completedLevelIds.includes(levelId);

  const completedLevelIds =
    isCompleted && !state.completedLevelIds.includes(levelId)
      ? [...state.completedLevelIds, levelId]
      : state.completedLevelIds;

  let unlockedLevelIds = state.unlockedLevelIds;
  if (isCompleted) {
    const nextLevel = getNextLevel(levelId);
    if (nextLevel && !unlockedLevelIds.includes(nextLevel.id)) {
      unlockedLevelIds = [...unlockedLevelIds, nextLevel.id];
    }
  }

  return {
    ...state,
    bestScoresByLevelId: {
      ...state.bestScoresByLevelId,
      [levelId]: bestScore,
    },
    worstScoresByLevelId: {
      ...state.worstScoresByLevelId,
      [levelId]: worstScore,
    },
    completedLevelIds,
    unlockedLevelIds,
  };
}

/**
 * Records the outcome of the daily dinner for one objective. Each objective
 * ("best" or "worst") can be submitted only once per day, so if a score
 * already exists for the given date and objective the state is returned
 * unchanged and the earlier score is kept.
 */
export function submitDailyResult(
  state: PersistentState,
  payload: { dateKey: string; objective: DailyObjective; score: number },
): PersistentState {
  const { dateKey, objective, score } = payload;
  const dailyResultsByDate = state.dailyResultsByDate ?? {};
  const dayResults = dailyResultsByDate[dateKey] ?? {};

  if (objective in dayResults) {
    return state;
  }

  return {
    ...state,
    dailyResultsByDate: {
      ...dailyResultsByDate,
      [dateKey]: {
        ...dayResults,
        [objective]: score,
      },
    },
  };
}
