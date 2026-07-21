import { useNavigate } from "react-router-dom";

import { getPlayRoute, ROUTES } from "@/constants";
import { LEVEL_LIST } from "@/data/levels";
import { computePerfectScore } from "@/game/scoring";
import { usePersistentSelector } from "@/state";
import {
  selectBestScore,
  selectIsLevelCompleted,
  selectIsLevelUnlocked,
} from "@/state/selectors";

import "./style.css";

export default function SelectLevel() {
  const navigate = useNavigate();

  return (
    <main className="select-level">
      <header className="select-level__header">
        <button
          type="button"
          className="select-level__back"
          onClick={() => navigate(ROUTES.home)}
        >
          Back
        </button>
        <h1 className="select-level__title">Select a Level</h1>
      </header>

      <ul className="select-level__grid">
        {LEVEL_LIST.map((entry) => (
          <li key={entry.id}>
            <LevelCard entryId={entry.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}

function LevelCard({ entryId }: { entryId: string }) {
  const navigate = useNavigate();
  const entry = LEVEL_LIST.find((item) => item.id === entryId)!;

  const isUnlocked = usePersistentSelector((state) =>
    selectIsLevelUnlocked(state, entry.id),
  );
  const isCompleted = usePersistentSelector((state) =>
    selectIsLevelCompleted(state, entry.id),
  );
  const bestScore = usePersistentSelector((state) =>
    selectBestScore(state, entry.id),
  );

  const isPlayable = entry.isPlayable && isUnlocked;

  if (!isPlayable) {
    return (
      <div
        className="level-card level-card--locked"
        aria-label={`Level ${entry.number}. Locked.`}
      >
        <span className="level-card__number">Level {entry.number}</span>
        <span className="level-card__status">
          <span className="level-card__lock-icon" aria-hidden="true">
            🔒
          </span>
          Locked
        </span>
      </div>
    );
  }

  const perfectScore = entry.definition
    ? computePerfectScore(entry.definition)
    : undefined;

  return (
    <button
      type="button"
      className="level-card level-card--playable"
      onClick={() => navigate(getPlayRoute(entry.id))}
    >
      <span className="level-card__number">Level {entry.number}</span>
      <span className="level-card__name">{entry.title}</span>
      {bestScore !== undefined && (
        <span className="level-card__best">
          Best: {bestScore}
          {perfectScore !== undefined ? ` / ${perfectScore}` : ""}
        </span>
      )}
      {isCompleted && (
        <span className="level-card__completed">
          <span aria-hidden="true">✓</span> Completed
        </span>
      )}
    </button>
  );
}
