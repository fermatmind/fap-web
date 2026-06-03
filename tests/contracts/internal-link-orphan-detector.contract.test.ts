import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const DETECTOR_MAX_BUFFER = 64 * 1024 * 1024;

type InternalLinkGraphReport = {
  version: string;
  summary: {
    totalUrls: number;
    trueOrphans: number;
    weaklyConnected: number;
    lowLinkCareerPages: number;
  };
  source: {
    limitation: string;
  };
  items: Array<{
    path: string;
    routeFamily: string;
    inboundCount: number;
    graphClassification: string;
  }>;
  lowLinkCareerPages: Array<{ path: string; routeFamily: string; inboundCount: number }>;
};

function runDetector(...args: string[]): InternalLinkGraphReport {
  const output = execFileSync("node", ["scripts/seo/detect-internal-link-orphans.mjs", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: DETECTOR_MAX_BUFFER,
  });
  return JSON.parse(output) as InternalLinkGraphReport;
}

describe("internal-link orphan detector", () => {
  it("generates a static internal-link graph report from the URL inventory", () => {
    const report = runDetector();

    expect(report.version).toBe("url_truth.internal_link_graph.v1");
    expect(report.summary.totalUrls).toBeGreaterThan(250);
    expect(report.source.limitation).toContain("Static source scan only");
    expect(report.summary.trueOrphans + report.summary.weaklyConnected).toBeGreaterThan(0);
    expect(report.lowLinkCareerPages.some((item) => item.routeFamily === "career_job_detail")).toBe(true);
  });

  it("classifies private-free public inventory paths without adding links", () => {
    const report = runDetector();
    const privateLeak = report.items.find((item) =>
      /\/(?:take|result|orders|share)(?:\/|$)/i.test(item.path)
    );
    const home = report.items.find((item) => item.path === "/");

    expect(privateLeak).toBeUndefined();
    expect(home?.graphClassification).not.toBe("true_orphan");
  });

  it("can write JSON and CSV graph reports", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "internal-link-graph-"));
    const jsonPath = path.join(dir, "graph.json");
    const csvPath = path.join(dir, "graph.csv");

    runDetector("--output", jsonPath, "--csv", csvPath, "--pretty");

    const artifact = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as InternalLinkGraphReport;
    const csv = fs.readFileSync(csvPath, "utf8");

    expect(artifact.version).toBe("url_truth.internal_link_graph.v1");
    expect(csv.split("\n")[0]).toContain("inboundCount");
    expect(csv).toContain("career_job_detail");
  });
});
