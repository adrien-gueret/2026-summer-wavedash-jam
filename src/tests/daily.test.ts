import { describe, expect, it } from "vitest";

import { getActivePreferencesForLevel } from "@/data/preferences";
import { getDailyDateKey, getDailyLevel } from "@/data/daily";
import { submitDailyResult } from "@/state/actions";
import type { PersistentState } from "@/types";

// A spread of date keys across months and years to exercise the seeded draw.
const SAMPLE_DATE_KEYS = [
  "2026-01-01",
  "2026-02-14",
  "2026-07-24",
  "2026-12-31",
  "2027-03-09",
  "2030-06-15",
];

describe("getDailyDateKey", () => {
  it("formats the UTC date as YYYY-MM-DD with zero padding", () => {
    const date = new Date(Date.UTC(2026, 6, 4, 23, 59)); // 2026-07-04 UTC
    expect(getDailyDateKey(date)).toBe("2026-07-04");
  });
});

describe("getDailyLevel", () => {
  it("is fully deterministic for a given date key", () => {
    for (const dateKey of SAMPLE_DATE_KEYS) {
      expect(getDailyLevel(dateKey)).toEqual(getDailyLevel(dateKey));
    }
  });

  it("produces different rosters on different days", () => {
    const rosters = SAMPLE_DATE_KEYS.map((dateKey) =>
      getDailyLevel(dateKey).characterIds.join(","),
    );
    expect(new Set(rosters).size).toBeGreaterThan(1);
  });

  it("draws between five and eight unique guests", () => {
    for (const dateKey of SAMPLE_DATE_KEYS) {
      const { characterIds } = getDailyLevel(dateKey);
      expect(characterIds.length).toBeGreaterThanOrEqual(5);
      expect(characterIds.length).toBeLessThanOrEqual(8);
      expect(new Set(characterIds).size).toBe(characterIds.length);
    }
  });

  it("seats everyone at a single table with enough seats", () => {
    for (const dateKey of SAMPLE_DATE_KEYS) {
      const level = getDailyLevel(dateKey);
      expect(level.tables).toHaveLength(1);
      const seatCount = level.tables[0].seats.length;
      expect(seatCount).toBeGreaterThanOrEqual(level.characterIds.length);
      expect([6, 8]).toContain(seatCount);
    }
  });

  it("always draws a roster that activates at least one preference", () => {
    for (const dateKey of SAMPLE_DATE_KEYS) {
      const { characterIds } = getDailyLevel(dateKey);
      expect(getActivePreferencesForLevel(characterIds).length).toBeGreaterThan(
        0,
      );
    }
  });

  it("titles the level with the slash-formatted date", () => {
    expect(getDailyLevel("2026-07-24").title).toBe(
      "Dinner of the day 2026/07/24",
    );
  });

  it("starts with an all-empty seating plan", () => {
    const level = getDailyLevel("2026-07-24");
    const values = Object.values(level.initialSeating);
    expect(values.length).toBe(level.tables[0].seats.length);
    expect(values.every((seat) => seat === null)).toBe(true);
  });
});

describe("submitDailyResult", () => {
  const baseState: PersistentState = {
    unlockedLevelIds: ["1"],
    completedLevelIds: [],
    bestScoresByLevelId: {},
    worstScoresByLevelId: {},
    dailyScoresByDate: {},
  };

  it("records the score for a day not yet played", () => {
    const next = submitDailyResult(baseState, {
      dateKey: "2026-07-24",
      score: 12,
    });
    expect(next.dailyScoresByDate).toEqual({ "2026-07-24": 12 });
  });

  it("keeps the first score and ignores a second submission", () => {
    const once = submitDailyResult(baseState, {
      dateKey: "2026-07-24",
      score: 12,
    });
    const twice = submitDailyResult(once, {
      dateKey: "2026-07-24",
      score: 30,
    });
    expect(twice).toBe(once);
    expect(twice.dailyScoresByDate).toEqual({ "2026-07-24": 12 });
  });

  it("handles a legacy state without a daily map", () => {
    const legacy: PersistentState = {
      unlockedLevelIds: ["1"],
      completedLevelIds: [],
      bestScoresByLevelId: {},
      worstScoresByLevelId: {},
    };
    const next = submitDailyResult(legacy, {
      dateKey: "2026-07-24",
      score: 7,
    });
    expect(next.dailyScoresByDate).toEqual({ "2026-07-24": 7 });
  });
});
