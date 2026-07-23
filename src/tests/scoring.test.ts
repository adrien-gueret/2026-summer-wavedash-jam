import { describe, expect, it } from "vitest";

import { tableForSix } from "@/data/tables";
import {
  computePerfectScore,
  computeSeatingScore,
  computeTargetScore,
  computeWorstScore,
} from "@/game/scoring";
import type { LevelDefinition, SeatingPlan } from "@/types";

// A dedicated six-seat fixture (Martha, Henry, Andrew, Danielle, Rex and Bree)
// so these unit tests stay independent of the shipped campaign levels. Rules
// live globally in data/preferences.ts; only the ones whose owner and at least
// one target are present here are active, so several canonical rules (those
// aimed at absent guests such as Susan or Karl) never contribute. The fixture
// deliberately omits `scoreStats`, so the derived-stats tests exercise the
// runtime brute-force path rather than precomputed values.
const level: LevelDefinition = {
  id: "test-six",
  title: "Scoring fixture",
  description: "Six-seat fixture used by the scoring unit tests.",
  tables: [tableForSix],
  characterIds: ["martha", "henry", "andrew", "danielle", "rex", "bree"],
  initialSeating: {
    "seat-0": null,
    "seat-1": null,
    "seat-2": null,
    "seat-3": null,
    "seat-4": null,
    "seat-5": null,
  },
  story: {
    targetScoreMessage: "",
    perfectScoreMessage: "",
    worstScoreMessage: "",
  },
};

function totalFor(seating: SeatingPlan): number {
  return computeSeatingScore(level, seating).total;
}

function scoreForPreference(
  seating: SeatingPlan,
  preferenceId: string,
): number {
  const result = computeSeatingScore(level, seating);
  for (const character of result.characters) {
    for (const evaluation of character.preferences) {
      if (evaluation.preferenceId === preferenceId) {
        return evaluation.pointsAwarded;
      }
    }
  }
  throw new Error(`Preference not evaluated: ${preferenceId}`);
}

const emptySeating: SeatingPlan = {
  "seat-0": null,
  "seat-1": null,
  "seat-2": null,
  "seat-3": null,
  "seat-4": null,
  "seat-5": null,
};

describe("positive specific-character preference", () => {
  it("awards +6 when Andrew sits next to Danielle", () => {
    const seating: SeatingPlan = {
      "seat-0": "andrew",
      "seat-1": "danielle",
      "seat-2": "rex",
      "seat-3": "bree",
      "seat-4": "henry",
      "seat-5": "martha",
    };
    expect(scoreForPreference(seating, "andrew-next-to-danielle")).toBe(6);
  });

  it("awards 0 when Andrew is not next to Danielle", () => {
    const seating: SeatingPlan = {
      "seat-0": "andrew",
      "seat-1": "rex",
      "seat-2": "bree",
      "seat-3": "danielle",
      "seat-4": "henry",
      "seat-5": "martha",
    };
    expect(scoreForPreference(seating, "andrew-next-to-danielle")).toBe(0);
  });
});

describe("negative preference", () => {
  it("removes 4 points when Danielle sits next to Henry", () => {
    const seating: SeatingPlan = {
      "seat-0": "danielle",
      "seat-1": "henry",
      "seat-2": "rex",
      "seat-3": "andrew",
      "seat-4": "bree",
      "seat-5": "martha",
    };
    expect(scoreForPreference(seating, "danielle-not-next-to-henry")).toBe(-4);
  });

  it("awards 0 when Danielle is not next to Henry", () => {
    const seating: SeatingPlan = {
      "seat-0": "danielle",
      "seat-1": "rex",
      "seat-2": "andrew",
      "seat-3": "henry",
      "seat-4": "bree",
      "seat-5": "martha",
    };
    expect(scoreForPreference(seating, "danielle-not-next-to-henry")).toBe(0);
  });
});

describe("opposite preference", () => {
  // Martha sits opposite Henry on the three opposite pairs (0/4, 1/3, 2/5).
  const cases: Array<[string, string]> = [
    ["seat-4", "seat-0"],
    ["seat-3", "seat-1"],
    ["seat-5", "seat-2"],
  ];

  for (const [marthaSeat, henrySeat] of cases) {
    it(`awards +3 when Martha is on ${marthaSeat} and Henry on ${henrySeat}`, () => {
      const seating: SeatingPlan = {
        "seat-0": "andrew",
        "seat-1": "danielle",
        "seat-2": "rex",
        "seat-3": "bree",
        "seat-4": "andrew",
        "seat-5": "danielle",
      };
      seating[marthaSeat] = "martha";
      seating[henrySeat] = "henry";
      expect(scoreForPreference(seating, "martha-opposite-henry")).toBe(3);
    });
  }

  it("awards 0 when Martha sits adjacent to Henry rather than opposite", () => {
    const seating: SeatingPlan = {
      "seat-0": "martha",
      "seat-1": "henry",
      "seat-2": "andrew",
      "seat-3": "danielle",
      "seat-4": "rex",
      "seat-5": "bree",
    };
    expect(scoreForPreference(seating, "martha-opposite-henry")).toBe(0);
  });
});

describe("end-seat preference", () => {
  it("removes 4 points when Martha takes an end seat", () => {
    const seating: SeatingPlan = {
      "seat-0": "andrew",
      "seat-1": "danielle",
      "seat-2": "martha",
      "seat-3": "rex",
      "seat-4": "bree",
      "seat-5": "henry",
    };
    expect(scoreForPreference(seating, "martha-not-end-seat")).toBe(-4);
  });

  it("awards 0 when Martha avoids the end seats", () => {
    const seating: SeatingPlan = {
      "seat-0": "martha",
      "seat-1": "danielle",
      "seat-2": "andrew",
      "seat-3": "rex",
      "seat-4": "bree",
      "seat-5": "henry",
    };
    expect(scoreForPreference(seating, "martha-not-end-seat")).toBe(0);
  });
});

describe("multi-target once aggregation", () => {
  it("awards +6 once when Martha sits next to both grandchildren", () => {
    // Martha on seat-0 is adjacent to both seat-1 (Andrew) and seat-5 (Danielle).
    const seating: SeatingPlan = {
      "seat-0": "martha",
      "seat-1": "andrew",
      "seat-2": "rex",
      "seat-3": "bree",
      "seat-4": "henry",
      "seat-5": "danielle",
    };
    expect(scoreForPreference(seating, "martha-next-to-grandchild")).toBe(6);
  });

  it("awards +6 once when Martha sits next to a single grandchild", () => {
    // Only Andrew (seat-1) neighbours Martha (seat-0); Danielle is across the table.
    const seating: SeatingPlan = {
      "seat-0": "martha",
      "seat-1": "andrew",
      "seat-2": "rex",
      "seat-3": "bree",
      "seat-4": "danielle",
      "seat-5": "henry",
    };
    expect(scoreForPreference(seating, "martha-next-to-grandchild")).toBe(6);
  });

  it("awards 0 when no grandchild neighbours Martha", () => {
    // seat-0 neighbours seat-1 (Rex) and seat-5 (Henry): no grandchild.
    const seating: SeatingPlan = {
      "seat-0": "martha",
      "seat-1": "rex",
      "seat-2": "bree",
      "seat-3": "andrew",
      "seat-4": "danielle",
      "seat-5": "henry",
    };
    expect(scoreForPreference(seating, "martha-next-to-grandchild")).toBe(0);
  });
});

describe("multi-target with a partly-present target list", () => {
  // Rex would like to sit next to Henry or Paul; Paul is absent from Level 2
  // but the rule stays active because Henry is present.
  it("awards +3 when Rex neighbours Henry (Paul absent)", () => {
    const seating: SeatingPlan = {
      "seat-0": "rex",
      "seat-1": "henry",
      "seat-2": "andrew",
      "seat-3": "danielle",
      "seat-4": "bree",
      "seat-5": "martha",
    };
    expect(scoreForPreference(seating, "rex-next-to-henry-or-paul")).toBe(3);
  });
});

describe("inactive preferences", () => {
  it("never surfaces a preference whose only target is absent", () => {
    const seating: SeatingPlan = {
      "seat-0": "martha",
      "seat-1": "andrew",
      "seat-2": "rex",
      "seat-3": "bree",
      "seat-4": "henry",
      "seat-5": "danielle",
    };
    const result = computeSeatingScore(level, seating);
    const evaluatedIds = result.characters.flatMap((character) =>
      character.preferences.map((evaluation) => evaluation.preferenceId),
    );
    // Bree dislikes sitting next to Susan, but Susan is not invited to Level 2.
    expect(evaluatedIds).not.toContain("bree-not-next-to-susan");
    // No evaluation should carry the inactive status; inactive rules are
    // filtered out of the breakdown entirely.
    for (const character of result.characters) {
      for (const evaluation of character.preferences) {
        expect(evaluation.status).not.toBe("inactive");
      }
    }
  });
});

describe("unseated guests", () => {
  it("scores 0 when the table is empty (the level's initial state)", () => {
    expect(totalFor(level.initialSeating)).toBe(0);
    expect(totalFor(emptySeating)).toBe(0);
  });

  it("only counts preferences between two seated guests", () => {
    const partial: SeatingPlan = {
      ...emptySeating,
      "seat-0": "andrew",
      "seat-1": "rex",
    };
    expect(scoreForPreference(partial, "andrew-next-to-danielle")).toBe(0);
  });

  it("counts a preference once both parties are seated", () => {
    const partial: SeatingPlan = {
      ...emptySeating,
      "seat-0": "andrew",
      "seat-1": "danielle",
    };
    expect(scoreForPreference(partial, "andrew-next-to-danielle")).toBe(6);
  });
});

describe("score breakdown", () => {
  const seating: SeatingPlan = {
    "seat-0": "bree",
    "seat-1": "rex",
    "seat-2": "andrew",
    "seat-3": "danielle",
    "seat-4": "martha",
    "seat-5": "henry",
  };

  it("has character breakdowns summing to the total", () => {
    const result = computeSeatingScore(level, seating);
    const sum = result.characters.reduce(
      (acc, character) => acc + character.score,
      0,
    );
    expect(sum).toBe(result.total);
  });

  it("keeps each character score equal to the sum of its preferences", () => {
    const result = computeSeatingScore(level, seating);
    for (const character of result.characters) {
      const sum = character.preferences.reduce(
        (acc, evaluation) => acc + evaluation.pointsAwarded,
        0,
      );
      expect(character.score).toBe(sum);
    }
  });
});

describe("derived score stats", () => {
  it("orders worst below target below perfect", () => {
    const worst = computeWorstScore(level);
    const target = computeTargetScore(level);
    const perfect = computePerfectScore(level);
    expect(worst).toBeLessThan(target);
    expect(target).toBeLessThanOrEqual(perfect);
  });

  it("computes the documented worst, target and perfect totals", () => {
    // Derived by brute-forcing every seating of the fixture's six guests
    // against the active canonical rules; recompute here if the roster or
    // rules change. (These match campaign Dinner 3, which shares this roster.)
    expect(computeWorstScore(level)).toBe(-10);
    expect(computeTargetScore(level)).toBe(24);
    expect(computePerfectScore(level)).toBe(48);
  });

  it("is never beaten by any hand-picked seating", () => {
    const perfect = computePerfectScore(level);
    const strong: SeatingPlan = {
      "seat-0": "bree",
      "seat-1": "rex",
      "seat-2": "andrew",
      "seat-3": "danielle",
      "seat-4": "martha",
      "seat-5": "henry",
    };
    expect(totalFor(strong)).toBeLessThanOrEqual(perfect);
  });
});
