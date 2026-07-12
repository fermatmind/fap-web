#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WORKFLOWS_DIR = path.join(ROOT, ".github/workflows");

const BLESSED_ACTIONS = {
  "actions/checkout": {
    repo: "actions/checkout",
    sha: "df4cb1c069e1874edd31b4311f1884172cec0e10",
    tag: "v6",
  },
  "actions/setup-node": {
    repo: "actions/setup-node",
    sha: "48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
    tag: "v6",
  },
  "actions/upload-artifact": {
    repo: "actions/upload-artifact",
    sha: "ea165f8d65b6e75b540449e92b4886f43607fa02",
    tag: "v4",
  },
  "actions/github-script": {
    repo: "actions/github-script",
    sha: "ed597411d8f924073f98dfc5c65a23a2325f34cd",
    tag: "v8",
  },
  "github/codeql-action/init": {
    repo: "github/codeql-action",
    sha: "1ad29ea4a422cce9a242a9fae469541dcd08addc",
    tag: "v4",
  },
  "github/codeql-action/analyze": {
    repo: "github/codeql-action",
    sha: "1ad29ea4a422cce9a242a9fae469541dcd08addc",
    tag: "v4",
  },
  "webfactory/ssh-agent": {
    repo: "webfactory/ssh-agent",
    sha: "e83874834305fe9a4a2997156cb26c5de65a8555",
    tag: "v0.10.0",
  },
};

const USES_PATTERN = /^\s*(?:-\s*)?uses:\s+([^#\s]+)(?:\s+#\s*(\S+).*)?$/;
const SHA_REF_PATTERN = /^[0-9a-f]{40}$/;

function parseActionRef(ref) {
  const atIndex = ref.lastIndexOf("@");
  if (atIndex === -1) {
    return null;
  }

  const action = ref.slice(0, atIndex);
  const version = ref.slice(atIndex + 1);
  const parts = action.split("/");

  if (parts.length < 2 || action.startsWith("./") || action.startsWith("../")) {
    return null;
  }

  return { action, version };
}

function workflowFiles() {
  return readdirSync(WORKFLOWS_DIR)
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
    .sort()
    .map((file) => path.join(WORKFLOWS_DIR, file));
}

function extractUses() {
  const uses = [];

  for (const filePath of workflowFiles()) {
    const relPath = path.relative(ROOT, filePath);
    const lines = readFileSync(filePath, "utf8").split("\n");

    lines.forEach((line, index) => {
      const match = line.match(USES_PATTERN);
      if (!match) {
        return;
      }

      const parsed = parseActionRef(match[1]);
      if (!parsed) {
        return;
      }

      uses.push({
        ...parsed,
        comment: match[2] || "",
        relPath,
        line: index + 1,
        raw: line.trim(),
      });
    });
  }

  return uses;
}

function verifyStaticPolicy() {
  const violations = [];

  for (const item of extractUses()) {
    const blessed = BLESSED_ACTIONS[item.action];
    const location = `${item.relPath}:${item.line}`;

    if (!blessed) {
      violations.push(`${location}: action is not in blessed action lock: ${item.action}`);
      continue;
    }

    if (!SHA_REF_PATTERN.test(item.version)) {
      violations.push(`${location}: action must use a 40-character lowercase SHA: ${item.raw}`);
      continue;
    }

    if (item.version !== blessed.sha) {
      violations.push(`${location}: action SHA does not match blessed lock for ${item.action}`);
    }

    if (item.comment && blessed.tag && item.comment !== blessed.tag) {
      violations.push(`${location}: action comment ${item.comment} does not match blessed tag ${blessed.tag}`);
    }
  }

  return violations;
}

function verifyRemoteRefs() {
  const violations = [];
  const checked = new Set();

  for (const [action, blessed] of Object.entries(BLESSED_ACTIONS)) {
    const key = `${blessed.repo}@${blessed.tag || blessed.sha}`;
    if (checked.has(key)) {
      continue;
    }
    checked.add(key);

    const repoUrl = `https://github.com/${blessed.repo}.git`;
    const ref = blessed.tag ? `refs/tags/${blessed.tag}` : blessed.sha;

    let output = "";
    try {
      output = execFileSync("git", ["ls-remote", repoUrl, ref], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 20000,
      });
    } catch (error) {
      violations.push(`${action}: failed to resolve ${repoUrl} ${ref}: ${error.message}`);
      continue;
    }

    const resolvedSha = output.trim().split(/\s+/)[0] || "";
    if (resolvedSha !== blessed.sha) {
      violations.push(`${action}: ${ref} resolves to ${resolvedSha || "<missing>"} instead of ${blessed.sha}`);
    }
  }

  return violations;
}

const shouldResolve = process.argv.includes("--resolve");
const violations = [...verifyStaticPolicy(), ...(shouldResolve ? verifyRemoteRefs() : [])];

if (violations.length > 0) {
  console.error("GitHub workflow action reference integrity check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(
  `GitHub workflow action reference integrity check passed (${extractUses().length} workflow uses, ${
    Object.keys(BLESSED_ACTIONS).length
  } blessed actions${shouldResolve ? ", remote refs resolved" : ""}).`
);
