import { describe, expect, it } from "vitest";

import {
  getSeatByCharacter,
  getUnplacedCharacterIds,
  placeGuest,
  swapGuests,
  unseatGuest,
} from "@/game/seating";
import type { CharacterId, SeatingPlan } from "@/types";

const characterIds: CharacterId[] = [
  "martha",
  "andrew",
  "danielle",
  "rex",
  "bree",
  "susan",
];

const fullSeating: SeatingPlan = {
  "seat-0": "martha",
  "seat-1": "andrew",
  "seat-2": "rex",
  "seat-3": "bree",
  "seat-4": "susan",
  "seat-5": "danielle",
};

const emptySeating: SeatingPlan = {
  "seat-0": null,
  "seat-1": null,
  "seat-2": null,
  "seat-3": null,
  "seat-4": null,
  "seat-5": null,
};

describe("swapGuests", () => {
  it("exchanges only the two targeted guests", () => {
    const next = swapGuests(fullSeating, "seat-0", "seat-1");
    expect(next["seat-0"]).toBe("andrew");
    expect(next["seat-1"]).toBe("martha");
    expect(next["seat-2"]).toBe("rex");
    expect(next["seat-3"]).toBe("bree");
    expect(next["seat-4"]).toBe("susan");
    expect(next["seat-5"]).toBe("danielle");
  });

  it("moves a guest when swapping with an empty seat", () => {
    const plan: SeatingPlan = { ...emptySeating, "seat-0": "martha" };
    const next = swapGuests(plan, "seat-0", "seat-3");
    expect(next["seat-0"]).toBeNull();
    expect(next["seat-3"]).toBe("martha");
  });

  it("does not mutate the original plan", () => {
    const original: SeatingPlan = { ...fullSeating };
    swapGuests(original, "seat-0", "seat-1");
    expect(original).toEqual(fullSeating);
  });

  it("returns an unchanged copy when swapping a seat with itself", () => {
    const next = swapGuests(fullSeating, "seat-2", "seat-2");
    expect(next).toEqual(fullSeating);
    expect(next).not.toBe(fullSeating);
  });

  it("returns an unchanged copy for unknown seats", () => {
    const next = swapGuests(fullSeating, "seat-0", "seat-99");
    expect(next).toEqual(fullSeating);
  });
});

describe("placeGuest", () => {
  it("seats a waiting guest at an empty seat", () => {
    const next = placeGuest(emptySeating, "martha", "seat-2");
    expect(next["seat-2"]).toBe("martha");
    expect(getUnplacedCharacterIds(characterIds, next)).not.toContain("martha");
  });

  it("bumps the current occupant back to the waiting area", () => {
    const plan: SeatingPlan = { ...emptySeating, "seat-2": "rex" };
    const next = placeGuest(plan, "martha", "seat-2");
    expect(next["seat-2"]).toBe("martha");
    expect(getUnplacedCharacterIds(characterIds, next)).toContain("rex");
  });

  it("moves an already-seated guest, emptying their old seat", () => {
    const next = placeGuest(fullSeating, "martha", "seat-1");
    expect(next["seat-0"]).toBeNull();
    expect(next["seat-1"]).toBe("martha");
    // Andrew, previously in seat-1, is bumped to the waiting area.
    expect(getUnplacedCharacterIds(characterIds, next)).toContain("andrew");
  });

  it("does not mutate the original plan", () => {
    const original: SeatingPlan = { ...emptySeating };
    placeGuest(original, "martha", "seat-0");
    expect(original).toEqual(emptySeating);
  });
});

describe("unseatGuest", () => {
  it("empties the seat and returns the guest to the waiting area", () => {
    const next = unseatGuest(fullSeating, "seat-0");
    expect(next["seat-0"]).toBeNull();
    expect(getUnplacedCharacterIds(characterIds, next)).toContain("martha");
  });

  it("does nothing meaningful for an already-empty seat", () => {
    const next = unseatGuest(emptySeating, "seat-0");
    expect(next).toEqual(emptySeating);
  });
});

describe("getSeatByCharacter", () => {
  it("maps each seated character to their seat and skips empty seats", () => {
    const plan: SeatingPlan = { ...emptySeating, "seat-1": "andrew" };
    const map = getSeatByCharacter(plan);
    expect(map.andrew).toBe("seat-1");
    expect(map.martha).toBeUndefined();
  });
});

describe("getUnplacedCharacterIds", () => {
  it("returns every character when the table is empty", () => {
    expect(getUnplacedCharacterIds(characterIds, emptySeating)).toEqual(
      characterIds,
    );
  });

  it("returns none when everyone is seated", () => {
    expect(getUnplacedCharacterIds(characterIds, fullSeating)).toEqual([]);
  });

  it("returns only the guests still waiting", () => {
    const plan: SeatingPlan = {
      ...emptySeating,
      "seat-0": "martha",
      "seat-1": "andrew",
    };
    expect(getUnplacedCharacterIds(characterIds, plan)).toEqual([
      "danielle",
      "rex",
      "bree",
      "susan",
    ]);
  });
});
