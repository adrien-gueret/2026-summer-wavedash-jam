import type { SeatId, SeatPair, TableDefinition } from "@/types";

/**
 * Returns true when the two seats appear together in the given pair
 * collection, in either order. Pair lookup is bidirectional.
 */
export function areSeatsRelated(
  firstSeatId: SeatId,
  secondSeatId: SeatId,
  pairs: readonly SeatPair[],
): boolean {
  if (firstSeatId === secondSeatId) {
    return false;
  }

  return pairs.some(
    ([a, b]) =>
      (a === firstSeatId && b === secondSeatId) ||
      (a === secondSeatId && b === firstSeatId),
  );
}

export function areSeatsAdjacent(
  firstSeatId: SeatId,
  secondSeatId: SeatId,
  table: TableDefinition,
): boolean {
  return areSeatsRelated(firstSeatId, secondSeatId, table.adjacentSeatPairs);
}

export function areSeatsOpposite(
  firstSeatId: SeatId,
  secondSeatId: SeatId,
  table: TableDefinition,
): boolean {
  return areSeatsRelated(firstSeatId, secondSeatId, table.oppositeSeatPairs);
}

/**
 * All adjacent seat pairs across a level's tables. Seat ids are unique per
 * table, so guests seated at different tables never share a pair and are
 * therefore never adjacent.
 */
export function collectAdjacentPairs(
  tables: readonly TableDefinition[],
): SeatPair[] {
  return tables.flatMap((table) => table.adjacentSeatPairs);
}

/** All opposite seat pairs across a level's tables (see collectAdjacentPairs). */
export function collectOppositePairs(
  tables: readonly TableDefinition[],
): SeatPair[] {
  return tables.flatMap((table) => table.oppositeSeatPairs);
}

/** Every end seat across a level's tables. */
export function collectEndSeatIds(
  tables: readonly TableDefinition[],
): SeatId[] {
  return tables.flatMap((table) => table.endSeatIds);
}

/** Every seat id across a level's tables. */
export function collectSeatIds(tables: readonly TableDefinition[]): SeatId[] {
  return tables.flatMap((table) => table.seats.map((seat) => seat.id));
}
