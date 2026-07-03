#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { csvEscape, resolveOutputPath, resolveRepoPath } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DEFAULT_SITE_URL = "https://fermatmind.com";
const DEFAULT_SITEMAP_PATH = "tests/contracts/fixtures/seo/public-sitemap-snapshot.xml";
const VERSION = "url_truth.inventory.v1";

const ROUTE_FAMILY_POLICIES = {
  home: { llms: "allow", evidence: "not_required", exposure: "public_indexable" },
  tests_hub: { llms: "not_exposed", evidence: "not_required", exposure: "public_indexable_hub" },
  test_category: { llms: "not_exposed", evidence: "not_required", exposure: "public_indexable_hub" },
  test_detail: { llms: "allow", evidence: "partial", exposure: "public_indexable" },
  topics_hub: { llms: "allow", evidence: "not_required", exposure: "public_indexable_hub" },
  topic_detail: { llms: "allow", evidence: "partial", exposure: "public_indexable" },
  personality_hub: { llms: "allow", evidence: "not_required", exposure: "public_indexable_hub" },
  personality_detail: { llms: "allow", evidence: "partial", exposure: "public_indexable" },
  articles_hub: { llms: "not_exposed", evidence: "not_required", exposure: "public_indexable_hub" },
  article_detail: { llms: "allow", evidence: "partial", exposure: "public_indexable" },
  help_detail: { llms: "conditional", evidence: "not_required", exposure: "public_indexable_static" },
  static_legal_help: { llms: "not_exposed", evidence: "not_required", exposure: "public_indexable_static" },
  career_hub: { llms: "conditional", evidence: "not_required", exposure: "public_indexable_hub" },
  career_industry_detail: { llms: "allow", evidence: "not_required", exposure: "public_indexable" },
  career_family: { llms: "allow", evidence: "partial", exposure: "public_indexable_backend_gated" },
  career_guides_hub: { llms: "conditional", evidence: "not_required", exposure: "public_indexable_hub" },
  career_guide_detail: { llms: "conditional", evidence: "partial", exposure: "public_indexable" },
  career_job_detail: { llms: "conditional", evidence: "not_ready", exposure: "public_indexable_backend_gated" },
  career_recommendation_detail: { llms: "conditional", evidence: "partial", exposure: "public_indexable_backend_gated" },
  dataset: { llms: "not_exposed", evidence: "ready", exposure: "public_indexable_dataset" },
  machine_readable_pointer: { llms: "allow", evidence: "not_required", exposure: "machine_readable" },
  other_public: { llms: "conditional", evidence: "unknown", exposure: "public_indexable_unknown_family" },
};

const JSON_LD_FAMILY_EXPECTATIONS = {
  home: ["WebPage", "Organization", "ItemList"],
  tests_hub: ["CollectionPage", "ItemList", "BreadcrumbList"],
  test_category: ["CollectionPage", "ItemList", "BreadcrumbList"],
  test_detail: ["WebPage", "BreadcrumbList", "FAQPage"],
  topics_hub: ["WebPage", "BreadcrumbList"],
  topic_detail: ["CollectionPage", "WebPage", "BreadcrumbList"],
  personality_hub: ["WebPage", "ItemList", "BreadcrumbList"],
  personality_detail: ["AboutPage", "DefinedTerm", "WebPage", "BreadcrumbList"],
  article_detail: ["Article", "BreadcrumbList"],
  articles_hub: ["CollectionPage", "BreadcrumbList"],
  help_detail: ["WebPage", "BreadcrumbList"],
  static_legal_help: ["WebPage", "BreadcrumbList"],
  career_hub: ["WebPage", "BreadcrumbList"],
  career_industry_detail: [],
  career_family: ["CollectionPage", "ItemList", "BreadcrumbList"],
  career_guides_hub: [],
  career_guide_detail: ["Article", "BreadcrumbList"],
  career_job_detail: ["Occupation", "BreadcrumbList"],
  career_recommendation_detail: ["WebPage", "BreadcrumbList", "ItemList"],
  dataset: ["Dataset", "BreadcrumbList"],
};

function parseArgs(argv) {
  const args = {
    siteUrl: DEFAULT_SITE_URL,
    sitemap: DEFAULT_SITEMAP_PATH,
    output: "",
    csv: "",
    live: false,
    pretty: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--live") {
      args.live = true;
    } else if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg.startsWith("--site-url=")) {
      args.siteUrl = arg.slice("--site-url=".length);
    } else if (arg === "--site-url") {
      args.siteUrl = argv[++index] || args.siteUrl;
    } else if (arg.startsWith("--sitemap=")) {
      args.sitemap = arg.slice("--sitemap=".length);
    } else if (arg === "--sitemap") {
      args.sitemap = argv[++index] || args.sitemap;
    } else if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length);
    } else if (arg === "--output") {
      args.output = argv[++index] || "";
    } else if (arg.startsWith("--csv=")) {
      args.csv = arg.slice("--csv=".length);
    } else if (arg === "--csv") {
      args.csv = argv[++index] || "";
    }
  }

  return args;
}

function normalizeUrl(value, siteUrl = DEFAULT_SITE_URL) {
  const url = new URL(String(value || "/"), siteUrl);
  url.hash = "";
  url.search = "";
  const normalized = url.toString();
  return normalized.endsWith("/") && url.pathname !== "/" ? normalized.slice(0, -1) : normalized;
}

function routeFamilyForPath(pathname) {
  if (pathname === "/sitemap.xml") return "machine_readable_pointer";
  if (/^\/(en|zh)\/tests\/category\/[^/]+$/i.test(pathname)) return "test_category";
  if (/^\/(en|zh)\/tests\/[^/]+$/i.test(pathname)) return "test_detail";
  if (/^\/(en|zh)\/tests$/i.test(pathname)) return "tests_hub";
  if (/^\/(en|zh)\/topics\/[^/]+$/i.test(pathname)) return "topic_detail";
  if (/^\/(en|zh)\/topics$/i.test(pathname)) return "topics_hub";
  if (/^\/(en|zh)\/personality\/[a-z]{4}-[at]$/i.test(pathname)) return "personality_detail";
  if (/^\/(en|zh)\/personality$/i.test(pathname)) return "personality_hub";
  if (/^\/(en|zh)\/career\/jobs\/[^/]+$/i.test(pathname)) return "career_job_detail";
  if (/^\/(en|zh)\/career\/family\/[^/]+$/i.test(pathname)) return "career_family";
  if (/^\/(en|zh)\/career\/guides\/[^/]+$/i.test(pathname)) return "career_guide_detail";
  if (/^\/(en|zh)\/career\/guides$/i.test(pathname)) return "career_guides_hub";
  if (/^\/(en|zh)\/career\/industries\/[^/]+$/i.test(pathname)) return "career_industry_detail";
  if (/^\/(en|zh)\/career\/recommendations\/mbti\/[^/]+$/i.test(pathname)) return "career_recommendation_detail";
  if (/^\/(en|zh)\/career(\/|$)/i.test(pathname)) return "career_hub";
  if (/^\/(en|zh)\/articles\/[^/]+$/i.test(pathname) || /^\/(en|zh)\/blog\/[^/]+$/i.test(pathname)) return "article_detail";
  if (/^\/(en|zh)\/articles$/i.test(pathname)) return "articles_hub";
  if (/^\/(en|zh)\/help\/[^/]+$/i.test(pathname)) return "help_detail";
  if (/^\/(en|zh)\/datasets(\/|$)/i.test(pathname)) return "dataset";
  if (/^\/(en|zh)\/(privacy|terms|support|about|brand|business|careers|charter|foundation|policies)$/i.test(pathname)) {
    return "static_legal_help";
  }
  if (pathname === "/" || pathname === "/en" || pathname === "/zh") return "home";
  return "other_public";
}

function localeForPath(pathname) {
  const match = pathname.match(/^\/(en|zh)(?:\/|$)/i);
  if (match) return match[1].toLowerCase();
  return pathname === "/en" ? "en" : "zh";
}

function readXmlLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim());
}

function readLocalOrUrl(value) {
  if (/^https?:\/\//i.test(value)) {
    return fetch(value).then(async (response) => {
      if (!response.ok) throw new Error(`Failed to fetch ${value}: ${response.status}`);
      return response.text();
    });
  }

  return Promise.resolve(fs.readFileSync(resolveRepoPath(ROOT, value, "sitemap path"), "utf8"));
}

function extractUrlsFromText(value) {
  return [...String(value || "").matchAll(/https?:\/\/[^\s<>'"`]+/g)].map((match) =>
    normalizeUrl(match[0].replace(/[),.;]+$/, ""))
  );
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function toCsvValue(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return csvEscape(text);
}

function buildCsv(rows) {
  const headers = [
    "url",
    "path",
    "locale",
    "routeFamily",
    "inSitemap",
    "inLlms",
    "inLlmsFull",
    "expectedLlmsState",
    "exposureClassification",
    "canonicalState",
    "robotsIndexState",
    "hreflangState",
    "jsonLdFamily",
    "evidenceContainerReadiness",
  ];

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(",")),
  ].join("\n");
}

async function getLiveSet(url) {
  const response = await fetch(url, { headers: { Accept: "text/plain,application/xml,text/xml" } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return extractUrlsFromText(await response.text());
}

function buildRows({ sitemapUrls, llmsUrls, llmsFullUrls, siteUrl }) {
  const llmsSet = new Set(llmsUrls);
  const llmsFullSet = new Set(llmsFullUrls);

  return sitemapUrls.map((rawUrl) => {
    const url = normalizeUrl(rawUrl, siteUrl);
    const parsed = new URL(url);
    const routeFamily = routeFamilyForPath(parsed.pathname);
    const policy = ROUTE_FAMILY_POLICIES[routeFamily] || ROUTE_FAMILY_POLICIES.other_public;

    return {
      url,
      path: parsed.pathname,
      locale: localeForPath(parsed.pathname),
      routeFamily,
      inSitemap: true,
      inLlms: llmsSet.size > 0 ? llmsSet.has(url) : null,
      inLlmsFull: llmsFullSet.size > 0 ? llmsFullSet.has(url) : null,
      expectedLlmsState: policy.llms,
      exposureClassification: policy.exposure,
      canonicalState: "not_checked",
      robotsIndexState: "not_checked",
      hreflangState: "not_checked",
      jsonLdFamily: JSON_LD_FAMILY_EXPECTATIONS[routeFamily] || [],
      evidenceContainerReadiness: policy.evidence,
    };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sitemapXml = await readLocalOrUrl(args.sitemap);
  const sitemapUrls = readXmlLocs(sitemapXml);
  const liveLlmsUrls = args.live ? await getLiveSet(`${args.siteUrl.replace(/\/$/, "")}/llms.txt`) : [];
  const liveLlmsFullUrls = args.live ? await getLiveSet(`${args.siteUrl.replace(/\/$/, "")}/llms-full.txt`) : [];
  const rows = buildRows({
    sitemapUrls,
    llmsUrls: liveLlmsUrls,
    llmsFullUrls: liveLlmsFullUrls,
    siteUrl: args.siteUrl,
  });

  const inventory = {
    version: VERSION,
    generatedAt: args.live ? new Date().toISOString() : "offline-reproducible",
    mode: args.live ? "live" : "offline",
    source: {
      siteUrl: args.siteUrl,
      sitemap: args.sitemap,
      llms: args.live ? `${args.siteUrl.replace(/\/$/, "")}/llms.txt` : null,
      llmsFull: args.live ? `${args.siteUrl.replace(/\/$/, "")}/llms-full.txt` : null,
    },
    summary: {
      totalUrls: rows.length,
      routeFamilyCounts: countBy(rows, "routeFamily"),
      exposureCounts: countBy(rows, "exposureClassification"),
      expectedLlmsStateCounts: countBy(rows, "expectedLlmsState"),
      liveLlmsUrls: liveLlmsUrls.length ? new Set(liveLlmsUrls).size : null,
      liveLlmsFullUrls: liveLlmsFullUrls.length ? new Set(liveLlmsFullUrls).size : null,
    },
    rows,
  };

  const json = JSON.stringify(inventory, null, args.pretty ? 2 : 0);
  if (args.output) {
    const outputPath = resolveOutputPath(ROOT, args.output, "output path");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${json}\n`);
  }
  if (args.csv) {
    const csvPath = resolveOutputPath(ROOT, args.csv, "CSV output path");
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, `${buildCsv(rows)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

main().catch((error) => {
  console.error(`[url-inventory] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
