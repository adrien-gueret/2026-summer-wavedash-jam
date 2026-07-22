import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

import CharacterPortrait from "@/components/CharacterPortrait";
import GameHeader from "@/components/GameHeader";
import GuestTray from "@/components/GuestTray";
import PreferenceList from "@/components/PreferenceList";
import ResultModal from "@/components/ResultModal";
import SeatingTable from "@/components/SeatingTable";
import { ROUTES, getPlayRoute } from "@/constants";
import { CHARACTERS } from "@/data/characters";
import { getLevel, getLevelNumber, getNextLevel } from "@/data/levels";
import { computeTargetScore, expressionForScore } from "@/game/scoring";
import { useLevelGame } from "@/hooks/useLevelGame";
import { usePersistentActions, usePersistentSelector } from "@/state";
import { selectIsLevelUnlocked } from "@/state/selectors";
import type { CharacterId, DropTarget, SeatId } from "@/types";

import "./style.css";

export default function Game() {
  const { levelId = "" } = useParams();
  const navigate = useNavigate();

  const level = getLevel(levelId);
  const isUnlocked = usePersistentSelector((state) =>
    selectIsLevelUnlocked(state, levelId),
  );

  if (!level || !isUnlocked) {
    return (
      <main className="game game--invalid">
        <h1>Dinner unavailable</h1>
        <p>You are not invited to this dinner.</p>
        <button
          type="button"
          className="game__button"
          onClick={() => navigate(ROUTES.levels)}
        >
          Back to Dinner Select
        </button>
      </main>
    );
  }

  return <PlayableLevel key={level.id} levelId={level.id} />;
}

function PlayableLevel({ levelId }: { levelId: string }) {
  const navigate = useNavigate();
  const level = getLevel(levelId)!;
  const { submitLevelResult } = usePersistentActions();

  const game = useLevelGame(level);
  const {
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
  } = game;

  // A short press (below the activation distance) still registers as a click,
  // so tapping a guest inspects them while a longer drag moves them.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const [activeDrag, setActiveDrag] = useState<{
    characterId: CharacterId;
    size: "small" | "medium";
  } | null>(null);

  // Set when a drag has just ended, so the synthetic click that follows the
  // pointer release is ignored instead of triggering inspection.
  const didDragRef = useRef(false);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const size = event.active.data.current?.size as
      "small" | "medium" | undefined;
    setActiveDrag({
      characterId: event.active.id as CharacterId,
      size: size ?? "medium",
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDrag(null);
      didDragRef.current = true;
      if (!over) {
        return;
      }
      const characterId = active.id as CharacterId;
      const sourceSeatId = (active.data.current?.sourceSeatId ??
        null) as SeatId | null;
      const target = over.data.current?.target as DropTarget | undefined;
      if (!target) {
        return;
      }
      dropGuest(characterId, sourceSeatId, target);
    },
    [dropGuest],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    didDragRef.current = true;
  }, []);

  const handleInspect = useCallback(
    (characterId: CharacterId) => {
      // Ignore the click that fires at the end of a drag, and any hover/focus
      // that happens while a drag is in progress.
      if (activeDrag || didDragRef.current) {
        didDragRef.current = false;
        return;
      }
      inspectCharacter(characterId);
    },
    [activeDrag, inspectCharacter],
  );

  const unplacedCharacters = useMemo(
    () => unplacedCharacterIds.map((id) => CHARACTERS[id]),
    [unplacedCharacterIds],
  );

  const seatedCount = level.characterIds.length - unplacedCharacterIds.length;

  const expressionByCharacter = useMemo(() => {
    const map = new Map<CharacterId, ReturnType<typeof expressionForScore>>();
    for (const breakdown of scoreResult.characters) {
      map.set(breakdown.characterId, expressionForScore(breakdown.score));
    }
    return map;
  }, [scoreResult]);

  const expressionFor = useCallback(
    (characterId: CharacterId) =>
      expressionByCharacter.get(characterId) ?? "neutral",
    [expressionByCharacter],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isResultOpen) {
        return;
      }
      if (grabbedCharacterId) {
        cancelGrab();
      } else if (inspectedCharacterId) {
        clearInspection();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    cancelGrab,
    clearInspection,
    grabbedCharacterId,
    inspectedCharacterId,
    isResultOpen,
  ]);

  const handleSubmit = useCallback(() => {
    submitLevelResult({
      levelId: level.id,
      score: scoreResult.total,
      targetScore: computeTargetScore(level),
    });
    submitLevel();
  }, [level, scoreResult.total, submitLevel, submitLevelResult]);

  const nextLevel = useMemo(() => getNextLevel(level.id), [level.id]);

  const handleNextLevel = useCallback(() => {
    closeResult();
    if (nextLevel) {
      navigate(getPlayRoute(nextLevel.id));
    } else {
      navigate(ROUTES.end);
    }
  }, [closeResult, navigate, nextLevel]);

  return (
    <main className="game">
      <GameHeader
        level={level}
        number={getLevelNumber(level.id)}
        score={scoreResult.total}
        allSeated={allSeated}
        showScore={hasSubmitted}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="game__layout">
          <section className="game__table-area" aria-label="Dining table">
            <div
              className={`game__tables${
                level.tables.length > 1 ? " game__tables--multi" : ""
              }`}
            >
              {level.tables.map((table) => (
                <SeatingTable
                  key={table.id}
                  table={table}
                  seatingPlan={seatingPlan}
                  inspectedCharacterId={inspectedCharacterId}
                  grabbedCharacterId={grabbedCharacterId}
                  expressionFor={expressionFor}
                  onInspectCharacter={handleInspect}
                  onActivateSeat={activateSeat}
                />
              ))}
            </div>
            <p className="game__hint">
              Drag guests from the waiting area onto seats.
            </p>
          </section>

          <PreferenceList
            selectedCharacterId={inspectedCharacterId}
            scoreResult={scoreResult}
          />
        </div>

        <div className="game__bottom">
          <GuestTray
            guests={unplacedCharacters}
            seatedCount={seatedCount}
            totalCount={level.characterIds.length}
            inspectedCharacterId={inspectedCharacterId}
            grabbedCharacterId={grabbedCharacterId}
            onInspect={handleInspect}
            onActivate={activateTrayGuest}
          />

          <div className="game__actions">
            {!allSeated && (
              <p id="submit-hint" className="game__submit-hint">
                Seat all {level.characterIds.length} guests to submit.
              </p>
            )}
            <div className="game__controls">
              <button
                type="button"
                className="game__button"
                onClick={resetLevel}
              >
                Reset
              </button>
              <button
                type="button"
                className="game__button game__button--primary"
                onClick={handleSubmit}
                disabled={!allSeated}
                aria-describedby={allSeated ? undefined : "submit-hint"}
              >
                Submit Seating Plan
              </button>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeDrag ? (
            <div className="game__drag-overlay">
              <CharacterPortrait
                character={CHARACTERS[activeDrag.characterId]}
                size={activeDrag.size}
                expression={expressionFor(activeDrag.characterId)}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isResultOpen && (
        <ResultModal
          level={level}
          scoreResult={scoreResult}
          isLastLevel={!nextLevel}
          onNextLevel={handleNextLevel}
          onContinue={closeResult}
          onBackToLevels={() => navigate(ROUTES.levels)}
        />
      )}
    </main>
  );
}
