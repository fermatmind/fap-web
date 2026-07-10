import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const SOURCE = readFileSync("app/(localized)/[locale]/personality/big-five/[...slug]/page.tsx", "utf8");

describe("SECURITY-123-WEB-09 Big Five facet hub JSON-LD", () => {
  it("restores backend-gated CollectionPage JSON-LD for facet hubs", () => {
    expect(SOURCE).toContain("buildCollectionPageJsonLd");
    expect(SOURCE).toContain('asset.entityType === "hub" || asset.entityType === "facet_hub"');
    expect(SOURCE).toContain("asset.schemaRuntimeEligible");
    expect(SOURCE).not.toContain('asset.entityType === "hub" || asset.entityType === "facet_hub"\n      ? null');
  });
});
