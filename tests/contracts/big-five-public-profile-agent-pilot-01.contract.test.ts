import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isBigFivePublicProfileAgentPilot01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_JSON = "docs/seo/personality/big-five-public-profile-agent-pilot-2026-06-24.json";
const ARTIFACT_MD = "docs/seo/personality/big-five-public-profile-agent-pilot-2026-06-24.md";
const SCHEMA_PATH = ".agents/skills/public-profile-seo-asset-factory/schemas/public-profile-agent-recommendation.schema.json";

type CoverageRow = {
  code: string;
  locale: string;
  entity_type: string;
  slug: string;
};

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI refs can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

describe("BIG-FIVE-PUBLIC-PROFILE-AGENT-PILOT-01 contract", () => {
  it("generates the Big Five V1 bilingual draft recommendation artifact", () => {
    const stdout = execFileSync("node", ["scripts/seo/generate-big-five-public-profile-agent-pilot.mjs"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      output_json: ARTIFACT_JSON,
      output_md: ARTIFACT_MD,
      recommendation_count: 34,
      logical_entity_count: 17,
    });
    expect(result.locale_counts).toEqual({ en: 17, "zh-CN": 17 });
    expect(result.entity_type_counts).toEqual({
      hub: 2,
      domain: 10,
      polarity: 20,
      facet_hub: 2,
      facet_detail: 0,
      OCEAN_32: 0,
    });
  });

  it("keeps recommendation rows compatible with the shared public profile agent schema", () => {
    const artifact = readJson(ARTIFACT_JSON);
    const schema = readJson(SCHEMA_PATH);
    const requiredKeys = schema.required as string[];
    const allowedKeys = new Set(Object.keys(schema.properties));

    expect(artifact.artifact).toBe("BIG-FIVE-PUBLIC-PROFILE-AGENT-PILOT-01");
    expect(artifact.status).toBe("pass_ready_for_qa_gates");
    expect(artifact.summary.recommendation_count).toBe(34);
    expect(artifact.recommendations).toHaveLength(34);
    expect(artifact.coverage.rows).toHaveLength(34);

    for (const row of artifact.recommendations) {
      expect(Object.keys(row).sort()).toEqual([...allowedKeys].sort());
      for (const key of requiredKeys) {
        expect(row).toHaveProperty(key);
      }
      expect(row.framework).toBe("big_five");
      expect(["en", "zh-CN"]).toContain(row.locale);
      expect(row.target_url).toMatch(/^https:\/\/fermatmind\.com\/(en|zh)\/personality\/big-five/);
      expect(row.status).toBe("qa_ready");
      expect(row.blocked_reason).toBeNull();
      expect(row.qa_required).toEqual([
        "schema_validation",
        "trademark_claim_gate",
        "claim_risk_gate",
        "duplicate_template_gate",
        "private_route_gate",
        "result_page_leakage_gate",
        "seo_projection_gate",
        "bilingual_consistency_gate",
      ]);
    }
  });

  it("covers exactly the Big Five V1 17 logical entities and excludes facet detail or OCEAN_32 expansion", () => {
    const artifact = readJson(ARTIFACT_JSON);
    const coverageRows = artifact.coverage.rows as CoverageRow[];
    const logicalEntities = new Set(coverageRows.map((row: { code: string }) => row.code));
    const localeCounts = coverageRows.reduce((counts: Record<string, number>, row: CoverageRow) => {
      counts[row.locale] = (counts[row.locale] || 0) + 1;
      return counts;
    }, {});
    const entityTypeCounts = coverageRows.reduce((counts: Record<string, number>, row: CoverageRow) => {
      counts[row.entity_type] = (counts[row.entity_type] || 0) + 1;
      return counts;
    }, {});

    expect(logicalEntities.size).toBe(17);
    expect(localeCounts).toEqual({ en: 17, "zh-CN": 17 });
    expect(entityTypeCounts).toMatchObject({ hub: 2, domain: 10, polarity: 20, facet_hub: 2 });
    expect(entityTypeCounts.facet_detail || 0).toBe(0);
    expect(entityTypeCounts.OCEAN_32 || 0).toBe(0);
    expect([...logicalEntities].some((code) => /OCEAN_32/i.test(code))).toBe(false);
    expect(coverageRows.some((row) => /facets\/.+/.test(row.slug))).toBe(false);
  });

  it("keeps the artifact out of private, result, payment, account, sitemap, llms, publish and search surfaces", () => {
    const artifactText = fs.readFileSync(path.join(ROOT, ARTIFACT_JSON), "utf8");
    const report = fs.readFileSync(path.join(ROOT, ARTIFACT_MD), "utf8");

    expect(artifactText).not.toMatch(/\/(private|results?|orders?|pay|payment|history|account)(\/|\b|\?)/i);
    expect(artifactText).not.toMatch(/\b(token|session|result_id|order_id|payment_id)=/i);
    expect(artifactText).not.toContain("/results/");
    expect(artifactText).not.toContain("/account/");
    const artifact = readJson(ARTIFACT_JSON);
    const coverageRows = artifact.coverage.rows as CoverageRow[];
    expect(coverageRows.some((row) => /OCEAN_32/i.test(row.code))).toBe(false);
    expect(coverageRows.some((row) => row.entity_type === "facet_detail")).toBe(false);
    expect(artifact.negative_guarantees).toMatchObject({
      cms_write: false,
      frontend_runtime_change: false,
      publish: false,
      indexability_change: false,
      sitemap_mutation: false,
      llms_mutation: false,
      search_queue: false,
      search_submission: false,
    });
    expect(report).toContain("Draft recommendations only");
    expect(report).toContain("No CMS write");
  });

  it("keeps current PR changed files inside the approved pilot scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(files.every((file) => isBigFivePublicProfileAgentPilot01AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
