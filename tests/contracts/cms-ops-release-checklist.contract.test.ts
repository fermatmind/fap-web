import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/operations/cms-ops-release-checklist.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/operations/generated/cms-ops-release-checklist.v1.json");

type Artifact = {
  version: string;
  scope: string;
  status: string;
  source_documents: string[];
  authority_boundary: Record<string, string | boolean>;
  release_phases: string[];
  failure_states: string[];
  pre_publish_gates: Record<string, string[]>;
  resource_family_requirements: Record<string, { required: string[]; no_go: string[] }>;
  revalidate_path_plan: {
    backend_must_emit: string[];
    fap_web_consumer_must: string[];
    fap_web_consumer_must_reject: string[];
    forbidden_side_effects: string[];
  };
  post_publish_smoke: {
    required_checks: string[];
    private_url_leak_forbidden: string[];
    tracking_forbidden: string[];
  };
  failure_policy: Record<string, string>;
  release_audit_required_fields: string[];
  audit_forbidden_fields: string[];
  required_operator_views: string[];
  deferred_runtime_work: string[];
  repository_rule_impact: Record<string, boolean>;
  recommended_follow_up: string;
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
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
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) {
          files.add(line.trim());
        }
      }
    } catch {
      // Local and CI checkout shapes differ; use any available scoped diff source.
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return [
    "docs/operations/cms-ops-release-checklist.md",
    "docs/operations/generated/cms-ops-release-checklist.v1.json",
    "tests/contracts/cms-ops-release-checklist.contract.test.ts",
    "tests/contracts/helpers/currentPrScope.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file) || isCurrentRiasecPack12AllowedFile(file);
}

describe("CMS Ops release checklist contract", () => {
  it("has expected version, scope, sources, and follow-up", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("cms_ops_release_checklist.v1");
    expect(artifact.scope).toBe("CMS-OPS-RELEASE-02");
    expect(artifact.status).toBe("contract_design");
    expect(artifact.source_documents).toEqual(
      expect.arrayContaining(["CMS-OPS-IA-00", "PR-CMS-02", "fermatmind-cms-seo-ops-requirements"])
    );
    expect(artifact.recommended_follow_up).toBe("fap-api CMS release checklist runtime implementation after explicit authorization");
  });

  it("keeps release authority in backend/CMS and fap-web as allowlisted consumer only", () => {
    const artifact = readArtifact();

    expect(artifact.authority_boundary.publish_permission_authority).toBe("backend_cms_workflow");
    expect(artifact.authority_boundary.checklist_truth).toBe("backend_cms_release_plan");
    expect(artifact.authority_boundary.revalidation_consumer).toBe("fap_web_allowlisted_consumer");
    expect(artifact.authority_boundary.fap_web_may_publish_content).toBe(false);
    expect(artifact.authority_boundary.fap_web_may_hide_failed_publish_with_fallback_content).toBe(false);
    expect(artifact.repository_rule_impact.fap_web_release_authority).toBe(false);
  });

  it("defines successful release phases and explicit failure states", () => {
    const artifact = readArtifact();

    expect(artifact.release_phases).toEqual(
      expect.arrayContaining([
        "draft_ready_check",
        "review_signoff",
        "release_plan_created",
        "release_preflight_passed",
        "publish_executed",
        "revalidate_requested",
        "revalidate_completed",
        "post_publish_smoke_passed",
        "observe_24h",
        "closed",
      ])
    );
    expect(artifact.failure_states).toEqual(
      expect.arrayContaining(["release_preflight_failed", "publish_failed", "revalidate_failed", "post_publish_smoke_failed", "rollback_required", "forward_fix_required"])
    );
  });

  it("locks pre-publish gates for identity, SEO, review, discoverability, preview, and private URL exclusion", () => {
    const artifact = readArtifact();

    expect(artifact.pre_publish_gates.identity).toEqual(
      expect.arrayContaining(["locale", "slug", "title", "content_family", "owner", "resource_family"])
    );
    expect(artifact.pre_publish_gates.seo_metadata).toEqual(
      expect.arrayContaining(["meta_title", "meta_description", "canonical_intent", "robots_indexability"])
    );
    expect(artifact.pre_publish_gates.review).toEqual(
      expect.arrayContaining(["reviewer_identity", "review_timestamp", "review_decision", "claim_decision"])
    );
    expect(artifact.pre_publish_gates.discoverability).toEqual(
      expect.arrayContaining(["sitemap_eligibility", "llms_eligibility", "footer_eligibility", "homepage_eligibility"])
    );
    expect(artifact.pre_publish_gates.private_url_exclusion).toEqual(
      expect.arrayContaining(["result", "order", "checkout", "payment", "report", "share_token", "auth"])
    );
    expect(artifact.pre_publish_gates.preview).toEqual(["rendered_preview_or_api_preview_evidence"]);
  });

  it("defines resource-family requirements and no-go rules", () => {
    const artifact = readArtifact();

    expect(artifact.resource_family_requirements.articles.required).toEqual(
      expect.arrayContaining(["editorial_review", "seo_metadata", "canonical", "robots", "visible_body_smoke"])
    );
    expect(artifact.resource_family_requirements.articles.no_go).toEqual(
      expect.arrayContaining(["unsupported_clinical_claim", "unsupported_iq_authority_claim"])
    );
    expect(artifact.resource_family_requirements.landing_surfaces.no_go).toEqual(
      expect.arrayContaining(["frontend_fallback_copy", "local_asset_substitution_for_cms_content"])
    );
    expect(artifact.resource_family_requirements.media_metadata.no_go).toEqual(["mutable_cms_public_image_committed_to_fap_web"]);
  });

  it("keeps revalidation allowlisted and free of publish/search/sitemap side effects", () => {
    const artifact = readArtifact();

    expect(artifact.revalidate_path_plan.backend_must_emit).toEqual(
      expect.arrayContaining(["release_id", "resource_family", "canonical_url", "accepted_public_paths", "rejected_paths"])
    );
    expect(artifact.revalidate_path_plan.fap_web_consumer_must).toEqual(
      expect.arrayContaining(["require_content_release_token", "accept_allowlisted_public_paths_only", "return_revalidated_paths", "return_rejected_paths"])
    );
    expect(artifact.revalidate_path_plan.fap_web_consumer_must_reject).toEqual(
      expect.arrayContaining(["private_paths", "api_paths", "payment_paths", "order_paths", "result_paths", "checkout_paths", "external_origins"])
    );
    expect(artifact.revalidate_path_plan.forbidden_side_effects).toEqual(
      expect.arrayContaining(["publish_content", "mutate_cms_records", "submit_search_urls", "rewrite_sitemap_eligibility", "change_robots_policy"])
    );
  });

  it("defines post-publish smoke checks and private data exclusions", () => {
    const artifact = readArtifact();

    expect(artifact.post_publish_smoke.required_checks).toEqual(
      expect.arrayContaining(["http_status", "title_h1_body", "canonical", "robots", "hreflang", "sitemap", "llms", "structured_data", "private_url_leak", "cache"])
    );
    expect(artifact.post_publish_smoke.private_url_leak_forbidden).toEqual(
      expect.arrayContaining(["result", "order", "payment", "checkout", "report", "share", "auth", "account"])
    );
    expect(artifact.post_publish_smoke.tracking_forbidden).toEqual(
      expect.arrayContaining(["pii", "raw_order", "raw_attempt", "payment_payload"])
    );
  });

  it("maps release failures to blocked, rollback, or forward-fix states", () => {
    const artifact = readArtifact();

    expect(artifact.failure_policy.missing_checklist_evidence).toBe("release_preflight_failed");
    expect(artifact.failure_policy.private_noindex_url_in_release_plan).toBe("release_preflight_failed");
    expect(artifact.failure_policy.publish_command_failure).toBe("publish_failed");
    expect(artifact.failure_policy.revalidate_rejection).toBe("revalidate_failed");
    expect(artifact.failure_policy.smoke_status_canonical_robots_body_failure).toBe("post_publish_smoke_failed");
    expect(artifact.failure_policy.high_risk_claim_leak).toBe("rollback_required");
  });

  it("requires release audit fields and forbids sensitive audit payloads", () => {
    const artifact = readArtifact();

    expect(artifact.release_audit_required_fields).toEqual(
      expect.arrayContaining(["release_id", "resource_family", "actor_id", "actor_role", "reviewer_id", "previous_state", "next_state", "checklist_version", "revalidation_response_summary", "post_publish_smoke_summary"])
    );
    expect(artifact.audit_forbidden_fields).toEqual(
      expect.arrayContaining(["secrets", "raw_order_id", "raw_attempt_id", "raw_payment_payload", "private_url", "cookie", "token", "raw_pii"])
    );
  });

  it("keeps runtime implementation deferred to later backend work", () => {
    const artifact = readArtifact();

    expect(artifact.deferred_runtime_work).toEqual(
      expect.arrayContaining(["backend_release_plan_migration", "filament_release_checklist_ui", "backend_publish_service_changes", "fap_web_revalidate_route_changes", "deployment"])
    );
    expect(artifact.repository_rule_impact.backend_cms_publication_state_authoritative).toBe(true);
    expect(artifact.repository_rule_impact.sitemap_llms_backend_release_contract_driven).toBe(true);
    expect(artifact.repository_rule_impact.seo_issue_auto_publish_allowed).toBe(false);
  });

  it("keeps the narrative document aligned with the generated contract", () => {
    const doc = readDoc();

    expect(doc).toContain("Scope: `CMS-OPS-RELEASE-02`");
    expect(doc).toContain("Backend/CMS workflow");
    expect(doc).toContain("Revalidate Path Plan");
    expect(doc).toContain("Post-Publish Smoke");
    expect(doc).toContain("Rollback must be backend/CMS-owned");
  });

  it("keeps visible current PR changes within release checklist contract scope", () => {
    const files = changedFiles();

    if (files.length > 0) {
      expect(files.every(isAllowedFile)).toBe(true);
    }
  });
});
