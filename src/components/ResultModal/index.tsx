import { useEffect, useRef, useState } from "react";

import confetti from "canvas-confetti";

import {
  computePerfectScore,
  computeTargetScore,
  computeWorstScore,
} from "@/game/scoring";
import type { LevelDefinition, ScoreResult } from "@/types";

import "./style.css";

type ResultModalProps = {
  level: LevelDefinition;
  scoreResult: ScoreResult;
  isLastLevel: boolean;
  onNextLevel: () => void;
  onContinue: () => void;
  onBackToLevels: () => void;
};

function resultMessage(
  score: number,
  targetScore: number,
  perfectScore: number,
): string {
  if (score >= perfectScore) {
    return "Perfect family harmony!";
  }
  if (score >= targetScore) {
    return "Dinner saved!";
  }
  return "Dinner disaster.";
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

const FILL_ANIMATION_MS = 1400;

export default function ResultModal({
  level,
  scoreResult,
  isLastLevel,
  onNextLevel,
  onContinue,
  onBackToLevels,
}: ResultModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { total } = scoreResult;
  const perfectScore = computePerfectScore(level);
  const worstScore = computeWorstScore(level);
  const targetScore = computeTargetScore(level);
  const hasReachedTarget = total >= targetScore;
  const isPerfect = total >= perfectScore;

  const fillPercent = toPercent(total, worstScore, perfectScore);
  const targetPercent = toPercent(targetScore, worstScore, perfectScore);
  const targetCrossProgress =
    total > worstScore ? (targetScore - worstScore) / (total - worstScore) : 0;
  const [progress, setProgress] = useState(() =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 1 : 0,
  );

  const animatedFill = progress * fillPercent;
  const displayedScore = Math.round(
    worstScore + progress * (total - worstScore),
  );

  const firedTargetRef = useRef(false);
  const firedPerfectRef = useRef(false);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
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
  }, [hasReachedTarget, isPerfect, targetCrossProgress]);

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
        className="result-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-modal-title"
        tabIndex={-1}
      >
        <h2 id="result-modal-title" className="result-modal__title">
          Seating Plan Submitted
        </h2>

        <p className="result-modal__message" role="status">
          {resultMessage(total, targetScore, perfectScore)}
        </p>

        <div className="result-modal__final">
          <span className="result-modal__final-label">Final score</span>
          <span className="result-modal__final-value">{displayedScore}</span>
        </div>

        <div
          className="result-modal__gauge"
          role="img"
          aria-label={`Final score ${total} out of a range from ${worstScore} to ${perfectScore}, target ${targetScore}.`}
        >
          <div className="result-modal__gauge-track">
            <div
              className={`result-modal__gauge-fill${
                hasReachedTarget ? " result-modal__gauge-fill--reached" : ""
              }`}
              style={{ width: `${animatedFill}%` }}
            />
            <div
              className="result-modal__gauge-target"
              style={{ left: `${targetPercent}%` }}
              aria-hidden="true"
            >
              <span className="result-modal__gauge-target-flag">
                Target {targetScore}
              </span>
            </div>
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

        <p
          className={`result-modal__target-state${
            hasReachedTarget ? " result-modal__target-state--reached" : ""
          }`}
        >
          {hasReachedTarget ? (
            <>
              <span aria-hidden="true">✓</span> Target reached
            </>
          ) : (
            <>
              <span aria-hidden="true">✕</span> Target not reached yet
            </>
          )}
        </p>

        <div className="result-modal__actions">
          {hasReachedTarget && (
            <button
              type="button"
              className="result-modal__button result-modal__button--primary"
              onClick={onNextLevel}
            >
              {isLastLevel ? "Next" : "Next Level"}
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
            Back to Level Select
          </button>
        </div>
      </div>
    </div>
  );
}
