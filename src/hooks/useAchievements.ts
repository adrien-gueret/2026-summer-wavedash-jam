import { useCallback } from "react";

import { useWavedash } from "wavedash-react";

/**
 * Every achievement identifier declared in the Wavedash dashboard. Kept in one
 * place so the game can only ever unlock an identifier that actually exists.
 */
export type AchievementId =
  | "FIRST_SUCCESS"
  | "ALL_SUCCESS"
  | "FIRST_PERFECT"
  | "ALL_PERFECT"
  | "FIRST_DISASTER"
  | "ALL_DISASTER"
  | "EXACT_TARGET"
  | "DAILY_FIRST"
  | "NO_UNSEAT"
  | "FAMILY_HISTORIAN";

/**
 * Returns a stable `unlock(id)` that unlocks a Wavedash achievement.
 *
 * Unlocking is idempotent: unlocking an already-unlocked achievement is a
 * harmless no-op, so callers can fire the same unlock as often as they like
 * (e.g. once per level submission). It only does anything inside the Wavedash
 * runtime; outside it (such as local development) the call is silently ignored.
 * The identifier must be declared in the dashboard, otherwise the SDK rejects
 * it. `storeNow` is passed so the unlock is flushed to the server promptly.
 */
export function useAchievements(): (id: AchievementId) => void {
  const context = useWavedash();

  return useCallback(
    (id: AchievementId) => {
      if (!context.isRunningInWavedash) {
        return;
      }
      context.wavedash.setAchievement(id, true);
    },
    [context],
  );
}
