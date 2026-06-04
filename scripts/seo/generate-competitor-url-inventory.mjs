#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = process.cwd();
const VERSION = "competitor_url_inventory_generator.v1";
const CONTRACT_VERSION = "competitor_url_inventory_tracker.v1";
const DEFAULT_CONFIG = "docs/seo/generated/competitor-url-inventory-tracker.v1.json";
const DEFAULT_MONTH = "offline-sample";
const PRIVATE_PATH_FRAGMENT_PATTERN =
  /(?:^|\/)(account|auth|checkout|order|orders|payment|pay|result|results|share|token|login|signup|admin)(?:\/|$)/i;
const TRACKING_PARAMS = [/^utm_/i, /^gclid$/i, /^fbclid$/i, /^msclkid$/i];
const SAFE_REMOTE_SITEMAP_PATH_PATTERN = /^\/[A-Za-z0-9._~!$&'()*+,;=:@/%-]*$/;
const REMOTE_SITEMAP_NAME_PATTERN = /(?:^|\/)[^/]*sitemap[^/]*(?:\.xml|\.xml\.gz|\.gz)?$/i;

function parseArgs(argv) {
  const args = {
    config: DEFAULT_CONFIG,
    sitemapMap: "",
    previous: "",
    output: "",
    csv: "",
    month: DEFAULT_MONTH,
    allowNetwork: false,
    pretty: false,
    maxUrlsPerCompetitor: 5000,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--allow-network") {
      args.allowNetwork = true;
    } else if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg.startsWith("--config=")) {
      args.config = arg.slice("--config=".length);
    } else if (arg === "--config") {
      args.config = argv[++index] || args.config;
    } else if (arg.startsWith("--sitemap-map=")) {
      args.sitemapMap = arg.slice("--sitemap-map=".length);
    } else if (arg === "--sitemap-map") {
      args.sitemapMap = argv[++index] || "";
    } else if (arg.startsWith("--previous=")) {
      args.previous = arg.slice("--previous=".length);
    } else if (arg === "--previous") {
      args.previous = argv[++index] || "";
    } else if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length);
    } else if (arg === "--output") {
      args.output = argv[++index] || "";
    } else if (arg.startsWith("--csv=")) {
      args.csv = arg.slice("--csv=".length);
    } else if (arg === "--csv") {
      args.csv = argv[++index] || "";
    } else if (arg.startsWith("--month=")) {
      args.month = arg.slice("--month=".length);
    } else if (arg === "--month") {
      args.month = argv[++index] || args.month;
    } else if (arg.startsWith("--max-urls-per-competitor=")) {
      args.maxUrlsPerCompetitor = Number(arg.slice("--max-urls-per-competitor=".length));
    } else if (arg === "--max-urls-per-competitor") {
      args.maxUrlsPerCompetitor = Number(argv[++index] || args.maxUrlsPerCompetitor);
    }
  }

  if (!Number.isFinite(args.maxUrlsPerCompetitor) || args.maxUrlsPerCompetitor <= 0) {
    throw new Error("--max-urls-per-competitor must be a positive number");
  }

  return args;
}

function resolvePath(value) {
  return path.resolve(ROOT, value);
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(resolvePath(filePath), "utf8"));
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function buildSafeRemoteSitemapRequest(source, domain) {
  const parsed = new URL(String(source || ""));
  const normalizedDomain = String(domain || "").toLowerCase();
  const hostname = parsed.hostname.toLowerCase();
  const allowedHosts = new Set([normalizedDomain, `www.${normalizedDomain}`]);

  if (parsed.protocol !== "https:") {
    throw new Error(`Remote sitemap source must use HTTPS: ${domain}`);
  }
  if (!allowedHosts.has(hostname)) {
    throw new Error(`Remote sitemap source host must match competitor domain: ${domain}`);
  }
  if (parsed.username || parsed.password || parsed.port || parsed.search || parsed.hash) {
    throw new Error(`Remote sitemap source must not include credentials, ports, queries, or fragments: ${domain}`);
  }
  if (!SAFE_REMOTE_SITEMAP_PATH_PATTERN.test(parsed.pathname) || !REMOTE_SITEMAP_NAME_PATTERN.test(parsed.pathname)) {
    throw new Error(`Remote sitemap source must be a safe sitemap path: ${domain}`);
  }

  const requestUrl = new URL(`https://${hostname}`);
  requestUrl.pathname = parsed.pathname;
  return requestUrl;
}

async function readSourceText(source, { allowNetwork, domain }) {
  if (isHttpUrl(source)) {
    if (!allowNetwork) {
      throw new Error(`Network sitemap source requires --allow-network: ${source}`);
    }
    const requestUrl = buildSafeRemoteSitemapRequest(source, domain);
    // lgtm[js/file-access-to-http] Network sources are disabled by default and rebuilt only after HTTPS host/path allowlist validation.
    const response = await fetch(requestUrl, {
      headers: {
        Accept: "application/xml,text/xml,text/plain,application/x-gzip",
        "User-Agent": "FermatMind-SEO-Competitor-Inventory-ReadOnly/1.0",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${requestUrl.hostname}${requestUrl.pathname}: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (/\.gz$/i.test(requestUrl.pathname)) {
      return zlib.gunzipSync(buffer).toString("utf8");
    }
    return buffer.toString("utf8");
  }

  const fullPath = resolvePath(source);
  const buffer = fs.readFileSync(fullPath);
  if (/\.gz$/i.test(fullPath)) {
    return zlib.gunzipSync(buffer).toString("utf8");
  }
  return buffer.toString("utf8");
}

function readXmlLocs(xml) {
  return [...String(xml || "").matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim());
}

function normalizeUrl(value, domain) {
  const url = new URL(String(value || ""), `https://${domain}`);
  url.protocol = "https:";
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.some((pattern) => pattern.test(key))) {
      url.searchParams.delete(key);
    }
  }
  url.search = "";

  const normalized = url.toString();
  return normalized.endsWith("/") && url.pathname !== "/" ? normalized.slice(0, -1) : normalized;
}

function directoryForPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  return `/${parts[0]}`;
}

function pathIncludesAny(pathname, patterns = []) {
  const lowerPath = pathname.toLowerCase();
  return patterns.some((pattern) => {
    const normalizedPattern = String(pattern || "").toLowerCase();
    if (!normalizedPattern || normalizedPattern === "unmatched") return false;
    return lowerPath.includes(normalizedPattern);
  });
}

function classifyFamily(pathname, taxonomy) {
  const priority = ["test_detail", "career_job", "career_guide", "article", "topic", "tool", "support"];
  for (const family of priority) {
    if (pathIncludesAny(pathname, taxonomy[family]?.common_url_patterns || [])) {
      return {
        url_family: family,
        url_family_confidence: "medium",
        classification_reason: `matched ${family} URL pattern`,
      };
    }
  }

  return {
    url_family: "unknown",
    url_family_confidence: "low",
    classification_reason: "no URL pattern matched",
  };
}

function detectLocale(parsedUrl) {
  const pathnameMatch = parsedUrl.pathname.match(/^\/(en|zh)(?:\/|$)/i);
  if (pathnameMatch) {
    return { locale: pathnameMatch[1].toLowerCase(), locale_detection_method: "path" };
  }
  const hostMatch = parsedUrl.hostname.match(/^(en|zh)\./i);
  if (hostMatch) {
    return { locale: hostMatch[1].toLowerCase(), locale_detection_method: "subdomain" };
  }
  return { locale: "unknown", locale_detection_method: "unknown" };
}

function opportunityTypeForFamily(family) {
  const map = {
    test_detail: "missing_test_family",
    career_job: "missing_career_cluster",
    career_guide: "missing_career_cluster",
    article: "missing_article_topic",
    topic: "missing_article_topic",
    support: "missing_support_page",
    tool: "unknown",
    unknown: "unknown",
  };
  return map[family] || "unknown";
}

function targetRouteFamilyForFamily(family) {
  const map = {
    test_detail: "test_detail",
    career_job: "career_job_detail",
    career_guide: "career_guide_detail",
    article: "article_detail",
    topic: "topic_detail",
    support: "help_detail",
    tool: "tool",
    unknown: "unknown",
  };
  return map[family] || "unknown";
}

function recordFromUrl({ rawUrl, domain, taxonomy, source, month, sampleOnly = false }) {
  const normalizedUrl = normalizeUrl(rawUrl, domain);
  const parsed = new URL(normalizedUrl);
  if (parsed.hostname !== domain && !parsed.hostname.endsWith(`.${domain}`)) {
    return null;
  }

  const family = classifyFamily(parsed.pathname, taxonomy);
  const locale = detectLocale(parsed);
  const privateTarget = PRIVATE_PATH_FRAGMENT_PATTERN.test(parsed.pathname);

  return {
    sample_only: sampleOnly,
    competitor_domain: domain,
    raw_url: rawUrl,
    normalized_url: normalizedUrl,
    url_family: family.url_family,
    url_family_confidence: family.url_family_confidence,
    classification_reason: family.classification_reason,
    locale: locale.locale,
    locale_detection_method: locale.locale_detection_method,
    directory: directoryForPath(parsed.pathname),
    canonical_observed: "unknown",
    canonical_url: null,
    hreflang_observed: "unknown",
    hreflang_targets: [],
    sitemap_source: source,
    first_seen_month: month === DEFAULT_MONTH ? null : month,
    last_seen_month: month === DEFAULT_MONTH ? null : month,
    status: privateTarget ? "excluded_private_target" : sampleOnly ? "sample_only" : "observed",
    eligible_for_opportunity: !privateTarget,
    opportunity_type: privateTarget ? "unknown" : opportunityTypeForFamily(family.url_family),
    target_route_family: privateTarget ? "excluded" : targetRouteFamilyForFamily(family.url_family),
    notes: sampleOnly ? "Schema sample only; not a real crawl result." : "",
  };
}

async function recordsFromSitemapSource({ source, domain, taxonomy, month, allowNetwork, maxUrlsPerCompetitor }) {
  const xml = await readSourceText(source, { allowNetwork, domain });
  const locs = readXmlLocs(xml).slice(0, maxUrlsPerCompetitor);
  const records = [];

  for (const loc of locs) {
    const record = recordFromUrl({
      rawUrl: loc,
      domain,
      taxonomy,
      source,
      month,
    });
    if (record) records.push(record);
  }

  return records;
}

function recordsFromContractSample(config) {
  return (config.records_sample || []).map((record) => ({
    ...record,
    sample_only: true,
    status: "sample_only",
    eligible_for_opportunity: record.eligible_for_opportunity ?? true,
    source_mode: "contract_sample",
  }));
}

function normalizeSitemapMap(rawMap) {
  if (!rawMap) return {};
  if (Array.isArray(rawMap)) {
    return Object.fromEntries(rawMap.map((entry) => [entry.domain, entry.sitemap || entry.source]));
  }
  return rawMap;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function compareMonthlyDiff(currentRecords, previousRecords) {
  const currentByKey = new Map(currentRecords.map((record) => [`${record.competitor_domain} ${record.normalized_url}`, record]));
  const previousByKey = new Map(previousRecords.map((record) => [`${record.competitor_domain} ${record.normalized_url}`, record]));
  const added = [];
  const removed = [];
  const persisted = [];
  const reclassified = [];

  for (const [key, current] of currentByKey) {
    const previous = previousByKey.get(key);
    if (!previous) {
      added.push(key);
    } else {
      persisted.push(key);
      if (previous.url_family !== current.url_family) {
        reclassified.push({
          key,
          old_url_family: previous.url_family,
          new_url_family: current.url_family,
          reason: current.classification_reason,
        });
      }
    }
  }

  for (const key of previousByKey.keys()) {
    if (!currentByKey.has(key)) removed.push(key);
  }

  return {
    added_urls: added.sort(),
    removed_urls: removed.sort(),
    persisted_urls: persisted.sort(),
    reclassified_urls: reclassified,
    directory_delta: countBy(currentRecords, "directory"),
    family_delta: countBy(currentRecords, "url_family"),
    locale_delta: countBy(currentRecords, "locale"),
    new_topic_clusters: [],
    dropped_topic_clusters: [],
  };
}

function riskBoundary() {
  return {
    read_only: true,
    cms_writes: false,
    cms_draft_creation: false,
    publish_actions: false,
    search_submission: false,
    sitemap_mutation: false,
    llms_mutation: false,
    auto_content_generation: false,
    gsc_integration: false,
    baidu_integration: false,
    ga4_integration: false,
    dataforseo_integration: false,
    apify_integration: false,
    production_deploy: false,
  };
}

function toCsvValue(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(records) {
  const headers = [
    "competitor_domain",
    "raw_url",
    "normalized_url",
    "url_family",
    "url_family_confidence",
    "locale",
    "locale_detection_method",
    "directory",
    "canonical_observed",
    "canonical_url",
    "hreflang_observed",
    "sitemap_source",
    "first_seen_month",
    "last_seen_month",
    "status",
    "eligible_for_opportunity",
    "opportunity_type",
    "target_route_family",
    "notes",
  ];

  return [headers.join(","), ...records.map((record) => headers.map((header) => toCsvValue(record[header])).join(","))].join(
    "\n"
  );
}

async function buildInventory(args) {
  const config = readJsonFile(args.config);
  if (config.version !== CONTRACT_VERSION) {
    throw new Error(`Unsupported contract version: ${config.version}`);
  }

  const sitemapMap = args.sitemapMap ? normalizeSitemapMap(readJsonFile(args.sitemapMap)) : {};
  const records = [];
  const competitors = [];
  let networkSourcesUsed = false;

  if (Object.keys(sitemapMap).length === 0) {
    records.push(...recordsFromContractSample(config));
  } else {
    for (const competitor of config.competitors || []) {
      const source = sitemapMap[competitor.domain];
      if (!source) {
        competitors.push({
          domain: competitor.domain,
          status: "unavailable",
          source: null,
          records: 0,
          reason: "no sitemap source configured",
        });
        continue;
      }
      if (isHttpUrl(source)) networkSourcesUsed = true;
      const competitorRecords = await recordsFromSitemapSource({
        source,
        domain: competitor.domain,
        taxonomy: config.taxonomy || {},
        month: args.month,
        allowNetwork: args.allowNetwork,
        maxUrlsPerCompetitor: args.maxUrlsPerCompetitor,
      });
      records.push(...competitorRecords);
      competitors.push({
        domain: competitor.domain,
        status: "observed",
        source,
        records: competitorRecords.length,
      });
    }
  }

  const previousRecords = args.previous ? readJsonFile(args.previous).records || [] : [];
  const runMode = Object.keys(sitemapMap).length === 0 ? "offline_sample" : networkSourcesUsed ? "read_only_network" : "offline_local_sitemap";
  const monthlyDiff = compareMonthlyDiff(records, previousRecords);

  return {
    version: VERSION,
    contract_version: config.version,
    scope: "SEO-COMPETITOR-URL-01",
    generated_at: args.allowNetwork ? new Date().toISOString() : "offline-reproducible",
    run_mode: runMode,
    month: args.month,
    read_only: true,
    live_data_collected: networkSourcesUsed,
    network_access_enabled: args.allowNetwork,
    source: {
      config: args.config,
      sitemap_map: args.sitemapMap || null,
      previous: args.previous || null,
    },
    competitors:
      competitors.length > 0
        ? competitors
        : (config.competitors || []).map((competitor) => ({
            domain: competitor.domain,
            status: "sample_only",
            source: "contract_sample",
            records: records.filter((record) => record.competitor_domain === competitor.domain).length,
          })),
    summary: {
      total_competitors: (config.competitors || []).length,
      total_records: records.length,
      records_by_family: countBy(records, "url_family"),
      records_by_locale: countBy(records, "locale"),
      records_by_status: countBy(records, "status"),
      eligible_opportunity_records: records.filter((record) => record.eligible_for_opportunity).length,
      excluded_private_records: records.filter((record) => record.status === "excluded_private_target").length,
    },
    monthly_diff: monthlyDiff,
    records,
    risk_boundary: riskBoundary(),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inventory = await buildInventory(args);
  const json = JSON.stringify(inventory, null, args.pretty ? 2 : 0);

  if (args.output) {
    fs.mkdirSync(path.dirname(resolvePath(args.output)), { recursive: true });
    fs.writeFileSync(resolvePath(args.output), `${json}\n`);
  }
  if (args.csv) {
    fs.mkdirSync(path.dirname(resolvePath(args.csv)), { recursive: true });
    fs.writeFileSync(resolvePath(args.csv), `${buildCsv(inventory.records)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

main().catch((error) => {
  console.error(`[competitor-url-inventory] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
