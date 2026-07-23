#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const SCHEMA_VERSION = "1.1";
const DEFAULT_PUBLIC_PATH = "/";
const DEFAULT_PRIVATE_PATH = "/zh/result/SYNTHETIC_DO_NOT_USE";
const CONSENT_KEY = "fm_consent_v1";
const LANDING_PAGEVIEW_PREFIX = "fm_landing_pv_sent_v1:";

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
    .replace(/\b[a-f0-9]{16,32}\b/gi, "[redacted-provider-id]")
    .replace(/((?:id|token|key|secret|authorization|cookie)=)[^\s&]+/gi, "$1[redacted]")
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

function createReport() {
  return {
    schema_version: SCHEMA_VERSION,
    checked_at: new Date().toISOString(),
    repository_sha: process.env.GITHUB_SHA || process.env.REPOSITORY_SHA || "unknown",
    csp_nonce_present: false,
    bootstrap_header_nonce_match: false,
    dynamic_script_nonce_match: false,
    independent_response_nonces: false,
    consent_action_completed: false,
    landing_pageview_marker_present: false,
    ga_loader_attempted: false,
    baidu_loader_attempted: false,
    first_party_track_attempted: false,
    telemetry_attempt_count: 0,
    telemetry_abort_count: 0,
    all_telemetry_aborted: false,
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

async function pollPageValue(page, reader, argument, failure, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await page.evaluate(reader, argument)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(failure);
}

function installTelemetryAbort(context, attempted, aborted) {
  return context.route("**/*", async (route) => {
    const request = route.request();
    const requestUrl = new URL(request.url());
    let category = null;

    if (requestUrl.hostname === "www.googletagmanager.com" && requestUrl.pathname === "/gtag/js") {
      category = "ga";
    } else if (requestUrl.hostname === "hm.baidu.com" && requestUrl.pathname === "/hm.js") {
      category = "baidu";
    } else if (request.method() !== "GET" && requestUrl.pathname === "/api/track") {
      category = "track";
    }

    if (category) {
      attempted[category] += 1;
      aborted[category] += 1;
      await route.abort("blockedbyclient");
      return;
    }

    await route.continue();
  });
}

function telemetryTotal(counts) {
  return counts.ga + counts.baidu + counts.track;
}

async function main() {
  let args;
  const report = createReport();
  let browser;

  try {
    args = parseArgs(process.argv.slice(2));
    const resolverArgs = args.resolveTo
      ? [
          `--host-resolver-rules=MAP ${new URL(args.baseUrl).hostname} ${args.resolveTo}`,
          "--no-proxy-server",
          "--ignore-certificate-errors",
        ]
      : [];
    browser = await chromium.launch({ headless: true, args: resolverArgs });
    const attempted = { ga: 0, baidu: 0, track: 0 };
    const aborted = { ga: 0, baidu: 0, track: 0 };
    const cspErrors = [];
    const attachConsoleGuard = (page) => {
      page.on("console", (message) => {
        if (isCspScriptBlockingMessage(message.text())) {
          cspErrors.push(redactFailure(message.text()));
        }
      });
    };

    const publicUrl = new URL(args.publicPath, args.baseUrl).toString();
    const firstContext = await browser.newContext({
      serviceWorkers: "block",
      ignoreHTTPSErrors: Boolean(args.resolveTo),
    });
    await installTelemetryAbort(firstContext, attempted, aborted);
    const firstPage = await firstContext.newPage();
    attachConsoleGuard(firstPage);
    const firstResponse = await firstPage.goto(publicUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    if (!firstResponse) throw new Error("Public navigation did not return a response");
    const firstHeaders = await firstResponse.allHeaders();
    const firstPolicy = firstHeaders["content-security-policy"] || firstHeaders["content-security-policy-report-only"] || "";
    const firstNonce = nonceFromCsp(firstPolicy);
    report.csp_nonce_present = Boolean(firstNonce);

    const bootstrapNonce = await firstPage.locator("#fm-analytics-bootstrap").evaluate((element) => element.nonce || "");
    report.bootstrap_header_nonce_match = Boolean(firstNonce && bootstrapNonce === firstNonce);

    const consentButton = firstPage.getByTestId("cookie-banner-accept");
    await consentButton.waitFor({ state: "visible", timeout: 10_000 });
    await consentButton.click();
    await pollPageValue(firstPage, (consentKey) => {
      try {
        return JSON.parse(window.localStorage.getItem(consentKey) || "{}").analytics === "granted";
      } catch {
        return false;
      }
    }, CONSENT_KEY, "cookie banner did not persist granted consent");
    report.consent_action_completed = true;

    await pollPageValue(firstPage, (prefix) => {
      const marker = `${prefix}${window.location.pathname}${window.location.search}`;
      return window.sessionStorage.getItem(marker) === "1";
    }, LANDING_PAGEVIEW_PREFIX, "landing pageview dedupe marker did not appear");
    report.landing_pageview_marker_present = true;

    await firstPage.locator("#fm-google-tag-script").waitFor({ state: "attached", timeout: 10_000 });
    await firstPage.locator("#fm-baidu-tongji-script").waitFor({ state: "attached", timeout: 10_000 });
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

    const secondContext = await browser.newContext({
      serviceWorkers: "block",
      ignoreHTTPSErrors: Boolean(args.resolveTo),
    });
    await installTelemetryAbort(secondContext, attempted, aborted);
    const secondPage = await secondContext.newPage();
    attachConsoleGuard(secondPage);
    const secondResponse = await secondPage.goto(publicUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    if (!secondResponse) throw new Error("Second public navigation did not return a response");
    const secondHeaders = await secondResponse.allHeaders();
    const secondPolicy = secondHeaders["content-security-policy"] || secondHeaders["content-security-policy-report-only"] || "";
    const secondNonce = nonceFromCsp(secondPolicy);
    report.independent_response_nonces = Boolean(firstNonce && secondNonce && firstNonce !== secondNonce);
    await secondContext.close();

    const attemptsBeforePrivate = { ...attempted };
    const privateContext = await browser.newContext({
      serviceWorkers: "block",
      ignoreHTTPSErrors: Boolean(args.resolveTo),
    });
    await installTelemetryAbort(privateContext, attempted, aborted);
    const privatePage = await privateContext.newPage();
    const privateUrl = new URL(args.privatePath, args.baseUrl).toString();
    await privatePage.goto(privateUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await new Promise((resolve) => setTimeout(resolve, 250));
    const privateElements = await privatePage.locator(
      "#fm-analytics-bootstrap, #fm-google-tag-script, #fm-baidu-tongji-script"
    ).count();
    report.private_route_suppression = (
      privateElements === 0
      && attempted.ga === attemptsBeforePrivate.ga
      && attempted.baidu === attemptsBeforePrivate.baidu
      && attempted.track === attemptsBeforePrivate.track
    );
    await privateContext.close();
    await firstContext.close();

    report.ga_loader_attempted = attempted.ga > 0;
    report.baidu_loader_attempted = attempted.baidu > 0;
    report.first_party_track_attempted = attempted.track > 0;
    report.telemetry_attempt_count = telemetryTotal(attempted);
    report.telemetry_abort_count = telemetryTotal(aborted);
    report.all_telemetry_aborted = (
      report.telemetry_attempt_count > 0
      && report.telemetry_attempt_count === report.telemetry_abort_count
    );
    report.csp_blocking_error_count = cspErrors.length;

    const assertions = [
      [report.csp_nonce_present, "response CSP nonce missing"],
      [report.bootstrap_header_nonce_match, "bootstrap/header nonce mismatch"],
      [report.dynamic_script_nonce_match, "dynamic provider script nonce mismatch"],
      [report.independent_response_nonces, "independent browser contexts reused a nonce"],
      [report.consent_action_completed, "cookie banner consent action did not complete"],
      [report.landing_pageview_marker_present, "landing pageview dedupe marker missing"],
      [report.ga_loader_attempted, "GA loader was not attempted"],
      [report.baidu_loader_attempted, "Baidu loader was not attempted"],
      [report.first_party_track_attempted, "first-party track write was not attempted"],
      [report.all_telemetry_aborted, "one or more telemetry requests were not aborted"],
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
