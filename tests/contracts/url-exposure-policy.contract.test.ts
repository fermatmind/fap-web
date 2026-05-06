import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/url-exposure-policy.v1.json"
);

type LlmsExposureState = "allow" | "block" | "conditional" | "not_exposed";

type RouteFamily = {
  name: string;
  kind: string;
  samples: string[];
  explicitGate?: {
    indexEligible?: boolean | null;
    indexState?: string | null;
  };
  expected: {
    noindex: boolean;
    sitemap: boolean;
    llms: LlmsExposureState;
    privateFlow: boolean;
  };
};

type Fixture = {
  version: string;
  sourceFiles: Record<string, string>;
  exposureDimensions: string[];
  llmsExposureStates: LlmsExposureState[];
  requiredPrivateFlowProtections: string[];
  routeFamilies: RouteFamily[];
  sourceTokenContracts: Record<string, string[]>;
};

function readFixture(): Fixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as Fixture;
}

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function localeFromPath(pathname: string): "en" | "zh" {
  return pathname.startsWith("/zh/") ? "zh" : "en";
}

describe("URL exposure policy contract", () => {
  it("defines the route-family exposure inventory required before shared policy extraction", () => {
    const fixture = readFixture();
    const familyNames = fixture.routeFamilies.map((family) => family.name);

    expect(fixture.version).toBe("discoverability.url_exposure_policy.v1");
    expect(fixture.exposureDimensions).toEqual(
      expect.arrayContaining(["indexable", "noindex", "sitemap", "llms", "canonical", "privateFlow"])
    );
    expect(fixture.llmsExposureStates).toEqual(["allow", "block", "conditional", "not_exposed"]);
    expect(fixture.requiredPrivateFlowProtections).toEqual([
      "noindex",
      "nofollow",
      "xRobotsTag",
      "excludedFromSitemap",
      "excludedFromLlms",
    ]);
    expect(familyNames).toEqual(
      expect.arrayContaining([
        "localized_test_detail",
        "test_take_flow",
        "result_flow",
        "order_flow",
        "share_flow",
        "personality_type_detail",
        "topic_detail",
        "support_landing",
        "help_detail",
        "legal_policy_detail",
        "career_jobs_index",
        "career_jobs_query",
        "career_job_detail_backend_gated",
        "payment_flow",
      ])
    );
  });

  it("matches the current noindex and sitemap eligibility behavior for each fixture sample", () => {
    const fixture = readFixture();

    for (const family of fixture.routeFamilies) {
      for (const sample of family.samples) {
        expect(shouldNoindex(sample, localeFromPath(sample), undefined, family.explicitGate), sample).toBe(
          family.expected.noindex
        );
        expect(shouldIncludeInSitemap(sample, family.explicitGate), sample).toBe(family.expected.sitemap);
      }
    }
  });

  it("keeps protected private route families explicitly blocked from sitemap and llms exposure", () => {
    const fixture = readFixture();
    const privateFamilies = fixture.routeFamilies.filter((family) => family.expected.privateFlow);

    expect(privateFamilies.map((family) => family.name)).toEqual([
      "test_take_flow",
      "result_flow",
      "order_flow",
      "share_flow",
    ]);

    for (const family of privateFamilies) {
      expect(family.expected).toMatchObject({
        noindex: true,
        sitemap: false,
        llms: "block",
        privateFlow: true,
      });
    }
  });

  it("keeps llms allow states limited to explicit public route families", () => {
    const fixture = readFixture();
    const allowedFamilies = fixture.routeFamilies
      .filter((family) => family.expected.llms === "allow")
      .map((family) => family.name);

    expect(allowedFamilies).toEqual([
      "localized_test_detail",
      "personality_type_detail",
      "topic_detail",
      "support_landing",
    ]);
  });

  it("anchors current deny and gate tokens in sitemap, llms, and indexing policy sources", () => {
    const fixture = readFixture();

    for (const [surface, tokens] of Object.entries(fixture.sourceTokenContracts)) {
      const relPath = fixture.sourceFiles[surface];
      expect(relPath, `missing sourceFiles.${surface}`).toBeTruthy();
      const source = readSource(relPath);

      for (const token of tokens) {
        expect(source, `${relPath} should include ${token}`).toContain(token);
      }
    }
  });
});
