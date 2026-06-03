import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/operations/cms-ops-ia-permission-matrix.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/operations/generated/cms-ops-ia-permission-matrix.v1.json");

type Artifact = {
  version: string;
  scope: string;
  status: string;
  source_documents: string[];
  authority_boundary: {
    cms_content_authority: string;
    public_renderer: string;
    fap_web_may_invent_cms_fields: boolean;
    fap_web_may_publish_content: boolean;
    seo_intel_role: string;
    seo_intel_may_mutate_cms: boolean;
    search_channels_are_content_truth: boolean;
    release_authority: string;
  };
  navigation_groups: Array<{ id: string; resources: string[]; write_roles: string[] }>;
  roles: Record<string, { capabilities: string[]; forbidden: string[] }>;
  resource_action_matrix: Record<string, Record<string, string[] | string>>;
  workflow_states: string[];
  required_gates: Record<string, string[]>;
  field_ownership: {
    cms_owned: string[];
    cms_relation_owned: string[];
    discoverability_owned_by_backend_release_contract: string[];
    seo_intel_sanitized_summary: string[];
    forbidden_in_ops_summaries: string[];
  };
  seo_issue_summary_boundary: {
    allowed: string[];
    forbidden: string[];
  };
  audit_events: string[];
  deferred_runtime_work: string[];
  forbidden_current_pr_changes: string[];
  repository_rule_impact: {
    fap_web_is_cms_authority: boolean;
    cms_fields_backend_authoritative: boolean;
    seo_intel_auto_publish_allowed: boolean;
    runtime_implementation_deferred: boolean;
  };
  next_task: string;
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
}

function readDoc(): string {
  return fs.readFileSync(DOC_PATH, "utf8");
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

function prChangedFiles(): string[] {
  const changedFiles = new Set(currentChangedFiles());

  for (const args of [
    ["diff", "--name-only", "origin/main...HEAD"],
    ["diff", "--name-only", "HEAD~1..HEAD"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      const diffFiles = output
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (diffFiles.length > 0) {
        for (const file of diffFiles) {
          changedFiles.add(file);
        }
        return [...changedFiles].sort();
      }
    } catch {
      // CI and local clones can differ in fetch depth. Try the next scoped diff source.
    }
  }

  return [...changedFiles].sort();
}

function isAllowedFile(file: string): boolean {
  return [
    "docs/operations/cms-ops-ia-permission-matrix.md",
    "docs/operations/generated/cms-ops-ia-permission-matrix.v1.json",
    "tests/contracts/cms-ops-ia-permission-matrix.contract.test.ts",
    "tests/contracts/helpers/currentPrScope.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file) || isCurrentRiasecPack12AllowedFile(file);
}

describe("CMS Ops IA permission matrix contract", () => {
  it("has the expected version, scope, sources, and next task", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("cms_ops_ia_permission_matrix.v1");
    expect(artifact.scope).toBe("CMS-OPS-IA-00");
    expect(artifact.status).toBe("contract_design");
    expect(artifact.source_documents).toEqual(
      expect.arrayContaining([
        "ARCH-SEO-CMS-02",
        "BACKEND-RUNTIME-02D-RECONCILE",
        "SEO-DASH-00B",
        "fermatmind-cms-seo-ops-requirements",
      ])
    );
    expect(artifact.next_task).toBe("CMS-OPS-RELEASE-02");
  });

  it("keeps CMS authority in fap-api and forbids fap-web CMS fallback authority", () => {
    const artifact = readArtifact();

    expect(artifact.authority_boundary.cms_content_authority).toBe("fap_api_cms_backend");
    expect(artifact.authority_boundary.public_renderer).toBe("fap_web");
    expect(artifact.authority_boundary.fap_web_may_invent_cms_fields).toBe(false);
    expect(artifact.authority_boundary.fap_web_may_publish_content).toBe(false);
    expect(artifact.repository_rule_impact.fap_web_is_cms_authority).toBe(false);
    expect(artifact.repository_rule_impact.cms_fields_backend_authoritative).toBe(true);
  });

  it("defines grouped CMS ops navigation without allowing SEO views to write CMS", () => {
    const artifact = readArtifact();
    const groups = new Map(artifact.navigation_groups.map((group) => [group.id, group]));

    expect([...groups.keys()]).toEqual(
      expect.arrayContaining(["content_ops", "seo_growth", "release_ops", "governance", "support_ops"])
    );
    expect(groups.get("content_ops")?.resources).toEqual(expect.arrayContaining(["articles", "content_pages"]));
    expect(groups.get("release_ops")?.resources).toEqual(expect.arrayContaining(["publish_checklist", "post_publish_smoke"]));
    expect(groups.get("seo_growth")?.write_roles).toEqual([]);
  });

  it("locks role capabilities and explicit forbidden actions", () => {
    const artifact = readArtifact();

    expect(Object.keys(artifact.roles)).toEqual(
      expect.arrayContaining([
        "owner",
        "ops_admin",
        "content_editor",
        "content_reviewer",
        "publisher",
        "seo_operator",
        "analyst",
        "sre",
        "security_auditor",
        "support",
      ])
    );
    expect(artifact.roles.content_editor.capabilities).toEqual(expect.arrayContaining(["content_write", "preview_request"]));
    expect(artifact.roles.content_editor.forbidden).toEqual(expect.arrayContaining(["publish", "rollback"]));
    expect(artifact.roles.seo_operator.forbidden).toEqual(expect.arrayContaining(["cms_mutation", "publish", "search_telemetry_as_content_truth"]));
    expect(artifact.roles.analyst.forbidden).toEqual(expect.arrayContaining(["raw_pii", "raw_order", "unrestricted_sql"]));
  });

  it("requires publisher release actions to happen after review gates", () => {
    const artifact = readArtifact();
    const articles = artifact.resource_action_matrix.articles;

    expect(articles.draft_edit).toEqual(expect.arrayContaining(["content_editor", "ops_admin", "owner"]));
    expect(articles.review).toEqual(expect.arrayContaining(["content_reviewer", "ops_admin", "owner"]));
    expect(articles.publish).toEqual(expect.arrayContaining(["publisher", "ops_admin", "owner"]));
    expect(articles.rollback).toEqual(expect.arrayContaining(["publisher", "ops_admin", "owner"]));
    expect(articles.seo_issue_link_mode).toBe("read_only_summary_explicit_task_link");
  });

  it("defines release lifecycle states and required gates without runtime implementation", () => {
    const artifact = readArtifact();

    expect(artifact.workflow_states).toEqual(
      expect.arrayContaining([
        "draft",
        "review_pending",
        "review_approved",
        "release_ready",
        "published",
        "post_publish_smoke_pending",
        "post_publish_smoke_passed",
        "rollback_required",
        "needs_revision",
      ])
    );
    expect(artifact.required_gates.review_pending_to_review_approved).toEqual(
      expect.arrayContaining(["reviewer_identity", "review_timestamp", "claim_decision", "evidence_level"])
    );
    expect(artifact.required_gates.release_ready_to_published).toEqual(
      expect.arrayContaining(["backend_cms_release_permission", "release_audit_written"])
    );
    expect(artifact.deferred_runtime_work).toEqual(
      expect.arrayContaining(["backend_migrations", "filament_resources", "release_checklist_runtime_enforcement"])
    );
  });

  it("keeps SEO issue summaries sanitized and read-only", () => {
    const artifact = readArtifact();

    expect(artifact.authority_boundary.seo_intel_role).toBe("read_only_observation_issue_summary");
    expect(artifact.authority_boundary.seo_intel_may_mutate_cms).toBe(false);
    expect(artifact.authority_boundary.search_channels_are_content_truth).toBe(false);
    expect(artifact.seo_issue_summary_boundary.allowed).toEqual(
      expect.arrayContaining(["sanitized_url", "locale", "issue_type", "severity", "recommendation_summary"])
    );
    expect(artifact.seo_issue_summary_boundary.forbidden).toEqual(
      expect.arrayContaining(["direct_cms_mutation", "auto_publish", "pseo_creation", "pii", "payment_payload"])
    );
    expect(artifact.repository_rule_impact.seo_intel_auto_publish_allowed).toBe(false);
  });

  it("assigns field ownership to backend/CMS and forbids private data in ops summaries", () => {
    const artifact = readArtifact();

    expect(artifact.field_ownership.cms_owned).toEqual(
      expect.arrayContaining(["slug", "locale", "title", "body", "canonical", "robots", "publish_state"])
    );
    expect(artifact.field_ownership.cms_relation_owned).toEqual(
      expect.arrayContaining(["related_tests", "related_topics", "related_articles", "related_career_guides"])
    );
    expect(artifact.field_ownership.discoverability_owned_by_backend_release_contract).toEqual(
      expect.arrayContaining(["sitemap_eligibility", "llms_eligibility", "footer_eligibility"])
    );
    expect(artifact.field_ownership.forbidden_in_ops_summaries).toEqual(
      expect.arrayContaining(["pii", "raw_order", "raw_attempt", "private_url", "auth_token"])
    );
  });

  it("records required audit events and current PR forbidden runtime changes", () => {
    const artifact = readArtifact();

    expect(artifact.audit_events).toEqual(
      expect.arrayContaining([
        "cms_resource_submitted_for_review",
        "cms_resource_review_approved",
        "cms_release_checklist_completed",
        "cms_resource_published",
        "cms_release_revalidate_completed",
        "cms_post_publish_smoke_completed",
        "permission_matrix_changed",
      ])
    );
    expect(artifact.forbidden_current_pr_changes).toEqual(
      expect.arrayContaining(["app", "components", "lib", "public", "backend_runtime", "migrations", "api_routes", "deploy"])
    );
    expect(artifact.repository_rule_impact.runtime_implementation_deferred).toBe(true);
  });

  it("keeps the narrative contract aligned with the generated artifact", () => {
    const doc = readDoc();

    expect(doc).toContain("Scope: `CMS-OPS-IA-00`");
    expect(doc).toContain("`fap-web` is not CMS authority");
    expect(doc).toContain("SEO intelligence is read-only observation for CMS");
    expect(doc).toContain("Next task: `CMS-OPS-RELEASE-02`");
  });

  it("keeps current PR scope limited to docs, generated artifact, contract tests, and train metadata", () => {
    const files = prChangedFiles();

    if (files.length > 0) {
      expect(files).toEqual(expect.arrayContaining(["docs/codex/pr-train.yaml"]));
    }
    expect(files.every(isAllowedFile)).toBe(true);
  });
});
