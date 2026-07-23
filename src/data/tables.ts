import type { TableDefinition } from "@/types";

/**
 *
 *           Seat 0      Seat 1
 *
 *     Seat 5                  Seat 2
 *
 *           Seat 4      Seat 3
 */
export const tableForSix: TableDefinition = {
  id: "table-6",
  seats: [
    { id: "seat-0", label: "Seat 0", position: { x: 35, y: 22 } },
    { id: "seat-1", label: "Seat 1", position: { x: 65, y: 22 } },
    { id: "seat-2", label: "Seat 2", position: { x: 88, y: 50 } },
    { id: "seat-3", label: "Seat 3", position: { x: 65, y: 78 } },
    { id: "seat-4", label: "Seat 4", position: { x: 35, y: 78 } },
    { id: "seat-5", label: "Seat 5", position: { x: 12, y: 50 } },
  ],
  adjacentSeatPairs: [
    ["seat-0", "seat-1"],
    ["seat-1", "seat-2"],
    ["seat-2", "seat-3"],
    ["seat-3", "seat-4"],
    ["seat-4", "seat-5"],
    ["seat-5", "seat-0"],
  ],
  oppositeSeatPairs: [
    ["seat-0", "seat-4"],
    ["seat-1", "seat-3"],
    ["seat-2", "seat-5"],
  ],
  endSeatIds: ["seat-2", "seat-5"],
};

/**
 * A banquet table (two long sides plus two short ends).
 *
 *        Seat 0   Seat 1   Seat 2
 *
 *     Seat 7                     Seat 3
 *
 *        Seat 6   Seat 5   Seat 4
 */
export const tableForEight: TableDefinition = {
  id: "table-8",
  seats: [
    { id: "seat-0", label: "Seat 0", position: { x: 30, y: 22 } },
    { id: "seat-1", label: "Seat 1", position: { x: 50, y: 22 } },
    { id: "seat-2", label: "Seat 2", position: { x: 70, y: 22 } },
    { id: "seat-3", label: "Seat 3", position: { x: 88, y: 50 } },
    { id: "seat-4", label: "Seat 4", position: { x: 70, y: 78 } },
    { id: "seat-5", label: "Seat 5", position: { x: 50, y: 78 } },
    { id: "seat-6", label: "Seat 6", position: { x: 30, y: 78 } },
    { id: "seat-7", label: "Seat 7", position: { x: 12, y: 50 } },
  ],
  adjacentSeatPairs: [
    ["seat-0", "seat-1"],
    ["seat-1", "seat-2"],
    ["seat-2", "seat-3"],
    ["seat-3", "seat-4"],
    ["seat-4", "seat-5"],
    ["seat-5", "seat-6"],
    ["seat-6", "seat-7"],
    ["seat-7", "seat-0"],
  ],
  oppositeSeatPairs: [
    ["seat-0", "seat-6"],
    ["seat-1", "seat-5"],
    ["seat-2", "seat-4"],
    ["seat-3", "seat-7"],
  ],
  endSeatIds: ["seat-3", "seat-7"],
};

/**
 * A banquet table for ten (four seats per long side, one at each end).
 *
 *      Seat 0  Seat 1  Seat 2  Seat 3
 *
 *   Seat 9                          Seat 4
 *
 *      Seat 8  Seat 7  Seat 6  Seat 5
 */
export const tableForTen: TableDefinition = {
  id: "table-10",
  seats: [
    { id: "seat-0", label: "Seat 0", position: { x: 26, y: 22 } },
    { id: "seat-1", label: "Seat 1", position: { x: 42, y: 22 } },
    { id: "seat-2", label: "Seat 2", position: { x: 58, y: 22 } },
    { id: "seat-3", label: "Seat 3", position: { x: 74, y: 22 } },
    { id: "seat-4", label: "Seat 4", position: { x: 88, y: 50 } },
    { id: "seat-5", label: "Seat 5", position: { x: 74, y: 78 } },
    { id: "seat-6", label: "Seat 6", position: { x: 58, y: 78 } },
    { id: "seat-7", label: "Seat 7", position: { x: 42, y: 78 } },
    { id: "seat-8", label: "Seat 8", position: { x: 26, y: 78 } },
    { id: "seat-9", label: "Seat 9", position: { x: 12, y: 50 } },
  ],
  adjacentSeatPairs: [
    ["seat-0", "seat-1"],
    ["seat-1", "seat-2"],
    ["seat-2", "seat-3"],
    ["seat-3", "seat-4"],
    ["seat-4", "seat-5"],
    ["seat-5", "seat-6"],
    ["seat-6", "seat-7"],
    ["seat-7", "seat-8"],
    ["seat-8", "seat-9"],
    ["seat-9", "seat-0"],
  ],
  oppositeSeatPairs: [
    ["seat-0", "seat-8"],
    ["seat-1", "seat-7"],
    ["seat-2", "seat-6"],
    ["seat-3", "seat-5"],
    ["seat-4", "seat-9"],
  ],
  endSeatIds: ["seat-4", "seat-9"],
};

/**
 * A banquet table for twelve (five seats per long side, one at each end).
 *
 *    Seat 0 Seat 1 Seat 2 Seat 3 Seat 4
 *
 * Seat 11                            Seat 5
 *
 *    Seat 10 Seat 9 Seat 8 Seat 7 Seat 6
 */
export const tableForTwelve: TableDefinition = {
  id: "table-12",
  seats: [
    { id: "seat-0", label: "Seat 0", position: { x: 22, y: 22 } },
    { id: "seat-1", label: "Seat 1", position: { x: 36, y: 22 } },
    { id: "seat-2", label: "Seat 2", position: { x: 50, y: 22 } },
    { id: "seat-3", label: "Seat 3", position: { x: 64, y: 22 } },
    { id: "seat-4", label: "Seat 4", position: { x: 78, y: 22 } },
    { id: "seat-5", label: "Seat 5", position: { x: 88, y: 50 } },
    { id: "seat-6", label: "Seat 6", position: { x: 78, y: 78 } },
    { id: "seat-7", label: "Seat 7", position: { x: 64, y: 78 } },
    { id: "seat-8", label: "Seat 8", position: { x: 50, y: 78 } },
    { id: "seat-9", label: "Seat 9", position: { x: 36, y: 78 } },
    { id: "seat-10", label: "Seat 10", position: { x: 22, y: 78 } },
    { id: "seat-11", label: "Seat 11", position: { x: 12, y: 50 } },
  ],
  adjacentSeatPairs: [
    ["seat-0", "seat-1"],
    ["seat-1", "seat-2"],
    ["seat-2", "seat-3"],
    ["seat-3", "seat-4"],
    ["seat-4", "seat-5"],
    ["seat-5", "seat-6"],
    ["seat-6", "seat-7"],
    ["seat-7", "seat-8"],
    ["seat-8", "seat-9"],
    ["seat-9", "seat-10"],
    ["seat-10", "seat-11"],
    ["seat-11", "seat-0"],
  ],
  oppositeSeatPairs: [
    ["seat-0", "seat-10"],
    ["seat-1", "seat-9"],
    ["seat-2", "seat-8"],
    ["seat-3", "seat-7"],
    ["seat-4", "seat-6"],
    ["seat-5", "seat-11"],
  ],
  endSeatIds: ["seat-5", "seat-11"],
};
