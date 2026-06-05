import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const VALIDATION_PATH = path.join(ROOT, "docs/operations/generated/help-service-content-validation.v1.json");
const ARCHIVE_PATH = path.join(ROOT, "docs/content/help/generated/help-service-content-drafts.v1.json");
const ALLOWED_FILES = new Set([
  "docs/content/help/generated/help-service-content-drafts.v1.json",
  "docs/operations/generated/help-service-content-validation.v1.json",
  "tests/contracts/help-service-content-drafts-validation.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);
const ALLOWED_PREFIXES = ["docs/content/help/service-drafts/"];

const REQUIRED_PACKAGES = [
  "UNLOCK-FAILURE-HELP-CARD-01",
  "PAYMENT-REFUND-FAQ-PACKAGE-01",
  "RESULT-RECOVERY-FAQ-01",
  "PRIVACY-FAQ-PACKAGE-01",
  "NONDIAGNOSTIC-HELP-COPY-01",
  "DATA-DELETION-REQUEST-FAQ-01",
];

type ValidationArtifact = {
  schema_version: string;
  pr_id: string;
  decision: string;
  support_email: string;
  runtime_changed: boolean;
  cms_mutation: boolean;
  content_rewritten: boolean;
  publish_allowed: boolean;
  requires_operator_review: boolean;
  cms_draft_created: boolean;
  ready_for_cms_import_package_generation: boolean;
  operator_review_still_required: boolean;
  schema_enabled: boolean;
  package_count: number;
  packages: Array<{
    asset_id: string;
    support_email: string;
    publish_allowed: boolean;
    requires_operator_review: boolean;
    cms_draft_created: boolean;
    bilingual_markers_present: boolean;
    schema_eligibility_conditional: boolean;
  }>;
  checks: Array<{ id: string; status: string; matches?: unknown[]; evidence?: string }>;
  allowed_boundary_mentions: Record<string, number>;
  blockers: unknown[];
  forbidden_actions: string[];
};

function readValidation(): ValidationArtifact {
  return JSON.parse(fs.readFileSync(VALIDATION_PATH, "utf8")) as ValidationArtifact;
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
      // CI and local clones expose different diff bases. Use whichever source exists.
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return ALLOWED_FILES.has(file) || ALLOWED_PREFIXES.some((prefix) => file.startsWith(prefix));
}

describe("HELP-SERVICE-CONTENT-DRAFTS-VALIDATION-01 contract", () => {
  it("validates the archived drafts without changing runtime, CMS, or content", () => {
    const artifact = readValidation();

    expect(artifact.schema_version).toBe("help_service_content_validation.v1");
    expect(artifact.pr_id).toBe("HELP-SERVICE-CONTENT-DRAFTS-VALIDATION-01");
    expect(artifact.decision).toBe("PASS_WITH_OPERATOR_REVIEW_GATES");
    expect(artifact.support_email).toBe("support@fermatmind.com");
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.content_rewritten).toBe(false);
    expect(artifact.publish_allowed).toBe(false);
    expect(artifact.requires_operator_review).toBe(true);
    expect(artifact.cms_draft_created).toBe(false);
  });

  it("confirms all six required packages and archive metadata", () => {
    const validation = readValidation();
    const archive = JSON.parse(fs.readFileSync(ARCHIVE_PATH, "utf8")) as { package_count: number };

    expect(archive.package_count).toBe(6);
    expect(validation.package_count).toBe(6);
    expect(validation.packages.map((item) => item.asset_id).sort()).toEqual([...REQUIRED_PACKAGES].sort());
    expect(validation.packages.every((item) => item.support_email === "support@fermatmind.com")).toBe(true);
    expect(validation.packages.every((item) => item.publish_allowed === false)).toBe(true);
    expect(validation.packages.every((item) => item.requires_operator_review === true)).toBe(true);
    expect(validation.packages.every((item) => item.cms_draft_created === false)).toBe(true);
  });

  it("passes privacy, support, claim, competitor, and schema boundary checks", () => {
    const checks = new Map(readValidation().checks.map((check) => [check.id, check]));

    for (const id of [
      "all_six_packages_exist",
      "draft_only_flags",
      "support_email",
      "no_raw_private_identifier_examples",
      "no_full_private_urls",
      "no_tokenized_urls",
      "no_competitor_copy_markers",
      "schema_conditional_not_enabled",
      "bilingual_policy_consistency",
      "claims_and_refund_promises",
    ]) {
      expect(checks.get(id)?.status, id).toBe("pass");
    }
    expect(checks.get("no_raw_private_identifier_examples")?.matches).toEqual([]);
    expect(checks.get("no_full_private_urls")?.matches).toEqual([]);
    expect(checks.get("no_tokenized_urls")?.matches).toEqual([]);
  });

  it("keeps schema and CMS import eligibility conditional", () => {
    const artifact = readValidation();

    expect(artifact.ready_for_cms_import_package_generation).toBe(true);
    expect(artifact.operator_review_still_required).toBe(true);
    expect(artifact.schema_enabled).toBe(false);
    expect(artifact.packages.every((item) => item.bilingual_markers_present)).toBe(true);
    expect(artifact.packages.every((item) => item.schema_eligibility_conditional)).toBe(true);
    expect(artifact.allowed_boundary_mentions.private_route_globs).toBeGreaterThan(0);
    expect(artifact.allowed_boundary_mentions.forbidden_phrase_lists).toBeGreaterThan(0);
    expect(artifact.blockers).toEqual([]);
  });

  it("keeps the diff inside the authorized validation scope", () => {
    const declaredScopeFiles = [
      "docs/content/help/generated/help-service-content-drafts.v1.json",
      "docs/operations/generated/help-service-content-validation.v1.json",
      "tests/contracts/help-service-content-drafts-validation.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of [...new Set([...changedFiles(), ...declaredScopeFiles])].sort()) {
      expect(isAllowedFile(file), `${file} is outside HELP-SERVICE-CONTENT-DRAFTS-VALIDATION-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });

  it("records forbidden actions", () => {
    expect(readValidation().forbidden_actions).toEqual(
      expect.arrayContaining([
        "no publish",
        "no CMS mutation",
        "no CMS draft creation",
        "no content rewrite",
        "no private URL access",
        "no raw order/payment/result identifiers",
        "no competitor copy",
      ])
    );
  });
});
