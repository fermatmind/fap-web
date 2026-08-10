#!/usr/bin/env node

import tls from "node:tls";
import process from "node:process";

const DAY_MS = 86_400_000;
const DEFAULT_TIMEOUT_MS = 10_000;

function parseArgs(argv) {
  const options = {
    hosts: [],
    alertDays: [21, 14, 7],
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!value) throw new Error(`Missing value for ${flag || "argument"}`);
    if (flag === "--hosts") {
      options.hosts = value.split(",").map((host) => host.trim()).filter(Boolean);
    } else if (flag === "--alert-days") {
      options.alertDays = value.split(",").map(Number);
    } else if (flag === "--timeout-ms") {
      options.timeoutMs = Number(value);
    } else {
      throw new Error(`Unknown argument: ${flag}`);
    }
  }

  if (options.hosts.length === 0) throw new Error("At least one TLS host is required");
  if (options.hosts.some((host) => !/^[a-z0-9.-]+$/i.test(host))) throw new Error("Invalid TLS host");
  if (
    options.alertDays.length !== 3
    || options.alertDays.some((days) => !Number.isInteger(days) || days <= 0)
    || options.alertDays.some((days, index) => index > 0 && days >= options.alertDays[index - 1])
  ) {
    throw new Error("--alert-days must contain three descending positive integers");
  }
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 1_000 || options.timeoutMs > 30_000) {
    throw new Error("--timeout-ms must be between 1000 and 30000");
  }

  return options;
}

export function classifyCertificate(expiresAt, now, alertDays = [21, 14, 7]) {
  const remainingMs = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.floor(remainingMs / DAY_MS);
  const [warning, urgent, critical] = alertDays;

  if (daysRemaining < 0) return { status: "expired", daysRemaining };
  if (daysRemaining <= critical) return { status: "critical", daysRemaining };
  if (daysRemaining <= urgent) return { status: "urgent", daysRemaining };
  if (daysRemaining <= warning) return { status: "warning", daysRemaining };
  return { status: "ok", daysRemaining };
}

export function readCertificate(host, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host,
      port: 443,
      servername: host,
      rejectUnauthorized: true,
    });
    const timeout = setTimeout(() => {
      socket.destroy(new Error(`TLS connection timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    socket.once("secureConnect", () => {
      const certificate = socket.getPeerCertificate();
      const expiresAt = new Date(certificate.valid_to);
      const authorized = socket.authorized;
      const authorizationError = socket.authorizationError;
      clearTimeout(timeout);
      socket.end();

      if (!authorized) {
        reject(new Error(`certificate chain rejected: ${authorizationError || "unknown"}`));
        return;
      }
      if (!certificate.valid_to || Number.isNaN(expiresAt.getTime())) {
        reject(new Error("certificate expiry is missing or invalid"));
        return;
      }
      resolve({ expiresAt });
    });
    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const now = new Date();
  const results = [];

  for (const host of options.hosts) {
    try {
      const { expiresAt } = await readCertificate(host, options.timeoutMs);
      const classification = classifyCertificate(expiresAt, now, options.alertDays);
      results.push({
        host,
        expires_at: expiresAt.toISOString(),
        days_remaining: classification.daysRemaining,
        status: classification.status,
      });
    } catch (error) {
      results.push({
        host,
        status: "unreachable",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const result of results) {
    const summary = result.days_remaining === undefined
      ? `${result.host}: ${result.status}`
      : `${result.host}: ${result.status}, ${result.days_remaining} days remaining`;
    if (result.status === "ok") {
      process.stdout.write(`${summary}\n`);
    } else {
      process.stderr.write(`::error title=TLS certificate renewal required::${summary}\n`);
    }
  }

  process.stdout.write(`${JSON.stringify({ checked_at: now.toISOString(), results })}\n`);
  if (results.some(({ status }) => status !== "ok")) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`public TLS certificate check failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
