import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { ROUTES } from "@/constants";
import { getDailyDateKey, getDailyLevel, msUntilNextDaily } from "@/data/daily";
import { usePersistentSelector } from "@/state";
import {
  selectDailyScore,
  selectHasCompletedAnyLevel,
  selectHasPlayedDaily,
} from "@/state/selectors";

import { PlayableLevel } from "@/screens/Game";

import "./style.css";

/**
 * The daily dinner: a level drawn deterministically from today's UTC date, so
 * every player gets the same puzzle. It can be submitted only once per day;
 * once played, the board is replaced by a summary until the next day's draw.
 */
export default function Daily() {
  const dateKey = getDailyDateKey();
  const level = useMemo(() => getDailyLevel(dateKey), [dateKey]);

  const hasCompletedAnyLevel = usePersistentSelector(
    selectHasCompletedAnyLevel,
  );
  const hasPlayed = usePersistentSelector((state) =>
    selectHasPlayedDaily(state, dateKey),
  );

  // Freeze the decision at mount: submitting flips `hasPlayed` to true, but we
  // keep the board mounted so its result modal can play out. The summary is
  // shown only when the player was already done before opening the screen.
  const [wasPlayedAtMount] = useState(hasPlayed);

  // The daily dinner unlocks only after the player finishes a campaign level.
  // A direct visit (URL or back navigation) before then bounces to the menu.
  if (!hasCompletedAnyLevel) {
    return <Navigate to={ROUTES.home} replace />;
  }

  if (wasPlayedAtMount) {
    return <DailyAlreadyPlayed dateKey={dateKey} />;
  }

  return (
    <PlayableLevel key={dateKey} level={level} mode="daily" dateKey={dateKey} />
  );
}

function DailyAlreadyPlayed({ dateKey }: { dateKey: string }) {
  const navigate = useNavigate();
  const score = usePersistentSelector((state) =>
    selectDailyScore(state, dateKey),
  );

  const displayDate = dateKey.replace(/-/g, "/");

  return (
    <main className="daily-played">
      <header className="daily-played__header">
        <p className="daily-played__kicker">Dinner of the Day</p>
        <h1 className="daily-played__title">{displayDate}</h1>
      </header>

      <div className="daily-played__panel">
        <p className="daily-played__label">Today's family harmony</p>
        <p className="daily-played__score">{score}</p>
        <p className="daily-played__message">
          You have already served today's dinner. Come back for a fresh table
          in:
        </p>
        <NextDinnerCountdown />
      </div>

      <div className="daily-played__actions">
        <button
          type="button"
          className="daily-played__button daily-played__button--primary"
          onClick={() => navigate(ROUTES.home)}
        >
          Back to Menu
        </button>
        <button
          type="button"
          className="daily-played__button"
          onClick={() => navigate(ROUTES.levels)}
        >
          Play a Dinner
        </button>
      </div>
    </main>
  );
}

/** Formats a millisecond duration as `HH:MM:SS`, clamped at zero. */
function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

/** A live countdown to the next daily dinner (the next UTC midnight). */
function NextDinnerCountdown() {
  const [remaining, setRemaining] = useState(() => msUntilNextDaily());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = msUntilNextDaily();
      // Once we cross UTC midnight a fresh dinner is available. A full reload
      // is the simplest reliable way to pick it up: it recomputes the date
      // key and re-reads whether today has been played.
      if (next <= 0) {
        window.location.reload();
        return;
      }
      setRemaining(next);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="daily-played__countdown" aria-live="off">
      {formatCountdown(remaining)}
    </p>
  );
}
