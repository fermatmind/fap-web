#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const SCHEMA_VERSION = "1.0";
const DEFAULT_PUBLIC_PATH = "/zh";
const DEFAULT_PRIVATE_PATH = "/zh/result/SYNTHETIC_DO_NOT_USE";

function parseArgs(argv) {
  const parsed = {
    baseUrl: "",
    output: "",
    publicPath: DEFAULT_PUBLIC_PATH,
    privatePath: DEFAULT_PRIVATE_PATH,
    resolveTo: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === "--") {
      continue;
    } else if (argument === "--base-url" && value) {
      parsed.baseUrl = value;
      index += 1;
    } else if (argument === "--output" && value) {
      parsed.output = value;
      index += 1;
    } else if (argument === "--public-path" && value) {
      parsed.publicPath = value;
      index += 1;
    } else if (argument === "--private-path" && value) {
      parsed.privatePath = value;
      index += 1;
    } else if (argument === "--resolve-to" && value) {
      parsed.resolveTo = value;
      index += 1;
    } else {
      throw new Error(`Unsupported or incomplete argument: ${argument}`);
    }
  }

  if (!parsed.baseUrl || !parsed.output) {
    throw new Error("Usage: runtime-smoke.mjs --base-url <http(s)://host> --output <report.json>");
  }

  const target = new URL(parsed.baseUrl);
  if (!/^https?:$/.test(target.protocol) || target.username || target.password || target.search || target.hash) {
    throw new Error("--base-url must be an HTTP(S) URL without credentials, query, or fragment");
  }
  if (!parsed.publicPath.startsWith("/") || !parsed.privatePath.startsWith("/")) {
    throw new Error("Smoke paths must be absolute URL paths");
  }
  if (parsed.resolveTo && !isSafeResolverAddress(parsed.resolveTo)) {
    throw new Error("--resolve-to must be a valid IPv4 address or ::1");
  }

  return {
    ...parsed,
    baseUrl: target.origin,
    output: path.resolve(parsed.output),
  };
}

function isSafeResolverAddress(value) {
  if (value === "::1") return true;
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function redactFailure(value) {
  return String(value)
    .replace(/G-[A-Z0-9]{4,32}/gi, "[redacted-ga-id]")
    .replace(/((?:id|token|key|secret|authorization)=)[^\s&]+/gi, "$1[redacted]")
    .replace(/(https?:\/\/[^\s?'\"<>]+)\?[^\s'\"<>]*/gi, "$1?[redacted-query]")
    .slice(0, 500);
}

function nonceFromCsp(policy) {
  const match = String(policy || "").match(/'nonce-([^']+)'/);
  return match?.[1] || "";
}

function isCspScriptBlockingMessage(message) {
  const normalized = String(message || "").toLowerCase();
  return (
    normalized.includes("content security policy")
    && (normalized.includes("script-src") || normalized.includes("refused to execute") || normalized.includes("refused to load"))
  );
}

function createReport(targetHost) {
  return {
    schema_version: SCHEMA_VERSION,
    checked_at: new Date().toISOString(),
    target_host: targetHost,
    repository_sha: process.env.GITHUB_SHA || process.env.REPOSITORY_SHA || "unknown",
    csp_nonce_present: false,
    bootstrap_header_nonce_match: false,
    dynamic_script_nonce_match: false,
    independent_response_nonces: false,
    ga_loader_attempted: false,
    baidu_loader_attempted: false,
    first_party_track_attempted: false,
    csp_blocking_error_count: 0,
    private_route_suppression: false,
    health_status: "unhealthy",
    failures: [],
  };
}

async function writeReport(output, report) {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function waitForTelemetryAttempts(attempted, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (attempted.ga > 0 && attempted.baidu > 0 && attempted.track > 0) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function main() {
  let args;
  let report = createReport("unknown");
  let browser;

  try {
    args = parseArgs(process.argv.slice(2));
    report = createReport(new URL(args.baseUrl).host);
    const resolverArgs = args.resolveTo
      ? [`--host-resolver-rules=MAP ${new URL(args.baseUrl).hostname} ${args.resolveTo}`]
      : [];
    browser = await chromium.launch({ headless: true, args: resolverArgs });
    const context = await browser.newContext({ serviceWorkers: "block" });
    const attempted = { ga: 0, baidu: 0, track: 0 };
    const cspErrors = [];

    await context.addInitScript(() => {
      window.localStorage.setItem("fm_consent_v1", JSON.stringify({
        analytics: "granted",
        updatedAt: new Date().toISOString(),
      }));
    });

    await context.route("**/*", async (route) => {
      const request = route.request();
      const requestUrl = new URL(request.url());
      if (requestUrl.hostname === "www.googletagmanager.com" && requestUrl.pathname === "/gtag/js") {
        attempted.ga += 1;
        await route.abort("blockedbyclient");
        return;
      }
      if (requestUrl.hostname === "hm.baidu.com" && requestUrl.pathname === "/hm.js") {
        attempted.baidu += 1;
        await route.abort("blockedbyclient");
        return;
      }
      if (request.method() !== "GET" && requestUrl.pathname === "/api/track") {
        attempted.track += 1;
        await route.abort("blockedbyclient");
        return;
      }
      await route.continue();
    });

    const attachConsoleGuard = (page) => {
      page.on("console", (message) => {
        if (isCspScriptBlockingMessage(message.text())) {
          cspErrors.push(redactFailure(message.text()));
        }
      });
    };

    const publicUrl = new URL(args.publicPath, args.baseUrl).toString();
    const firstPage = await context.newPage();
    attachConsoleGuard(firstPage);
    const firstResponse = await firstPage.goto(publicUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    if (!firstResponse) throw new Error("Public navigation did not return a response");
    const firstHeaders = await firstResponse.allHeaders();
    const firstPolicy = firstHeaders["content-security-policy"] || firstHeaders["content-security-policy-report-only"] || "";
    const firstNonce = nonceFromCsp(firstPolicy);
    report.csp_nonce_present = Boolean(firstNonce);

    const bootstrapNonce = await firstPage.locator("#fm-analytics-bootstrap").evaluate((element) => element.nonce || "");
    report.bootstrap_header_nonce_match = Boolean(firstNonce && bootstrapNonce === firstNonce);

    await firstPage.waitForFunction(() => (
      Boolean(document.querySelector("#fm-google-tag-script"))
      && Boolean(document.querySelector("#fm-baidu-tongji-script"))
    ), undefined, { timeout: 10_000 });
    const dynamicNonces = await firstPage.evaluate(() => ({
      ga: document.querySelector("#fm-google-tag-script")?.nonce || "",
      baidu: document.querySelector("#fm-baidu-tongji-script")?.nonce || "",
    }));
    report.dynamic_script_nonce_match = Boolean(
      firstNonce
      && dynamicNonces.ga === firstNonce
      && dynamicNonces.baidu === firstNonce
    );

    await waitForTelemetryAttempts(attempted);

    const secondPage = await context.newPage();
    attachConsoleGuard(secondPage);
    const secondResponse = await secondPage.goto(publicUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    if (!secondResponse) throw new Error("Second public navigation did not return a response");
    const secondHeaders = await secondResponse.allHeaders();
    const secondPolicy = secondHeaders["content-security-policy"] || secondHeaders["content-security-policy-report-only"] || "";
    const secondNonce = nonceFromCsp(secondPolicy);
    report.independent_response_nonces = Boolean(firstNonce && secondNonce && firstNonce !== secondNonce);

    await firstPage.close();
    await secondPage.close();
    const attemptsBeforePrivate = { ...attempted };
    const privatePage = await context.newPage();
    attachConsoleGuard(privatePage);
    const privateUrl = new URL(args.privatePath, args.baseUrl).toString();
    await privatePage.goto(privateUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await privatePage.waitForTimeout(250);
    const privateElements = await privatePage.locator(
      "#fm-analytics-bootstrap, #fm-google-tag-script, #fm-baidu-tongji-script"
    ).count();
    report.private_route_suppression = (
      privateElements === 0
      && attempted.ga === attemptsBeforePrivate.ga
      && attempted.baidu === attemptsBeforePrivate.baidu
      && attempted.track === attemptsBeforePrivate.track
    );

    report.ga_loader_attempted = attempted.ga > 0;
    report.baidu_loader_attempted = attempted.baidu > 0;
    report.first_party_track_attempted = attempted.track > 0;
    report.csp_blocking_error_count = cspErrors.length;

    const assertions = [
      [report.csp_nonce_present, "response CSP nonce missing"],
      [report.bootstrap_header_nonce_match, "bootstrap/header nonce mismatch"],
      [report.dynamic_script_nonce_match, "dynamic provider script nonce mismatch"],
      [report.independent_response_nonces, "independent HTML responses reused a nonce"],
      [report.ga_loader_attempted, "GA loader was not attempted"],
      [report.baidu_loader_attempted, "Baidu loader was not attempted"],
      [report.first_party_track_attempted, "first-party track write was not attempted"],
      [report.csp_blocking_error_count === 0, "script-src CSP blocking error observed"],
      [report.private_route_suppression, "private-route analytics suppression failed"],
    ];
    report.failures = assertions.filter(([passed]) => !passed).map(([, failure]) => failure);
    if (cspErrors.length > 0) report.failures.push(...cspErrors);
    report.health_status = report.failures.length === 0 ? "healthy" : "unhealthy";
  } catch (error) {
    report.failures.push(redactFailure(error instanceof Error ? error.message : error));
    report.health_status = "unhealthy";
  } finally {
    if (browser) await browser.close();
    if (args?.output) {
      await writeReport(args.output, report);
    }
    process.stdout.write(`${JSON.stringify(report)}\n`);
  }

  if (report.health_status !== "healthy") process.exitCode = 1;
}

await main();
