import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const VALIDATION_PATH = path.join(ROOT, "docs/content/help/generated/help-content-package-validation.v1.json");
const PACKAGES_PATH = path.join(ROOT, "docs/content/help/generated/help-content-packages.v1.json");
const PACKAGE_DIR = path.join(ROOT, "docs/content/help/packages");
const ALLOWED_FILES = new Set([
  "docs/content/help/help-content-package-validation.md",
  "docs/content/help/generated/help-content-package-validation.v1.json",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/help-content-package-validation.contract.test.ts",
]);

type ValidationArtifact = {
  schema_version: string;
  pr_id: string;
  decision: string;
  runtime_changed: boolean;
  cms_mutation: boolean;
  cms_draft_created: boolean;
  content_rewritten: boolean;
  package_count: number;
  package_files: string[];
  validation_rules: Array<{ id: string; status: string; notes?: string }>;
  scan_violations: Array<{ file: string; rule: string; match: string }>;
  non_publishable_gates: {
    publish_allowed: boolean;
    requires_operator_review: boolean;
    requires_cms_authority: boolean;
    schema_requires_visible_cms_content: boolean;
    cms_draft_created: boolean;
  };
  forbidden_actions: string[];
};

type PackagesArtifact = {
  packages: Array<{
    asset_id: string;
    publish_allowed: boolean;
    requires_operator_review: boolean;
    requires_cms_authority: boolean;
    cms_draft_created: boolean;
    seo_schema_position: Record<string, unknown>;
  }>;
};

function readValidation(): ValidationArtifact {
  return JSON.parse(fs.readFileSync(VALIDATION_PATH, "utf8")) as ValidationArtifact;
}

function readPackages(): PackagesArtifact {
  return JSON.parse(fs.readFileSync(PACKAGES_PATH, "utf8")) as PackagesArtifact;
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

function packageText(): string {
  return fs
    .readdirSync(PACKAGE_DIR)
    .filter((file) => file.endsWith(".md") || file.endsWith(".yaml"))
    .sort()
    .map((file) => fs.readFileSync(path.join(PACKAGE_DIR, file), "utf8"))
    .join("\n");
}

describe("HELP-CONTENT-PACKAGE-VALIDATION-01 contract", () => {
  it("locks validation as docs/contracts only", () => {
    const artifact = readValidation();

    expect(artifact.schema_version).toBe("help_content_package_validation.v1");
    expect(artifact.pr_id).toBe("HELP-CONTENT-PACKAGE-VALIDATION-01");
    expect(artifact.decision).toBe("PASS_WITH_NON_PUBLISHABLE_GATES");
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.cms_draft_created).toBe(false);
    expect(artifact.content_rewritten).toBe(false);
    expect(artifact.package_count).toBe(6);
  });

  it("keeps all archived packages non-publishable and CMS-authoritative", () => {
    const packages = readPackages().packages;

    expect(packages).toHaveLength(6);
    for (const item of packages) {
      expect(item.publish_allowed, item.asset_id).toBe(false);
      expect(item.cms_draft_created, item.asset_id).toBe(false);
      expect(item.requires_operator_review, item.asset_id).toBe(true);
      expect(item.requires_cms_authority, item.asset_id).toBe(true);
      expect(Object.keys(item.seo_schema_position).length, item.asset_id).toBeGreaterThan(0);
    }
  });

  it("passes every declared validation rule and records no scan violations", () => {
    const artifact = readValidation();

    expect(artifact.validation_rules.map((rule) => rule.id)).toEqual(
      expect.arrayContaining([
        "no_raw_orderNo_examples",
        "no_raw_payment_id_examples",
        "no_raw_transaction_id_examples",
        "no_raw_result_or_attempt_id_examples",
        "no_full_private_url_examples",
        "no_tokenized_url_examples",
        "no_fake_sla_beyond_operator_policy",
        "no_fake_refund_guarantee",
        "no_unsupported_medical_or_diagnostic_claim",
        "no_competitor_copy_markers",
        "publish_allowed_must_stay_false",
        "operator_review_required",
        "cms_authority_required",
        "seo_schema_position_required",
      ])
    );
    expect(artifact.validation_rules.every((rule) => rule.status === "passed")).toBe(true);
    expect(artifact.scan_violations).toEqual([]);
  });

  it("blocks private URL, token, competitor, and raw identifier examples", () => {
    const text = packageText();

    expect(text).not.toMatch(/\borderNo\s*[=:]/i);
    expect(text).not.toMatch(/\bpayment_id\s*[=:]/i);
    expect(text).not.toMatch(/\btransaction_id\s*[=:]/i);
    expect(text).not.toMatch(/\bresult(Id|_id)?\s*[=:]/i);
    expect(text).not.toMatch(/\battempt(Id|_id)?\s*[=:]/i);
    expect(text).not.toMatch(/https?:\/\/[^\s)]+(?:token|access_token|resultId|orderNo|payment_id|transaction_id)[^\s)]*/i);
    expect(text).not.toMatch(/https?:\/\/[^\s)]*\/(?:result|orders|history|share|pay|payment)(?:\/|\?|$)/i);
    expect(text).not.toMatch(/123test|Truity/i);
  });

  it("allows boundary mentions only as prohibition text", () => {
    const text = packageText();

    expect(text).toContain("Do not include raw `orderNo`");
    expect(text).toContain("private result/order/history/share/payment URL examples");
    expect(text).toContain("forbidden_positive_claims");
    expect(text).toContain("临床级");
  });

  it("keeps publication gates active", () => {
    expect(readValidation().non_publishable_gates).toMatchObject({
      publish_allowed: false,
      requires_operator_review: true,
      requires_cms_authority: true,
      schema_requires_visible_cms_content: true,
      cms_draft_created: false,
    });
  });

  it("keeps the diff inside the authorized package-validation scope", () => {
    const declaredScopeFiles = [
      "docs/content/help/help-content-package-validation.md",
      "docs/content/help/generated/help-content-package-validation.v1.json",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "tests/contracts/help-content-package-validation.contract.test.ts",
    ];

    for (const file of [...new Set([...changedFiles(), ...declaredScopeFiles])].sort()) {
      expect(ALLOWED_FILES.has(file), `${file} is outside HELP-CONTENT-PACKAGE-VALIDATION-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });

  it("records forbidden actions", () => {
    expect(readValidation().forbidden_actions).toEqual(
      expect.arrayContaining([
        "no package rewrite into publish copy",
        "no runtime changes",
        "no CMS draft",
        "no CMS mutation",
        "no private URL access",
        "no real order/result/payment data",
        "no competitor copy",
      ])
    );
  });
});
