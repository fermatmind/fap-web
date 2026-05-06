import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/canonical-hreflang-jsonld-parity.v1.json"
);

type ParitySample = {
  id: string;
  pairKey: string;
  locale: "en" | "zh-CN";
  path: string;
  canonicalUrl: string;
  expectedInSitemap: boolean;
  alternates: Record<"en" | "zh-CN" | "x-default", string>;
  jsonLdReferences: string[];
};

type SourceContract = {
  source: string;
  requiredTokens: string[];
  forbiddenTokens: string[];
};

type ParityFixture = {
  version: string;
  scope: string;
  siteUrl: string;
  sourceContracts: SourceContract[];
  samples: ParitySample[];
  privateFlowSamples: string[];
};

function readFixture(): ParityFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as ParityFixture;
}

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("canonical / hreflang / JSON-LD parity gate", () => {
  it("is reproducible through the checked-in parity validator", () => {
    const output = execFileSync("node", ["scripts/seo/check-canonical-hreflang-jsonld-parity.mjs", "--json"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const summary = JSON.parse(output) as Record<string, number | string | boolean>;

    expect(summary).toMatchObject({
      version: "discoverability.canonical_hreflang_jsonld_parity.v1",
      samples: 6,
      hreflangPairs: 3,
      privateFlowSamples: 5,
      live: false,
    });
  });

  it("defines reciprocal hreflang pairs and canonical-aligned JSON-LD references", () => {
    const fixture = readFixture();
    const pairs = new Map<string, Partial<Record<"en" | "zh-CN", ParitySample>>>();

    expect(fixture.scope).toBe("PR-DF-05");
    expect(fixture.siteUrl).toBe("https://fermatmind.com");

    for (const sample of fixture.samples) {
      expect(sample.canonicalUrl).toBe(`${fixture.siteUrl}${sample.path}`);
      expect(sample.canonicalUrl).not.toContain("?");
      expect(sample.canonicalUrl).not.toContain("#");
      expect(sample.alternates["x-default"]).toBe(fixture.siteUrl);
      expect(sample.jsonLdReferences.length).toBeGreaterThan(0);

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

  it("anchors source tokens without changing runtime URL behavior", () => {
    const fixture = readFixture();

    for (const contract of fixture.sourceContracts) {
      const source = read(contract.source);

      for (const token of contract.requiredTokens) {
        expect(source, `${contract.source} must contain ${token}`).toContain(token);
      }

      for (const token of contract.forbiddenTokens) {
        expect(source, `${contract.source} must not contain ${token}`).not.toContain(token);
      }
    }

    const script = read("scripts/seo/check-canonical-hreflang-jsonld-parity.mjs");
    expect(script).toContain("--live");
    expect(script).toContain("assertLiveParity");
  });
});
