import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CharacterBioPanel from "@/components/CharacterBioPanel";
import FamilyTree from "@/components/FamilyTree";
import { ROUTES } from "@/constants";
import type { CharacterId } from "@/types";

import "./style.css";

export default function AboutFamily() {
  const navigate = useNavigate();
  const [selectedCharacterId, setSelectedCharacterId] =
    useState<CharacterId | null>(null);

  const handleSelect = useCallback((characterId: CharacterId) => {
    setSelectedCharacterId(characterId);
  }, []);

  // Escape clears the current selection.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCharacterId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="about-family">
      <header className="about-family__header">
        <button
          type="button"
          className="about-family__back"
          onClick={() => navigate(ROUTES.home)}
        >
          Back
        </button>
        <h1 className="about-family__title">About the Family</h1>
        <p className="about-family__intro">
          Meet the family behind the dinner-table drama. Select someone in the
          family tree to learn more about them.
        </p>
      </header>

      <div className="about-family__content">
        <FamilyTree
          selectedCharacterId={selectedCharacterId}
          onSelect={handleSelect}
        />
        <CharacterBioPanel selectedCharacterId={selectedCharacterId} />
      </div>
    </main>
  );
}
