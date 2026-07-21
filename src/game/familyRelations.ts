import { FAMILY_TREE } from "@/data/familyTree";
import type {
  CharacterId,
  FamilyTreeDefinition,
  PartnerRelationship,
} from "@/types";

/**
 * Pure helpers for reading direct family relationships out of a
 * {@link FamilyTreeDefinition}. They power the About the Family information
 * panel without duplicating relationship data across the UI.
 *
 * Every helper defaults to the shared {@link FAMILY_TREE} so callers can invoke
 * them with just a character id, while tests can inject a custom tree.
 */

/** Return the partner relationships involving the given character. */
export function getPartnerRelationships(
  characterId: CharacterId,
  familyTree: FamilyTreeDefinition = FAMILY_TREE,
): PartnerRelationship[] {
  return familyTree.partnerRelationships.filter(
    (relationship) =>
      relationship.firstCharacterId === characterId ||
      relationship.secondCharacterId === characterId,
  );
}

/** Return the ids of the given character's partners (current or former). */
export function getPartners(
  characterId: CharacterId,
  familyTree: FamilyTreeDefinition = FAMILY_TREE,
): CharacterId[] {
  return getPartnerRelationships(characterId, familyTree).map((relationship) =>
    relationship.firstCharacterId === characterId
      ? relationship.secondCharacterId
      : relationship.firstCharacterId,
  );
}

/** Return the ids of the given character's parents. */
export function getParents(
  characterId: CharacterId,
  familyTree: FamilyTreeDefinition = FAMILY_TREE,
): CharacterId[] {
  const parents: CharacterId[] = [];
  for (const relationship of familyTree.parentChildRelationships) {
    if (relationship.childIds.includes(characterId)) {
      for (const parentId of relationship.parentIds) {
        if (!parents.includes(parentId)) {
          parents.push(parentId);
        }
      }
    }
  }
  return parents;
}

/** Return the ids of the given character's children. */
export function getChildren(
  characterId: CharacterId,
  familyTree: FamilyTreeDefinition = FAMILY_TREE,
): CharacterId[] {
  const children: CharacterId[] = [];
  for (const relationship of familyTree.parentChildRelationships) {
    if (relationship.parentIds.includes(characterId)) {
      for (const childId of relationship.childIds) {
        if (!children.includes(childId)) {
          children.push(childId);
        }
      }
    }
  }
  return children;
}

/**
 * Return the ids of the given character's siblings: everyone who shares at
 * least one parent, excluding the character themselves.
 */
export function getSiblings(
  characterId: CharacterId,
  familyTree: FamilyTreeDefinition = FAMILY_TREE,
): CharacterId[] {
  const parents = getParents(characterId, familyTree);
  const siblings: CharacterId[] = [];
  for (const parentId of parents) {
    for (const childId of getChildren(parentId, familyTree)) {
      if (childId !== characterId && !siblings.includes(childId)) {
        siblings.push(childId);
      }
    }
  }
  return siblings;
}

/** Return the ids of the given character's grandchildren. */
export function getGrandchildren(
  characterId: CharacterId,
  familyTree: FamilyTreeDefinition = FAMILY_TREE,
): CharacterId[] {
  const grandchildren: CharacterId[] = [];
  for (const childId of getChildren(characterId, familyTree)) {
    for (const grandchildId of getChildren(childId, familyTree)) {
      if (!grandchildren.includes(grandchildId)) {
        grandchildren.push(grandchildId);
      }
    }
  }
  return grandchildren;
}

/**
 * Return the ids of the given character's cousins: the children of their
 * parents' siblings.
 */
export function getCousins(
  characterId: CharacterId,
  familyTree: FamilyTreeDefinition = FAMILY_TREE,
): CharacterId[] {
  const cousins: CharacterId[] = [];
  for (const parentId of getParents(characterId, familyTree)) {
    for (const auntOrUncleId of getSiblings(parentId, familyTree)) {
      for (const cousinId of getChildren(auntOrUncleId, familyTree)) {
        if (cousinId !== characterId && !cousins.includes(cousinId)) {
          cousins.push(cousinId);
        }
      }
    }
  }
  return cousins;
}
