import { describe, expect, it } from "vitest";
import {
  getBlockDefinition,
  listBlockDefinitions,
} from "@/lib/blocks/registry";

// The "Add block" picker filters out blocks flagged `hidden` (see
// AddBlockButton), but their renderers must keep working so existing pages that
// already use them don't break. These tests lock in both halves of that.
const HIDDEN_FROM_PICKER = [
  "partnerImageGrid",
  "homepageHero",
  "discoverHero",
  "researchHero",
  "teamHero",
  "contactHero",
  "studiesHero",
  "contactDetails",
];

// Mirrors AddBlockButton's filter.
const pickerTypes = (scope: "page" | "study" = "page") =>
  listBlockDefinitions(scope)
    .filter((d) => !d.hidden)
    .map((d) => d.type);

describe("block picker visibility", () => {
  it("hides retired/page-specific blocks from the picker", () => {
    const visible = pickerTypes();
    for (const type of HIDDEN_FROM_PICKER) {
      expect(visible).not.toContain(type);
    }
  });

  it("keeps hidden blocks resolvable so existing pages still render", () => {
    for (const type of HIDDEN_FROM_PICKER) {
      expect(getBlockDefinition(type)).toBeTruthy();
    }
  });

  it("keeps the generic 'Blank hero' in the picker as the only hero", () => {
    const def = getBlockDefinition("subpageHero");
    expect(def?.hidden).toBeFalsy();
    expect(def?.label).toBe("Blank hero");
    const heroesInPicker = listBlockDefinitions("page").filter(
      (d) => !d.hidden && d.category === "Hero",
    );
    expect(heroesInPicker.map((d) => d.type)).toEqual(["subpageHero"]);
  });
});

describe("studies overview block", () => {
  it("is categorised as Dynamic (live data) and visible in the picker", () => {
    const def = getBlockDefinition("studiesOverview");
    expect(def?.category).toBe("Dynamic");
    expect(def?.hidden).toBeFalsy();
    expect(pickerTypes()).toContain("studiesOverview");
  });
});

describe("info card labels match what the components render", () => {
  // The InfoCardLeft/InfoCardRight components' desktop layouts are swapped, so
  // the labels (and default image crop) are deliberately the inverse of the
  // type name. Guards against a well-meaning "fix" re-introducing the bug.
  it("infoCardLeft is labelled image-right and defaults to a right crop", () => {
    const def = getBlockDefinition("infoCardLeft");
    expect(def?.label).toBe("Info card (image right)");
    expect(def?.defaultContent).toMatchObject({ imagePosition: "right" });
  });

  it("infoCardRight is labelled image-left and defaults to a left crop", () => {
    const def = getBlockDefinition("infoCardRight");
    expect(def?.label).toBe("Info card (image left)");
    expect(def?.defaultContent).toMatchObject({ imagePosition: "left" });
  });
});

describe("contactDetails block naming", () => {
  it("resolves to a friendly label so the editor doesn't show the raw type", () => {
    const def = getBlockDefinition("contactDetails");
    expect(def?.label).toBe("Contact details");
    expect(def?.editable).toBe(false);
  });
});
