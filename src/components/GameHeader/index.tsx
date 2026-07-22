import { Link } from "react-router-dom";

import { ROUTES } from "@/constants";
import type { LevelDefinition } from "@/types";

import "./style.css";

type GameHeaderProps = {
  level: LevelDefinition;
  number: number;
  score: number;
  allSeated: boolean;
  showScore: boolean;
};

export default function GameHeader({
  level,
  number,
  score,
  allSeated,
  showScore,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <Link
        to={ROUTES.home}
        className="game-header__home"
        aria-label="Back to main menu"
      >
        <svg
          className="game-header__home-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M3 11.5 12 4l9 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 10.5V19a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-8.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <div className="game-header__info">
        <p className="game-header__level">Dinner {number}</p>
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
