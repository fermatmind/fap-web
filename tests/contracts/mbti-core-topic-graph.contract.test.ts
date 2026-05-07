import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(ROOT, "tests/contracts/fixtures/graph/mbti-core-topic-graph.v1.json");

type MbtiGraphFixture = {
  version: string;
  source_authority: string;
  frontend_role: string;
  runtime_effect: string;
  edge_templates: Array<{
    edge_type: string;
    source_authority: string;
    rendered_visibility: string;
    evidence_requirement: string;
  }>;
  coverage_requirements: {
    forbidden_runtime_effects: string[];
  };
};

type MbtiGraphReadinessReport = {
  version: string;
  authority: {
    sourceAuthority: string;
    runtimeEffect: string;
  };
  summary: {
    personalityVariantCount: number;
    localizedPersonalityPathCount: number;
    baselineTrueOrphanMbtiEntities: number;
    governedOrphanMbtiEntities: number;
    authorityViolations: number;
    edgeTypeViolations: number;
    hiddenPublicEdges: number;
  };
  coverage: Record<string, number>;
  blockedRuntimeEffects: string[];
};

function readFixture(): MbtiGraphFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as MbtiGraphFixture;
}

function runReadiness(...args: string[]): MbtiGraphReadinessReport {
  const output = execFileSync("node", ["scripts/seo/check-mbti-core-topic-graph.mjs", ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
  return JSON.parse(output) as MbtiGraphReadinessReport;
}

describe("MBTI Core Topic Graph readiness", () => {
  it("keeps the MBTI graph fixture backend/CMS authoritative with no runtime effect", () => {
    const fixture = readFixture();

    expect(fixture.version).toBe("mbti_core_topic_graph.v1");
    expect(fixture.source_authority).toBe("backend_cms");
    expect(fixture.frontend_role).toBe("deterministic_render_only");
    expect(fixture.runtime_effect).toBe("none");
    expect(fixture.coverage_requirements.forbidden_runtime_effects).toContain("frontend_graph_authority");
    expect(fixture.coverage_requirements.forbidden_runtime_effects).toContain("sitemap_widening");
    expect(fixture.edge_templates.every((edge) => !edge.source_authority.startsWith("frontend"))).toBe(true);
    expect(fixture.edge_templates.every((edge) => edge.rendered_visibility === "visible_content")).toBe(true);
    expect(fixture.edge_templates.every((edge) => edge.evidence_requirement.startsWith("visible_"))).toBe(true);
  });

  it("covers existing MBTI topic, test, type, career, FAQ, and CTA graph edges", () => {
    const report = runReadiness();

    expect(report.version).toBe("mbti_core_topic_graph.readiness.v1");
    expect(report.authority.sourceAuthority).toBe("backend_cms");
    expect(report.authority.runtimeEffect).toBe("none");
    expect(report.summary.personalityVariantCount).toBe(32);
    expect(report.summary.localizedPersonalityPathCount).toBe(64);
    expect(report.coverage.topicToTest).toBe(1);
    expect(report.coverage.topicToType).toBe(64);
    expect(report.coverage.typeToCareer).toBe(64);
    expect(report.coverage.personalityToFaq).toBe(32);
    expect(report.coverage.personalityToCta).toBe(64);
  });

  it("reduces governed MBTI graph orphan count without changing static URL exposure", () => {
    const report = runReadiness();

    expect(report.summary.baselineTrueOrphanMbtiEntities).toBeGreaterThan(0);
    expect(report.summary.governedOrphanMbtiEntities).toBe(0);
    expect(report.summary.authorityViolations).toBe(0);
    expect(report.summary.edgeTypeViolations).toBe(0);
    expect(report.summary.hiddenPublicEdges).toBe(0);
    expect(report.blockedRuntimeEffects).toContain("new_public_routes");
    expect(report.blockedRuntimeEffects).toContain("llms_widening");
  });

  it("can write reproducible MBTI graph readiness artifacts", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-core-topic-graph-"));
    const jsonPath = path.join(dir, "mbti-graph.json");
    const csvPath = path.join(dir, "mbti-graph.csv");

    runReadiness("--output", jsonPath, "--csv", csvPath, "--pretty");

    const artifact = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as MbtiGraphReadinessReport;
    const csv = fs.readFileSync(csvPath, "utf8");

    expect(artifact.version).toBe("mbti_core_topic_graph.readiness.v1");
    expect(csv.split("\n")[0]).toContain("edgeType");
    expect(csv).toContain("topic_to_test");
    expect(csv).toContain("type_to_career");
  });
});
