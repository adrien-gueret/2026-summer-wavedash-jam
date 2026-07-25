import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type ActiveGameContextValue = {
  /** True while a level is actually being played (not on menus or pickers). */
  isGameActive: boolean;
  setGameActive: (active: boolean) => void;
};

const ActiveGameContext = createContext<ActiveGameContextValue | null>(null);

/**
 * Tracks whether a level is currently being played. Playing happens inside
 * `PlayableLevel`, which is mounted both for campaign levels and for the daily
 * dinner once a goal is picked. This lets the soundtrack switch to game music
 * only while a game is on, and back to menu music on menus and pickers.
 */
export function ActiveGameProvider({ children }: { children: ReactNode }) {
  const [isGameActive, setGameActive] = useState(false);
  const value = useMemo(
    () => ({ isGameActive, setGameActive }),
    [isGameActive],
  );
  return (
    <ActiveGameContext.Provider value={value}>
      {children}
    </ActiveGameContext.Provider>
  );
}

export function useActiveGame(): ActiveGameContextValue {
  const context = useContext(ActiveGameContext);
  if (!context) {
    throw new Error("useActiveGame must be used within an ActiveGameProvider");
  }
  return context;
}
