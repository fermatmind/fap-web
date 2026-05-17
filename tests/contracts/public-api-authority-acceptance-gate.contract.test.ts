import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/public-api-authority-acceptance-gate.v1.json");

type SmokeResult = {
  name: string;
  method: string;
  url: string;
  status: number;
  ok: boolean;
  headers: { set_cookie_header_observed: boolean };
};

type Artifact = {
  version: string;
  source_documents: string[];
  accepted_topology: {
    node2: { role: string; source_of_truth: string };
    node3: { role: string; source_of_truth: string };
    node2_local_laravel: { source_of_truth: string; status: string };
  };
  endpoint_smoke_results: SmokeResult[];
  side_effect_policy: {
    forbidden_operations: string[];
    created_orders: boolean;
    created_attempts: boolean;
    sent_emails: boolean;
    triggered_payment_webhook: boolean;
    email_bind_called: boolean;
    checkout_called: boolean;
  };
  node2_local_runtime_quarantine: {
    node2_local_laravel_authority: boolean;
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
    "docs/seo/public-api-authority-acceptance-gate.md",
    "docs/seo/generated/public-api-authority-acceptance-gate.v1.json",
    "tests/contracts/public-api-authority-acceptance-gate.contract.test.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file);
}

describe("public API authority acceptance gate", () => {
  it("has version and required source documents", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("public_api_authority_acceptance_gate.v1");
    expect(artifact.source_documents).toEqual(
      expect.arrayContaining(["BACKEND-RUNTIME-01C", "BACKEND-RUNTIME-02A", "BACKEND-RUNTIME-02B"])
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
    expect(artifact.node2_local_runtime_quarantine.seo_collector_may_read_node2_local_laravel).toBe(false);
    expect(artifact.node2_local_runtime_quarantine.metabase_may_query_node2_local_db).toBe(false);
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
    expect(artifact.endpoint_smoke_results.every((result) => result.headers.set_cookie_header_observed === false)).toBe(true);
  });

  it("enforces side-effect policy for orders, attempts, emails, and payment webhooks", () => {
    const artifact = readArtifact();

    expect(artifact.side_effect_policy.forbidden_operations).toEqual(
      expect.arrayContaining(["create_orders", "create_attempts", "send_emails", "trigger_payment_webhook"])
    );
    expect(artifact.side_effect_policy.created_orders).toBe(false);
    expect(artifact.side_effect_policy.created_attempts).toBe(false);
    expect(artifact.side_effect_policy.sent_emails).toBe(false);
    expect(artifact.side_effect_policy.triggered_payment_webhook).toBe(false);
    expect(artifact.side_effect_policy.email_bind_called).toBe(false);
    expect(artifact.side_effect_policy.checkout_called).toBe(false);
  });

  it("does not store sensitive evidence payloads", () => {
    const artifact = readArtifact();
    const raw = fs.readFileSync(ARTIFACT_PATH, "utf8");

    expect(artifact.pii_secret_redaction.raw_response_bodies_stored).toBe(false);
    expect(artifact.pii_secret_redaction.cookie_values_stored).toBe(false);
    expect(artifact.pii_secret_redaction.email_values_stored).toBe(false);
    expect(artifact.pii_secret_redaction.order_numbers_stored).toBe(false);
    expect(artifact.pii_secret_redaction.payment_ids_stored).toBe(false);
    expect(raw).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(raw).not.toMatch(/order_no/i);
    expect(raw).not.toMatch(/pay_(?:[A-Za-z0-9]{12,})/);
    expect(raw).not.toMatch(/pi_(?:[A-Za-z0-9]{12,})/);
    expect(raw).not.toMatch(/set-cookie/i);
  });

  it("keeps SEO-DASH gating consistent with acceptance status", () => {
    const artifact = readArtifact();

    if (artifact.acceptance_status === "accepted") {
      expect(artifact.seo_dash_00_unblocked).toBe(true);
      expect(artifact.next_task).toBe("SEO-DASH-00");
    } else {
      expect(artifact.seo_dash_00_unblocked).toBe(false);
      expect(["BACKEND-RUNTIME-02D", "BACKEND-RUNTIME-02E", "BACKEND-RUNTIME-02F"]).toContain(artifact.next_task);
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
