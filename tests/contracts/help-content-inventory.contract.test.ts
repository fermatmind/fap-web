import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile, isHelpContentInventory01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/operations/generated/help-content-inventory.v1.json");

type InventoryArtifact = {
  schema_version: string;
  run_mode: string;
  content_generated: boolean;
  runtime_changed: boolean;
  cms_mutation: boolean;
  decision: string;
  themes: Array<{ theme: string; field_gaps: string[] }>;
  required_pages: Array<{ page: string }>;
  field_needs: Array<{ field: string; notes: string }>;
  gpt_input_requirements: Array<{
    request_card_id: string;
    publish_ready_copy_allowed: boolean;
    must_not_include: string[];
  }>;
  forbidden_actions: string[];
};

function readArtifact(): InventoryArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as InventoryArtifact;
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

describe("HELP-CONTENT-INVENTORY-01 contract", () => {
  it("parses JSON and locks the run as inventory/contract only", () => {
    const artifact = readArtifact();

    expect(artifact.schema_version).toBe("help_content_inventory.v1");
    expect(artifact.run_mode).toBe("contract");
    expect(artifact.content_generated).toBe(false);
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(["NO_GO", "CONDITIONAL"]).toContain(artifact.decision);
    expect(artifact.decision).not.toBe("GO");
  });

  it("covers the required service trust themes", () => {
    const themes = readArtifact().themes.map((theme) => theme.theme);

    expect(themes).toEqual(
      expect.arrayContaining([
        "payment",
        "refund",
        "unlock_failure",
        "result_recovery",
        "privacy",
        "non_diagnostic",
        "contact_support",
        "data_deletion",
      ])
    );
  });

  it("covers the required Help pages without writing page copy", () => {
    const pages = readArtifact().required_pages.map((page) => page.page);

    expect(pages).toEqual(
      expect.arrayContaining([
        "Payment FAQ",
        "Refund FAQ",
        "Unlock failure",
        "Result recovery",
        "Privacy",
        "Non-diagnostic",
        "Contact support",
      ])
    );
  });

  it("records must-have field needs for policy, support, and PII gates", () => {
    const fields = readArtifact().field_needs.map((field) => field.field);

    expect(fields).toEqual(
      expect.arrayContaining([
        "refund_eligibility",
        "refund_exclusions",
        "handling_time",
        "required_user_info",
        "pii_minimization_notice",
        "support_contact",
        "policy_version",
      ])
    );
  });

  it("keeps GPT request inputs non-publishable and free of draft content", () => {
    const artifact = readArtifact();

    expect(artifact.gpt_input_requirements.map((card) => card.request_card_id)).toEqual(
      expect.arrayContaining([
        "PAYMENT-REFUND-FAQ-PACKAGE-01",
        "RESULT-FAQ-PACKAGE-01",
        "PRIVACY-FAQ-PACKAGE-01",
        "NONDIAGNOSTIC-HELP-COPY-01",
        "UNLOCK-FAILURE-HELP-CARD-01",
        "DATA-DELETION-REQUEST-FAQ-01",
        "RESULT-RECOVERY-FAQ-01",
      ])
    );
    expect(artifact.gpt_input_requirements.every((card) => card.publish_ready_copy_allowed === false)).toBe(true);

    const serialized = JSON.stringify(artifact.gpt_input_requirements).toLowerCase();
    expect(serialized).not.toContain("final copy");
    expect(serialized).not.toContain("publish-ready faq");
    expect(serialized).not.toContain("refund policy body");
  });

  it("records explicit forbidden actions", () => {
    expect(readArtifact().forbidden_actions).toEqual(
      expect.arrayContaining([
        "no content generation",
        "no runtime edits",
        "no CMS mutation",
        "no publish",
        "no private URL access",
        "no raw payment/order IDs",
      ])
    );
  });

  it("keeps current PR scope limited to docs/operations, docs/codex, and tests/contracts", () => {
    const files = changedFiles();
    if (files.length > 0 && files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    const declaredScopeFiles = [
      "docs/operations/help-content-inventory.md",
      "docs/operations/generated/help-content-inventory.v1.json",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "tests/contracts/help-content-inventory.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
    ];

    for (const file of [...new Set([...files, ...declaredScopeFiles])].sort()) {
      expect(isHelpContentInventory01AllowedFile(file), `${file} is outside HELP-CONTENT-INVENTORY-01 scope`).toBe(
        true
      );
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });
});
