import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/cms-seo-completeness-matrix.v1.json"
);

type PageFamily = {
  name: string;
  owner: string;
  frontendConsumer: string;
  requiredFields: string[];
  optionalFields: string[];
  forbiddenFields: string[];
  evidenceContainerReadiness: string;
};

type SourceTokenContract = {
  source: string;
  requiredTokens: string[];
};

type MatrixFixture = {
  version: string;
  scope: string;
  authorityPrinciples: string[];
  requiredAuthorityFields: string[];
  allowedStates: Record<string, string[]>;
  forbiddenStateCombinations: Array<{ id: string; rule: string }>;
  pageFamilies: PageFamily[];
  sourceTokenContracts: SourceTokenContract[];
};

function readFixture(): MatrixFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as MatrixFixture;
}

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("CMS SEO completeness matrix", () => {
  it("is reproducible through the checked-in validator", () => {
    const output = execFileSync("node", ["scripts/seo/check-cms-seo-completeness-matrix.mjs", "--json"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const summary = JSON.parse(output) as Record<string, number | string>;

    expect(summary).toMatchObject({
      version: "discoverability.cms_seo_completeness_matrix.v1",
      pageFamilies: 9,
      requiredAuthorityFields: 12,
      forbiddenStateCombinations: 5,
      sourceTokenContracts: 9,
    });
  });

  it("defines backend-owned SEO authority fields and forbidden state combinations", () => {
    const fixture = readFixture();
    const doc = read("docs/seo/cms-seo-completeness-matrix.md");

    expect(fixture.scope).toBe("PR-DF-06");
    expect(fixture.authorityPrinciples).toEqual(
      expect.arrayContaining([
        "backend_owns_seo_truth",
        "frontend_deterministic_render_only",
        "no_frontend_fallback_seo_authority",
        "private_flows_never_discoverable",
      ])
    );
    expect(fixture.requiredAuthorityFields).toEqual(
      expect.arrayContaining([
        "metadata_contract_version",
        "canonical_url",
        "robots_policy",
        "indexability_state",
        "sitemap_state",
        "llms_exposure_state",
        "structured_data_keys",
        "answer_surface_v1",
      ])
    );
    expect(fixture.allowedStates.metadata_contract_version).toEqual(["seo.surface.v1"]);
    expect(fixture.forbiddenStateCombinations.map((rule) => rule.id)).toEqual([
      "llms_allow_requires_indexable",
      "sitemap_included_requires_indexable_robots",
      "indexable_detail_requires_canonical",
      "structured_data_requires_visible_or_backend_authority",
      "private_flows_forbidden",
    ]);
    expect(doc).toContain("Backend-owned `seo.surface.v1`");
    expect(doc).toContain("Frontend code may normalize and render");
  });

  it("covers the current CMS-backed page families without assigning frontend SEO ownership", () => {
    const fixture = readFixture();
    const families = new Map(fixture.pageFamilies.map((family) => [family.name, family]));

    expect([...families.keys()]).toEqual([
      "test_detail",
      "topic_detail",
      "personality_detail",
      "career_job_detail",
      "career_guide_detail",
      "article_detail",
      "landing_surface",
      "content_page",
      "dataset_method",
    ]);

    for (const family of fixture.pageFamilies) {
      expect(family.owner).not.toContain("frontend");
      expect(family.forbiddenFields.length).toBeGreaterThan(0);
      expect(fixture.allowedStates.evidence_container_readiness).toContain(family.evidenceContainerReadiness);
    }

    expect(families.get("career_job_detail")?.requiredFields).toEqual(
      expect.arrayContaining(["seo_surface_v1", "structured_data_keys", "sitemap_state", "llms_exposure_state"])
    );
    expect(families.get("topic_detail")?.requiredFields).toContain("answer_surface_v1");
    expect(families.get("dataset_method")?.requiredFields).toContain("structured_data_keys");
  });

  it("anchors existing frontend consumers to backend/CMS SEO authority fields", () => {
    const fixture = readFixture();

    for (const contract of fixture.sourceTokenContracts) {
      const source = read(contract.source);

      for (const token of contract.requiredTokens) {
        expect(source, `${contract.source} must contain ${token}`).toContain(token);
      }
    }
  });
});
