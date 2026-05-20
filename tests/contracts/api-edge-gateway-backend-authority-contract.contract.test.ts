import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/api-edge-gateway-backend-authority-contract.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/api-edge-gateway-backend-authority-contract.md");

type Artifact = {
  version: string;
  source_documents: Array<{ id: string; status: string }>;
  current_topology: {
    nodes: Array<{ id: string; role: string; source_of_truth?: string; status: string[] }>;
    media_chain: { chain: string[]; tencent_cos_active_media_authority: boolean };
  };
  fap_node2_local_runtime: {
    local_route_count: number;
    fap_api_prod_reference_route_count: number;
    canonical_backend_authority: boolean;
    queue: { status: string; healthy: boolean };
    redis: { env_key_observed: boolean };
    scheduler: { observed: boolean };
    deploy_marker: { observed: boolean };
  };
  api_gateway_observation: {
    domain: string;
    observed_path_prefix: string;
    observed_proxy_pass: string;
    upstream_node: string;
    proxies_to_fap_api_prod: boolean;
    proxies_to_node2_local_laravel: boolean;
  };
  canonical_backend_authority_candidate: { id: string; route_count_reference: number; status: string[] };
  ownership_contract: {
    node2: { canonical_backend_authority: boolean; local_laravel_authority: boolean; local_queue_safe_for_async_jobs: boolean };
    node3: { owns_backend_cms_commerce_truth: boolean };
    cms: { can_be_seo_bi: boolean };
    seo_collector: {
      must_use_canonical_backend_authority: boolean;
      can_read_node2_local_laravel_as_authority: boolean;
      can_publish_content: boolean;
      can_generate_pseo: boolean;
    };
    metabase: { read_only: boolean; allowed_query_targets: string[]; can_query_node2_local_db: boolean };
  };
  seo_middle_platform_implications: { production_rollout_status: string[]; blocked_until: string[] };
  future_options: Array<{ id: string; recommended: boolean }>;
  forbidden_assumptions: string[];
  deployment_guardrails: { allowed_files: string[]; runtime_behavior_changed: boolean; cloud_behavior_changed: boolean };
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
}

function nodeById(artifact: Artifact, id: string) {
  const node = artifact.current_topology.nodes.find((item) => item.id === id);
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
    "docs/seo/api-edge-gateway-backend-authority-contract.md",
    "docs/seo/generated/api-edge-gateway-backend-authority-contract.v1.json",
    "tests/contracts/api-edge-gateway-backend-authority-contract.contract.test.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file) || isCurrentRiasecPack12AllowedFile(file);
}

describe("API edge gateway and backend authority contract", () => {
  it("has version and required source documents", () => {
    const artifact = readArtifact();
    const sources = artifact.source_documents.map((source) => source.id);

    expect(artifact.version).toBe("api_edge_gateway_backend_authority_contract.v1");
    expect(sources).toEqual(expect.arrayContaining(["ARCH-SEO-CMS-01", "ARCH-SEO-CMS-02", "BACKEND-RUNTIME-00", "BACKEND-RUNTIME-00A"]));
  });

  it("records current topology and media chain without changing runtime authority", () => {
    const artifact = readArtifact();

    expect(nodeById(artifact, "fap-node2")).toMatchObject({
      role: "api.fermatmind.com edge gateway / OpenResty / legacy Docker node",
      source_of_truth: "edge_gateway_only",
    });
    expect(nodeById(artifact, "fap-api-prod")).toMatchObject({
      source_of_truth: "canonical_backend_authority_candidate",
    });
    expect(artifact.current_topology.media_chain.chain).toEqual(["DNSPod", "Alibaba CDN", "Alibaba OSS"]);
    expect(artifact.current_topology.media_chain.tencent_cos_active_media_authority).toBe(false);
  });

  it("locks fap-node2 local Laravel as non-authority with divergent route count", () => {
    const artifact = readArtifact();

    expect(artifact.fap_node2_local_runtime.local_route_count).toBe(194);
    expect(artifact.fap_node2_local_runtime.fap_api_prod_reference_route_count).toBe(312);
    expect(artifact.fap_node2_local_runtime.canonical_backend_authority).toBe(false);
    expect(artifact.fap_node2_local_runtime.queue).toMatchObject({
      status: "FATAL",
      healthy: false,
    });
    expect(artifact.fap_node2_local_runtime.redis.env_key_observed).toBe(false);
    expect(artifact.fap_node2_local_runtime.scheduler.observed).toBe(false);
    expect(artifact.fap_node2_local_runtime.deploy_marker.observed).toBe(false);
  });

  it("records api.fermatmind.com /api/ proxying to fap-api-prod", () => {
    const artifact = readArtifact();

    expect(artifact.api_gateway_observation).toMatchObject({
      domain: "api.fermatmind.com",
      observed_path_prefix: "/api/",
      observed_proxy_pass: "http://122.152.221.126",
      upstream_node: "fap-api-prod / Node3",
      proxies_to_fap_api_prod: true,
      proxies_to_node2_local_laravel: false,
    });
    expect(artifact.canonical_backend_authority_candidate).toMatchObject({
      id: "fap-api-prod",
      route_count_reference: 312,
    });
    expect(artifact.canonical_backend_authority_candidate.status).toEqual(expect.arrayContaining(["recommended_authority_candidate"]));
  });

  it("forbids SEO Collector and Metabase from using Node2 local authority", () => {
    const artifact = readArtifact();

    expect(artifact.ownership_contract.node2).toMatchObject({
      canonical_backend_authority: false,
      local_laravel_authority: false,
      local_queue_safe_for_async_jobs: false,
    });
    expect(artifact.ownership_contract.node3.owns_backend_cms_commerce_truth).toBe(true);
    expect(artifact.ownership_contract.seo_collector).toMatchObject({
      must_use_canonical_backend_authority: true,
      can_read_node2_local_laravel_as_authority: false,
      can_publish_content: false,
      can_generate_pseo: false,
    });
    expect(artifact.ownership_contract.metabase).toMatchObject({
      read_only: true,
      allowed_query_targets: ["seo_intel"],
      can_query_node2_local_db: false,
    });
  });

  it("keeps SEO middle platform rollout blocked until boundary acceptance", () => {
    const artifact = readArtifact();

    expect(artifact.seo_middle_platform_implications.production_rollout_status).toEqual(
      expect.arrayContaining(["blocked", "human_confirm_required"])
    );
    expect(artifact.seo_middle_platform_implications.blocked_until).toEqual(
      expect.arrayContaining(["gateway/backend authority boundary accepted", "Collector input source locked"])
    );
    expect(artifact.future_options.find((option) => option.id === "Option A")?.recommended).toBe(true);
  });

  it("keeps CMS, recommender, and SEO publishing assumptions forbidden", () => {
    const artifact = readArtifact();

    expect(artifact.ownership_contract.cms.can_be_seo_bi).toBe(false);
    expect(artifact.forbidden_assumptions).toEqual(
      expect.arrayContaining([
        "Node2 local Laravel is production backend authority",
        "Node2 and Node3 are interchangeable",
        "SEO Collector may read Node2 local Laravel as authority",
        "Metabase may query Node2 local DB",
        "SEO 中台 production rollout may start before backend authority source is locked",
        "RIASEC/Big Five/Career Decision are complete recommender runtime",
      ])
    );
  });

  it("documents scope and ensures no runtime files are changed", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const changed = currentChangedFiles();

    expect(doc).toContain("This document is the architecture contract after `BACKEND-RUNTIME-00` and `BACKEND-RUNTIME-00A`.");
    expect(artifact.deployment_guardrails.runtime_behavior_changed).toBe(false);
    expect(artifact.deployment_guardrails.cloud_behavior_changed).toBe(false);
    expect(changed.every(isAllowedFile), changed.join("\n")).toBe(true);
  });
});
