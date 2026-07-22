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
