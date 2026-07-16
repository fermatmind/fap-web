#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = "1.0";
const PRODUCTION_BASE_URL = "https://fermatmind.com";
const PRODUCTION_ENVIRONMENT = "production";
const DEPLOYMENT_SHA_SOURCE = "github_deployment_artifact";
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_SMOKE_SCRIPT = path.join(SCRIPT_DIR, "runtime-smoke.mjs");

function parseArgs(argv) {
  const parsed = {
    output: "",
    deploymentMetadata: "",
    fixtureBaseUrl: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === "--") {
      continue;
    } else if (argument === "--output" && value) {
      parsed.output = path.resolve(value);
      index += 1;
    } else if (argument === "--deployment-metadata" && value) {
      parsed.deploymentMetadata = path.resolve(value);
      index += 1;
    } else if (argument === "--fixture-base-url" && value) {
      parsed.fixtureBaseUrl = normalizeFixtureBaseUrl(value);
      index += 1;
    } else {
      throw new Error(`Unsupported or incomplete argument: ${argument}`);
    }
  }

  if (!parsed.output || !parsed.deploymentMetadata) {
    throw new Error(
      "Usage: monitor-runtime.mjs --output <report.json> --deployment-metadata <deployment.json>"
    );
  }

  if (process.env.ANALYTICS_RUNTIME_MONITOR_TARGET
    && process.env.ANALYTICS_RUNTIME_MONITOR_TARGET !== PRODUCTION_BASE_URL) {
    throw new Error("ANALYTICS_RUNTIME_MONITOR_TARGET must match the fixed production target");
  }

  return parsed;
}

function normalizeFixtureBaseUrl(value) {
  const target = new URL(value);
  const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
  if (
    target.protocol !== "http:"
    || !loopbackHosts.has(target.hostname)
    || !target.port
    || target.username
    || target.password
    || target.pathname !== "/"
    || target.search
    || target.hash
  ) {
    throw new Error("--fixture-base-url accepts only a loopback HTTP origin with an explicit port");
  }
  return target.origin;
}

function redactFailure(value) {
  return String(value)
    .replace(/G-[A-Z0-9]{4,32}/gi, "[redacted-ga-id]")
    .replace(/\b[a-f0-9]{16,32}\b/gi, "[redacted-provider-id]")
    .replace(/((?:id|token|key|secret|authorization|cookie)=)[^\s&]+/gi, "$1[redacted]")
    .replace(/(bearer\s+)[^\s]+/gi, "$1[redacted]")
    .replace(/(https?:\/\/[^\s?'\"<>]+)\?[^\s'\"<>]*/gi, "$1?[redacted-query]")
    .replace(/\/(?:zh|en)?\/?(result|orders|share|pay|payment|history)\/[^\s?#]+/gi, "/$1/[redacted-private-path]")
    .replace(/<[^>]{1,500}>/g, "[redacted-markup]")
    .slice(0, 500);
}

function normalizeRepositorySha(value) {
  const normalized = String(value || "").toLowerCase();
  return SHA_PATTERN.test(normalized) ? normalized : "unknown";
}

function unknownDeployment(reason, queriedAt = null) {
  return {
    production_deployment_sha: "unknown",
    production_deployment_id: null,
    production_deployment_environment: PRODUCTION_ENVIRONMENT,
    production_deployment_queried_at: queriedAt,
    sha_source: DEPLOYMENT_SHA_SOURCE,
    sha_status: "unknown",
    sha_reason: redactFailure(reason || "production_deployment_unknown"),
  };
}

async function readDeploymentMetadata(filePath) {
  try {
    const raw = JSON.parse(await readFile(filePath, "utf8"));
    const sha = normalizeRepositorySha(raw.production_deployment_sha);
    const deploymentId = Number(raw.deployment_id);
    const queriedAt = typeof raw.queried_at === "string" && !Number.isNaN(Date.parse(raw.queried_at))
      ? raw.queried_at
      : null;
    const verified = (
      raw.sha_status === "verified"
      && sha !== "unknown"
      && Number.isSafeInteger(deploymentId)
      && deploymentId > 0
      && raw.environment === PRODUCTION_ENVIRONMENT
      && raw.sha_source === DEPLOYMENT_SHA_SOURCE
      && queriedAt
    );

    if (!verified) {
      return unknownDeployment(raw.sha_reason || "production_deployment_metadata_invalid", queriedAt);
    }

    return {
      production_deployment_sha: sha,
      production_deployment_id: deploymentId,
      production_deployment_environment: PRODUCTION_ENVIRONMENT,
      production_deployment_queried_at: queriedAt,
      sha_source: DEPLOYMENT_SHA_SOURCE,
      sha_status: "verified",
      sha_reason: null,
    };
  } catch {
    return unknownDeployment("production_deployment_metadata_unreadable");
  }
}

async function runRuntimeSmoke(baseUrl, output) {
  const args = [RUNTIME_SMOKE_SCRIPT, "--base-url", baseUrl, "--output", output];
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.resume();
    child.stderr.resume();
    child.once("error", () => resolve({ exitCode: 1 }));
    child.once("close", (code) => resolve({ exitCode: code ?? 1 }));
  });
}

async function readProbeReport(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return {
      health_status: "unknown",
      failures: ["runtime_probe_report_unreadable"],
    };
  }
}

function boolean(value) {
  return value === true;
}

function nonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function deriveHealthStatus(probe, deployment, repositorySha, probeExitCode) {
  if (probeExitCode !== 0 || probe.health_status === "unhealthy") return "unhealthy";
  if (probe.health_status === "degraded") return "degraded";
  if (probe.health_status !== "healthy") return "unknown";
  if (deployment.sha_status !== "verified" || repositorySha === "unknown") return "unknown";
  return "healthy";
}

async function writeReport(output, report) {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${redactFailure(error instanceof Error ? error.message : error)}\n`);
    process.exitCode = 1;
    return;
  }

  const baseUrl = args.fixtureBaseUrl || PRODUCTION_BASE_URL;
  const probeOutput = `${args.output}.probe.tmp`;
  const deployment = await readDeploymentMetadata(args.deploymentMetadata);
  const probeResult = await runRuntimeSmoke(baseUrl, probeOutput);
  const probe = await readProbeReport(probeOutput);
  await rm(probeOutput, { force: true });

  const repositorySha = normalizeRepositorySha(process.env.GITHUB_SHA || probe.repository_sha);
  const failures = Array.isArray(probe.failures)
    ? probe.failures.map(redactFailure).filter(Boolean)
    : [];
  if (probeResult.exitCode !== 0 && failures.length === 0) {
    failures.push("runtime_probe_failed");
  }
  if (deployment.sha_status !== "verified") {
    failures.push(redactFailure(`production deployment SHA unavailable: ${deployment.sha_reason}`));
  }
  if (repositorySha === "unknown") {
    failures.push("workflow repository SHA unavailable");
  }

  const report = {
    schema_version: SCHEMA_VERSION,
    checked_at: new Date().toISOString(),
    target_host: new URL(baseUrl).host,
    repository_sha: repositorySha,
    ...deployment,
    csp_nonce_present: boolean(probe.csp_nonce_present),
    bootstrap_header_nonce_match: boolean(probe.bootstrap_header_nonce_match),
    dynamic_script_nonce_match: boolean(probe.dynamic_script_nonce_match),
    independent_response_nonces: boolean(probe.independent_response_nonces),
    ga_loader_attempted: boolean(probe.ga_loader_attempted),
    baidu_loader_attempted: boolean(probe.baidu_loader_attempted),
    first_party_track_attempted: boolean(probe.first_party_track_attempted),
    csp_blocking_error_count: nonNegativeInteger(probe.csp_blocking_error_count),
    private_route_suppression: boolean(probe.private_route_suppression),
    health_status: deriveHealthStatus(probe, deployment, repositorySha, probeResult.exitCode),
    failures: [...new Set(failures)].slice(0, 20),
  };

  await writeReport(args.output, report);
  process.stdout.write(`${JSON.stringify({
    health_status: report.health_status,
    sha_status: report.sha_status,
    target_host: report.target_host,
  })}\n`);
  if (report.health_status !== "healthy") process.exitCode = 1;
}

await main();
