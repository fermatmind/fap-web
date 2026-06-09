#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SITE_BASE_URL = "https://fermatmind.com";
const DEFAULT_ALLOWED_HOSTS = ["fermatmind.com"];
const DEFAULT_TIMEOUT_MS = 30_000;

export const ZH_SCIENCE_FOOTER_LINKS = [
  { path: "/zh/science", href: "/science", label: "测评科学" },
  { path: "/zh/method-boundaries", href: "/method-boundaries", label: "方法边界" },
  { path: "/zh/item-design-notes", href: "/item-design-notes", label: "题目设计说明" },
  { path: "/zh/reliability-validity", href: "/reliability-validity", label: "信度效度" },
  { path: "/zh/data-privacy", href: "/data-privacy", label: "数据说明" },
  { path: "/zh/common-misconceptions", href: "/common-misconceptions", label: "常见误区" },
];

const FORBIDDEN_ROUTE_FRAGMENTS = ["/result", "/results/", "/orders", "/pay", "/payment", "/share/", "/history", "token=", "orderNo="];

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function normalizeBaseUrl(value, fallback) {
  const rawValue = stripTrailingSlash(value || fallback);
  const url = new URL(rawValue);
  url.pathname = stripTrailingSlash(url.pathname);
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function readAllowedHosts(env) {
  return String(env.SCIENCE_CONTENTPAGE_ZH_FOOTER_ALLOWED_HOSTS || DEFAULT_ALLOWED_HOSTS.join(","))
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function buildConfig(env = process.env) {
  const siteBaseUrl = normalizeBaseUrl(
    env.SCIENCE_CONTENTPAGE_ZH_FOOTER_SITE_BASE_URL || env.NEXT_PUBLIC_SITE_URL,
    DEFAULT_SITE_BASE_URL
  );
  const allowedHosts = readAllowedHosts(env);
  const timeoutMs = readPositiveInt(env.SCIENCE_CONTENTPAGE_ZH_FOOTER_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const hostname = new URL(siteBaseUrl).hostname.toLowerCase();

  if (!allowedHosts.includes(hostname)) {
    throw new Error(`unexpected_monitor_host=${hostname}`);
  }

  return { siteBaseUrl, allowedHosts, timeoutMs };
}

function makeIssue(check, detail) {
  return { check, detail };
}

function sourceFilePath() {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "components", "layout", "SiteFooter.tsx");
}

function readFooterSource() {
  return fs.readFileSync(sourceFilePath(), "utf8");
}

function checkPrivateRouteFragments() {
  const issues = [];

  for (const item of ZH_SCIENCE_FOOTER_LINKS) {
    for (const fragment of FORBIDDEN_ROUTE_FRAGMENTS) {
      if (item.path.includes(fragment) || item.href.includes(fragment)) {
        issues.push(makeIssue(`route.${item.href}.private_fragment`, `Forbidden private route fragment ${fragment}`));
      }
    }
  }

  return issues;
}

function checkFooterSourceLinks() {
  const source = readFooterSource();
  const issues = [];

  for (const item of ZH_SCIENCE_FOOTER_LINKS) {
    const hrefNeedle = `href: "${item.href}"`;
    const labelNeedle = `label: "${item.label}"`;

    if (!source.includes(hrefNeedle) || !source.includes(labelNeedle)) {
      issues.push(makeIssue(`source.${item.href}`, `Missing zh footer source link ${item.href} ${item.label}`));
    }
  }

  return issues;
}

async function fetchRouteStatus(config, item) {
  const url = new URL(item.path, config.siteBaseUrl);
  if (!config.allowedHosts.includes(url.hostname.toLowerCase())) {
    return [makeIssue(`route.${item.path}.host`, `Blocked monitor host ${url.hostname}`)];
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,*/*",
        "User-Agent": "FermatMind zh Science footer link checker",
      },
    });

    if (response.status !== 200) {
      return [makeIssue(`route.${item.path}.status`, `Expected 200, got ${response.status}`)];
    }

    return [];
  } catch (error) {
    return [makeIssue(`route.${item.path}.request`, error instanceof Error ? error.message : String(error))];
  } finally {
    clearTimeout(timer);
  }
}

export async function runZhScienceFooterLinkCheck(config = buildConfig()) {
  const routeIssueGroups = await Promise.all(ZH_SCIENCE_FOOTER_LINKS.map((item) => fetchRouteStatus(config, item)));
  const issues = [...checkPrivateRouteFragments(), ...checkFooterSourceLinks(), ...routeIssueGroups.flat()];

  return {
    ok: issues.length === 0,
    site_base_url: config.siteBaseUrl,
    checked_links: ZH_SCIENCE_FOOTER_LINKS,
    checks: {
      private_routes: ZH_SCIENCE_FOOTER_LINKS.length,
      footer_source: ZH_SCIENCE_FOOTER_LINKS.length,
      route_200: ZH_SCIENCE_FOOTER_LINKS.length,
    },
    issues,
  };
}

async function main() {
  let result;

  try {
    result = await runZhScienceFooterLinkCheck();
  } catch (error) {
    console.error(`[science-zh-footer-links] config_error=${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  }

  console.log(
    `[science-zh-footer-links] site=${result.site_base_url} links=${result.checked_links.length} ok=${result.ok}`
  );

  for (const issue of result.issues) {
    console.log(`[science-zh-footer-links:bad] ${JSON.stringify(issue)}`);
  }

  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
