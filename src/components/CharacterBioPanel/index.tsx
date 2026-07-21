import CharacterPortrait from "@/components/CharacterPortrait";
import { CHARACTERS } from "@/data/characters";
import {
  getChildren,
  getCousins,
  getGrandchildren,
  getParents,
  getPartnerRelationships,
  getSiblings,
} from "@/game/familyRelations";
import type { CharacterId } from "@/types";

import "./style.css";

type CharacterBioPanelProps = {
  selectedCharacterId: CharacterId | null;
};

type RelationSection = {
  key: string;
  label: string;
  names: string;
};

/** Join display names as "A", "A and B" or "A, B and C". */
function formatNames(characterIds: CharacterId[]): string {
  const names = characterIds.map((id) => CHARACTERS[id].displayName);
  if (names.length <= 1) {
    return names.join("");
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function buildSections(characterId: CharacterId): RelationSection[] {
  const sections: RelationSection[] = [];

  const parents = getParents(characterId);
  if (parents.length > 0) {
    sections.push({
      key: "parents",
      label: parents.length > 1 ? "Parents" : "Parent",
      names: formatNames(parents),
    });
  }

  for (const relationship of getPartnerRelationships(characterId)) {
    const partnerId =
      relationship.firstCharacterId === characterId
        ? relationship.secondCharacterId
        : relationship.firstCharacterId;
    sections.push({
      key: `partner-${partnerId}`,
      label: relationship.status === "former" ? "Former partner" : "Partner",
      names: CHARACTERS[partnerId].displayName,
    });
  }

  const children = getChildren(characterId);
  if (children.length > 0) {
    sections.push({
      key: "children",
      label: children.length > 1 ? "Children" : "Child",
      names: formatNames(children),
    });
  }

  const siblings = getSiblings(characterId);
  if (siblings.length > 0) {
    sections.push({
      key: "siblings",
      label: siblings.length > 1 ? "Siblings" : "Sibling",
      names: formatNames(siblings),
    });
  }

  const cousins = getCousins(characterId);
  if (cousins.length > 0) {
    sections.push({
      key: "cousins",
      label: cousins.length > 1 ? "Cousins" : "Cousin",
      names: formatNames(cousins),
    });
  }

  const grandchildren = getGrandchildren(characterId);
  if (grandchildren.length > 0) {
    sections.push({
      key: "grandchildren",
      label: "Grandchildren",
      names: formatNames(grandchildren),
    });
  }

  return sections;
}

export default function CharacterBioPanel({
  selectedCharacterId,
}: CharacterBioPanelProps) {
  if (!selectedCharacterId) {
    return (
      <aside className="bio-panel bio-panel--empty" aria-live="polite">
        <h2 className="bio-panel__title">Select a family member</h2>
        <p className="bio-panel__prompt">
          Choose someone in the family tree to learn more about them.
        </p>
      </aside>
    );
  }

  const character = CHARACTERS[selectedCharacterId];
  const sections = buildSections(selectedCharacterId);

  return (
    <aside className="bio-panel" aria-live="polite">
      <header className="bio-panel__header">
        <CharacterPortrait character={character} size="large" />
        <div className="bio-panel__identity">
          <h2 className="bio-panel__title">{character.displayName}</h2>
          <p className="bio-panel__role">{character.familyRole}</p>
        </div>
      </header>

      <p className="bio-panel__description">{character.description}</p>

      <dl className="bio-panel__relations">
        {sections.map((section) => (
          <div key={section.key} className="bio-panel__relation">
            <dt className="bio-panel__relation-label">{section.label}</dt>
            <dd className="bio-panel__relation-names">{section.names}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
