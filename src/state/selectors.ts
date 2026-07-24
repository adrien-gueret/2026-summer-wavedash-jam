import type { PersistentState } from "@/types";

export function selectBestScore(
  state: PersistentState,
  levelId: string,
): number | undefined {
  return state.bestScoresByLevelId[levelId];
}

export function selectWorstScore(
  state: PersistentState,
  levelId: string,
): number | undefined {
  return state.worstScoresByLevelId?.[levelId];
}

export function selectIsLevelCompleted(
  state: PersistentState,
  levelId: string,
): boolean {
  return state.completedLevelIds.includes(levelId);
}

export function selectIsLevelUnlocked(
  state: PersistentState,
  levelId: string,
): boolean {
  return state.unlockedLevelIds.includes(levelId);
}

/**
 * Whether the player has finished at least one campaign dinner. Used to gate
 * the daily dinner, which only unlocks once the player has completed a level.
 */
export function selectHasCompletedAnyLevel(state: PersistentState): boolean {
  return state.completedLevelIds.length > 0;
}

export function selectDailyScore(
  state: PersistentState,
  dateKey: string,
): number | undefined {
  return state.dailyScoresByDate?.[dateKey];
}

export function selectHasPlayedDaily(
  state: PersistentState,
  dateKey: string,
): boolean {
  return state.dailyScoresByDate?.[dateKey] !== undefined;
}
