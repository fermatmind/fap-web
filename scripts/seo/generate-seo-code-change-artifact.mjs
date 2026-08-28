#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { resolveOutputDir, resolveRepoPath } from "./artifactSafety.mjs";

const SCHEMA_VERSION = "seo-code-change-artifact.v1";
const ACCEPTED_REQUEST_SCHEMAS = new Set([
  "seo-code-change-request.v1",
  "seo-agent-fapweb-code-pr-request.v1",
]);
const ALLOWED_FIX_TYPES = new Set([
  "structured_data",
  "canonical_hreflang",
  "sitemap_llms",
  "runtime_seo_rendering",
]);
const ALLOWED_PREFIXES = ["app/", "components/", "lib/seo/", "scripts/seo/", "tests/", "docs/seo/"];
const DISALLOWED_PREFIXES = [".env", ".github/workflows/", "content/", "data/", "public/"];
const FORBIDDEN_TEXT = [
  /BEGIN PRIVATE KEY/i,
  /\bBearer\s+[A-Za-z0-9._-]+/i,
  /client_email/i,
  /private_key/i,
  /password/i,
  /AUTHORIZE_/i,
  /approved\s+(?:by|for)/i,
  /auto[-_ ]?merge/i,
  /bypass\s+review/i,
];

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\/+/, "");
}

function parseArgs(argv) {
  const args = { requestPath: "", artifactDir: "", json: false };
  for (const arg of argv) {
    if (arg === "--json") args.json = true;
    else if (arg.startsWith("--request=")) args.requestPath = arg.slice("--request=".length);
    else if (arg.startsWith("--artifact-dir=")) args.artifactDir = arg.slice("--artifact-dir=".length);
  }
  if (!args.requestPath) throw new Error("--request is required");
  if (!args.artifactDir) throw new Error("--artifact-dir is required");
  return args;
}

function validateRequest(request) {
  const issues = [];
  if (!request || typeof request !== "object" || Array.isArray(request)) {
    return ["request must be a JSON object"];
  }
  if (!ACCEPTED_REQUEST_SCHEMAS.has(request.schema_version)) issues.push("unsupported schema_version");
  if (!request.request_id || typeof request.request_id !== "string") issues.push("request_id is required");
  if (!ALLOWED_FIX_TYPES.has(request.fix_type)) issues.push("unsupported fix_type");
  if (!Array.isArray(request.target_files) || request.target_files.length === 0) {
    issues.push("target_files must be a non-empty array");
  } else {
    for (const rawTarget of request.target_files) {
      const target = normalizePath(rawTarget);
      if (!target || target.includes("..") || path.isAbsolute(target)) {
        issues.push(`invalid target path: ${rawTarget}`);
      } else if (!ALLOWED_PREFIXES.some((prefix) => target.startsWith(prefix))) {
        issues.push(`target outside deterministic artifact scope: ${target}`);
      } else if (DISALLOWED_PREFIXES.some((prefix) => target.startsWith(prefix))) {
        issues.push(`target explicitly disallowed: ${target}`);
      }
    }
  }
  const serialized = JSON.stringify(request);
  if (FORBIDDEN_TEXT.some((pattern) => pattern.test(serialized))) {
    issues.push("request contains secret or self-authorization language");
  }
  if (/https?:\/\//i.test(serialized)) issues.push("request must not contain raw URLs");
  if (request.direct_main_push_allowed === true || request.auto_deploy_allowed === true) {
    issues.push("request cannot grant delivery authority");
  }
  return issues;
}

function buildArtifact(request, requestHash) {
  return {
    schema_version: SCHEMA_VERSION,
    artifact_kind: "deterministic_change_plan",
    authority: "none",
    execution_authorized: false,
    source_request: {
      request_id: request.request_id,
      sha256: requestHash,
    },
    normalized_scope: {
      fix_type: request.fix_type,
      summary: String(request.scope_summary || ""),
      target_files: [...new Set(request.target_files.map(normalizePath))].sort(),
      evidence_refs: [...new Set((request.evidence_refs || []).map(normalizePath))].sort(),
    },
    required_checks: [
      "focused affected tests",
      "git diff --check",
      "changed-file scope verification",
    ],
    boundaries: {
      agent_authority: false,
      model_invocation_allowed: false,
      git_mutation_allowed: false,
      pull_request_creation_allowed: false,
      deployment_allowed: false,
      cms_write_allowed: false,
      seo_data_write_allowed: false,
      search_submission_allowed: false,
      production_data_write_allowed: false,
      external_egress_allowed: false,
    },
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const requestPath = path.isAbsolute(args.requestPath)
    ? path.resolve(args.requestPath)
    : resolveRepoPath(process.cwd(), args.requestPath, "request path");
  const artifactDir = resolveOutputDir(process.cwd(), args.artifactDir, "artifact directory");
  const requestBytes = fs.readFileSync(requestPath);
  const request = JSON.parse(requestBytes.toString("utf8"));
  const issues = validateRequest(request);
  const requestHash = sha256(requestBytes);
  const artifact = issues.length === 0
    ? buildArtifact(request, requestHash)
    : { schema_version: SCHEMA_VERSION, artifact_kind: "rejected", execution_authorized: false, issues };
  const artifactBytes = `${JSON.stringify(artifact, null, 2)}\n`;
  fs.mkdirSync(artifactDir, { recursive: true });
  const artifactPath = path.join(artifactDir, `seo-code-change-artifact-${requestHash.slice(0, 16)}.json`);
  fs.writeFileSync(artifactPath, artifactBytes);
  const output = {
    ok: issues.length === 0,
    schema_version: SCHEMA_VERSION,
    artifact_path: artifactPath,
    artifact_sha256: sha256(artifactBytes),
    issues,
  };
  console.log(JSON.stringify(output, null, 2));
  if (!output.ok) process.exitCode = 1;
}

main();
