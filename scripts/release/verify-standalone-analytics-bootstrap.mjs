#!/usr/bin/env node

import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";

const DEFAULT_PORT = 3219;
const DEFAULT_TIMEOUT_MS = 45_000;
const ANALYTICS_ENV_KEYS = [
  "NEXT_PUBLIC_ANALYTICS_ENABLED",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID",
  "NEXT_PUBLIC_BAIDU_TONGJI_ID",
  "NEXT_PUBLIC_ANALYTICS_ENV",
  "NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS",
];

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * @param {Record<string, string | undefined>} source
 * @param {number} port
 * @returns {Record<string, string | undefined>}
 */
export function createRuntimeEnv(source = process.env, port = DEFAULT_PORT) {
  const env = { ...source };
  for (const key of ANALYTICS_ENV_KEYS) {
    delete env[key];
  }

  return {
    ...env,
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
    PORT: String(port),
  };
}

export function assertAnalyticsBootstrapHtml(status, html) {
  if (status !== 200) {
    throw new Error(`standalone /zh returned HTTP ${status}`);
  }
  if (!html.includes('id="fm-analytics-bootstrap"')) {
    throw new Error("standalone /zh omitted the build-time analytics bootstrap");
  }
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;

  child.kill("SIGTERM");
  await Promise.race([
    once(child, "exit"),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5_000)),
  ]);

  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await once(child, "exit");
  }
}

export async function verifyStandaloneAnalyticsBootstrap({
  serverPath = ".next/standalone/server.js",
  port = DEFAULT_PORT,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const absoluteServerPath = resolve(serverPath);
  const child = spawn(process.execPath, [absoluteServerPath], {
    cwd: resolve(serverPath, ".."),
    env: createRuntimeEnv(process.env, port),
    stdio: ["ignore", "pipe", "pipe"],
  });
  const deadline = Date.now() + timeoutMs;
  const url = `http://127.0.0.1:${port}/zh`;

  try {
    while (Date.now() < deadline) {
      if (child.exitCode !== null || child.signalCode !== null) {
        throw new Error("standalone server exited before the analytics probe completed");
      }

      try {
        const response = await fetch(url, {
          redirect: "follow",
          signal: AbortSignal.timeout(5_000),
        });
        const html = await response.text();
        assertAnalyticsBootstrapHtml(response.status, html);
        return;
      } catch (error) {
        if (
          error instanceof Error
          && (
            error.message.startsWith("standalone /zh returned")
            || error.message.startsWith("standalone /zh omitted")
          )
        ) {
          throw error;
        }
      }

      await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 500));
    }

    throw new Error("timed out waiting for standalone /zh");
  } finally {
    await stopChild(child);
  }
}

function isMainModule() {
  return process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
}

if (isMainModule()) {
  const port = parsePositiveInteger(process.env.STANDALONE_ANALYTICS_SMOKE_PORT, DEFAULT_PORT);
  const timeoutMs = parsePositiveInteger(
    process.env.STANDALONE_ANALYTICS_SMOKE_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS
  );

  verifyStandaloneAnalyticsBootstrap({ port, timeoutMs })
    .then(() => {
      console.log("[standalone-analytics-smoke] passed");
    })
    .catch((error) => {
      console.error(
        `[standalone-analytics-smoke] ${error instanceof Error ? error.message : String(error)}`
      );
      process.exitCode = 1;
    });
}
