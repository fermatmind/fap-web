#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
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
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toUrl(sample, siteUrl) {
  const origin = new URL(siteUrl).origin;
  return new URL(sample.path || sample.url || "/", origin).toString();
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
  return (html.match(/<link\b[^>]*>/gi) || [])
    .map((tag) => ({
      rel: readAttribute(tag, "rel"),
      hreflang: readAttribute(tag, "hreflang"),
      href: readAttribute(tag, "href"),
    }))
    .filter((row) => row.rel.toLowerCase().split(/\\s+/).includes("alternate") && row.hreflang && row.href)
    .map((row) => ({
      hreflang: row.hreflang,
      href: new URL(row.href, rawUrl).toString(),
    }));
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
    const locationPath = observed.redirect?.location ? new URL(observed.redirect.location, observed.url).pathname : "";
    if (locationPath !== expected.redirect_to_path) {
      issues.push(buildIssue("unexpected_redirect_target", `${locationPath || "missing"} expected=${expected.redirect_to_path}`));
    }
  }

  return issues;
}

async function inspectPublicSample(sample, options) {
  const url = toUrl(sample, options.siteUrl);
  const unsafe = getUnsafeLiveFetchIssue(url, { expectedHost: new URL(options.siteUrl).hostname });
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

  const issues = [];
  let fetched;
  try {
    fetched = await fetchNoRedirect(url, {
      timeoutMs: options.timeoutMs,
      expectedHost: new URL(options.siteUrl).hostname,
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

  const { response, body } = fetched;
  const location = response.headers.get("location") || "";
  const contentType = response.headers.get("content-type") || "";
  const family = statusFamily(response.status);
  const htmlLike = looksLikeHtml(contentType, body);
  const canonicalHref = htmlLike ? findCanonicalHref(body) : null;
  const canonicalUrl = canonicalHref ? new URL(canonicalHref, url).toString() : null;
  const robotsNoindex = isNoindexHeader(response.headers) || (htmlLike ? findMetaRobotsNoindex(body) : false);
  const hreflang = htmlLike ? readHreflangLinks(body, url) : [];
  const jsonLdTypes = htmlLike ? readJsonLdTypes(body) : [];

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
    redirect: location ? { location: new URL(location, url).toString() } : null,
    canonical: canonicalUrl,
    robots: { noindex: robotsNoindex },
    hreflang,
    jsonld_types: jsonLdTypes,
    passed: issues.length === 0,
    issues,
  };
}

function inspectDenySample(sample, options) {
  const url = toUrl(sample, options.siteUrl);
  const unsafe = getUnsafeLiveFetchIssue(url, { expectedHost: new URL(options.siteUrl).hostname });
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
  const samples = readJson(options.samples);
  const publicSamples = samples.public_samples || [];
  const denySamples = samples.deny_policy_samples || [];
  const publicResults = [];

  for (const sample of publicSamples) {
    publicResults.push(await inspectPublicSample(sample, options));
  }

  const denyResults = denySamples.map((sample) => inspectDenySample(sample, options));
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
