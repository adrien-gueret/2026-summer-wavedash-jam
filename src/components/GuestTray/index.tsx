import type { KeyboardEvent } from "react";

import { useDraggable, useDroppable } from "@dnd-kit/core";

import CharacterPortrait from "@/components/CharacterPortrait";
import type { CharacterDefinition, CharacterId } from "@/types";

import "./style.css";

type GuestTrayProps = {
  guests: CharacterDefinition[];
  seatedCount: number;
  totalCount: number;
  inspectedCharacterId: CharacterId | null;
  grabbedCharacterId: CharacterId | null;
  onInspect: (characterId: CharacterId) => void;
  onActivate: (characterId: CharacterId) => void;
};

type TrayGuestProps = {
  character: CharacterDefinition;
  isInspected: boolean;
  isGrabbed: boolean;
  onInspect: (characterId: CharacterId) => void;
  onActivate: (characterId: CharacterId) => void;
};

function TrayGuest({
  character,
  isInspected,
  isGrabbed,
  onInspect,
  onActivate,
}: TrayGuestProps) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: character.id,
    data: { sourceSeatId: null, size: "small" as const },
  });

  const buttonClass = [
    "guest-tray__guest",
    isInspected ? "guest-tray__guest--inspected" : "",
    isGrabbed ? "guest-tray__guest--grabbed" : "",
    isDragging ? "guest-tray__guest--dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate(character.id);
    }
  };

  return (
    <li>
      <button
        ref={setNodeRef}
        type="button"
        className={buttonClass}
        data-guest-id={character.id}
        {...attributes}
        {...listeners}
        aria-pressed={isGrabbed}
        aria-label={
          isGrabbed
            ? `${character.displayName} picked up. Choose a seat, or press Escape to cancel.`
            : `${character.displayName}, waiting. Drag onto a seat, or press Enter to pick up.`
        }
        onClick={() => onInspect(character.id)}
        onMouseEnter={() => onInspect(character.id)}
        onFocus={() => onInspect(character.id)}
        onKeyDown={handleKeyDown}
      >
        <CharacterPortrait character={character} size="small" />
        <span className="guest-tray__name">{character.displayName}</span>
      </button>
    </li>
  );
}

/**
 * The waiting area. Every guest starts here; the player drags them out to the
 * table (or drags a seated guest back in). Guests can also be picked up with
 * the keyboard (Enter/Space) and placed by activating a seat.
 */
export default function GuestTray({
  guests,
  seatedCount,
  totalCount,
  inspectedCharacterId,
  grabbedCharacterId,
  onInspect,
  onActivate,
}: GuestTrayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "tray",
    data: { target: { type: "tray" } },
  });

  const className = ["guest-tray", isOver ? "guest-tray--drop-target" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={setNodeRef}
      className={className}
      aria-label="Guests waiting to be seated"
    >
      <header className="guest-tray__header">
        <h2 className="guest-tray__title">Waiting to be seated</h2>
        <p className="guest-tray__count">
          {seatedCount} of {totalCount} seated
        </p>
      </header>

      {guests.length === 0 ? (
        <p className="guest-tray__empty">Everyone is at the table.</p>
      ) : (
        <ul className="guest-tray__list">
          {guests.map((character) => (
            <TrayGuest
              key={character.id}
              character={character}
              isInspected={inspectedCharacterId === character.id}
              isGrabbed={grabbedCharacterId === character.id}
              onInspect={onInspect}
              onActivate={onActivate}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
