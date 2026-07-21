import { describe, expect, it } from "vitest";

import { CHARACTERS } from "@/data/characters";
import { FAMILY_TREE } from "@/data/familyTree";
import {
  getChildren,
  getCousins,
  getParents,
  getPartnerRelationships,
  getPartners,
  getSiblings,
} from "@/game/familyRelations";

describe("getParents", () => {
  it("returns Martha and Henry for each of their children", () => {
    expect(getParents("rex")).toEqual(["martha", "henry"]);
    expect(getParents("susan")).toEqual(["martha", "henry"]);
    expect(getParents("paul")).toEqual(["martha", "henry"]);
  });

  it("returns Paul and Angela for Zach", () => {
    expect(getParents("zach")).toEqual(["paul", "angela"]);
  });

  it("returns Susan and Karl for Julie", () => {
    expect(getParents("julie")).toEqual(["susan", "karl"]);
  });
});

describe("getChildren", () => {
  it("returns the three siblings for Martha and Henry", () => {
    expect(getChildren("martha")).toEqual(["rex", "susan", "paul"]);
    expect(getChildren("henry")).toEqual(["rex", "susan", "paul"]);
  });

  it("returns Andrew and Danielle for Rex and Bree", () => {
    expect(getChildren("rex")).toEqual(["andrew", "danielle"]);
    expect(getChildren("bree")).toEqual(["andrew", "danielle"]);
  });

  it("returns Julie for Susan and Karl", () => {
    expect(getChildren("susan")).toEqual(["julie"]);
    expect(getChildren("karl")).toEqual(["julie"]);
  });

  it("returns Zach for Paul and Angela", () => {
    expect(getChildren("paul")).toEqual(["zach"]);
    expect(getChildren("angela")).toEqual(["zach"]);
  });
});

describe("getSiblings", () => {
  it("returns the other two grandchildren of Martha and Henry", () => {
    expect(getSiblings("rex")).toEqual(["susan", "paul"]);
    expect(getSiblings("susan")).toEqual(["rex", "paul"]);
    expect(getSiblings("paul")).toEqual(["rex", "susan"]);
  });

  it("returns Danielle as Andrew's sibling", () => {
    expect(getSiblings("andrew")).toEqual(["danielle"]);
  });
});

describe("getPartners", () => {
  it("returns current partners", () => {
    expect(getPartners("martha")).toEqual(["henry"]);
    expect(getPartners("henry")).toEqual(["martha"]);
    expect(getPartners("rex")).toEqual(["bree"]);
    expect(getPartners("paul")).toEqual(["angela"]);
  });

  it("returns former partners", () => {
    expect(getPartners("susan")).toEqual(["karl"]);
    expect(getPartners("karl")).toEqual(["susan"]);
  });

  it("exposes the relationship status", () => {
    const [marthaHenry] = getPartnerRelationships("martha");
    expect(marthaHenry.status).toBe("current");

    const [susanKarl] = getPartnerRelationships("susan");
    expect(susanKarl.status).toBe("former");
  });
});

describe("getCousins", () => {
  it("returns the other three young cousins", () => {
    expect(getCousins("julie").sort()).toEqual(["andrew", "danielle", "zach"]);
    expect(getCousins("zach").sort()).toEqual(["andrew", "danielle", "julie"]);
    expect(getCousins("andrew").sort()).toEqual(["julie", "zach"]);
    expect(getCousins("danielle").sort()).toEqual(["julie", "zach"]);
  });
});

describe("family data integrity", () => {
  it("never references the retired julien or lea identifiers", () => {
    const serialized = JSON.stringify({ CHARACTERS, FAMILY_TREE });
    expect(serialized).not.toContain("julien");
    expect(serialized).not.toContain("lea");
    expect(serialized).not.toContain("Julien");
    expect(serialized).not.toContain("Léa");
  });
});
