import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/operations/generated/help-schema-gate.v1.json");
const ALLOWED_FILES = new Set([
  "docs/operations/help-schema-gate.md",
  "docs/operations/generated/help-schema-gate.v1.json",
  "tests/contracts/help-schema-gate.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

type SchemaGateArtifact = {
  schema_version: string;
  pr_id: string;
  decision: string;
  runtime_changed: boolean;
  cms_mutation: boolean;
  content_generated: boolean;
  rules: Array<{ id: string; status: string; rule?: string; required_fields?: string[] }>;
  current_state: Record<string, unknown>;
  page_schema_positions: Array<{ page: string; schema: string }>;
  forbidden_actions: string[];
};

function readArtifact(): SchemaGateArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as SchemaGateArtifact;
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

describe("HELP-SCHEMA-GATE-01 contract", () => {
  it("keeps schema gate as docs/contracts only", () => {
    const artifact = readArtifact();

    expect(artifact.schema_version).toBe("help_schema_gate.v1");
    expect(artifact.pr_id).toBe("HELP-SCHEMA-GATE-01");
    expect(artifact.decision).toBe("CONDITIONAL_SCHEMA_BLOCKED_UNTIL_VISIBLE_CMS_FIELDS");
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.content_generated).toBe(false);
  });

  it("requires FAQ schema to match visible CMS/backend content", () => {
    const rules = new Map(readArtifact().rules.map((rule) => [rule.id, rule]));

    expect(rules.get("faq_schema_visible_content_only")?.rule).toContain("visibly rendered");
    expect(rules.get("no_hidden_faq_items")?.rule).toContain("hidden-only");
    expect(rules.get("no_private_url_examples")?.rule).toContain("private result/order/share/pay/payment/history URLs");
    expect(rules.get("no_raw_identifiers")?.rule).toContain("raw orderNo");
    expect(rules.get("unknown_fields_stay_unknown")?.rule).toContain("must remain Unknown");
  });

  it("requires policy fields before service Help schema is enabled", () => {
    const policyRule = readArtifact().rules.find((rule) => rule.id === "policy_fields_required");

    expect(policyRule?.required_fields).toEqual(expect.arrayContaining(["policy_version", "updated_at", "reviewer"]));
  });

  it("records current schema blockers", () => {
    const state = readArtifact().current_state;

    expect(state.faq_items_first_class).toBe(false);
    expect(state.schema_enabled_field_available).toBe(false);
    expect(state.policy_version_available).toBe(false);
  });

  it("blocks schema for each required service Help page family", () => {
    const positions = readArtifact().page_schema_positions;

    expect(positions.map((position) => position.page)).toEqual(
      expect.arrayContaining([
        "Payment/refund FAQ",
        "Unlock failure",
        "Result recovery",
        "Privacy",
        "Non-diagnostic",
        "Data deletion",
      ])
    );
    expect(positions.every((position) => position.schema.toLowerCase().includes("blocked"))).toBe(true);
  });

  it("keeps the diff inside the authorized schema-gate scope", () => {
    const files = changedFiles();
    if (files.length > 0 && files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    const declaredScopeFiles = [
      "docs/operations/help-schema-gate.md",
      "docs/operations/generated/help-schema-gate.v1.json",
      "tests/contracts/help-schema-gate.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of [...new Set([...files, ...declaredScopeFiles])].sort()) {
      expect(ALLOWED_FILES.has(file), `${file} is outside HELP-SCHEMA-GATE-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });

  it("records forbidden actions", () => {
    expect(readArtifact().forbidden_actions).toEqual(
      expect.arrayContaining([
        "no runtime schema change",
        "no CMS mutation",
        "no content generation",
        "no publish",
        "no private URL examples",
        "no raw order/payment/result identifiers",
      ])
    );
  });
});
