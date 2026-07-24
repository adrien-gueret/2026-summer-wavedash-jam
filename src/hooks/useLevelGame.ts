import { useCallback, useMemo, useState } from "react";

import { useSounds } from "wavedash-react";

import { computeSeatingScore } from "@/game/scoring";
import {
  getSeatByCharacter,
  getUnplacedCharacterIds,
  placeGuest,
  swapGuests,
  unseatGuest,
} from "@/game/seating";
import type {
  CharacterId,
  DropTarget,
  LevelDefinition,
  ScoreResult,
  SeatId,
  SeatingPlan,
} from "@/types";

export type UseLevelGameResult = {
  level: LevelDefinition;
  seatingPlan: SeatingPlan;
  scoreResult: ScoreResult;
  unplacedCharacterIds: CharacterId[];
  allSeated: boolean;
  inspectedCharacterId: CharacterId | null;
  grabbedCharacterId: CharacterId | null;
  isResultOpen: boolean;
  hasSubmitted: boolean;
  inspectCharacter: (characterId: CharacterId) => void;
  clearInspection: () => void;
  dropGuest: (
    characterId: CharacterId,
    sourceSeatId: SeatId | null,
    target: DropTarget,
  ) => void;
  activateSeat: (seatId: SeatId) => void;
  activateTrayGuest: (characterId: CharacterId) => void;
  cancelGrab: () => void;
  resetLevel: () => void;
  submitLevel: () => void;
  closeResult: () => void;
};

/** Sound effects played when a guest is placed on a chair. */
const SEAT_SOUND_IDS = ["seat1", "seat2"];

/**
 * Owns the transient gameplay state for a single level: the current seating
 * plan (with empty seats), the inspected/grabbed guest and the result modal.
 * Everyone starts in the waiting area; the goal is to seat all guests. The
 * harmony score is always derived from the level and the seating plan, never
 * stored independently. Inspecting a guest never changes the seating; placing,
 * moving and swapping are explicit actions (drag & drop, or keyboard
 * grab/drop).
 */
export function useLevelGame(level: LevelDefinition): UseLevelGameResult {
  const [seatingPlan, setSeatingPlan] = useState<SeatingPlan>(
    level.initialSeating,
  );
  const [inspectedCharacterId, setInspectedCharacterId] =
    useState<CharacterId | null>(null);
  const [grabbedCharacterId, setGrabbedCharacterId] =
    useState<CharacterId | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { playSound } = useSounds();

  const playSeatSound = useCallback(() => {
    const soundId =
      SEAT_SOUND_IDS[Math.floor(Math.random() * SEAT_SOUND_IDS.length)];
    playSound(soundId);
  }, [playSound]);

  const scoreResult = useMemo(
    () => computeSeatingScore(level, seatingPlan),
    [level, seatingPlan],
  );

  const unplacedCharacterIds = useMemo(
    () => getUnplacedCharacterIds(level.characterIds, seatingPlan),
    [level.characterIds, seatingPlan],
  );

  const allSeated = unplacedCharacterIds.length === 0;

  const inspectCharacter = useCallback((characterId: CharacterId) => {
    setInspectedCharacterId(characterId);
  }, []);

  const clearInspection = useCallback(() => {
    setInspectedCharacterId(null);
  }, []);

  const dropGuest = useCallback(
    (
      characterId: CharacterId,
      sourceSeatId: SeatId | null,
      target: DropTarget,
    ) => {
      // Read the current plan from the closure and pass a plain value so a
      // swap is not double-applied by React StrictMode's updater re-run.
      if (target.type === "tray") {
        if (sourceSeatId) {
          setSeatingPlan(unseatGuest(seatingPlan, sourceSeatId));
          playSeatSound();
        }
      } else if (sourceSeatId) {
        if (sourceSeatId !== target.seatId) {
          setSeatingPlan(swapGuests(seatingPlan, sourceSeatId, target.seatId));
          playSeatSound();
        }
      } else {
        setSeatingPlan(placeGuest(seatingPlan, characterId, target.seatId));
        playSeatSound();
      }
      setGrabbedCharacterId(null);
    },
    [seatingPlan, playSeatSound],
  );

  const activateSeat = useCallback(
    (seatId: SeatId) => {
      const occupant = seatingPlan[seatId] ?? null;
      if (grabbedCharacterId === null) {
        if (occupant) {
          setGrabbedCharacterId(occupant);
        }
        return;
      }
      const sourceSeatId =
        getSeatByCharacter(seatingPlan)[grabbedCharacterId] ?? null;
      dropGuest(grabbedCharacterId, sourceSeatId, { type: "seat", seatId });
    },
    [dropGuest, grabbedCharacterId, seatingPlan],
  );

  const activateTrayGuest = useCallback((characterId: CharacterId) => {
    setGrabbedCharacterId((previous) =>
      previous === characterId ? null : characterId,
    );
  }, []);

  const cancelGrab = useCallback(() => {
    setGrabbedCharacterId(null);
  }, []);

  const resetLevel = useCallback(() => {
    setSeatingPlan(level.initialSeating);
    setInspectedCharacterId(null);
    setGrabbedCharacterId(null);
  }, [level.initialSeating]);

  const submitLevel = useCallback(() => {
    setGrabbedCharacterId(null);
    setIsResultOpen(true);
    setHasSubmitted(true);
  }, []);

  const closeResult = useCallback(() => {
    setIsResultOpen(false);
  }, []);

  return {
    level,
    seatingPlan,
    scoreResult,
    unplacedCharacterIds,
    allSeated,
    inspectedCharacterId,
    grabbedCharacterId,
    isResultOpen,
    hasSubmitted,
    inspectCharacter,
    clearInspection,
    dropGuest,
    activateSeat,
    activateTrayGuest,
    cancelGrab,
    resetLevel,
    submitLevel,
    closeResult,
  };
}
