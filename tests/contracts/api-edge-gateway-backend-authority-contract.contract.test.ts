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
  api_edge_gateway_local_runtime: {
    local_route_count: number;
    canonical_backend_reference_route_count: number;
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
    proxies_to_canonical_backend: boolean;
    proxies_to_api_edge_local_laravel: boolean;
  };
  canonical_backend_authority_candidate: { id: string; route_count_reference: number; status: string[] };
  ownership_contract: {
    api_edge_gateway: { canonical_backend_authority: boolean; local_laravel_authority: boolean; local_queue_safe_for_async_jobs: boolean };
    canonical_backend: { owns_backend_cms_commerce_truth: boolean };
    cms: { can_be_seo_bi: boolean };
    seo_collector: {
      must_use_canonical_backend_authority: boolean;
      can_read_api_edge_local_laravel_as_authority: boolean;
      can_publish_content: boolean;
      can_generate_pseo: boolean;
    };
    metabase: { read_only: boolean; allowed_query_targets: string[]; can_query_api_edge_local_db: boolean };
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

function combinedPublicArtifactText(): string {
  return [
    fs.readFileSync(DOC_PATH, "utf8"),
    fs.readFileSync(ARTIFACT_PATH, "utf8"),
  ].join("\n");
}

const FORMER_INFRASTRUCTURE_FRAGMENTS = [
  ["fap", "node"].join("-"),
  ["fap", "app"].join("-"),
  ["fap", "api", "prod"].join("-"),
  ["php", "84"].join(""),
  ["fap", "mysql"].join("-"),
  ["1Panel", "openresty", "r188"].join("-"),
  ["Orca", "Term"].join(""),
  ["T", "A", "T"].join(""),
];

describe("API edge gateway and backend authority contract", () => {
  it("has version and required source documents", () => {
    const artifact = readArtifact();
    const sources = artifact.source_documents.map((source) => source.id);

    expect(artifact.version).toBe("api_edge_gateway_backend_authority_contract.v1");
    expect(sources).toEqual(expect.arrayContaining(["ARCH-SEO-CMS-01", "ARCH-SEO-CMS-02", "BACKEND-RUNTIME-00", "BACKEND-RUNTIME-00A"]));
  });

  it("records current topology and media chain without changing runtime authority", () => {
    const artifact = readArtifact();

    expect(nodeById(artifact, "api-edge-gateway")).toMatchObject({
      role: "api.fermatmind.com edge gateway / OpenResty / legacy Docker node",
      source_of_truth: "edge_gateway_only",
    });
    expect(nodeById(artifact, "canonical-backend-authority")).toMatchObject({
      source_of_truth: "canonical_backend_authority_candidate",
    });
    expect(artifact.current_topology.media_chain.chain).toEqual(["DNSPod", "Alibaba CDN", "Alibaba OSS"]);
    expect(artifact.current_topology.media_chain.tencent_cos_active_media_authority).toBe(false);
  });

  it("locks API edge local Laravel as non-authority with divergent route count", () => {
    const artifact = readArtifact();

    expect(artifact.api_edge_gateway_local_runtime.local_route_count).toBe(194);
    expect(artifact.api_edge_gateway_local_runtime.canonical_backend_reference_route_count).toBe(312);
    expect(artifact.api_edge_gateway_local_runtime.canonical_backend_authority).toBe(false);
    expect(artifact.api_edge_gateway_local_runtime.queue).toMatchObject({
      status: "FATAL",
      healthy: false,
    });
    expect(artifact.api_edge_gateway_local_runtime.redis.env_key_observed).toBe(false);
    expect(artifact.api_edge_gateway_local_runtime.scheduler.observed).toBe(false);
    expect(artifact.api_edge_gateway_local_runtime.deploy_marker.observed).toBe(false);
  });

  it("records api.fermatmind.com /api/ proxying to canonical backend", () => {
    const artifact = readArtifact();

    expect(artifact.api_gateway_observation).toMatchObject({
      domain: "api.fermatmind.com",
      observed_path_prefix: "/api/",
      observed_proxy_pass: "upstream://canonical-backend-authority",
      upstream_node: "canonical-backend-authority / canonical backend",
      proxies_to_canonical_backend: true,
      proxies_to_api_edge_local_laravel: false,
    });
    expect(artifact.canonical_backend_authority_candidate).toMatchObject({
      id: "canonical-backend-authority",
      route_count_reference: 312,
    });
    expect(artifact.canonical_backend_authority_candidate.status).toEqual(expect.arrayContaining(["recommended_authority_candidate"]));
  });

  it("forbids SEO Collector and Metabase from using API edge local authority", () => {
    const artifact = readArtifact();

    expect(artifact.ownership_contract.api_edge_gateway).toMatchObject({
      canonical_backend_authority: false,
      local_laravel_authority: false,
      local_queue_safe_for_async_jobs: false,
    });
    expect(artifact.ownership_contract.canonical_backend.owns_backend_cms_commerce_truth).toBe(true);
    expect(artifact.ownership_contract.seo_collector).toMatchObject({
      must_use_canonical_backend_authority: true,
      can_read_api_edge_local_laravel_as_authority: false,
      can_publish_content: false,
      can_generate_pseo: false,
    });
    expect(artifact.ownership_contract.metabase).toMatchObject({
      read_only: true,
      allowed_query_targets: ["seo_intel"],
      can_query_api_edge_local_db: false,
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
        "API edge gateway local Laravel is production backend authority",
        "API edge gateway and canonical backend are interchangeable",
        "SEO Collector may read API edge gateway local Laravel as authority",
        "Metabase may query API edge gateway local DB",
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

  it("redacts production infrastructure identifiers from public docs and artifacts", () => {
    const text = combinedPublicArtifactText();

    expect(text).not.toMatch(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    expect(text).not.toMatch(/\/(?:opt\/apps|var\/www|www\/wwwroot)\//);
    expect(text).not.toMatch(/\/Users\/[^\s"]+\/Desktop\/GitHub\//);
    for (const fragment of FORMER_INFRASTRUCTURE_FRAGMENTS) {
      expect(text).not.toContain(fragment);
    }
    expect(text).toContain("REDACTED_UPSTREAM");
    expect(text).toContain("REDACTED_BACKEND_RELEASE_PATH");
    expect(text).toContain("REDACTED_LEGACY_BACKEND_PATH");
  });
});
