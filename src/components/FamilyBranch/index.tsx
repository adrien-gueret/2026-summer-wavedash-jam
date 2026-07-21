import FamilyTreeNode from "@/components/FamilyTreeNode";
import { CHARACTERS } from "@/data/characters";
import type { CharacterId, PartnerRelationshipStatus } from "@/types";

import "./style.css";

type FamilyBranchProps = {
  /** The couple at the top of this branch (usually two parents). */
  partnerIds: readonly [CharacterId, CharacterId];
  partnerStatus: PartnerRelationshipStatus;
  /** The children shown beneath the couple. */
  childIds: readonly CharacterId[];
  /** Accessible heading describing the branch, e.g. "Rex and Bree". */
  heading: string;
  selectedCharacterId: CharacterId | null;
  onSelect: (characterId: CharacterId) => void;
  /** Registers each rendered node so connectors can be measured against it. */
  registerNode: (characterId: CharacterId, element: HTMLElement | null) => void;
};

/**
 * Renders one couple and the children below them. Connector lines are drawn as
 * an SVG overlay by the parent FamilyTree; former partners keep a compact "EX"
 * badge so the distinction never relies on colour alone.
 */
export default function FamilyBranch({
  partnerIds,
  partnerStatus,
  childIds,
  heading,
  selectedCharacterId,
  onSelect,
  registerNode,
}: FamilyBranchProps) {
  const [firstId, secondId] = partnerIds;
  const isFormer = partnerStatus === "former";

  return (
    <section className="family-branch" aria-label={heading}>
      <div className="family-branch__couple">
        <FamilyTreeNode
          character={CHARACTERS[firstId]}
          isSelected={selectedCharacterId === firstId}
          relationLabel={CHARACTERS[firstId].familyRole}
          onSelect={onSelect}
          registerNode={registerNode}
        />

        <div
          className={`family-branch__link${
            isFormer ? " family-branch__link--former" : ""
          }`}
          aria-hidden="true"
        >
          {isFormer ? (
            <span className="family-branch__link-label" title="Former partners">
              EX
            </span>
          ) : null}
        </div>

        <FamilyTreeNode
          character={CHARACTERS[secondId]}
          isSelected={selectedCharacterId === secondId}
          relationLabel={CHARACTERS[secondId].familyRole}
          onSelect={onSelect}
          registerNode={registerNode}
        />
      </div>

      {childIds.length > 0 ? (
        <ul className="family-branch__children">
          {childIds.map((childId) => (
            <li key={childId} className="family-branch__child">
              <FamilyTreeNode
                character={CHARACTERS[childId]}
                isSelected={selectedCharacterId === childId}
                relationLabel={CHARACTERS[childId].familyRole}
                onSelect={onSelect}
                registerNode={registerNode}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
