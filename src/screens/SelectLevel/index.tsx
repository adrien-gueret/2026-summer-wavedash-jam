import { useNavigate } from "react-router-dom";

import BackButton from "@/components/BackButton";
import Tooltip from "@/components/Tooltip";
import { getPlayRoute, ROUTES } from "@/constants";
import { LEVEL_LIST } from "@/data/levels";
import { computePerfectScore, computeWorstScore } from "@/game/scoring";
import { usePersistentSelector } from "@/state";
import {
  selectBestScore,
  selectIsLevelCompleted,
  selectIsLevelUnlocked,
  selectWorstScore,
} from "@/state/selectors";

import "./style.css";

// Sprite sheet at images/icons.png (800×200) holds four 200×200 tiles in the
// order: success | perfect | worst | locked.
const ICON_STYLE = {
  backgroundImage: `url(${import.meta.env.BASE_URL}images/icons.png)`,
};

export default function SelectLevel() {
  return (
    <main className="select-level">
      <header className="select-level__header">
        <BackButton to={ROUTES.home} />
        <h1 className="select-level__title">Select your dinner</h1>
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
  const worstScore = usePersistentSelector((state) =>
    selectWorstScore(state, entry.id),
  );

  const isPlayable = entry.isPlayable && isUnlocked;

  if (!isPlayable) {
    return (
      <div
        className="level-card level-card--locked"
        aria-label={`Dinner ${entry.number}. Locked.`}
      >
        <span className="level-card__number">Dinner {entry.number}</span>
        <span className="level-card__status">
          <span
            className="level-card__badge level-card__badge--locked"
            style={ICON_STYLE}
            aria-hidden="true"
          />
          Locked
        </span>
      </div>
    );
  }

  const perfectScore = entry.definition
    ? computePerfectScore(entry.definition)
    : undefined;
  const worstPossible = entry.definition
    ? computeWorstScore(entry.definition)
    : undefined;

  const perfectAchieved =
    bestScore !== undefined &&
    perfectScore !== undefined &&
    bestScore >= perfectScore;
  const disasterAchieved =
    worstScore !== undefined &&
    worstPossible !== undefined &&
    worstScore <= worstPossible;

  const successLabel = isCompleted
    ? "This dinner was a success!"
    : "This dinner hasn't been a success yet";
  const perfectLabel = perfectAchieved
    ? "We had a perfect dinner!"
    : "Waiting for the perfect dinner";
  const disasterLabel = disasterAchieved
    ? "This dinner was a total disaster!"
    : "What if we have the worst dinner ever?";

  return (
    <button
      type="button"
      className="level-card level-card--playable"
      onClick={() => navigate(getPlayRoute(entry.id))}
    >
      <span className="level-card__number">Dinner {entry.number}</span>
      <span className="level-card__name">{entry.title}</span>

      <div className="level-card__badges">
        <Tooltip label={successLabel}>
          <span
            className={`level-card__badge level-card__badge--success${
              isCompleted ? " level-card__badge--earned" : ""
            }`}
            style={ICON_STYLE}
            role="img"
            aria-label={successLabel}
          />
        </Tooltip>
        <Tooltip label={perfectLabel}>
          <span
            className={`level-card__badge level-card__badge--perfect${
              perfectAchieved ? " level-card__badge--earned" : ""
            }`}
            style={ICON_STYLE}
            role="img"
            aria-label={perfectLabel}
          />
        </Tooltip>
        <Tooltip label={disasterLabel}>
          <span
            className={`level-card__badge level-card__badge--worst${
              disasterAchieved ? " level-card__badge--earned" : ""
            }`}
            style={ICON_STYLE}
            role="img"
            aria-label={disasterLabel}
          />
        </Tooltip>
      </div>
    </button>
  );
}
