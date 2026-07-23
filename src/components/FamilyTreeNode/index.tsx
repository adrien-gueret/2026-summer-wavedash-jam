import CharacterPortrait from "@/components/CharacterPortrait";
import type { CharacterDefinition } from "@/types";

import "./style.css";

type FamilyTreeNodeProps = {
  character: CharacterDefinition;
  isSelected: boolean;
  /** Accessible label describing who the character is, e.g. "daughter of…". */
  relationLabel: string;
  onSelect: (characterId: CharacterDefinition["id"]) => void;
  /** Registers the rendered element so connectors can be measured against it. */
  registerNode?: (
    characterId: CharacterDefinition["id"],
    element: HTMLElement | null,
  ) => void;
};

/**
 * A single selectable person in the family tree, rendered as a semantic
 * toggle button so it is keyboard accessible and exposes its selected state.
 */
export default function FamilyTreeNode({
  character,
  isSelected,
  relationLabel,
  onSelect,
  registerNode,
}: FamilyTreeNodeProps) {
  const className = ["family-node", isSelected ? "family-node--selected" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      ref={(element) => registerNode?.(character.id, element)}
      aria-pressed={isSelected}
      aria-label={`Select ${character.displayName}, ${relationLabel}`}
      onClick={() => onSelect(character.id)}
      onMouseEnter={() => onSelect(character.id)}
      onFocus={() => onSelect(character.id)}
    >
      <CharacterPortrait character={character} size="medium" />
      <span className="family-node__name">{character.displayName}</span>
    </button>
  );
}
