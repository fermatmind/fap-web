import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/cms-seo-middle-platform-final-architecture.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/cms-seo-middle-platform-final-architecture.md");

type Artifact = {
  version: string;
  source_documents: Array<{ id: string; status: string }>;
  current_runtime_topology: { nodes: Array<{ id: string; role: string; status: string[]; runtime: Record<string, unknown> }> };
  dual_backend_runtime_conflict: Record<string, unknown>;
  cloud_media_chain: {
    chain: string[];
    domain: string;
    origin_bucket: string;
    tencent_cos: { active_media_authority: boolean; status: string[] };
  };
  target_architecture: {
    doctrine: string[];
    servers: Array<{ id: string; role: string; status: string[]; ready?: boolean; deployed?: boolean; seo_intel_db?: { ready: boolean; status: string[] } }>;
  };
  backend_convergence_options: Array<{ id: string; title: string; required_validation: string[]; seo_middle_platform_impact: string }>;
  recommended_backend_decision: { option: string; decision: string; status: string[] };
  pre_migration_gates: string[];
  seo_middle_platform_gates: string[];
  cms_middle_platform_boundary: { can_be_seo_bi: boolean; forbidden: string[] };
  seo_middle_platform_boundary: {
    can_publish_content: boolean;
    can_generate_pseo: boolean;
    writes: string[];
    collector: { can_run_on_fap_web_node1: boolean; can_run_inside_fap_api_web_request_process: boolean };
    metabase: { production_ready: boolean; read_only: boolean; allowed_query_targets: string[]; forbidden_query_targets: string[] };
  };
  pii_rules: Record<string, any>;
  forbidden_actions: string[];
  deployment_guardrails: { allowed_files: string[]; forbidden_runtime_paths: string[] };
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
}

function nodeById(artifact: Artifact, id: string) {
  const node = artifact.current_runtime_topology.nodes.find((item) => item.id === id);
  expect(node, id).toBeTruthy();
  return node!;
}

function targetById(artifact: Artifact, id: string) {
  const server = artifact.target_architecture.servers.find((item) => item.id === id);
  expect(server, id).toBeTruthy();
  return server!;
}

function stagedChangedFiles(): string[] {
  const files = new Set<string>();
  const output = execFileSync("git", ["diff", "--cached", "--name-only"], { cwd: ROOT, encoding: "utf8" });
  for (const line of output.split("\n")) {
    if (line.trim()) {
      files.add(line.trim());
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return [
    "docs/seo/cms-seo-middle-platform-final-architecture.md",
    "docs/seo/generated/cms-seo-middle-platform-final-architecture.v1.json",
    "tests/contracts/cms-seo-middle-platform-final-architecture.contract.test.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file) || isCurrentRiasecPack12AllowedFile(file);
}

describe("CMS and SEO middle platform final architecture", () => {
  it("has version and source documents", () => {
    const artifact = readArtifact();
    const sourceIds = artifact.source_documents.map((source) => source.id);

    expect(artifact.version).toBe("cms_seo_middle_platform_final_architecture.v1");
    expect(sourceIds).toEqual(
      expect.arrayContaining(["ARCH-SEO-CMS-00", "ARCH-SEO-CMS-01", "cloud_asset_scan", "runtime_ssh_readonly_scan"])
    );
  });

  it("records current backend runtime conflict inputs", () => {
    const artifact = readArtifact();

    expect(nodeById(artifact, "fap-node1").role).toContain("production fap-web frontend");
    const node2 = nodeById(artifact, "fap-node2");
    expect(node2.role).toBe("legacy public API runtime");
    expect(node2.status).toEqual(expect.arrayContaining(["observed", "conflict", "architecture_debt"]));
    expect(node2.runtime).toMatchObject({
      backend_path_inside_container: "/www/wwwroot/fap-api/backend",
      git_repository_present: false,
      redis_env: "missing",
      supervisor_fap_api_queue: "FATAL",
    });

    const prod = nodeById(artifact, "fap-api-prod");
    expect(prod.role).toBe("standard CMS/ops backend runtime");
    expect(prod.runtime).toMatchObject({
      path: "/var/www/fap-api/current/backend",
      queue_workers: 4,
      queue_status: "RUNNING",
    });

    expect(artifact.dual_backend_runtime_conflict).toBeTruthy();
    expect(artifact.dual_backend_runtime_conflict).toMatchObject({
      public_api_runtime: "fap-node2 legacy Docker API runtime",
      cms_ops_runtime: "fap-api-prod standard Laravel/CMS/queue runtime",
    });
  });

  it("defines target architecture without marking blocked assets ready", () => {
    const artifact = readArtifact();

    expect(artifact.target_architecture.doctrine).toEqual(
      expect.arrayContaining([
        "fap-web is public frontend runtime",
        "single backend/CMS/commerce authority runtime",
        "logically isolated seo_intel DB",
        "Server 4 SEO Intelligence Node",
      ])
    );

    const server2 = targetById(artifact, "Server 2");
    expect(server2.role).toBe("single backend/CMS/commerce authority runtime");
    expect(server2.ready).toBe(false);
    expect(server2.status).toEqual(expect.arrayContaining(["conflict", "human_confirm_required"]));

    const server3 = targetById(artifact, "Server 3");
    expect(server3.seo_intel_db?.ready).toBe(false);
    expect(server3.seo_intel_db?.status).toEqual(expect.arrayContaining(["missing", "blocked"]));

    const server4 = targetById(artifact, "Server 4");
    expect(server4.deployed).toBe(false);
    expect(server4.ready).toBe(false);
  });

  it("includes convergence options and a recommended backend decision", () => {
    const artifact = readArtifact();
    const options = artifact.backend_convergence_options.map((option) => option.id);

    expect(options).toEqual(expect.arrayContaining(["Option A", "Option B", "Option C"]));
    expect(artifact.recommended_backend_decision).toMatchObject({
      option: "Option A",
    });
    expect(artifact.recommended_backend_decision.status).toEqual(
      expect.arrayContaining(["recommended", "not_implemented", "blocked_until_gates_pass"])
    );
    expect(artifact.pre_migration_gates).toEqual(
      expect.arrayContaining([
        "route parity",
        "auth/session parity",
        "payment webhook parity",
        "report/email gate parity",
        "CORS/origin parity",
        "rate-limit parity",
        "healthcheck parity",
        "queue/scheduler parity",
        "rollback plan",
        "DNS/proxy plan",
        "staged smoke",
      ])
    );
  });

  it("keeps SEO middle platform gated until backend/data/node decisions exist", () => {
    const artifact = readArtifact();

    expect(artifact.seo_middle_platform_gates).toEqual(
      expect.arrayContaining([
        "backend runtime authority decision",
        "seo_intel DB target",
        "Server 4 target",
        "Metabase isolation policy",
        "Collector input source",
        "PII/consent boundary",
      ])
    );
    expect(artifact.seo_middle_platform_boundary.metabase).toMatchObject({
      production_ready: false,
      read_only: true,
      allowed_query_targets: ["seo_intel"],
      forbidden_query_targets: ["CMS/business tables"],
    });
  });

  it("locks CMS and SEO ownership boundaries", () => {
    const artifact = readArtifact();

    expect(artifact.cms_middle_platform_boundary.can_be_seo_bi).toBe(false);
    expect(artifact.cms_middle_platform_boundary.forbidden).toEqual(
      expect.arrayContaining(["SEO BI ownership", "scoring truth", "report runtime truth", "payment/order truth"])
    );
    expect(artifact.seo_middle_platform_boundary.can_publish_content).toBe(false);
    expect(artifact.seo_middle_platform_boundary.can_generate_pseo).toBe(false);
    expect(artifact.seo_middle_platform_boundary.writes).toEqual(["seo_intel"]);
    expect(artifact.seo_middle_platform_boundary.collector).toMatchObject({
      can_run_on_fap_web_node1: false,
      can_run_inside_fap_api_web_request_process: false,
    });
  });

  it("records media chain and rejects Tencent COS as active authority", () => {
    const artifact = readArtifact();

    expect(artifact.cloud_media_chain).toMatchObject({
      chain: ["DNSPod", "Alibaba CDN", "Alibaba OSS"],
      domain: "assets.fermatmind.com",
      origin_bucket: "ferm-mind-site",
    });
    expect(artifact.cloud_media_chain.tencent_cos.active_media_authority).toBe(false);
    expect(artifact.cloud_media_chain.tencent_cos.status).toEqual(expect.arrayContaining(["unknown", "dangerous_if_assumed"]));
  });

  it("locks PII and recommender claim guardrails", () => {
    const artifact = readArtifact();

    expect(artifact.pii_rules.email.seo_analytics_details).toBe("forbidden");
    expect(artifact.pii_rules.order_no.normal_dashboards).toBe("masked_or_aggregated");
    expect(artifact.pii_rules.external_analytics).toMatchObject({
      GA4: "no_pii",
      "Google Ads": "no_pii",
      Baidu: "no_pii",
    });
    expect(artifact.forbidden_actions).toEqual(
      expect.arrayContaining([
        "RIASEC/Big Five recommender claims",
        "Career Decision runtime expansion",
        "pSEO",
        "DNS/API migration",
        "Metabase production deployment",
      ])
    );
  });

  it("documents this as a no-runtime-change charter", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("not a migration plan");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).toContain("Recommendation: choose Option A");
    expect(doc).toContain("Do not start:");
    expect(artifact.deployment_guardrails).toMatchObject({
      no_runtime_code_changes: true,
      no_backend_runtime_code_changes: true,
      no_frontend_runtime_code_changes: true,
      no_dns_changes: true,
      no_cdn_changes: true,
      no_cos_oss_changes: true,
      no_ssh_required_for_this_pr: true,
    });
  });

  it("keeps tracked diff scope out of runtime files", () => {
    const artifact = readArtifact();

    expect(artifact.deployment_guardrails.allowed_files).toEqual(
      expect.arrayContaining([
        "docs/seo/cms-seo-middle-platform-final-architecture.md",
        "docs/seo/generated/cms-seo-middle-platform-final-architecture.v1.json",
        "tests/contracts/cms-seo-middle-platform-final-architecture.contract.test.ts",
        "docs/codex/pr-train.yaml",
        "docs/codex/pr-train-state.json",
      ])
    );
    expect(artifact.deployment_guardrails.forbidden_runtime_paths).toEqual(
      expect.arrayContaining(["app/", "components/", "lib/", "public/", "next-sitemap.config.js"])
    );

    for (const file of stagedChangedFiles()) {
      expect(isAllowedFile(file), file).toBe(true);
    }
  });
});
