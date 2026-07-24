import BackButton from "@/components/BackButton";
import { ROUTES } from "@/constants";
import type { LevelDefinition } from "@/types";

import "./style.css";

type GameHeaderProps = {
  level: LevelDefinition;
  number: number;
  score: number;
  allSeated: boolean;
  showScore: boolean;
  /** Overrides the "Dinner {number}" kicker (used by the daily dinner). */
  kicker?: string;
  /** Overrides `level.description` (used by the daily objective flavour). */
  description?: string;
};

export default function GameHeader({
  level,
  number,
  score,
  allSeated,
  showScore,
  kicker,
  description,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <BackButton to={ROUTES.home} ariaLabel="Back to main menu" />

      <div className="game-header__info">
        <p className="game-header__level">{kicker ?? `Dinner ${number}`}</p>
        <h1 className="game-header__title">{level.title}</h1>
        <p className="game-header__instruction">
          {description ?? level.description}
        </p>
      </div>

      {showScore && (
        <div className="game-header__scoreboard">
          <div className="game-header__score">
            <span className="game-header__score-label">Family Harmony</span>
            <span className="game-header__score-value">
              {allSeated ? score : "—"}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
