#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

import { validateV2Control } from "./validate-en-content-parity-control-v2.mjs";

const ROOT = process.cwd();
const DEFAULT_SCHEMA_PATH = "docs/seo/generated/en-content-parity-control-master.v1.schema.json";
const DEFAULT_MANIFEST_PATH = "docs/seo/generated/en-content-parity-control-master.v1.json";
const DEFAULT_PROMPTS_PATH = "docs/seo/generated/en-content-parity-first-wave-prompts.v1.json";

const EXPECTED_LANE_IDS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9"];
const EXPECTED_PRODUCER_IDS = EXPECTED_LANE_IDS.slice(0, 8);
const EXPECTED_FIRST_WAVE = ["W1", "W2", "W3"];
const EXPECTED_LAUNCH_READY_PRODUCER_IDS = [...EXPECTED_FIRST_WAVE, "W4"];
const EXPECTED_REGISTERED_PRODUCER_IDS = ["W5", "W6", "W7", "W8"];
const EXPECTED_STATES = [
  "not_started",
  "inventory_frozen",
  "package_in_progress",
  "package_frozen",
  "qa_pass",
  "dry_run_ready",
  "draft_imported",
  "editorial_approved",
  "published",
  "live_qa_pass",
];
const EXPECTED_HANDOFF_FILES = [
  "scope_manifest.json",
  "assets.jsonl",
  "translation_map.json",
  "source_ledger.json",
  "claim_boundary_report.json",
  "editorial_review.json",
  "dry_run_readiness.json",
  "sha256_manifest.json",
  "master_manifest_patch.candidate.json",
  "handoff.md",
];
const IMMUTABLE_PACKAGE_PAYLOAD_FILES = EXPECTED_HANDOFF_FILES.filter(
  (file) => file !== "sha256_manifest.json" && file !== "master_manifest_patch.candidate.json"
);
const PROTECTED_ASSET_FIELDS = [
  "lane_id",
  "asset_type",
  "translation_group",
  "locales",
  "authority_source",
];
const FROZEN_INVENTORY_COUNT_FIELDS = [
  "expected_en_count",
  "current_en_count",
  "remaining_en_count",
];
const EXPECTED_SPLIT_SUBSCOPES_BY_LANE = new Map([
  [
    "W1",
    [
      {
        id: "W1-MBTI-COMPARISONS",
        sequence: 1,
        resource: "MbtiCrossTypeComparisonAuthority",
        output_subdirectory: "comparisons",
        asset_ids: ["ENPARITY-W1-MBTI-CROSS-COMPARISONS"],
      },
      {
        id: "W1-MBTI-RESULT-CONTENT",
        sequence: 2,
        resource: "MbtiResultContentAuthority",
        output_subdirectory: "result-content",
        asset_ids: ["ENPARITY-W1-MBTI-RESULT-CONTENT"],
      },
    ],
  ],
  [
    "W3",
    [
      {
        id: "W3-ARTICLES",
        sequence: 1,
        resource: "Article",
        output_subdirectory: "articles",
        asset_ids: ["ENPARITY-W3-ARTICLES"],
      },
      {
        id: "W3-CAREER-GUIDES",
        sequence: 2,
        resource: "CareerGuide",
        output_subdirectory: "career-guides",
        asset_ids: ["ENPARITY-W3-CAREER-GUIDES"],
      },
    ],
  ],
]);
const IN_PACKAGE_GATE_REPORT_FILES = {
  inventory_frozen: "source_ledger.json",
  package_in_progress: "source_ledger.json",
  package_frozen: "editorial_review.json",
  blocked: "claim_boundary_report.json",
};
const EXPECTED_QA_CHECKS = [
  "language_naturalness",
  "chinese_leakage",
  "claim_boundary",
  "asset_duplication",
  "field_leakage",
  "page_api_alignment",
];
const EXPECTED_W9_ROW_CHECKS = [
  "language_naturalness",
  "chinese_leakage",
  "source_equivalence_identity",
  "claim_boundary",
  "internal_link_equivalence",
  "field_leakage",
  "asset_media_duplication_omission",
  "page_api_alignment_applicable",
];
const W9_AGGREGATE_TO_ROW_CHECKS = {
  language_naturalness: ["language_naturalness"],
  chinese_leakage: ["chinese_leakage"],
  claim_boundary: ["claim_boundary"],
  asset_duplication: ["source_equivalence_identity", "asset_media_duplication_omission"],
  field_leakage: ["internal_link_equivalence", "field_leakage"],
  page_api_alignment: ["page_api_alignment_applicable"],
};
const QA_CHECK_VERDICTS = ["PASS", "BLOCKED"];
const PAGE_API_ALIGNMENT_VERDICTS = [...QA_CHECK_VERDICTS, "NOT_APPLICABLE"];
const PERMISSION_KEYS = [
  "cms_write_authorized",
  "staging_write_authorized",
  "production_import_authorized",
  "public_release_authorized",
  "seo_runtime_release_authorized",
  "search_submission_authorized",
  "master_manifest_write_authorized",
];
const W3_CAREER_GUIDE_BATCH_A_CODES = [
  "big5-for-career-decisions",
  "build-portfolio-for-career-switch",
  "career-growth-with-manager",
  "first-90-days-in-new-role",
  "from-mbti-to-job-fit",
  "iq-eq-balance-at-work",
  "networking-that-actually-works",
  "personal-brand-for-professionals",
];
const W3_CAREER_GUIDE_BATCH_B_CODES = [
  "annual-career-review-system",
  "build-five-year-career-roadmap",
  "career-risk-management",
  "career-transition-playbook",
  "cross-industry-move-strategy",
  "how-to-choose-college-major",
  "how-to-find-right-career-direction",
  "improve-workplace-competitiveness",
  "interview-strategy-by-role",
  "leader-track-vs-expert-track",
  "prevent-burnout-while-growing",
  "salary-negotiation-framework",
];
const W3_CAREER_GUIDE_PARTIAL_BATCHES = {
  "batch-a-8": { codes: W3_CAREER_GUIDE_BATCH_A_CODES, label: "Batch A" },
  "batch-b-12": { codes: W3_CAREER_GUIDE_BATCH_B_CODES, label: "Batch B" },
};

function readJson(relativePath) {
  const resolvedPath = path.isAbsolute(relativePath) ? relativePath : path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
}

function sha256File(relativePath) {
  const resolvedPath = path.isAbsolute(relativePath) ? relativePath : path.join(ROOT, relativePath);
  return createHash("sha256").update(fs.readFileSync(resolvedPath)).digest("hex");
}

function packageSha256(files) {
  const canonicalEntries = files.map((file) => `${file.path}:${file.sha256}`).join("\n");
  return createHash("sha256").update(canonicalEntries).digest("hex");
}

function externalPackageSha256(files) {
  const canonicalEntries = files.map((file) => `${file.path}\0${file.sha256}\n`).join("");
  return createHash("sha256").update(canonicalEntries).digest("hex");
}

function validateExternalPackageEvidence(artifact, packageDirectory, errors) {
  const evidence = artifact.external_package_evidence;
  if (!evidence) {
    return null;
  }

  const isIndependentQaBlocker =
    artifact.proposed_status === "blocked" &&
    artifact.gate_evidence?.owner_lane_id === "W9" &&
    artifact.gate_evidence?.report_in_package === false;
  assert(
    stateIndex(artifact.proposed_status) >= stateIndex("package_frozen") || isIndependentQaBlocker,
    `${artifact.lane_id}: external package evidence is allowed only for package_frozen and later states`,
    errors
  );
  assert(
    evidence.source_repository === "fap-api",
    `${artifact.lane_id}: external package evidence must name fap-api`,
    errors
  );
  assert(
    /^[a-f0-9]{40}$/.test(evidence.source_commit_sha ?? ""),
    `${artifact.lane_id}: external package source commit must be an exact 40-character SHA`,
    errors
  );
  assert(
    typeof evidence.source_package_path === "string" &&
      evidence.source_package_path.startsWith("backend/") &&
      !path.isAbsolute(evidence.source_package_path) &&
      !evidence.source_package_path.split("/").includes(".."),
    `${artifact.lane_id}: external package source path must be a safe fap-api backend path`,
    errors
  );
  assert(
    evidence.package_sha256_algorithm === "manifest_files_path_nul_sha256_newline_v1",
    `${artifact.lane_id}: external package digest algorithm is unsupported`,
    errors
  );

  const snapshotDirectory = path.join(packageDirectory, "external_package");
  const manifestPath = path.join(snapshotDirectory, "package_manifest.json");
  let externalManifest;
  let realSnapshotDirectory;
  try {
    const realPackageDirectory = fs.realpathSync(packageDirectory);
    realSnapshotDirectory = fs.realpathSync(snapshotDirectory);
    const realManifestPath = fs.realpathSync(manifestPath);
    assert(
      path.dirname(realSnapshotDirectory) === realPackageDirectory &&
        path.basename(realSnapshotDirectory) === "external_package",
      `${artifact.lane_id}: external package snapshot must be the direct external_package child`,
      errors
    );
    assert(
      path.dirname(realManifestPath) === realSnapshotDirectory &&
        path.basename(realManifestPath) === "package_manifest.json",
      `${artifact.lane_id}: external package manifest path is outside the snapshot directory`,
      errors
    );
    assert(
      !fs.lstatSync(snapshotDirectory).isSymbolicLink() && !fs.lstatSync(manifestPath).isSymbolicLink(),
      `${artifact.lane_id}: external package snapshot and manifest must not be symbolic links`,
      errors
    );
    assert(
      sha256File(manifestPath) === evidence.manifest_sha256,
      `${artifact.lane_id}: external package manifest SHA mismatch`,
      errors
    );
    externalManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot read external package snapshot (${error instanceof Error ? error.message : String(error)})`
    );
    return null;
  }

  assert(
    externalManifest.schema_version === "fermatmind.en_parity.immutable_content_package_manifest.v1",
    `${artifact.lane_id}: external package manifest schema version is invalid`,
    errors
  );
  assert(
    externalManifest.package_id === artifact.package_id,
    `${artifact.lane_id}: external package manifest package_id mismatch`,
    errors
  );
  assert(externalManifest.lane_id === artifact.lane_id, `${artifact.lane_id}: external package lane mismatch`, errors);
  assert(
    externalManifest.status === "unpublished_candidate",
    `${artifact.lane_id}: external package must remain an unpublished candidate`,
    errors
  );
  const registeredAssetIds = artifact.asset_updates.map((asset) => asset.asset_id);
  assert(
    registeredAssetIds.length === 1 && externalManifest.asset_id === registeredAssetIds[0],
    `${artifact.lane_id}: external package asset identity mismatch`,
    errors
  );
  assert(
    externalManifest[evidence.row_count_field] === artifact.gate_evidence.row_count,
    `${artifact.lane_id}: external package row count mismatch`,
    errors
  );

  const files = externalManifest.files;
  assert(Array.isArray(files) && files.length > 0, `${artifact.lane_id}: external package file chain is missing`, errors);
  if (!Array.isArray(files) || files.length === 0) {
    return null;
  }

  const seen = new Set();
  for (const file of files) {
    const filePath = file?.path;
    const expectedSha256 = file?.sha256;
    const safePath =
      typeof filePath === "string" &&
      filePath.length > 0 &&
      path.basename(filePath) === filePath &&
      !path.isAbsolute(filePath) &&
      filePath !== "package_manifest.json" &&
      !seen.has(filePath);
    assert(safePath, `${artifact.lane_id}: external package manifest contains an unsafe or duplicate file path`, errors);
    assert(
      typeof expectedSha256 === "string" && /^[a-f0-9]{64}$/.test(expectedSha256),
      `${artifact.lane_id}: external package manifest contains an invalid file SHA`,
      errors
    );
    if (!safePath || typeof expectedSha256 !== "string") {
      continue;
    }
    seen.add(filePath);
    try {
      const payloadPath = path.join(snapshotDirectory, filePath);
      const realPayloadPath = fs.realpathSync(payloadPath);
      assert(
        path.dirname(realPayloadPath) === realSnapshotDirectory &&
          !fs.lstatSync(payloadPath).isSymbolicLink(),
        `${artifact.lane_id}: external package payload path escapes the snapshot directory`,
        errors
      );
      assert(
        sha256File(payloadPath) === expectedSha256,
        `${artifact.lane_id}: external package payload SHA mismatch: ${filePath}`,
        errors
      );
    } catch (error) {
      errors.push(
        `${artifact.lane_id}: cannot read external package payload ${filePath} (${error instanceof Error ? error.message : String(error)})`
      );
    }
  }

  const recomputedPackageSha256 = externalPackageSha256(files);
  assert(
    externalManifest.package_sha256 === recomputedPackageSha256,
    `${artifact.lane_id}: external package manifest aggregate does not match its file chain`,
    errors
  );
  assert(
    artifact.package_sha256 === recomputedPackageSha256,
    `${artifact.lane_id}: package_sha256 must match the verified external package`,
    errors
  );

  return recomputedPackageSha256;
}

function isPathInside(candidatePath, authorityDirectory) {
  const relativePath = path.relative(authorityDirectory, candidatePath);
  return relativePath !== "" && !relativePath.startsWith(`..${path.sep}`) && relativePath !== ".." && !path.isAbsolute(relativePath);
}

function validateArtifactAuthorityPath(
  artifactPath,
  authorityDirectory,
  expectedFileName,
  errorPrefix,
  errors
) {
  const resolvedArtifactPath = path.isAbsolute(artifactPath)
    ? artifactPath
    : path.join(ROOT, artifactPath);
  assert(
    path.basename(resolvedArtifactPath) === expectedFileName,
    `${errorPrefix} must use ${expectedFileName}`,
    errors
  );
  const registeredDirectory = path.resolve(ROOT, authorityDirectory);
  assert(
    path.dirname(path.resolve(resolvedArtifactPath)) === registeredDirectory,
    `${errorPrefix} must reside directly inside the registered output directory`,
    errors
  );
  try {
    const realAuthorityDirectory = fs.realpathSync(registeredDirectory);
    const realArtifactPath = fs.realpathSync(resolvedArtifactPath);
    assert(
      path.dirname(realArtifactPath) === realAuthorityDirectory,
      `${errorPrefix} must reside directly inside the registered output directory`,
      errors
    );
  } catch (error) {
    errors.push(
      `${errorPrefix} authority path cannot be verified (${error instanceof Error ? error.message : String(error)})`
    );
  }
}

function isPartialBatchWitness(artifact) {
  return Boolean(artifact?.partial_batch);
}

function validatePartialBatchWitness(artifact, packageTarget, errors) {
  if (!isPartialBatchWitness(artifact)) {
    return false;
  }
  const batch = artifact.partial_batch;
  const registeredBatch = W3_CAREER_GUIDE_PARTIAL_BATCHES[batch.batch_id];
  assert(
    artifact.lane_id === "W3" && artifact.subscope_id === "W3-CAREER-GUIDES",
    "partial batch witnesses are limited to W3 Career Guides",
    errors
  );
  assert(Boolean(registeredBatch), "partial batch witness must use a registered W3 Career Guides batch", errors);
  assert(
    sameValue(batch.guide_codes, registeredBatch?.codes),
    `partial batch witness guide codes must be the exact ${registeredBatch?.label ?? "registered"} cohort in order`,
    errors
  );
  assert(batch.registered_row_count === 20, "partial batch witness must retain the 20-row registered cohort", errors);
  assert(batch.batch_row_count === registeredBatch?.codes.length, "partial batch witness row count must match the registered cohort", errors);
  assert(batch.aggregate_ready === false, "partial batch witness cannot be aggregate-ready", errors);
  assert(batch.master_transition_allowed === false, "partial batch witness cannot authorize a master transition", errors);
  assert(packageTarget?.status === "package_in_progress", "partial batch witness requires Career Guides package_in_progress", errors);
  const witnessStatus = artifact.artifact_kind === "master_manifest_patch_candidate" ? artifact.proposed_status : artifact.status;
  assert(witnessStatus === "package_in_progress", "partial batch candidate must preserve package_in_progress", errors);
  return true;
}

function validatePartialBatchAuthorityPath(artifactPath, authorityDirectory, expectedFileName, batchId, errorPrefix, errors) {
  const resolvedArtifactPath = path.resolve(ROOT, artifactPath);
  const registeredDirectory = path.resolve(ROOT, authorityDirectory);
  const expectedDirectory = path.join(registeredDirectory, "batches", batchId);
  assert(path.basename(resolvedArtifactPath) === expectedFileName, `${errorPrefix} must use ${expectedFileName}`, errors);
  assert(path.dirname(resolvedArtifactPath) === expectedDirectory, `${errorPrefix} must reside in its registered batch directory`, errors);
  try {
    const realAuthorityDirectory = fs.realpathSync(registeredDirectory);
    const realExpectedDirectory = fs.realpathSync(expectedDirectory);
    const realArtifactPath = fs.realpathSync(resolvedArtifactPath);
    assert(isPathInside(realExpectedDirectory, realAuthorityDirectory), `${errorPrefix} batch directory is outside the registered output directory`, errors);
    assert(path.dirname(realArtifactPath) === realExpectedDirectory, `${errorPrefix} batch directory must not use a symlinked artifact path`, errors);
  } catch (error) {
    errors.push(`${errorPrefix} partial batch authority path cannot be verified (${error instanceof Error ? error.message : String(error)})`);
  }
}

function stateIndex(status) {
  return EXPECTED_STATES.indexOf(status);
}

function progressionStatus(target) {
  return target?.status === "blocked"
    ? (target.blocked_from_status ?? target.blockedFromStatus)
    : target?.status;
}

function valueType(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  if (Number.isInteger(value)) {
    return "integer";
  }
  return typeof value;
}

function typeMatches(value, expected) {
  if (expected === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (expected === "integer") {
    return Number.isInteger(value);
  }
  if (expected === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  return valueType(value) === expected;
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameRecordValues(left, right) {
  if (
    left === null ||
    right === null ||
    typeof left !== "object" ||
    typeof right !== "object" ||
    Array.isArray(left) ||
    Array.isArray(right)
  ) {
    return false;
  }
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return (
    sameValue(leftKeys, rightKeys) &&
    leftKeys.every((key) => sameValue(left[key], right[key]))
  );
}

function resolveRef(rootSchema, ref) {
  if (!ref.startsWith("#/")) {
    throw new Error(`unsupported_schema_ref=${ref}`);
  }

  return ref
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((node, part) => node?.[part], rootSchema);
}

function validateNode(value, schema, rootSchema, instancePath, errors) {
  if (schema.$ref) {
    const target = resolveRef(rootSchema, schema.$ref);
    if (!target) {
      errors.push(`${instancePath}: unresolved $ref ${schema.$ref}`);
      return;
    }
    validateNode(value, target, rootSchema, instancePath, errors);
    return;
  }

  if (schema.oneOf) {
    const branchResults = schema.oneOf.map((branch) => {
      const branchErrors = [];
      validateNode(value, branch, rootSchema, instancePath, branchErrors);
      return branchErrors;
    });
    const passCount = branchResults.filter((branchErrors) => branchErrors.length === 0).length;
    if (passCount !== 1) {
      const firstDetails = branchResults
        .map((branchErrors, index) => `branch_${index + 1}=${branchErrors.slice(0, 2).join("; ")}`)
        .join(" | ");
      errors.push(`${instancePath}: oneOf matched ${passCount} branches (${firstDetails})`);
    }
    return;
  }

  if (schema.type) {
    const allowedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!allowedTypes.some((expected) => typeMatches(value, expected))) {
      errors.push(`${instancePath}: expected type ${allowedTypes.join("|")}, got ${valueType(value)}`);
      return;
    }
  }

  if (Object.hasOwn(schema, "const") && !sameValue(value, schema.const)) {
    errors.push(`${instancePath}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum && !schema.enum.some((entry) => sameValue(value, entry))) {
    errors.push(`${instancePath}: value ${JSON.stringify(value)} is not in enum`);
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${instancePath}: string shorter than minLength ${schema.minLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${instancePath}: string does not match ${schema.pattern}`);
    }
  }

  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${instancePath}: number is below minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${instancePath}: number is above maximum ${schema.maximum}`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${instancePath}: array has fewer than ${schema.minItems} items`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${instancePath}: array has more than ${schema.maxItems} items`);
    }
    if (schema.uniqueItems) {
      const serialized = value.map((entry) => JSON.stringify(entry));
      if (new Set(serialized).size !== serialized.length) {
        errors.push(`${instancePath}: array items are not unique`);
      }
    }
    if (schema.items) {
      value.forEach((entry, index) => {
        validateNode(entry, schema.items, rootSchema, `${instancePath}/${index}`, errors);
      });
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    for (const requiredKey of schema.required ?? []) {
      if (!Object.hasOwn(value, requiredKey)) {
        errors.push(`${instancePath}: missing required property ${requiredKey}`);
      }
    }

    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        validateNode(value[key], propertySchema, rootSchema, `${instancePath}/${key}`, errors);
      }
    }

    if (schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(schema.properties ?? {}));
      for (const key of keys) {
        if (!allowedKeys.has(key)) {
          errors.push(`${instancePath}: unexpected property ${key}`);
        }
      }
    }
  }
}

function schemaErrors(artifact, schema) {
  const errors = [];
  validateNode(artifact, schema, schema, "$", errors);
  return errors;
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function assertAllPermissionsFalse(value, location, errors) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertAllPermissionsFalse(entry, `${location}/${index}`, errors));
    return;
  }
  if (value === null || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (PERMISSION_KEYS.includes(key) && child !== false) {
      errors.push(`${location}/${key}: permission must remain false`);
    }
    assertAllPermissionsFalse(child, `${location}/${key}`, errors);
  }
}

function assertBoundPermissionsMatch(candidatePermissions, evidence, location, label, errors) {
  const permissions = evidence?.permissions;
  const hasPermissionsObject =
    permissions !== null && typeof permissions === "object" && !Array.isArray(permissions);
  assert(hasPermissionsObject, `${label}: permissions object is required`, errors);
  if (!hasPermissionsObject) {
    return;
  }

  assert(
    sameValue(Object.keys(permissions).sort(), [...PERMISSION_KEYS].sort()),
    `${label}: permissions must include exactly the controlled permission keys`,
    errors
  );
  for (const key of PERMISSION_KEYS) {
    assert(permissions[key] === false, `${location}/${key}: permission must remain false`, errors);
  }
  assert(
    PERMISSION_KEYS.every((key) => permissions[key] === candidatePermissions?.[key]),
    `${label}: permissions must exactly match the blocker candidate`,
    errors
  );
}

function validQaCheckVerdict(check, verdict) {
  const allowed = check === "page_api_alignment" ? PAGE_API_ALIGNMENT_VERDICTS : QA_CHECK_VERDICTS;
  return allowed.includes(verdict);
}

function expectedAggregateVerdict(aggregateCheck, rowChecks, rowReviews) {
  if (
    rowReviews.some((row) =>
      rowChecks.some((rowCheck) => row?.checks?.[rowCheck] === "BLOCKED")
    )
  ) {
    return "BLOCKED";
  }
  if (
    aggregateCheck === "page_api_alignment" &&
    rowReviews.length > 0 &&
    rowReviews.every((row) => row?.page_api_alignment_status === "NOT_APPLICABLE")
  ) {
    return "NOT_APPLICABLE";
  }
  return "PASS";
}

function validatePageApiAlignmentStatus(qaReport, rowEvidence, label, errors) {
  const aggregateVerdict = qaReport?.checks?.page_api_alignment;
  const reportStatus = qaReport?.page_api_alignment_status;
  if (aggregateVerdict === "NOT_APPLICABLE") {
    assert(
      reportStatus === "NOT_APPLICABLE",
      `${label}: NOT_APPLICABLE page/API check requires matching report status`,
      errors
    );
    assert(
      rowEvidence?.coverage?.page_api_alignment_status === "NOT_APPLICABLE",
      `${label}: NOT_APPLICABLE page/API check requires matching coverage status`,
      errors
    );
    const rowReviews = Array.isArray(rowEvidence?.row_reviews) ? rowEvidence.row_reviews : [];
    assert(
      rowReviews.length > 0 &&
        rowReviews.every((row) => row?.page_api_alignment_status === "NOT_APPLICABLE"),
      `${label}: NOT_APPLICABLE page/API check requires every row to be candidate-only`,
      errors
    );
    return;
  }
  assert(
    reportStatus === undefined || reportStatus === aggregateVerdict,
    `${label}: page/API report status must match its aggregate check`,
    errors
  );
}

function validateBlockedAggregateRows(
  qaReport,
  rowEvidence,
  expectedRowChecks,
  aggregateToRowChecks,
  label,
  errors
) {
  assert(
    sameValue(Object.keys(qaReport?.checks ?? {}).sort(), [...EXPECTED_QA_CHECKS].sort()),
    `${label}: W9 QA report must include every required check`,
    errors
  );
  assert(
    EXPECTED_QA_CHECKS.every((check) => validQaCheckVerdict(check, qaReport?.checks?.[check])),
    `${label}: every W9 QA check must use an allowed verdict`,
    errors
  );
  assert(
    EXPECTED_QA_CHECKS.some((check) => qaReport?.checks?.[check] === "BLOCKED"),
    `${label}: W9 BLOCKED verdict requires at least one blocked QA check`,
    errors
  );
  assert(
    sameRecordValues(rowEvidence?.required_checks, qaReport?.checks),
    `${label}: W9 row evidence aggregate checks must match the independent QA report`,
    errors
  );

  const rowReviews = Array.isArray(rowEvidence?.row_reviews) ? rowEvidence.row_reviews : [];
  validatePageApiAlignmentStatus(qaReport, rowEvidence, label, errors);
  for (const rowReview of rowReviews) {
    assert(
      sameValue(Object.keys(rowReview?.checks ?? {}).sort(), [...expectedRowChecks].sort()),
      `${label}: every W9 row review must include every required row check`,
      errors
    );
    assert(
      expectedRowChecks.every((check) => ["PASS", "BLOCKED"].includes(rowReview?.checks?.[check])),
      `${label}: every W9 row review check must be PASS or BLOCKED`,
      errors
    );
  }
  for (const [aggregateCheck, rowChecks] of Object.entries(aggregateToRowChecks)) {
    const expectedVerdict = expectedAggregateVerdict(aggregateCheck, rowChecks, rowReviews);
    assert(
      qaReport?.checks?.[aggregateCheck] === expectedVerdict,
      `${label}: W9 aggregate check ${aggregateCheck} must match the row reviews`,
      errors
    );
  }
}

function validateBlockedRowSubstance(rowEvidence, expectedRowChecks, label, errors) {
  const rowReviews = Array.isArray(rowEvidence?.row_reviews) ? rowEvidence.row_reviews : [];
  assert(
    Array.isArray(rowEvidence?.row_reviews),
    `${label}: W9 row_reviews must be an array`,
    errors
  );
  for (const rowReview of rowReviews) {
    assert(
      rowReview?.title_excerpt_full_body_reviewed === true,
      `${label}: every W9 row review must confirm title, excerpt, and full body review`,
      errors
    );
    const expectedRowVerdict = expectedRowChecks.some(
      (check) => rowReview?.checks?.[check] === "BLOCKED"
    )
      ? "BLOCKED"
      : "PASS";
    assert(
      rowReview?.verdict === expectedRowVerdict,
      `${label}: every W9 row review verdict must match its row checks`,
      errors
    );
    assert(
      typeof rowReview?.evidence === "string" && rowReview.evidence.trim().length > 0,
      `${label}: every W9 row review must include substantive evidence`,
      errors
    );
  }
}

function validateAggregateEvidence(rowEvidence, label, errors) {
  assert(
    sameValue(
      Object.keys(rowEvidence?.check_evidence ?? {}).sort(),
      [...EXPECTED_QA_CHECKS].sort()
    ),
    `${label}: W9 row evidence must include substantive evidence for every aggregate check`,
    errors
  );
  for (const check of EXPECTED_QA_CHECKS) {
    assert(
      typeof rowEvidence?.check_evidence?.[check] === "string" &&
        rowEvidence.check_evidence[check].trim().length > 0,
      `${label}: W9 aggregate check ${check} must include substantive evidence`,
      errors
    );
  }
}

function hasDependencyCycle(lanes) {
  const dependencies = new Map(lanes.map((lane) => [lane.lane_id, lane.dependencies]));
  const visiting = new Set();
  const visited = new Set();

  function visit(laneId) {
    if (visiting.has(laneId)) {
      return true;
    }
    if (visited.has(laneId)) {
      return false;
    }
    visiting.add(laneId);
    for (const dependency of dependencies.get(laneId) ?? []) {
      if (visit(dependency)) {
        return true;
      }
    }
    visiting.delete(laneId);
    visited.add(laneId);
    return false;
  }

  return lanes.some((lane) => visit(lane.lane_id));
}

function validateMasterInvariants(manifest) {
  const errors = [];
  const lanes = manifest.lanes ?? [];
  const assets = manifest.assets ?? [];
  const laneIds = lanes.map((lane) => lane.lane_id);
  const outputDirectories = lanes.map((lane) => lane.output_directory);
  const producerIds = lanes.filter((lane) => lane.lane_kind === "producer").map((lane) => lane.lane_id);
  const qaIds = lanes.filter((lane) => lane.lane_kind === "independent_qa").map((lane) => lane.lane_id);

  assert(sameValue(laneIds, EXPECTED_LANE_IDS), "lanes must be ordered W1 through W9", errors);
  assert(sameValue(producerIds, EXPECTED_PRODUCER_IDS), "exactly W1 through W8 must be producer lanes", errors);
  assert(sameValue(qaIds, ["W9"]), "W9 must be the only independent QA lane", errors);
  assert(new Set(outputDirectories).size === outputDirectories.length, "lane output directories must be unique", errors);
  assert(
    manifest.authority.controlled_transition_approval_directory ===
      "generated/en-content-parity/CONTROL-approvals/",
    "CONTROL approval authority directory drifted",
    errors
  );
  assert(
    !outputDirectories.includes(manifest.authority.controlled_transition_approval_directory),
    "CONTROL approval authority directory must not overlap a lane output directory",
    errors
  );
  assert(!hasDependencyCycle(lanes), "lane dependency graph must be acyclic", errors);

  const knownLaneIds = new Set(laneIds);
  for (const lane of lanes) {
    if (lane.status === "blocked") {
      assert(
        stateIndex(lane.blocked_from_status) >= 0,
        `${lane.lane_id}: blocked state must retain a valid blocked_from_status`,
        errors
      );
    } else {
      assert(
        lane.blocked_from_status === null,
        `${lane.lane_id}: blocked_from_status must be null while the lane is not blocked`,
        errors
      );
    }
    for (const dependency of lane.dependencies) {
      assert(knownLaneIds.has(dependency), `${lane.lane_id}: unknown dependency ${dependency}`, errors);
      assert(dependency !== lane.lane_id, `${lane.lane_id}: self dependency is forbidden`, errors);
    }
  }

  assert(sameValue(manifest.state_machine.ordered_states, EXPECTED_STATES), "ordered state machine must match the control contract", errors);
  assert(sameValue(manifest.handoff_contract.required_files, EXPECTED_HANDOFF_FILES), "handoff file list or order drifted", errors);
  assert(sameValue(manifest.launch_policy.first_wave, EXPECTED_FIRST_WAVE), "first wave must be W1, W2, W3", errors);

  for (const laneId of EXPECTED_LAUNCH_READY_PRODUCER_IDS) {
    const lane = lanes.find((entry) => entry.lane_id === laneId);
    assert(lane?.launch_state === "launch_ready", `${laneId}: expected launch_ready`, errors);
  }
  for (const laneId of EXPECTED_REGISTERED_PRODUCER_IDS) {
    const lane = lanes.find((entry) => entry.lane_id === laneId);
    assert(lane?.launch_state === "registered", `${laneId}: expected registered launch state`, errors);
  }
  const qaLane = lanes.find((entry) => entry.lane_id === "W9");
  assert(qaLane?.launch_state === "waiting_for_first_package", "W9 must wait for the first frozen package", errors);

  for (const [laneId, expectedSubscopes] of EXPECTED_SPLIT_SUBSCOPES_BY_LANE) {
    const lane = lanes.find((entry) => entry.lane_id === laneId);
    assert(
      sameValue(
        lane?.subscopes?.map((scope) => ({
          id: scope.id,
          sequence: scope.sequence,
          resource: scope.resource,
          output_subdirectory: scope.output_subdirectory,
          asset_ids: scope.asset_ids,
        })),
        expectedSubscopes
      ),
      `${laneId} must retain its complete ordered independent package registry`,
      errors
    );
  }
  for (const lane of lanes.filter((entry) => entry.lane_kind === "producer" && entry.subscopes.length > 0)) {
    const subscopeOutputDirectories = lane.subscopes.map(
      (subscope) => subscope.output_subdirectory
    );
    assert(
      new Set(subscopeOutputDirectories).size === subscopeOutputDirectories.length,
      `${lane.lane_id} subscope output directories must be unique`,
      errors
    );
    for (const subscope of lane.subscopes) {
      if (subscope.status === "blocked") {
        assert(
          stateIndex(subscope.blocked_from_status) >= 0,
          `${subscope.id}: blocked state must retain a valid blocked_from_status`,
          errors
        );
      } else {
        assert(
          subscope.blocked_from_status === null,
          `${subscope.id}: blocked_from_status must be null while the subscope is not blocked`,
          errors
        );
      }
      assert(subscope.separate_package_required === true, `${subscope.id}: separate package must be required`, errors);
      assert(subscope.same_pr_allowed === false, `${subscope.id}: same PR must be forbidden`, errors);
      assert(stateIndex(subscope.status) >= 0 || subscope.status === "blocked", `${subscope.id}: invalid subscope status`, errors);
      for (const assetId of subscope.asset_ids ?? []) {
        assert(
          assets.some((asset) => asset.asset_id === assetId && asset.lane_id === lane.lane_id),
          `${subscope.id}: unknown or cross-lane asset ${assetId}`,
          errors
        );
      }
    }
    const subscopeAssetIds = lane.subscopes.flatMap((subscope) => subscope.asset_ids ?? []);
    assert(
      new Set(subscopeAssetIds).size === subscopeAssetIds.length,
      `${lane.lane_id} subscope asset assignments must be unique`,
      errors
    );
    assert(
      sameValue(
        [...subscopeAssetIds].sort(),
        assets
          .filter((asset) => asset.lane_id === lane.lane_id)
          .map((asset) => asset.asset_id)
          .sort()
      ),
      `${lane.lane_id} subscopes must account for every lane asset cohort`,
      errors
    );
    if (lane.subscopes.some((subscope) => subscope.status === "blocked")) {
      assert(
        lane.status === "blocked",
        `${lane.lane_id} aggregate status must be blocked when a subscope is blocked`,
        errors
      );
    } else {
      const minimumSubscopeIndex = Math.min(
        ...lane.subscopes.map((subscope) => stateIndex(subscope.status))
      );
      assert(
        stateIndex(lane.status) === minimumSubscopeIndex,
        `${lane.lane_id} aggregate status must equal the least-progressed subscope`,
        errors
      );
    }
  }

  const assetIds = assets.map((asset) => asset.asset_id);
  const translationGroups = assets.map((asset) => asset.translation_group);
  assert(new Set(assetIds).size === assetIds.length, "asset IDs must be unique", errors);
  assert(new Set(translationGroups).size === translationGroups.length, "translation groups must be unique", errors);

  for (const laneId of EXPECTED_PRODUCER_IDS) {
    assert(assets.some((asset) => asset.lane_id === laneId), `${laneId}: at least one asset cohort is required`, errors);
  }
  for (const asset of assets) {
    const counts = [asset.expected_en_count, asset.current_en_count, asset.remaining_en_count];
    const allKnown = counts.every(Number.isInteger);
    const allUnknown = counts.every((count) => count === null);
    assert(allKnown || allUnknown, `${asset.asset_id}: counts must be all known or all null`, errors);
    if (allKnown) {
      assert(
        asset.expected_en_count === asset.current_en_count + asset.remaining_en_count,
        `${asset.asset_id}: expected count must equal current plus remaining`,
        errors
      );
    }
  }
  for (const lane of lanes.filter((entry) => entry.lane_kind === "producer")) {
    const laneAssets = assets.filter((asset) => asset.lane_id === lane.lane_id);
    const unknownInventoryCount = laneAssets.filter((asset) => asset.expected_en_count === null).length;
    assert(
      lane.counts.cohort_count === laneAssets.length,
      `${lane.lane_id}: lane cohort count must match registered assets`,
      errors
    );
    assert(
      lane.counts.unknown_inventory_cohorts === unknownInventoryCount,
      `${lane.lane_id}: unknown inventory count must match registered assets`,
      errors
    );
    if (unknownInventoryCount > 0) {
      assert(
        [lane.counts.expected_en_assets, lane.counts.current_en_assets, lane.counts.remaining_en_assets].every(
          (count) => count === null
        ),
        `${lane.lane_id}: aggregate counts must remain null while inventory is unknown`,
        errors
      );
    } else {
      assert(
        lane.counts.expected_en_assets ===
          laneAssets.reduce((total, asset) => total + asset.expected_en_count, 0),
        `${lane.lane_id}: expected aggregate count must match registered assets`,
        errors
      );
      assert(
        lane.counts.current_en_assets === laneAssets.reduce((total, asset) => total + asset.current_en_count, 0),
        `${lane.lane_id}: current aggregate count must match registered assets`,
        errors
      );
      assert(
        lane.counts.remaining_en_assets ===
          laneAssets.reduce((total, asset) => total + asset.remaining_en_count, 0),
        `${lane.lane_id}: remaining aggregate count must match registered assets`,
        errors
      );
    }
  }
  const assertInventoryRemainsFrozen = (target, targetAssets, targetId) => {
    if (stateIndex(progressionStatus(target)) < stateIndex("inventory_frozen")) {
      return;
    }
    assert(
      targetAssets.every((asset) =>
        [asset.expected_en_count, asset.current_en_count, asset.remaining_en_count].every(Number.isInteger)
      ),
      `${targetId}: progressed master state requires known inventory counts`,
      errors
    );
    assert(
      targetAssets.every((asset) => asset.parity_state !== "inventory_required"),
      `${targetId}: progressed master state cannot retain inventory_required assets`,
      errors
    );
  };
  for (const lane of lanes.filter((entry) => entry.lane_kind === "producer" && entry.subscopes.length === 0)) {
    assertInventoryRemainsFrozen(
      lane,
      assets.filter((asset) => asset.lane_id === lane.lane_id),
      lane.lane_id
    );
  }
  for (const lane of lanes.filter((entry) => entry.lane_kind === "producer" && entry.subscopes.length > 0)) {
    for (const subscope of lane.subscopes) {
      assertInventoryRemainsFrozen(
        subscope,
        assets.filter((asset) => subscope.asset_ids.includes(asset.asset_id)),
        subscope.id
      );
      validateGateLineage(subscope, subscope.id, lane.lane_id, errors);
    }
  }
  for (const lane of lanes.filter((entry) => entry.lane_kind === "producer" && entry.subscopes.length === 0)) {
    validateGateLineage(lane, lane.lane_id, lane.lane_id, errors);
  }

  assert(
    manifest.existing_state_reference.path === "generated/fermatmind-content-agent-state/",
    "existing career state reference drifted",
    errors
  );
  assert(
    fs.existsSync(path.join(ROOT, manifest.existing_state_reference.path, "global_content_state.json")),
    "existing career state must be present and referenced in place",
    errors
  );

  assertAllPermissionsFalse(manifest, "$", errors);
  return errors;
}

function validateAssetCollection(assets, location, errors) {
  const assetIds = assets.map((asset) => asset.asset_id);
  const translationGroups = assets.map((asset) => asset.translation_group);
  assert(new Set(assetIds).size === assetIds.length, `${location}: asset IDs must be unique`, errors);
  assert(
    new Set(translationGroups).size === translationGroups.length,
    `${location}: translation groups must be unique`,
    errors
  );

  for (const asset of assets) {
    const counts = [asset.expected_en_count, asset.current_en_count, asset.remaining_en_count];
    const allKnown = counts.every(Number.isInteger);
    const allUnknown = counts.every((count) => count === null);
    assert(allKnown || allUnknown, `${location}/${asset.asset_id}: counts must be all known or all null`, errors);
    if (allKnown) {
      assert(
        asset.expected_en_count === asset.current_en_count + asset.remaining_en_count,
        `${location}/${asset.asset_id}: expected count must equal current plus remaining`,
        errors
      );
    }
  }
}

function targetAssets(manifest, lane, packageTarget) {
  const registeredAssetIds =
    packageTarget?.assetIds ??
    manifest.assets.filter((asset) => asset.lane_id === lane?.lane_id).map((asset) => asset.asset_id);
  return manifest.assets.filter((asset) => registeredAssetIds.includes(asset.asset_id));
}

function validateGateLineage(target, targetId, ownerLaneId, errors) {
  const lineage = Array.isArray(target?.gate_lineage) ? target.gate_lineage : [];
  if (target?.status === "blocked") {
    assert(
      stateIndex(target?.blocked_from_status) >= 0,
      `${targetId}: blocked state must retain a valid blocked_from_status`,
      errors
    );
  } else {
    assert(
      target?.blocked_from_status === null,
      `${targetId}: blocked_from_status must be null while the target is not blocked`,
      errors
    );
  }
  const currentIndex = stateIndex(progressionStatus(target));
  const packageFrozenIndex = stateIndex("package_frozen");
  const qaPassIndex = stateIndex("qa_pass");

  if (currentIndex < packageFrozenIndex) {
    assert(target?.package_sha256 === null, `${targetId}: package SHA cannot be recorded before package_frozen`, errors);
    assert(target?.qa_report_ref === null, `${targetId}: QA report cannot be recorded before qa_pass`, errors);
    assert(lineage.length === 0, `${targetId}: gate lineage cannot start before package_frozen`, errors);
    return;
  }

  assert(
    typeof target?.package_sha256 === "string" && /^[a-f0-9]{64}$/.test(target.package_sha256),
    `${targetId}: package_frozen and later states require package_sha256`,
    errors
  );
  const expectedLineageStatuses = EXPECTED_STATES.slice(packageFrozenIndex, currentIndex + 1);
  if (target?.status === "blocked") {
    expectedLineageStatuses.push("blocked");
  }
  assert(
    sameValue(
      lineage.map((entry) => entry.status),
      expectedLineageStatuses
    ),
    `${targetId}: gate lineage must contain every achieved state from package_frozen without gaps`,
    errors
  );
  for (const entry of lineage) {
    assert(
      entry.package_sha256 === target.package_sha256,
      `${targetId}: gate lineage must retain the immutable package_frozen SHA`,
      errors
    );
    if (entry.status === "blocked") {
      assert(
        ["W9", ownerLaneId].includes(entry.evidence_owner_lane_id),
        `${targetId}: blocked evidence owner must be W9 or ${ownerLaneId}`,
        errors
      );
      continue;
    }
    const expectedOwner =
      entry.status === "qa_pass"
        ? "W9"
        : ["draft_imported", "published"].includes(entry.status)
          ? "CONTROL"
          : ownerLaneId;
    assert(
      entry.evidence_owner_lane_id === expectedOwner,
      `${targetId}: ${entry.status} evidence owner must be ${expectedOwner}`,
      errors
    );
  }

  if (currentIndex >= qaPassIndex) {
    const qaEntry = lineage.find((entry) => entry.status === "qa_pass");
    assert(
      typeof target?.qa_report_ref === "string" && target.qa_report_ref.length > 0,
      `${targetId}: qa_pass and later states require qa_report_ref`,
      errors
    );
    assert(
      qaEntry?.report_ref === target?.qa_report_ref,
      `${targetId}: qa_report_ref must match the retained qa_pass lineage report`,
      errors
    );
  } else {
    assert(target?.qa_report_ref === null, `${targetId}: QA report cannot be recorded before qa_pass`, errors);
  }
}

function registeredPackageTarget(lane, subscopeId) {
  if (!lane) {
    return null;
  }
  if (lane.subscopes?.length > 0) {
    const subscope = lane.subscopes.find((entry) => entry.id === subscopeId);
    if (!subscope) {
      return null;
    }
    return {
      status: subscope.status,
      outputDirectory: `${lane.output_directory}${subscope.output_subdirectory}/`,
      assetIds: subscope.asset_ids,
      sequence: subscope.sequence,
      packageSha256: subscope.package_sha256,
      qaReportRef: subscope.qa_report_ref,
      gateLineage: subscope.gate_lineage,
      blockedFromStatus: subscope.blocked_from_status,
    };
  }
  if (subscopeId !== null) {
    return null;
  }
  return {
    status: lane.status,
    outputDirectory: lane.output_directory,
    assetIds: null,
    sequence: null,
    packageSha256: lane.package_sha256,
    qaReportRef: lane.qa_report_ref,
    gateLineage: lane.gate_lineage,
    blockedFromStatus: lane.blocked_from_status,
  };
}

function validateSubscopeSequence(lane, packageTarget, proposedStatus, errors) {
  if (!lane?.subscopes?.length || !packageTarget || packageTarget.sequence <= 1 || proposedStatus === "blocked") {
    return;
  }
  if (stateIndex(proposedStatus) <= stateIndex("inventory_frozen")) {
    return;
  }
  const predecessor = lane.subscopes.find((subscope) => subscope.sequence === packageTarget.sequence - 1);
  assert(
    predecessor && stateIndex(progressionStatus(predecessor)) >= stateIndex("package_frozen"),
    `${lane.lane_id}: predecessor ${predecessor?.id ?? "subscope"} must reach package_frozen before this subscope starts`,
    errors
  );
}

function validatePackageShaManifest(
  artifact,
  registeredLane,
  manifest,
  manifestSha256,
  schema,
  artifactPath,
  errors
) {
  let shaManifest;
  let shaManifestPath;
  try {
    shaManifestPath = path.isAbsolute(artifact.sha256_manifest_path)
      ? artifact.sha256_manifest_path
      : path.join(ROOT, artifact.sha256_manifest_path);
    assert(
      path.basename(shaManifestPath) === "sha256_manifest.json",
      `${artifact.lane_id}: sha256_manifest_path must name sha256_manifest.json`,
      errors
    );
    const candidatePath = path.isAbsolute(artifactPath) ? artifactPath : path.join(ROOT, artifactPath);
    assert(
      path.basename(candidatePath) === "master_manifest_patch.candidate.json",
      `${artifact.lane_id}: candidate patch must use the registered handoff filename`,
      errors
    );
    const isIndependentQaBlocker =
      artifact.proposed_status === "blocked" &&
      artifact.gate_evidence?.owner_lane_id === "W9" &&
      artifact.gate_evidence?.report_in_package === false;
    if (!isIndependentQaBlocker) {
      assert(
        path.dirname(candidatePath) === path.dirname(shaManifestPath),
        `${artifact.lane_id}: candidate patch and SHA manifest must share one package directory`,
        errors
      );
    }
    shaManifest = JSON.parse(fs.readFileSync(shaManifestPath, "utf8"));
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot read sha256 manifest (${error instanceof Error ? error.message : String(error)})`
    );
    return;
  }

  assert(
    shaManifest.schema_version === "fermatmind.en_content_parity_package_sha256_manifest.v1",
    `${artifact.lane_id}: package SHA manifest schema version is invalid`,
    errors
  );
  assert(shaManifest.lane_id === artifact.lane_id, `${artifact.lane_id}: package SHA manifest lane mismatch`, errors);
  assert(
    shaManifest.subscope_id === artifact.subscope_id,
    `${artifact.lane_id}: package SHA manifest subscope mismatch`,
    errors
  );
  assert(
    shaManifest.package_id === artifact.package_id,
    `${artifact.lane_id}: package SHA manifest package_id mismatch`,
    errors
  );
  assert(Array.isArray(shaManifest.files), `${artifact.lane_id}: package SHA manifest files must be an array`, errors);
  if (!Array.isArray(shaManifest.files)) {
    return;
  }

  const filePaths = shaManifest.files.map((file) => file?.path);
  assert(
    sameValue(filePaths, IMMUTABLE_PACKAGE_PAYLOAD_FILES),
    `${artifact.lane_id}: package SHA manifest must cover the eight immutable payload files in order`,
    errors
  );

  const packageDirectory = path.dirname(shaManifestPath);
  const packageTarget = registeredPackageTarget(registeredLane, artifact.subscope_id);
  const registeredPackageDirectory = path.resolve(ROOT, packageTarget?.outputDirectory ?? "");
  const partialBatch = isPartialBatchWitness(artifact);
  const expectedPartialPackageDirectory = partialBatch
    ? path.join(registeredPackageDirectory, "batches", artifact.partial_batch.batch_id)
    : null;
  const isIndependentQaBlocker =
    artifact.proposed_status === "blocked" &&
    artifact.gate_evidence?.owner_lane_id === "W9" &&
    artifact.gate_evidence?.report_in_package === false;
  const isIndependentQaPass =
    artifact.proposed_status === "qa_pass" &&
    artifact.gate_evidence?.owner_lane_id === "W9" &&
    artifact.gate_evidence?.report_in_package === false;
  const qaLane = manifest.lanes.find((lane) => lane.lane_id === "W9");
  const qaAuthorityDirectory = path.resolve(ROOT, qaLane?.output_directory ?? "");
  const usesIndependentQaFrozenSnapshot =
    (isIndependentQaBlocker || isIndependentQaPass) &&
    path.basename(path.resolve(packageDirectory)) === "frozen_package" &&
    isPathInside(path.resolve(packageDirectory), qaAuthorityDirectory);
  assert(
    usesIndependentQaFrozenSnapshot ||
      path.resolve(packageDirectory) === (partialBatch ? expectedPartialPackageDirectory : registeredPackageDirectory),
    `${artifact.lane_id}: package files must reside directly inside the registered output directory or an independent W9 frozen_package directory`,
    errors
  );
  try {
    const realPackageDirectory = fs.realpathSync(packageDirectory);
    if (usesIndependentQaFrozenSnapshot) {
      const realQaAuthorityDirectory = fs.realpathSync(qaAuthorityDirectory);
      assert(
        path.basename(realPackageDirectory) === "frozen_package" &&
          isPathInside(realPackageDirectory, realQaAuthorityDirectory),
        `${artifact.lane_id}: independent W9 frozen package path is outside QA authority`,
        errors
      );
    } else {
      const realRegisteredDirectory = fs.realpathSync(registeredPackageDirectory);
      const realExpectedPackageDirectory = partialBatch
        ? fs.realpathSync(expectedPartialPackageDirectory)
        : realRegisteredDirectory;
      assert(
        realPackageDirectory === realExpectedPackageDirectory,
        `${artifact.lane_id}: package files must reside directly inside the registered output directory`,
        errors
      );
      if (partialBatch) {
        assert(
          isPathInside(realPackageDirectory, realRegisteredDirectory),
          `${artifact.lane_id}: partial batch package directory is outside the registered output directory`,
          errors
        );
      }
    }
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: package output authority path cannot be verified (${error instanceof Error ? error.message : String(error)})`
    );
  }
  for (const file of shaManifest.files) {
    if (!file || typeof file.path !== "string" || typeof file.sha256 !== "string") {
      errors.push(`${artifact.lane_id}: package SHA manifest contains a malformed file entry`);
      continue;
    }
    assert(
      /^[a-f0-9]{64}$/.test(file.sha256),
      `${artifact.lane_id}: package SHA manifest contains an invalid SHA for ${file.path}`,
      errors
    );
    if (!IMMUTABLE_PACKAGE_PAYLOAD_FILES.includes(file.path)) {
      continue;
    }
    const payloadPath = path.join(packageDirectory, file.path);
    if (!fs.existsSync(payloadPath) || !fs.statSync(payloadPath).isFile()) {
      errors.push(`${artifact.lane_id}: package payload file is missing: ${file.path}`);
      continue;
    }
    assert(
      sha256File(payloadPath) === file.sha256,
      `${artifact.lane_id}: package payload SHA mismatch: ${file.path}`,
      errors
    );
  }

  const recomputedPackageSha256 = packageSha256(shaManifest.files);
  assert(
    shaManifest.package_sha256 === recomputedPackageSha256,
    `${artifact.lane_id}: package SHA manifest aggregate does not match its file entries`,
    errors
  );
  const verifiedExternalPackageSha256 = validateExternalPackageEvidence(
    artifact,
    packageDirectory,
    errors
  );
  if (artifact.external_package_evidence) {
    assert(
      artifact.package_sha256 === verifiedExternalPackageSha256,
      `${artifact.lane_id}: package_sha256 must match the verified external package evidence`,
      errors
    );
  } else {
    assert(
      artifact.package_sha256 === recomputedPackageSha256,
      `${artifact.lane_id}: package_sha256 must match the verified handoff package`,
      errors
    );
  }

  if (artifact.gate_evidence.report_in_package) {
    const gateReport = shaManifest.files.find((file) => file.path === artifact.gate_evidence.report_path);
    assert(Boolean(gateReport), `${artifact.lane_id}: gate evidence report must be covered by the package SHA manifest`, errors);
    assert(
      gateReport?.sha256 === artifact.gate_evidence.report_sha256,
      `${artifact.lane_id}: gate evidence report SHA must match the package SHA manifest`,
      errors
    );
  }

  try {
    const scopeManifestPath = path.join(packageDirectory, "scope_manifest.json");
    const scopeManifest = JSON.parse(fs.readFileSync(scopeManifestPath, "utf8"));
    errors.push(
      ...schemaErrors(scopeManifest, schema).map(
        (error) => `${artifact.lane_id}: embedded scope manifest Schema error: ${error}`
      )
    );
    errors.push(
      ...validateLeafInvariants(
        scopeManifest,
        manifest,
        manifestSha256,
        scopeManifestPath,
        schema,
        { skipArtifactAuthorityPath: usesIndependentQaFrozenSnapshot }
      ).map(
        (error) => `${artifact.lane_id}: embedded scope manifest invariant error: ${error}`
      )
    );
    assert(scopeManifest.artifact_kind === "lane_package", `${artifact.lane_id}: package scope manifest kind is invalid`, errors);
    assert(scopeManifest.lane_id === artifact.lane_id, `${artifact.lane_id}: package scope manifest lane mismatch`, errors);
    assert(
      scopeManifest.subscope_id === artifact.subscope_id,
      `${artifact.lane_id}: package scope manifest subscope mismatch`,
      errors
    );
    assert(
      scopeManifest.package_id === artifact.package_id,
      `${artifact.lane_id}: package scope manifest package_id mismatch`,
      errors
    );
    const expectedScopeStatus =
      stateIndex(progressionStatus(packageTarget)) >= stateIndex("package_frozen")
        ? "package_frozen"
        : artifact.proposed_status;
    assert(
      scopeManifest.status === expectedScopeStatus,
      `${artifact.lane_id}: package scope status must be ${expectedScopeStatus}`,
      errors
    );
    assert(
      scopeManifest.output_directory === packageTarget?.outputDirectory,
      `${artifact.lane_id}: package scope output_directory must match the master registry`,
      errors
    );
    assert(
      sameValue(scopeManifest.assets, artifact.asset_updates),
      `${artifact.lane_id}: package scope assets must exactly match candidate asset_updates`,
      errors
    );
    if (partialBatch) {
      assert(
        sameValue(scopeManifest.partial_batch, artifact.partial_batch),
        `${artifact.lane_id}: package scope partial batch metadata must match candidate`,
        errors
      );
    }
    const assetsContents = fs.readFileSync(path.join(packageDirectory, "assets.jsonl"), "utf8").trim();
    const payloadAssets = assetsContents
      ? assetsContents.split(/\r?\n/).map((line) => JSON.parse(line))
      : [];
    assert(
      sameValue(payloadAssets, artifact.asset_updates),
      `${artifact.lane_id}: assets.jsonl must exactly match candidate asset_updates`,
      errors
    );
    if (
      artifact.proposed_status === "package_frozen" ||
      stateIndex(progressionStatus(packageTarget)) >= stateIndex("package_frozen")
    ) {
      const registeredAssetIds = targetAssets(manifest, registeredLane, packageTarget).map(
        (asset) => asset.asset_id
      );
      assert(
        sameValue(
          artifact.asset_updates.map((asset) => asset.asset_id).sort(),
          [...registeredAssetIds].sort()
        ),
        `${artifact.lane_id}: package_frozen requires the complete registered target asset set`,
        errors
      );
    }
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot read package scope manifest (${error instanceof Error ? error.message : String(error)})`
    );
  }
  return { packageDirectory, shaManifest };
}

function validateInPackageGateEvidence(artifact, packageContext, errors) {
  if (!packageContext || !artifact.gate_evidence.report_in_package) {
    return;
  }
  const expectedReportPath = IN_PACKAGE_GATE_REPORT_FILES[artifact.proposed_status];
  assert(
    artifact.gate_evidence.report_path === expectedReportPath,
    `${artifact.lane_id}: ${artifact.proposed_status} evidence must use ${expectedReportPath ?? "a registered gate report"}`,
    errors
  );
  if (!expectedReportPath) {
    return;
  }

  let report;
  try {
    report = JSON.parse(
      fs.readFileSync(path.join(packageContext.packageDirectory, expectedReportPath), "utf8")
    );
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot parse ${artifact.proposed_status} gate report (${error instanceof Error ? error.message : String(error)})`
    );
    return;
  }

  if (expectedReportPath === "source_ledger.json") {
    assert(
      report.schema_version === "fermatmind.en_content_parity_source_ledger.v1",
      `${artifact.lane_id}: source ledger schema version is invalid`,
      errors
    );
    assert(report.lane_id === artifact.lane_id, `${artifact.lane_id}: source ledger lane mismatch`, errors);
    assert(report.subscope_id === artifact.subscope_id, `${artifact.lane_id}: source ledger subscope mismatch`, errors);
    assert(report.package_id === artifact.package_id, `${artifact.lane_id}: source ledger package mismatch`, errors);
    assert(Array.isArray(report.rows), `${artifact.lane_id}: source ledger rows must be an array`, errors);
    if (Array.isArray(report.rows)) {
      assert(
        report.rows.length === artifact.gate_evidence.row_count,
        `${artifact.lane_id}: source ledger row count must match gate evidence`,
        errors
      );
    }
    return;
  }

  const expectedSchemaVersion =
    expectedReportPath === "editorial_review.json"
      ? "fermatmind.en_content_parity_editorial_review.v1"
      : "fermatmind.en_content_parity_claim_boundary_report.v1";
  const expectedVerdict = expectedReportPath === "editorial_review.json" ? "PASS" : "BLOCKED";
  assert(
    report.schema_version === expectedSchemaVersion,
    `${artifact.lane_id}: ${expectedReportPath} schema version is invalid`,
    errors
  );
  assert(report.lane_id === artifact.lane_id, `${artifact.lane_id}: ${expectedReportPath} lane mismatch`, errors);
  assert(
    report.subscope_id === artifact.subscope_id,
    `${artifact.lane_id}: ${expectedReportPath} subscope mismatch`,
    errors
  );
  assert(
    report.package_id === artifact.package_id,
    `${artifact.lane_id}: ${expectedReportPath} package mismatch`,
    errors
  );
  assert(
    report.verdict === expectedVerdict,
    `${artifact.lane_id}: ${artifact.proposed_status} gate report verdict must be ${expectedVerdict}`,
    errors
  );
}

function validateIndependentQaEvidence(
  artifact,
  manifest,
  schema,
  artifactPath,
  packageContext,
  expectedVerdict,
  errors
) {
  let qaReport;
  let qaReportPath;
  try {
    qaReportPath = path.isAbsolute(artifact.gate_evidence.report_path)
      ? artifact.gate_evidence.report_path
      : path.join(ROOT, artifact.gate_evidence.report_path);
    assert(
      fs.existsSync(qaReportPath) && fs.statSync(qaReportPath).isFile(),
      `${artifact.lane_id}: W9 QA report file is missing`,
      errors
    );
    assert(
      sha256File(qaReportPath) === artifact.gate_evidence.report_sha256,
      `${artifact.lane_id}: W9 QA report SHA mismatch`,
      errors
    );
    qaReport = JSON.parse(fs.readFileSync(qaReportPath, "utf8"));
    const qaAuthorityDirectory = path.join(
      ROOT,
      manifest.lanes.find((lane) => lane.lane_id === "W9")?.output_directory ?? ""
    );
    const realQaAuthorityDirectory = fs.realpathSync(qaAuthorityDirectory);
    const realQaReportPath = fs.realpathSync(qaReportPath);
    assert(
      isPathInside(realQaReportPath, realQaAuthorityDirectory),
      `${artifact.lane_id}: W9 QA report must reside inside the registered W9 authority directory`,
      errors
    );
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot read W9 QA report (${error instanceof Error ? error.message : String(error)})`
    );
    return;
  }

  errors.push(
    ...schemaErrors(qaReport, schema).map(
      (error) => `${artifact.lane_id}: W9 QA report Schema error: ${error}`
    )
  );
  assert(
    qaReport.schema_version === "fermatmind.en_content_parity_independent_qa_report.v1",
    `${artifact.lane_id}: W9 QA report schema version is invalid`,
    errors
  );
  assert(qaReport.artifact_kind === "independent_qa_report", `${artifact.lane_id}: W9 QA report kind is invalid`, errors);
  assert(
    qaReport.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01",
    `${artifact.lane_id}: W9 QA report control ID mismatch`,
    errors
  );
  assertAllPermissionsFalse(qaReport, "$/w9_qa_report", errors);
  assertBoundPermissionsMatch(
    artifact.permissions,
    qaReport,
    "$/w9_qa_report/permissions",
    `${artifact.lane_id}: W9 QA report`,
    errors
  );
  assert(qaReport.qa_lane_id === "W9", `${artifact.lane_id}: qa_pass evidence owner must be W9`, errors);
  assert(
    qaReport.output_directory === manifest.lanes.find((lane) => lane.lane_id === "W9")?.output_directory,
    `${artifact.lane_id}: W9 QA output directory mismatch`,
    errors
  );
  assert(qaReport.producer_lane_id === artifact.lane_id, `${artifact.lane_id}: W9 QA producer lane mismatch`, errors);
  assert(qaReport.subscope_id === artifact.subscope_id, `${artifact.lane_id}: W9 QA subscope mismatch`, errors);
  assert(qaReport.package_sha256 === artifact.package_sha256, `${artifact.lane_id}: W9 QA package SHA mismatch`, errors);
  assert(
    qaReport.verdict === expectedVerdict,
    `${artifact.lane_id}: W9 QA verdict must be ${expectedVerdict}`,
    errors
  );
  assert(
    qaReport.reviewed_row_count === artifact.gate_evidence.row_count,
    `${artifact.lane_id}: W9 QA reviewed row count must match gate evidence`,
    errors
  );
  assert(
    sameValue([...(qaReport.reviewed_asset_ids ?? [])].sort(), [...artifact.gate_evidence.asset_ids].sort()),
    `${artifact.lane_id}: W9 QA reviewed assets must match gate evidence`,
    errors
  );
  assert(
    sameValue(Object.keys(qaReport.checks ?? {}).sort(), [...EXPECTED_QA_CHECKS].sort()),
    `${artifact.lane_id}: W9 QA report must include every required check`,
    errors
  );
  for (const check of EXPECTED_QA_CHECKS) {
    assert(
      validQaCheckVerdict(check, qaReport.checks?.[check]),
      `${artifact.lane_id}: W9 QA check ${check} must be ${
        check === "page_api_alignment" ? "PASS, BLOCKED, or NOT_APPLICABLE" : "PASS or BLOCKED"
      }`,
      errors
    );
  }
  if (expectedVerdict === "PASS") {
    for (const check of EXPECTED_QA_CHECKS) {
      assert(qaReport.checks?.[check] === "PASS", `${artifact.lane_id}: W9 QA check ${check} must PASS`, errors);
    }
  } else {
    assert(
      EXPECTED_QA_CHECKS.some((check) => qaReport.checks?.[check] === "BLOCKED"),
      `${artifact.lane_id}: W9 BLOCKED verdict requires at least one blocked QA check`,
      errors
    );
  }

  if (expectedVerdict !== "BLOCKED") {
    validatePageApiAlignmentStatus(
      qaReport,
      undefined,
      `${artifact.lane_id}: W9 QA report`,
      errors
    );
    return;
  }

  try {
    const producerLane = manifest.lanes.find((lane) => lane.lane_id === artifact.lane_id);
    const reviewedTarget = registeredPackageTarget(producerLane, artifact.subscope_id);
    const registeredTargetAssets = targetAssets(manifest, producerLane, reviewedTarget);
    const expectedReviewedRowCount = registeredTargetAssets.reduce(
      (total, asset) => total + (Number.isInteger(asset.expected_en_count) ? asset.expected_en_count : 0),
      0
    );
    assert(
      artifact.gate_evidence.row_count === expectedReviewedRowCount,
      `${artifact.lane_id}: W9 blocker row count must cover the complete registered target`,
      errors
    );
    assert(
      qaReport.reviewed_row_count === expectedReviewedRowCount,
      `${artifact.lane_id}: W9 blocker report row count must cover the complete registered target`,
      errors
    );
    const qaAuthorityDirectory = fs.realpathSync(
      path.join(ROOT, manifest.lanes.find((lane) => lane.lane_id === "W9")?.output_directory ?? "")
    );
    const candidatePath = fs.realpathSync(
      path.isAbsolute(artifactPath) ? artifactPath : path.join(ROOT, artifactPath)
    );
    assert(
      isPathInside(candidatePath, qaAuthorityDirectory),
      `${artifact.lane_id}: W9 blocker candidate must reside inside the registered W9 authority directory`,
      errors
    );
    const rowEvidence = artifact.gate_evidence.row_evidence;
    assert(Boolean(rowEvidence), `${artifact.lane_id}: W9 blocker candidate must bind row evidence`, errors);
    if (!rowEvidence) {
      return;
    }
    const rowEvidencePath = path.isAbsolute(rowEvidence.path)
      ? rowEvidence.path
      : path.join(ROOT, rowEvidence.path);
    assert(
      fs.existsSync(rowEvidencePath) && fs.statSync(rowEvidencePath).isFile(),
      `${artifact.lane_id}: W9 row evidence file is missing`,
      errors
    );
    assert(
      sha256File(rowEvidencePath) === rowEvidence.sha256,
      `${artifact.lane_id}: W9 row evidence SHA mismatch`,
      errors
    );
    const realRowEvidencePath = fs.realpathSync(rowEvidencePath);
    assert(
      isPathInside(realRowEvidencePath, qaAuthorityDirectory),
      `${artifact.lane_id}: W9 row evidence must reside inside the registered W9 authority directory`,
      errors
    );
    const rowEvidenceArtifact = JSON.parse(fs.readFileSync(rowEvidencePath, "utf8"));
    assertAllPermissionsFalse(rowEvidenceArtifact, "$/w9_row_evidence", errors);
    assertBoundPermissionsMatch(
      artifact.permissions,
      rowEvidenceArtifact,
      "$/w9_row_evidence/permissions",
      `${artifact.lane_id}: W9 row evidence`,
      errors
    );
    validateBlockedAggregateRows(
      qaReport,
      rowEvidenceArtifact,
      EXPECTED_W9_ROW_CHECKS,
      W9_AGGREGATE_TO_ROW_CHECKS,
      artifact.lane_id,
      errors
    );
    assert(
      rowEvidenceArtifact.schema_version === "fermatmind.en_content_parity_independent_qa_row_evidence.v1",
      `${artifact.lane_id}: W9 row evidence schema version is invalid`,
      errors
    );
    assert(
      rowEvidenceArtifact.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01",
      `${artifact.lane_id}: W9 row evidence control ID mismatch`,
      errors
    );
    assert(rowEvidenceArtifact.qa_lane_id === "W9", `${artifact.lane_id}: W9 row evidence owner mismatch`, errors);
    assert(
      rowEvidenceArtifact.producer_lane_id === artifact.lane_id,
      `${artifact.lane_id}: W9 row evidence producer lane mismatch`,
      errors
    );
    assert(
      rowEvidenceArtifact.subscope_id === artifact.subscope_id,
      `${artifact.lane_id}: W9 row evidence subscope mismatch`,
      errors
    );
    assert(
      rowEvidenceArtifact.package_id === artifact.package_id,
      `${artifact.lane_id}: W9 row evidence package ID mismatch`,
      errors
    );
    assert(
      rowEvidenceArtifact.package_sha256 === artifact.package_sha256,
      `${artifact.lane_id}: W9 row evidence package SHA mismatch`,
      errors
    );
    assert(rowEvidenceArtifact.verdict === "BLOCKED", `${artifact.lane_id}: W9 row evidence verdict must be BLOCKED`, errors);
    assert(
      rowEvidenceArtifact.reviewed_row_count === artifact.gate_evidence.row_count,
      `${artifact.lane_id}: W9 row evidence row count must match gate evidence`,
      errors
    );
    assert(
      rowEvidenceArtifact.reviewed_row_count === expectedReviewedRowCount,
      `${artifact.lane_id}: W9 row evidence row count must cover the complete registered target`,
      errors
    );
    assert(
      sameValue(
        [...(rowEvidenceArtifact.reviewed_asset_ids ?? [])].sort(),
        [...artifact.gate_evidence.asset_ids].sort()
      ),
      `${artifact.lane_id}: W9 row evidence assets must match gate evidence`,
      errors
    );
    const sourceLedgerPath = path.join(packageContext?.packageDirectory ?? "", "source_ledger.json");
    assert(
      Boolean(packageContext) && fs.existsSync(sourceLedgerPath) && fs.statSync(sourceLedgerPath).isFile(),
      `${artifact.lane_id}: frozen source ledger is unavailable for W9 row coverage validation`,
      errors
    );
    const sourceLedger = JSON.parse(fs.readFileSync(sourceLedgerPath, "utf8"));
    const frozenRows = Array.isArray(sourceLedger.rows) ? sourceLedger.rows : [];
    const frozenRowIdentityById = new Map(
      frozenRows.map((row) => [
        row?.row_id,
        `${row?.stable_asset_identity}@revision:${row?.source_revision_id}`,
      ])
    );
    const frozenIdentities = frozenRows.map(
      (row) => `${row?.stable_asset_identity}@revision:${row?.source_revision_id}`
    );
    assert(
      frozenRows.length === expectedReviewedRowCount,
      `${artifact.lane_id}: frozen source ledger row count must match the registered target`,
      errors
    );
    assert(
      new Set(frozenIdentities).size === frozenIdentities.length,
      `${artifact.lane_id}: frozen source ledger identities must be unique`,
      errors
    );
    assert(
      frozenRowIdentityById.size === frozenRows.length,
      `${artifact.lane_id}: frozen source ledger row IDs must be unique`,
      errors
    );
    const rowReviews = Array.isArray(rowEvidenceArtifact.row_reviews)
      ? rowEvidenceArtifact.row_reviews
      : [];
    const reviewedRowIds = rowReviews.map((row) => row?.row_id);
    const reviewedIdentities = rowReviews.map((row) => row?.source_identity);
    assert(
      Array.isArray(rowEvidenceArtifact.row_reviews),
      `${artifact.lane_id}: W9 row evidence must include a row_reviews array`,
      errors
    );
    assert(
      rowReviews.length === expectedReviewedRowCount,
      `${artifact.lane_id}: W9 row_reviews must contain every registered target row`,
      errors
    );
    assert(
      new Set(reviewedRowIds).size === reviewedRowIds.length,
      `${artifact.lane_id}: W9 row review IDs must be unique`,
      errors
    );
    assert(
      new Set(reviewedIdentities).size === reviewedIdentities.length,
      `${artifact.lane_id}: W9 row review identities must be unique`,
      errors
    );
    assert(
      sameValue([...reviewedRowIds].sort(), [...frozenRowIdentityById.keys()].sort()),
      `${artifact.lane_id}: W9 row review IDs must exactly cover the frozen target row IDs`,
      errors
    );
    assert(
      sameValue([...reviewedIdentities].sort(), [...frozenIdentities].sort()),
      `${artifact.lane_id}: W9 row review identities must exactly cover the frozen target identities`,
      errors
    );
    validateBlockedRowSubstance(
      rowEvidenceArtifact,
      EXPECTED_W9_ROW_CHECKS,
      artifact.lane_id,
      errors
    );
    for (const rowReview of rowReviews) {
      assert(
        typeof rowReview?.row_id === "string" && rowReview.row_id.length > 0,
        `${artifact.lane_id}: every W9 row review must include a non-empty row_id`,
        errors
      );
      assert(
        frozenRowIdentityById.get(rowReview?.row_id) === rowReview?.source_identity,
        `${artifact.lane_id}: every W9 row review must preserve its frozen row ID and identity pairing`,
        errors
      );
      assert(
        rowReview?.title_excerpt_full_body_reviewed === true,
        `${artifact.lane_id}: every W9 row review must confirm title, excerpt, and full body review`,
        errors
      );
      assert(
        ["PASS", "BLOCKED"].includes(rowReview?.verdict),
        `${artifact.lane_id}: every W9 row review must include a valid verdict`,
        errors
      );
      assert(
        sameValue(Object.keys(rowReview?.checks ?? {}).sort(), [...EXPECTED_W9_ROW_CHECKS].sort()),
        `${artifact.lane_id}: every W9 row review must include every required row check`,
        errors
      );
      assert(
        EXPECTED_W9_ROW_CHECKS.every((check) => ["PASS", "BLOCKED"].includes(rowReview?.checks?.[check])),
        `${artifact.lane_id}: every W9 row review check must be PASS or BLOCKED`,
        errors
      );
      const expectedRowVerdict = EXPECTED_W9_ROW_CHECKS.some(
        (check) => rowReview?.checks?.[check] === "BLOCKED"
      )
        ? "BLOCKED"
        : "PASS";
      assert(
        rowReview?.verdict === expectedRowVerdict,
        `${artifact.lane_id}: every W9 row review verdict must match its row checks`,
        errors
      );
      assert(
        typeof rowReview?.evidence === "string" && rowReview.evidence.trim().length > 0,
        `${artifact.lane_id}: every W9 row review must include substantive evidence`,
        errors
      );
    }
    assert(
      rowReviews.some((row) => row?.verdict === "BLOCKED"),
      `${artifact.lane_id}: W9 BLOCKED evidence requires at least one blocked row review`,
      errors
    );
    assert(
      sameRecordValues(rowEvidenceArtifact.required_checks, qaReport.checks),
      `${artifact.lane_id}: W9 row evidence aggregate checks must match the independent QA report`,
      errors
    );
    validateAggregateEvidence(rowEvidenceArtifact, artifact.lane_id, errors);
    for (const [aggregateCheck, rowChecks] of Object.entries(W9_AGGREGATE_TO_ROW_CHECKS)) {
      const expectedVerdict = expectedAggregateVerdict(aggregateCheck, rowChecks, rowReviews);
      assert(
        qaReport.checks?.[aggregateCheck] === expectedVerdict,
        `${artifact.lane_id}: W9 aggregate check ${aggregateCheck} must match the row reviews`,
        errors
      );
    }
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot validate W9 blocker row evidence (${error instanceof Error ? error.message : String(error)})`
    );
  }
}

function validateExternalTransitionEvidence(artifact, errors) {
  let gateReport;
  let gateReportPath;
  try {
    gateReportPath = path.isAbsolute(artifact.gate_evidence.report_path)
      ? artifact.gate_evidence.report_path
      : path.join(ROOT, artifact.gate_evidence.report_path);
    assert(
      fs.existsSync(gateReportPath) && fs.statSync(gateReportPath).isFile(),
      `${artifact.lane_id}: external transition report file is missing`,
      errors
    );
    assert(
      sha256File(gateReportPath) === artifact.gate_evidence.report_sha256,
      `${artifact.lane_id}: external transition report SHA mismatch`,
      errors
    );
    gateReport = JSON.parse(fs.readFileSync(gateReportPath, "utf8"));
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot read external transition report (${error instanceof Error ? error.message : String(error)})`
    );
    return;
  }

  assert(
    gateReport.schema_version === "fermatmind.en_content_parity_transition_gate_report.v1",
    `${artifact.lane_id}: external transition report schema version is invalid`,
    errors
  );
  assert(
    gateReport.artifact_kind === "transition_gate_report",
    `${artifact.lane_id}: external transition report kind is invalid`,
    errors
  );
  assert(
    gateReport.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01",
    `${artifact.lane_id}: external transition report control ID mismatch`,
    errors
  );
  assertAllPermissionsFalse(gateReport, "$/transition_gate_report", errors);
  assert(
    gateReport.owner_lane_id === artifact.lane_id,
    `${artifact.lane_id}: external transition report owner must match producer lane`,
    errors
  );
  assert(
    gateReport.producer_lane_id === artifact.lane_id,
    `${artifact.lane_id}: external transition report producer lane mismatch`,
    errors
  );
  assert(
    gateReport.subscope_id === artifact.subscope_id,
    `${artifact.lane_id}: external transition report subscope mismatch`,
    errors
  );
  assert(
    gateReport.package_sha256 === artifact.package_sha256,
    `${artifact.lane_id}: external transition report package SHA mismatch`,
    errors
  );
  assert(
    gateReport.gate === artifact.proposed_status,
    `${artifact.lane_id}: external transition report gate mismatch`,
    errors
  );
  assert(
    gateReport.verdict === artifact.gate_evidence.verdict,
    `${artifact.lane_id}: external transition report verdict mismatch`,
    errors
  );

  if (gateReport.gate !== "dry_run_ready") {
    return;
  }

  const evidence = gateReport.dry_run_evidence;
  assert(Boolean(evidence), `${artifact.lane_id}: dry_run_ready requires exact dry-run plan evidence`, errors);
  if (!evidence) {
    return;
  }

  let plan;
  try {
    const planPath = path.isAbsolute(evidence.plan_path)
      ? evidence.plan_path
      : path.join(ROOT, evidence.plan_path);
    const realRoot = fs.realpathSync(ROOT);
    const realPlanPath = fs.realpathSync(planPath);
    assert(
      isPathInside(realPlanPath, realRoot),
      `${artifact.lane_id}: dry-run plan must be inside the repository`,
      errors
    );
    const descriptor = fs.openSync(planPath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    try {
      assert(
        fs.fstatSync(descriptor).isFile(),
        `${artifact.lane_id}: dry-run plan evidence must be a file`,
        errors
      );
      const planBytes = fs.readFileSync(descriptor);
      assert(
        createHash("sha256").update(planBytes).digest("hex") === evidence.plan_sha256,
        `${artifact.lane_id}: dry-run plan SHA mismatch`,
        errors
      );
      plan = JSON.parse(planBytes.toString("utf8"));
    } finally {
      fs.closeSync(descriptor);
    }
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot read dry-run plan evidence (${error instanceof Error ? error.message : String(error)})`
    );
    return;
  }

  assert(evidence.source_repository === "fap-api", `${artifact.lane_id}: dry-run source repository must be fap-api`, errors);
  assert(
    /^[a-f0-9]{40}$/.test(evidence.source_commit_sha ?? ""),
    `${artifact.lane_id}: dry-run source commit must be an exact 40-character SHA`,
    errors
  );
  assert(
    plan.schema_version === evidence.plan_schema_version,
    `${artifact.lane_id}: dry-run plan schema version mismatch`,
    errors
  );
  assert(plan.ok === true && plan.status === "pass", `${artifact.lane_id}: dry-run plan must PASS`, errors);
  assert(plan.mode === "dry_run" && plan.dry_run_only === true, `${artifact.lane_id}: plan must be dry-run only`, errors);
  assert(
    plan.write_supported_in_this_pr === false && plan.writes_committed === false,
    `${artifact.lane_id}: dry-run plan must not support or commit writes`,
    errors
  );
  for (const flag of [
    "database_write_attempted",
    "cms_write_attempted",
    "publish_attempted",
    "activation_attempted",
    "indexability_attempted",
    "search_submission_attempted",
  ]) {
    assert(plan[flag] === false, `${artifact.lane_id}: dry-run plan ${flag} must be false`, errors);
  }
  assert(
    plan.package?.package_sha256 === artifact.package_sha256,
    `${artifact.lane_id}: dry-run plan package SHA mismatch`,
    errors
  );
  assert(
    plan.row_count === evidence.row_count && plan.row_count === artifact.gate_evidence.row_count,
    `${artifact.lane_id}: dry-run plan row count must match gate evidence`,
    errors
  );
  assert(
    Array.isArray(plan.rows) && plan.rows.length === plan.row_count,
    `${artifact.lane_id}: dry-run plan must contain every registered row`,
    errors
  );
  if (Array.isArray(plan.rows)) {
    assert(
      plan.rows.every((row) => row?.write_executed === false),
      `${artifact.lane_id}: every dry-run row must retain write_executed=false`,
      errors
    );
  }
}

function validateControlledTransitionApproval(artifact, manifest, errors) {
  let approval;
  let approvalPath;
  try {
    approvalPath = path.isAbsolute(artifact.gate_evidence.report_path)
      ? artifact.gate_evidence.report_path
      : path.join(ROOT, artifact.gate_evidence.report_path);
    assert(
      fs.existsSync(approvalPath) && fs.statSync(approvalPath).isFile(),
      `${artifact.lane_id}: controlled transition approval file is missing`,
      errors
    );
    assert(
      sha256File(approvalPath) === artifact.gate_evidence.report_sha256,
      `${artifact.lane_id}: controlled transition approval SHA mismatch`,
      errors
    );
    approval = JSON.parse(fs.readFileSync(approvalPath, "utf8"));
    const controlAuthorityDirectory = fs.realpathSync(
      path.join(ROOT, manifest.authority.controlled_transition_approval_directory)
    );
    const realApprovalPath = fs.realpathSync(approvalPath);
    assert(
      isPathInside(realApprovalPath, controlAuthorityDirectory),
      `${artifact.lane_id}: controlled transition approval must reside inside the registered CONTROL authority directory`,
      errors
    );
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot read controlled transition approval (${error instanceof Error ? error.message : String(error)})`
    );
    return;
  }

  assert(
    approval.schema_version === "fermatmind.en_content_parity_controlled_transition_approval.v1",
    `${artifact.lane_id}: controlled transition approval schema version is invalid`,
    errors
  );
  assert(
    approval.artifact_kind === "controlled_transition_approval",
    `${artifact.lane_id}: controlled transition approval kind is invalid`,
    errors
  );
  assert(
    approval.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01",
    `${artifact.lane_id}: controlled transition approval control ID mismatch`,
    errors
  );
  assertAllPermissionsFalse(approval, "$/controlled_transition_approval", errors);
  assert(
    approval.approval_owner === "human_operator",
    `${artifact.lane_id}: controlled transition approval must be owned by the human operator`,
    errors
  );
  assert(
    typeof approval.approval_ref === "string" && approval.approval_ref.length > 0,
    `${artifact.lane_id}: controlled transition approval_ref is required`,
    errors
  );
  assert(
    approval.producer_lane_id === artifact.lane_id,
    `${artifact.lane_id}: controlled transition approval producer lane mismatch`,
    errors
  );
  assert(
    approval.subscope_id === artifact.subscope_id,
    `${artifact.lane_id}: controlled transition approval subscope mismatch`,
    errors
  );
  assert(
    approval.package_sha256 === artifact.package_sha256,
    `${artifact.lane_id}: controlled transition approval package SHA mismatch`,
    errors
  );
  assert(
    approval.gate === artifact.proposed_status,
    `${artifact.lane_id}: controlled transition approval gate mismatch`,
    errors
  );
  assert(
    approval.verdict === "APPROVED",
    `${artifact.lane_id}: controlled transition verdict must be APPROVED`,
    errors
  );
}

function validateInventoryPayload(artifact, packageContext, errors) {
  if (!packageContext) {
    return;
  }
  const { packageDirectory } = packageContext;
  let payloadAssets;
  let sourceLedger;
  try {
    const assetsContents = fs.readFileSync(path.join(packageDirectory, "assets.jsonl"), "utf8").trim();
    payloadAssets = assetsContents
      ? assetsContents.split(/\r?\n/).map((line, index) => {
          try {
            return JSON.parse(line);
          } catch (error) {
            throw new Error(`assets.jsonl line ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
          }
        })
      : [];
    sourceLedger = JSON.parse(fs.readFileSync(path.join(packageDirectory, "source_ledger.json"), "utf8"));
  } catch (error) {
    errors.push(
      `${artifact.lane_id}: cannot parse inventory payload (${error instanceof Error ? error.message : String(error)})`
    );
    return;
  }

  assert(
    sameValue(payloadAssets, artifact.asset_updates),
    `${artifact.lane_id}: assets.jsonl must exactly match candidate asset_updates`,
    errors
  );
  assert(
    sourceLedger.schema_version === "fermatmind.en_content_parity_source_ledger.v1",
    `${artifact.lane_id}: source ledger schema version is invalid`,
    errors
  );
  assert(sourceLedger.lane_id === artifact.lane_id, `${artifact.lane_id}: source ledger lane mismatch`, errors);
  assert(sourceLedger.subscope_id === artifact.subscope_id, `${artifact.lane_id}: source ledger subscope mismatch`, errors);
  assert(sourceLedger.package_id === artifact.package_id, `${artifact.lane_id}: source ledger package mismatch`, errors);
  assert(Array.isArray(sourceLedger.rows), `${artifact.lane_id}: source ledger rows must be an array`, errors);
  if (!Array.isArray(sourceLedger.rows)) {
    return;
  }

  const rowIds = sourceLedger.rows.map((row) => row?.row_id);
  assert(new Set(rowIds).size === rowIds.length, `${artifact.lane_id}: source ledger row IDs must be unique`, errors);
  assert(
    sourceLedger.rows.every(
      (row) => typeof row?.row_id === "string" && artifact.asset_updates.some((asset) => asset.asset_id === row.asset_id)
    ),
    `${artifact.lane_id}: source ledger contains malformed or unregistered asset rows`,
    errors
  );
  assert(
    sourceLedger.rows.length === artifact.gate_evidence.row_count,
    `${artifact.lane_id}: source ledger row count must match gate evidence`,
    errors
  );
  const partialBatch = isPartialBatchWitness(artifact);
  const expectedPartialCodes = partialBatch ? artifact.partial_batch.guide_codes : null;
  if (partialBatch) {
    assert(
      sameValue(sourceLedger.rows.map((row) => row?.guide_code), expectedPartialCodes),
      `${artifact.lane_id}: partial batch source ledger guide codes must match the declared batch in order`,
      errors
    );
  }
  for (const asset of artifact.asset_updates) {
    const actualRows = sourceLedger.rows.filter((row) => row.asset_id === asset.asset_id).length;
    assert(
      actualRows === (partialBatch ? artifact.partial_batch.batch_row_count : asset.expected_en_count),
      `${artifact.lane_id}: source ledger count for ${asset.asset_id} must match expected_en_count`,
      errors
    );
  }
}

function validateLeafInvariants(
  artifact,
  manifest,
  manifestSha256,
  artifactPath,
  schema,
  { skipArtifactAuthorityPath = false } = {}
) {
  const errors = [];
  assertAllPermissionsFalse(artifact, "$", errors);
  const artifactLaneId =
    artifact.artifact_kind === "independent_qa_report"
      ? artifact.qa_lane_id
      : artifact.artifact_kind === "transition_gate_report"
        ? artifact.owner_lane_id
      : artifact.artifact_kind === "controlled_transition_approval"
          ? artifact.producer_lane_id
        : artifact.artifact_kind === "package_rework_reset"
          ? artifact.producer_lane_id
        : artifact.lane_id;
  const registeredLane = manifest.lanes.find((lane) => lane.lane_id === artifactLaneId);
  assert(Boolean(registeredLane), `${artifactLaneId}: lane is not registered`, errors);
  const packageTarget = registeredPackageTarget(registeredLane, artifact.subscope_id);

  if (artifact.artifact_kind === "independent_qa_report") {
    const producerLane = manifest.lanes.find((lane) => lane.lane_id === artifact.producer_lane_id);
    const reviewedTarget = registeredPackageTarget(producerLane, artifact.subscope_id);
    assert(Boolean(reviewedTarget), `${artifact.producer_lane_id}: QA subscope is not registered`, errors);
    assert(
      stateIndex(progressionStatus(reviewedTarget)) >= stateIndex("package_frozen"),
      `${artifact.producer_lane_id}: W9 cannot review a target before package_frozen`,
      errors
    );
    assert(
      artifact.package_sha256 === reviewedTarget?.packageSha256,
      `${artifact.producer_lane_id}: W9 report must name the registered frozen package SHA`,
      errors
    );
    assert(
      artifact.output_directory === registeredLane?.output_directory,
      `${artifact.producer_lane_id}: QA report output directory must match W9`,
      errors
    );
    try {
      const qaAuthorityDirectory = fs.realpathSync(path.join(ROOT, registeredLane?.output_directory ?? ""));
      const realArtifactPath = fs.realpathSync(
        path.isAbsolute(artifactPath) ? artifactPath : path.join(ROOT, artifactPath)
      );
      assert(
        isPathInside(realArtifactPath, qaAuthorityDirectory),
        `${artifact.producer_lane_id}: independent QA artifact must reside inside the registered W9 authority directory`,
        errors
      );
    } catch (error) {
      errors.push(
        `${artifact.producer_lane_id}: cannot verify W9 authority path (${error instanceof Error ? error.message : String(error)})`
      );
    }
    const reviewedAssetIds = Array.isArray(artifact.reviewed_asset_ids) ? artifact.reviewed_asset_ids : [];
    const allowedAssetIds =
      reviewedTarget?.assetIds ??
      manifest.assets.filter((asset) => asset.lane_id === artifact.producer_lane_id).map((asset) => asset.asset_id);
    assert(
      sameValue([...reviewedAssetIds].sort(), [...allowedAssetIds].sort()),
      `${artifact.producer_lane_id}: QA report must review every registered target asset exactly once`,
      errors
    );
    const reviewedAssets = manifest.assets.filter((asset) => allowedAssetIds.includes(asset.asset_id));
    assert(
      reviewedAssets.every((asset) => Number.isInteger(asset.expected_en_count)),
      `${artifact.producer_lane_id}: W9 review requires a fully frozen target inventory`,
      errors
    );
    const expectedReviewedRows = reviewedAssets.reduce(
      (total, asset) => total + (Number.isInteger(asset.expected_en_count) ? asset.expected_en_count : 0),
      0
    );
    assert(
      artifact.reviewed_row_count === expectedReviewedRows,
      `${artifact.producer_lane_id}: QA report row count must cover the complete registered target`,
      errors
    );
    const pageApiVerdict = artifact.checks?.page_api_alignment;
    const pageApiStatus = artifact.page_api_alignment_status;
    assert(
      pageApiVerdict !== "NOT_APPLICABLE" || pageApiStatus === "NOT_APPLICABLE",
      `${artifact.producer_lane_id}: NOT_APPLICABLE page/API check requires matching report status`,
      errors
    );
    assert(
      pageApiVerdict === "NOT_APPLICABLE" ||
        pageApiStatus === undefined ||
        pageApiStatus === pageApiVerdict,
      `${artifact.producer_lane_id}: page/API report status must match its aggregate check`,
      errors
    );
    if (artifact.verdict === "PASS") {
      assert(
        EXPECTED_QA_CHECKS.every((check) => artifact.checks[check] === "PASS"),
        `${artifact.producer_lane_id}: QA PASS requires every check to PASS`,
        errors
      );
    } else if (artifact.verdict === "BLOCKED") {
      assert(
        EXPECTED_QA_CHECKS.some((check) => artifact.checks?.[check] === "BLOCKED"),
        `${artifact.producer_lane_id}: W9 BLOCKED verdict requires at least one blocked QA check`,
        errors
      );
    }
  }

  if (artifact.artifact_kind === "package_rework_reset") {
    const producerLane = manifest.lanes.find((lane) => lane.lane_id === artifact.producer_lane_id);
    const resetTarget = registeredPackageTarget(producerLane, artifact.subscope_id);
    assert(Boolean(resetTarget), `${artifact.producer_lane_id}: rework target is not registered`, errors);
    assert(
      resetTarget?.status === "blocked" && resetTarget?.blockedFromStatus === "package_frozen",
      `${artifact.producer_lane_id}: package rework reset requires a target blocked from package_frozen`,
      errors
    );
    assert(
      resetTarget?.packageSha256 === artifact.blocked_package_sha256,
      `${artifact.producer_lane_id}: package rework reset must name the blocked frozen package SHA`,
      errors
    );
    assert(
      resetTarget?.gateLineage?.some(
        (entry) =>
          entry.status === "package_frozen" &&
          entry.package_sha256 === artifact.blocked_package_sha256
      ),
      `${artifact.producer_lane_id}: package rework reset requires retained package_frozen lineage`,
      errors
    );
    assert(
      sameValue(
        [...(artifact.clear_fields ?? [])].sort(),
        ["gate_lineage", "package_sha256", "qa_report_ref"]
      ),
      `${artifact.producer_lane_id}: package rework reset must clear the failed frozen fields`,
      errors
    );
    const approvalDirectory = manifest.authority?.controlled_transition_approval_directory ?? "";
    try {
      const realApprovalDirectory = fs.realpathSync(path.join(ROOT, approvalDirectory));
      const realArtifactPath = fs.realpathSync(
        path.isAbsolute(artifactPath) ? artifactPath : path.join(ROOT, artifactPath)
      );
      assert(
        isPathInside(realArtifactPath, realApprovalDirectory),
        `${artifact.producer_lane_id}: package rework reset must reside inside CONTROL authority`,
        errors
      );
    } catch (error) {
      errors.push(
        `${artifact.producer_lane_id}: cannot verify package rework CONTROL authority (${error instanceof Error ? error.message : String(error)})`
      );
    }

    try {
      const reportPath = path.isAbsolute(artifact.w9_report_ref)
        ? artifact.w9_report_ref
        : path.join(ROOT, artifact.w9_report_ref);
      const rowEvidencePath = path.isAbsolute(artifact.w9_row_evidence_ref)
        ? artifact.w9_row_evidence_ref
        : path.join(ROOT, artifact.w9_row_evidence_ref);
      const frozenLedgerPath = path.isAbsolute(artifact.w9_frozen_ledger_ref)
        ? artifact.w9_frozen_ledger_ref
        : path.join(ROOT, artifact.w9_frozen_ledger_ref);
      const w9Lane = manifest.lanes.find((lane) => lane.lane_id === "W9");
      const realQaAuthorityDirectory = fs.realpathSync(
        path.join(ROOT, w9Lane?.output_directory ?? "")
      );
      const realReportPath = fs.realpathSync(reportPath);
      const realRowEvidencePath = fs.realpathSync(rowEvidencePath);
      const realFrozenLedgerPath = fs.realpathSync(frozenLedgerPath);
      assert(
        isPathInside(realReportPath, realQaAuthorityDirectory),
        `${artifact.producer_lane_id}: package rework reset W9 report must remain in W9 authority`,
        errors
      );
      assert(
        sha256File(reportPath) === artifact.w9_report_sha256,
        `${artifact.producer_lane_id}: package rework reset W9 report SHA mismatch`,
        errors
      );
      assert(
        isPathInside(realRowEvidencePath, realQaAuthorityDirectory),
        `${artifact.producer_lane_id}: package rework reset W9 row evidence must remain in W9 authority`,
        errors
      );
      assert(
        sha256File(rowEvidencePath) === artifact.w9_row_evidence_sha256,
        `${artifact.producer_lane_id}: package rework reset W9 row evidence SHA mismatch`,
        errors
      );
      assert(
        isPathInside(realFrozenLedgerPath, realQaAuthorityDirectory),
        `${artifact.producer_lane_id}: package rework reset frozen ledger must remain in W9 authority`,
        errors
      );
      assert(
        sha256File(frozenLedgerPath) === artifact.w9_frozen_ledger_sha256,
        `${artifact.producer_lane_id}: package rework reset frozen ledger SHA mismatch`,
        errors
      );
      const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      const rowEvidence = JSON.parse(fs.readFileSync(rowEvidencePath, "utf8"));
      const frozenLedger = JSON.parse(fs.readFileSync(frozenLedgerPath, "utf8"));
      const frozenShaManifestPath = path.isAbsolute(frozenLedger.sha256_manifest_ref)
        ? frozenLedger.sha256_manifest_ref
        : path.join(ROOT, frozenLedger.sha256_manifest_ref ?? "");
      const frozenSourceLedgerPath = path.isAbsolute(frozenLedger.source_ledger_ref)
        ? frozenLedger.source_ledger_ref
        : path.join(ROOT, frozenLedger.source_ledger_ref ?? "");
      const realFrozenShaManifestPath = fs.realpathSync(frozenShaManifestPath);
      const realFrozenSourceLedgerPath = fs.realpathSync(frozenSourceLedgerPath);
      assert(
        isPathInside(realFrozenShaManifestPath, realQaAuthorityDirectory) &&
          isPathInside(realFrozenSourceLedgerPath, realQaAuthorityDirectory),
        `${artifact.producer_lane_id}: package rework frozen package evidence must remain in W9 authority`,
        errors
      );
      assert(
        sha256File(frozenShaManifestPath) === frozenLedger.sha256_manifest_sha256,
        `${artifact.producer_lane_id}: package rework frozen SHA manifest mismatch`,
        errors
      );
      assert(
        sha256File(frozenSourceLedgerPath) === frozenLedger.source_ledger_sha256,
        `${artifact.producer_lane_id}: package rework frozen source ledger SHA mismatch`,
        errors
      );
      const frozenShaManifest = JSON.parse(fs.readFileSync(frozenShaManifestPath, "utf8"));
      const frozenSourceLedger = JSON.parse(fs.readFileSync(frozenSourceLedgerPath, "utf8"));
      errors.push(
        ...schemaErrors(report, schema).map(
          (error) => `${artifact.producer_lane_id}: package rework W9 Schema error: ${error}`
        )
      );
      errors.push(
        ...validateLeafInvariants(report, manifest, manifestSha256, reportPath, schema).map(
          (error) => `${artifact.producer_lane_id}: package rework W9 invariant error: ${error}`
        )
      );
      assertAllPermissionsFalse(rowEvidence, "$/package_rework_w9_row_evidence", errors);
      assertAllPermissionsFalse(frozenLedger, "$/package_rework_w9_frozen_ledger", errors);
      assertBoundPermissionsMatch(
        artifact.permissions,
        report,
        "$/package_rework_w9_report/permissions",
        `${artifact.producer_lane_id}: package rework W9 report`,
        errors
      );
      assertBoundPermissionsMatch(
        artifact.permissions,
        rowEvidence,
        "$/package_rework_w9_row_evidence/permissions",
        `${artifact.producer_lane_id}: package rework W9 row evidence`,
        errors
      );
      assertBoundPermissionsMatch(
        artifact.permissions,
        frozenLedger,
        "$/package_rework_w9_frozen_ledger/permissions",
        `${artifact.producer_lane_id}: package rework W9 frozen ledger`,
        errors
      );
      assert(
        report.artifact_kind === "independent_qa_report" &&
          report.qa_lane_id === "W9" &&
          report.producer_lane_id === artifact.producer_lane_id &&
          report.subscope_id === artifact.subscope_id &&
          report.package_sha256 === artifact.blocked_package_sha256 &&
          report.verdict === "BLOCKED",
        `${artifact.producer_lane_id}: package rework reset requires an exact-SHA W9 BLOCKED report`,
        errors
      );
      assert(
        rowEvidence.schema_version === "fermatmind.en_content_parity_independent_qa_row_evidence.v1" &&
          rowEvidence.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01" &&
          rowEvidence.qa_lane_id === "W9" &&
          rowEvidence.producer_lane_id === artifact.producer_lane_id &&
          rowEvidence.subscope_id === artifact.subscope_id &&
          rowEvidence.package_sha256 === artifact.blocked_package_sha256 &&
          rowEvidence.verdict === "BLOCKED",
        `${artifact.producer_lane_id}: package rework reset requires exact W9 BLOCKED row evidence`,
        errors
      );
      assert(
        frozenLedger.schema_version ===
          "fermatmind.en_content_parity_frozen_source_ledger_identity_projection.v1" &&
          frozenLedger.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01" &&
          frozenLedger.producer_lane_id === artifact.producer_lane_id &&
          frozenLedger.subscope_id === artifact.subscope_id &&
          frozenLedger.package_sha256 === artifact.blocked_package_sha256 &&
          frozenLedger.sha256_manifest_sha256 === sha256File(frozenShaManifestPath) &&
          frozenLedger.source_ledger_sha256 ===
            rowEvidence.package_integrity?.immutable_payload_sha256?.["source_ledger.json"],
        `${artifact.producer_lane_id}: package rework reset frozen ledger must match the blocked package`,
        errors
      );
      const frozenManifestFiles = Array.isArray(frozenShaManifest.files)
        ? frozenShaManifest.files
        : [];
      const frozenSourceLedgerEntry = frozenManifestFiles.find(
        (file) => file?.path === "source_ledger.json"
      );
      const recomputedFrozenPackageSha256 = packageSha256(frozenManifestFiles);
      assert(
        frozenShaManifest.schema_version ===
          "fermatmind.en_content_parity_package_sha256_manifest.v1" &&
          frozenShaManifest.lane_id === artifact.producer_lane_id &&
          frozenShaManifest.subscope_id === artifact.subscope_id &&
          sameValue(
            frozenManifestFiles.map((file) => file?.path),
            IMMUTABLE_PACKAGE_PAYLOAD_FILES
          ) &&
          frozenShaManifest.package_sha256 === recomputedFrozenPackageSha256 &&
          recomputedFrozenPackageSha256 === artifact.blocked_package_sha256 &&
          frozenSourceLedgerEntry?.sha256 === frozenLedger.source_ledger_sha256,
        `${artifact.producer_lane_id}: package rework frozen source ledger must be bound by the blocked package SHA manifest`,
        errors
      );
      assert(
        frozenSourceLedger.schema_version ===
          "fermatmind.en_content_parity_source_ledger.v1" &&
          frozenSourceLedger.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01" &&
          frozenSourceLedger.lane_id === artifact.producer_lane_id &&
          frozenSourceLedger.subscope_id === artifact.subscope_id &&
          frozenSourceLedger.package_id === frozenShaManifest.package_id,
        `${artifact.producer_lane_id}: package rework frozen source ledger identity is invalid`,
        errors
      );
      const expectedAssetIds = resetTarget?.assetIds ?? [];
      const expectedRowCount = manifest.assets
        .filter((asset) => expectedAssetIds.includes(asset.asset_id))
        .reduce(
          (total, asset) => total + (Number.isInteger(asset.expected_en_count) ? asset.expected_en_count : 0),
          0
        );
      assert(
        report.reviewed_row_count === expectedRowCount &&
          rowEvidence.reviewed_row_count === expectedRowCount,
        `${artifact.producer_lane_id}: package rework W9 evidence must cover the complete registered target`,
        errors
      );
      assert(
        sameValue([...(report.reviewed_asset_ids ?? [])].sort(), [...expectedAssetIds].sort()) &&
          sameValue([...(rowEvidence.reviewed_asset_ids ?? [])].sort(), [...expectedAssetIds].sort()),
        `${artifact.producer_lane_id}: package rework W9 evidence assets must match the registered target`,
        errors
      );
      const rowReviews = Array.isArray(rowEvidence.row_reviews) ? rowEvidence.row_reviews : [];
      const rowIds = rowReviews.map((row) => row?.row_id);
      const rowIdentities = rowReviews.map((row) => row?.source_identity);
      const projectedRows = Array.isArray(frozenLedger.rows) ? frozenLedger.rows : [];
      const frozenRows = Array.isArray(frozenSourceLedger.rows) ? frozenSourceLedger.rows : [];
      const actualFrozenRowIdentityById = new Map(
        frozenRows.map((row) => [
          row?.row_id,
          `${row?.stable_asset_identity}@revision:${row?.source_revision_id}`,
        ])
      );
      const frozenRowIdentityById = new Map(
        projectedRows.map((row) => [row?.row_id, row?.source_identity])
      );
      assert(
        frozenRows.length === expectedRowCount &&
          actualFrozenRowIdentityById.size === frozenRows.length &&
          projectedRows.length === frozenRows.length &&
          projectedRows.every(
            (row) => actualFrozenRowIdentityById.get(row?.row_id) === row?.source_identity
          ),
        `${artifact.producer_lane_id}: package rework frozen projection must exactly match the hashed source ledger`,
        errors
      );
      assert(
        rowReviews.length === expectedRowCount,
        `${artifact.producer_lane_id}: package rework W9 row evidence must cover every target row`,
        errors
      );
      assert(
        rowIds.every((rowId) => typeof rowId === "string" && rowId.length > 0) &&
          new Set(rowIds).size === rowIds.length,
        `${artifact.producer_lane_id}: package rework W9 row IDs must be complete and unique`,
        errors
      );
      assert(
        rowIdentities.every((identity) => typeof identity === "string" && identity.length > 0) &&
          new Set(rowIdentities).size === rowIdentities.length,
        `${artifact.producer_lane_id}: package rework W9 row identities must be complete and unique`,
        errors
      );
      assert(
        frozenRows.length === expectedRowCount &&
          frozenRowIdentityById.size === expectedRowCount &&
          rowReviews.every(
            (row) => frozenRowIdentityById.get(row?.row_id) === row?.source_identity
          ) &&
          sameValue(
            [...rowIds].sort(),
            [...frozenRowIdentityById.keys()].sort()
          ),
        `${artifact.producer_lane_id}: package rework W9 rows must exactly match the frozen ledger row ID and identity pairs`,
        errors
      );
      validateBlockedAggregateRows(
        report,
        rowEvidence,
        EXPECTED_W9_ROW_CHECKS,
        W9_AGGREGATE_TO_ROW_CHECKS,
        `${artifact.producer_lane_id}: package rework`,
        errors
      );
      validateBlockedRowSubstance(
        rowEvidence,
        EXPECTED_W9_ROW_CHECKS,
        `${artifact.producer_lane_id}: package rework`,
        errors
      );
      validateAggregateEvidence(
        rowEvidence,
        `${artifact.producer_lane_id}: package rework`,
        errors
      );
    } catch (error) {
      errors.push(
        `${artifact.producer_lane_id}: cannot verify package rework W9 evidence (${error instanceof Error ? error.message : String(error)})`
      );
    }
  }

  if (artifact.artifact_kind === "lane_package") {
    assert(Boolean(packageTarget), `${artifact.lane_id}: subscope_id is not registered for this lane`, errors);
    validateSubscopeSequence(registeredLane, packageTarget, artifact.status, errors);
    const partialBatch = validatePartialBatchWitness(artifact, packageTarget, errors);
    assert(
      sameValue(artifact.artifact_files, EXPECTED_HANDOFF_FILES),
      "lane package artifact_files must match the required handoff list",
      errors
    );
    assert(
      artifact.output_directory === packageTarget?.outputDirectory,
      `${artifact.lane_id}: package output_directory must match the master registry`,
      errors
    );
    if (packageTarget?.outputDirectory && !skipArtifactAuthorityPath) {
      if (partialBatch) {
        validatePartialBatchAuthorityPath(
          artifactPath,
          packageTarget.outputDirectory,
          "scope_manifest.json",
          artifact.partial_batch.batch_id,
          `${artifact.lane_id}: lane package`,
          errors
        );
      } else {
        validateArtifactAuthorityPath(
          artifactPath,
          packageTarget.outputDirectory,
          "scope_manifest.json",
          `${artifact.lane_id}: lane package`,
          errors
        );
      }
    }
    validateAssetCollection(artifact.assets, "$/assets", errors);
    const packageAssetIds = artifact.assets.map((asset) => asset.asset_id).sort();
    if (packageTarget?.assetIds) {
      assert(
        sameValue(packageAssetIds, [...packageTarget.assetIds].sort()),
        `${artifact.lane_id}: package assets must match the registered subscope`,
        errors
      );
    }
    for (const asset of artifact.assets) {
      assert(asset.lane_id === artifact.lane_id, `${asset.asset_id}: lane_id must match package lane`, errors);
    }
  }

  if (artifact.artifact_kind === "master_manifest_patch_candidate") {
    const gateEvidence = artifact.gate_evidence ?? {
      gate: null,
      report_path: null,
      report_sha256: null,
      report_in_package: null,
      owner_lane_id: null,
      verdict: null,
      asset_ids: [],
      row_count: null,
    };
    const assetUpdates = Array.isArray(artifact.asset_updates) ? artifact.asset_updates : [];
    assert(Boolean(packageTarget), `${artifact.lane_id}: subscope_id is not registered for this lane`, errors);
    validateSubscopeSequence(registeredLane, packageTarget, artifact.proposed_status, errors);
    const partialBatch = validatePartialBatchWitness(artifact, packageTarget, errors);
    assert(
      artifact.base_manifest_sha256 === manifestSha256,
      `${artifact.lane_id}: base_manifest_sha256 must match the current master manifest`,
      errors
    );
    const currentIndex = stateIndex(progressionStatus(packageTarget));
    const isBlockedRecovery = packageTarget?.status === "blocked";
    const expectedNextStatus = isBlockedRecovery
      ? packageTarget.blockedFromStatus
      : currentIndex >= 0
        ? EXPECTED_STATES[currentIndex + 1]
        : undefined;
    assert(
      (partialBatch && artifact.proposed_status === packageTarget?.status) ||
        artifact.proposed_status === "blocked" || artifact.proposed_status === expectedNextStatus,
      partialBatch
        ? `${artifact.lane_id}: partial witness proposed_status must remain package_in_progress, blocked, or ${
            isBlockedRecovery ? "the retained recovery state" : "the immediate next state"
          } ${expectedNextStatus ?? "none"}`
        : `${artifact.lane_id}: proposed_status must be blocked or ${
            isBlockedRecovery ? "the retained recovery state" : "the immediate next state"
          } ${expectedNextStatus ?? "none"}`,
      errors
    );
    assert(
      gateEvidence.gate === artifact.proposed_status,
      `${artifact.lane_id}: gate evidence must match proposed_status`,
      errors
    );
    if (artifact.proposed_status === "qa_pass") {
      assert(gateEvidence.owner_lane_id === "W9", `${artifact.lane_id}: qa_pass evidence owner must be W9`, errors);
      assert(gateEvidence.report_in_package === false, `${artifact.lane_id}: W9 QA report must remain independent`, errors);
      assert(gateEvidence.verdict === "PASS", `${artifact.lane_id}: qa_pass evidence verdict must be PASS`, errors);
    } else if (["draft_imported", "published"].includes(artifact.proposed_status)) {
      assert(
        gateEvidence.owner_lane_id === "CONTROL",
        `${artifact.lane_id}: controlled transition evidence owner must be CONTROL`,
        errors
      );
      assert(
        gateEvidence.report_in_package === false,
        `${artifact.lane_id}: controlled transition approval must remain outside the immutable package`,
        errors
      );
      assert(
        gateEvidence.verdict === "APPROVED",
        `${artifact.lane_id}: controlled transition verdict must be APPROVED`,
        errors
      );
    } else if (
      currentIndex >= stateIndex("package_frozen") &&
      artifact.proposed_status === "blocked" &&
      gateEvidence.owner_lane_id === "W9"
    ) {
      assert(
        gateEvidence.report_in_package === false,
        `${artifact.lane_id}: W9 blocker evidence must remain outside the immutable package`,
        errors
      );
      assert(gateEvidence.verdict === "BLOCKED", `${artifact.lane_id}: W9 blocker verdict must be BLOCKED`, errors);
    } else if (
      isBlockedRecovery ||
      currentIndex >= stateIndex("qa_pass") ||
      (currentIndex >= stateIndex("package_frozen") && artifact.proposed_status === "blocked")
    ) {
      assert(
        gateEvidence.owner_lane_id === artifact.lane_id,
        `${artifact.lane_id}: post-QA transition evidence owner must match the producer lane`,
        errors
      );
      assert(
        gateEvidence.report_in_package === false,
        `${artifact.lane_id}: post-freeze transition evidence must remain outside the immutable package`,
        errors
      );
      assert(
        gateEvidence.verdict === (artifact.proposed_status === "blocked" ? "BLOCKED" : "PASS"),
        `${artifact.lane_id}: external transition evidence verdict is invalid`,
        errors
      );
    } else {
      assert(
        gateEvidence.owner_lane_id === artifact.lane_id,
        `${artifact.lane_id}: producer transition evidence owner must match the producer lane`,
        errors
      );
      assert(
        gateEvidence.report_in_package === true,
        `${artifact.lane_id}: producer transition evidence must be covered by the package`,
        errors
      );
      assert(gateEvidence.verdict === null, `${artifact.lane_id}: non-QA transition verdict must be null`, errors);
    }
    validateAssetCollection(assetUpdates, "$/asset_updates", errors);
    const updateAssetIds = assetUpdates.map((asset) => asset.asset_id);
    const evidenceAssetIds = Array.isArray(gateEvidence.asset_ids) ? gateEvidence.asset_ids : [];
    assert(
      sameValue([...evidenceAssetIds].sort(), [...updateAssetIds].sort()),
      `${artifact.lane_id}: gate evidence asset IDs must match asset_updates`,
      errors
    );
    if (packageTarget?.assetIds) {
      assert(
        updateAssetIds.every((assetId) => packageTarget.assetIds.includes(assetId)),
        `${artifact.lane_id}: candidate assets must stay inside the registered subscope`,
        errors
      );
    }
    const registeredTargetAssets = targetAssets(manifest, registeredLane, packageTarget);
    const registeredTargetAssetIds = registeredTargetAssets.map((asset) => asset.asset_id);
    assert(
      sameValue([...updateAssetIds].sort(), [...registeredTargetAssetIds].sort()),
      `${artifact.lane_id}: candidate assets must exactly match the complete registered target`,
      errors
    );
    if (artifact.proposed_status === "qa_pass") {
      assert(
        sameValue([...updateAssetIds].sort(), [...registeredTargetAssetIds].sort()),
        `${artifact.lane_id}: qa_pass requires W9 coverage of every registered target asset`,
        errors
      );
      assert(
        gateEvidence.row_count ===
          registeredTargetAssets.reduce(
            (total, asset) => total + (Number.isInteger(asset.expected_en_count) ? asset.expected_en_count : 0),
            0
          ),
        `${artifact.lane_id}: qa_pass row count must cover the complete registered target`,
        errors
      );
    }
    if (currentIndex >= stateIndex("package_frozen")) {
      assert(
        artifact.package_sha256 === packageTarget?.packageSha256,
        `${artifact.lane_id}: package_frozen SHA is immutable for every later transition`,
        errors
      );
      assert(
        sameValue(assetUpdates, registeredTargetAssets),
        `${artifact.lane_id}: frozen package assets cannot change after package_frozen`,
        errors
      );
    }
    if (currentIndex >= stateIndex("inventory_frozen")) {
      for (const asset of assetUpdates) {
        const registeredAsset = registeredTargetAssets.find(
          (entry) => entry.asset_id === asset.asset_id
        );
        for (const countField of FROZEN_INVENTORY_COUNT_FIELDS) {
          assert(
            !registeredAsset || asset[countField] === registeredAsset[countField],
            `${asset.asset_id}: frozen inventory count ${countField} cannot change after inventory_frozen`,
            errors
          );
        }
      }
    }
    for (const asset of assetUpdates) {
      assert(asset.lane_id === artifact.lane_id, `${asset.asset_id}: lane_id must match candidate patch lane`, errors);
      const existingAsset = manifest.assets.find((entry) => entry.asset_id === asset.asset_id);
      const conflictingTranslationGroup = manifest.assets.find(
        (entry) => entry.translation_group === asset.translation_group && entry.asset_id !== asset.asset_id
      );
      assert(
        !existingAsset || existingAsset.translation_group === asset.translation_group,
        `${asset.asset_id}: translation group cannot change from the master registry`,
        errors
      );
      assert(
        !conflictingTranslationGroup,
        `${asset.asset_id}: translation group conflicts with ${conflictingTranslationGroup?.asset_id}`,
        errors
      );
      for (const protectedField of PROTECTED_ASSET_FIELDS) {
        assert(
          !existingAsset || sameValue(existingAsset[protectedField], asset[protectedField]),
          `${asset.asset_id}: protected field ${protectedField} cannot change from the master registry`,
          errors
        );
      }
    }

    if (artifact.proposed_status === "inventory_frozen" && !isBlockedRecovery) {
      const registeredAssetIds = packageTarget?.assetIds
        ? [...packageTarget.assetIds].sort()
        : manifest.assets
            .filter((asset) => asset.lane_id === artifact.lane_id)
            .map((asset) => asset.asset_id)
            .sort();
      assert(
        sameValue([...updateAssetIds].sort(), registeredAssetIds),
        `${artifact.lane_id}: inventory_frozen requires every registered lane asset cohort`,
        errors
      );
      assert(
        assetUpdates.every((asset) =>
          [asset.expected_en_count, asset.current_en_count, asset.remaining_en_count].every(Number.isInteger)
        ),
        `${artifact.lane_id}: inventory_frozen requires known counts for every asset cohort`,
        errors
      );
      assert(
        assetUpdates.every((asset) => asset.parity_state !== "inventory_required"),
        `${artifact.lane_id}: inventory_frozen cannot retain inventory_required assets`,
        errors
      );
      const inventoryRowCount = assetUpdates.reduce(
        (total, asset) => total + (Number.isInteger(asset.expected_en_count) ? asset.expected_en_count : 0),
        0
      );
      assert(
        gateEvidence.report_path === "source_ledger.json",
        `${artifact.lane_id}: inventory_frozen evidence must use source_ledger.json`,
        errors
      );
      assert(
        gateEvidence.row_count === inventoryRowCount,
        `${artifact.lane_id}: inventory evidence row_count must equal the reconciled expected inventory`,
        errors
      );
    }
    let packageContext;
    if (artifact.gate_evidence && artifact.sha256_manifest_path) {
      packageContext = validatePackageShaManifest(
        artifact,
        registeredLane,
        manifest,
        manifestSha256,
        schema,
        artifactPath,
        errors
      );
    }
    if (
      ["inventory_frozen", "package_in_progress", "package_frozen"].includes(
        artifact.proposed_status
      ) &&
      !isBlockedRecovery
    ) {
      validateInventoryPayload(artifact, packageContext, errors);
    }
    validateInPackageGateEvidence(artifact, packageContext, errors);
    if (artifact.proposed_status === "qa_pass") {
      validateIndependentQaEvidence(
        artifact,
        manifest,
        schema,
        artifactPath,
        packageContext,
        "PASS",
        errors
      );
    } else if (
      currentIndex >= stateIndex("package_frozen") &&
      artifact.proposed_status === "blocked" &&
      gateEvidence.owner_lane_id === "W9"
    ) {
      validateIndependentQaEvidence(
        artifact,
        manifest,
        schema,
        artifactPath,
        packageContext,
        "BLOCKED",
        errors
      );
    } else if (["draft_imported", "published"].includes(artifact.proposed_status)) {
      validateControlledTransitionApproval(artifact, manifest, errors);
    } else if (
      isBlockedRecovery ||
      currentIndex >= stateIndex("qa_pass") ||
      (currentIndex >= stateIndex("package_frozen") && artifact.proposed_status === "blocked")
    ) {
      validateExternalTransitionEvidence(artifact, errors);
    }
  }

  return errors;
}

function validatePromptBundle(bundle) {
  const errors = [];
  assert(bundle.schema_version === "fermatmind.en_content_parity_first_wave_prompts.v1", "prompt schema version drifted", errors);
  assert(bundle.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01", "prompt control ID drifted", errors);
  assert(
    sameValue(
      bundle.prompts?.map((prompt) => prompt.lane_id),
      EXPECTED_FIRST_WAVE
    ),
    "prompt bundle must contain W1, W2, and W3 in order",
    errors
  );

  for (const prompt of bundle.prompts ?? []) {
    assert(typeof prompt.prompt === "string" && prompt.prompt.length > 800, `${prompt.lane_id}: launch prompt is incomplete`, errors);
    assert(prompt.prompt.includes("master_manifest_patch.candidate.json"), `${prompt.lane_id}: candidate patch handoff missing`, errors);
    assert(prompt.prompt.includes("permissions false") || prompt.prompt.includes("permissions stay false"), `${prompt.lane_id}: false-permission rule missing`, errors);
  }
  return errors;
}

function readArguments(argv) {
  const artifactPaths = [];
  let manifestPath = DEFAULT_MANIFEST_PATH;
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--artifact") {
      const artifactPath = argv[index + 1];
      if (!artifactPath || artifactPath.startsWith("--")) {
        throw new Error("--artifact requires a path");
      }
      artifactPaths.push(artifactPath);
      index += 1;
      continue;
    }
    if (value === "--manifest") {
      const requestedManifestPath = argv[index + 1];
      if (!requestedManifestPath || requestedManifestPath.startsWith("--")) {
        throw new Error("--manifest requires a path");
      }
      manifestPath = requestedManifestPath;
      index += 1;
      continue;
    }
    throw new Error(`unsupported_argument=${value}`);
  }
  return { artifactPaths, manifestPath };
}

export function validateControlArtifacts({
  artifactPaths = [],
  manifestPath = DEFAULT_MANIFEST_PATH,
} = {}) {
  const schema = readJson(DEFAULT_SCHEMA_PATH);
  const manifest = readJson(manifestPath);
  const manifestSha256 = sha256File(manifestPath);
  const prompts = readJson(DEFAULT_PROMPTS_PATH);
  const errors = [
    ...schemaErrors(manifest, schema),
    ...validateMasterInvariants(manifest),
    ...validatePromptBundle(prompts),
  ];

  const checkedArtifacts = [manifestPath];
  for (const artifactPath of artifactPaths) {
    const artifact = readJson(artifactPath);
    checkedArtifacts.push(artifactPath);
    errors.push(...schemaErrors(artifact, schema).map((error) => `${artifactPath}: ${error}`));
    errors.push(
      ...validateLeafInvariants(artifact, manifest, manifestSha256, artifactPath, schema).map(
        (error) => `${artifactPath}: ${error}`
      )
    );
  }

  const v2Report = manifestPath === DEFAULT_MANIFEST_PATH ? validateV2Control() : null;
  if (v2Report) {
    checkedArtifacts.push(v2Report.authority);
    errors.push(...v2Report.errors.map((error) => `V2 authority: ${error}`));
  }

  return {
    ok: errors.length === 0,
    schema: DEFAULT_SCHEMA_PATH,
    checked_artifacts: checkedArtifacts,
    lane_count: manifest.lanes.length,
    producer_lane_count: manifest.lanes.filter((lane) => lane.lane_kind === "producer").length,
    qa_lane_count: manifest.lanes.filter((lane) => lane.lane_kind === "independent_qa").length,
    asset_cohort_count: manifest.assets.length,
    first_wave: manifest.launch_policy.first_wave,
    v2_authority: v2Report
      ? {
          path: v2Report.authority,
          legacy_v1: v2Report.legacy_v1,
          lane_count: v2Report.lane_count,
          ok: v2Report.ok,
        }
      : null,
    errors,
  };
}

async function main() {
  const { artifactPaths, manifestPath } = readArguments(process.argv.slice(2));
  const report = validateControlArtifacts({ artifactPaths, manifestPath });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
