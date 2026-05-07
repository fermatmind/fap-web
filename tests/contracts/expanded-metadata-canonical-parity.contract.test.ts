import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = "tests/contracts/fixtures/seo-foundation/expanded-metadata-canonical-parity.v1.json";
const ABSOLUTE_FIXTURE_PATH = path.join(ROOT, FIXTURE_PATH);

type ExpandedSeoFoundationParitySample = {
  id: string;
  routeFamily: string;
  pairKey: string;
  locale: "en" | "zh-CN";
  path: string;
  canonicalUrl: string;
  expectedInSitemap: boolean;
  liveOptional?: boolean;
  alternates: Record<"en" | "zh-CN" | "x-default", string>;
  jsonLdReferences: string[];
};

type ExpandedSeoFoundationParityFixture = {
  version: string;
  scope: string;
  siteUrl: string;
  liveChecks: {
    requiredInCi: boolean;
    optInFlag: string;
    skipWhenLiveOptionalFalse: boolean;
  };
  samples: ExpandedSeoFoundationParitySample[];
  privateFlowSamples: string[];
};

function readFixture(): ExpandedSeoFoundationParityFixture {
  return JSON.parse(fs.readFileSync(ABSOLUTE_FIXTURE_PATH, "utf8")) as ExpandedSeoFoundationParityFixture;
}

describe("expanded SEO Foundation metadata / canonical / hreflang / JSON-LD parity matrix", () => {
  it("is reproducible through the shared parity validator without live network checks", () => {
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
      scope: "PR-SEOF-04",
      samples: 20,
      hreflangPairs: 10,
      privateFlowSamples: 8,
      live: false,
    });
  });

  it("covers the required SEO Foundation route families", () => {
    const fixture = readFixture();
    const families = new Set(fixture.samples.map((sample) => sample.routeFamily));

    expect(fixture.scope).toBe("PR-SEOF-04");
    expect(fixture.liveChecks).toEqual({
      requiredInCi: false,
      optInFlag: "--live",
      skipWhenLiveOptionalFalse: true,
    });
    expect(families).toEqual(
      new Set([
        "home",
        "tests_hub",
        "test_detail",
        "topic_detail",
        "article_detail",
        "career_job_detail",
        "career_family",
        "career_recommendation",
        "personality_detail",
        "help_detail",
      ])
    );
  });

  it("keeps hreflang pairs reciprocal and private flows excluded from public samples", () => {
    const fixture = readFixture();
    const pairs = new Map<string, Partial<Record<"en" | "zh-CN", ExpandedSeoFoundationParitySample>>>();
    const privateFlowPattern = /\/(?:tests\/[^/]+\/take|test\/[^/]+\/take|result\/|results\/|orders\/|share\/|pay\/|payment\/)/i;

    for (const sample of fixture.samples) {
      expect(sample.canonicalUrl).toBe(`${fixture.siteUrl}${sample.path}`);
      expect(sample.alternates["x-default"]).toBe(fixture.siteUrl);
      expect(sample.jsonLdReferences.length).toBeGreaterThan(0);
      expect(sample.path).not.toMatch(privateFlowPattern);

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

    for (const privateFlow of fixture.privateFlowSamples) {
      expect(privateFlow).toMatch(privateFlowPattern);
    }
  });
});
