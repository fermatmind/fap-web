import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();
const SNAPSHOT_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/regression-snapshot.v1.json"
);

type Snapshot = {
  version: string;
  siteUrl: string;
  sourceFiles: Record<string, string>;
  sourceTokenSnapshot: Record<string, string[]>;
  sitemapSnapshot: {
    mustIncludeSamples: string[];
    mustExcludeSamples: string[];
  };
  llmsSnapshot: {
    mustIncludeSamples: string[];
    mustExcludeSamples: string[];
  };
  canonicalSnapshot: {
    samples: Array<{ path: string; canonicalUrl: string }>;
  };
  hreflangSnapshot: {
    samples: Array<{ path: string; alternates: Record<string, string> }>;
  };
  jsonLdSnapshot: {
    samples: Array<{ path: string; expectedTypes: string[]; canonicalUrl: string }>;
  };
  privateFlowExposureSnapshot: Array<{
    path: string;
    protections: Record<"noindex" | "nofollow" | "xRobotsTag" | "excludedFromSitemap" | "excludedFromLlms", boolean>;
  }>;
  generatedLiveParityFixtures: {
    sitemapUrl: string;
    llmsUrl: string;
    llmsFullUrl: string;
    samplePages: Array<{ path: string; checks: string[] }>;
  };
};

function readSnapshot(): Snapshot {
  return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8")) as Snapshot;
}

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function pathnameFromUrl(value: string): string {
  return new URL(value).pathname;
}

describe("discoverability regression snapshot", () => {
  it("is reproducible through the checked-in snapshot validator", () => {
    const output = execFileSync("node", ["scripts/seo/check-discoverability-regression-snapshot.mjs", "--json"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const summary = JSON.parse(output) as Record<string, number | string>;

    expect(summary).toMatchObject({
      version: "discoverability.regression.snapshot.v1",
      surfaces: 11,
      privateFlowSamples: 5,
      canonicalSamples: 4,
      hreflangSamples: 2,
      jsonLdSamples: 2,
      generatedLiveParitySamples: 3,
    });
  });

  it("anchors sitemap, llms, indexing, and SEO surface source tokens without changing runtime behavior", () => {
    const snapshot = readSnapshot();

    for (const [surface, tokens] of Object.entries(snapshot.sourceTokenSnapshot)) {
      const relPath = snapshot.sourceFiles[surface];
      expect(relPath, `missing sourceFiles.${surface}`).toBeTruthy();
      const source = readSource(relPath);

      for (const token of tokens) {
        expect(source, `${relPath} should include ${token}`).toContain(token);
      }
    }
  });

  it("keeps protected private flows noindex and outside sitemap eligibility", () => {
    const snapshot = readSnapshot();

    for (const entry of snapshot.privateFlowExposureSnapshot) {
      expect(entry.protections).toEqual({
        noindex: true,
        nofollow: true,
        xRobotsTag: true,
        excludedFromSitemap: true,
        excludedFromLlms: true,
      });
      expect(shouldNoindex(entry.path, entry.path.startsWith("/zh/") ? "zh" : "en")).toBe(true);
      expect(shouldIncludeInSitemap(entry.path)).toBe(false);
    }

    for (const pathValue of snapshot.sitemapSnapshot.mustExcludeSamples) {
      if (!/\/(?:tests\/[^/]+\/take|result\/|results\/|orders\/|share\/|career\/jobs\?)/i.test(pathValue)) {
        continue;
      }

      expect(shouldIncludeInSitemap(pathValue), `${pathValue} should stay out of sitemap`).toBe(false);
    }
  });

  it("keeps llms private-flow exclusions present in both llms surfaces", () => {
    const snapshot = readSnapshot();
    const llmsSource = readSource(snapshot.sourceFiles.llms);
    const llmsFullSource = readSource(snapshot.sourceFiles.llmsFull);

    for (const url of snapshot.llmsSnapshot.mustExcludeSamples) {
      const pathname = pathnameFromUrl(url);
      if (!/\/(?:tests\/[^/]+\/take|result\/|orders\/|share\/)/i.test(pathname)) {
        continue;
      }

      const familyToken =
        pathname.includes("/take")
          ? "tests\\/[^/]+\\/take"
          : pathname.includes("/result/")
            ? "result(?:\\/|$)"
            : pathname.includes("/orders/")
              ? "orders(?:\\/|$)"
              : "share(?:\\/|$)";

      expect(llmsSource).toContain(familyToken);
      expect(llmsFullSource).toContain(familyToken);
    }
  });

  it("captures canonical, hreflang, JSON-LD, and generated/live parity baseline samples", () => {
    const snapshot = readSnapshot();

    for (const sample of snapshot.canonicalSnapshot.samples) {
      expect(sample.canonicalUrl).toBe(`${snapshot.siteUrl}${sample.path}`);
    }

    for (const sample of snapshot.hreflangSnapshot.samples) {
      expect(sample.alternates.en).toMatch(/^https:\/\/fermatmind\.com\/en\//);
      expect(sample.alternates["zh-CN"]).toMatch(/^https:\/\/fermatmind\.com\/zh\//);
      expect(sample.alternates["x-default"]).toBe(snapshot.siteUrl);
    }

    for (const sample of snapshot.jsonLdSnapshot.samples) {
      expect(sample.expectedTypes.length).toBeGreaterThan(0);
      expect(sample.canonicalUrl).toBe(`${snapshot.siteUrl}${sample.path}`);
    }

    expect(snapshot.generatedLiveParityFixtures).toMatchObject({
      sitemapUrl: "https://fermatmind.com/sitemap.xml",
      llmsUrl: "https://fermatmind.com/llms.txt",
      llmsFullUrl: "https://fermatmind.com/llms-full.txt",
    });
    expect(snapshot.generatedLiveParityFixtures.samplePages.map((sample) => sample.path)).toEqual(
      expect.arrayContaining([
        "/en/tests/mbti-personality-test-16-personality-types",
        "/zh/personality/intj-a",
        "/zh/career/jobs/accountants-and-auditors",
      ])
    );
  });
});
