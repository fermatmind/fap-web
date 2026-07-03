#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  fetchNoRedirect,
  findCanonicalHref,
  findMetaRobotsNoindex,
  getUnsafeLiveFetchIssue,
  isNoindexHeader,
  looksLikeHtml,
  normalizeUrlForCompare,
} from "./lib/live-url-check.mjs";

const DEFAULT_SAMPLES = "docs/seo/agent/runtime-qa/default-samples.v1.json";
const DEFAULT_SITE_URL = "https://fermatmind.com";
const DEFAULT_TIMEOUT_MS = 30_000;

function readArgs(argv) {
  const args = {
    samples: DEFAULT_SAMPLES,
    siteUrl: DEFAULT_SITE_URL,
    output: "",
    markdownOutput: "",
    timeoutMs: DEFAULT_TIMEOUT_MS,
    noNetwork: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") continue;
    else if (arg === "--samples") args.samples = argv[++index] || args.samples;
    else if (arg === "--site-url") args.siteUrl = argv[++index] || args.siteUrl;
    else if (arg === "--output") args.output = argv[++index] || "";
    else if (arg === "--markdown-output") args.markdownOutput = argv[++index] || "";
    else if (arg === "--timeout-ms") args.timeoutMs = Number.parseInt(argv[++index] || "", 10) || DEFAULT_TIMEOUT_MS;
    else if (arg === "--no-network") args.noNetwork = true;
    else if (arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/seo/check-public-runtime-seo-qa.mjs [options]

Options:
  --samples <path>          Sample definition JSON. Default: ${DEFAULT_SAMPLES}
  --site-url <url>          Public site origin. Default: ${DEFAULT_SITE_URL}
  --output <path>           Optional JSON output path. Default: stdout only
  --markdown-output <path>  Optional Markdown report path
  --timeout-ms <ms>         Fetch timeout for public samples
  --no-network             Validate sample safety without fetching public URLs
`);
}

function readJson(filePath) {
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch (error) {
    return {
      ok: false,
      error: `invalid_samples_json:${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function toUrlResult(sample, siteUrl) {
  try {
    const origin = new URL(siteUrl).origin;
    return { ok: true, url: new URL(sample.path || sample.url || "/", origin).toString() };
  } catch (error) {
    return {
      ok: false,
      url: String(sample?.path || sample?.url || ""),
      issue: buildIssue("invalid_sample_url", error instanceof Error ? error.message : String(error)),
    };
  }
}

function expectedHostResult(siteUrl) {
  try {
    return { ok: true, hostname: new URL(siteUrl).hostname };
  } catch (error) {
    return {
      ok: false,
      issue: buildIssue("invalid_site_url", error instanceof Error ? error.message : String(error)),
    };
  }
}

function statusFamily(status) {
  if (status >= 200 && status < 300) return "2xx";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "4xx";
  if (status >= 500) return "5xx";
  return "unknown";
}

function readAttribute(tag, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const match = tag.match(pattern);
  return match ? match[2] ?? match[3] ?? match[4] ?? "" : "";
}

function readHreflangLinks(html, rawUrl) {
  const links = [];
  const issues = [];
  for (const row of (html.match(/<link\b[^>]*>/gi) || [])
    .map((tag) => ({
      rel: readAttribute(tag, "rel"),
      hreflang: readAttribute(tag, "hreflang"),
      href: readAttribute(tag, "href"),
    }))
    .filter((candidate) => candidate.rel.toLowerCase().split(/\\s+/).includes("alternate") && candidate.hreflang && candidate.href)) {
    try {
      links.push({
        hreflang: row.hreflang,
        href: new URL(row.href, rawUrl).toString(),
      });
    } catch (error) {
      issues.push(buildIssue("invalid_hreflang_url", `${row.href}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
  return { links, issues };
}

function readJsonLdTypes(html) {
  return (html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [])
    .map((tag) => tag.replace(/^<script\b[^>]*>/i, "").replace(/<\/script>$/i, "").trim())
    .flatMap((body) => {
      try {
        const parsed = JSON.parse(body);
        const rows = Array.isArray(parsed) ? parsed : [parsed];
        return rows.map((row) => row?.["@type"]).filter(Boolean);
      } catch {
        return ["invalid_jsonld"];
      }
    });
}

function buildIssue(reason, detail = "") {
  return { reason, detail };
}

function evaluateExpected(sample, observed) {
  const issues = [];
  const expected = sample.expect || {};

  if (expected.status_family && observed.status_family !== expected.status_family) {
    issues.push(buildIssue("unexpected_status_family", `${observed.status_family} expected=${expected.status_family}`));
  }

  if (expected.redirect_to_path) {
    let locationPath = "";
    try {
      locationPath = observed.redirect?.location ? new URL(observed.redirect.location, observed.url).pathname : "";
    } catch {
      locationPath = "";
    }
    if (locationPath !== expected.redirect_to_path) {
      issues.push(buildIssue("unexpected_redirect_target", `${locationPath || "missing"} expected=${expected.redirect_to_path}`));
    }
  }

  return issues;
}

async function inspectPublicSample(sample, options) {
  const urlResult = toUrlResult(sample, options.siteUrl);
  if (!urlResult.ok) {
    return {
      path: sample.path || "",
      url: urlResult.url,
      source_classification: "PUBLIC_SAMPLE_INVALID_URL",
      fetched: false,
      passed: false,
      issues: [urlResult.issue],
    };
  }
  const url = urlResult.url;
  const expectedHost = expectedHostResult(options.siteUrl);
  if (!expectedHost.ok) {
    return {
      path: sample.path || "",
      url,
      source_classification: "PUBLIC_SAMPLE_INVALID_SITE_URL",
      fetched: false,
      passed: false,
      issues: [expectedHost.issue],
    };
  }
  const unsafe = getUnsafeLiveFetchIssue(url, { expectedHost: expectedHost.hostname });
  if (unsafe) {
    return {
      path: sample.path || "",
      url,
      source_classification: "DENY_POLICY",
      fetched: false,
      passed: false,
      issues: [buildIssue("unsafe_public_sample", JSON.stringify(unsafe.reasons || []))],
    };
  }

  if (options.noNetwork) {
    return {
      path: sample.path || "",
      url,
      source_classification: "PUBLIC_SAMPLE_NO_NETWORK",
      fetched: false,
      passed: true,
      issues: [],
    };
  }

  let fetched;
  try {
    fetched = await fetchNoRedirect(url, {
      timeoutMs: options.timeoutMs,
      expectedHost: expectedHost.hostname,
      accept: "text/html,application/xhtml+xml,application/xml,text/plain,*/*",
    });
  } catch (error) {
    return {
      path: sample.path || "",
      url,
      source_classification: "LIVE_PUBLIC_GET",
      fetched: true,
      passed: false,
      issues: [buildIssue("request_failed", error instanceof Error ? error.message : String(error))],
    };
  }

  return inspectFetchedPublicSample(sample, options, url, fetched);
}

export function inspectFetchedPublicSample(sample, options, url, fetched) {
  const issues = [];
  const { response, body } = fetched;
  const location = response.headers.get("location") || "";
  const contentType = response.headers.get("content-type") || "";
  const family = statusFamily(response.status);
  const htmlLike = looksLikeHtml(contentType, body);
  const canonicalHref = htmlLike ? findCanonicalHref(body) : null;
  let canonicalUrl = null;
  if (canonicalHref) {
    try {
      canonicalUrl = new URL(canonicalHref, url).toString();
    } catch (error) {
      issues.push(buildIssue("invalid_canonical_url", `${canonicalHref}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
  const robotsNoindex = isNoindexHeader(response.headers) || (htmlLike ? findMetaRobotsNoindex(body) : false);
  const hreflangResult = htmlLike ? readHreflangLinks(body, url) : { links: [], issues: [] };
  const hreflang = hreflangResult.links;
  const jsonLdTypes = htmlLike ? readJsonLdTypes(body) : [];
  issues.push(...hreflangResult.issues);

  if (family === "4xx" || family === "5xx") {
    issues.push(buildIssue("http_error_status", String(response.status)));
  }

  if (family === "2xx" && !canonicalUrl) {
    issues.push(buildIssue("missing_canonical"));
  }

  if (family === "2xx" && canonicalUrl && normalizeUrlForCompare(canonicalUrl) !== normalizeUrlForCompare(url)) {
    issues.push(buildIssue("canonical_drift", canonicalUrl));
  }

  if (robotsNoindex) {
    issues.push(buildIssue("noindex_detected"));
  }

  issues.push(...evaluateExpected(sample, { url, status_family: family, redirect: { location } }));

  return {
    path: sample.path || "",
    url,
    source_classification: "LIVE_PUBLIC_GET",
    fetched: true,
    status: response.status,
    status_family: family,
    redirect: location ? { location } : null,
    canonical: canonicalUrl,
    robots: { noindex: robotsNoindex },
    hreflang,
    jsonld_types: jsonLdTypes,
    passed: issues.length === 0,
    issues,
  };
}

function inspectDenySample(sample, options) {
  const urlResult = toUrlResult(sample, options.siteUrl);
  if (!urlResult.ok) {
    return {
      path: sample.path || "",
      url: urlResult.url,
      source_classification: "DENY_POLICY_INVALID_URL",
      fetched: false,
      passed: false,
      reasons: [],
      issues: [urlResult.issue],
    };
  }
  const url = urlResult.url;
  const expectedHost = expectedHostResult(options.siteUrl);
  if (!expectedHost.ok) {
    return {
      path: sample.path || "",
      url,
      source_classification: "DENY_POLICY_INVALID_SITE_URL",
      fetched: false,
      passed: false,
      reasons: [],
      issues: [expectedHost.issue],
    };
  }
  const unsafe = getUnsafeLiveFetchIssue(url, { expectedHost: expectedHost.hostname });
  const reasons = unsafe?.reasons || [];
  const expectedReason = sample.expect?.reason;
  const passed = Boolean(unsafe) && (!expectedReason || reasons.some((row) => row.reason === expectedReason));

  return {
    path: sample.path || "",
    url,
    source_classification: "DENY_POLICY",
    fetched: false,
    passed,
    reasons,
    issues: passed ? [] : [buildIssue("deny_policy_not_enforced", expectedReason || "")],
  };
}

function buildReport({ samples, publicResults, denyResults, options }) {
  const allResults = [...publicResults, ...denyResults];
  const failed = allResults.filter((row) => !row.passed);

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    runner: "check-public-runtime-seo-qa",
    mode: options.noNetwork ? "no_network_contract" : "live_public_get_readonly",
    site_url: options.siteUrl,
    samples: {
      source_path: options.samples,
      seed: samples.seed || "",
      public_count: publicResults.length,
      deny_policy_count: denyResults.length,
    },
    summary: {
      passed: failed.length === 0,
      checked: allResults.length,
      failed: failed.length,
      live_fetches: publicResults.filter((row) => row.fetched).length,
      deny_policy_fetches: denyResults.filter((row) => row.fetched).length,
    },
    public_results: publicResults,
    deny_policy_results: denyResults,
  };
}

function writeMarkdown(report, outputPath) {
  const lines = [
    "# SEO Runtime QA Agent Report",
    "",
    `Generated: ${report.generated_at}`,
    `Mode: ${report.mode}`,
    `Site: ${report.site_url}`,
    "",
    `Passed: ${report.summary.passed}`,
    `Checked: ${report.summary.checked}`,
    `Failed: ${report.summary.failed}`,
    `Live fetches: ${report.summary.live_fetches}`,
    "",
    "## Failed Rows",
    "",
  ];

  const failedRows = [...report.public_results, ...report.deny_policy_results].filter((row) => !row.passed);
  if (failedRows.length === 0) {
    lines.push("No failed rows.");
  } else {
    for (const row of failedRows) {
      lines.push(`- ${row.path || row.url}: ${row.issues.map((issue) => issue.reason).join(", ")}`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
}

async function main() {
  const options = readArgs(process.argv.slice(2));
  const parsedSamples = readJson(options.samples);
  const samples = parsedSamples.ok ? parsedSamples.value : { seed: "", public_samples: [], deny_policy_samples: [] };
  const publicSamples = samples.public_samples || [];
  const denySamples = samples.deny_policy_samples || [];
  const publicResults = parsedSamples.ok
    ? []
    : [{
      path: options.samples,
      url: "",
      source_classification: "SAMPLES_JSON",
      fetched: false,
      passed: false,
      issues: [buildIssue("invalid_samples_json", parsedSamples.error)],
    }];

  if (parsedSamples.ok) {
    for (const sample of publicSamples) {
      publicResults.push(await inspectPublicSample(sample, options));
    }
  }

  const denyResults = parsedSamples.ok ? denySamples.map((sample) => inspectDenySample(sample, options)) : [];
  const report = buildReport({ samples, publicResults, denyResults, options });
  const json = `${JSON.stringify(report, null, 2)}\n`;

  if (options.output) {
    fs.mkdirSync(path.dirname(options.output), { recursive: true });
    fs.writeFileSync(options.output, json);
  } else {
    process.stdout.write(json);
  }

  if (options.markdownOutput) {
    writeMarkdown(report, options.markdownOutput);
  }

  process.exitCode = report.summary.passed ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
