#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { resolveOutputDir, resolveRepoPath } from "./artifactSafety.mjs";

const SCHEMA_VERSION = "seo-agent-fapweb-code-pr-writer.v1";
const REQUEST_SCHEMA_VERSION = "seo-agent-fapweb-code-pr-request.v1";

const ALLOWED_FIX_TYPES = new Set([
  "structured_data",
  "canonical_hreflang",
  "sitemap_llms",
  "runtime_seo_rendering",
]);

const ALLOWED_TARGET_PREFIXES = [
  "app/",
  "components/",
  "lib/seo/",
  "scripts/seo/",
  "tests/",
  "docs/seo/",
];

const DISALLOWED_TARGET_PREFIXES = [
  ".env",
  ".github/workflows/",
  "content/",
  "data/",
  "docs/seo/generated/",
  "lib/marketing/",
  "public/",
];

const REQUIRED_CHECKS = [
  "pnpm typecheck",
  "NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build",
  "pnpm test:contract",
  "git diff --check",
];

const FORBIDDEN_PATTERNS = [
  /BEGIN PRIVATE KEY/i,
  /\bBearer\s+[A-Za-z0-9._-]+/i,
  /client_email/i,
  /private_key/i,
  /credential/i,
  /token/i,
  /password/i,
];

const ALLOWED_REQUEST_KEYS = new Set([
  "schema_version",
  "request_id",
  "fix_type",
  "scope_summary",
  "base_branch",
  "branch_name",
  "target_files",
  "evidence_refs",
  "direct_main_push_allowed",
  "auto_deploy_allowed",
]);

const SELF_AUTHORIZATION_KEY_PATTERNS = [
  /approval/i,
  /authorization/i,
  /approved/i,
  /review_decision/i,
  /merge_policy/i,
  /auto_merge/i,
  /bypass/i,
  /override/i,
];

const SELF_AUTHORIZATION_VALUE_PATTERNS = [
  /AUTHORIZE_(?:CMS|SEARCH|SCHEMA|HREFLANG|INDEX|PRODUCTION|DEPLOY|MERGE)/i,
  /\b(?:approved|authorized)\s+(?:by|for)\b/i,
  /\b(?:auto[-_ ]?merge|merge without review|bypass review)\b/i,
  /\b(?:go for execution|approve execution)\b/i,
];

function printHelp() {
  console.log(`Usage: node scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs --request=<request.json> --artifact-dir=<dir> [--json]

Builds a sanitized fap-web SEO code PR plan artifact for Codex.
The runner performs no git mutation, no direct main push, no deploy, no CMS write,
no Search Channel submit, and no indexing request.
`);
}

function readArgs(argv) {
  if (argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const args = {
    requestPath: "",
    artifactDir: "",
    json: false,
  };

  for (const arg of argv) {
    if (arg === "--json") {
      args.json = true;
    } else if (arg.startsWith("--request=")) {
      args.requestPath = arg.slice("--request=".length);
    } else if (arg.startsWith("--artifact-dir=")) {
      args.artifactDir = arg.slice("--artifact-dir=".length);
    } else if (!arg.startsWith("--") && !args.requestPath) {
      args.requestPath = arg;
    }
  }

  if (!args.requestPath) {
    throw new Error("--request is required.");
  }
  if (!args.artifactDir) {
    throw new Error("--artifact-dir is required.");
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\/+/, "");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function collectStrings(value, result = []) {
  if (typeof value === "string") {
    result.push(value);
    return result;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, result);
    }
    return result;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectStrings(item, result);
    }
  }
  return result;
}

function isFermatMindUrl(value) {
  if (!/^https?:\/\//i.test(value)) {
    return false;
  }
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === "fermatmind.com" || hostname.endsWith(".fermatmind.com");
  } catch {
    return false;
  }
}

function scanForbiddenStrings(value) {
  const text = JSON.stringify(value);
  const matches = FORBIDDEN_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  if (collectStrings(value).some(isFermatMindUrl)) {
    matches.push("fermatmind_full_url");
  }
  return matches;
}

function collectSelfAuthorizationClaims(value, pathSegments = [], issues = []) {
  if (typeof value === "string") {
    const match = SELF_AUTHORIZATION_VALUE_PATTERNS.find((pattern) => pattern.test(value));
    if (match) {
      issues.push(`${pathSegments.join(".") || "<root>"} contains self-authorization language: ${match.source}`);
    }
    return issues;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectSelfAuthorizationClaims(item, [...pathSegments, String(index)], issues));
    return issues;
  }

  if (!value || typeof value !== "object") {
    return issues;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const keyPath = [...pathSegments, key].join(".");
    const isAllowedTopLevel = pathSegments.length === 0 && ALLOWED_REQUEST_KEYS.has(key);
    const hasSelfAuthKey = SELF_AUTHORIZATION_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (!isAllowedTopLevel && hasSelfAuthKey && nestedValue !== false && nestedValue !== null && nestedValue !== "") {
      issues.push(`${keyPath} is not an accepted request field and may not claim approval or override authority`);
    }
    collectSelfAuthorizationClaims(nestedValue, [...pathSegments, key], issues);
  }

  return issues;
}

function validateTargetFile(file) {
  const normalized = normalizePath(file);
  if (!normalized || normalized.includes("..") || path.isAbsolute(normalized)) {
    return `target file must be a repo-relative path: ${file}`;
  }
  if (DISALLOWED_TARGET_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(prefix))) {
    return `target file is outside fap-web SEO code PR scope: ${normalized}`;
  }
  if (!ALLOWED_TARGET_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return `target file is not in an allowed fap-web SEO/code/test/docs prefix: ${normalized}`;
  }
  return "";
}

function collectIssues(request) {
  const issues = [];

  if (request.schema_version !== REQUEST_SCHEMA_VERSION) {
    issues.push(`schema_version must be ${REQUEST_SCHEMA_VERSION}`);
  }
  if (!request.request_id) {
    issues.push("request_id is required");
  }
  if (!ALLOWED_FIX_TYPES.has(request.fix_type)) {
    issues.push(`fix_type must be one of: ${[...ALLOWED_FIX_TYPES].join(", ")}`);
  }
  if (!Array.isArray(request.evidence_refs) || request.evidence_refs.length === 0) {
    issues.push("evidence_refs must include at least one evidence id or artifact ref");
  }
  if (!Array.isArray(request.target_files) || request.target_files.length === 0) {
    issues.push("target_files must include at least one planned fap-web code/test/doc path");
  }

  for (const file of request.target_files || []) {
    const issue = validateTargetFile(file);
    if (issue) issues.push(issue);
  }

  if (request.branch_name && !String(request.branch_name).startsWith("codex/")) {
    issues.push("branch_name must use codex/ prefix when provided");
  }
  if (request.base_branch && request.base_branch !== "main") {
    issues.push("base_branch must be main");
  }
  if (request.direct_main_push_allowed !== false) {
    issues.push("direct_main_push_allowed must be false");
  }
  if (request.auto_deploy_allowed !== false) {
    issues.push("auto_deploy_allowed must be false");
  }

  const forbiddenMatches = scanForbiddenStrings(request);
  if (forbiddenMatches.length > 0) {
    issues.push(`request contains forbidden secret/raw URL markers: ${forbiddenMatches.join(", ")}`);
  }

  const selfAuthorizationClaims = collectSelfAuthorizationClaims(request);
  if (selfAuthorizationClaims.length > 0) {
    issues.push(`request contains forbidden self-authorization claims: ${selfAuthorizationClaims.join("; ")}`);
  }

  return issues;
}

function buildArtifact(request, requestPath) {
  const normalizedFiles = [...new Set((request.target_files || []).map(normalizePath))].sort();
  const dedupeSource = [
    request.request_id,
    request.fix_type,
    ...normalizedFiles,
    ...(request.evidence_refs || []),
  ].join("|");

  return {
    schema_version: SCHEMA_VERSION,
    mode: "pr_plan_only",
    request: {
      request_id: request.request_id,
      request_sha256: sha256(fs.readFileSync(requestPath, "utf8")),
      fix_type: request.fix_type,
      evidence_refs: request.evidence_refs || [],
      target_files: normalizedFiles,
      scope_summary: request.scope_summary || "",
    },
    pr_policy: {
      base_branch: "main",
      branch_prefix: "codex/",
      recommended_branch: request.branch_name || `codex/seo-agent-${request.fix_type.replaceAll("_", "-")}`,
      direct_main_push_allowed: false,
      auto_deploy_allowed: false,
      pr_required: true,
      human_review_required: true,
      checks_required_before_merge: REQUIRED_CHECKS,
    },
    code_scope: {
      allowed_fix_types: [...ALLOWED_FIX_TYPES],
      allowed_target_prefixes: ALLOWED_TARGET_PREFIXES,
      disallowed_target_prefixes: DISALLOWED_TARGET_PREFIXES,
      dedupe_key: sha256(dedupeSource),
    },
    boundaries: {
      git_push_attempted: false,
      github_pr_created_by_runner: false,
      direct_main_push_allowed: false,
      auto_deploy_allowed: false,
      cms_write_allowed: false,
      search_channel_submit_allowed: false,
      indexing_request_allowed: false,
      scheduler_activation_allowed: false,
      production_env_change_allowed: false,
    },
    recommended_next_step: "codex_open_scoped_fap_web_pr_after_human_review",
  };
}

function main() {
  const args = readArgs(process.argv.slice(2));
  const requestPath = path.isAbsolute(args.requestPath)
    ? path.resolve(args.requestPath)
    : resolveRepoPath(process.cwd(), args.requestPath, "request path");
  const artifactDir = resolveOutputDir(process.cwd(), args.artifactDir, "artifact directory");
  const request = readJson(requestPath);
  const issues = collectIssues(request);

  fs.mkdirSync(artifactDir, { recursive: true });

  const artifact = issues.length === 0
    ? buildArtifact(request, requestPath)
    : {
      schema_version: SCHEMA_VERSION,
      mode: "rejected",
      issues,
      boundaries: {
        git_push_attempted: false,
        github_pr_created_by_runner: false,
        direct_main_push_allowed: false,
        auto_deploy_allowed: false,
        cms_write_allowed: false,
        search_channel_submit_allowed: false,
        indexing_request_allowed: false,
        scheduler_activation_allowed: false,
        production_env_change_allowed: false,
      },
    };

  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const artifactPath = path.join(artifactDir, `seo-agent-fapweb-code-pr-writer-${timestamp}.json`);
  const artifactJson = `${JSON.stringify(artifact, null, 2)}\n`;
  fs.writeFileSync(artifactPath, artifactJson);

  const output = {
    ok: issues.length === 0,
    schema_version: SCHEMA_VERSION,
    artifact_path: artifactPath,
    artifact_size: Buffer.byteLength(artifactJson),
    artifact_sha256: sha256(artifactJson),
    issues,
    summary: {
      mode: artifact.mode,
      fix_type: request.fix_type || null,
      target_file_count: Array.isArray(request.target_files) ? request.target_files.length : 0,
      pr_required: true,
      direct_main_push_allowed: false,
      auto_deploy_allowed: false,
    },
  };

  console.log(JSON.stringify(output, null, 2));
  if (!output.ok) {
    process.exitCode = 1;
  }
}

main();
