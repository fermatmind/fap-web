#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const SITE_ORIGIN = "https://fermatmind.com";
const API_ORIGIN = "https://api.fermatmind.com/api";
const DATE = "2026-07-13";
const LIVE_EVIDENCE_PATH = `docs/seo/personality/mbti-full-audit-30-live-evidence-${DATE}.json`;
const OUTPUT_BASE = `docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-${DATE}`;
const GSC_EVIDENCE_PATH = "docs/seo/personality/mbti-gsc-25-submission-monitoring-execution-2026-07-12.json";
const ALLOW_NETWORK = process.argv.includes("--allow-network");

const GROUPS = {
  NT: ["intj", "intp", "entj", "entp"],
  NF: ["infj", "infp", "enfj", "enfp"],
  SJ: ["istj", "isfj", "estj", "esfj"],
  SP: ["istp", "isfp", "estp", "esfp"],
};
const VARIANTS = ["a", "t"];
const PROFILE_VERIFY_ONLY = new Set(["istj-a", "istp-a", "isfp-a", "esfj-a"]);
const AT_VERIFY_ONLY = new Set(["intp-a-vs-intp-t"]);
const HOT_CROSS_TYPE = ["intj-vs-intp", "entj-vs-intj", "infj-vs-infp", "istj-vs-isfj"];
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const SAFE_PUBLIC_ORDER_PATH_PATTERN = /^\/(?:en|zh)\/personality\/big-five\/facets\/order\/?$/i;
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENCY = 4;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function write(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const temporaryPath = `${absolutePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, value);
  fs.renameSync(temporaryPath, absolutePath);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function targetList() {
  const profiles = Object.entries(GROUPS).flatMap(([group, types]) => (
    types.flatMap((type) => VARIANTS.map((variant) => ({
      group,
      kind: "profile",
      slug: `${type}-${variant}`,
      route: `/zh/personality/${type}-${variant}`,
    })))
  ));
  const atComparisons = Object.entries(GROUPS).flatMap(([group, types]) => (
    types.map((type) => ({
      group,
      kind: "at_comparison",
      slug: `${type}-a-vs-${type}-t`,
      route: `/zh/personality/${type}-a-vs-${type}-t`,
    }))
  ));
  const crossType = HOT_CROSS_TYPE.map((slug) => ({
    group: "hot_cross_type",
    kind: "cross_type_comparison",
    slug,
    route: `/zh/personality/${slug}`,
  }));
  return [...profiles, ...atComparisons, ...crossType];
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

function extractJsonLdTypes(html) {
  const types = new Set();
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const walk = (value) => {
    if (!value || typeof value !== "object") return;
    const valueTypes = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    valueTypes.filter(Boolean).forEach((type) => types.add(String(type)));
    Object.values(value).forEach((child) => {
      if (Array.isArray(child)) child.forEach(walk);
      else walk(child);
    });
  };
  for (const match of html.matchAll(pattern)) {
    try {
      walk(JSON.parse(match[1]));
    } catch {
      // The audit records absent types without attempting to repair production output.
    }
  }
  return [...types].sort();
}

function feedUrls(body) {
  return new Set(body.match(/https:\/\/fermatmind\.com\/[^\s<)\]"']+/g) ?? []);
}

async function fetchText(url, timeoutMs = 45_000) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": "FermatMind MBTI FULL AUDIT 30 read-only scan/1.0" },
      });
      if (response.ok) return response.text();
      throw new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, attempt * 300));
    }
  }
  throw lastError;
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function contentMetrics(payload, kind) {
  if (kind === "profile") {
    return {
      answer_block_count: Array.isArray(payload?.answer_surface_v1?.summary_blocks)
        ? payload.answer_surface_v1.summary_blocks.length
        : 0,
      faq_count: Array.isArray(payload?.answer_surface_v1?.faq_blocks)
        ? payload.answer_surface_v1.faq_blocks.length
        : 0,
      section_count: Array.isArray(payload?.sections) ? payload.sections.length : 0,
      internal_link_count: Array.isArray(payload?.internal_links) ? payload.internal_links.length : 0,
      seo_present: Boolean(payload?.seo_meta),
    };
  }
  const comparison = payload?.comparison;
  return {
    answer_block_count: Array.isArray(payload?.answer_surface_v1?.summary_blocks)
      ? payload.answer_surface_v1.summary_blocks.length
      : 0,
    faq_count: Array.isArray(comparison?.faq) ? comparison.faq.length : 0,
    section_count: Array.isArray(comparison?.sections) ? comparison.sections.length : 0,
    internal_link_count: Array.isArray(comparison?.internal_links) ? comparison.internal_links.length : 0,
    seo_present: Boolean(payload?.seo_meta),
  };
}

function contentComplete(metrics, kind) {
  if (kind === "profile") {
    return metrics.answer_block_count >= 1
      && metrics.faq_count >= 4
      && metrics.section_count >= 8
      && metrics.internal_link_count >= 5
      && metrics.seo_present;
  }
  return metrics.faq_count >= 5
    && metrics.section_count >= 6
    && metrics.internal_link_count >= 5
    && metrics.seo_present;
}

function gscEvidenceByUrl() {
  const gsc = readJson(GSC_EVIDENCE_PATH);
  return new Map((gsc.records ?? []).map((record) => [record.url, record]));
}

async function scanLive() {
  const gscByUrl = gscEvidenceByUrl();
  const feedBodies = Object.fromEntries(await Promise.all(
    ["sitemap.xml", "llms.txt", "llms-full.txt"].map(async (name) => [name, await fetchText(`${SITE_ORIGIN}/${name}`, 60_000)]),
  ));
  const feeds = Object.fromEntries(Object.entries(feedBodies).map(([name, body]) => [name, feedUrls(body)]));
  const publicUrls = [...new Set(Object.values(feeds).flatMap((set) => [...set]))];
  const privateUrlLeaks = publicUrls.filter((url) => {
    const pathname = new URL(url).pathname;
    return PRIVATE_PATH_PATTERN.test(pathname) && !SAFE_PUBLIC_ORDER_PATH_PATTERN.test(pathname);
  });
  const targets = targetList();
  const records = new Array(targets.length);
  let cursor = 0;

  async function worker() {
    while (cursor < targets.length) {
      const index = cursor;
      cursor += 1;
      const target = targets[index];
      const canonical = `${SITE_ORIGIN}${target.route}`;
      const apiUrl = target.kind === "profile"
        ? `${API_ORIGIN}/v0.5/personality/${target.slug}?locale=zh-CN`
        : `${API_ORIGIN}/v0.5/personality/comparisons/${target.slug}?locale=zh-CN`;
      const startedAt = Date.now();
      try {
        const [rawPayload, html] = await Promise.all([fetchJson(apiUrl), fetchText(canonical)]);
        const payload = rawPayload?.data ?? rawPayload;
        const metrics = contentMetrics(payload, target.kind);
        const jsonldTypes = extractJsonLdTypes(html);
        const robots = extractRobots(html);
        const releaseChecks = {
          canonical: extractCanonical(html) === canonical,
          robots: robots.includes("index") && robots.includes("follow") && !robots.includes("noindex"),
          sitemap: feeds["sitemap.xml"].has(canonical),
          llms: feeds["llms.txt"].has(canonical),
          llms_full: feeds["llms-full.txt"].has(canonical),
          jsonld: target.kind === "profile"
            ? jsonldTypes.includes("FAQPage") && jsonldTypes.some((type) => ["AboutPage", "WebPage"].includes(type))
            : ["CollectionPage", "ItemList", "BreadcrumbList", "FAQPage"].every((type) => jsonldTypes.includes(type)),
        };
        const complete = contentComplete(metrics, target.kind);
        const verifyOnly = target.kind === "cross_type_comparison"
          || PROFILE_VERIFY_ONLY.has(target.slug)
          || AT_VERIFY_ONLY.has(target.slug);
        const gsc = gscByUrl.get(canonical);
        records[index] = {
          ...target,
          canonical,
          api_url: apiUrl,
          api_latency_ms: Date.now() - startedAt,
          api_status: "ok",
          content_metrics: metrics,
          content_status: complete ? (verifyOnly ? "verify_only" : "complete") : "needs_content_repair",
          runtime_status: Object.values(releaseChecks).every(Boolean) ? "healthy" : "needs_runtime_repair",
          release_checks: releaseChecks,
          robots,
          jsonld_types: jsonldTypes,
          gsc_evidence_status: gsc ? "captured_existing_cohort" : "external_evidence_pending",
          gsc_baseline: gsc ? {
            clicks: gsc.baseline_clicks,
            impressions: gsc.baseline_impressions,
            ctr: gsc.baseline_ctr,
            average_position: gsc.baseline_position,
          } : null,
        };
      } catch (error) {
        records[index] = {
          ...target,
          canonical,
          api_url: apiUrl,
          api_latency_ms: Date.now() - startedAt,
          api_status: "error",
          content_metrics: null,
          content_status: "unknown",
          runtime_status: "needs_runtime_repair",
          release_checks: {},
          robots: "",
          jsonld_types: [],
          gsc_evidence_status: gscByUrl.has(canonical) ? "captured_existing_cohort" : "external_evidence_pending",
          gsc_baseline: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  await Promise.all(Array.from({ length: MAX_CONCURRENCY }, worker));
  return {
    id: "MBTI-FULL-AUDIT-30-LIVE-EVIDENCE",
    artifact: "MBTI-FULL-AUDIT-30-LIVE-EVIDENCE",
    generated_at: new Date().toISOString(),
    evidence_scope: "read_only_public_api_html_feed_and_existing_gsc_artifact",
    records,
    private_url_leaks: privateUrlLeaks,
    safety_boundary: {
      cms_write_attempted: false,
      deploy_attempted: false,
      gsc_mutation_attempted: false,
      sitemap_or_llms_runtime_mutation_attempted: false,
      credential_data_recorded: false,
    },
  };
}

function summary(records) {
  const count = (predicate) => records.filter(predicate).length;
  return {
    profile_count: count((record) => record.kind === "profile"),
    at_comparison_count: count((record) => record.kind === "at_comparison"),
    hot_cross_type_count: count((record) => record.kind === "cross_type_comparison"),
    total_count: records.length,
    needs_content_repair_count: count((record) => record.content_status === "needs_content_repair"),
    verify_only_count: count((record) => record.content_status === "verify_only"),
    complete_count: count((record) => record.content_status === "complete"),
    unknown_count: count((record) => record.content_status === "unknown"),
    runtime_repair_count: count((record) => record.runtime_status === "needs_runtime_repair"),
    latency_over_10_seconds_count: count((record) => record.api_latency_ms > 10_000),
    existing_gsc_evidence_count: count((record) => record.gsc_evidence_status === "captured_existing_cohort"),
    external_gsc_evidence_pending_count: count((record) => record.gsc_evidence_status === "external_evidence_pending"),
  };
}

function buildReport(evidence) {
  const records = evidence.records;
  const report = {
    id: "MBTI-FULL-AUDIT-30",
    artifact: "MBTI-FULL-AUDIT-30-INVENTORY-RUNTIME-BASELINE",
    generated_at: evidence.generated_at,
    final_decision: "PASS_MBTI_FULL_AUDIT_30_BASELINE_READY",
    scope: {
      locale: "zh-CN",
      profile_count: 32,
      at_comparison_count: 16,
      hot_cross_type_count: 4,
      total_count: 52,
    },
    source_artifacts: [LIVE_EVIDENCE_PATH, GSC_EVIDENCE_PATH],
    summary: summary(records),
    task_routing: {
      NT: records.filter((record) => record.group === "NT" && record.kind === "profile").map((record) => record.route),
      NF: records.filter((record) => record.group === "NF" && record.kind === "profile").map((record) => record.route),
      SJ: records.filter((record) => record.group === "SJ" && record.kind === "profile").map((record) => record.route),
      SP: records.filter((record) => record.group === "SP" && record.kind === "profile").map((record) => record.route),
      at_comparisons: records.filter((record) => record.kind === "at_comparison").map((record) => record.route),
      cross_type_verify_only: records.filter((record) => record.kind === "cross_type_comparison").map((record) => record.route),
    },
    records,
    private_url_leaks: evidence.private_url_leaks,
    safety_boundary: evidence.safety_boundary,
  };
  assert(report.summary.profile_count === 32, "Expected 32 Chinese Profile records");
  assert(report.summary.at_comparison_count === 16, "Expected 16 A/T comparison records");
  assert(report.summary.hot_cross_type_count === 4, "Expected 4 hot cross-type comparison records");
  assert(report.summary.total_count === 52, "Expected 52 total records");
  assert(report.summary.needs_content_repair_count === 43, "Expected 43 content repair records");
  assert(report.summary.verify_only_count === 9, "Expected 9 verify-only records");
  assert(report.private_url_leaks.length === 0, "Private URL leak detected in public feeds");
  return report;
}

function markdown(report) {
  const lines = [
    "# MBTI-FULL-AUDIT-30 Chinese Asset Inventory And Runtime Baseline",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Generated at: \`${report.generated_at}\``,
    `- Scope: ${report.scope.total_count} zh-CN public URLs (${report.scope.profile_count} Profile, ${report.scope.at_comparison_count} A/T comparison, ${report.scope.hot_cross_type_count} hot cross-type comparison).`,
    `- Content repair: ${report.summary.needs_content_repair_count}`,
    `- Verify-only: ${report.summary.verify_only_count}`,
    `- Runtime repair attention: ${report.summary.runtime_repair_count}`,
    `- API reads above 10 seconds: ${report.summary.latency_over_10_seconds_count}`,
    `- Existing GSC evidence: ${report.summary.existing_gsc_evidence_count}; external evidence pending: ${report.summary.external_gsc_evidence_pending_count}.`,
    "",
    "## Routing",
    "",
    "| Group | Next task | URL count |",
    "| --- | --- | ---: |",
    `| NT Profile | MBTI-PROFILE-NT-31 | ${report.task_routing.NT.length} |`,
    `| NF Profile | MBTI-PROFILE-NF-32 | ${report.task_routing.NF.length} |`,
    `| SJ Profile | MBTI-PROFILE-SJ-33 | ${report.task_routing.SJ.length} |`,
    `| SP Profile | MBTI-PROFILE-SP-34 | ${report.task_routing.SP.length} |`,
    `| A/T comparison | MBTI-COMP-AT-35 | ${report.task_routing.at_comparisons.length} |`,
    `| Hot cross-type | MBTI-FULL-QA-36 verify-only | ${report.task_routing.cross_type_verify_only.length} |`,
    "",
    "## Records",
    "",
    "| URL | Kind | Content status | Runtime status | API ms | GSC evidence |",
    "| --- | --- | --- | --- | ---: | --- |",
    ...report.records.map((record) => `| ${record.route} | ${record.kind} | ${record.content_status} | ${record.runtime_status} | ${record.api_latency_ms} | ${record.gsc_evidence_status} |`),
    "",
    "This is a read-only baseline. It does not write CMS content, alter indexability, change sitemap/LLMS runtime output, deploy, submit to GSC, or store credentials.",
    "",
  ];
  return lines.join("\n");
}

function csv(report) {
  const header = ["route", "kind", "group", "content_status", "runtime_status", "api_status", "api_latency_ms", "answer_block_count", "faq_count", "section_count", "internal_link_count", "seo_present", "canonical", "robots", "jsonld_types", "sitemap", "llms", "llms_full", "gsc_evidence_status"];
  const rows = report.records.map((record) => [
    record.route,
    record.kind,
    record.group,
    record.content_status,
    record.runtime_status,
    record.api_status,
    record.api_latency_ms,
    record.content_metrics?.answer_block_count ?? "",
    record.content_metrics?.faq_count ?? "",
    record.content_metrics?.section_count ?? "",
    record.content_metrics?.internal_link_count ?? "",
    record.content_metrics?.seo_present ?? "",
    record.release_checks?.canonical ?? "",
    record.robots,
    record.jsonld_types.join("|"),
    record.release_checks?.sitemap ?? "",
    record.release_checks?.llms ?? "",
    record.release_checks?.llms_full ?? "",
    record.gsc_evidence_status,
  ]);
  return [header, ...rows]
    .map((row) => row.map((value) => csvEscape(value, { quoteAlways: false })).join(","))
    .join("\n") + "\n";
}

if (ALLOW_NETWORK) {
  const evidence = await scanLive();
  write(LIVE_EVIDENCE_PATH, JSON.stringify(evidence, null, 2) + "\n");
}

const evidence = readJson(LIVE_EVIDENCE_PATH);
const report = buildReport(evidence);
write(`${OUTPUT_BASE}.json`, JSON.stringify(report, null, 2) + "\n");
write(`${OUTPUT_BASE}.md`, markdown(report));
write(`${OUTPUT_BASE}.csv`, csv(report));
console.log(report.final_decision);
console.log(`TOTAL=${report.summary.total_count}/52`);
console.log(`CONTENT_REPAIR=${report.summary.needs_content_repair_count}/43`);
console.log(`VERIFY_ONLY=${report.summary.verify_only_count}/9`);
console.log(`PRIVATE_URL_LEAKS=${report.private_url_leaks.length}`);
