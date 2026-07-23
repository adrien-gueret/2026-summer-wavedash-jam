import { describe, expect, it } from "vitest";

import { CHARACTERS } from "@/data/characters";
import {
  PREFERENCES,
  getActivePreferencesForLevel,
  getPreferencesForOwner,
  isPreferenceApplicable,
  preferenceTargetIds,
} from "@/data/preferences";
import { evaluatePreference } from "@/game/scoring";
import type {
  CharacterId,
  LevelDefinition,
  SeatDefinition,
  SeatingPlan,
  TableDefinition,
} from "@/types";

const ALL_CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[];

function seat(id: string): SeatDefinition {
  return { id, label: id, position: { x: 0, y: 0 } };
}

/** A six-seat ring table with three opposite pairs and one end seat. */
function hexTable(prefix: string, endSeatIds: string[] = []): TableDefinition {
  const ids = [0, 1, 2, 3, 4, 5].map((index) => `${prefix}${index}`);
  return {
    id: prefix,
    seats: ids.map(seat),
    adjacentSeatPairs: [
      [ids[0], ids[1]],
      [ids[1], ids[2]],
      [ids[2], ids[3]],
      [ids[3], ids[4]],
      [ids[4], ids[5]],
      [ids[5], ids[0]],
    ],
    oppositeSeatPairs: [
      [ids[0], ids[3]],
      [ids[1], ids[4]],
      [ids[2], ids[5]],
    ],
    endSeatIds,
  };
}

function makeLevel(
  tables: TableDefinition[],
  characterIds: CharacterId[],
): LevelDefinition {
  const initialSeating: SeatingPlan = {};
  for (const table of tables) {
    for (const tableSeat of table.seats) {
      initialSeating[tableSeat.id] = null;
    }
  }
  return {
    id: "test",
    title: "Test Level",
    description: "Synthetic level for unit tests.",
    tables,
    characterIds,
    initialSeating,
    story: {
      targetScoreMessage: "",
      perfectScoreMessage: "",
      worstScoreMessage: "",
    },
  };
}

function seatingFrom(
  level: LevelDefinition,
  placements: Record<string, CharacterId>,
): SeatingPlan {
  return { ...level.initialSeating, ...placements };
}

function evaluateById(
  preferenceId: string,
  level: LevelDefinition,
  seating: SeatingPlan,
) {
  return evaluatePreference(PREFERENCES[preferenceId], seating, level);
}

describe("canonical preference profiles", () => {
  it("defines exactly 36 preferences (three per character)", () => {
    expect(Object.keys(PREFERENCES)).toHaveLength(36);
  });

  it("keeps every entry key in sync with its id", () => {
    for (const [id, preference] of Object.entries(PREFERENCES)) {
      expect(preference.id).toBe(id);
    }
  });

  it("only references known characters as owners and targets", () => {
    for (const preference of Object.values(PREFERENCES)) {
      expect(ALL_CHARACTER_IDS).toContain(preference.ownerId);
      for (const targetId of preferenceTargetIds(preference)) {
        expect(ALL_CHARACTER_IDS).toContain(targetId);
      }
    }
  });

  it.each(ALL_CHARACTER_IDS)(
    "gives %s one +6, one +3 and one negative condition",
    (characterId) => {
      const owned = getPreferencesForOwner(characterId);
      expect(owned).toHaveLength(3);

      const points = owned
        .map((preference) => preference.points)
        .sort((first, second) => first - second);
      const [negative, secondary, main] = points;
      expect(main).toBe(6);
      expect(secondary).toBe(3);
      expect(negative).toBeLessThanOrEqual(-4);
      expect(negative).toBeGreaterThanOrEqual(-8);
    },
  );
});

describe("adjacent-or-opposite condition (Karl)", () => {
  // Karl dislikes sitting next to OR opposite Susan (-4).
  const level = makeLevel([hexTable("s")], ["karl", "susan"]);

  it("triggers when Susan is adjacent", () => {
    const seating = seatingFrom(level, { s0: "karl", s1: "susan" });
    const evaluation = evaluateById("karl-not-near-susan", level, seating);
    expect(evaluation.pointsAwarded).toBe(-4);
    expect(evaluation.status).toBe("violated");
  });

  it("triggers when Susan is opposite", () => {
    const seating = seatingFrom(level, { s0: "karl", s3: "susan" });
    const evaluation = evaluateById("karl-not-near-susan", level, seating);
    expect(evaluation.pointsAwarded).toBe(-4);
    expect(evaluation.status).toBe("violated");
  });

  it("does not trigger when Susan is neither adjacent nor opposite", () => {
    // s0 neighbours s1 and s5, and sits opposite s3; s2 is none of those.
    const seating = seatingFrom(level, { s0: "karl", s2: "susan" });
    const evaluation = evaluateById("karl-not-near-susan", level, seating);
    expect(evaluation.pointsAwarded).toBe(0);
    expect(evaluation.status).toBe("avoided");
  });
});

describe("end-seat conditions", () => {
  const level = makeLevel([hexTable("s", ["s0"])], ["henry"]);

  it("awards Henry +3 for taking an end seat", () => {
    const seating = seatingFrom(level, { s0: "henry" });
    const evaluation = evaluateById("henry-end-seat", level, seating);
    expect(evaluation.pointsAwarded).toBe(3);
    expect(evaluation.status).toBe("fulfilled");
  });

  it("awards Henry 0 when not on an end seat", () => {
    const seating = seatingFrom(level, { s1: "henry" });
    const evaluation = evaluateById("henry-end-seat", level, seating);
    expect(evaluation.pointsAwarded).toBe(0);
    expect(evaluation.status).toBe("unfulfilled");
  });
});

describe("multi-target once aggregation", () => {
  const level = makeLevel([hexTable("s")], ["martha", "andrew", "danielle"]);

  it("awards +6 a single time even next to two grandchildren", () => {
    const seating = seatingFrom(level, {
      s0: "martha",
      s1: "andrew",
      s5: "danielle",
    });
    const evaluation = evaluateById(
      "martha-next-to-grandchild",
      level,
      seating,
    );
    expect(evaluation.pointsAwarded).toBe(6);
  });
});

describe("pending conditions (owner not seated)", () => {
  const level = makeLevel(
    [hexTable("s", ["s0"])],
    ["martha", "andrew", "danielle"],
  );

  it("marks a positive condition pending while its owner waits", () => {
    // Andrew and Danielle are seated but Martha is still in the waiting area.
    const seating = seatingFrom(level, { s1: "andrew", s2: "danielle" });
    const evaluation = evaluateById(
      "martha-next-to-grandchild",
      level,
      seating,
    );
    expect(evaluation.status).toBe("pending");
    expect(evaluation.pointsAwarded).toBe(0);
    expect(evaluation.isTriggered).toBe(false);
  });

  it("marks a negative condition pending rather than avoided", () => {
    // Andrew is unseated, so his dislike is neither triggered nor "avoided" yet.
    const seating = seatingFrom(level, { s1: "danielle" });
    const evaluation = evaluateById(
      "andrew-not-next-to-martha-or-henry",
      level,
      seating,
    );
    expect(evaluation.status).toBe("pending");
    expect(evaluation.pointsAwarded).toBe(0);
  });

  it("marks an end-seat condition pending until its owner sits", () => {
    const seating = seatingFrom(level, {});
    const evaluation = evaluateById("martha-not-end-seat", level, seating);
    expect(evaluation.status).toBe("pending");
  });
});

describe("inactive conditions", () => {
  // Henry is absent, so Martha's "opposite Henry" wish cannot apply.
  const level = makeLevel([hexTable("s")], ["martha", "andrew", "danielle"]);

  it("reports inactive with no points when the target is absent", () => {
    const seating = seatingFrom(level, { s0: "martha", s3: "andrew" });
    const evaluation = evaluateById("martha-opposite-henry", level, seating);
    expect(evaluation.status).toBe("inactive");
    expect(evaluation.pointsAwarded).toBe(0);
    expect(evaluation.isTriggered).toBe(false);
  });

  it("is excluded from the level's active preferences", () => {
    const activeIds = getActivePreferencesForLevel(level.characterIds).map(
      (preference) => preference.id,
    );
    expect(activeIds).not.toContain("martha-opposite-henry");
  });
});

describe("applicability", () => {
  it("requires the owner to be present", () => {
    expect(
      isPreferenceApplicable(PREFERENCES["rex-next-to-bree"], ["bree"]),
    ).toBe(false);
  });

  it("keeps a none-target condition active whenever the owner is present", () => {
    expect(
      isPreferenceApplicable(PREFERENCES["martha-not-end-seat"], ["martha"]),
    ).toBe(true);
  });

  it("activates a multi-target condition when any one target is present", () => {
    // Karl is absent, but Susan is present, so the rule still applies.
    expect(
      isPreferenceApplicable(PREFERENCES["rex-not-next-to-susan-or-karl"], [
        "rex",
        "susan",
      ]),
    ).toBe(true);
  });
});

describe("multiple tables", () => {
  // Guests at different tables never share an adjacency, so a wish to sit next
  // to someone across the room cannot be fulfilled.
  const twoTables = [hexTable("a"), hexTable("b")];
  const level = makeLevel(twoTables, ["andrew", "danielle"]);

  it("does not fulfil an adjacency across separate tables", () => {
    const seating = seatingFrom(level, { a0: "andrew", b0: "danielle" });
    const evaluation = evaluateById("andrew-next-to-danielle", level, seating);
    expect(evaluation.pointsAwarded).toBe(0);
    expect(evaluation.status).toBe("unfulfilled");
  });

  it("fulfils an adjacency within a single table", () => {
    const seating = seatingFrom(level, { a0: "andrew", a1: "danielle" });
    const evaluation = evaluateById("andrew-next-to-danielle", level, seating);
    expect(evaluation.pointsAwarded).toBe(6);
    expect(evaluation.status).toBe("fulfilled");
  });
});
