/**
 * Centralized game metadata. Change the working title here to rename the game
 * everywhere it is displayed.
 */
export const GAME_TITLE = "Table for Trouble";
export const GAME_TAGLINE = "Seat everyone. Avoid the drama.";

/** Total number of handcrafted levels the full game is planned to contain. */
export const TOTAL_LEVELS = 10;

export const FIRST_LEVEL_ID = "1";

/** Routes used by the hash router. */
export const ROUTES = {
  home: "/",
  levels: "/levels",
  play: "/play",
  family: "/family",
  end: "/end",
} as const;

export function getPlayRoute(levelId: string): string {
  return `${ROUTES.play}/${levelId}`;
}
