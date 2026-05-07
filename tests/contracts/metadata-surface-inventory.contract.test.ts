import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "docs/seo/generated/metadata-surface-inventory.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/metadata-surface-inventory.md");

type MetadataSurfaceClassification =
  | "backend_owned"
  | "cms_backed"
  | "product_code_only"
  | "private_noindex"
  | "migration_required"
  | "watchlist"
  | "safe_static";

type MetadataSurfaceRow = {
  file: string;
  routePattern: string;
  routeFamily: string;
  exportKind: string;
  ownership: string;
  classification: MetadataSurfaceClassification;
  risk: "P0" | "P1" | "P2";
  usesBuildPageMetadata: boolean;
  usesSeoSurface: boolean;
  rendersJsonLd: boolean;
  hasFrontendJsonLdBuilderFallback: boolean;
  noindexSignal: boolean;
  reason: string;
};

type MetadataSurfaceInventory = {
  version: string;
  scope: string;
  runtimeBehaviorChanged: boolean;
  summary: Record<string, unknown>;
  rows: MetadataSurfaceRow[];
  migrationRequired: MetadataSurfaceRow[];
  watchlist: MetadataSurfaceRow[];
  privateNoindex: MetadataSurfaceRow[];
  blockedBeforeExpansion: string[];
};

function readReport(): MetadataSurfaceInventory {
  return JSON.parse(fs.readFileSync(REPORT_PATH, "utf8")) as MetadataSurfaceInventory;
}

describe("metadata surface ownership inventory", () => {
  it("is reproducible through the checked-in scanner without changing runtime SEO behavior", () => {
    const output = execFileSync("node", ["scripts/seo/generate-metadata-surface-inventory.mjs", "--pretty"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const generated = JSON.parse(output) as MetadataSurfaceInventory;
    const checkedIn = readReport();

    expect(generated.version).toBe("seo_foundation.metadata_surface_inventory.v1");
    expect(generated.scope).toBe("PR-SEOF-01");
    expect(generated.runtimeBehaviorChanged).toBe(false);
    expect(generated.rows.length).toBe(checkedIn.rows.length);
    expect(generated.summary).toEqual(checkedIn.summary);
  });

  it("classifies key SEO authority surfaces and migration risks", () => {
    const report = readReport();
    const byFile = new Map(report.rows.map((row) => [row.file, row]));

    expect(byFile.get("app/(localized)/[locale]/articles/[slug]/page.tsx")).toMatchObject({
      routeFamily: "article_detail",
      classification: "migration_required",
      ownership: "cms_backed",
      risk: "P1",
    });
    expect(byFile.get("app/(localized)/[locale]/topics/[slug]/page.tsx")).toMatchObject({
      routeFamily: "topic_detail",
      classification: "watchlist",
      ownership: "cms_backed",
      risk: "P1",
    });
    expect(byFile.get("app/(localized)/[locale]/career/jobs/[slug]/page.tsx")).toMatchObject({
      routeFamily: "career_job_detail",
      classification: "backend_owned",
      ownership: "backend_owned",
    });
    expect(byFile.get("app/(localized)/[locale]/tests/[slug]/take/page.tsx")).toMatchObject({
      routeFamily: "test_take_private",
      classification: "private_noindex",
    });

    expect(report.migrationRequired.length).toBeGreaterThanOrEqual(1);
    expect(report.watchlist.length).toBeGreaterThanOrEqual(1);
    expect(report.privateNoindex.length).toBeGreaterThanOrEqual(5);
  });

  it("keeps every referenced metadata source grounded in the current repo", () => {
    const report = readReport();

    expect(report.rows.length).toBeGreaterThan(50);
    for (const row of report.rows) {
      expect(fs.existsSync(path.join(ROOT, row.file)), row.file).toBe(true);
      expect(row.routePattern.startsWith("/"), row.file).toBe(true);
      expect(row.routeFamily.trim(), row.file).not.toBe("");
      expect(row.classification.trim(), row.file).not.toBe("");
      expect(row.reason.trim(), row.file).not.toBe("");
    }
  });

  it("documents expansion blockers without proposing runtime remediation", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const report = readReport();

    expect(doc).toContain("No runtime metadata changes");
    expect(doc).toContain("Article detail JSON-LD fallback");
    expect(doc).toContain("Topic Graph");
    expect(report.blockedBeforeExpansion).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Article JSON-LD frontend fallback"),
        expect.stringContaining("llms topic fallback governance"),
      ])
    );
  });
});
