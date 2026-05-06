import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "docs/seo/generated/fallback-seo-authority-inventory.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/fallback-seo-authority-inventory.md");

type FallbackClassification =
  | "acceptable_product_code"
  | "safe_cms_backed_fallback"
  | "watchlist"
  | "migration_required";

type FallbackSurface = {
  id: string;
  routeFamily: string;
  files: string[];
  cmsAuthority: string;
  frontendFallback: string;
  classification: FallbackClassification;
  risk: "P0" | "P1" | "P2";
  recommendedAction: string;
};

type FallbackInventory = {
  version: string;
  scope: string;
  runtimeBehaviorChanged: boolean;
  summary: Record<string, number>;
  surfaces: FallbackSurface[];
  blockedBeforeExpansion: string[];
};

function readReport(): FallbackInventory {
  return JSON.parse(fs.readFileSync(REPORT_PATH, "utf8")) as FallbackInventory;
}

describe("CMS-backed fallback SEO authority inventory", () => {
  it("is a read-only PR-UG-07 governance artifact", () => {
    const report = readReport();

    expect(report.version).toBe("url_truth.fallback_seo_authority_inventory.v1");
    expect(report.scope).toBe("PR-UG-07");
    expect(report.runtimeBehaviorChanged).toBe(false);
    expect(report.surfaces).toHaveLength(report.summary.totalSurfaces);
    expect(report.blockedBeforeExpansion.length).toBeGreaterThanOrEqual(3);
  });

  it("classifies migration-required and watchlist fallback authority surfaces", () => {
    const report = readReport();
    const byId = new Map(report.surfaces.map((surface) => [surface.id, surface]));

    expect(byId.get("articles_detail")?.classification).toBe("migration_required");
    expect(byId.get("llms_topic_fallback_set")?.classification).toBe("migration_required");
    expect(byId.get("topics_detail")?.classification).toBe("watchlist");
    expect(byId.get("career_guides_detail")?.classification).toBe("watchlist");
    expect(byId.get("career_landing_surface")?.classification).toBe("safe_cms_backed_fallback");
    expect(byId.get("personality_product_code")?.classification).toBe("acceptable_product_code");

    expect(report.surfaces.filter((surface) => surface.classification === "migration_required")).toHaveLength(2);
  });

  it("keeps every referenced source file grounded in the current repo", () => {
    const report = readReport();

    for (const surface of report.surfaces) {
      expect(surface.cmsAuthority.trim(), `${surface.id} cmsAuthority`).not.toBe("");
      expect(surface.frontendFallback.trim(), `${surface.id} frontendFallback`).not.toBe("");
      expect(surface.recommendedAction.trim(), `${surface.id} recommendedAction`).not.toBe("");

      for (const relPath of surface.files) {
        expect(fs.existsSync(path.join(ROOT, relPath)), `${surface.id} missing ${relPath}`).toBe(true);
      }
    }
  });

  it("documents the expansion blockers without proposing runtime cleanup", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("No fallback removal in this PR");
    expect(doc).toContain("No runtime metadata or JSON-LD changes");
    expect(doc).toContain("Article detail JSON-LD fallback");
    expect(doc).toContain("llms topic fallback enumeration");
    expect(doc).toContain("Topic Graph");
  });
});
