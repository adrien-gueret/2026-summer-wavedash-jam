import { useCallback } from "react";
import type { KeyboardEvent } from "react";

import { useDraggable, useDroppable } from "@dnd-kit/core";

import CharacterPortrait from "@/components/CharacterPortrait";
import type {
  CharacterDefinition,
  CharacterExpression,
  CharacterId,
  SeatDefinition,
  SeatId,
} from "@/types";

import "./style.css";

type SeatProps = {
  seat: SeatDefinition;
  character: CharacterDefinition | null;
  expression: CharacterExpression;
  isInspected: boolean;
  isGrabbed: boolean;
  onInspect: (characterId: CharacterId) => void;
  onActivate: (seatId: SeatId) => void;
};

export default function Seat({
  seat,
  character,
  expression,
  isInspected,
  isGrabbed,
  onInspect,
  onActivate,
}: SeatProps) {
  // Every seat is a drop zone; only an occupied seat can also be dragged.
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `seat:${seat.id}`,
    data: { target: { type: "seat", seatId: seat.id } },
  });

  const {
    setNodeRef: setDragRef,
    listeners,
    attributes,
    isDragging,
  } = useDraggable({
    id: character ? character.id : `empty-seat:${seat.id}`,
    disabled: !character,
    data: { sourceSeatId: seat.id, size: "medium" as const },
  });

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDropRef(node);
      setDragRef(node);
    },
    [setDropRef, setDragRef],
  );

  const classNames = [
    "seat",
    character ? "" : "seat--empty",
    character && expression === "happy" ? "seat--happy" : "",
    character && expression === "sad" ? "seat--sad" : "",
    isInspected ? "seat--inspected" : "",
    isGrabbed ? "seat--grabbed" : "",
    isDragging ? "seat--dragging" : "",
    isOver ? "seat--drop-target" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate(seat.id);
    }
  };

  const style = {
    left: `${seat.position.x}%`,
    top: `${seat.position.y}%`,
  };

  if (!character) {
    const emptyLabel = `${seat.label}, empty. Press Enter to seat the picked-up guest here.`;
    return (
      <div className="seat-slot" style={style}>
        <button
          ref={setNodeRef}
          type="button"
          className={classNames}
          data-seat-id={seat.id}
          aria-label={emptyLabel}
          onKeyDown={handleKeyDown}
        >
          <span className="seat__placeholder" aria-hidden="true" />
          <span className="seat__name seat__name--empty">{seat.label}</span>
        </button>
      </div>
    );
  }

  const label = isGrabbed
    ? `${character.displayName} picked up. Choose a seat to sit them, or press Escape to cancel.`
    : `${seat.label}, occupied by ${character.displayName}. Drag onto a seat or the waiting area, or press Enter to pick up.`;

  return (
    <div className="seat-slot" style={style}>
      <button
        ref={setNodeRef}
        type="button"
        className={classNames}
        data-seat-id={seat.id}
        data-guest-id={character.id}
        {...attributes}
        {...listeners}
        aria-pressed={isGrabbed}
        aria-label={label}
        onClick={() => onInspect(character.id)}
        onMouseEnter={() => onInspect(character.id)}
        onFocus={() => onInspect(character.id)}
        onKeyDown={handleKeyDown}
      >
        <CharacterPortrait character={character} expression={expression} />
        <span className="seat__name">{character.displayName}</span>
      </button>
    </div>
  );
}
