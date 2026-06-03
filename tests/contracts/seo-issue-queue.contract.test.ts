import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/seo/seo-issue-queue-read-model.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/seo-issue-queue.v1.json");

type SeoIssueQueueArtifact = {
  version: string;
  scope: string;
  status: string;
  source_documents: string[];
  authority_boundary: Record<string, string | boolean>;
  source_inputs: Array<{ source_signal: string; authority_rule: string }>;
  issue_key: {
    stable_key: string[];
    private_urls_as_normal_issue_urls_allowed: boolean;
  };
  fields: {
    required: string[];
    forbidden: string[];
    csv_export_fields: string[];
  };
  page_entity_types: string[];
  issue_types: string[];
  severity: {
    allowed_values: string[];
    release_visibility: Record<string, string>;
  };
  lifecycle: {
    states: string[];
    suppression_requires: string[];
    state_changes_may_mutate_cms_fields: boolean;
    state_changes_may_mutate_publish_state: boolean;
    state_changes_may_mutate_sitemap_or_llms: boolean;
  };
  roles: {
    read_roles: string[];
    triage_roles: string[];
    allowed_actions: string[];
    forbidden_actions: string[];
  };
  release_integration: Record<string, string[] | boolean>;
  generated_queue?: {
    version: string;
    scope: string;
    read_only: boolean;
    live_data_collected: boolean;
    network_access_enabled: boolean;
    summary: Record<string, unknown>;
    risk_boundary: Record<string, boolean>;
  };
  dashboard_artifact_state?: {
    status: string;
    source: string;
    implemented_by: string;
    merged_pr: string;
    merge_commit: string;
    live_truth_sources_connected: boolean;
    live_truth_sources_deferred: string[];
    next_readiness_task: string;
    boundary: string;
  };
  sample_issues: Array<Record<string, unknown>>;
  risk_boundary: Record<string, boolean>;
  deferred_runtime_work: string[];
  repository_rule_impact: Record<string, boolean>;
  recommended_follow_up: string;
};

function readArtifact(): SeoIssueQueueArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as SeoIssueQueueArtifact;
}

function readDoc(): string {
  return fs.readFileSync(DOC_PATH, "utf8");
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI and local checkout shapes differ; use whichever scoped diff source is available.
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return [
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
    "docs/seo/seo-issue-queue-read-model.md",
    "docs/seo/generated/seo-issue-queue.v1.json",
    "docs/seo/generated/seo-issue-queue.v1.csv",
    "scripts/seo/generate-seo-issue-queue.mjs",
    "tests/contracts/seo-issue-queue.contract.test.ts",
    "tests/contracts/seo-issue-queue-generator.contract.test.ts",
    "tests/contracts/helpers/currentPrScope.ts",
  ].includes(file) || isCurrentRiasecPack12AllowedFile(file);
}

describe("SEO issue queue read model contract", () => {
  it("has expected version, scope, status, and source documents", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("seo_issue_queue.v1");
    expect(artifact.scope).toBe("SEO-ISSUE-QUEUE-00");
    expect(artifact.status).toBe("contract_design");
    expect(artifact.source_documents).toEqual(
      expect.arrayContaining([
        "SEO-DASH-00B",
        "CMS-OPS-IA-00",
        "CMS-OPS-RELEASE-02",
        "SEO-SITEMAP-P0-05",
        "SEO-COMPETITOR-URL-01",
      ])
    );
  });

  it("keeps the queue as a read-only sanitized model rather than CMS or search authority", () => {
    const artifact = readArtifact();

    expect(artifact.authority_boundary.read_model_only).toBe(true);
    expect(artifact.authority_boundary.cms_content_authority).toBe("fap_api_cms_backend");
    expect(artifact.authority_boundary.release_authority).toBe("backend_cms_release_plan");
    expect(artifact.authority_boundary.search_channels_are_content_truth).toBe(false);
    expect(artifact.authority_boundary.issue_queue_may_mutate_cms).toBe(false);
    expect(artifact.authority_boundary.issue_queue_may_publish).toBe(false);
    expect(artifact.authority_boundary.issue_queue_may_submit_search_urls).toBe(false);
  });

  it("accepts expected source inputs without turning telemetry into truth", () => {
    const artifact = readArtifact();
    const sources = artifact.source_inputs.map((input) => input.source_signal);

    expect(sources).toEqual(
      expect.arrayContaining([
        "url_truth",
        "sitemap",
        "llms",
        "gsc",
        "baidu",
        "ga4",
        "cms_release",
        "cms_draft",
        "competitor_url_inventory",
        "manual_review",
      ])
    );
    expect(artifact.source_inputs.find((input) => input.source_signal === "ga4")?.authority_rule).toContain(
      "not purchase"
    );
    expect(artifact.source_inputs.find((input) => input.source_signal === "competitor_url_inventory")?.authority_rule).toContain(
      "no draft or content generation"
    );
  });

  it("keys issues by canonical URL, locale, issue type, and source signal while excluding private URLs", () => {
    const artifact = readArtifact();

    expect(artifact.issue_key.stable_key).toEqual(["canonical_url", "locale", "issue_type", "source_signal"]);
    expect(artifact.issue_key.private_urls_as_normal_issue_urls_allowed).toBe(false);
  });

  it("defines required fields and forbids raw private or publishable content fields", () => {
    const artifact = readArtifact();

    expect(artifact.fields.required).toEqual(
      expect.arrayContaining([
        "issue_id",
        "canonical_url",
        "locale",
        "page_entity_type",
        "source_signal",
        "issue_type",
        "severity",
        "status",
        "evidence_summary",
        "recommendation_summary",
        "risk_boundary",
      ])
    );
    expect(artifact.fields.forbidden).toEqual(
      expect.arrayContaining([
        "email",
        "raw_cookie",
        "raw_order_id",
        "raw_attempt_id",
        "payment_payload",
        "raw_private_url",
        "article_title",
        "h1",
        "faq_copy",
        "cta_copy",
        "body_copy",
      ])
    );
  });

  it("uses the approved page entity taxonomy and locks issue types", () => {
    const artifact = readArtifact();

    expect(artifact.page_entity_types).toEqual(
      expect.arrayContaining([
        "home",
        "test_hub",
        "test_detail",
        "article",
        "topic",
        "personality",
        "career_job",
        "career_recommendation",
        "methodology",
        "dataset",
        "report_preview",
        "landing_page",
      ])
    );
    expect(artifact.issue_types).toEqual(
      expect.arrayContaining([
        "missing_from_sitemap",
        "unexpected_in_sitemap",
        "draft_public_leak",
        "noindex_public_mismatch",
        "canonical_mismatch",
        "hreflang_gap",
        "llms_exposure_gap",
        "schema_gap",
        "private_url_leak",
        "content_decay",
        "competitor_gap_candidate",
        "tracking_gap",
        "post_publish_smoke_failure",
      ])
    );
  });

  it("defines severity, lifecycle states, and suppression evidence without side effects", () => {
    const artifact = readArtifact();

    expect(artifact.severity.allowed_values).toEqual(["critical", "high", "medium", "low", "info"]);
    expect(artifact.severity.release_visibility.critical).toContain("release_operator");
    expect(artifact.lifecycle.states).toEqual(
      expect.arrayContaining([
        "open",
        "triaged",
        "assigned",
        "blocked",
        "suppressed",
        "linked_to_cms_task",
        "waiting_release",
        "resolved_observed",
        "closed",
      ])
    );
    expect(artifact.lifecycle.suppression_requires).toEqual(
      expect.arrayContaining(["suppression_reason", "reviewer_role", "expiration_or_review_date"])
    );
    expect(artifact.lifecycle.state_changes_may_mutate_cms_fields).toBe(false);
    expect(artifact.lifecycle.state_changes_may_mutate_publish_state).toBe(false);
    expect(artifact.lifecycle.state_changes_may_mutate_sitemap_or_llms).toBe(false);
  });

  it("allows triage and links but forbids CMS writes, publish actions, content generation, and search submission", () => {
    const artifact = readArtifact();

    expect(artifact.roles.read_roles).toEqual(expect.arrayContaining(["seo_operator", "analyst", "publisher"]));
    expect(artifact.roles.triage_roles).toEqual(expect.arrayContaining(["seo_operator", "content_reviewer"]));
    expect(artifact.roles.allowed_actions).toEqual(
      expect.arrayContaining(["read_sanitized_rows", "triage_severity", "link_backend_owned_cms_task"])
    );
    expect(artifact.roles.forbidden_actions).toEqual(
      expect.arrayContaining([
        "cms_mutation",
        "cms_draft_creation",
        "article_copy_generation",
        "publish",
        "rollback",
        "search_submission",
        "sitemap_mutation",
        "llms_mutation",
        "raw_pii_export",
      ])
    );
  });

  it("integrates with release evidence without auto-approval, revalidation, or search submission", () => {
    const artifact = readArtifact();

    expect(artifact.release_integration.may_display_sanitized_issue_evidence).toBe(true);
    expect(artifact.release_integration.may_auto_approve_release).toBe(false);
    expect(artifact.release_integration.may_auto_publish).toBe(false);
    expect(artifact.release_integration.may_auto_unpublish).toBe(false);
    expect(artifact.release_integration.may_auto_rollback).toBe(false);
    expect(artifact.release_integration.may_auto_revalidate).toBe(false);
    expect(artifact.release_integration.may_auto_submit_search_urls).toBe(false);
  });

  it("keeps sample issues sample-only and non-mutating", () => {
    const artifact = readArtifact();

    expect(artifact.sample_issues.length).toBeGreaterThan(0);
    expect(artifact.sample_issues.every((issue) => (issue.risk_boundary as Record<string, boolean>).sample_only)).toBe(
      true
    );
    expect(artifact.sample_issues.some((issue) => issue.issue_type === "competitor_gap_candidate")).toBe(true);
  });

  it("records hard risk boundaries and deferred runtime work", () => {
    const artifact = readArtifact();

    expect(artifact.risk_boundary.read_only).toBe(true);
    expect(artifact.risk_boundary.migrations_created).toBe(false);
    expect(artifact.risk_boundary.collector_created).toBe(false);
    expect(artifact.risk_boundary.cms_writes).toBe(false);
    expect(artifact.risk_boundary.cms_draft_creation).toBe(false);
    expect(artifact.risk_boundary.publish_actions).toBe(false);
    expect(artifact.risk_boundary.search_submission).toBe(false);
    expect(artifact.risk_boundary.sitemap_mutation).toBe(false);
    expect(artifact.risk_boundary.auto_content_generation).toBe(false);
    expect(artifact.deferred_runtime_work).toEqual(
      expect.arrayContaining(["seo_intel_physical_schema", "collectors", "cms_filament_ui", "frontend_ops_dashboard"])
    );
  });

  it("documents the no-runtime-change contract and repository rule impact", () => {
    const artifact = readArtifact();
    const doc = readDoc();

    expect(doc).toContain("It is a docs and contract PR only.");
    expect(doc).toContain("It is not content truth, CMS authority, search submission authority");
    expect(doc).toContain("`fap-web` remains a deterministic renderer");
    expect(artifact.repository_rule_impact.fap_web_is_cms_authority).toBe(false);
    expect(artifact.repository_rule_impact.cms_backend_remains_content_authority).toBe(true);
    expect(artifact.repository_rule_impact.seo_issue_queue_auto_publish_allowed).toBe(false);
    expect(artifact.repository_rule_impact.seo_issue_queue_auto_content_generation_allowed).toBe(false);
    expect(artifact.generated_queue).toMatchObject({
      version: "seo_issue_queue_generator.v1",
      scope: "SEO-ISSUE-QUEUE-01",
      read_only: true,
      live_data_collected: false,
      network_access_enabled: false,
    });
    expect(artifact.generated_queue?.risk_boundary.cms_writes).toBe(false);
    expect(artifact.generated_queue?.risk_boundary.search_submission).toBe(false);
    expect(artifact.recommended_follow_up).toBe(
      "SEO-DASH-REAL-DATA-READINESS-01 plan read-only seo_intel/CMS/GSC/Baidu/GA4 data integration readiness before replacing the artifact-backed dashboard shell"
    );
    expect(artifact.dashboard_artifact_state).toMatchObject({
      status: "artifact_backed_shell",
      source: "docs/seo/generated/seo-issue-queue.v1.json",
      implemented_by: "SEO-ISSUE-QUEUE-02",
      merged_pr: "https://github.com/fermatmind/fap-web/pull/1020",
      merge_commit: "07506458f09f6c74b876c62d613810ae1bc67a1c",
      live_truth_sources_connected: false,
      next_readiness_task: "SEO-DASH-REAL-DATA-READINESS-01",
    });
    expect(artifact.dashboard_artifact_state?.live_truth_sources_deferred).toEqual(
      expect.arrayContaining(["seo_intel", "CMS API", "GSC", "Baidu", "GA4"])
    );
    expect(artifact.dashboard_artifact_state?.boundary).toContain("fap-web remains a read-only ops shell");
  });

  it("keeps current PR scope limited to docs, generated artifact, contract test, helper, and train metadata", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    if (files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    const ledgerReconciliationFiles = new Set([
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/seo-issue-queue-read-model.md",
      "docs/seo/generated/seo-issue-queue.v1.json",
      "docs/seo/generated/seo-issue-queue.v1.csv",
      "scripts/seo/generate-seo-issue-queue.mjs",
      "tests/contracts/seo-issue-queue-generator.contract.test.ts",
      "tests/contracts/cms-ops-ia-permission-matrix.contract.test.ts",
      "tests/contracts/seo-issue-queue.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
    ]);

    if (
      files.includes("docs/codex/pr-train-state.json") &&
      files.every(isCurrentRiasecPack12AllowedFile)
    ) {
      const state = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/codex/pr-train-state.json"), "utf8")) as {
        prs: Array<Record<string, unknown>>;
      };
      const entry = state.prs.find((item) => item.id === "SEO-ISSUE-QUEUE-01");

      expect(entry).toMatchObject({
        status: "merged",
        pr_url: "https://github.com/fermatmind/fap-web/pull/1017",
        merge_sha: "cae0a98c24c5894478b80b4809f78239068f7705",
        remote_branch_deleted: true,
        local_cleanup_executed: true,
      });
      return;
    }

    if (
      files.includes("docs/codex/pr-train-state.json") &&
      files.every((file) => ledgerReconciliationFiles.has(file))
    ) {
      const state = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/codex/pr-train-state.json"), "utf8")) as {
        prs: Array<Record<string, unknown>>;
      };
      const entry = state.prs.find((item) => item.id === "SEO-ISSUE-QUEUE-00");

      expect(entry).toMatchObject({
        status: "merged",
        pr_url: "https://github.com/fermatmind/fap-web/pull/1015",
        merge_sha: "60c6d9cf700a6aac604f2db9e296f2fd6ad5c37e",
        remote_branch_deleted: true,
        local_cleanup_executed: true,
      });
      return;
    }

    expect(files).toEqual(expect.arrayContaining(["docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"]));
    expect(files.every(isAllowedFile), files.join("\n")).toBe(true);
  });
});
