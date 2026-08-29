#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { relative, resolve } from "node:path";

const PROJECTION_PATH = "docs/seo/generated/seo-platform-11a-final-tree-projection.v1.json";
const V2_PATH = "backend/docs/seo/generated/seo-platform-11a-inventory.v2.json";
const REGISTRY_HASH = "b02b6edd816b75b42582468e5bc3aa2c9cd0060149825d1fdc6131cf71d73791";
const V2_INVENTORY_HASH = "925bb5dcd128f00bba6a251b55e87d2e37bb75de1fb14cc8ce3a107f7177da01";
const SUPPLEMENTAL_PATHS = new Map([
  [".agents/skills/public-profile-seo-asset-factory/authority-supersession.v1.json", "contract_only"],
  ["docs/result-page-agents/seo-authority-supersession.v1.json", "product_domain_out_of_seo_scope"],
  ["docs/seo/SEO_CODE_CHANGE_ARTIFACT.md", "contract_only"],
  ["docs/seo/seo-platform-11a-authority-supersession.v1.json", "contract_only"],
  ["scripts/seo/generate-seo-code-change-artifact.mjs", "deterministic_tool"],
  ["tests/contracts/seo-platform-11a-authority-convergence.contract.test.ts", "contract_only"],
  [".github/trunk/verify-seo-platform-11a-final-tree-projection.mjs", "deterministic_tool"],
]);
const CLASSIFICATIONS = new Set([
  "active_agent",
  "bounded_capability",
  "deterministic_tool",
  "review_mode",
  "contract_only",
  "product_domain_out_of_seo_scope",
  "historical_superseded",
  "retire_candidate",
]);

const args = new Map(process.argv.slice(2).map((arg) => {
  const separator = arg.indexOf("=");
  return separator === -1 ? [arg, true] : [arg.slice(0, separator), arg.slice(separator + 1)];
}));
const root = resolve(String(args.get("--root") || process.cwd()));
const projectionPath = resolve(root, String(args.get("--projection") || PROJECTION_PATH));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
};
const canonicalJson = (value) => JSON.stringify(canonicalize(value));
const normalizedPath = (file) => relative(root, file).replaceAll("\\", "/");

function walk(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const name of readdirSync(directory).sort()) {
    if ([".git", ".next", "node_modules", "vendor"].includes(name)) continue;
    const file = resolve(directory, name);
    const stat = lstatSync(file);
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) files.push(...walk(file));
    else if (stat.isFile()) files.push(file);
  }
  return files;
}

function fileRow(path, classification) {
  const bytes = readFileSync(resolve(root, path));
  return { path, sha256: sha256(bytes), byte_size: bytes.length, classification };
}

function projectionHash(projection) {
  const payload = { ...projection };
  delete payload.projection_self_hash;
  return sha256(canonicalJson(payload));
}

function loadHistoricalInventory() {
  const repository = args.get("--source-repository");
  if (!repository) throw new Error("--source-repository is required with --write");
  const ref = String(args.get("--source-ref") || "origin/main");
  return JSON.parse(execFileSync("git", ["show", `${ref}:${V2_PATH}`], {
    cwd: resolve(String(repository)),
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }));
}

function buildProjection() {
  const inventory = loadHistoricalInventory();
  if (inventory.schema_version !== "seo-platform-11a-inventory.v2") {
    throw new Error(`unexpected historical schema: ${inventory.schema_version}`);
  }
  if (inventory.inventory_hash !== V2_INVENTORY_HASH) {
    throw new Error(`historical v2 inventory hash drift: ${inventory.inventory_hash}`);
  }

  const classificationByPath = new Map();
  for (const record of inventory.records) {
    if (record.repository !== "fap-web" || !CLASSIFICATIONS.has(record.classification)) continue;
    for (const path of record.members || []) {
      if (!classificationByPath.has(path)) classificationByPath.set(path, record.classification);
    }
  }

  const paths = inventory.paths_manifest
    .filter((row) => row.repository === "fap-web")
    .map((row) => row.path);
  for (const path of SUPPLEMENTAL_PATHS.keys()) paths.push(path);
  const uniquePaths = [...new Set(paths)].sort();
  const manifest = uniquePaths.map((path) => {
    const classification = SUPPLEMENTAL_PATHS.get(path) || classificationByPath.get(path);
    if (!classification) throw new Error(`missing classification for ${path}`);
    if (!existsSync(resolve(root, path))) throw new Error(`missing path while building projection: ${path}`);
    return fileRow(path, classification);
  });

  const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const projection = {
    schema_version: "seo-platform-11a-final-tree-projection.v1",
    artifact_kind: "non_authoritative_inventory_projection",
    status: "frozen",
    repository: "fap-web",
    fap_web_agent_authority: false,
    execution_authorized: false,
    canonical_registry: {
      repository: "fap-api",
      registry_hash: REGISTRY_HASH,
    },
    historical_baseline: {
      schema_version: inventory.schema_version,
      inventory_version: inventory.inventory_version,
      inventory_hash: inventory.inventory_hash,
      source_fap_web_sha: inventory.source_repository_snapshots.find((row) => row.repository === "fap-web")?.sha,
      path_manifest_count: inventory.paths_manifest.filter((row) => row.repository === "fap-web").length,
    },
    source_repository_snapshot: {
      repository: "fap-web",
      sha: sourceSha,
      evidence_state: "verified_worktree",
    },
    fixed_boundaries: {
      runtime_created: false,
      runtime_model_invocation_enabled: false,
      model_calls_performed: 0,
      cms_writes: 0,
      seo_data_writes: 0,
      search_submissions: 0,
      production_data_writes: 0,
      delegated_executions: 0,
      l4_state: "dormant_not_authorized",
    },
    summary: {
      path_manifest_count: manifest.length,
      missing_paths: 0,
      hash_drift: 0,
      unclassified: 0,
      duplicate_paths: 0,
      web_seo_scripts: walk(resolve(root, "scripts/seo")).length,
    },
    path_set_hash: sha256(canonicalJson(manifest.map((row) => row.path))),
    paths_manifest: manifest,
  };
  projection.projection_self_hash = projectionHash(projection);
  writeFileSync(projectionPath, `${JSON.stringify(projection, null, 2)}\n`);
  return projection;
}

function verifyProjection() {
  const projection = JSON.parse(readFileSync(projectionPath, "utf8"));
  const manifest = Array.isArray(projection.paths_manifest) ? projection.paths_manifest : [];
  const paths = manifest.map((row) => row.path);
  const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
  const missing = manifest.filter((row) => !existsSync(resolve(root, row.path)));
  const drift = manifest.filter((row) => existsSync(resolve(root, row.path))
    && sha256(readFileSync(resolve(root, row.path))) !== row.sha256);
  const invalidClassification = manifest.filter((row) => !CLASSIFICATIONS.has(row.classification));
  const manifestSet = new Set(paths);
  const unclassifiedCandidates = walk(root)
    .map(normalizedPath)
    .filter((path) => path !== PROJECTION_PATH)
    .filter((path) => path.toLowerCase().includes("seo-platform-11a"))
    .filter((path) => !manifestSet.has(path));
  const webSeoScripts = walk(resolve(root, "scripts/seo")).length;
  const pathSetHash = sha256(canonicalJson([...paths].sort()));
  const selfHash = projectionHash(projection);
  const requiredPathsMissing = [...SUPPLEMENTAL_PATHS.keys()].filter((path) => !manifestSet.has(path));
  const metadataFailures = [];
  if (projection.schema_version !== "seo-platform-11a-final-tree-projection.v1") metadataFailures.push("schema_version");
  if (projection.artifact_kind !== "non_authoritative_inventory_projection") metadataFailures.push("artifact_kind");
  if (projection.fap_web_agent_authority !== false) metadataFailures.push("fap_web_agent_authority");
  if (projection.execution_authorized !== false) metadataFailures.push("execution_authorized");
  if (projection.canonical_registry?.registry_hash !== REGISTRY_HASH) metadataFailures.push("registry_hash");
  if (projection.historical_baseline?.inventory_hash !== V2_INVENTORY_HASH) metadataFailures.push("historical_v2_hash");
  if (projection.path_set_hash !== pathSetHash) metadataFailures.push("path_set_hash");
  if (projection.projection_self_hash !== selfHash) metadataFailures.push("projection_self_hash");
  if (webSeoScripts !== 139) metadataFailures.push("web_seo_scripts");
  if (requiredPathsMissing.length > 0) metadataFailures.push("required_paths");

  const result = {
    ok: missing.length === 0
      && drift.length === 0
      && invalidClassification.length === 0
      && unclassifiedCandidates.length === 0
      && duplicates.length === 0
      && metadataFailures.length === 0,
    missing_paths: missing.length,
    hash_drift: drift.length,
    unclassified: invalidClassification.length + unclassifiedCandidates.length,
    duplicate_paths: duplicates.length,
    web_seo_scripts: webSeoScripts,
    projection_self_hash: selfHash,
    path_set_hash: pathSetHash,
    details: {
      missing_paths: missing.map((row) => row.path),
      hash_drift: drift.map((row) => row.path),
      unclassified: [...invalidClassification.map((row) => row.path), ...unclassifiedCandidates],
      duplicate_paths: [...new Set(duplicates)],
      metadata_failures: metadataFailures,
      required_paths_missing: requiredPathsMissing,
    },
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.ok) process.exitCode = 1;
}

if (args.has("--write")) {
  buildProjection();
}
verifyProjection();
