#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../..");
const DEFAULT_SHARDS = 4;
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
const DIAGNOSTIC_DIR = path.join(ROOT, "generated/test-diagnostics");
const LOG_DIR = path.join(DIAGNOSTIC_DIR, "contract-shards");
const SUMMARY_PATH = path.join(DIAGNOSTIC_DIR, "contract-shards.json");

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
  return options;
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
  const files = discoverContractFiles();
  const plan = createShardPlan(files, options.shards).filter((shard) =>
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
    total_file_count: files.length,
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

export { createShardPlan, discoverContractFiles, parseArgs };
