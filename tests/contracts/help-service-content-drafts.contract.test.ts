import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/content/help/generated/help-service-content-drafts.v1.json");
const SERVICE_DRAFTS_DIR = path.join(ROOT, "docs/content/help/service-drafts");
const ALLOWED_PREFIXES = ["docs/content/help/service-drafts/"];
const ALLOWED_FILES = new Set([
  "docs/content/help/generated/help-service-content-drafts.v1.json",
  "tests/contracts/help-service-content-drafts.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const REQUIRED_PACKAGES = [
  "UNLOCK-FAILURE-HELP-CARD-01",
  "PAYMENT-REFUND-FAQ-PACKAGE-01",
  "RESULT-RECOVERY-FAQ-01",
  "PRIVACY-FAQ-PACKAGE-01",
  "NONDIAGNOSTIC-HELP-COPY-01",
  "DATA-DELETION-REQUEST-FAQ-01",
];

type HelpServiceDraftsArtifact = {
  schema_version: string;
  pr_id: string;
  decision: string;
  source_zip: string;
  support_email: string;
  package_count: number;
  required_packages_present: boolean;
  missing_packages: string[];
  publish_allowed: boolean;
  requires_operator_review: boolean;
  cms_draft_created: boolean;
  content_status: string;
  content_owner: string;
  final_authority: string;
  runtime_changed: boolean;
  cms_mutation: boolean;
  content_rewritten: boolean;
  packages: Array<{
    asset_id: string;
    markdown: string;
    yaml: string;
    publish_allowed: boolean;
    requires_operator_review: boolean;
    cms_draft_created: boolean;
    content_status: string;
    content_owner: string;
    final_authority: string;
    support_email: string;
  }>;
  forbidden_actions: string[];
};

function readArtifact(): HelpServiceDraftsArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as HelpServiceDraftsArtifact;
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

describe("HELP-SERVICE-CONTENT-DRAFTS-ARCHIVE-01 contract", () => {
  it("archives the uploaded service drafts as draft-only non-publishable assets", () => {
    const artifact = readArtifact();

    expect(artifact.schema_version).toBe("help_service_content_drafts.v1");
    expect(artifact.pr_id).toBe("HELP-SERVICE-CONTENT-DRAFTS-ARCHIVE-01");
    expect(artifact.decision).toBe("ARCHIVED_DRAFT_ONLY_NON_PUBLISHABLE");
    expect(artifact.source_zip).toBe("<uploaded_zip>/fermatmind-help-service-content-drafts-01.zip");
    expect(artifact.support_email).toBe("support@fermatmind.com");
    expect(artifact.publish_allowed).toBe(false);
    expect(artifact.requires_operator_review).toBe(true);
    expect(artifact.cms_draft_created).toBe(false);
    expect(artifact.content_status).toBe("draft_only");
    expect(artifact.content_owner).toBe("GPT-5.5 Pro");
    expect(artifact.final_authority).toBe("CMS/backend");
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.content_rewritten).toBe(false);
  });

  it("contains exactly the six required Help service draft packages", () => {
    const artifact = readArtifact();

    expect(artifact.package_count).toBe(6);
    expect(artifact.required_packages_present).toBe(true);
    expect(artifact.missing_packages).toEqual([]);
    expect(artifact.packages.map((item) => item.asset_id).sort()).toEqual([...REQUIRED_PACKAGES].sort());
  });

  it("keeps package metadata aligned with the support and authority boundary", () => {
    for (const packageItem of readArtifact().packages) {
      expect(packageItem.publish_allowed).toBe(false);
      expect(packageItem.requires_operator_review).toBe(true);
      expect(packageItem.cms_draft_created).toBe(false);
      expect(packageItem.content_status).toBe("draft_only");
      expect(packageItem.content_owner).toBe("GPT-5.5 Pro");
      expect(packageItem.final_authority).toBe("CMS/backend");
      expect(packageItem.support_email).toBe("support@fermatmind.com");

      for (const relativePath of [packageItem.markdown, packageItem.yaml]) {
        const raw = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
        expect(raw).toContain("support_email: support@fermatmind.com");
        expect(raw).toContain("content_owner: GPT-5.5 Pro");
        expect(raw).toContain("final_authority: CMS/backend");
      }
    }
  });

  it("stores the source index with support email fixed to the approved address", () => {
    const sourceIndex = JSON.parse(fs.readFileSync(path.join(SERVICE_DRAFTS_DIR, "index.source.json"), "utf8")) as {
      support_email?: string;
      packages?: Array<{ support_email?: string }>;
    };

    expect(sourceIndex.support_email).toBe("support@fermatmind.com");
    expect(sourceIndex.packages?.every((item) => item.support_email === "support@fermatmind.com")).toBe(true);
  });

  it("keeps the diff inside the authorized archive scope", () => {
    const declaredScopeFiles = [
      "docs/content/help/service-drafts/README.md",
      "docs/content/help/service-drafts/index.source.json",
      "docs/content/help/generated/help-service-content-drafts.v1.json",
      "tests/contracts/help-service-content-drafts.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of [...new Set([...changedFiles(), ...declaredScopeFiles])].sort()) {
      expect(isAllowedFile(file), `${file} is outside HELP-SERVICE-CONTENT-DRAFTS-ARCHIVE-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });

  it("records forbidden actions", () => {
    expect(readArtifact().forbidden_actions).toEqual(
      expect.arrayContaining([
        "no publish",
        "no CMS mutation",
        "no CMS draft creation",
        "no private URL access",
        "no raw order/payment/result identifiers",
        "no competitor copy",
        "no content rewrite",
      ])
    );
  });
});
