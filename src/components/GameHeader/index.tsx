import type { LevelDefinition } from "@/types";

import "./style.css";

type GameHeaderProps = {
  level: LevelDefinition;
  score: number;
  allSeated: boolean;
  showScore: boolean;
};

export default function GameHeader({
  level,
  score,
  allSeated,
  showScore,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="game-header__info">
        <p className="game-header__level">Level {level.number}</p>
        <h1 className="game-header__title">{level.title}</h1>
        <p className="game-header__instruction">{level.description}</p>
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
