import { describe, expect, it } from "vitest";

import { tableForSix } from "@/data/tables";
import { areSeatsAdjacent, areSeatsOpposite } from "@/game/geometry";

const table = tableForSix;

describe("seat adjacency", () => {
  it("recognizes perimeter neighbours", () => {
    expect(areSeatsAdjacent("seat-0", "seat-1", table)).toBe(true);
    expect(areSeatsAdjacent("seat-0", "seat-5", table)).toBe(true);
  });

  it("rejects non-neighbours", () => {
    expect(areSeatsAdjacent("seat-0", "seat-2", table)).toBe(false);
    expect(areSeatsAdjacent("seat-0", "seat-4", table)).toBe(false);
  });

  it("is symmetric", () => {
    expect(areSeatsAdjacent("seat-0", "seat-1", table)).toBe(
      areSeatsAdjacent("seat-1", "seat-0", table),
    );
  });

  it("is never adjacent to itself", () => {
    expect(areSeatsAdjacent("seat-0", "seat-0", table)).toBe(false);
  });
});

describe("opposite-seat geometry", () => {
  it("matches the explicit opposite pairs", () => {
    expect(areSeatsOpposite("seat-0", "seat-4", table)).toBe(true);
    expect(areSeatsOpposite("seat-1", "seat-3", table)).toBe(true);
    expect(areSeatsOpposite("seat-2", "seat-5", table)).toBe(true);
  });

  it("works in reverse", () => {
    expect(areSeatsOpposite("seat-4", "seat-0", table)).toBe(true);
    expect(areSeatsOpposite("seat-3", "seat-1", table)).toBe(true);
    expect(areSeatsOpposite("seat-5", "seat-2", table)).toBe(true);
  });

  it("rejects the incorrect (index + 3) % 6 assumptions", () => {
    expect(areSeatsOpposite("seat-0", "seat-3", table)).toBe(false);
    expect(areSeatsOpposite("seat-1", "seat-4", table)).toBe(false);
  });
});
