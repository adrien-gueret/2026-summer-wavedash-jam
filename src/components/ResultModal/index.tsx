import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import confetti from "canvas-confetti";

import {
  computePerfectScore,
  computeTargetScore,
  computeWorstScore,
} from "@/game/scoring";
import type { DailyObjective, LevelDefinition, ScoreResult } from "@/types";
import "./style.css";

type ResultModalProps = {
  level: LevelDefinition;
  scoreResult: ScoreResult;
  isLastLevel: boolean;
  onNextLevel: () => void;
  onContinue: () => void;
  onBackToLevels: () => void;
  /**
   * When true the result is final (the daily dinner): the "Next Dinner" and
   * "Improve Seating" actions are hidden, leaving only a single button to
   * leave. The player cannot retry.
   */
  oneShot?: boolean;
  /** Label of the sole button shown in one-shot mode. */
  oneShotLabel?: string;
  /**
   * When true the completion target is hidden entirely: no target flag on the
   * gauge and no target-reached celebration. Used by the daily dinner, which
   * is a pure score chase (highest or lowest) with no success threshold.
   */
  hideTarget?: boolean;
  /**
   * The score the player is chasing. "worst" flips which end of the gauge is a
   * triumph: a near-worst score is the win (disaster celebration) while a
   * peaceful, high-harmony evening is the failure. Defaults to "best".
   */
  objective?: DailyObjective;
  /**
   * Optional content rendered below the result message once the score reveal
   * finishes (used by the daily dinner to show the leaderboard).
   */
  extraContent?: ReactNode;
};

function resultMessage(
  level: LevelDefinition,
  score: number,
  worstScore: number,
  targetScore: number,
  perfectScore: number,
  hideTarget: boolean,
): string {
  const { targetScoreMessage, perfectScoreMessage, worstScoreMessage } =
    level.story;

  if (score >= perfectScore) {
    return perfectScoreMessage;
  }
  if (score <= worstScore) {
    return worstScoreMessage;
  }
  // Without a target the middle band reuses the target message as neutral
  // flavour; with a target it distinguishes reaching it from falling short.
  if (hideTarget || score >= targetScore) {
    return targetScoreMessage;
  }
  return "Dinner disaster. A few too many guests wish they had stayed home.";
}

/** Position of a value on the worst→best axis, as a 0–100 percentage. */
function toPercent(value: number, worst: number, best: number): number {
  if (best <= worst) {
    return 100;
  }
  const ratio = (value - worst) / (best - worst);
  return Math.min(100, Math.max(0, ratio * 100));
}

const CONFETTI_COLORS = ["#f7c94b", "#e8623c", "#5bb36a", "#4a90d9", "#b46fd0"];

/**
 * Fires confetti above the modal. A normal burst celebrates reaching the
 * target; the intense version (for a perfect score) is a much larger, sustained
 * shower launched from both sides of the screen.
 */
function fireConfetti(intense: boolean) {
  const base = { zIndex: 200, disableForReducedMotion: true } as const;

  if (!intense) {
    confetti({
      ...base,
      particleCount: 90,
      spread: 70,
      startVelocity: 45,
      origin: { y: 0.6 },
    });
    return;
  }

  confetti({
    ...base,
    particleCount: 220,
    spread: 120,
    startVelocity: 55,
    origin: { y: 0.55 },
    colors: CONFETTI_COLORS,
  });

  const end = Date.now() + 900;
  const frame = () => {
    confetti({
      ...base,
      particleCount: 8,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors: CONFETTI_COLORS,
    });
    confetti({
      ...base,
      particleCount: 8,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors: CONFETTI_COLORS,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  requestAnimationFrame(frame);
}

const DISASTER_COLORS = ["#1a1a1a", "#000000", "#2c2c2c"];

/**
 * Rains dark debris down from the top of the screen — the tongue-in-cheek
 * "celebration" reserved for achieving the worst dinner possible.
 */
function fireDisaster() {
  const base = {
    zIndex: 200,
    disableForReducedMotion: true,
    colors: DISASTER_COLORS,
    gravity: 1.1,
    startVelocity: 12,
    ticks: 220,
    angle: 270,
  } as const;

  const end = Date.now() + 900;
  const frame = () => {
    confetti({
      ...base,
      particleCount: 6,
      spread: 65,
      origin: { x: Math.random(), y: 0 },
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  requestAnimationFrame(frame);
}

const FILL_ANIMATION_MS = 1400;

const ICON_STYLE = {
  backgroundImage: `url(${import.meta.env.BASE_URL}images/icons.png)`,
};

export default function ResultModal({
  level,
  scoreResult,
  isLastLevel,
  onNextLevel,
  onContinue,
  onBackToLevels,
  oneShot = false,
  oneShotLabel = "Back to Menu",
  hideTarget = false,
  objective = "best",
  extraContent,
}: ResultModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { total } = scoreResult;
  const perfectScore = computePerfectScore(level);
  const worstScore = computeWorstScore(level);
  const targetScore = computeTargetScore(level);
  const chasingWorst = objective === "worst";
  const hasReachedTarget = !hideTarget && total >= targetScore;
  // When chasing the worst score, a high-harmony evening is a failure, not a
  // triumph, so the "perfect" celebration is suppressed. A near-worst score
  // still lights up the disaster shower below (via `isWorst`).
  const isPerfect = !chasingWorst && total >= perfectScore;
  const isWorst = total <= worstScore;

  const resultIcon = isPerfect
    ? "perfect"
    : hasReachedTarget
      ? "success"
      : isWorst
        ? "worst"
        : null;

  const fillPercent = toPercent(total, worstScore, perfectScore);
  const targetPercent = toPercent(targetScore, worstScore, perfectScore);
  const targetCrossProgress =
    total > worstScore ? (targetScore - worstScore) / (total - worstScore) : 0;
  const [progress, setProgress] = useState(() =>
    isWorst || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? 1
      : 0,
  );

  const animatedFill = progress * fillPercent;
  const displayedScore = Math.round(
    worstScore + progress * (total - worstScore),
  );
  const animationDone = progress >= 1;

  const firedTargetRef = useRef(false);
  const firedPerfectRef = useRef(false);
  const firedWorstRef = useRef(false);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || isWorst) {
      if (isWorst && !prefersReducedMotion && !firedWorstRef.current) {
        firedWorstRef.current = true;
        fireDisaster();
      }
      return;
    }

    let frame = 0;
    let startTime: number | null = null;
    const step = (now: number) => {
      startTime ??= now;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / FILL_ANIMATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);

      if (
        hasReachedTarget &&
        !firedTargetRef.current &&
        eased >= targetCrossProgress
      ) {
        firedTargetRef.current = true;
        fireConfetti(false);
      }
      if (isPerfect && !firedPerfectRef.current && t >= 1) {
        firedPerfectRef.current = true;
        fireConfetti(true);
      }

      if (t < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [hasReachedTarget, isPerfect, isWorst, targetCrossProgress]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onContinue();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onContinue]);

  return (
    <div
      className="result-modal__backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onContinue();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`result-modal${isWorst ? " result-modal--disaster" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Seating plan result"
        tabIndex={-1}
      >
        <div className="result-modal__final">
          <span className="result-modal__final-label">Final score</span>
          <span className="result-modal__final-value">{displayedScore}</span>
        </div>

        <div
          className="result-modal__gauge"
          role="img"
          aria-label={
            hideTarget
              ? `Final score ${total} out of a range from ${worstScore} to ${perfectScore}.`
              : `Final score ${total} out of a range from ${worstScore} to ${perfectScore}, target ${targetScore}.`
          }
        >
          <div className="result-modal__gauge-track">
            <div
              className={`result-modal__gauge-fill${
                hasReachedTarget ? " result-modal__gauge-fill--reached" : ""
              }`}
              style={{ width: `${animatedFill}%` }}
            />
            {!hideTarget && (
              <div
                className="result-modal__gauge-target"
                style={{ left: `${targetPercent}%` }}
                aria-hidden="true"
              >
                <span className="result-modal__gauge-target-flag">
                  Target {targetScore}
                </span>
              </div>
            )}
          </div>
          <div className="result-modal__gauge-bounds">
            <span className="result-modal__gauge-bound">
              <span className="result-modal__gauge-bound-label">Worst</span>
              {worstScore}
            </span>
            <span className="result-modal__gauge-bound result-modal__gauge-bound--end">
              <span className="result-modal__gauge-bound-label">Best</span>
              {perfectScore}
            </span>
          </div>
        </div>

        <div
          className={`result-modal__reveal${
            animationDone ? " result-modal__reveal--open" : ""
          }`}
        >
          <div className="result-modal__reveal-inner">
            <div className="result-modal__outcome" aria-hidden="true">
              {animationDone && resultIcon && (
                <span
                  className={`result-modal__icon result-modal__icon--${resultIcon}`}
                  style={ICON_STYLE}
                />
              )}
            </div>

            <p
              className={`result-modal__message${
                animationDone ? " result-modal__message--visible" : ""
              }`}
              role="status"
            >
              {resultMessage(
                level,
                total,
                worstScore,
                targetScore,
                perfectScore,
                hideTarget,
              )}
            </p>

            {animationDone && extraContent && (
              <div className="result-modal__extra">{extraContent}</div>
            )}

            <div
              className={`result-modal__actions${
                animationDone ? " result-modal__actions--revealed" : ""
              }`}
            >
              {oneShot ? (
                <button
                  type="button"
                  className="result-modal__button result-modal__button--primary"
                  onClick={onBackToLevels}
                >
                  {oneShotLabel}
                </button>
              ) : (
                <>
                  {hasReachedTarget && (
                    <button
                      type="button"
                      className="result-modal__button result-modal__button--primary"
                      onClick={onNextLevel}
                    >
                      {isLastLevel ? "Next" : "Next Dinner"}
                    </button>
                  )}
                  {!isPerfect && (
                    <button
                      type="button"
                      className={`result-modal__button${
                        hasReachedTarget ? "" : " result-modal__button--primary"
                      }`}
                      onClick={onContinue}
                    >
                      Improve Seating
                    </button>
                  )}
                  <button
                    type="button"
                    className="result-modal__button"
                    onClick={onBackToLevels}
                  >
                    Go to another Dinner
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
