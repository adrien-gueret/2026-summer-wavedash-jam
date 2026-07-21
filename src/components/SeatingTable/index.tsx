import { useLayoutEffect, useRef } from "react";

import Seat from "@/components/Seat";
import { CHARACTERS } from "@/data/characters";
import type {
  CharacterExpression,
  CharacterId,
  SeatId,
  SeatingPlan,
  SeatRelation,
  TableDefinition,
} from "@/types";

import "./style.css";

type SeatingTableProps = {
  table: TableDefinition;
  seatingPlan: SeatingPlan;
  inspectedCharacterId: CharacterId | null;
  grabbedCharacterId: CharacterId | null;
  seatRelations: ReadonlyMap<SeatId, SeatRelation>;
  expressionFor: (characterId: CharacterId) => CharacterExpression;
  onInspectCharacter: (characterId: CharacterId) => void;
  onActivateSeat: (seatId: SeatId) => void;
};

/** How long a guest takes to glide to a new seat, e.g. during a swap. */
const SEAT_MOVE_DURATION_MS = 320;

export default function SeatingTable({
  table,
  seatingPlan,
  inspectedCharacterId,
  grabbedCharacterId,
  seatRelations,
  expressionFor,
  onInspectCharacter,
  onActivateSeat,
}: SeatingTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Position of each seated guest's portrait after the previous render, keyed
  // by character id. Used to FLIP-animate a guest gliding from their old seat
  // to their new one (for example the displaced guest during a swap).
  const previousRects = useRef<Map<CharacterId, DOMRect>>(new Map());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const seatButtons = Array.from(
      container.querySelectorAll<HTMLElement>(".seat[data-guest-id]"),
    );

    const nextRects = new Map<CharacterId, DOMRect>();
    for (const button of seatButtons) {
      const guestId = button.dataset.guestId as CharacterId | undefined;
      if (guestId) {
        nextRects.set(guestId, button.getBoundingClientRect());
      }
    }

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!prefersReducedMotion) {
      for (const button of seatButtons) {
        const guestId = button.dataset.guestId as CharacterId | undefined;
        if (!guestId) {
          continue;
        }
        const previous = previousRects.current.get(guestId);
        const next = nextRects.get(guestId);
        if (!previous || !next) {
          continue;
        }
        const deltaX = previous.left - next.left;
        const deltaY = previous.top - next.top;
        if (deltaX === 0 && deltaY === 0) {
          continue;
        }
        // FLIP: start the guest at their old position, then glide to the new
        // one. The Web Animations API leaves no inline styles behind, so the
        // seat's own hover/inspect transforms keep working afterwards.
        button.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: "translate(0, 0)" },
          ],
          {
            duration: SEAT_MOVE_DURATION_MS,
            easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
          },
        );
      }
    }

    previousRects.current = nextRects;
  }, [seatingPlan]);

  return (
    <div className="seating-table" ref={containerRef}>
      <div className="seating-table__surface" aria-hidden="true" />

      {table.seats.map((seat) => {
        const characterId = seatingPlan[seat.id];
        const character = characterId ? CHARACTERS[characterId] : null;

        return (
          <Seat
            key={seat.id}
            seat={seat}
            character={character}
            expression={character ? expressionFor(character.id) : "neutral"}
            isInspected={
              character !== null && inspectedCharacterId === character.id
            }
            isGrabbed={
              character !== null && grabbedCharacterId === character.id
            }
            relation={seatRelations.get(seat.id) ?? null}
            onInspect={onInspectCharacter}
            onActivate={onActivateSeat}
          />
        );
      })}
    </div>
  );
}
