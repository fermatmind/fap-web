import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const INVENTORY_MAX_BUFFER = 64 * 1024 * 1024;

type CoreTopicGraphInventory = {
  version: string;
  source: {
    limitation: string;
  };
  summary: {
    totalEntities: number;
    entityTypeCounts: Record<string, number>;
    readinessCounts: Record<string, number>;
    missingPublicRoutes: number;
    trueOrphanEntities: number;
    careerFamilyP1AuthorityClusters: number;
  };
  graphReadinessMatrix: Array<{
    cluster: string;
    missingPublicRoutes: number;
    trueOrphanEntities: number;
  }>;
  entities: Array<{
    id: string;
    type: string;
    cluster: string;
    graphReadiness: string;
    discoverabilityState: string;
    orphanState: Record<string, number>;
  }>;
};

function runInventory(...args: string[]): CoreTopicGraphInventory {
  const output = execFileSync("node", ["scripts/seo/generate-core-topic-graph-inventory.mjs", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: INVENTORY_MAX_BUFFER,
  });
  return JSON.parse(output) as CoreTopicGraphInventory;
}

describe("Core Topic Graph inventory contract", () => {
  it("generates a read-only graph readiness inventory for the core clusters", () => {
    const report = runInventory();

    expect(report.version).toBe("core_topic_graph.inventory.v1");
    expect(report.source.limitation).toContain("Read-only graph inventory");
    expect(report.summary.totalEntities).toBeGreaterThan(150);
    expect(report.summary.entityTypeCounts.topic).toBe(3);
    expect(report.summary.entityTypeCounts.test).toBe(3);
    expect(report.summary.entityTypeCounts.personality_type).toBeGreaterThanOrEqual(32);
    expect(report.summary.entityTypeCounts.trait_dimension).toBe(5);
    expect(report.summary.entityTypeCounts.riasec_type).toBe(6);
  });

  it("keeps missing RIASEC topic and type surfaces visible instead of inventing frontend graph authority", () => {
    const report = runInventory();
    const riasecTopic = report.entities.find((entity) => entity.id === "topic:riasec");
    const riasecTypes = report.entities.filter((entity) => entity.type === "riasec_type");

    expect(riasecTopic?.discoverabilityState).toBe("missing_public_route");
    expect(riasecTopic?.graphReadiness).toBe("blocked");
    expect(riasecTypes).toHaveLength(6);
    expect(riasecTypes.every((entity) => entity.graphReadiness === "blocked")).toBe(true);
  });

  it("surfaces internal graph and duplicate authority risks without changing runtime behavior", () => {
    const report = runInventory();
    const mbtiMatrix = report.graphReadinessMatrix.find((item) => item.cluster === "mbti");

    expect(mbtiMatrix?.trueOrphanEntities).toBeGreaterThan(0);
    expect(report.summary.trueOrphanEntities).toBeGreaterThan(0);
    expect(report.summary.careerFamilyP1AuthorityClusters).toBeGreaterThanOrEqual(1);
    expect(report.summary.readinessCounts.dangerous).toBeGreaterThan(0);
  });

  it("can write reproducible JSON and CSV artifacts", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "core-topic-graph-inventory-"));
    const jsonPath = path.join(dir, "inventory.json");
    const csvPath = path.join(dir, "inventory.csv");

    runInventory("--output", jsonPath, "--csv", csvPath, "--pretty");

    const artifact = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as CoreTopicGraphInventory;
    const csv = fs.readFileSync(csvPath, "utf8");

    expect(artifact.version).toBe("core_topic_graph.inventory.v1");
    expect(csv.split("\n")[0]).toContain("graphReadiness");
    expect(csv).toContain("topic:mbti");
    expect(csv).toContain("riasec:realistic");
  });
});
