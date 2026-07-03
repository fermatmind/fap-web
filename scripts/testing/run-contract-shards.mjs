#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../..");
const DEFAULT_SHARDS = 4;
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
const DIAGNOSTIC_DIR = path.join(ROOT, "generated/test-diagnostics");
const LOG_DIR = path.join(DIAGNOSTIC_DIR, "contract-shards");
const SUMMARY_PATH = path.join(DIAGNOSTIC_DIR, "contract-shards.json");
const GROUPS_PATH = path.join(ROOT, "tests/contracts/_runner/contract-groups.json");

function parsePositiveInt(value, fallback, label) {
  if (value == null || value === "") return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer, got ${value}`);
  }
  return parsed;
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    shards: parsePositiveInt(process.env.CONTRACT_SHARDS, DEFAULT_SHARDS, "CONTRACT_SHARDS"),
    timeoutMs: parsePositiveInt(
      process.env.CONTRACT_SHARD_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
      "CONTRACT_SHARD_TIMEOUT_MS",
    ),
    onlyShard: null,
    group: null,
    focusedGate: process.env.CONTRACT_FOCUSED_GATE ?? "content_asset",
    includeQuarantine: process.env.CONTRACT_INCLUDE_QUARANTINE === "1",
    onlyQuarantine: false,
    listGroups: false,
    passthrough: [],
  };

  for (const arg of argv) {
    if (arg === "--") {
      continue;
    } else if (arg.startsWith("--shards=")) {
      options.shards = parsePositiveInt(arg.slice("--shards=".length), options.shards, "--shards");
    } else if (arg.startsWith("--timeout-ms=")) {
      options.timeoutMs = parsePositiveInt(arg.slice("--timeout-ms=".length), options.timeoutMs, "--timeout-ms");
    } else if (arg.startsWith("--only-shard=")) {
      options.onlyShard = parsePositiveInt(arg.slice("--only-shard=".length), options.onlyShard, "--only-shard");
    } else if (arg.startsWith("--group=")) {
      options.group = arg.slice("--group=".length);
    } else if (arg.startsWith("--focused-gate=")) {
      options.focusedGate = arg.slice("--focused-gate=".length);
    } else if (arg === "--include-quarantine") {
      options.includeQuarantine = true;
    } else if (arg === "--only-quarantine") {
      options.onlyQuarantine = true;
    } else if (arg === "--list-groups") {
      options.listGroups = true;
    } else {
      options.passthrough.push(arg);
    }
  }

  if (options.shards < 4 || options.shards > 8) {
    throw new Error(`--shards must be between 4 and 8 for contract runner operations, got ${options.shards}`);
  }
  if (options.onlyShard != null && (options.onlyShard < 1 || options.onlyShard > options.shards)) {
    throw new Error(`--only-shard must be between 1 and ${options.shards}, got ${options.onlyShard}`);
  }
  if (options.onlyQuarantine && options.group) {
    throw new Error("--only-quarantine cannot be combined with --group");
  }
  return options;
}

function normalizeFiles(files = []) {
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

function loadContractGroups(root = ROOT) {
  const groupsPath = path.join(root, "tests/contracts/_runner/contract-groups.json");
  if (!existsSync(groupsPath)) {
    return {
      schema_version: "fap.contract_groups.v1",
      groups: {},
      quarantine: { files: [] },
      focused_gates: {},
    };
  }
  return JSON.parse(readFileSync(groupsPath, "utf8"));
}

function gitRefExists(ref, cwd = ROOT) {
  const result = spawnSync("git", ["rev-parse", "--verify", "--quiet", ref], {
    cwd,
    stdio: "ignore",
  });
  return result.status === 0;
}

function ensureGitHubActionsBaseRef(cwd = ROOT) {
  if (process.env.GITHUB_ACTIONS !== "true") {
    return;
  }

  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) {
    return;
  }

  const remoteBaseRef = `origin/${baseRef}`;
  if (gitRefExists(remoteBaseRef, cwd)) {
    return;
  }

  console.log(`[contract-runner] fetching ${remoteBaseRef} for git diff scope contracts`);
  const result = spawnSync(
    "git",
    ["fetch", "--no-tags", "--depth=1", "origin", `+refs/heads/${baseRef}:refs/remotes/origin/${baseRef}`],
    {
      cwd,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    console.warn(`[contract-runner] unable to fetch ${remoteBaseRef}; git diff scope contracts may fail`);
  }
}

function walkFiles(dir, root = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(absolute, root);
    const relative = path.relative(root, absolute).split(path.sep).join("/");
    return [relative];
  });
}

function discoverContractFiles(root = ROOT) {
  const contractRoot = path.join(root, "tests/contracts");
  return walkFiles(contractRoot)
    .filter((file) => /\.contract\.test\.(ts|tsx)$/.test(file))
    .map((file) => `tests/contracts/${file}`)
    .sort((a, b) => a.localeCompare(b));
}

function createShardPlan(files, shardCount) {
  return Array.from({ length: shardCount }, (_, index) => ({
    index: index + 1,
    total: shardCount,
    files: files.filter((_, fileIndex) => fileIndex % shardCount === index),
  }));
}

function resolveExecutionFiles(allFiles, groupsConfig, options) {
  const knownFiles = new Set(allFiles);
  const quarantineFiles = normalizeFiles(groupsConfig.quarantine?.files ?? []).filter((file) => knownFiles.has(file));
  const quarantineSet = new Set(quarantineFiles);
  const focusedGateFiles = normalizeFiles(groupsConfig.focused_gates?.[options.focusedGate]?.files ?? []).filter((file) =>
    knownFiles.has(file),
  );

  let selectedFiles = allFiles;
  let selectionMode = "default";

  if (options.listGroups) {
    selectedFiles = [];
    selectionMode = "list_groups";
  } else if (options.onlyQuarantine) {
    selectedFiles = quarantineFiles;
    selectionMode = "quarantine";
  } else if (options.group) {
    const group = groupsConfig.groups?.[options.group];
    if (!group) {
      throw new Error(`Unknown contract group "${options.group}". Run with --list-groups to inspect available groups.`);
    }
    selectedFiles = normalizeFiles(group.files ?? []).filter((file) => knownFiles.has(file));
    selectionMode = `group:${options.group}`;
  }

  if (!options.includeQuarantine && !options.onlyQuarantine) {
    selectedFiles = selectedFiles.filter((file) => !quarantineSet.has(file));
    if (selectionMode === "default") {
      selectedFiles = normalizeFiles([...selectedFiles, ...focusedGateFiles]);
    }
  }

  return {
    files: selectedFiles,
    selection_mode: selectionMode,
    focused_gate: options.focusedGate,
    focused_gate_file_count: focusedGateFiles.length,
    quarantine_file_count: quarantineFiles.length,
    quarantine_excluded_count: options.includeQuarantine || options.onlyQuarantine ? 0 : quarantineFiles.length,
    include_quarantine: options.includeQuarantine,
    groups_path: path.relative(ROOT, GROUPS_PATH).split(path.sep).join("/"),
  };
}

function runCommand(command, args, { cwd, timeoutMs, logPath }) {
  return new Promise((resolve) => {
    const startedAt = new Date();
    let timedOut = false;
    let output = "";
    const child = spawn(command, args, {
      cwd,
      detached: process.platform !== "win32",
      env: { ...process.env, CI: process.env.CI ?? "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const killProcessGroup = (signal) => {
      if (process.platform === "win32") {
        child.kill(signal);
        return;
      }
      try {
        process.kill(-child.pid, signal);
      } catch {
        child.kill(signal);
      }
    };

    const timeout = setTimeout(() => {
      timedOut = true;
      killProcessGroup("SIGTERM");
      setTimeout(() => {
        if (child.exitCode == null && child.signalCode == null) {
          killProcessGroup("SIGKILL");
        }
      }, 1000).unref();
    }, timeoutMs);

    const append = (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    };

    child.stdout.on("data", append);
    child.stderr.on("data", append);

    child.on("close", (code, signal) => {
      clearTimeout(timeout);
      if (timedOut) {
        killProcessGroup("SIGKILL");
      }
      const finishedAt = new Date();
      writeFileSync(logPath, output);
      resolve({
        command: [command, ...args].join(" "),
        status: timedOut ? "timed_out" : code === 0 ? "passed" : "failed",
        exit_code: code,
        signal,
        timed_out: timedOut,
        timeout_ms: timeoutMs,
        started_at: startedAt.toISOString(),
        finished_at: finishedAt.toISOString(),
        duration_ms: finishedAt.getTime() - startedAt.getTime(),
        log_path: path.relative(cwd, logPath).split(path.sep).join("/"),
      });
    });
  });
}

async function runShard(shard, options) {
  const logPath = path.join(LOG_DIR, `shard-${shard.index}-of-${shard.total}.log`);
  const args = ["exec", "vitest", "run", ...shard.files, ...options.passthrough];
  const result = await runCommand("pnpm", args, {
    cwd: ROOT,
    timeoutMs: options.timeoutMs,
    logPath,
  });
  return {
    shard: shard.index,
    total_shards: shard.total,
    file_count: shard.files.length,
    first_file: shard.files[0] ?? null,
    last_file: shard.files.at(-1) ?? null,
    files: shard.files,
    ...result,
  };
}

async function main() {
  const options = parseArgs();
  ensureGitHubActionsBaseRef();
  const discoveredFiles = discoverContractFiles();
  const groupsConfig = loadContractGroups();

  if (options.listGroups) {
    console.log(JSON.stringify(groupsConfig, null, 2));
    return;
  }

  const execution = resolveExecutionFiles(discoveredFiles, groupsConfig, options);
  const plan = createShardPlan(execution.files, options.shards).filter((shard) =>
    options.onlyShard == null ? true : shard.index === options.onlyShard,
  );

  mkdirSync(LOG_DIR, { recursive: true });
  const startedAt = new Date();
  const results = [];

  for (const shard of plan) {
    console.log(`\n[contract-runner] shard ${shard.index}/${shard.total}: ${shard.files.length} files`);
    results.push(await runShard(shard, options));
  }

  const failed = results.filter((result) => result.status !== "passed");
  const finishedAt = new Date();
  const summary = {
    schema_version: "fap.contract_shards.v1",
    command: "pnpm test:contract",
    runner: "scripts/testing/run-contract-shards.mjs",
    status: failed.length === 0 ? "passed" : "failed",
    started_at: startedAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    duration_ms: finishedAt.getTime() - startedAt.getTime(),
    shard_count: options.shards,
    executed_shard_count: results.length,
    total_file_count: discoveredFiles.length,
    selected_file_count: execution.files.length,
    selection_mode: execution.selection_mode,
    group: options.group,
    focused_gate: execution.focused_gate,
    focused_gate_file_count: execution.focused_gate_file_count,
    quarantine_file_count: execution.quarantine_file_count,
    quarantine_excluded_count: execution.quarantine_excluded_count,
    include_quarantine: execution.include_quarantine,
    groups_path: execution.groups_path,
    timeout_ms: options.timeoutMs,
    passthrough_args: options.passthrough,
    diagnostics_path: path.relative(ROOT, SUMMARY_PATH).split(path.sep).join("/"),
    log_dir: path.relative(ROOT, LOG_DIR).split(path.sep).join("/"),
    shards: results,
  };

  writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`\n[contract-runner] wrote ${summary.diagnostics_path}`);

  if (failed.length > 0) {
    console.error(`[contract-runner] ${failed.length} shard(s) failed or timed out`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { createShardPlan, discoverContractFiles, loadContractGroups, parseArgs, resolveExecutionFiles };
