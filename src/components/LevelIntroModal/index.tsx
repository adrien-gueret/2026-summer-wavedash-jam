import { useEffect, useRef } from "react";

import type { LevelDefinition } from "@/types";

import "./style.css";

type LevelIntroModalProps = {
  level: LevelDefinition;
  number: number;
  onStart: () => void;
  /** Overrides the "Dinner {number}" kicker (used by the daily dinner). */
  kicker?: string;
  /** Overrides `level.description` (used by the daily objective flavour). */
  description?: string;
};

/**
 * Shown when a level opens: introduces the dinner with its title and
 * description and waits for the player to press "Go!" before the level begins.
 */
export default function LevelIntroModal({
  level,
  number,
  onStart,
  kicker,
  description,
}: LevelIntroModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="level-intro__backdrop">
      <div
        className="level-intro"
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-intro-title"
      >
        <p className="level-intro__level">{kicker ?? `Dinner ${number}`}</p>
        <h1 id="level-intro-title" className="level-intro__title">
          {level.title}
        </h1>
        <p className="level-intro__description">
          {description ?? level.description}
        </p>

        <button
          ref={buttonRef}
          type="button"
          className="level-intro__button"
          onClick={onStart}
        >
          Go!
        </button>
      </div>
    </div>
  );
}
