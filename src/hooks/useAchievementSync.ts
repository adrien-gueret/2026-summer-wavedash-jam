import { useEffect } from "react";

import { LEVELS } from "@/data/levels";
import { computePerfectScore, computeWorstScore } from "@/game/scoring";
import { usePersistentSelector } from "@/state";

import { useAchievements } from "./useAchievements";

/** The number of campaign dinners; the threshold for every "all dinners" goal. */
const CAMPAIGN_COUNT = LEVELS.length;

/**
 * Watches the saved campaign and daily results and unlocks the achievements
 * that are fully derivable from them.
 *
 * Everything is recomputed from the save on each change and never incremented,
 * so replaying a level can never "double count": the set of succeeded /
 * perfected / disastered campaign levels is a pure function of the stored best
 * and worst scores. Unlocking is idempotent, so re-running is harmless.
 *
 * - `FIRST_/ALL_SUCCESS`  — campaign levels completed (score reached target).
 * - `FIRST_/ALL_PERFECT`  — best score reaches the level's perfect total.
 * - `FIRST_/ALL_DISASTER` — worst score reaches the level's worst total.
 * - `DAILY_FIRST`         — any daily dinner has been played.
 *
 * The remaining achievements (`EXACT_TARGET`, `NO_UNSEAT`,
 * `FAMILY_HISTORIAN`) are one-off events unlocked where they happen.
 */
export function useAchievementSync(): void {
  const unlock = useAchievements();

  const succeededCount = usePersistentSelector((state) =>
    LEVELS.reduce(
      (count, level) =>
        state.completedLevelIds.includes(level.id) ? count + 1 : count,
      0,
    ),
  );

  const perfectedCount = usePersistentSelector((state) =>
    LEVELS.reduce((count, level) => {
      const best = state.bestScoresByLevelId[level.id];
      return best !== undefined && best >= computePerfectScore(level)
        ? count + 1
        : count;
    }, 0),
  );

  const disasteredCount = usePersistentSelector((state) =>
    LEVELS.reduce((count, level) => {
      const worst = state.worstScoresByLevelId?.[level.id];
      return worst !== undefined && worst <= computeWorstScore(level)
        ? count + 1
        : count;
    }, 0),
  );

  const hasPlayedDaily = usePersistentSelector((state) =>
    Object.values(state.dailyResultsByDate ?? {}).some(
      (day) => Object.keys(day).length > 0,
    ),
  );

  useEffect(() => {
    if (succeededCount >= 1) {
      unlock("FIRST_SUCCESS");
    }
    if (succeededCount >= CAMPAIGN_COUNT) {
      unlock("ALL_SUCCESS");
    }
  }, [succeededCount, unlock]);

  useEffect(() => {
    if (perfectedCount >= 1) {
      unlock("FIRST_PERFECT");
    }
    if (perfectedCount >= CAMPAIGN_COUNT) {
      unlock("ALL_PERFECT");
    }
  }, [perfectedCount, unlock]);

  useEffect(() => {
    if (disasteredCount >= 1) {
      unlock("FIRST_DISASTER");
    }
    if (disasteredCount >= CAMPAIGN_COUNT) {
      unlock("ALL_DISASTER");
    }
  }, [disasteredCount, unlock]);

  useEffect(() => {
    if (hasPlayedDaily) {
      unlock("DAILY_FIRST");
    }
  }, [hasPlayedDaily, unlock]);
}
