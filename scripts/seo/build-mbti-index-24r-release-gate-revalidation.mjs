#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ALLOW_NETWORK = process.argv.includes("--allow-network");
if (!ALLOW_NETWORK) {
  console.error("HOLD_NO_URL_EXPANSION: pass --allow-network for read-only production verification");
  process.exit(2);
}

const SITE_ORIGIN = "https://fermatmind.com";
const API_ORIGIN = "https://api.fermatmind.com/api";
const OUTPUT_BASE = "docs/seo/personality/mbti-index-24r-release-gate-revalidation-2026-07-12";
const PROFILE_SLUGS = ["istj-a", "istp-a", "isfp-a", "esfj-a"];
const COMPARISON_SLUGS = [
  "intp-a-vs-intp-t",
  "intj-vs-intp",
  "entj-vs-intj",
  "infj-vs-infp",
  "istj-vs-isfj",
];
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const SAFE_PUBLIC_ORDER_PATH_PATTERN = /^\/(?:en|zh)\/personality\/big-five\/facets\/order\/?$/i;
const MAX_READ_ATTEMPTS = 3;
const HTML_ENTITIES = {
  "&amp;": "&",
  "&apos;": "'",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#34;": '"',
  "&#39;": "'",
  "&#160;": " ",
};

function normalizeText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|apos|nbsp|quot|#34|#39|#160);/g, (entity) => HTML_ENTITIES[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url, timeoutMs = 30_000) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_READ_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: "follow" });
      if (response.ok) return response.text();
      const error = new Error(`${url} returned HTTP ${response.status}`);
      if (response.status < 500 || attempt === MAX_READ_ATTEMPTS) throw error;
      lastError = error;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_READ_ATTEMPTS) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 250));
  }
  throw lastError;
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function extractCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/\brel=["'][^"']*canonical[^"']*["']/i.test(tag)) continue;
    return tag.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
  }
  return "";
}

function extractRobots(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/\bname=["']robots["']/i.test(tag)) continue;
    return (tag.match(/\bcontent=["']([^"']+)["']/i)?.[1] ?? "").toLowerCase();
  }
  return "";
}

function extractJsonLd(html) {
  const blocks = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      const parsed = JSON.parse(match[1]);
      blocks.push(parsed);
    } catch {
      // Invalid structured data is recorded by the empty/partial type checks below.
    }
  }
  return blocks;
}

function walkJson(value, visit) {
  if (!value || typeof value !== "object") return;
  visit(value);
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) child.forEach((item) => walkJson(item, visit));
    else walkJson(child, visit);
  }
}

function inspectJsonLd(blocks) {
  const types = new Set();
  const faq = [];
  blocks.forEach((block) => walkJson(block, (node) => {
    const nodeTypes = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    nodeTypes.filter(Boolean).forEach((type) => types.add(String(type)));
    if (node["@type"] !== "FAQPage" || !Array.isArray(node.mainEntity)) return;
    for (const question of node.mainEntity) {
      faq.push({
        question: normalizeText(question?.name),
        answer: normalizeText(question?.acceptedAnswer?.text),
      });
    }
  }));
  return { types: [...types].sort(), faq };
}

function apiFaq(payload, kind) {
  const rows = kind === "profile"
    ? payload?.answer_surface_v1?.faq_blocks
    : payload?.comparison?.faq;
  return Array.isArray(rows)
    ? rows.map((row) => ({ question: normalizeText(row?.question), answer: normalizeText(row?.answer) }))
      .filter((row) => row.question && row.answer)
    : [];
}

function apiContentComplete(payload, kind) {
  if (kind === "profile") {
    return Boolean(
      payload?.profile?.is_public
      && payload?.profile?.is_indexable
      && payload?.answer_surface_v1?.summary_blocks?.length
      && payload?.answer_surface_v1?.faq_blocks?.length
      && payload?.sections?.length
      && payload?.internal_links?.length,
    );
  }
  return Boolean(
    payload?.comparison?.title
    && payload?.comparison?.description
    && payload?.comparison?.faq?.length
    && payload?.comparison?.sections?.length
    && payload?.comparison?.internal_links?.length,
  );
}

function feedUrls(body) {
  return new Set(body.match(/https:\/\/fermatmind\.com\/[^\s<)\]"']+/g) ?? []);
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const feeds = Object.fromEntries(await Promise.all(
  ["sitemap.xml", "llms.txt", "llms-full.txt"].map(async (name) => [name, await fetchText(`${SITE_ORIGIN}/${name}`)]),
));
const feedSets = Object.fromEntries(Object.entries(feeds).map(([name, body]) => [name, feedUrls(body)]));
const leakedPrivateUrls = [...new Set(Object.values(feedSets).flatMap((urls) => [...urls]))]
  .filter((url) => {
    const pathname = new URL(url).pathname;
    return PRIVATE_PATH_PATTERN.test(pathname) && !SAFE_PUBLIC_ORDER_PATH_PATTERN.test(pathname);
  });

const targets = [
  ...PROFILE_SLUGS.map((slug) => ({ slug, kind: "profile" })),
  ...COMPARISON_SLUGS.map((slug) => ({ slug, kind: "comparison" })),
];

const records = await Promise.all(targets.map(async ({ slug, kind }) => {
  const canonical = `${SITE_ORIGIN}/zh/personality/${slug}`;
  const apiUrl = kind === "profile"
    ? `${API_ORIGIN}/v0.5/personality/${slug}?locale=zh-CN`
    : `${API_ORIGIN}/v0.5/personality/comparisons/${slug}?locale=zh-CN`;
  try {
    const [rawPayload, html] = await Promise.all([fetchJson(apiUrl), fetchText(canonical)]);
    const payload = rawPayload?.data ?? rawPayload;
    const faq = apiFaq(payload, kind);
    const structured = inspectJsonLd(extractJsonLd(html));
    const pageText = normalizeText(html);
    const schemaFaq = new Map(structured.faq.map((row) => [row.question, row.answer]));
    const faqParity = faq.length > 0 && faq.every((row) => (
      schemaFaq.get(row.question) === row.answer
      && pageText.includes(row.question)
      && pageText.includes(row.answer)
    ));
    const robots = extractRobots(html);
    const jsonLdValid = kind === "profile"
      ? structured.types.includes("FAQPage") && structured.types.some((type) => ["AboutPage", "WebPage"].includes(type))
      : ["CollectionPage", "ItemList", "BreadcrumbList", "FAQPage"].every((type) => structured.types.includes(type));
    const checks = {
      cms_api: apiContentComplete(payload, kind),
      http_200: true,
      canonical: extractCanonical(html) === canonical,
      robots: robots.includes("index") && robots.includes("follow") && !robots.includes("noindex"),
      jsonld: jsonLdValid,
      faq_parity: faqParity,
      sitemap: feedSets["sitemap.xml"].has(canonical),
      llms: feedSets["llms.txt"].has(canonical),
      llms_full: feedSets["llms-full.txt"].has(canonical),
    };
    return {
      path: `/zh/personality/${slug}`,
      canonical,
      kind,
      api_url: apiUrl,
      api_faq_count: faq.length,
      schema_faq_count: structured.faq.length,
      structured_data_types: structured.types,
      robots,
      checks,
      result: Object.values(checks).every(Boolean) ? "pass" : "hold",
      blockers: Object.entries(checks).filter(([, passed]) => !passed).map(([check]) => check),
    };
  } catch (error) {
    return {
      path: `/zh/personality/${slug}`,
      canonical,
      kind,
      api_url: apiUrl,
      checks: {},
      result: "hold",
      blockers: ["network_or_parse_failure"],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}));

const count = (key) => records.filter((record) => record.checks?.[key] === true).length;
const metrics = {
  CMS_API: count("cms_api"),
  CANONICAL: count("canonical"),
  ROBOTS: count("robots"),
  JSONLD: count("jsonld"),
  FAQ_PARITY: count("faq_parity"),
  SITEMAP: count("sitemap"),
  LLMS: count("llms"),
  LLMS_FULL: count("llms_full"),
};
const allow = Object.values(metrics).every((value) => value === 9) && leakedPrivateUrls.length === 0;
const decision = allow ? "ALLOW_URL_EXPANSION" : "HOLD_NO_URL_EXPANSION";
const report = {
  id: "MBTI-INDEX-24R",
  artifact: "MBTI-INDEX-24R-RELEASE-GATE-REVALIDATION",
  generated_at: new Date().toISOString(),
  evidence_scope: "read_only_production_network_revalidation",
  decision,
  expansion_allowed: allow,
  gsc_dependency_unblocked: allow,
  metrics,
  private_url_leak_count: leakedPrivateUrls.length,
  private_url_leaks: leakedPrivateUrls,
  records,
  safety_boundary: {
    read_only_network: true,
    cms_write_attempted: false,
    indexability_mutation_attempted: false,
    sitemap_runtime_mutation_attempted: false,
    llms_runtime_mutation_attempted: false,
    gsc_submission_attempted: false,
    production_deploy_attempted: false,
  },
};

const metricLines = Object.entries(metrics).map(([key, value]) => `${key}=${value}/9`);
const md = [
  "# MBTI-INDEX-24R Release Gate Revalidation",
  "",
  `- Decision: \`${decision}\``,
  `- Private URL leaks: \`${leakedPrivateUrls.length}\``,
  ...metricLines.map((line) => `- \`${line}\``),
  "",
  "This artifact is a read-only production revalidation. It does not write CMS data, change indexability, deploy, or submit anything to GSC.",
  "",
  "| Path | Kind | Result | Blockers |",
  "| --- | --- | --- | --- |",
  ...records.map((record) => `| ${record.path} | ${record.kind} | ${record.result} | ${record.blockers.join(", ") || "none"} |`),
  "",
].join("\n");
const csvHeaders = ["path", "kind", "result", "cms_api", "canonical", "robots", "jsonld", "faq_parity", "sitemap", "llms", "llms_full", "blockers"];
const csv = [
  csvHeaders.join(","),
  ...records.map((record) => csvHeaders.map((header) => csvEscape(
    header === "blockers" ? record.blockers : (record[header] ?? record.checks?.[header] ?? ""),
  )).join(",")),
].join("\n") + "\n";

fs.mkdirSync(path.dirname(OUTPUT_BASE), { recursive: true });
fs.writeFileSync(`${OUTPUT_BASE}.json`, JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(`${OUTPUT_BASE}.md`, md);
fs.writeFileSync(`${OUTPUT_BASE}.csv`, csv);

console.log(decision);
metricLines.forEach((line) => console.log(line));
console.log(`PRIVATE_URL_LEAKS=${leakedPrivateUrls.length}`);
if (!allow) process.exitCode = 1;
