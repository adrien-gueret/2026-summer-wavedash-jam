import { useEffect, useRef, useState } from "react";

import { useCurrentUser, useLeaderboard, useWavedash } from "wavedash-react";

import type { DailyObjective } from "@/types";

import "./style.css";

/** How many top entries to show. */
const TOP_COUNT = 10;

/**
 * Wavedash `LeaderboardSortOrder` values: `DESC` (1) ranks the highest score
 * first, `ASC` (0) the lowest. The "worst" objective is a race to the bottom,
 * so its board is sorted ascending.
 */
const SORT_ORDER = { best: 1, worst: 0 } as const;

/** The shape of a single leaderboard row, derived from the hook's return type. */
type LeaderboardEntry = Awaited<
  ReturnType<ReturnType<typeof useLeaderboard>["getEntries"]>
>[number];

type LoadStatus = "loading" | "ready" | "error";

type DailyLeaderboardProps = {
  /** The board to read, e.g. `daily-2026-07-24-best`. */
  leaderboardName: string;
  /** Which objective this board ranks (decides the sort direction). */
  objective: DailyObjective;
  /**
   * The score to submit once on mount. Omit for a read-only board (e.g. when
   * browsing a leaderboard the player has already submitted to).
   */
  score?: number;
  /**
   * `"rank"` shows a single compact line with the player's standing (used in
   * the result modal, where space is tight); `"board"` shows the full top-N
   * list (used on the daily page). Defaults to `"board"`.
   */
  variant?: "rank" | "board";
};

/**
 * Reads (and optionally submits to) a daily leaderboard. Leaderboards only
 * exist on the Wavedash platform, so outside it (e.g. local dev) a short notice
 * is shown instead.
 */
export default function DailyLeaderboard({
  leaderboardName,
  objective,
  score,
  variant = "board",
}: DailyLeaderboardProps) {
  const { isRunningInWavedash } = useWavedash();
  const currentUser = useCurrentUser();
  const {
    isLoading,
    submitScore,
    getEntries,
    getCurrentUserEntries,
    getEntryCount,
  } = useLeaderboard(leaderboardName, { sortOrder: SORT_ORDER[objective] });

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<LeaderboardEntry | null>(
    null,
  );
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  // The score must be sent exactly once, even though the effect may re-run when
  // the leaderboard finishes loading and the callbacks change identity.
  const submittedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !isRunningInWavedash) {
      return;
    }

    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      try {
        if (score !== undefined && !submittedRef.current) {
          submittedRef.current = true;
          await submitScore(score);
        }
        const [top, mine, count] = await Promise.all([
          getEntries(0, TOP_COUNT),
          getCurrentUserEntries(),
          getEntryCount(),
        ]);
        if (cancelled) {
          return;
        }
        setEntries(top);
        setCurrentEntry(mine[0] ?? null);
        setTotalCount(count >= 0 ? count : null);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    };
    void load();

    return () => {
      cancelled = true;
    };
  }, [
    isLoading,
    isRunningInWavedash,
    submitScore,
    getEntries,
    getCurrentUserEntries,
    getEntryCount,
    score,
  ]);

  if (!isRunningInWavedash) {
    return (
      <section
        className={`daily-leaderboard daily-leaderboard--${variant}`}
        aria-label="Leaderboard"
      >
        <p className="daily-leaderboard__note">
          Leaderboards are available when playing on Wavedash.
        </p>
      </section>
    );
  }

  const modeLabel = objective === "worst" ? "Worst" : "Best";

  if (variant === "rank") {
    return (
      <section
        className="daily-leaderboard daily-leaderboard--rank"
        aria-label="Your ranking"
      >
        {status === "loading" && (
          <p className="daily-leaderboard__note">Submitting your score…</p>
        )}

        {status === "error" && (
          <p className="daily-leaderboard__note">
            Your score was submitted, but the ranking is unavailable right now.
          </p>
        )}

        {status === "ready" && currentEntry && (
          <p className="daily-leaderboard__rank-line">
            You placed <strong>#{currentEntry.globalRank}</strong>
            {totalCount !== null ? ` of ${totalCount}` : ""} on today's{" "}
            {modeLabel} leaderboard.
          </p>
        )}

        {status === "ready" && !currentEntry && (
          <p className="daily-leaderboard__note">
            You are the first to sit down at today's {modeLabel.toLowerCase()}{" "}
            table.
          </p>
        )}
      </section>
    );
  }

  const heading = objective === "worst" ? "Worst Dinners" : "Best Dinners";
  const currentUserId = currentUser?.id;
  const isCurrentUserInTop = entries.some(
    (entry) => entry.userId === currentUserId,
  );
  const showOwnRow =
    currentEntry !== null && !isCurrentUserInTop && currentUserId !== undefined;

  return (
    <section
      className="daily-leaderboard daily-leaderboard--board"
      aria-label="Leaderboard"
    >
      <h2 className="daily-leaderboard__heading">{heading}</h2>

      {status === "loading" && (
        <p className="daily-leaderboard__note">Loading the leaderboard…</p>
      )}

      {status === "error" && (
        <p className="daily-leaderboard__note">
          The leaderboard could not be loaded.
        </p>
      )}

      {status === "ready" && entries.length === 0 && (
        <p className="daily-leaderboard__note">
          No entries yet — you are the first to sit down tonight.
        </p>
      )}

      {status === "ready" && entries.length > 0 && (
        <ol className="daily-leaderboard__list">
          {entries.map((entry) => (
            <LeaderboardRow
              key={`${entry.userId}-${entry.globalRank}`}
              entry={entry}
              isCurrentUser={entry.userId === currentUserId}
            />
          ))}
          {showOwnRow && (
            <>
              <li className="daily-leaderboard__gap" aria-hidden="true">
                …
              </li>
              <LeaderboardRow entry={currentEntry} isCurrentUser />
            </>
          )}
        </ol>
      )}
    </section>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <li
      className={`daily-leaderboard__row${
        isCurrentUser ? " daily-leaderboard__row--me" : ""
      }`}
    >
      <span className="daily-leaderboard__rank">{entry.globalRank}</span>
      <span className="daily-leaderboard__player">
        {entry.userAvatarUrl ? (
          <img
            className="daily-leaderboard__avatar"
            src={entry.userAvatarUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          <span
            className="daily-leaderboard__avatar daily-leaderboard__avatar--placeholder"
            aria-hidden="true"
          />
        )}
        <span className="daily-leaderboard__name">{entry.username}</span>
      </span>
      <span className="daily-leaderboard__score">{entry.score}</span>
    </li>
  );
}
