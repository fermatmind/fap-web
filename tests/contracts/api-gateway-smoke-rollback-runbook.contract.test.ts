import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/api-gateway-smoke-rollback-runbook.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/api-gateway-smoke-rollback-runbook.md");

type Artifact = {
  version: string;
  source_documents: Array<{ id: string; status: string }>;
  accepted_topology: {
    nodes: Array<{ id: string; role: string; source_of_truth: string; status: string[] }>;
  };
  smoke_checks: Array<{ name: string; method: string[]; path: string; side_effect: boolean }>;
  header_cors_cache_checks: { origin: string; record: string[]; forbidden_to_record: string[] };
  auth_session_checks: { mode: string; allowed: string[]; forbidden: string[] };
  report_email_checkout_checks: {
    report_access: { allowed_only_with_preexisting_safe_qa_attempt: boolean };
    email_bind: { forbidden_by_default: boolean; allowed_only_with_explicit_qa_authorization: boolean };
    checkout_order_creation: string;
    payment: string;
    mail_sending: string;
    attempt_creation: string;
  };
  webhook_mapping_checks: { mode: string; allowed: string[]; forbidden: string[] };
  backup_plan: { status: string[]; steps: string[] };
  rollback_plan: { exists: boolean; triggers: string[]; steps: string[] };
  acceptance_prerequisites_for_02c: string[];
  recommended_next_task: { id: string; seo_dash_00_recommended_now: boolean };
  forbidden_actions: string[];
  side_effect_policy: { allowed: string[]; forbidden_methods: string[]; forbidden_operations: string[] };
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
    "docs/seo/api-gateway-smoke-rollback-runbook.md",
    "docs/seo/generated/api-gateway-smoke-rollback-runbook.v1.json",
    "tests/contracts/api-gateway-smoke-rollback-runbook.contract.test.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file);
}

describe("API gateway smoke and rollback runbook", () => {
  it("has version and source documents", () => {
    const artifact = readArtifact();
    const sources = artifact.source_documents.map((source) => source.id);

    expect(artifact.version).toBe("api_gateway_smoke_rollback_runbook.v1");
    expect(sources).toEqual(expect.arrayContaining(["BACKEND-RUNTIME-01C", "BACKEND-RUNTIME-02A"]));
  });

  it("keeps accepted topology locked", () => {
    const artifact = readArtifact();

    expect(nodeById(artifact, "fap-node2")).toMatchObject({
      role: "API edge gateway only",
      source_of_truth: "edge_gateway_only",
    });
    expect(nodeById(artifact, "fap-api-prod")).toMatchObject({
      role: "backend/CMS/commerce authority candidate",
      source_of_truth: "canonical_backend_authority_candidate",
    });
    expect(nodeById(artifact, "node2-local-laravel")).toMatchObject({
      source_of_truth: "non_authority",
    });
  });

  it("defines read-only gateway smoke checks for required public surfaces", () => {
    const artifact = readArtifact();
    const names = artifact.smoke_checks.map((check) => check.name);
    const paths = artifact.smoke_checks.map((check) => check.path);

    expect(names).toEqual(
      expect.arrayContaining([
        "sitemap-source",
        "articles list",
        "article detail",
        "topics",
        "personality",
        "career/jobs",
        "MBTI scale lookup",
        "RIASEC scale lookup",
        "skus",
      ])
    );
    expect(paths).toEqual(
      expect.arrayContaining([
        "/api/v0.5/seo/sitemap-source",
        "/api/v0.5/articles?locale=zh-CN",
        "/api/v0.5/topics?locale=zh-CN",
        "/api/v0.5/personality/infj?locale=zh-CN",
        "/api/v0.5/career/jobs?locale=en",
        "/api/v0.3/skus?scale=MBTI",
      ])
    );
    expect(artifact.smoke_checks.every((check) => check.side_effect === false)).toBe(true);
    expect(artifact.smoke_checks.every((check) => check.method.every((method) => ["GET", "HEAD"].includes(method)))).toBe(true);
  });

  it("defines header, CORS, cache, auth, and session read-only boundaries", () => {
    const artifact = readArtifact();

    expect(artifact.header_cors_cache_checks.origin).toBe("https://fermatmind.com");
    expect(artifact.header_cors_cache_checks.record).toEqual(
      expect.arrayContaining(["content-type", "CORS allow-origin behavior", "cache headers"])
    );
    expect(artifact.header_cors_cache_checks.forbidden_to_record).toEqual(
      expect.arrayContaining(["cookies", "bearer tokens", "session IDs", "emails", "order numbers", "payment IDs"])
    );
    expect(artifact.auth_session_checks.mode).toBe("read_only");
    expect(artifact.auth_session_checks.forbidden).toEqual(
      expect.arrayContaining(["login", "password submission", "account mutation", "email binding", "session creation"])
    );
  });

  it("forbids POST side effects, order creation, attempt creation, email mutation, and live payments", () => {
    const artifact = readArtifact();

    expect(artifact.side_effect_policy.forbidden_methods).toEqual(expect.arrayContaining(["POST", "PUT", "PATCH", "DELETE"]));
    expect(artifact.report_email_checkout_checks.checkout_order_creation).toBe("forbidden");
    expect(artifact.report_email_checkout_checks.attempt_creation).toBe("forbidden");
    expect(artifact.report_email_checkout_checks.mail_sending).toBe("forbidden");
    expect(artifact.report_email_checkout_checks.payment).toBe("forbidden");
    expect(artifact.report_email_checkout_checks.email_bind).toMatchObject({
      forbidden_by_default: true,
      allowed_only_with_explicit_qa_authorization: true,
    });
    expect(artifact.forbidden_actions).toEqual(
      expect.arrayContaining(["creating orders", "creating attempts", "sending emails", "calling live payment webhooks"])
    );
  });

  it("keeps webhook verification mapping-only and non-triggering", () => {
    const artifact = readArtifact();

    expect(artifact.webhook_mapping_checks.mode).toBe("mapping_only_non_triggering");
    expect(artifact.webhook_mapping_checks.allowed).toEqual(
      expect.arrayContaining(["verify route presence from route inventory or config evidence", "verify provider endpoint path mapping"])
    );
    expect(artifact.webhook_mapping_checks.forbidden).toEqual(
      expect.arrayContaining(["send fake payment event to production", "call provider webhook live", "replay captured webhooks"])
    );
  });

  it("defines OpenResty backup plan and rollback plan", () => {
    const artifact = readArtifact();

    expect(artifact.backup_plan.status).toEqual(expect.arrayContaining(["future_change_window_only", "not_executed_by_this_pr"]));
    expect(artifact.backup_plan.steps).toEqual(
      expect.arrayContaining([
        "capture OpenResty config file path for api.fermatmind.com",
        "copy config to timestamped backup path",
        "record checksum for active config and backup",
        "record current upstream target for /api/",
        "validate syntax before reload",
      ])
    );
    expect(artifact.rollback_plan.exists).toBe(true);
    expect(artifact.rollback_plan.steps).toEqual(
      expect.arrayContaining([
        "restore previous OpenResty config from timestamped backup",
        "validate OpenResty syntax",
        "re-run read-only gateway smoke checks",
      ])
    );
  });

  it("defines 02C acceptance prerequisites and next task", () => {
    const artifact = readArtifact();

    expect(artifact.acceptance_prerequisites_for_02c).toEqual(
      expect.arrayContaining([
        "gateway smoke runbook exists",
        "rollback plan exists",
        "Node2 local runtime remains quarantined",
        "Node3-backed public API smoke passes",
        "payment/report/email routes have non-side-effect mapping verified",
        "SEO Collector input source can be locked to Node3-backed authority",
      ])
    );
    expect(artifact.recommended_next_task).toMatchObject({
      id: "BACKEND-RUNTIME-02C",
      seo_dash_00_recommended_now: false,
    });
  });

  it("documents scope and ensures no runtime files are changed", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const changed = currentChangedFiles();

    expect(doc).toContain("This document is the API gateway smoke and rollback runbook after `BACKEND-RUNTIME-02A`.");
    expect(artifact.deployment_guardrails.runtime_behavior_changed).toBe(false);
    expect(artifact.deployment_guardrails.cloud_behavior_changed).toBe(false);
    expect(changed.every(isAllowedFile), changed.join("\n")).toBe(true);
  });
});
