import type { CharacterDefinition, CharacterId } from "@/types";

/**
 * The full family roster. All twelve characters are defined here for reuse
 * across future levels, even though the proof of concept only seats six of
 * them in Level 1.
 */
export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  martha: {
    id: "martha",
    displayName: "Martha",
    familyRole: "Grandmother, married to Henry",
    description:
      "The family matriarch. Martha loves having her grandchildren nearby and always wants to know what everyone is up to.",
    treeLabel: "Grandmother",
    tags: ["adult"],
  },
  henry: {
    id: "henry",
    displayName: "Henry",
    familyRole: "Grandfather, married to Martha",
    description:
      "Martha's husband and the quietest member of the family. Henry prefers calm meals, familiar company and a comfortable seat.",
    treeLabel: "Grandfather",
    tags: ["adult"],
  },
  rex: {
    id: "rex",
    displayName: "Rex",
    familyRole: "Martha and Henry's eldest son, married to Bree",
    description:
      "Bree's husband and the father of Andrew and Danielle. Rex tries to keep the dinner running smoothly, especially when his siblings start arguing.",
    treeLabel: "Eldest son",
    tags: ["adult"],
  },
  bree: {
    id: "bree",
    displayName: "Bree",
    familyRole: "Rex's wife, mother of Andrew and Danielle",
    description:
      "The mother of Andrew and Danielle. Bree likes keeping her family close, but she has little patience for certain relatives.",
    treeLabel: "Rex's wife",
    tags: ["adult"],
  },
  susan: {
    id: "susan",
    displayName: "Susan",
    familyRole: "Martha and Henry's daughter, mother of Julie",
    description:
      "Rex and Paul's sister, Karl's former partner and Julie's mother. Susan rarely hides what she thinks, especially around people she dislikes.",
    treeLabel: "Daughter",
    tags: ["adult"],
  },
  karl: {
    id: "karl",
    displayName: "Karl",
    familyRole: "Susan's former partner, father of Julie",
    description:
      "Julie's father. Karl still attends family dinners despite his difficult history with Susan and some of her relatives.",
    treeLabel: "Former partner",
    tags: ["adult"],
  },
  paul: {
    id: "paul",
    displayName: "Paul",
    familyRole: "Martha and Henry's youngest son, father of Zach",
    description:
      "Angela's partner and Zach's father. Paul often tries to keep the peace, even when nobody asked him to get involved.",
    treeLabel: "Youngest son",
    tags: ["adult"],
  },
  angela: {
    id: "angela",
    displayName: "Angela",
    familyRole: "Paul's partner, mother of Zach",
    description:
      "Zach's mother. Angela gets along with some parts of the family better than others and tries not to be dragged into old arguments.",
    treeLabel: "Paul's partner",
    tags: ["adult"],
  },
  julie: {
    id: "julie",
    displayName: "Julie",
    familyRole: "Susan and Karl's teenage daughter",
    description:
      "An independent teenager who would rather spend time with her cousins than sit between her parents.",
    treeLabel: "Grandchild",
    tags: ["teen"],
  },
  andrew: {
    id: "andrew",
    displayName: "Andrew",
    familyRole: "Rex and Bree's young son",
    description:
      "Danielle's little brother. Andrew is happiest when he can sit near the other children and avoid too much adult attention.",
    treeLabel: "Grandchild",
    tags: ["child"],
  },
  danielle: {
    id: "danielle",
    displayName: "Danielle",
    familyRole: "Rex and Bree's daughter",
    description:
      "Andrew's older sister. Danielle enjoys spending time with both her brother and her grandmother.",
    treeLabel: "Grandchild",
    tags: ["child"],
  },
  zach: {
    id: "zach",
    displayName: "Zach",
    familyRole: "Paul and Angela's teenage son",
    description:
      "The relaxed, popular cousin. Zach would usually rather sit with Julie, Andrew or Danielle than stay beside his parents.",
    treeLabel: "Grandchild",
    tags: ["child"],
  },
};

export function getCharacter(id: CharacterId): CharacterDefinition {
  return CHARACTERS[id];
}
