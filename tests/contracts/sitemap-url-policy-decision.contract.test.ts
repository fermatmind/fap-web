import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

type InventoryRow = {
  path: string;
  routeFamily: string;
};

type Inventory = {
  version: string;
  source: {
    siteUrl: string;
    sitemap: string;
  };
  summary: {
    totalUrls: number;
    routeFamilyCounts: Record<string, number>;
  };
  rows: InventoryRow[];
};

type ExposureFixture = {
  routeFamilies: Array<{
    name: string;
    samples: string[];
    expected: {
      noindex: boolean;
      sitemap: boolean;
      llms: string;
    };
  }>;
};

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T;
}

describe("SEO-SITEMAP-P0-05 URL policy decision", () => {
  it("locks production sitemap as URL truth without promoting local artifacts", () => {
    const decision = readText("docs/operations/sitemap-url-policy-decision-2026-06-02.md");
    const inventory = readJson<Inventory>("docs/seo/generated/url-inventory.v1.json");

    expect(decision).toContain("PR train: `SEO-SITEMAP-P0-05`");
    expect(decision).toContain("Production `https://fermatmind.com/sitemap.xml` is the URL truth");
    expect(decision).toContain("checked-in local `public/sitemap.xml` is a local artifact");
    expect(decision).toContain("Generated inventory from production sitemap | 2270 rows");

    expect(inventory.version).toBe("url_truth.inventory.v1");
    expect(inventory.source).toMatchObject({
      siteUrl: "https://fermatmind.com",
      sitemap: "https://fermatmind.com/sitemap.xml",
    });
    expect(inventory.summary.totalUrls).toBe(2270);
    expect(inventory.summary.routeFamilyCounts.career_job_detail).toBe(2092);
  });

  it("keeps /zh and career jobs index URLs out of sitemap promotion", () => {
    const decision = readText("docs/operations/sitemap-url-policy-decision-2026-06-02.md");
    const inventory = readJson<Inventory>("docs/seo/generated/url-inventory.v1.json");
    const paths = new Set(inventory.rows.map((row) => row.path));

    expect(decision).toContain("Keep `/zh` out of sitemap");
    expect(decision).toContain("Keep `/en/career/jobs` and `/zh/career/jobs` out of sitemap");

    expect(paths.has("/zh")).toBe(false);
    expect(paths.has("/en/career/jobs")).toBe(false);
    expect(paths.has("/zh/career/jobs")).toBe(false);
    expect(inventory.rows.some((row) => row.routeFamily === "career_job_detail")).toBe(true);
  });

  it("preserves existing exposure policy for the public career jobs index shell", () => {
    const fixture = readJson<ExposureFixture>(
      "tests/contracts/fixtures/discoverability-foundation/url-exposure-policy.v1.json",
    );
    const careerJobsIndex = fixture.routeFamilies.find((route) => route.name === "career_jobs_index");

    expect(careerJobsIndex).toBeDefined();
    expect(careerJobsIndex?.samples).toEqual(["/en/career/jobs", "/zh/career/jobs"]);
    expect(careerJobsIndex?.expected).toMatchObject({
      noindex: false,
      sitemap: false,
      llms: "block",
    });
  });
});
