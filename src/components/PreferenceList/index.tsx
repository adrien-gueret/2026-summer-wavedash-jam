import CharacterPortrait from "@/components/CharacterPortrait";
import { CHARACTERS } from "@/data/characters";
import { getPreference } from "@/data/preferences";
import { expressionForScore } from "@/game/scoring";
import type {
  CharacterId,
  PreferenceEvaluationStatus,
  ScoreResult,
} from "@/types";

import "./style.css";

type PreferenceListProps = {
  selectedCharacterId: CharacterId | null;
  scoreResult: ScoreResult;
};

const STATUS_ICON: Record<PreferenceEvaluationStatus, string> = {
  inactive: "·",
  pending: "○",
  fulfilled: "✓",
  unfulfilled: "○",
  avoided: "✓",
  violated: "✕",
};

const STATUS_TEXT: Record<PreferenceEvaluationStatus, string> = {
  inactive: "Not applicable",
  pending: "Not seated yet",
  fulfilled: "Fulfilled",
  unfulfilled: "Not yet",
  avoided: "Avoided",
  violated: "Violated",
};

export default function PreferenceList({
  selectedCharacterId,
  scoreResult,
}: PreferenceListProps) {
  if (selectedCharacterId === null) {
    return (
      <aside className="preference-list preference-list--empty">
        <p className="preference-list__hint">
          Select a guest to view their preferences.
        </p>
      </aside>
    );
  }

  const character = CHARACTERS[selectedCharacterId];
  const breakdown = scoreResult.characters.find(
    (item) => item.characterId === selectedCharacterId,
  );

  return (
    <aside className="preference-list">
      <header className="preference-list__header">
        <CharacterPortrait
          character={character}
          size="small"
          expression={expressionForScore(breakdown ? breakdown.score : 0)}
        />
        <div className="preference-list__identity">
          <p className="preference-list__name">{character.displayName}</p>
          <p className="preference-list__role">{character.familyRole}</p>
        </div>
        <span className="preference-list__score">
          {breakdown ? breakdown.score : 0} pts
        </span>
      </header>

      <ul className="preference-list__items">
        {breakdown?.preferences
          .filter((evaluation) => evaluation.status !== "inactive")
          .map((evaluation) => {
            const preference = getPreference(evaluation.preferenceId);
            const isPotential =
              evaluation.status === "pending" ||
              evaluation.status === "unfulfilled" ||
              evaluation.status === "avoided";
            // Realized rows (fulfilled/violated) show the points actually
            // scored; potential rows show what is at stake so the player can
            // gauge each condition even before the guest is seated.
            const displayedPoints = isPotential
              ? preference.points
              : evaluation.pointsAwarded;
            const formattedPoints =
              displayedPoints > 0
                ? `+${displayedPoints}`
                : `${displayedPoints}`;
            return (
              <li
                key={evaluation.preferenceId}
                className={`preference-item preference-item--${evaluation.status}`}
              >
                <span className="preference-item__icon" aria-hidden="true">
                  {STATUS_ICON[evaluation.status]}
                </span>
                <span className="preference-item__text">
                  <span className="preference-item__label">
                    {preference.description}
                  </span>
                  <span className="preference-item__status">
                    {STATUS_TEXT[evaluation.status]}
                  </span>
                </span>
                <span
                  className={`preference-item__points${
                    isPotential ? " preference-item__points--potential" : ""
                  }`}
                  aria-label={
                    isPotential
                      ? `${formattedPoints} points at stake`
                      : `${formattedPoints} points`
                  }
                >
                  {formattedPoints}
                </span>
              </li>
            );
          })}
      </ul>
    </aside>
  );
}
