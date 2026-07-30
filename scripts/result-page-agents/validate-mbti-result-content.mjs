#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../..");
const GATE_PATH = path.join(
  ROOT,
  "docs/result-page-agents/mbti/mbti-result-content-gates.v1.json",
);
const SCHEMA_PATH = path.join(
  ROOT,
  "docs/result-page-agents/mbti/mbti-result-content-inventory.schema.json",
);

function failUsage(message) {
  process.stderr.write(`${message}\n`);
  process.stderr.write(
    "Usage: node scripts/result-page-agents/validate-mbti-result-content.mjs --inventory <package-directory-or-source-ledger>\n",
  );
  process.exit(2);
}

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      failUsage(`Unexpected argument: ${arg}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      failUsage(`Missing value for ${arg}`);
    }
    args.set(arg, value);
    index += 1;
  }
  if (!args.has("--inventory")) {
    failUsage("Missing required --inventory argument.");
  }
  if ([...args.keys()].some((key) => key !== "--inventory")) {
    failUsage("Only --inventory is supported.");
  }
  return args;
}

function readJson(filePath, errors, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${label} is not readable JSON: ${error.message}`);
    return null;
  }
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function collectObjectKeys(value, found = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectObjectKeys(item, found);
    }
    return found;
  }
  if (!isPlainObject(value)) {
    return found;
  }
  for (const [key, nested] of Object.entries(value)) {
    found.add(key.toLowerCase());
    collectObjectKeys(nested, found);
  }
  return found;
}

function countBy(values) {
  const counts = {};
  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

const args = parseArgs(process.argv.slice(2));
const requestedPath = path.resolve(process.cwd(), args.get("--inventory"));
const inventoryDirectory = fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()
  ? requestedPath
  : path.dirname(requestedPath);
const ledgerPath = fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()
  ? path.join(requestedPath, "source_ledger.json")
  : requestedPath;
const shaManifestPath = path.join(inventoryDirectory, "sha256_manifest.json");
const errors = [];

const gate = readJson(GATE_PATH, errors, "gate contract");
const schema = readJson(SCHEMA_PATH, errors, "inventory schema");
const ledger = readJson(ledgerPath, errors, "source ledger");
const shaManifest = readJson(shaManifestPath, errors, "SHA manifest");

if (gate && schema && ledger && shaManifest) {
  const schemaRequired = new Set(schema.required ?? []);
  for (const field of ["schema_version", "control_id", "lane_id", "package_id", "reconciliation", "rows"]) {
    if (!schemaRequired.has(field)) {
      errors.push(`inventory schema does not require ${field}`);
    }
    if (!(field in ledger)) {
      errors.push(`source ledger is missing required field ${field}`);
    }
  }

  for (const [field, expected] of [
    ["control_id", gate.control_id],
    ["lane_id", gate.lane_id],
    ["package_id", gate.package_id],
  ]) {
    if (ledger[field] !== expected) {
      errors.push(`${field} must equal ${expected}`);
    }
  }

  if (shaManifest.package_id !== gate.package_id) {
    errors.push(`SHA manifest package_id must equal ${gate.package_id}`);
  }
  if (shaManifest.package_sha256 !== gate.package_sha256) {
    errors.push(`package SHA must equal frozen SHA ${gate.package_sha256}`);
  }

  const ledgerManifestEntry = Array.isArray(shaManifest.files)
    ? shaManifest.files.find((entry) => entry?.path === "source_ledger.json")
    : null;
  if (!ledgerManifestEntry?.sha256) {
    errors.push("SHA manifest must register source_ledger.json");
  } else if (fs.existsSync(ledgerPath) && sha256(ledgerPath) !== ledgerManifestEntry.sha256) {
    errors.push("source_ledger.json digest does not match the frozen SHA manifest");
  }

  const rows = Array.isArray(ledger.rows) ? ledger.rows : [];
  const resultRows = rows.filter((row) => row?.asset_id === gate.asset_id);
  const comparisonRows = rows.length - resultRows.length;
  const expected = gate.expected_counts;

  if (rows.length !== expected.total_package_rows) {
    errors.push(`package row count must equal ${expected.total_package_rows}`);
  }
  if (comparisonRows !== expected.comparison_rows) {
    errors.push(`comparison row count must equal ${expected.comparison_rows}`);
  }
  if (resultRows.length !== expected.result_rows) {
    errors.push(`result row count must equal ${expected.result_rows}`);
  }

  const rowIds = resultRows.map((row) => row.row_id);
  const identities = resultRows.map((row) => row.stable_asset_identity);
  if (new Set(rowIds).size !== resultRows.length) {
    errors.push("result row_id values must be unique");
  }
  if (new Set(identities).size !== resultRows.length) {
    errors.push("result stable_asset_identity values must be unique");
  }

  const forbiddenKeys = new Set(gate.forbidden_result_row_properties.map((value) => value.toLowerCase()));
  const allowedVerdicts = new Set(gate.allowed_parity_verdicts);
  const allowedLeakage = new Set(gate.allowed_chinese_leakage_verdicts);
  const requiredExclusions = new Set(gate.required_private_field_exclusions);
  const frontendControlRows = new Set(gate.frontend_control_row_ids);
  const privateSafeQaPendingRow = gate.private_safe_qa_pending_row;

  for (const [index, row] of resultRows.entries()) {
    const label = row?.row_id || `result row ${index + 1}`;
    if (!isPlainObject(row)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    for (const field of gate.required_result_row_fields) {
      if (!(field in row)) {
        errors.push(`${label} is missing required field ${field}`);
      }
    }
    if (row.source_locale !== "zh-CN" || row.target_locale !== "en") {
      errors.push(`${label} must retain zh-CN to en locale direction`);
    }
    if (frontendControlRows.has(label)) {
      if (row.proposed_owning_repository !== "fap-web" || row.parity_verdict !== "complete_control") {
        errors.push(`${label} must remain a complete fap-web product-code control`);
      }
    } else if (row.proposed_owning_repository !== gate.authority_repository) {
      errors.push(`${label} must remain owned by ${gate.authority_repository}`);
    }
    if (!allowedVerdicts.has(row.parity_verdict)) {
      errors.push(`${label} has unsupported parity_verdict ${row.parity_verdict}`);
    }
    if (label === privateSafeQaPendingRow.row_id) {
      for (const field of ["claim_boundary_verdict", "reader_visible_chinese_leakage", "parity_verdict"]) {
        if (row[field] !== privateSafeQaPendingRow[field]) {
          errors.push(`${label} must retain its independent private-safe QA hold`);
        }
      }
    } else if (row.claim_boundary_verdict !== gate.required_claim_boundary_verdict) {
      errors.push(`${label} must retain the MBTI preference claim boundary`);
    }
    if (!allowedLeakage.has(row.reader_visible_chinese_leakage)) {
      errors.push(`${label} does not pass the reader-visible Chinese leakage gate`);
    }
    if (!Array.isArray(row.source_evidence) || row.source_evidence.length === 0) {
      errors.push(`${label} must retain non-empty source evidence`);
    }
    const exclusions = new Set(Array.isArray(row.excluded_private_fields) ? row.excluded_private_fields : []);
    for (const exclusion of requiredExclusions) {
      if (!exclusions.has(exclusion)) {
        errors.push(`${label} is missing private-field exclusion ${exclusion}`);
      }
    }
    const rowKeys = collectObjectKeys(row);
    for (const forbidden of forbiddenKeys) {
      if (rowKeys.has(forbidden)) {
        errors.push(`${label} contains forbidden property ${forbidden}`);
      }
    }
  }

  const verdictCounts = countBy(resultRows.map((row) => row.parity_verdict));
  for (const verdict of gate.allowed_parity_verdicts) {
    if ((verdictCounts[verdict] ?? 0) !== expected[verdict]) {
      errors.push(`${verdict} count must equal ${expected[verdict]}`);
    }
  }
  const producerTargets =
    (verdictCounts.structurally_incomplete ?? 0)
    + (verdictCounts.missing ?? 0)
    + (verdictCounts.unable_to_confirm ?? 0);
  if (producerTargets !== expected.producer_target_rows) {
    errors.push(`producer target row count must equal ${expected.producer_target_rows}`);
  }

  const reconciliation = ledger.reconciliation ?? {};
  if (
    reconciliation.total_rows !== expected.total_package_rows
    || reconciliation.comparison_rows !== expected.comparison_rows
    || reconciliation.result_content_rows !== expected.result_rows
    || reconciliation.result_expected_equals_current_plus_remaining !== "46 = 24 + 22"
  ) {
    errors.push("source ledger reconciliation must retain 53 total, 7 comparison, and 46 = 24 + 22 result counts");
  }
  for (const verdict of gate.allowed_parity_verdicts) {
    if (reconciliation.result_verdict_counts?.[verdict] !== expected[verdict]) {
      errors.push(`reconciliation ${verdict} count must equal ${expected[verdict]}`);
    }
  }

  const permissions = gate.permissions ?? {};
  const authorizedPermission = Object.entries(permissions).find(([, value]) => value !== false);
  if (authorizedPermission) {
    errors.push(`gate permission ${authorizedPermission[0]} must remain false`);
  }
}

const output = {
  ok: errors.length === 0,
  gate: path.relative(ROOT, GATE_PATH),
  schema: path.relative(ROOT, SCHEMA_PATH),
  inventory: path.relative(ROOT, ledgerPath),
  package_sha256: shaManifest?.package_sha256 ?? null,
  result_row_count: Array.isArray(ledger?.rows)
    ? ledger.rows.filter((row) => row?.asset_id === gate?.asset_id).length
    : 0,
  errors,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
process.exit(errors.length === 0 ? 0 : 1);
