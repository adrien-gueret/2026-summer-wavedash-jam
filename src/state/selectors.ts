import type { DailyObjective, PersistentState } from "@/types";

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

export function selectDailyObjectiveScore(
  state: PersistentState,
  dateKey: string,
  objective: DailyObjective,
): number | undefined {
  return state.dailyResultsByDate?.[dateKey]?.[objective];
}

export function selectHasPlayedDailyObjective(
  state: PersistentState,
  dateKey: string,
  objective: DailyObjective,
): boolean {
  return selectDailyObjectiveScore(state, dateKey, objective) !== undefined;
}

/** Whether both daily objectives have been played for the given date. */
export function selectHasPlayedAllDailyObjectives(
  state: PersistentState,
  dateKey: string,
): boolean {
  return (
    selectHasPlayedDailyObjective(state, dateKey, "best") &&
    selectHasPlayedDailyObjective(state, dateKey, "worst")
  );
}
