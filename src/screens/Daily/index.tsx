import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { ROUTES } from "@/constants";
import { getDailyDateKey, getDailyLevel, msUntilNextDaily } from "@/data/daily";
import { usePersistentSelector } from "@/state";
import {
  selectDailyObjectiveScore,
  selectHasCompletedAnyLevel,
  selectHasPlayedAllDailyObjectives,
  selectHasPlayedDailyObjective,
} from "@/state/selectors";
import type { DailyObjective } from "@/types";

import { PlayableLevel } from "@/screens/Game";

import "./style.css";

type ObjectiveInfo = {
  id: DailyObjective;
  title: string;
  goal: string;
};

/** The two goals offered for today's dinner, in display order. */
const OBJECTIVES: ObjectiveInfo[] = [
  {
    id: "best",
    title: "Best Score",
    goal: "Seat everyone for the highest family harmony you can reach.",
  },
  {
    id: "worst",
    title: "Worst Score",
    goal: "Ruin the evening: aim for the lowest harmony possible.",
  },
];

/**
 * The daily dinner: a level drawn deterministically from today's UTC date, so
 * every player gets the same puzzle. It can be played once per objective per
 * day — once with the "best" goal and once with the "worst" goal. The player
 * picks a goal, plays it, then returns to the picker until both are served.
 */
export default function Daily() {
  const dateKey = getDailyDateKey();

  const hasCompletedAnyLevel = usePersistentSelector(
    selectHasCompletedAnyLevel,
  );

  const [objective, setObjective] = useState<DailyObjective | null>(null);

  // The level (and thus its story copy) depends on the chosen objective: the
  // "worst" goal swaps in flipped result messages where a low score wins.
  const level = useMemo(
    () => getDailyLevel(dateKey, objective ?? "best"),
    [dateKey, objective],
  );

  // The daily dinner unlocks only after the player finishes a campaign level.
  // A direct visit (URL or back navigation) before then bounces to the menu.
  if (!hasCompletedAnyLevel) {
    return <Navigate to={ROUTES.home} replace />;
  }

  if (objective === null) {
    return <DailyObjectivePicker dateKey={dateKey} onSelect={setObjective} />;
  }

  return (
    <PlayableLevel
      key={`${dateKey}-${objective}`}
      level={level}
      mode="daily"
      dateKey={dateKey}
      objective={objective}
      onExit={() => setObjective(null)}
    />
  );
}

function DailyObjectivePicker({
  dateKey,
  onSelect,
}: {
  dateKey: string;
  onSelect: (objective: DailyObjective) => void;
}) {
  const navigate = useNavigate();
  const displayDate = dateKey.replace(/-/g, "/");
  const allPlayed = usePersistentSelector((state) =>
    selectHasPlayedAllDailyObjectives(state, dateKey),
  );

  return (
    <main className="daily-played">
      <header className="daily-played__header">
        <p className="daily-played__kicker">Dinner of the Day</p>
        <h1 className="daily-played__title">{displayDate}</h1>
      </header>

      <p className="daily-played__lead">
        Two ways to host today's table: one to keep the peace, one to break it.
        You can attempt each goal once.
      </p>

      <div className="daily-objectives">
        {OBJECTIVES.map((objective) => (
          <ObjectiveCard
            key={objective.id}
            dateKey={dateKey}
            objective={objective}
            onSelect={onSelect}
          />
        ))}
      </div>

      {allPlayed && (
        <div className="daily-played__panel daily-played__panel--countdown">
          <p className="daily-played__message">
            Both goals served. Come back for a fresh table in:
          </p>
          <NextDinnerCountdown />
        </div>
      )}

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

function ObjectiveCard({
  dateKey,
  objective,
  onSelect,
}: {
  dateKey: string;
  objective: ObjectiveInfo;
  onSelect: (objective: DailyObjective) => void;
}) {
  const played = usePersistentSelector((state) =>
    selectHasPlayedDailyObjective(state, dateKey, objective.id),
  );
  const score = usePersistentSelector((state) =>
    selectDailyObjectiveScore(state, dateKey, objective.id),
  );

  return (
    <button
      type="button"
      className={`daily-objective daily-objective--${objective.id}${
        played ? " daily-objective--played" : ""
      }`}
      onClick={() => onSelect(objective.id)}
      disabled={played}
    >
      <span className="daily-objective__title">{objective.title}</span>
      <span className="daily-objective__goal">{objective.goal}</span>
      <span className="daily-objective__status">
        {played ? `Score: ${score}` : "Not played yet"}
      </span>
    </button>
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
