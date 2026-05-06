import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = "tests/contracts/fixtures/url-truth/expanded-live-parity-samples.v1.json";
const ABSOLUTE_FIXTURE_PATH = path.join(ROOT, FIXTURE_PATH);

type ExpandedParitySample = {
  id: string;
  routeFamily: string;
  pairKey: string;
  locale: "en" | "zh-CN";
  path: string;
  canonicalUrl: string;
  expectedInSitemap: boolean;
  alternates: Record<"en" | "zh-CN" | "x-default", string>;
  jsonLdReferences: string[];
};

type ExpandedParityFixture = {
  version: string;
  scope: string;
  siteUrl: string;
  samples: ExpandedParitySample[];
  privateFlowSamples: string[];
};

function readFixture(): ExpandedParityFixture {
  return JSON.parse(fs.readFileSync(ABSOLUTE_FIXTURE_PATH, "utf8")) as ExpandedParityFixture;
}

describe("expanded live canonical / hreflang / JSON-LD parity samples", () => {
  it("is reproducible through the shared parity validator", () => {
    const output = execFileSync(
      "node",
      ["scripts/seo/check-canonical-hreflang-jsonld-parity.mjs", "--fixture", FIXTURE_PATH, "--json"],
      {
        cwd: ROOT,
        encoding: "utf8",
      }
    );
    const summary = JSON.parse(output) as Record<string, number | string | boolean>;

    expect(summary).toMatchObject({
      version: "discoverability.canonical_hreflang_jsonld_parity.v1",
      scope: "PR-UG-06",
      samples: 8,
      hreflangPairs: 4,
      privateFlowSamples: 5,
      live: false,
    });
  });

  it("expands parity coverage across hub and support route families", () => {
    const fixture = readFixture();
    const families = new Set(fixture.samples.map((sample) => sample.routeFamily));
    const pairs = new Map<string, Partial<Record<"en" | "zh-CN", ExpandedParitySample>>>();

    expect(fixture.scope).toBe("PR-UG-06");
    expect(families).toEqual(new Set(["career_hub", "articles_hub", "topics_hub", "help_detail"]));

    for (const sample of fixture.samples) {
      expect(sample.canonicalUrl).toBe(`${fixture.siteUrl}${sample.path}`);
      expect(sample.expectedInSitemap).toBe(true);
      expect(sample.alternates["x-default"]).toBe(fixture.siteUrl);
      expect(sample.jsonLdReferences.length).toBeGreaterThan(0);
      expect(sample.path).not.toMatch(/\/(?:take|result|orders|share)\b/);

      for (const reference of sample.jsonLdReferences) {
        expect(reference === sample.canonicalUrl || reference.startsWith(`${sample.canonicalUrl}#`)).toBe(true);
      }

      const group = pairs.get(sample.pairKey) ?? {};
      group[sample.locale] = sample;
      pairs.set(sample.pairKey, group);
    }

    for (const [pairKey, group] of pairs) {
      expect(group.en, `${pairKey} missing en sample`).toBeDefined();
      expect(group["zh-CN"], `${pairKey} missing zh-CN sample`).toBeDefined();
      expect(group.en?.alternates.en).toBe(group.en?.canonicalUrl);
      expect(group.en?.alternates["zh-CN"]).toBe(group["zh-CN"]?.canonicalUrl);
      expect(group["zh-CN"]?.alternates.en).toBe(group.en?.canonicalUrl);
      expect(group["zh-CN"]?.alternates["zh-CN"]).toBe(group["zh-CN"]?.canonicalUrl);
    }
  });
});
