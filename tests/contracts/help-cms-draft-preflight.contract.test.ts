import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/operations/generated/help-cms-draft-preflight.v1.json");
const ALLOWED_FILES = new Set([
  "docs/operations/help-cms-draft-preflight.md",
  "docs/operations/generated/help-cms-draft-preflight.v1.json",
  "tests/contracts/help-cms-draft-preflight.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

type PreflightArtifact = {
  schema_version: string;
  pr_id: string;
  decision: string;
  runtime_changed: boolean;
  cms_mutation: boolean;
  cms_draft_created: boolean;
  publish_attempted: boolean;
  content_generated: boolean;
  package_count: number;
  checks: Array<{ check: string; status: string; gap?: string }>;
  blocking_gaps: string[];
  draft_creation_authorization_prompt: string;
  forbidden_actions: string[];
};

function readArtifact(): PreflightArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as PreflightArtifact;
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

describe("HELP-CMS-DRAFT-PREFLIGHT-01 contract", () => {
  it("blocks CMS draft creation while keeping the run read-only", () => {
    const artifact = readArtifact();

    expect(artifact.schema_version).toBe("help_cms_draft_preflight.v1");
    expect(artifact.pr_id).toBe("HELP-CMS-DRAFT-PREFLIGHT-01");
    expect(artifact.decision).toBe("NO_GO_TO_CMS_DRAFT");
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.cms_draft_created).toBe(false);
    expect(artifact.publish_attempted).toBe(false);
    expect(artifact.content_generated).toBe(false);
    expect(artifact.package_count).toBe(6);
  });

  it("records all required preflight checks", () => {
    const checks = new Map(readArtifact().checks.map((check) => [check.check, check.status]));

    expect(checks.get("required CMS fields present")).toBe("failed");
    expect(checks.get("slug plan exists")).toBe("passed");
    expect(checks.get("locale plan exists")).toBe("passed");
    expect(checks.get("robots/indexability plan exists")).toBe("partial");
    expect(checks.get("schema plan exists")).toBe("partial");
    expect(checks.get("support email policy exists")).toBe("failed");
    expect(checks.get("operator policies recorded")).toBe("passed");
    expect(checks.get("no private URL in packages")).toBe("passed");
    expect(checks.get("operator review required before publish")).toBe("passed");
    expect(checks.get("CMS/backend authority required")).toBe("passed");
  });

  it("keeps Unknown support/email and field gaps as blockers", () => {
    expect(readArtifact().blocking_gaps).toEqual(
      expect.arrayContaining([
        "support_email Unknown",
        "faq_items not first-class structured CMS field",
        "schema_enabled not first-class CMS field",
        "policy_version not first-class CMS field",
        "support_contact not first-class CMS field",
        "handling_time not first-class CMS field",
        "robots field not first-class CMS field",
        "unlock_failure support_intent not available as a structured intent",
      ])
    );
  });

  it("provides an exact future authorization prompt without granting publish authority", () => {
    const prompt = readArtifact().draft_creation_authorization_prompt;

    expect(prompt).toContain("Authorize HELP-CONTENT-DRAFT-CREATE-01");
    expect(prompt).toContain("explicitly allow CMS draft creation");
    expect(prompt).toContain("prohibit publish");
    expect(prompt).toContain("private URL access");
    expect(prompt).toContain("raw order/payment/result identifiers");
  });

  it("keeps the diff inside the authorized draft-preflight scope", () => {
    const declaredScopeFiles = [
      "docs/operations/help-cms-draft-preflight.md",
      "docs/operations/generated/help-cms-draft-preflight.v1.json",
      "tests/contracts/help-cms-draft-preflight.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of [...new Set([...changedFiles(), ...declaredScopeFiles])].sort()) {
      expect(ALLOWED_FILES.has(file), `${file} is outside HELP-CMS-DRAFT-PREFLIGHT-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });

  it("records forbidden actions", () => {
    expect(readArtifact().forbidden_actions).toEqual(
      expect.arrayContaining([
        "no CMS write",
        "no draft create",
        "no publish",
        "no runtime changes",
        "no private URL access",
        "no raw order/payment/result identifiers",
      ])
    );
  });
});
