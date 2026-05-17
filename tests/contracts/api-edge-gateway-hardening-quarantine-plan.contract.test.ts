import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/api-edge-gateway-hardening-quarantine-plan.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/api-edge-gateway-hardening-quarantine-plan.md");

type Artifact = {
  version: string;
  source_documents: Array<{ id: string; status: string }>;
  accepted_topology: {
    nodes: Array<{ id: string; role: string; source_of_truth?: string; status: string[] }>;
  };
  edge_gateway_responsibilities: { may_own: string[]; must_not_own: string[] };
  node2_local_runtime_quarantine: {
    local_laravel: { route_count: number; node3_reference_route_count: number; authority: boolean; quarantine_label: string };
    local_queue: { status: string; healthy: boolean; authority: boolean; quarantine_label: string };
    ignored_by: string[];
  };
  gateway_hardening_gates: string[];
  quarantine_gates: string[];
  seo_middle_platform_implications: {
    seo_dash_production_implementation_status: string[];
    blocked_until: string[];
  };
  recommended_next_task: { id: string; seo_dash_00_recommended_now: boolean };
  forbidden_actions: string[];
  deployment_guardrails: { runtime_behavior_changed: boolean; cloud_behavior_changed: boolean };
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
}

function nodeById(artifact: Artifact, id: string) {
  const node = artifact.accepted_topology.nodes.find((item) => item.id === id);
  expect(node, id).toBeTruthy();
  return node!;
}

function currentChangedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
  ]) {
    const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
    for (const line of output.split("\n")) {
      if (line.trim()) {
        files.add(line.trim());
      }
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return [
    "docs/seo/api-edge-gateway-hardening-quarantine-plan.md",
    "docs/seo/generated/api-edge-gateway-hardening-quarantine-plan.v1.json",
    "tests/contracts/api-edge-gateway-hardening-quarantine-plan.contract.test.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file);
}

describe("API edge gateway hardening and quarantine plan", () => {
  it("has version and required source documents", () => {
    const artifact = readArtifact();
    const sources = artifact.source_documents.map((source) => source.id);

    expect(artifact.version).toBe("api_edge_gateway_hardening_quarantine_plan.v1");
    expect(sources).toEqual(
      expect.arrayContaining(["ARCH-SEO-CMS-01", "ARCH-SEO-CMS-02", "BACKEND-RUNTIME-00", "BACKEND-RUNTIME-00A", "BACKEND-RUNTIME-01C"])
    );
  });

  it("marks Node2 as edge gateway only and Node3 as backend authority candidate", () => {
    const artifact = readArtifact();

    expect(nodeById(artifact, "fap-node2")).toMatchObject({
      role: "api.fermatmind.com API edge gateway / OpenResty proxy node",
      source_of_truth: "edge_gateway_only",
    });
    expect(nodeById(artifact, "fap-api-prod")).toMatchObject({
      role: "backend/CMS/commerce authority candidate",
      source_of_truth: "canonical_backend_authority_candidate",
    });
  });

  it("quarantines Node2 local Laravel, queue, DB, and runtime as non-authority", () => {
    const artifact = readArtifact();

    expect(nodeById(artifact, "node2-local-laravel")).toMatchObject({
      source_of_truth: "non_authority",
    });
    expect(artifact.node2_local_runtime_quarantine.local_laravel).toMatchObject({
      route_count: 194,
      node3_reference_route_count: 312,
      authority: false,
      quarantine_label: "non_authority",
    });
    expect(artifact.node2_local_runtime_quarantine.local_queue).toMatchObject({
      status: "FATAL",
      healthy: false,
      authority: false,
      quarantine_label: "non_authority_unhealthy",
    });
    expect(artifact.node2_local_runtime_quarantine.ignored_by).toEqual(
      expect.arrayContaining(["fap-web", "SEO Collector", "CMS", "Metabase", "production automation"])
    );
  });

  it("forbids SEO Collector and Metabase from using Node2 local sources", () => {
    const artifact = readArtifact();

    expect(artifact.quarantine_gates).toEqual(
      expect.arrayContaining(["no collector reads from Node2 local Laravel", "no Metabase reads Node2 local DB"])
    );
    expect(artifact.forbidden_actions).toEqual(
      expect.arrayContaining(["letting SEO Collector read Node2 local Laravel", "letting Metabase query Node2 local DB"])
    );
  });

  it("defines gateway hardening gates", () => {
    const artifact = readArtifact();

    expect(artifact.gateway_hardening_gates).toEqual(
      expect.arrayContaining([
        "OpenResty config backup",
        "/api proxy target verification",
        "healthcheck endpoint inventory and smoke",
        "route smoke through api.fermatmind.com",
        "CORS/header/rate-limit smoke",
        "auth/session smoke",
        "report-access/email-bind smoke",
        "checkout/order read-only smoke",
        "payment webhook ingress mapping verification without triggering live payment",
        "rollback plan",
      ])
    );
  });

  it("defines quarantine gates", () => {
    const artifact = readArtifact();

    expect(artifact.quarantine_gates).toEqual(
      expect.arrayContaining([
        "Node2 local Laravel non-authority label",
        "Node2 local DB non-authority label",
        "Node2 local queue non-authority label",
        "Node2 local fap-mysql non-authority label",
        "Node2 local php84 runtime non-authority label",
      ])
    );
  });

  it("keeps SEO-DASH production implementation blocked until authority boundary acceptance", () => {
    const artifact = readArtifact();

    expect(artifact.seo_middle_platform_implications.seo_dash_production_implementation_status).toEqual(
      expect.arrayContaining(["blocked", "human_confirm_required"])
    );
    expect(artifact.seo_middle_platform_implications.blocked_until).toEqual(
      expect.arrayContaining([
        "Node2 gateway contract operationally accepted",
        "Node3 backend authority source accepted",
        "Collector input source locked",
        "seo_intel target decided",
        "Metabase read-only policy accepted",
      ])
    );
  });

  it("recommends BACKEND-RUNTIME-02B before SEO-DASH-00", () => {
    const artifact = readArtifact();

    expect(artifact.recommended_next_task).toMatchObject({
      id: "BACKEND-RUNTIME-02B",
      seo_dash_00_recommended_now: false,
    });
  });

  it("documents scope and ensures no runtime files are changed", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const changed = currentChangedFiles();

    expect(doc).toContain("This document is the operational hardening and quarantine plan after `BACKEND-RUNTIME-01C`.");
    expect(artifact.deployment_guardrails.runtime_behavior_changed).toBe(false);
    expect(artifact.deployment_guardrails.cloud_behavior_changed).toBe(false);
    expect(changed.every(isAllowedFile), changed.join("\n")).toBe(true);
  });
});
