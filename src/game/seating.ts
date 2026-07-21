import type { CharacterId, SeatId, SeatingPlan } from "@/types";

/**
 * Returns a new seating plan with the guests at the two seats swapped. Empty
 * seats (null) are swapped like any occupant, so swapping an occupied seat
 * with an empty one simply moves the guest. The original plan is never
 * mutated. Swapping a seat with itself, or passing an unknown seat id, returns
 * an unchanged copy of the plan.
 */
export function swapGuests(
  seatingPlan: SeatingPlan,
  firstSeatId: SeatId,
  secondSeatId: SeatId,
): SeatingPlan {
  if (
    firstSeatId === secondSeatId ||
    !(firstSeatId in seatingPlan) ||
    !(secondSeatId in seatingPlan)
  ) {
    return { ...seatingPlan };
  }

  return {
    ...seatingPlan,
    [firstSeatId]: seatingPlan[secondSeatId],
    [secondSeatId]: seatingPlan[firstSeatId],
  };
}

/**
 * Seats a guest at the target seat. Any guest previously sitting there is
 * removed (returned to the waiting area). If the guest was already seated
 * elsewhere, that seat is emptied. The original plan is never mutated.
 */
export function placeGuest(
  seatingPlan: SeatingPlan,
  characterId: CharacterId,
  targetSeatId: SeatId,
): SeatingPlan {
  if (!(targetSeatId in seatingPlan)) {
    return { ...seatingPlan };
  }

  const next: SeatingPlan = { ...seatingPlan };
  for (const seatId of Object.keys(next)) {
    if (next[seatId] === characterId) {
      next[seatId] = null;
    }
  }
  next[targetSeatId] = characterId;
  return next;
}

/** Empties a seat, returning its guest (if any) to the waiting area. */
export function unseatGuest(
  seatingPlan: SeatingPlan,
  seatId: SeatId,
): SeatingPlan {
  if (!(seatId in seatingPlan)) {
    return { ...seatingPlan };
  }
  return { ...seatingPlan, [seatId]: null };
}

/** Builds a reverse lookup from character id to the seat they occupy. */
export function getSeatByCharacter(
  seatingPlan: SeatingPlan,
): Record<CharacterId, SeatId> {
  const result = {} as Record<CharacterId, SeatId>;

  for (const seatId of Object.keys(seatingPlan)) {
    const characterId = seatingPlan[seatId];
    if (characterId) {
      result[characterId] = seatId;
    }
  }

  return result;
}

/** The characters from the level that are not currently seated. */
export function getUnplacedCharacterIds(
  characterIds: CharacterId[],
  seatingPlan: SeatingPlan,
): CharacterId[] {
  const seated = new Set(
    Object.values(seatingPlan).filter((value): value is CharacterId =>
      Boolean(value),
    ),
  );
  return characterIds.filter((characterId) => !seated.has(characterId));
}
