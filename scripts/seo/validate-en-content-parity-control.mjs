#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const DEFAULT_SCHEMA_PATH = "docs/seo/generated/en-content-parity-control-master.v1.schema.json";
const DEFAULT_MANIFEST_PATH = "docs/seo/generated/en-content-parity-control-master.v1.json";
const DEFAULT_PROMPTS_PATH = "docs/seo/generated/en-content-parity-first-wave-prompts.v1.json";

const EXPECTED_LANE_IDS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9"];
const EXPECTED_PRODUCER_IDS = EXPECTED_LANE_IDS.slice(0, 8);
const EXPECTED_FIRST_WAVE = ["W1", "W2", "W3"];
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
const PERMISSION_KEYS = [
  "cms_write_authorized",
  "staging_write_authorized",
  "production_import_authorized",
  "public_release_authorized",
  "seo_runtime_release_authorized",
  "search_submission_authorized",
  "master_manifest_write_authorized",
];

function readJson(relativePath) {
  const resolvedPath = path.isAbsolute(relativePath) ? relativePath : path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
}

function sha256File(relativePath) {
  const resolvedPath = path.isAbsolute(relativePath) ? relativePath : path.join(ROOT, relativePath);
  return createHash("sha256").update(fs.readFileSync(resolvedPath)).digest("hex");
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
  assert(!hasDependencyCycle(lanes), "lane dependency graph must be acyclic", errors);

  const knownLaneIds = new Set(laneIds);
  for (const lane of lanes) {
    for (const dependency of lane.dependencies) {
      assert(knownLaneIds.has(dependency), `${lane.lane_id}: unknown dependency ${dependency}`, errors);
      assert(dependency !== lane.lane_id, `${lane.lane_id}: self dependency is forbidden`, errors);
    }
  }

  assert(sameValue(manifest.state_machine.ordered_states, EXPECTED_STATES), "ordered state machine must match the control contract", errors);
  assert(sameValue(manifest.handoff_contract.required_files, EXPECTED_HANDOFF_FILES), "handoff file list or order drifted", errors);
  assert(sameValue(manifest.launch_policy.first_wave, EXPECTED_FIRST_WAVE), "first wave must be W1, W2, W3", errors);

  for (const laneId of EXPECTED_FIRST_WAVE) {
    const lane = lanes.find((entry) => entry.lane_id === laneId);
    assert(lane?.launch_state === "launch_ready", `${laneId}: expected launch_ready`, errors);
  }
  assert(lanes.find((entry) => entry.lane_id === "W1")?.status === "not_started", "W1: expected not_started", errors);
  assert(lanes.find((entry) => entry.lane_id === "W2")?.status === "not_started", "W2: expected not_started", errors);
  assert(lanes.find((entry) => entry.lane_id === "W3")?.status === "inventory_frozen", "W3: expected inventory_frozen", errors);
  for (const laneId of ["W4", "W5", "W6", "W7", "W8"]) {
    const lane = lanes.find((entry) => entry.lane_id === laneId);
    assert(lane?.launch_state === "registered", `${laneId}: expected registered launch state`, errors);
    assert(lane?.status === "not_started", `${laneId}: expected not_started`, errors);
  }
  const qaLane = lanes.find((entry) => entry.lane_id === "W9");
  assert(qaLane?.launch_state === "waiting_for_first_package", "W9 must wait for the first frozen package", errors);

  const w3 = lanes.find((entry) => entry.lane_id === "W3");
  assert(
    sameValue(
      w3?.subscopes?.map((scope) => scope.id),
      ["W3-ARTICLES", "W3-CAREER-GUIDES"]
    ),
    "W3 must contain the ordered Article and CareerGuide subscopes",
    errors
  );
  for (const subscope of w3?.subscopes ?? []) {
    assert(subscope.separate_package_required === true, `${subscope.id}: separate package must be required`, errors);
    assert(subscope.same_pr_allowed === false, `${subscope.id}: same PR must be forbidden`, errors);
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

function validateLeafInvariants(artifact, manifest, manifestSha256) {
  const errors = [];
  assertAllPermissionsFalse(artifact, "$", errors);
  const registeredLane = manifest.lanes.find((lane) => lane.lane_id === artifact.lane_id);
  assert(Boolean(registeredLane), `${artifact.lane_id}: lane is not registered`, errors);

  if (artifact.artifact_kind === "lane_package") {
    assert(
      sameValue(artifact.artifact_files, EXPECTED_HANDOFF_FILES),
      "lane package artifact_files must match the required handoff list",
      errors
    );
    assert(
      artifact.output_directory === registeredLane?.output_directory,
      `${artifact.lane_id}: package output_directory must match the master registry`,
      errors
    );
    validateAssetCollection(artifact.assets, "$/assets", errors);
    for (const asset of artifact.assets) {
      assert(asset.lane_id === artifact.lane_id, `${asset.asset_id}: lane_id must match package lane`, errors);
    }
  }

  if (artifact.artifact_kind === "master_manifest_patch_candidate") {
    assert(
      artifact.base_manifest_sha256 === manifestSha256,
      `${artifact.lane_id}: base_manifest_sha256 must match the current master manifest`,
      errors
    );
    const currentIndex = EXPECTED_STATES.indexOf(registeredLane?.status);
    const expectedNextStatus = currentIndex >= 0 ? EXPECTED_STATES[currentIndex + 1] : undefined;
    assert(
      artifact.proposed_status === "blocked" || artifact.proposed_status === expectedNextStatus,
      `${artifact.lane_id}: proposed_status must be blocked or the immediate next state ${expectedNextStatus ?? "none"}`,
      errors
    );
    validateAssetCollection(artifact.asset_updates, "$/asset_updates", errors);
    for (const asset of artifact.asset_updates) {
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

function readArtifactArguments(argv) {
  const artifactPaths = [];
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
    throw new Error(`unsupported_argument=${value}`);
  }
  return artifactPaths;
}

export function validateControlArtifacts({ artifactPaths = [] } = {}) {
  const schema = readJson(DEFAULT_SCHEMA_PATH);
  const manifest = readJson(DEFAULT_MANIFEST_PATH);
  const manifestSha256 = sha256File(DEFAULT_MANIFEST_PATH);
  const prompts = readJson(DEFAULT_PROMPTS_PATH);
  const errors = [
    ...schemaErrors(manifest, schema),
    ...validateMasterInvariants(manifest),
    ...validatePromptBundle(prompts),
  ];

  const checkedArtifacts = [DEFAULT_MANIFEST_PATH];
  for (const artifactPath of artifactPaths) {
    const artifact = readJson(artifactPath);
    checkedArtifacts.push(artifactPath);
    errors.push(...schemaErrors(artifact, schema).map((error) => `${artifactPath}: ${error}`));
    errors.push(...validateLeafInvariants(artifact, manifest, manifestSha256).map((error) => `${artifactPath}: ${error}`));
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
    errors,
  };
}

async function main() {
  const artifactPaths = readArtifactArguments(process.argv.slice(2));
  const report = validateControlArtifacts({ artifactPaths });
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
