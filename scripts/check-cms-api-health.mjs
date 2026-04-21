#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const DEFAULT_TIMEOUT_MS = 2500;
const DEFAULT_ORG_ID = "0";
const LOCALHOST_PATTERN = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/)?$/i;

function parseEnvFile(pathname) {
  if (!existsSync(pathname)) return {};

  const result = {};
  const content = readFileSync(pathname, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function readEnvValue(key) {
  const cwd = process.cwd();
  const fileEnv = {
    ...parseEnvFile(resolve(cwd, ".env")),
    ...parseEnvFile(resolve(cwd, ".env.local")),
  };

  return process.env[key] || fileEnv[key] || "";
}

function normalizeOrigin(value) {
  const normalized = String(value ?? "").trim().replace(/\/$/, "");
  if (!normalized) return "";
  return /^https?:\/\//i.test(normalized) ? normalized : "";
}

function readTimeoutMs() {
  const rawValue = Number.parseInt(String(process.env.CMS_API_HEALTH_TIMEOUT_MS ?? ""), 10);
  if (Number.isFinite(rawValue) && rawValue > 0) return rawValue;
  return DEFAULT_TIMEOUT_MS;
}

function buildArticlesHealthUrl(origin) {
  const url = new URL("/api/v0.5/articles", origin);
  url.searchParams.set("locale", "zh-CN");
  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", "1");
  url.searchParams.set("org_id", DEFAULT_ORG_ID);
  return url;
}

function warn(lines) {
  console.warn(lines.join("\n"));
}

const configuredOrigin = normalizeOrigin(readEnvValue("NEXT_PUBLIC_API_URL"));
const apiOrigin = configuredOrigin || DEFAULT_API_ORIGIN;
const timeoutMs = readTimeoutMs();
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);
const healthUrl = buildArticlesHealthUrl(apiOrigin);

try {
  const response = await fetch(healthUrl, {
    cache: "no-store",
    signal: controller.signal,
    headers: {
      accept: "application/json",
    },
  });

  clearTimeout(timeout);

  if (!response.ok) {
    warn([
      `[check-cms-api] Warning: CMS API health check returned HTTP ${response.status}.`,
      `[check-cms-api] NEXT_PUBLIC_API_URL=${apiOrigin}`,
      "[check-cms-api] Homepage recommended articles, SEO, sitemap, and CMS-backed surfaces may render empty or minimal states.",
    ]);
    process.exit(0);
  }

  let itemCount = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = await response.json().catch(() => null);
    itemCount = Array.isArray(payload?.items) ? payload.items.length : null;
  }

  if (itemCount === 0) {
    warn([
      "[check-cms-api] Warning: CMS API is reachable, but returned no published zh-CN article records for the smoke query.",
      `[check-cms-api] NEXT_PUBLIC_API_URL=${apiOrigin}`,
      "[check-cms-api] Homepage recommended articles may be intentionally empty unless the staging CMS baseline is loaded.",
    ]);
    process.exit(0);
  }

  const localHint = LOCALHOST_PATTERN.test(apiOrigin)
    ? " Local API mode is intended for backend/CMS contract work only."
    : "";

  console.log(`[check-cms-api] OK: CMS API reachable at ${apiOrigin}.${localHint}`);
} catch (error) {
  clearTimeout(timeout);

  const reason = error instanceof Error ? error.message : String(error);
  warn([
    `[check-cms-api] Warning: CMS API health check failed: ${reason}`,
    `[check-cms-api] NEXT_PUBLIC_API_URL=${apiOrigin}`,
    "[check-cms-api] Frontend dev will continue, but CMS-backed content may be empty:",
    "[check-cms-api] - homepage recommended articles",
    "[check-cms-api] - article listing/detail data",
    "[check-cms-api] - landing surface blocks",
    "[check-cms-api] - SEO/sitemap/llms enumeration",
    "[check-cms-api] Use a stable staging API for daily frontend work; use localhost only for backend/CMS integration.",
  ]);
}

process.exit(0);
