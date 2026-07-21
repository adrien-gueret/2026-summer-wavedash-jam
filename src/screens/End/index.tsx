import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import confetti from "canvas-confetti";

import { GAME_TITLE, ROUTES } from "@/constants";

import "./style.css";

const CONFETTI_COLORS = ["#f7c94b", "#e8623c", "#5bb36a", "#4a90d9", "#b46fd0"];

export default function End() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const end = Date.now() + 1500;
    let frame = 0;
    const tick = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 65,
        origin: { x: 0 },
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 65,
        origin: { x: 1 },
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
      });
      if (Date.now() < end) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="end">
      <h1 className="end__title">Congratulations!</h1>
      <p className="end__text">
        You have seated every guest through all of {GAME_TITLE}. The family
        drama is finally under control.
      </p>
      <p className="end__text">Thank you for playing.</p>
      <div className="end__actions">
        <button
          type="button"
          className="end__button end__button--primary"
          onClick={() => navigate(ROUTES.levels)}
        >
          Back to Level Select
        </button>
        <button
          type="button"
          className="end__button"
          onClick={() => navigate(ROUTES.home)}
        >
          Back to Title
        </button>
      </div>
    </main>
  );
}
