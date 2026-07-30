import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const ROOT = process.cwd();
const INVENTORY_DIRECTORY = "generated/en-content-parity/W1-mbti";
const SCRIPT_PATH = "scripts/result-page-agents/validate-mbti-result-content.mjs";
const DOCS_DIRECTORY = "docs/result-page-agents/mbti";
const temporaryDirectories: string[] = [];

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function runValidator(inventory: string) {
  const result = spawnSync(
    process.execPath,
    [SCRIPT_PATH, "--inventory", inventory],
    { cwd: ROOT, encoding: "utf8" },
  );
  return {
    ...result,
    json: JSON.parse(result.stdout || "{}") as Record<string, unknown>,
  };
}

function makeMutableInventory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-result-content-agent-"));
  temporaryDirectories.push(directory);
  for (const file of ["source_ledger.json", "sha256_manifest.json"]) {
    fs.copyFileSync(
      path.join(ROOT, INVENTORY_DIRECTORY, file),
      path.join(directory, file),
    );
  }
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("MBTI English result-content agent gate", () => {
  it("accepts only the exact frozen W1 inventory and reconciles all 46 result rows", () => {
    const result = runValidator(INVENTORY_DIRECTORY);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.json).toMatchObject({
      ok: true,
      package_sha256: "8079465c6ec26820c99ca2be3f08346674e90509dee6d84fd610d5c6bbac2b85",
      result_row_count: 46,
      errors: [],
    });
  });

  it("freezes the 24 controls and 22 producer targets without granting write authority", () => {
    const gate = readJson(`${DOCS_DIRECTORY}/mbti-result-content-gates.v1.json`);
    const counts = gate.expected_counts as Record<string, number>;
    const permissions = gate.permissions as Record<string, boolean>;

    expect(counts).toMatchObject({
      total_package_rows: 53,
      comparison_rows: 7,
      result_rows: 46,
      complete_control: 24,
      structurally_incomplete: 20,
      missing: 1,
      unable_to_confirm: 1,
      producer_target_rows: 22,
    });
    expect(Object.values(permissions)).toEqual(expect.arrayContaining([false]));
    expect(Object.values(permissions).every((permission) => permission === false)).toBe(true);
    expect(gate.frontend_control_row_ids).toHaveLength(4);
    expect(gate.private_safe_qa_pending_row).toMatchObject({
      row_id: "W1-RESULT-SURFACE-02-PDF",
      parity_verdict: "unable_to_confirm",
    });
  });

  it("defines required row fields and excludes private, internal, and SEO properties", () => {
    const schema = readJson(`${DOCS_DIRECTORY}/mbti-result-content-inventory.schema.json`);
    const gate = readJson(`${DOCS_DIRECTORY}/mbti-result-content-gates.v1.json`);
    const forbidden = gate.forbidden_result_row_properties as string[];
    const exclusions = gate.required_private_field_exclusions as string[];
    const serializedSchema = JSON.stringify(schema);

    expect(serializedSchema).toContain("stable_asset_identity");
    expect(serializedSchema).toContain("entitlement_level");
    expect(serializedSchema).toContain("api_projection_field_path");
    expect(serializedSchema).toContain("excluded_private_fields");
    expect(exclusions).toEqual(expect.arrayContaining([
      "attempt_id",
      "report_token",
      "user_scores",
      "orders",
      "payments",
      "answer_key",
      "internal_generation_rules",
      "internal_asset_hashes",
    ]));
    expect(forbidden).toEqual(expect.arrayContaining([
      "attempt_id",
      "report_token",
      "share_token",
      "user_scores",
      "answers",
      "seo_title",
      "canonical_url",
      "json_ld",
      "sitemap",
      "llms",
      "indexability",
      "published_at",
    ]));
  });

  it("fails closed when the frozen ledger digest or row count changes", () => {
    const directory = makeMutableInventory();
    const ledgerPath = path.join(directory, "source_ledger.json");
    const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8")) as {
      rows: Array<Record<string, unknown>>;
    };
    ledger.rows.pop();
    fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

    const result = runValidator(directory);
    expect(result.status).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors).toEqual(expect.arrayContaining([
      "source_ledger.json digest does not match the frozen SHA manifest",
      "package row count must equal 53",
    ]));
  });

  it("fails closed on private properties and claim-boundary drift", () => {
    const directory = makeMutableInventory();
    const ledgerPath = path.join(directory, "source_ledger.json");
    const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8")) as {
      rows: Array<Record<string, unknown>>;
    };
    const resultRow = ledger.rows.find(
      (row) => row.asset_id === "ENPARITY-W1-MBTI-RESULT-CONTENT",
    );
    expect(resultRow).toBeTruthy();
    if (!resultRow) {
      return;
    }
    resultRow.attempt_id = "forbidden-private-value";
    resultRow.claim_boundary_verdict = "deterministic_identity_claim";
    fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

    const result = runValidator(directory);
    expect(result.status).toBe(1);
    expect(result.json.errors).toEqual(expect.arrayContaining([
      `${resultRow.row_id} contains forbidden property attempt_id`,
      `${resultRow.row_id} must retain the MBTI preference claim boundary`,
    ]));
  });

  it("documents backend authority and keeps runtime, CMS, SEO, and deployment actions denied", () => {
    const readme = fs.readFileSync(path.join(ROOT, DOCS_DIRECTORY, "README.md"), "utf8");
    const runbook = fs.readFileSync(
      path.join(ROOT, DOCS_DIRECTORY, "mbti-result-content-agent.runbook.md"),
      "utf8",
    );

    expect(readme).toContain("Backend `fap-api` remains the content authority");
    expect(readme).toContain("It is not W9 QA");
    expect(runbook).toContain("The validator never makes network calls");
    expect(runbook).toContain("must preserve all 24 `complete_control` rows");
    expect(runbook).toContain("must not regenerate the existing public 32 A/T personality profiles");
    expect(runbook).toContain("CMS or database writes");
    expect(runbook).toContain("canonical, metadata, JSON-LD, noindex, sitemap, hreflang, llms, or indexability changes");
    expect(runbook).toContain("Repository Rule Impact");
  });
});
