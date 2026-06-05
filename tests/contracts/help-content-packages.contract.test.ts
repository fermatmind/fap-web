import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/content/help/generated/help-content-packages.v1.json");
const PACKAGES_DIR = path.join(ROOT, "docs/content/help/packages");
const HELP_CONTENT_PACKAGES_ARCHIVE_01_ALLOWED_FILES = new Set([
  "docs/content/help/README.md",
  "docs/content/help/help-content-packages-archive.md",
  "docs/content/help/index.source.json",
  "docs/content/help/generated/help-content-packages.v1.json",
  "docs/content/help/packages/01_UNLOCK-FAILURE-HELP-CARD-01.md",
  "docs/content/help/packages/01_UNLOCK-FAILURE-HELP-CARD-01.yaml",
  "docs/content/help/packages/02_PAYMENT-REFUND-FAQ-PACKAGE-01.md",
  "docs/content/help/packages/02_PAYMENT-REFUND-FAQ-PACKAGE-01.yaml",
  "docs/content/help/packages/03_RESULT-RECOVERY-FAQ-01.md",
  "docs/content/help/packages/03_RESULT-RECOVERY-FAQ-01.yaml",
  "docs/content/help/packages/04_PRIVACY-FAQ-PACKAGE-01.md",
  "docs/content/help/packages/04_PRIVACY-FAQ-PACKAGE-01.yaml",
  "docs/content/help/packages/05_NONDIAGNOSTIC-HELP-COPY-01.md",
  "docs/content/help/packages/05_NONDIAGNOSTIC-HELP-COPY-01.yaml",
  "docs/content/help/packages/06_DATA-DELETION-REQUEST-FAQ-01.md",
  "docs/content/help/packages/06_DATA-DELETION-REQUEST-FAQ-01.yaml",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/help-content-packages.contract.test.ts",
]);

type HelpContentPackagesArtifact = {
  schema_version: string;
  run_mode: string;
  decision: string;
  publish_allowed: boolean;
  cms_draft_created: boolean;
  runtime_changed: boolean;
  cms_mutation: boolean;
  content_generated_by_codex: boolean;
  operator_policy_applied: boolean;
  requires_operator_review: boolean;
  requires_cms_authority: boolean;
  operator_policy: {
    refund_allowed: boolean;
    refund_window_days: number;
    refund_condition: string;
    unlock_failure_sla: string;
    support_channel: string;
    result_retention: string;
    result_recovery_method: string;
    data_deletion_allowed: boolean;
    account_deletion_allowed: boolean;
    locale_policy: string;
    order_identifier_policy: string;
  };
  package_count: number;
  packages: Array<{
    asset_id: string;
    publish_allowed: boolean;
    cms_draft_created: boolean;
    runtime_changed: boolean;
    content_generated_by_codex: boolean;
    operator_policy_applied: boolean;
    requires_operator_review: boolean;
    requires_cms_authority: boolean;
    recommended_routes: string[];
    source_files: {
      markdown: string;
      yaml: string;
    };
  }>;
  forbidden_actions: string[];
};

function readArtifact(): HelpContentPackagesArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as HelpContentPackagesArtifact;
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

describe("HELP-CONTENT-PACKAGES-ARCHIVE-01 contract", () => {
  it("locks the package archive as non-publishable and non-runtime", () => {
    const artifact = readArtifact();

    expect(artifact.schema_version).toBe("help_content_packages.v1");
    expect(artifact.run_mode).toBe("archive_contract_only");
    expect(artifact.decision).toBe("NO_GO_TO_PUBLISH");
    expect(artifact.publish_allowed).toBe(false);
    expect(artifact.cms_draft_created).toBe(false);
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.content_generated_by_codex).toBe(false);
    expect(artifact.operator_policy_applied).toBe(true);
    expect(artifact.requires_operator_review).toBe(true);
    expect(artifact.requires_cms_authority).toBe(true);
  });

  it("archives exactly the six requested package ids", () => {
    const artifact = readArtifact();

    expect(artifact.package_count).toBe(6);
    expect(artifact.packages.map((item) => item.asset_id).sort()).toEqual([
      "DATA-DELETION-REQUEST-FAQ-01",
      "NONDIAGNOSTIC-HELP-COPY-01",
      "PAYMENT-REFUND-FAQ-PACKAGE-01",
      "PRIVACY-FAQ-PACKAGE-01",
      "RESULT-RECOVERY-FAQ-01",
      "UNLOCK-FAILURE-HELP-CARD-01",
    ]);
  });

  it("requires every package to stay draft-only and CMS-authoritative", () => {
    for (const item of readArtifact().packages) {
      expect(item.publish_allowed, item.asset_id).toBe(false);
      expect(item.cms_draft_created, item.asset_id).toBe(false);
      expect(item.runtime_changed, item.asset_id).toBe(false);
      expect(item.content_generated_by_codex, item.asset_id).toBe(false);
      expect(item.operator_policy_applied, item.asset_id).toBe(true);
      expect(item.requires_operator_review, item.asset_id).toBe(true);
      expect(item.requires_cms_authority, item.asset_id).toBe(true);
      expect(item.recommended_routes.every((route) => route.startsWith("/zh/help/") || route.startsWith("/en/help/"))).toBe(
        true
      );
    }
  });

  it("records the operator policy without granting publish authority", () => {
    const policy = readArtifact().operator_policy;

    expect(policy.refund_allowed).toBe(true);
    expect(policy.refund_window_days).toBe(7);
    expect(policy.refund_condition).toBe("无法获得完整报告");
    expect(policy.unlock_failure_sla).toBe("24h");
    expect(policy.support_channel).toBe("email");
    expect(policy.result_retention).toBe("2 years");
    expect(policy.result_recovery_method).toBe("email");
    expect(policy.data_deletion_allowed).toBe(true);
    expect(policy.account_deletion_allowed).toBe(true);
    expect(policy.locale_policy).toBe("zh/en same");
    expect(policy.order_identifier_policy).toContain("email-first");
  });

  it("keeps archived source files present and referenced under docs/content/help", () => {
    const artifact = readArtifact();

    for (const item of artifact.packages) {
      for (const sourceFile of Object.values(item.source_files)) {
        expect(sourceFile.startsWith("docs/content/help/packages/"), sourceFile).toBe(true);
        expect(fs.existsSync(path.join(ROOT, sourceFile)), sourceFile).toBe(true);
      }
    }

    const archivedFiles = fs.readdirSync(PACKAGES_DIR).filter((file) => file.endsWith(".md") || file.endsWith(".yaml"));
    expect(archivedFiles).toHaveLength(12);
  });

  it("records explicit forbidden actions for this archive", () => {
    expect(readArtifact().forbidden_actions).toEqual(
      expect.arrayContaining([
        "no publishable FAQ copy",
        "no CMS draft",
        "no runtime edits",
        "no private URL access",
        "no raw identifiers",
        "no competitor copy",
      ])
    );
  });

  it("keeps current PR scope limited to help docs, docs/codex, and contracts", () => {
    const files = changedFiles();
    if (files.length > 0 && files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    const declaredScopeFiles = [
      "docs/content/help/README.md",
      "docs/content/help/help-content-packages-archive.md",
      "docs/content/help/index.source.json",
      "docs/content/help/generated/help-content-packages.v1.json",
      "docs/content/help/packages/01_UNLOCK-FAILURE-HELP-CARD-01.md",
      "docs/content/help/packages/01_UNLOCK-FAILURE-HELP-CARD-01.yaml",
      "docs/content/help/packages/02_PAYMENT-REFUND-FAQ-PACKAGE-01.md",
      "docs/content/help/packages/02_PAYMENT-REFUND-FAQ-PACKAGE-01.yaml",
      "docs/content/help/packages/03_RESULT-RECOVERY-FAQ-01.md",
      "docs/content/help/packages/03_RESULT-RECOVERY-FAQ-01.yaml",
      "docs/content/help/packages/04_PRIVACY-FAQ-PACKAGE-01.md",
      "docs/content/help/packages/04_PRIVACY-FAQ-PACKAGE-01.yaml",
      "docs/content/help/packages/05_NONDIAGNOSTIC-HELP-COPY-01.md",
      "docs/content/help/packages/05_NONDIAGNOSTIC-HELP-COPY-01.yaml",
      "docs/content/help/packages/06_DATA-DELETION-REQUEST-FAQ-01.md",
      "docs/content/help/packages/06_DATA-DELETION-REQUEST-FAQ-01.yaml",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "tests/contracts/help-content-packages.contract.test.ts",
    ];

    for (const file of [...new Set([...files, ...declaredScopeFiles])].sort()) {
      expect(HELP_CONTENT_PACKAGES_ARCHIVE_01_ALLOWED_FILES.has(file), `${file} is outside scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });
});
