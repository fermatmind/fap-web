#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

import {
  RELEASE_POLICY,
  V2_INPUTS_PATH,
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
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${instancePath}: too few items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${instancePath}: too many items`);
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

function readRegisteredFile(relativePath) {
  if (path.isAbsolute(relativePath) || relativePath.split("/").includes("..")) {
    throw new Error(`unsafe_registered_path=${relativePath}`);
  }
  const absolutePath = path.join(ROOT, relativePath);
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    if (!fs.fstatSync(descriptor).isFile()) throw new Error(`registered_path_not_regular=${relativePath}`);
    const bytes = fs.readFileSync(descriptor);
    if (fs.realpathSync(absolutePath) !== absolutePath) throw new Error(`registered_path_not_canonical=${relativePath}`);
    return bytes;
  } finally {
    fs.closeSync(descriptor);
  }
}

function readAbsoluteRegularNoFollow(absolutePath) {
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    if (!fs.fstatSync(descriptor).isFile()) throw new Error(`artifact_path_not_regular=${absolutePath}`);
    return fs.readFileSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

export function verifyGithubWorkflowProvenance(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error("receipt_provenance_requires_entries");
  const receipts = entries.map((entry) => entry.receipt ?? JSON.parse(entry.bytes));
  const first = receipts[0];
  const runId = String(first.workflow_run_id ?? "");
  const run = JSON.parse(
    execFileSync(
      "gh",
      ["api", `repos/fermatmind/fap-api/actions/runs/${runId}`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ),
  );
  const minimumExecutorCommit = readJson(V2_PATH).authority.backend_promotion_contract.minimum_executor_commit;
  const comparison = JSON.parse(
    execFileSync(
      "gh",
      ["api", `repos/fermatmind/fap-api/compare/${minimumExecutorCommit}...${run.head_sha}`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ),
  );
  if (!["ahead", "identical"].includes(comparison.status)) {
    throw new Error("workflow_source_predates_minimum_executor_commit");
  }
  const artifactName = `content-promotion-${first.lane}-${runId}-${first.workflow_run_attempt}`;
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "fap-content-promotion-provenance-"));
  try {
    execFileSync(
      "gh",
      ["run", "download", runId, "--repo", "fermatmind/fap-api", "--name", artifactName, "--dir", temporaryDirectory],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    const files = walkFiles(temporaryDirectory);
    const names = ["draft-import.json", "publication.json", "live-qa.json"];
    const artifactReceiptFiles = names.map((name) => files.filter((file) => path.basename(file) === name));
    if (artifactReceiptFiles[0].length !== 1) throw new Error("trusted_artifact_receipt_missing=draft-import.json");
    if (artifactReceiptFiles.some((matches) => matches.length > 1)) throw new Error("trusted_artifact_duplicate_receipt_file");
    const firstMissingIndex = artifactReceiptFiles.findIndex((matches) => matches.length === 0);
    const completeReceiptFiles = artifactReceiptFiles.slice(
      0,
      firstMissingIndex < 0 ? artifactReceiptFiles.length : firstMissingIndex,
    );
    if (artifactReceiptFiles.slice(completeReceiptFiles.length).some((matches) => matches.length !== 0)) {
      throw new Error("trusted_artifact_receipt_chain_not_contiguous");
    }
    if (entries.length !== completeReceiptFiles.length) throw new Error("trusted_artifact_receipt_prefix_truncated");
    const artifactReceiptSha256s = entries.map((entry, index) => {
      const artifactBytes = readAbsoluteRegularNoFollow(completeReceiptFiles[index][0]);
      if (sha256Bytes(artifactBytes) !== sha256Bytes(entry.bytes)) {
        throw new Error(`trusted_artifact_receipt_mismatch=${names[index]}`);
      }
      return sha256Bytes(artifactBytes);
    });
    return {
      verified: true,
      repository: "fermatmind/fap-api",
      workflow_path: String(run.path ?? "").split("@")[0],
      event: run.event,
      head_branch: run.head_branch,
      head_sha: run.head_sha,
      conclusion: run.conclusion,
      run_id: String(run.id),
      run_attempt: run.run_attempt,
      artifact_name: artifactName,
      complete_receipt_count: completeReceiptFiles.length,
      artifact_receipt_sha256s: artifactReceiptSha256s,
    };
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
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

function hasMaterializedFacts(target) {
  return target?.lane_manifest_ref !== null || (target?.promotion_receipts?.length ?? 0) > 0;
}

export function validateV2Master({
  v1 = readJson(V1_PATH),
  v2 = readJson(V2_PATH),
  inputs = readJson(V2_INPUTS_PATH),
  v1Bytes = fs.readFileSync(path.join(ROOT, V1_PATH)),
  inputsBytes = fs.readFileSync(path.join(ROOT, V2_INPUTS_PATH)),
  expectedV2 = buildV2(),
} = {}) {
  const errors = [];
  assert(v2.schema_version === "fermatmind.en_content_parity_control.v2", "V2 schema version mismatch", errors);
  assert(v2.artifact_kind === "generated_read_only_master", "V2 master must be a generated read-only summary", errors);
  assert(v2.is_master === true, "V2 is_master must be true", errors);
  assert(v2.authority?.v1_mode === "immutable_audit_only", "V1 must be immutable audit-only", errors);
  assert(v2.authority?.v1_path === V1_PATH, "V1 audit path mismatch", errors);
  assert(v2.authority?.v1_sha256 === sha256Bytes(v1Bytes), "V1 audit SHA mismatch", errors);
  assert(v2.materialization?.inputs_path === V2_INPUTS_PATH, "V2 inputs path mismatch", errors);
  assert(v2.materialization?.inputs_sha256 === sha256Bytes(inputsBytes), "V2 inputs SHA mismatch", errors);
  assert(v2.materialization?.lane_manifest_count === inputs.lane_manifests.length, "lane manifest count mismatch", errors);
  assert(v2.materialization?.receipt_chain_count === inputs.receipt_chains.length, "receipt chain count mismatch", errors);
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
    const splitLaneMaterialized = (v2Lane.subscopes ?? []).some(hasMaterializedFacts);
    if (!hasMaterializedFacts(v2Lane) && !splitLaneMaterialized) {
      validateTargetMigration(v1Lane, v2Lane, v1Lane.lane_id, errors);
      assert(sameValue(v2Lane.counts, v1Lane.counts), `${v1Lane.lane_id}: counts drifted`, errors);
    }
    assert(
      sameValue(v2Lane.release_policy, v1Lane.lane_kind === "producer" ? RELEASE_POLICY : null),
      `${v1Lane.lane_id}: release policy mismatch`,
      errors,
    );
    assert(v2Lane.subscopes?.length === (v1Lane.subscopes ?? []).length, `${v1Lane.lane_id}: subscope count drifted`, errors);
    for (const v1Subscope of v1Lane.subscopes ?? []) {
      const v2Subscope = v2Lane.subscopes?.find((subscope) => subscope.id === v1Subscope.id);
      assert(Boolean(v2Subscope), `${v1Subscope.id}: missing from V2`, errors);
      if (v2Subscope && !hasMaterializedFacts(v2Subscope)) {
        validateTargetMigration(v1Subscope, v2Subscope, v1Subscope.id, errors);
      }
    }
  }

  assert(sameValue(v2, expectedV2), "V2 master does not match the registered materialization inputs", errors);
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
 *   targetStatus: "draft_imported"|"published"|"live_qa_pass",
 *   provenance: Record<string, unknown>|null,
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
  targetStatus,
  provenance,
  schema = readJson(V2_SCHEMA_PATH),
}) {
  const errors = [];
  const pinnedReleasePolicySha256 = readJson(V2_PATH).authority.backend_promotion_contract.release_policy_sha256;
  const targetReceiptCount = { draft_imported: 1, published: 2, live_qa_pass: 3 }[targetStatus];
  assert(Boolean(targetReceiptCount), "receipt target status is invalid", errors);
  assert(
    Array.isArray(entries) && entries.length === targetReceiptCount,
    `receipt chain length does not match ${targetStatus}`,
    errors,
  );
  if (!Array.isArray(entries) || entries.length !== targetReceiptCount) return { ok: false, errors };
  const receipts = entries.map((entry, index) => {
    const receipt = entry.receipt ?? JSON.parse(entry.bytes);
    validateReceiptShape(receipt, `receipt[${index}]`, errors, schema);
    return receipt;
  });
  assert(sameValue(receipts.map((item) => item.receipt_kind), RECEIPT_KINDS.slice(0, entries.length)), "receipt kinds are out of order", errors);
  assert(sameValue(receipts.map((item) => item.phase), RECEIPT_PHASES.slice(0, entries.length)), "receipt phases are out of order", errors);
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
  assert(releasePolicySha256 === pinnedReleasePolicySha256, "release policy SHA is not the pinned V2 policy", errors);
  assert(receipts[0].published_count === 0, "draft import receipt published content", errors);
  if (receipts[1]) assert(receipts[1].published_count === expectedCount, "publication count mismatch", errors);
  if (receipts[2]) assert(receipts[2].published_count === expectedCount, "live QA public count mismatch", errors);
  assert(provenance?.verified === true, "trusted GitHub workflow provenance is required", errors);
  assert(provenance?.repository === "fermatmind/fap-api", "workflow provenance repository mismatch", errors);
  assert(
    provenance?.workflow_path === ".github/workflows/content-promotion-automation.yml",
    "workflow provenance path mismatch",
    errors,
  );
  assert(provenance?.event === "workflow_dispatch", "workflow provenance event mismatch", errors);
  assert(provenance?.head_branch === "main", "workflow provenance branch mismatch", errors);
  assert(provenance?.head_sha === receipts[0].source_commit, "workflow provenance source commit mismatch", errors);
  assert(provenance?.conclusion === "success", "workflow provenance did not succeed", errors);
  assert(provenance?.run_id === receipts[0].workflow_run_id, "workflow provenance run ID mismatch", errors);
  assert(provenance?.run_attempt === receipts[0].workflow_run_attempt, "workflow provenance attempt mismatch", errors);
  assert(provenance?.complete_receipt_count === entries.length, "workflow artifact receipt chain was truncated", errors);
  assert(
    sameValue(provenance?.artifact_receipt_sha256s, entries.map((entry) => sha256Bytes(entry.bytes))),
    "workflow artifact receipt bytes mismatch",
    errors,
  );
  return { ok: errors.length === 0, errors };
}

export function validateV2Control({ receiptEntries = [], expected = null, provenance = null } = {}) {
  const schema = readJson(V2_SCHEMA_PATH);
  const master = readJson(V2_PATH);
  const inputs = readJson(V2_INPUTS_PATH);
  const masterReport = validateV2Master({ v2: master });
  const errors = [
    ...schemaErrors(master, schema).map((error) => `V2 master Schema ${error}`),
    ...schemaErrors(inputs, schema).map((error) => `V2 inputs Schema ${error}`),
    ...masterReport.errors,
  ];
  assert(schema?.$id?.endsWith("en-content-parity-control-master.v2.schema.json"), "V2 Schema ID mismatch", errors);
  for (const binding of inputs.lane_manifests) {
    try {
      const bytes = readRegisteredFile(binding.path);
      assert(sha256Bytes(bytes) === binding.sha256, `${binding.path}: lane manifest SHA mismatch`, errors);
      const laneManifest = JSON.parse(bytes.toString("utf8"));
      errors.push(...schemaErrors(laneManifest, schema).map((error) => `${binding.path}: Schema ${error}`));
    } catch (error) {
      errors.push(`${binding.path}: lane manifest cannot be verified (${error instanceof Error ? error.message : String(error)})`);
    }
  }
  for (const chain of inputs.receipt_chains) {
    try {
      const registeredEntries = chain.receipt_paths.map((receiptPath) => ({
        path: receiptPath,
        bytes: readRegisteredFile(receiptPath).toString("utf8"),
      }));
      const registeredProvenance = verifyGithubWorkflowProvenance(registeredEntries);
      const registeredReport = validateReceiptChain({
        entries: registeredEntries,
        lane: chain.lane_id,
        subscope: chain.subscope,
        packageSha256: chain.package_sha256,
        expectedCount: chain.expected_count,
        releasePolicySha256: chain.release_policy_sha256,
        targetStatus: chain.target_status,
        provenance: registeredProvenance,
        schema,
      });
      errors.push(...registeredReport.errors.map((error) => `${chain.lane_id}: registered receipt chain ${error}`));
    } catch (error) {
      errors.push(`${chain.lane_id}: registered receipt provenance failed (${error instanceof Error ? error.message : String(error)})`);
    }
  }
  let receiptReport = null;
  if (receiptEntries.length > 0) {
    if (!expected) errors.push("receipt validation requires expected lane/package/count/policy bindings");
    else receiptReport = validateReceiptChain({ entries: receiptEntries, provenance, ...expected });
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
    if (["--receipt", "--lane", "--subscope", "--package-sha256", "--expected-count", "--release-policy-sha256", "--target-status"].includes(value)) {
      if (!next || next.startsWith("--")) throw new Error(`${value}_requires_value`);
      if (value === "--receipt") receiptPaths.push(next);
      if (value === "--lane") expected.lane = next;
      if (value === "--subscope") expected.subscope = next === "-" ? null : next;
      if (value === "--package-sha256") expected.packageSha256 = next;
      if (value === "--expected-count") expected.expectedCount = Number(next);
      if (value === "--release-policy-sha256") expected.releasePolicySha256 = next;
      if (value === "--target-status") expected.targetStatus = next;
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
  let provenance = null;
  let provenanceError = null;
  if (receiptEntries.length > 0) {
    try {
      provenance = verifyGithubWorkflowProvenance(receiptEntries);
    } catch (error) {
      provenanceError = error instanceof Error ? error.message : String(error);
    }
  }
  const report = validateV2Control({ receiptEntries, expected, provenance });
  if (provenanceError) {
    report.ok = false;
    report.errors.push(`trusted GitHub workflow provenance failed (${provenanceError})`);
  }
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
