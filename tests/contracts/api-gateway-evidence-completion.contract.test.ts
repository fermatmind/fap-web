import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/api-gateway-evidence-completion.v1.json");

type Artifact = {
  version: string;
  source_documents: string[];
  accepted_topology: {
    node2: { role: string; source_of_truth: string };
    node3: { role: string; source_of_truth: string };
    node2_local_laravel: { source_of_truth: string; status: string };
  };
  gateway_config_verification: {
    gateway_config_verified: boolean;
    evidence_source: string;
    server_name_api_fermatmind_present: boolean;
    api_location_present: boolean;
    proxy_pass_to_node3_present: boolean;
    config_checksum_present: boolean;
    config_mtime_present: boolean;
    printed_full_config: boolean;
    printed_ssl_private_keys: boolean;
    printed_env_values: boolean;
  };
  api_proxy_target_classification: string;
  endpoint_smoke_results: Array<{
    name: string;
    method: string;
    status: number;
    headers: { cookie_header_observed: boolean };
  }>;
  side_effect_policy: {
    forbidden_operations: string[];
    created_orders: boolean;
    created_attempts: boolean;
    sent_emails: boolean;
    triggered_payment_webhook: boolean;
    modified_openresty: boolean;
    restarted_services: boolean;
    changed_dns: boolean;
    changed_database: boolean;
  };
  node2_local_runtime_quarantine: {
    node2_local_laravel_authority: boolean;
    api_proxy_uses_node2_local_laravel: boolean;
    seo_collector_may_read_node2_local_laravel: boolean;
    metabase_may_query_node2_local_db: boolean;
  };
  acceptance_status: "accepted" | "partial" | "blocked";
  seo_dash_00_unblocked: boolean;
  next_task: string;
  pii_secret_redaction: {
    raw_response_bodies_stored: boolean;
    cookie_values_stored: boolean;
    email_values_stored: boolean;
    order_numbers_stored: boolean;
    payment_ids_stored: boolean;
    ssl_private_keys_printed: boolean;
  };
  forbidden_actions_observed_false: Record<string, boolean>;
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
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
    "docs/seo/api-gateway-evidence-completion.md",
    "docs/seo/generated/api-gateway-evidence-completion.v1.json",
    "tests/contracts/api-gateway-evidence-completion.contract.test.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file);
}

describe("API gateway evidence completion", () => {
  it("has version and required source documents", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("api_gateway_evidence_completion.v1");
    expect(artifact.source_documents).toEqual(
      expect.arrayContaining(["BACKEND-RUNTIME-01C", "BACKEND-RUNTIME-02A", "BACKEND-RUNTIME-02B", "BACKEND-RUNTIME-02C"])
    );
  });

  it("keeps Node2 as edge gateway and Node3 as backend authority candidate", () => {
    const artifact = readArtifact();

    expect(artifact.accepted_topology.node2).toMatchObject({
      role: "API edge gateway only",
      source_of_truth: "edge_gateway_only",
    });
    expect(artifact.accepted_topology.node3).toMatchObject({
      role: "backend/CMS/commerce authority candidate",
      source_of_truth: "canonical_backend_authority_candidate",
    });
  });

  it("keeps Node2 local Laravel non-authority and quarantined", () => {
    const artifact = readArtifact();

    expect(artifact.accepted_topology.node2_local_laravel).toMatchObject({
      source_of_truth: "non_authority",
      status: "quarantined",
    });
    expect(artifact.node2_local_runtime_quarantine.node2_local_laravel_authority).toBe(false);
    expect(artifact.node2_local_runtime_quarantine.api_proxy_uses_node2_local_laravel).toBe(false);
    expect(artifact.node2_local_runtime_quarantine.seo_collector_may_read_node2_local_laravel).toBe(false);
    expect(artifact.node2_local_runtime_quarantine.metabase_may_query_node2_local_db).toBe(false);
  });

  it("records fresh gateway config verification and proxy classification", () => {
    const artifact = readArtifact();

    expect(artifact.gateway_config_verification).toBeTruthy();
    expect(artifact.gateway_config_verification).toMatchObject({
      gateway_config_verified: true,
      evidence_source: "fresh_node2_readonly",
      server_name_api_fermatmind_present: true,
      api_location_present: true,
      proxy_pass_to_node3_present: true,
      config_checksum_present: true,
      config_mtime_present: true,
      printed_full_config: false,
      printed_ssl_private_keys: false,
      printed_env_values: false,
    });
    expect(artifact.api_proxy_target_classification).toBe("node3_backend_authority");
  });

  it("blocks if the proxy target is ever classified as Node2 local Laravel", () => {
    const artifact = readArtifact();

    if (artifact.api_proxy_target_classification === "node2_local_laravel") {
      expect(artifact.acceptance_status).toBe("blocked");
    }
  });

  it("includes all required endpoint smoke surfaces", () => {
    const artifact = readArtifact();
    const names = artifact.endpoint_smoke_results.map((result) => result.name);

    expect(names).toEqual(
      expect.arrayContaining([
        "scales_catalog",
        "mbti_lookup",
        "riasec_lookup",
        "sitemap_source",
        "articles_list",
        "article_detail",
        "topics",
        "personality_infj",
        "career_jobs",
        "skus_mbti",
      ])
    );
    expect(artifact.endpoint_smoke_results.every((result) => result.method === "GET")).toBe(true);
    expect(artifact.endpoint_smoke_results.every((result) => result.status === 200)).toBe(true);
    expect(artifact.endpoint_smoke_results.every((result) => result.headers.cookie_header_observed === false)).toBe(true);
  });

  it("enforces side-effect policy", () => {
    const artifact = readArtifact();

    expect(artifact.side_effect_policy.forbidden_operations).toEqual(
      expect.arrayContaining(["create_orders", "create_attempts", "send_emails", "trigger_payment_webhook"])
    );
    expect(artifact.side_effect_policy.created_orders).toBe(false);
    expect(artifact.side_effect_policy.created_attempts).toBe(false);
    expect(artifact.side_effect_policy.sent_emails).toBe(false);
    expect(artifact.side_effect_policy.triggered_payment_webhook).toBe(false);
    expect(artifact.side_effect_policy.modified_openresty).toBe(false);
    expect(artifact.side_effect_policy.restarted_services).toBe(false);
    expect(artifact.side_effect_policy.changed_dns).toBe(false);
    expect(artifact.side_effect_policy.changed_database).toBe(false);
  });

  it("does not store sensitive evidence payloads", () => {
    const artifact = readArtifact();
    const raw = fs.readFileSync(ARTIFACT_PATH, "utf8");

    expect(artifact.pii_secret_redaction.raw_response_bodies_stored).toBe(false);
    expect(artifact.pii_secret_redaction.cookie_values_stored).toBe(false);
    expect(artifact.pii_secret_redaction.email_values_stored).toBe(false);
    expect(artifact.pii_secret_redaction.order_numbers_stored).toBe(false);
    expect(artifact.pii_secret_redaction.payment_ids_stored).toBe(false);
    expect(artifact.pii_secret_redaction.ssl_private_keys_printed).toBe(false);
    expect(raw).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(raw).not.toMatch(/order_no/i);
    expect(raw).not.toMatch(/pay_(?:[A-Za-z0-9]{12,})/);
    expect(raw).not.toMatch(/pi_(?:[A-Za-z0-9]{12,})/);
  });

  it("keeps SEO-DASH gating consistent with acceptance status", () => {
    const artifact = readArtifact();

    if (artifact.acceptance_status === "accepted") {
      expect(artifact.seo_dash_00_unblocked).toBe(true);
      expect(artifact.next_task).toBe("SEO-DASH-00");
    } else {
      expect(artifact.seo_dash_00_unblocked).toBe(false);
      expect(["BACKEND-RUNTIME-02E", "BACKEND-RUNTIME-02F", "BACKEND-RUNTIME-02G"]).toContain(artifact.next_task);
    }
  });

  it("records all forbidden actions as false", () => {
    const artifact = readArtifact();

    expect(Object.values(artifact.forbidden_actions_observed_false).every((value) => value === false)).toBe(true);
  });

  it("ensures no runtime files are changed", () => {
    const changed = currentChangedFiles();

    expect(changed.every(isAllowedFile), changed.join("\n")).toBe(true);
  });
});
