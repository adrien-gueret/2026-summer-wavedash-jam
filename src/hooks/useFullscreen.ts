import { useCallback } from "react";

import { useWavedash } from "wavedash-react";

/**
 * Returns a stable `requestFullscreen()` that asks the Wavedash host to enter
 * fullscreen.
 *
 * The browser only allows entering fullscreen from inside a fresh user gesture
 * (a click, keypress, or pointer event), so this must be called synchronously
 * from such a handler. It only does anything inside the Wavedash runtime;
 * outside it (such as local development) the call is silently ignored.
 */
export function useFullscreen(): () => void {
  const context = useWavedash();

  return useCallback(() => {
    if (!context.isRunningInWavedash) {
      return;
    }
    void context.wavedash.requestFullscreen(true);
  }, [context]);
}
