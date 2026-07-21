import type { TableDefinition } from "@/types";

/**
 * Level 1 uses six seats arranged around an oval table. Adjacency and opposite
 * relationships are declared explicitly and are the single source of truth.
 * They must not be derived from seat indices or visual coordinates. The two
 * seats at the ends of the oval's long axis (seat-2 on the right, seat-5 on the
 * left) are the "head of table" end seats, declared explicitly in endSeatIds.
 *
 *           Seat 0      Seat 1
 *
 *     Seat 5                  Seat 2
 *
 *           Seat 4      Seat 3
 */
export const ovalTableForSix: TableDefinition = {
  id: "oval-table-6",
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
