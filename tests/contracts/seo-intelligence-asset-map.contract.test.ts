import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/seo-intelligence-asset-map.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/seo-intelligence-node-readiness.md");

type AssetMap = {
  version: string;
  generated_from: Array<{ id: string; status: string }>;
  source_of_truth: Record<string, unknown>;
  current_runtime_topology: {
    nodes: Array<{ id: string; aliases?: string[]; target_server?: string; role: string; status: string[]; runtime?: Record<string, unknown> }>;
  };
  target_server_topology: {
    servers: Array<{ id: string; status: string[]; ready?: boolean; seo_intel_db?: { status: string[]; ready: boolean } }>;
  };
  mixed_cloud_media_chain: { chain: string[]; domain: string; origin_bucket: string };
  dual_backend_runtime_conflict: Record<string, unknown>;
  conflict_assets: Array<Record<string, unknown>>;
  cos_oss_media_assets: {
    active_media_authority: Record<string, unknown>;
    tencent_cos: { active_media_authority: boolean; status: string[] };
  };
  seo_middle_platform_modules: Array<{ name: string; status: string | string[]; production_ready?: boolean }>;
  ownership_contract: {
    cms: { can_be_seo_bi: boolean };
    seo_middle_platform: { can_publish_content: boolean };
    seo_collector: { can_publish_content: boolean; can_write: string[] };
    metabase: { read_only: boolean; allowed_query_targets: string[]; forbidden_query_targets: string[] };
  };
  forbidden_assumptions: string[];
  pii_rules: {
    email: { seo_analytics_detail: string };
    order_no: { normal_ops_dashboards: string };
  };
  deployment_guardrails: { allowed_files: string[]; forbidden_runtime_paths: string[] };
};

function readArtifact(): AssetMap {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as AssetMap;
}

function moduleStatus(artifact: AssetMap, name: string): string[] {
  const seoModule = artifact.seo_middle_platform_modules.find((item) => item.name === name);
  expect(seoModule, name).toBeTruthy();
  return Array.isArray(seoModule?.status) ? seoModule.status : [String(seoModule?.status)];
}

function nodeById(artifact: AssetMap, id: string) {
  const node = artifact.current_runtime_topology.nodes.find((item) => item.id === id);
  expect(node, id).toBeTruthy();
  return node!;
}

function targetById(artifact: AssetMap, id: string) {
  const target = artifact.target_server_topology.servers.find((item) => item.id === id);
  expect(target, id).toBeTruthy();
  return target!;
}

function currentChangedFiles(): string[] {
  const commands = [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
  ];
  const files = new Set<string>();

  for (const args of commands) {
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
    "docs/seo/seo-intelligence-node-readiness.md",
    "docs/seo/generated/seo-intelligence-asset-map.v1.json",
    "tests/contracts/seo-intelligence-asset-map.contract.test.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file) || isCurrentRiasecPack12AllowedFile(file);
}

describe("SEO Intelligence asset map", () => {
  it("has the expected version and scan sources", () => {
    const artifact = readArtifact();
    const sources = artifact.generated_from.map((source) => source.id);

    expect(artifact.version).toBe("seo_intelligence_asset_map.v1");
    expect(sources).toEqual(expect.arrayContaining(["ARCH-SEO-CMS-00", "cloud_asset_scan", "runtime_ssh_readonly_scan"]));
  });

  it("locks repository source-of-truth boundaries", () => {
    const artifact = readArtifact();

    expect(artifact.source_of_truth.frontend).toMatchObject({
      repository: "/Users/rainie/Desktop/GitHub/fap-web",
      role: "production_frontend_source_of_truth",
      status: "observed",
    });
    expect(artifact.source_of_truth.backend).toMatchObject({
      repository: "/Users/rainie/Desktop/GitHub/fap-api",
      role: "backend_cms_commerce_authority_core",
    });
    expect(artifact.source_of_truth.nested_frontend).toMatchObject({
      repository: "/Users/rainie/Desktop/GitHub/fap-api/fap-web",
      role: "stale_skeleton_non_runtime",
      runtime: false,
      status: "dangerous_if_assumed",
    });
  });

  it("records current runtime topology and the dual backend conflict", () => {
    const artifact = readArtifact();
    const nodeIds = artifact.current_runtime_topology.nodes.map((node) => node.id);

    expect(nodeIds).toEqual(expect.arrayContaining(["fap-node1", "fap-node2", "fap-api-prod", "staging"]));

    const node1 = nodeById(artifact, "fap-node1");
    expect(node1.target_server).toBe("Server 1");
    expect(node1.role).toContain("fap-web production frontend");
    expect(node1.status).toEqual(expect.arrayContaining(["observed", "ready"]));
    expect(node1.runtime).toMatchObject({
      path: "/opt/apps/fap-web",
      process_manager: "PM2",
      cluster_instances: 4,
      node_version: "24.14.0",
    });

    const node2 = nodeById(artifact, "fap-node2");
    expect(node2.role).toContain("public API legacy Docker runtime");
    expect(node2.status).toEqual(expect.arrayContaining(["observed", "conflict", "architecture_debt"]));
    expect(node2.runtime).toMatchObject({
      backend_path_inside_container: "/www/wwwroot/fap-api/backend",
      git_repository_present: false,
      redis_env: "missing",
      supervisor_fap_api_queue: "FATAL",
    });

    const prod = nodeById(artifact, "fap-api-prod");
    expect(prod.role).toContain("CMS / authority backend / ops backend");
    expect(prod.status).toEqual(expect.arrayContaining(["observed", "partial"]));
    expect(prod.runtime).toMatchObject({
      path: "/var/www/fap-api/current/backend",
      web_stack: "nginx + PHP 8.4 FPM",
      queue_workers: 4,
      queue_status: "RUNNING",
    });

    const staging = nodeById(artifact, "staging");
    expect(staging.role).toContain("mixed frontend/backend staging");
    expect(staging.status).toContain("observed");

    expect(artifact.dual_backend_runtime_conflict.status).toEqual(
      expect.arrayContaining(["conflict", "architecture_debt", "human_confirm_required"])
    );
    expect(artifact.conflict_assets.length).toBeGreaterThan(0);
  });

  it("does not pretend the target 4-server topology is ready", () => {
    const artifact = readArtifact();

    expect(artifact.target_server_topology.servers).toHaveLength(4);
    expect(targetById(artifact, "Server 1").status).toEqual(expect.arrayContaining(["observed", "ready"]));

    const server2 = targetById(artifact, "Server 2");
    expect(server2.ready).toBe(false);
    expect(server2.status).toEqual(expect.arrayContaining(["conflict", "human_confirm_required", "blocked"]));

    const server3 = targetById(artifact, "Server 3");
    expect(server3.seo_intel_db?.ready).toBe(false);
    expect(server3.seo_intel_db?.status).toEqual(expect.arrayContaining(["missing", "blocked"]));

    const server4 = targetById(artifact, "Server 4");
    expect(server4.ready).toBe(false);
    expect(server4.status).toEqual(expect.arrayContaining(["missing", "human_confirm_required"]));
  });

  it("locks mixed cloud media chain and rejects Tencent COS as active media authority", () => {
    const artifact = readArtifact();

    expect(artifact.mixed_cloud_media_chain).toMatchObject({
      chain: ["DNSPod", "Alibaba CDN", "Alibaba OSS"],
      domain: "assets.fermatmind.com",
      origin_bucket: "ferm-mind-site",
    });
    expect(artifact.cos_oss_media_assets.active_media_authority).toMatchObject({
      provider: "Alibaba OSS",
      bucket: "ferm-mind-site",
      status: "observed",
    });
    expect(artifact.cos_oss_media_assets.tencent_cos).toMatchObject({
      active_media_authority: false,
    });
    expect(artifact.cos_oss_media_assets.tencent_cos.status).toEqual(expect.arrayContaining(["unknown", "dangerous_if_assumed"]));
  });

  it("keeps SEO Intelligence modules blocked or missing unless observed", () => {
    const artifact = readArtifact();
    const metabase = artifact.seo_middle_platform_modules.find((item) => item.name === "Metabase");

    expect(moduleStatus(artifact, "GSC")).toEqual(expect.arrayContaining(["blocked", "human_confirm_required"]));
    expect(moduleStatus(artifact, "Competitor Radar")).toEqual(["missing"]);
    expect(metabase).toMatchObject({
      production_ready: false,
    });
    expect(moduleStatus(artifact, "Metabase")).toEqual(expect.arrayContaining(["missing", "human_confirm_required"]));
  });

  it("enforces CMS, SEO Collector, and Metabase ownership boundaries", () => {
    const artifact = readArtifact();

    expect(artifact.ownership_contract.cms.can_be_seo_bi).toBe(false);
    expect(artifact.ownership_contract.seo_middle_platform.can_publish_content).toBe(false);
    expect(artifact.ownership_contract.seo_collector.can_publish_content).toBe(false);
    expect(artifact.ownership_contract.seo_collector.can_write).toEqual(["seo_intel"]);
    expect(artifact.ownership_contract.metabase).toMatchObject({
      read_only: true,
      allowed_query_targets: ["seo_intel"],
      forbidden_query_targets: ["CMS/business tables"],
    });
  });

  it("locks PII, order, recommender, and forbidden assumption guardrails", () => {
    const artifact = readArtifact();

    expect(artifact.pii_rules.email.seo_analytics_detail).toBe("forbidden");
    expect(artifact.pii_rules.order_no.normal_ops_dashboards).toBe("masked_or_aggregated");
    expect(artifact.forbidden_assumptions).toEqual(
      expect.arrayContaining([
        "Treating RIASEC or Big Five as complete career recommender runtime",
        "Letting SEO 中台 publish or generate pSEO",
        "Letting Metabase query CMS/business tables directly",
        "Storing email in SEO analytics detail",
        "Exposing order_no to normal ops dashboards",
        "Assuming fap-node2 and fap-api-prod are interchangeable backends",
        "Assuming Tencent COS is active media authority",
      ])
    );
  });

  it("documents the no-runtime-change contract", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).toContain("SEO 中台 must not become a CMS plugin");
    expect(doc).toContain("dual authority drift");
    expect(doc).toContain("Tencent COS is not confirmed usable");
    expect(artifact.deployment_guardrails).toMatchObject({
      no_runtime_code_changes: true,
      no_backend_runtime_code_changes: true,
      no_frontend_runtime_code_changes: true,
      no_sitemap_llms_behavior_changes: true,
      no_tracking_behavior_changes: true,
      no_cloud_changes: true,
      no_ssh_required_for_this_pr: true,
    });
  });

  it("keeps tracked diff scope out of runtime files", () => {
    const artifact = readArtifact();

    expect(artifact.deployment_guardrails.allowed_files).toEqual(
      expect.arrayContaining([
        "docs/seo/seo-intelligence-node-readiness.md",
        "docs/seo/generated/seo-intelligence-asset-map.v1.json",
        "tests/contracts/seo-intelligence-asset-map.contract.test.ts",
        "docs/codex/pr-train.yaml",
        "docs/codex/pr-train-state.json",
      ])
    );
    expect(artifact.deployment_guardrails.forbidden_runtime_paths).toEqual(
      expect.arrayContaining(["app/", "components/", "lib/", "public/", "next-sitemap.config.js"])
    );

    for (const file of currentChangedFiles()) {
      expect(isAllowedFile(file), file).toBe(true);
    }
  });
});
