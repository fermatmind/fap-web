import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MAX_BUFFER = 64 * 1024 * 1024;
const ARTIFACT_JSON = "docs/seo/personality/internal-link-graph-2026-06-18.json";
const ARTIFACT_CSV = "docs/seo/personality/internal-link-graph-2026-06-18.csv";

const PILOT_URLS = [
  "/en/personality/intj-a-vs-intj-t",
  "/zh/personality/istj-a",
  "/en/personality/intp-a-vs-intp-t",
  "/zh/personality/infp-t",
  "/en/personality/intj-a",
  "/en/personality/intj-t",
  "/zh/personality/intj-a",
  "/zh/personality/intj-t",
];

const FORBIDDEN_EDGE_PATTERN =
  /\/(?:result|results|orders|orders\/lookup|share|pay|payment|history|private|account)(?:\/|$)|token=|session=|user=|result_id=|report_id=|order_no=/i;

type Mbti64InternalLinkGraph = {
  version: string;
  status: string;
  summary: {
    total_pages: number;
    variant_pages: number;
    comparison_pages: number;
    pilot_urls: number;
    pilot_urls_present_in_audit: number;
    pilot_urls_present_in_package: number;
    recommended_edges: number;
    blocked_edges: number;
    unsafe_recommended_edges: number;
    self_links: number;
  };
  pilotUrls: Array<{ path: string; present_in_audit: boolean; present_in_package: boolean }>;
  nodes: Array<{ path: string; page_type: string; is_pilot: boolean }>;
  recommendedEdges: Array<{
    source_path: string;
    target_path: string;
    locale: string;
    edge_type: string;
    safe_public_route: boolean;
    publish_blocker_if_any: string;
  }>;
  blockedEdges: Array<{
    source_path: string;
    target_path: string;
    edge_type: string;
    safe_public_route: boolean;
    publish_blocker_if_any: string;
  }>;
};

function readArtifact(): Mbti64InternalLinkGraph {
  return JSON.parse(fs.readFileSync(path.join(ROOT, ARTIFACT_JSON), "utf8")) as Mbti64InternalLinkGraph;
}

function runGenerator(...args: string[]): Mbti64InternalLinkGraph {
  const output = execFileSync("node", ["scripts/seo/generate-mbti64-internal-link-graph.mjs", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
  });
  return JSON.parse(output) as Mbti64InternalLinkGraph;
}

describe("MBTI64 internal-link graph artifact", () => {
  it("covers exactly the audited 64 variant and 32 comparison pages", () => {
    const report = readArtifact();

    expect(report.version).toBe("mbti64.internal_link_graph.v1");
    expect(report.status).toBe("pass");
    expect(report.summary.total_pages).toBe(96);
    expect(report.summary.variant_pages).toBe(64);
    expect(report.summary.comparison_pages).toBe(32);
    expect(report.nodes.filter((node) => node.page_type === "variant")).toHaveLength(64);
    expect(report.nodes.filter((node) => node.page_type === "comparison")).toHaveLength(32);
  });

  it("locks the V2.1 pilot queue and marks all 8 pilot URLs as covered", () => {
    const report = readArtifact();
    const pilotPaths = report.pilotUrls.map((item) => item.path);

    expect(pilotPaths).toEqual(PILOT_URLS);
    expect(report.summary.pilot_urls).toBe(8);
    expect(report.summary.pilot_urls_present_in_audit).toBe(8);
    expect(report.summary.pilot_urls_present_in_package).toBe(8);
    expect(report.pilotUrls.every((item) => item.present_in_audit && item.present_in_package)).toBe(true);
  });

  it("keeps recommended edges public, same-locale, reciprocal, and self-link free", () => {
    const report = readArtifact();
    const nodePaths = new Set(report.nodes.map((node) => node.path));
    const publicTargetPaths = new Set([
      ...nodePaths,
      "/en/tests/big-five-personality-test-ocean-model",
      "/en/tests/holland-career-interest-test-riasec",
      "/zh/tests/big-five-personality-test-ocean-model",
      "/zh/tests/holland-career-interest-test-riasec",
    ]);
    const edgeKey = (source: string, target: string, type: string) => `${source}|${target}|${type}`;
    const edges = new Set(report.recommendedEdges.map((edge) => edgeKey(edge.source_path, edge.target_path, edge.edge_type)));

    expect(report.summary.recommended_edges).toBe(208);
    expect(report.summary.unsafe_recommended_edges).toBe(0);
    expect(report.summary.self_links).toBe(0);

    for (const edge of report.recommendedEdges) {
      expect(edge.source_path).not.toBe(edge.target_path);
      expect(edge.safe_public_route).toBe(true);
      expect(edge.publish_blocker_if_any).toBe("");
      expect(publicTargetPaths.has(edge.target_path)).toBe(true);
      expect(FORBIDDEN_EDGE_PATTERN.test(edge.target_path)).toBe(false);
      expect(edge.source_path.split("/")[1]).toBe(edge.target_path.split("/")[1]);
    }

    expect(edges.has(edgeKey("/en/personality/intj-a", "/en/personality/intj-t", "variant_at_pair"))).toBe(true);
    expect(edges.has(edgeKey("/en/personality/intj-t", "/en/personality/intj-a", "variant_at_pair"))).toBe(true);
    expect(edges.has(edgeKey("/en/personality/intj-a", "/en/personality/intj-a-vs-intj-t", "variant_to_comparison"))).toBe(true);
    expect(edges.has(edgeKey("/en/personality/intj-a-vs-intj-t", "/en/personality/intj-a", "comparison_to_variant"))).toBe(true);
    expect(edges.has(edgeKey("/en/personality/intj-a-vs-intj-t", "/en/personality/intj-t", "comparison_to_variant"))).toBe(true);
  });

  it("records private route observations only as blocked edges", () => {
    const report = readArtifact();

    expect(report.summary.blocked_edges).toBeGreaterThan(0);
    expect(report.blockedEdges.every((edge) => edge.safe_public_route === false)).toBe(true);
    expect(report.blockedEdges.every((edge) => edge.publish_blocker_if_any)).toBe(true);
    expect(report.blockedEdges.some((edge) => edge.target_path === "/en/results/lookup")).toBe(true);
    expect(report.blockedEdges.some((edge) => edge.target_path === "/zh/results/lookup")).toBe(true);
  });

  it("writes stable JSON and CSV outputs with the expected edge header", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti64-link-graph-"));
    const jsonPath = path.join(dir, "graph.json");
    const csvPath = path.join(dir, "graph.csv");
    const markdownPath = path.join(dir, "graph.md");
    const report = runGenerator("--output", jsonPath, "--csv", csvPath, "--markdown", markdownPath);
    const csv = fs.readFileSync(csvPath, "utf8");
    const checkedInCsv = fs.readFileSync(path.join(ROOT, ARTIFACT_CSV), "utf8");

    expect(report.summary.total_pages).toBe(96);
    expect(JSON.parse(fs.readFileSync(jsonPath, "utf8")).version).toBe("mbti64.internal_link_graph.v1");
    expect(csv.split("\n")[0]).toBe(
      "edge_status,source_url,target_url,locale,edge_type,anchor_text_suggestion,priority,reason,safe_public_route,publish_blocker_if_any",
    );
    expect(checkedInCsv.split("\n")[0]).toBe(csv.split("\n")[0]);
    expect(fs.readFileSync(markdownPath, "utf8")).toContain("Artifact-only");
  });
});
