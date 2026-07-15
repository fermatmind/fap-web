#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { csvEscape } from "./artifactSafety.mjs";

const ALLOW_NETWORK = process.argv.includes("--allow-network");
const runArgument = process.argv.find((argument) => argument.startsWith("--run="));
const RUN = runArgument === "--run=1" ? 1 : runArgument === "--run=2" ? 2 : null;
if (!ALLOW_NETWORK || RUN === null) {
  console.error("HOLD_MBTI_52_INCOMPLETE: pass --allow-network and --run=1 or --run=2");
  process.exit(2);
}

const SITE_ORIGIN = "https://fermatmind.com";
const API_ORIGIN = "https://api.fermatmind.com/api/v0.5/personality";
const ARTIFACT_PATHS = Object.freeze({
  run1: new URL("../../docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14-run-1.json", import.meta.url),
  run2: new URL("../../docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14-run-2.json", import.meta.url),
  reportJson: new URL("../../docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14.json", import.meta.url),
  reportMarkdown: new URL("../../docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14.md", import.meta.url),
  reportCsv: new URL("../../docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14.csv", import.meta.url),
});
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENCY = 4;
const REQUEST_TIMEOUT_MS = 30_000;
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const SAFE_PUBLIC_ORDER_PATH_PATTERN = /^\/(?:en|zh)\/personality\/big-five\/facets\/order\/?$/i;
const GROUPS = {
  NT: ["intj", "intp", "entj", "entp"],
  NF: ["infj", "infp", "enfj", "enfp"],
  SJ: ["istj", "isfj", "estj", "esfj"],
  SP: ["istp", "isfp", "estp", "esfp"],
};
const HOT_CROSS_TYPE = ["intj-vs-intp", "entj-vs-intj", "infj-vs-infp", "istj-vs-isfj"];

function targets() {
  const profiles = Object.entries(GROUPS).flatMap(([group, types]) => types.flatMap((type) => (
    ["a", "t"].map((variant) => ({ group, kind: "profile", slug: `${type}-${variant}` }))
  )));
  const atComparisons = Object.entries(GROUPS).flatMap(([group, types]) => types.map((type) => ({
    group,
    kind: "at_comparison",
    slug: `${type}-a-vs-${type}-t`,
  })));
  const crossTypeComparisons = HOT_CROSS_TYPE.map((slug) => ({
    group: "hot_cross_type",
    kind: "cross_type_comparison",
    slug,
  }));
  return [...profiles, ...atComparisons, ...crossTypeComparisons];
}

function normalizeText(value) {
  const fragment = JSDOM.fragment(String(value ?? ""));
  fragment.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
  return String(fragment.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function visiblePageText(html) {
  return normalizeText(html);
}

function isTimeout(error) {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  return ["AbortError", "TimeoutError"].includes(name) || /timed?\s*out|timeout/i.test(message);
}

async function fetchBody(url, parseBody, timeoutMs = REQUEST_TIMEOUT_MS) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": "FermatMind MBTI INDEX-43 read-only release gate/1.0" },
      });
      if (!response.ok) {
        const error = new Error(`${url} returned HTTP ${response.status}`);
        if (response.status < 500 || attempt === MAX_ATTEMPTS) throw error;
        lastError = error;
      } else {
        return await parseBody(response);
      }
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 350));
  }
  throw lastError;
}

async function fetchText(url, timeoutMs) {
  return fetchBody(url, (response) => response.text(), timeoutMs);
}

async function fetchJson(url) {
  const body = await fetchBody(url, (response) => response.json());
  return body?.data ?? body;
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
      blocks.push(JSON.parse(match[1]));
    } catch {
      blocks.push({ __invalid_jsonld: true });
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
  let invalidBlockCount = 0;
  blocks.forEach((block) => walkJson(block, (node) => {
    if (node.__invalid_jsonld) invalidBlockCount += 1;
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
  return { types: [...types].sort(), faq, invalidBlockCount };
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

function apiAuthorityPresent(payload, kind) {
  if (kind === "profile") {
    return Boolean(
      payload?.profile?.is_public
      && payload?.profile?.is_indexable
      && payload?.answer_surface_v1?.summary_blocks?.length
      && payload?.answer_surface_v1?.faq_blocks?.length
      && payload?.sections?.length,
    );
  }
  return Boolean(
    payload?.comparison?.title
    && payload?.comparison?.description
    && payload?.comparison?.faq?.length
    && (payload?.comparison?.sections?.length || payload?.comparison?.comparison_blocks?.length),
  );
}

function feedUrls(body) {
  return new Set(body.match(/https:\/\/fermatmind\.com\/[a-z0-9/_-]+/gi) ?? []);
}

function jsonLdValid(kind, structured) {
  if (structured.invalidBlockCount > 0) return false;
  if (kind === "profile") {
    return structured.types.includes("FAQPage")
      && structured.types.includes("BreadcrumbList")
      && structured.types.some((type) => ["AboutPage", "WebPage"].includes(type));
  }
  return ["CollectionPage", "ItemList", "BreadcrumbList", "FAQPage"]
    .every((type) => structured.types.includes(type));
}

function stableEvidence(records, metrics, privateUrlLeaks) {
  return {
    metrics,
    private_url_leaks: [...privateUrlLeaks].sort(),
    records: records.map((record) => ({
      path: record.path,
      kind: record.kind,
      checks: record.checks,
      blockers: record.blockers,
      api_faq_count: record.api_faq_count ?? 0,
      schema_faq_count: record.schema_faq_count ?? 0,
      structured_data_types: record.structured_data_types ?? [],
    })),
  };
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

const targetList = targets();
if (targetList.length !== 52 || new Set(targetList.map(({ slug }) => slug)).size !== 52) {
  throw new Error("The INDEX-43 inventory must contain exactly 52 unique slugs");
}

const feedNames = ["sitemap.xml", "llms.txt", "llms-full.txt"];
const feeds = Object.fromEntries(await Promise.all(feedNames.map(async (name) => [
  name,
  await fetchText(`${SITE_ORIGIN}/${name}`, 60_000),
])));
const feedSets = Object.fromEntries(Object.entries(feeds).map(([name, body]) => [name, feedUrls(body)]));
const privateUrlLeaks = [...new Set(Object.values(feedSets).flatMap((urls) => [...urls]))]
  .filter((url) => {
    const pathname = new URL(url).pathname;
    return PRIVATE_PATH_PATTERN.test(pathname) && !SAFE_PUBLIC_ORDER_PATH_PATTERN.test(pathname);
  });

const records = new Array(targetList.length);
let cursor = 0;
async function worker() {
  while (cursor < targetList.length) {
    const index = cursor;
    cursor += 1;
    const target = targetList[index];
    const kind = target.kind === "profile" ? "profile" : "comparison";
    const canonical = `${SITE_ORIGIN}/zh/personality/${target.slug}`;
    const apiUrl = kind === "profile"
      ? `${API_ORIGIN}/${target.slug}?locale=zh-CN`
      : `${API_ORIGIN}/comparisons/${target.slug}?locale=zh-CN`;
    const startedAt = Date.now();
    try {
      const [payload, html] = await Promise.all([fetchJson(apiUrl), fetchText(canonical)]);
      const faq = apiFaq(payload, kind);
      const structured = inspectJsonLd(extractJsonLd(html));
      const visibleText = visiblePageText(html);
      const schemaFaq = new Map(structured.faq.map((row) => [row.question, row.answer]));
      const faqParity = faq.length > 0 && faq.every((row) => (
        schemaFaq.get(row.question) === row.answer
        && visibleText.includes(row.question)
        && visibleText.includes(row.answer)
      ));
      const robots = extractRobots(html);
      const checks = {
        cms_api: apiAuthorityPresent(payload, kind),
        http_200: true,
        canonical: extractCanonical(html) === canonical,
        robots: /(?:^|[\s,])index(?:[\s,]|$)/.test(robots)
          && /(?:^|[\s,])follow(?:[\s,]|$)/.test(robots)
          && !robots.includes("noindex"),
        jsonld: jsonLdValid(kind, structured),
        faq_parity: faqParity,
        sitemap: feedSets["sitemap.xml"].has(canonical),
        llms: feedSets["llms.txt"].has(canonical),
        llms_full: feedSets["llms-full.txt"].has(canonical),
        api_no_timeout: true,
      };
      records[index] = {
        group: target.group,
        kind: target.kind,
        slug: target.slug,
        path: `/zh/personality/${target.slug}`,
        canonical,
        api_url: apiUrl,
        latency_ms: Date.now() - startedAt,
        api_faq_count: faq.length,
        schema_faq_count: structured.faq.length,
        structured_data_types: structured.types,
        robots,
        checks,
        blockers: Object.entries(checks).filter(([, passed]) => !passed).map(([check]) => check),
      };
    } catch (error) {
      const timedOut = isTimeout(error);
      records[index] = {
        group: target.group,
        kind: target.kind,
        slug: target.slug,
        path: `/zh/personality/${target.slug}`,
        canonical,
        api_url: apiUrl,
        latency_ms: Date.now() - startedAt,
        checks: {
          cms_api: false,
          http_200: false,
          canonical: false,
          robots: false,
          jsonld: false,
          faq_parity: false,
          sitemap: feedSets["sitemap.xml"].has(canonical),
          llms: feedSets["llms.txt"].has(canonical),
          llms_full: feedSets["llms-full.txt"].has(canonical),
          api_no_timeout: !timedOut,
        },
        blockers: [timedOut ? "api_timeout" : "network_or_parse_failure"],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
await Promise.all(Array.from({ length: MAX_CONCURRENCY }, () => worker()));

const count = (key) => records.filter((record) => record.checks[key] === true).length;
const metrics = {
  CMS_API: count("cms_api"),
  HTTP_200: count("http_200"),
  CANONICAL: count("canonical"),
  ROBOTS: count("robots"),
  JSONLD: count("jsonld"),
  FAQ_PARITY: count("faq_parity"),
  SITEMAP: count("sitemap"),
  LLMS: count("llms"),
  LLMS_FULL: count("llms_full"),
  API_TIMEOUTS: records.filter((record) => record.checks.api_no_timeout === false).length,
};
const runPassed = Object.entries(metrics).every(([key, value]) => (
  key === "API_TIMEOUTS" ? value === 0 : value === 52
)) && privateUrlLeaks.length === 0;
const evidence = stableEvidence(records, metrics, privateUrlLeaks);
const evidenceSignature = sha256(evidence);
const runReport = {
  id: "MBTI-INDEX-43",
  artifact: `MBTI-INDEX-43-FULL-52-RELEASE-GATE-RUN-${RUN}`,
  generated_at: new Date().toISOString(),
  run: RUN,
  evidence_scope: "read_only_production_network_revalidation",
  run_decision: runPassed ? "PASS_MBTI_52_RUN" : "HOLD_MBTI_52_INCOMPLETE",
  evidence_signature: evidenceSignature,
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  private_url_leaks: privateUrlLeaks,
  records,
};
if (RUN === 1) {
  fs.writeFileSync(ARTIFACT_PATHS.run1, `${JSON.stringify(runReport, null, 2)}\n`);
} else {
  fs.writeFileSync(ARTIFACT_PATHS.run2, `${JSON.stringify(runReport, null, 2)}\n`);
}

let previousRun = null;
if (RUN === 2) {
  const previousPath = ARTIFACT_PATHS.run1;
  if (fs.existsSync(previousPath)) previousRun = JSON.parse(fs.readFileSync(previousPath, "utf8"));
}
const consecutivePass = Boolean(
  RUN === 2
  && runPassed
  && previousRun?.run_decision === "PASS_MBTI_52_RUN"
  && previousRun?.evidence_signature === evidenceSignature,
);
const finalDecision = consecutivePass
  ? "ALLOW_MBTI_52_COMPLETE"
  : (RUN === 1 && runPassed ? "PASS_MBTI_52_RUN_PENDING_SECOND" : "HOLD_MBTI_52_INCOMPLETE");
const finalReport = {
  id: "MBTI-INDEX-43",
  artifact: "MBTI-INDEX-43-FULL-52-RELEASE-GATE",
  generated_at: new Date().toISOString(),
  final_decision: finalDecision,
  gsc_dependency_unblocked: consecutivePass,
  required_consecutive_runs: 2,
  completed_consecutive_runs: consecutivePass ? 2 : (runPassed ? 1 : 0),
  run_1: previousRun ? {
    decision: previousRun.run_decision,
    evidence_signature: previousRun.evidence_signature,
    metrics: previousRun.metrics,
  } : (RUN === 1 ? {
    decision: runReport.run_decision,
    evidence_signature: evidenceSignature,
    metrics,
  } : null),
  run_2: RUN === 2 ? {
    decision: runReport.run_decision,
    evidence_signature: evidenceSignature,
    metrics,
  } : null,
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  records,
  safety_boundary: {
    read_only_network: true,
    cms_write_attempted: false,
    public_promotion_attempted: false,
    indexability_mutation_attempted: false,
    sitemap_llms_mutation_attempted: false,
    gsc_mutation_attempted: false,
    production_deploy_attempted: false,
    frontend_editorial_fallback_added: false,
  },
};

const metricLines = Object.entries(metrics).map(([key, value]) => (
  key === "API_TIMEOUTS" ? `${key}=${value}` : `${key}=${value}/52`
));
const markdown = [
  "# MBTI-INDEX-43 Full 52 URL Release Gate",
  "",
  `- Final decision: \`${finalDecision}\``,
  `- Consecutive runs complete: \`${finalReport.completed_consecutive_runs}/2\``,
  `- Private URL leaks: \`${privateUrlLeaks.length}\``,
  ...metricLines.map((line) => `- \`${line}\``),
  "",
  "This is read-only production evidence. It does not write CMS data, promote content, mutate discoverability, deploy, or submit to GSC.",
  "",
  "| Path | Kind | Result | Blockers | Latency ms |",
  "| --- | --- | --- | --- | ---: |",
  ...records.map((record) => `| ${record.path} | ${record.kind} | ${record.blockers.length ? "hold" : "pass"} | ${record.blockers.join(", ") || "none"} | ${record.latency_ms} |`),
  "",
].join("\n");
const csvHeaders = ["path", "kind", "group", "result", "cms_api", "http_200", "canonical", "robots", "jsonld", "faq_parity", "sitemap", "llms", "llms_full", "api_no_timeout", "latency_ms", "blockers"];
const csv = [
  csvHeaders.map(csvEscape).join(","),
  ...records.map((record) => csvHeaders.map((header) => csvEscape(
    header === "result"
      ? (record.blockers.length ? "hold" : "pass")
      : header === "blockers"
        ? record.blockers.join("|")
        : (record[header] ?? record.checks[header] ?? ""),
  )).join(",")),
].join("\n") + "\n";

fs.writeFileSync(ARTIFACT_PATHS.reportJson, `${JSON.stringify(finalReport, null, 2)}\n`);
fs.writeFileSync(ARTIFACT_PATHS.reportMarkdown, markdown);
fs.writeFileSync(ARTIFACT_PATHS.reportCsv, csv);

console.log(finalDecision);
metricLines.forEach((line) => console.log(line));
console.log(`PRIVATE_URL_LEAKS=${privateUrlLeaks.length}`);
if ((RUN === 1 && !runPassed) || (RUN === 2 && !consecutivePass)) process.exitCode = 1;
