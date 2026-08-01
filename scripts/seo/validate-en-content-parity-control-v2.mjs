#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  RELEASE_POLICY,
  V2_ORDERED_STATES,
  buildV2,
  canonicalJson,
  mapV1Status,
  sha256Bytes,
} from "./build-en-content-parity-control-v2.mjs";

const ROOT = process.cwd();
const V1_PATH = "docs/seo/generated/en-content-parity-control-master.v1.json";
const V2_PATH = "docs/seo/generated/en-content-parity-control-master.v2.json";
const V2_SCHEMA_PATH = "docs/seo/generated/en-content-parity-control-master.v2.schema.json";
const RECEIPT_KINDS = ["cms_draft_import_receipt", "cms_publication_receipt", "cms_live_qa_receipt"];
const RECEIPT_PHASES = ["draft-import", "publish", "live-qa"];
const ZERO_MUTATION_FIELDS = [
  "private_payload_read_count",
  "indexability_mutation_count",
  "sitemap_mutation_count",
  "llms_mutation_count",
  "search_mutation_count",
  "deploy_mutation_count",
];

function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function typeMatches(value, expected) {
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  if (expected === "integer") return Number.isInteger(value);
  if (expected === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  return valueType(value) === expected;
}

function resolveRef(rootSchema, ref) {
  if (!ref.startsWith("#/")) throw new Error(`unsupported_schema_ref=${ref}`);
  return ref
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((node, part) => node?.[part], rootSchema);
}

function validateSchemaNode(value, schema, rootSchema, instancePath, errors) {
  if (schema.$ref) {
    const target = resolveRef(rootSchema, schema.$ref);
    if (!target) errors.push(`${instancePath}: unresolved $ref ${schema.$ref}`);
    else validateSchemaNode(value, target, rootSchema, instancePath, errors);
    return;
  }
  for (const branch of schema.allOf ?? []) validateSchemaNode(value, branch, rootSchema, instancePath, errors);
  for (const keyword of ["oneOf", "anyOf"]) {
    if (!schema[keyword]) continue;
    const results = schema[keyword].map((branch) => {
      const branchErrors = [];
      validateSchemaNode(value, branch, rootSchema, instancePath, branchErrors);
      return branchErrors;
    });
    const passed = results.filter((branchErrors) => branchErrors.length === 0).length;
    if ((keyword === "oneOf" && passed !== 1) || (keyword === "anyOf" && passed === 0)) {
      errors.push(`${instancePath}: ${keyword} matched ${passed} branches`);
    }
    return;
  }
  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!allowed.some((type) => typeMatches(value, type))) {
      errors.push(`${instancePath}: expected ${allowed.join("|")}, got ${valueType(value)}`);
      return;
    }
  }
  if (Object.hasOwn(schema, "const") && !sameValue(value, schema.const)) {
    errors.push(`${instancePath}: const mismatch`);
  }
  if (schema.enum && !schema.enum.some((entry) => sameValue(value, entry))) {
    errors.push(`${instancePath}: value is not in enum`);
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${instancePath}: too short`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${instancePath}: too long`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${instancePath}: pattern mismatch`);
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${instancePath}: below minimum`);
  }
  if (Array.isArray(value)) {
    if (schema.uniqueItems) {
      const items = value.map((entry) => canonicalJson(entry));
      if (new Set(items).size !== items.length) errors.push(`${instancePath}: duplicate array item`);
    }
    if (schema.items) {
      value.forEach((entry, index) => validateSchemaNode(entry, schema.items, rootSchema, `${instancePath}/${index}`, errors));
    }
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) errors.push(`${instancePath}: missing ${required}`);
    }
    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) validateSchemaNode(value[key], propertySchema, rootSchema, `${instancePath}/${key}`, errors);
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`${instancePath}: unexpected ${key}`);
    }
  }
}

function schemaErrors(value, schema) {
  const errors = [];
  validateSchemaNode(value, schema, schema, "$", errors);
  return errors;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function sameValue(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function expectedV2Lineage(v1Entries = []) {
  return v1Entries
    .filter(
      (entry) =>
        entry.status !== "editorial_approved" &&
        !String(entry.report_ref ?? "").includes("/CONTROL-approvals/") &&
        !(["draft_imported", "published"].includes(entry.status) && entry.evidence_owner_lane_id === "CONTROL"),
    )
    .map((entry) => ({ ...entry, status: mapV1Status(entry.status) }));
}

function expectedLegacyLineage(v1Entries = []) {
  return v1Entries
    .filter(
      (entry) =>
        entry.status === "editorial_approved" ||
        String(entry.report_ref ?? "").includes("/CONTROL-approvals/") ||
        (["draft_imported", "published"].includes(entry.status) && entry.evidence_owner_lane_id === "CONTROL"),
    )
    .map((entry) => ({
      ...entry,
      status: mapV1Status(entry.status),
      legacy_source: "v1_human_approval_audit_only",
      transition_dependency_allowed: false,
    }));
}

function validateTargetMigration(v1, v2, label, errors) {
  assert(v2.status === mapV1Status(v1.status), `${label}: status migration mismatch`, errors);
  assert(
    v2.blocked_from_status === (v1.blocked_from_status === null ? null : mapV1Status(v1.blocked_from_status)),
    `${label}: blocked_from_status migration mismatch`,
    errors,
  );
  for (const field of ["package_sha256", "qa_report_ref", "counts", "blockers"]) {
    if (field in v1) assert(sameValue(v2[field], v1[field]), `${label}: ${field} drifted`, errors);
  }
  assert(sameValue(v2.gate_lineage, expectedV2Lineage(v1.gate_lineage)), `${label}: gate lineage drifted`, errors);
  assert(
    sameValue(v2.legacy_lineage, expectedLegacyLineage(v1.gate_lineage)),
    `${label}: legacy human approval lineage was not isolated`,
    errors,
  );
  assert(Array.isArray(v2.promotion_receipts), `${label}: promotion_receipts missing`, errors);
  assert(v2.lane_manifest_ref === null, `${label}: initial shadow migration cannot invent lane manifest refs`, errors);
}

export function validateV2Master({ v1 = readJson(V1_PATH), v2 = readJson(V2_PATH) } = {}) {
  const errors = [];
  const v1Bytes = fs.readFileSync(path.join(ROOT, V1_PATH));
  assert(v2.schema_version === "fermatmind.en_content_parity_control.v2", "V2 schema version mismatch", errors);
  assert(v2.artifact_kind === "generated_read_only_master", "V2 master must be a generated read-only summary", errors);
  assert(v2.is_master === true, "V2 is_master must be true", errors);
  assert(v2.authority?.v1_mode === "immutable_audit_only", "V1 must be immutable audit-only", errors);
  assert(v2.authority?.v1_path === V1_PATH, "V1 audit path mismatch", errors);
  assert(v2.authority?.v1_sha256 === sha256Bytes(v1Bytes), "V1 audit SHA mismatch", errors);
  assert(
    sameValue(v2.state_machine?.ordered_states, V2_ORDERED_STATES),
    "V2 state machine mismatch",
    errors,
  );
  assert(!v2.state_machine?.ordered_states?.includes("editorial_approved"), "editorial_approved remains in V2", errors);
  assert(v2.state_machine?.state_control_pr_required === false, "state CONTROL PRs must be disabled", errors);
  assert(sameValue(v2.release_policy_template, RELEASE_POLICY), "release policy template mismatch", errors);
  assert(v2.receipt_contract?.human_approval_evidence_allowed === false, "human approval evidence remains enabled", errors);
  assert(v2.qa_policy?.execution_mode === "independent_required_check_in_same_producer_pr", "W9 mode mismatch", errors);
  assert(v2.qa_policy?.separate_w9_evidence_pr_allowed === false, "separate W9 evidence PR remains enabled", errors);
  assert(v2.qa_policy?.blocked_control_reset_pr_allowed === false, "BLOCKED reset PR remains enabled", errors);
  assert(v2.guardrails?.producer_direct_cms_write_allowed === false, "Producer direct CMS write opened", errors);
  assert(v2.guardrails?.trusted_backend_draft_import_allowed === true, "trusted draft import not enabled", errors);
  assert(v2.guardrails?.trusted_backend_publication_allowed === true, "trusted publication not enabled", errors);
  for (const field of [
    "seo_discoverability_allowed",
    "search_submission_allowed",
    "production_deploy_allowed",
    "database_migration_allowed",
    "secrets_or_permission_change_allowed",
    "destructive_operation_allowed",
  ]) {
    assert(v2.guardrails?.[field] === false, `${field} must stay false`, errors);
  }
  assert(sameValue(v2.baseline, v1.baseline), "baseline drifted during V1→V2 migration", errors);
  assert(sameValue(v2.assets, v1.assets), "asset registry drifted during V1→V2 migration", errors);
  assert(v2.lanes?.length === v1.lanes?.length, "lane count drifted", errors);
  assert(new Set(v2.lanes?.map((lane) => lane.lane_id)).size === 9, "lane IDs are not unique", errors);

  for (const v1Lane of v1.lanes ?? []) {
    const v2Lane = v2.lanes?.find((lane) => lane.lane_id === v1Lane.lane_id);
    assert(Boolean(v2Lane), `${v1Lane.lane_id}: missing from V2`, errors);
    if (!v2Lane) continue;
    validateTargetMigration(v1Lane, v2Lane, v1Lane.lane_id, errors);
    assert(sameValue(v2Lane.counts, v1Lane.counts), `${v1Lane.lane_id}: counts drifted`, errors);
    assert(
      sameValue(v2Lane.release_policy, v1Lane.lane_kind === "producer" ? RELEASE_POLICY : null),
      `${v1Lane.lane_id}: release policy mismatch`,
      errors,
    );
    assert(v2Lane.subscopes?.length === (v1Lane.subscopes ?? []).length, `${v1Lane.lane_id}: subscope count drifted`, errors);
    for (const v1Subscope of v1Lane.subscopes ?? []) {
      const v2Subscope = v2Lane.subscopes?.find((subscope) => subscope.id === v1Subscope.id);
      assert(Boolean(v2Subscope), `${v1Subscope.id}: missing from V2`, errors);
      if (v2Subscope) validateTargetMigration(v1Subscope, v2Subscope, v1Subscope.id, errors);
    }
  }

  assert(sameValue(v2, buildV2()), "V2 master is not the deterministic V1 shadow migration", errors);
  const serialized = JSON.stringify(v2);
  assert(!serialized.includes("controlled_transition_approval"), "V2 depends on controlled_transition_approval", errors);
  assert(!serialized.includes('"approval_owner":"human_operator"'), "V2 depends on human_operator", errors);

  return { ok: errors.length === 0, errors };
}

function validateReceiptShape(receipt, label, errors, schema) {
  errors.push(...schemaErrors(receipt, schema).map((error) => `${label}: Schema ${error}`));
  assert(receipt?.schema_version === "fermatmind.content_promotion_receipt.v2", `${label}: schema mismatch`, errors);
  assert(RECEIPT_KINDS.includes(receipt?.receipt_kind), `${label}: unsupported receipt kind`, errors);
  assert(receipt?.result === "SUCCEEDED", `${label}: receipt did not succeed`, errors);
  assert(RECEIPT_PHASES.includes(receipt?.phase), `${label}: phase invalid`, errors);
  assert(receipt?.source_repository === "fermatmind/fap-api", `${label}: untrusted source repository`, errors);
  assert(/^[a-f0-9]{40}$/.test(receipt?.source_commit ?? ""), `${label}: source commit invalid`, errors);
  for (const field of [
    "package_sha256",
    "executor_release_sha256",
    "release_policy_sha256",
    "idempotency_key",
    "receipt_content_sha256",
  ]) {
    assert(/^[a-f0-9]{64}$/.test(receipt?.[field] ?? ""), `${label}: ${field} invalid`, errors);
  }
  assert(/^W[1-8]$/.test(receipt?.lane ?? ""), `${label}: lane invalid`, errors);
  assert(/^[1-9][0-9]{0,19}$/.test(receipt?.workflow_run_id ?? ""), `${label}: workflow run ID invalid`, errors);
  assert(Number.isInteger(receipt?.workflow_run_attempt) && receipt.workflow_run_attempt >= 1, `${label}: workflow attempt invalid`, errors);
  assert(
    /^(content_assets\/en-content-parity|content_packs|content_baselines|database\/seeders\/data)\//.test(
      receipt?.package_path ?? "",
    ) && !String(receipt?.package_path ?? "").includes(".."),
    `${label}: package path is not backend-authority allowlisted`,
    errors,
  );
  assert(Number.isInteger(receipt?.expected_count) && receipt.expected_count >= 1, `${label}: expected count invalid`, errors);
  assert(receipt?.readback_count === receipt?.expected_count, `${label}: readback count mismatch`, errors);
  assert(receipt?.privacy_redaction === true, `${label}: privacy redaction missing`, errors);
  assert(receipt?.server_topology_exposed === false, `${label}: server topology exposed`, errors);
  assert(receipt?.locale_check === "PASS", `${label}: locale check failed`, errors);
  assert(receipt?.cjk_leakage_check === "PASS", `${label}: CJK leakage check failed`, errors);
  assert(receipt?.identity_check === "PASS", `${label}: identity check failed`, errors);
  for (const field of ZERO_MUTATION_FIELDS) assert(receipt?.[field] === 0, `${label}: ${field} must be zero`, errors);
  const content = { ...receipt };
  delete content.receipt_content_sha256;
  assert(
    receipt?.receipt_content_sha256 === sha256Bytes(canonicalJson(content)),
    `${label}: receipt content SHA mismatch`,
    errors,
  );
}

/**
 * @param {{
 *   entries: Array<{bytes:string, receipt?:Record<string, unknown>}>,
 *   lane: string,
 *   subscope?: string|null,
 *   packageSha256: string,
 *   expectedCount: number,
 *   releasePolicySha256: string,
 *   schema?: Record<string, unknown>
 * }} input
 */
export function validateReceiptChain({
  entries,
  lane,
  subscope = null,
  packageSha256,
  expectedCount,
  releasePolicySha256,
  schema = readJson(V2_SCHEMA_PATH),
}) {
  const errors = [];
  assert(Array.isArray(entries) && entries.length === 3, "receipt chain must contain exactly three receipts", errors);
  if (!Array.isArray(entries) || entries.length !== 3) return { ok: false, errors };
  const receipts = entries.map((entry, index) => {
    const receipt = entry.receipt ?? JSON.parse(entry.bytes);
    validateReceiptShape(receipt, `receipt[${index}]`, errors, schema);
    return receipt;
  });
  assert(sameValue(receipts.map((item) => item.receipt_kind), RECEIPT_KINDS), "receipt kinds are out of order", errors);
  assert(sameValue(receipts.map((item) => item.phase), RECEIPT_PHASES), "receipt phases are out of order", errors);
  for (const [index, receipt] of receipts.entries()) {
    assert(receipt.lane === lane, `receipt[${index}]: cross-lane receipt`, errors);
    assert(receipt.subscope === subscope, `receipt[${index}]: cross-subscope receipt`, errors);
    assert(receipt.package_sha256 === packageSha256, `receipt[${index}]: cross-package or stale receipt`, errors);
    assert(receipt.expected_count === expectedCount, `receipt[${index}]: expected count mismatch`, errors);
    assert(receipt.release_policy_sha256 === releasePolicySha256, `receipt[${index}]: release policy mismatch`, errors);
    if (index > 0) {
      assert(receipt.source_commit === receipts[0].source_commit, `receipt[${index}]: source commit drifted`, errors);
      assert(receipt.workflow_run_id === receipts[0].workflow_run_id, `receipt[${index}]: workflow run drifted`, errors);
      assert(receipt.workflow_run_attempt === receipts[0].workflow_run_attempt, `receipt[${index}]: workflow attempt drifted`, errors);
      assert(receipt.idempotency_key === receipts[0].idempotency_key, `receipt[${index}]: idempotency key drifted`, errors);
      assert(
        receipt.previous_receipt_sha256 === sha256Bytes(entries[index - 1].bytes),
        `receipt[${index}]: previous receipt SHA mismatch`,
        errors,
      );
    } else {
      assert(receipt.previous_receipt_sha256 === null, "draft import receipt cannot have a predecessor", errors);
    }
  }
  assert(receipts[0].published_count === 0, "draft import receipt published content", errors);
  assert(receipts[1].published_count === expectedCount, "publication count mismatch", errors);
  assert(receipts[2].published_count === expectedCount, "live QA public count mismatch", errors);
  return { ok: errors.length === 0, errors };
}

export function validateV2Control({ receiptEntries = [], expected = null } = {}) {
  const schema = readJson(V2_SCHEMA_PATH);
  const master = readJson(V2_PATH);
  const masterReport = validateV2Master({ v2: master });
  const errors = [
    ...schemaErrors(master, schema).map((error) => `V2 master Schema ${error}`),
    ...masterReport.errors,
  ];
  assert(schema?.$id?.endsWith("en-content-parity-control-master.v2.schema.json"), "V2 Schema ID mismatch", errors);
  let receiptReport = null;
  if (receiptEntries.length > 0) {
    if (!expected) errors.push("receipt validation requires expected lane/package/count/policy bindings");
    else receiptReport = validateReceiptChain({ entries: receiptEntries, ...expected });
    if (receiptReport) errors.push(...receiptReport.errors);
  }
  return {
    ok: errors.length === 0,
    authority: V2_PATH,
    legacy_v1: V1_PATH,
    schema: V2_SCHEMA_PATH,
    lane_count: master.lanes.length,
    receipt_count: receiptEntries.length,
    errors,
  };
}

function readArguments(argv) {
  const receiptPaths = [];
  const expected = { subscope: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const next = argv[index + 1];
    if (["--receipt", "--lane", "--subscope", "--package-sha256", "--expected-count", "--release-policy-sha256"].includes(value)) {
      if (!next || next.startsWith("--")) throw new Error(`${value}_requires_value`);
      if (value === "--receipt") receiptPaths.push(next);
      if (value === "--lane") expected.lane = next;
      if (value === "--subscope") expected.subscope = next === "-" ? null : next;
      if (value === "--package-sha256") expected.packageSha256 = next;
      if (value === "--expected-count") expected.expectedCount = Number(next);
      if (value === "--release-policy-sha256") expected.releasePolicySha256 = next;
      index += 1;
      continue;
    }
    throw new Error(`unsupported_argument=${value}`);
  }
  return { receiptPaths, expected: receiptPaths.length > 0 ? expected : null };
}

function main() {
  const { receiptPaths, expected } = readArguments(process.argv.slice(2));
  const receiptEntries = receiptPaths.map((receiptPath) => ({
    path: receiptPath,
    bytes: fs.readFileSync(path.resolve(ROOT, receiptPath), "utf8"),
  }));
  const report = validateV2Control({ receiptEntries, expected });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
