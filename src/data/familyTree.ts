import type { FamilyTreeDefinition } from "@/types";

/**
 * The fixed family structure behind Table for Trouble. Kept separate from
 * gameplay preferences: this data only describes who is related to whom.
 *
 * Martha and Henry are the grandparents. Their three children are Rex, Susan
 * and Paul. Julie is the daughter of Susan and Karl (former partners).
 */
export const FAMILY_TREE: FamilyTreeDefinition = {
  partnerRelationships: [
    {
      firstCharacterId: "martha",
      secondCharacterId: "henry",
      status: "current",
    },
    {
      firstCharacterId: "rex",
      secondCharacterId: "bree",
      status: "current",
    },
    {
      firstCharacterId: "paul",
      secondCharacterId: "angela",
      status: "current",
    },
    {
      firstCharacterId: "susan",
      secondCharacterId: "karl",
      status: "former",
    },
  ],

  parentChildRelationships: [
    {
      parentIds: ["martha", "henry"],
      childIds: ["rex", "susan", "paul"],
    },
    {
      parentIds: ["rex", "bree"],
      childIds: ["andrew", "danielle"],
    },
    {
      parentIds: ["susan", "karl"],
      childIds: ["julie"],
    },
    {
      parentIds: ["paul", "angela"],
      childIds: ["zach"],
    },
  ],
};
