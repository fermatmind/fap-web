#!/usr/bin/env node
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { csvEscape } from "./artifactSafety.mjs";

const SITE_ORIGIN = "https://fermatmind.com";
const API_ORIGIN = "https://api.fermatmind.com/api/v0.5/personality";
const FEED_URLS = Object.freeze({
  "sitemap.xml": "https://fermatmind.com/sitemap.xml",
  "llms.txt": "https://fermatmind.com/llms.txt",
  "llms-full.txt": "https://fermatmind.com/llms-full.txt",
});
const ALLOW_NETWORK = process.argv.includes("--allow-network");
const runArgument = process.argv.find((argument) => argument.startsWith("--run="));
const RUN = runArgument === "--run=1" ? 1 : runArgument === "--run=2" ? 2 : null;
const CONTRACT_PROBE = process.argv.find((argument) => argument.startsWith("--contract-probe="))
  ?.split("=")[1] ?? null;
const ARTIFACT_PATHS = Object.freeze({
  run1: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26-run-1.json", import.meta.url),
  run2: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26-run-2.json", import.meta.url),
  reportJson: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.json", import.meta.url),
  reportMarkdown: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.md", import.meta.url),
  reportCsv: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.csv", import.meta.url),
});
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENCY = 4;
const REQUEST_TIMEOUT_MS = 45_000;
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const SAFE_PUBLIC_ORDER_PATH_PATTERN = /^\/(?:en|zh)\/personality\/big-five\/facets\/order\/?$/i;
const GROUPS = Object.freeze({
  NT: ["intj", "intp", "entj", "entp"],
  NF: ["infj", "infp", "enfj", "enfp"],
  SJ: ["istj", "isfj", "estj", "esfj"],
  SP: ["istp", "isfp", "estp", "esfp"],
});
const ORIGINAL_CROSS_TYPE = Object.freeze([
  "intj-vs-intp",
  "entj-vs-intj",
  "infj-vs-infp",
  "istj-vs-isfj",
]);
const RELEASED_CROSS_TYPE = Object.freeze([
  "enfp-vs-entp",
  "estj-vs-entj",
  "isfp-vs-infp",
]);
const EXPECTED_CROSS_SECTION_COUNT = Object.freeze({
  "intj-vs-intp": 6,
  "entj-vs-intj": 6,
  "infj-vs-infp": 6,
  "istj-vs-isfj": 6,
  "enfp-vs-entp": 8,
  "estj-vs-entj": 8,
  "isfp-vs-infp": 8,
});
const PROFILE_SECTION_COUNT_OVERRIDES = Object.freeze({
  "istj-a": 34,
  "esfj-a": 34,
  "istp-a": 34,
  "isfp-a": 34,
});
const CHECK_KEYS = Object.freeze([
  "public_api",
  "authority",
  "authority_fingerprint",
  "visible_body",
  "section_completeness",
  "faq",
  "jsonld",
  "canonical",
  "robots_indexability",
  "sitemap",
  "llms",
  "llms_full",
  "api_no_timeout",
]);

function targets() {
  const profiles = Object.entries(GROUPS).flatMap(([group, types]) => types.flatMap((type) => (
    ["a", "t"].map((variant) => ({
      group,
      kind: "profile",
      slug: `${type}-${variant}`,
      expectedSectionCount: PROFILE_SECTION_COUNT_OVERRIDES[`${type}-${variant}`] ?? 35,
    }))
  )));
  const atComparisons = Object.entries(GROUPS).flatMap(([group, types]) => types.map((type) => ({
    group,
    kind: "at_comparison",
    slug: `${type}-a-vs-${type}-t`,
    expectedSectionCount: 9,
  })));
  const crossTypeComparisons = [...ORIGINAL_CROSS_TYPE, ...RELEASED_CROSS_TYPE].map((slug) => ({
    group: RELEASED_CROSS_TYPE.includes(slug) ? "released_cross_type" : "original_cross_type",
    kind: "cross_type_comparison",
    slug,
    expectedSectionCount: EXPECTED_CROSS_SECTION_COUNT[slug],
  }));
  return [...profiles, ...atComparisons, ...crossTypeComparisons];
}

function validateInventory(targetList) {
  const expected = targets().map(({ slug }) => slug);
  const actual = targetList.map(({ slug }) => slug);
  if (actual.length !== 55) throw new Error("MBTI-INDEX-52 requires exactly 55 targets");
  if (new Set(actual).size !== 55) throw new Error("MBTI-INDEX-52 rejects duplicate targets");
  const missing = expected.filter((slug) => !actual.includes(slug));
  const extra = actual.filter((slug) => !expected.includes(slug));
  if (missing.length || extra.length) {
    throw new Error(`MBTI-INDEX-52 inventory drift missing=${missing.join("|")} extra=${extra.join("|")}`);
  }
  const released = actual.filter((slug) => RELEASED_CROSS_TYPE.includes(slug));
  if (released.join("|") !== RELEASED_CROSS_TYPE.join("|")) {
    throw new Error("MBTI-INDEX-52 exact-three release set drifted");
  }
}

function validateRecordEvidence(record) {
  const failed = CHECK_KEYS.filter((key) => record?.checks?.[key] !== true);
  if (failed.length) throw new Error(`MBTI-INDEX-52 record failed: ${failed.join("|")}`);
  if (!/^[0-9a-f]{64}$/.test(record.authority_fingerprint_sha256 ?? "")) {
    throw new Error("MBTI-INDEX-52 authority fingerprint is absent or malformed");
  }
  if (!/^[0-9a-f]{64}$/.test(record.source_revision_sha256 ?? "")) {
    throw new Error("MBTI-INDEX-52 source revision fingerprint is absent or malformed");
  }
}

function runContractProbe(name) {
  const inventory = targets();
  if (name === "duplicate") inventory[54] = { ...inventory[53] };
  else if (name === "missing") inventory.pop();
  else if (name === "extra") inventory.push({ kind: "cross_type_comparison", slug: "intp-vs-entp" });
  else {
    const checks = Object.fromEntries(CHECK_KEYS.map((key) => [key, true]));
    const record = {
      checks,
      authority_fingerprint_sha256: "a".repeat(64),
      source_revision_sha256: "b".repeat(64),
    };
    if (name === "section") record.checks.section_completeness = false;
    else if (name === "fingerprint") record.authority_fingerprint_sha256 = "";
    else if (name === "membership") record.checks.llms_full = false;
    else throw new Error("Unknown MBTI-INDEX-52 contract probe");
    validateRecordEvidence(record);
    throw new Error("Invalid record probe unexpectedly passed");
  }
  validateInventory(inventory);
  throw new Error("Invalid inventory probe unexpectedly passed");
}

if (CONTRACT_PROBE) runContractProbe(CONTRACT_PROBE);
if (!ALLOW_NETWORK || RUN === null) {
  console.error("HOLD_MBTI_55_INCOMPLETE: pass --allow-network and --run=1 or --run=2");
  process.exit(2);
}

function normalizeText(value) {
  const fragment = JSDOM.fragment(String(value ?? ""));
  fragment.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
  return String(fragment.textContent ?? "").replace(/\s+/g, " ").trim();
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function isTimeout(error) {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  return ["AbortError", "TimeoutError"].includes(name) || /timed?\s*out|timeout/i.test(message);
}

async function fetchBody(url, parseBody, timeoutMs = REQUEST_TIMEOUT_MS, extraHeaders = {}) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          "accept-encoding": "identity",
          "user-agent": "FermatMind MBTI INDEX-52 read-only release gate/1.0",
          ...extraHeaders,
        },
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
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  throw lastError;
}

async function fetchText(url, timeoutMs) {
  return fetchBody(url, (response) => response.text(), timeoutMs);
}

async function fetchJson(url) {
  return fetchBody(url, async (response) => {
    const payload = await response.json();
    return payload?.data ?? payload;
  });
}

function fetchFeedOnce(name) {
  const url = FEED_URLS[name];
  if (!url) throw new Error(`Unsupported feed: ${name}`);
  return execFileSync("curl", [
    "--http1.1",
    "--fail",
    "--silent",
    "--show-error",
    "--max-time",
    "120",
    "--header",
    "Accept-Encoding: identity",
    url,
  ], {
    encoding: "utf8",
    maxBuffer: 10_000_000,
  });
}

async function fetchFeed(name) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const body = await fetchFeedOnce(name);
      if (feedUrls(body).size < 55) {
        throw new Error(`${name} returned an incomplete canonical URL set`);
      }
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }
  throw lastError;
}

function documentFacts(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => {
    try {
      return JSON.parse(node.textContent ?? "");
    } catch {
      return { __invalid_jsonld: true };
    }
  });
  return {
    canonical: document.querySelector('link[rel~="canonical"]')?.getAttribute("href") ?? "",
    robots: (document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "").toLowerCase(),
    visibleText: normalizeText(document.body?.textContent ?? ""),
    jsonld,
  };
}

function walkJson(value, visit) {
  if (!value || typeof value !== "object") return;
  visit(value);
  Object.values(value).forEach((child) => {
    if (Array.isArray(child)) child.forEach((item) => walkJson(item, visit));
    else walkJson(child, visit);
  });
}

function structuredFacts(blocks) {
  const types = new Set();
  const faq = [];
  let invalid = false;
  blocks.forEach((block) => walkJson(block, (node) => {
    if (node.__invalid_jsonld) invalid = true;
    const nodeTypes = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    nodeTypes.filter(Boolean).forEach((type) => types.add(String(type)));
    if (node["@type"] !== "FAQPage" || !Array.isArray(node.mainEntity)) return;
    node.mainEntity.forEach((question) => faq.push({
      question: normalizeText(question?.name),
      answer: normalizeText(question?.acceptedAnswer?.text),
    }));
  }));
  return { types: [...types].sort(), faq, invalid };
}

function apiFaq(payload, kind) {
  const rows = kind === "profile"
    ? payload?.answer_surface_v1?.faq_blocks
    : payload?.comparison?.faq;
  return Array.isArray(rows)
    ? rows.map((row) => ({
      question: normalizeText(row?.question),
      answer: normalizeText(row?.answer),
    })).filter((row) => row.question && row.answer)
    : [];
}

function apiSections(payload, kind) {
  const rows = kind === "profile" ? payload?.sections : payload?.comparison?.sections;
  return Array.isArray(rows) ? rows : [];
}

function authorityFacts(payload, target, canonical) {
  const sections = apiSections(payload, target.kind);
  if (target.kind === "profile") {
    const profile = payload?.profile ?? {};
    const revision = {
      id: profile.id,
      slug: profile.slug,
      schema_version: profile.schema_version,
      published_at: profile.published_at,
      updated_at: profile.updated_at,
    };
    const authority = {
      profile: {
        slug: profile.slug,
        status: profile.status,
        is_public: profile.is_public,
        is_indexable: profile.is_indexable,
      },
      sections,
      faq: payload?.answer_surface_v1?.faq_blocks,
      canonical: payload?.seo_meta?.canonical_url,
      robots: payload?.seo_meta?.robots,
    };
    return {
      present: profile.status === "published"
        && profile.is_public === true
        && profile.is_indexable === true
        && payload?.seo_meta?.canonical_url === canonical,
      sourceRevisionSha256: sha256(revision),
      authorityFingerprintSha256: sha256(authority),
    };
  }

  const comparison = payload?.comparison ?? {};
  if (target.kind === "at_comparison") {
    const revision = {
      contract: comparison.comparison_contract_version,
      overlay_source: comparison.overlay_source,
      source_refs: comparison.source_refs,
    };
    return {
      present: comparison.comparison_contract_version === "mbti.at_comparison.v1.mbti64_overlay"
        && comparison.overlay_source?.source === (
          target.slug === "intp-a-vs-intp-t"
            ? "mbti-comp-runtime-46-intp-revision"
            : "mbti_cms_import_40_at_comparison_draft_v1"
        )
        && comparison.canonical_url === canonical,
      sourceRevisionSha256: sha256(revision),
      authorityFingerprintSha256: sha256({
        comparison_slug: comparison.comparison_slug,
        title: comparison.title,
        description: comparison.description,
        sections,
        faq: comparison.faq,
        canonical_url: comparison.canonical_url,
      }),
    };
  }

  return {
    present: comparison.authority_source === "database"
      && comparison.publish_status === "published"
      && comparison.review_status === "approved"
      && comparison.is_public === true
      && comparison.is_indexable === true
      && comparison.sitemap_eligible === true
      && comparison.llms_eligible === true
      && comparison.canonical_url === canonical,
    sourceRevisionSha256: sha256({
      source_sha256: comparison.source_sha256,
      indexability_status: comparison.indexability_status,
      publish_status: comparison.publish_status,
    }),
    authorityFingerprintSha256: sha256({
      source_sha256: comparison.source_sha256,
      title: comparison.title,
      description: comparison.description,
      summary: comparison.summary,
      sections,
      faq: comparison.faq,
      canonical_url: comparison.canonical_url,
    }),
  };
}

function jsonLdValid(kind, structured) {
  if (structured.invalid) return false;
  if (kind === "profile") {
    return structured.types.includes("FAQPage")
      && structured.types.includes("BreadcrumbList")
      && structured.types.some((type) => ["AboutPage", "WebPage"].includes(type));
  }
  return ["CollectionPage", "ItemList", "BreadcrumbList", "FAQPage"]
    .every((type) => structured.types.includes(type));
}

function visibleBodyComplete(payload, target, visibleText) {
  if (target.kind === "profile") return visibleText.length >= 5_000;
  const sections = apiSections(payload, target.kind);
  return visibleText.length >= 1_500 && sections.every((section) => {
    const title = normalizeText(section?.title);
    return title.length >= 2 && visibleText.includes(title);
  });
}

function feedUrls(body) {
  return new Set(body.match(/https:\/\/fermatmind\.com\/[a-z0-9/_-]+/gi) ?? []);
}

function stableRecord(target, record) {
  const checks = Object.fromEntries(CHECK_KEYS.map((key) => [key, record?.checks?.[key] === true]));
  return {
    path: `/zh/personality/${target.slug}`,
    kind: target.kind,
    group: target.group,
    expected_section_count: target.expectedSectionCount,
    authority_fingerprint_sha256: record?.authorityFingerprintSha256 ?? "",
    source_revision_sha256: record?.sourceRevisionSha256 ?? "",
    checks,
    blockers: CHECK_KEYS.filter((key) => !checks[key]),
  };
}

const targetList = targets();
validateInventory(targetList);
const runStartedAt = new Date().toISOString();

const feedNames = ["sitemap.xml", "llms.txt", "llms-full.txt"];
const feedEntries = [];
for (const name of feedNames) {
  feedEntries.push([name, await fetchFeed(name)]);
}
const feeds = Object.fromEntries(feedEntries);
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
    const canonical = `${SITE_ORIGIN}/zh/personality/${target.slug}`;
    const apiUrl = target.kind === "profile"
      ? `${API_ORIGIN}/${target.slug}?locale=zh-CN`
      : `${API_ORIGIN}/comparisons/${target.slug}?locale=zh-CN`;
    try {
      const [payload, html] = await Promise.all([fetchJson(apiUrl), fetchText(canonical)]);
      const facts = documentFacts(html);
      const structured = structuredFacts(facts.jsonld);
      const faq = apiFaq(payload, target.kind);
      const schemaFaq = new Map(structured.faq.map((row) => [row.question, row.answer]));
      const authority = authorityFacts(payload, target, canonical);
      const sectionCount = apiSections(payload, target.kind).length;
      const checks = {
        public_api: payload?.ok === true,
        authority: authority.present,
        authority_fingerprint: /^[0-9a-f]{64}$/.test(authority.authorityFingerprintSha256)
          && /^[0-9a-f]{64}$/.test(authority.sourceRevisionSha256),
        visible_body: visibleBodyComplete(payload, target, facts.visibleText),
        section_completeness: sectionCount === target.expectedSectionCount,
        faq: faq.length > 0 && faq.every((row) => (
          schemaFaq.get(row.question) === row.answer
          && facts.visibleText.includes(row.question)
          && facts.visibleText.includes(row.answer)
        )),
        jsonld: jsonLdValid(target.kind, structured),
        canonical: facts.canonical === canonical,
        robots_indexability: /(?:^|[\s,])index(?:[\s,]|$)/.test(facts.robots)
          && /(?:^|[\s,])follow(?:[\s,]|$)/.test(facts.robots)
          && !facts.robots.includes("noindex"),
        sitemap: feedSets["sitemap.xml"].has(canonical),
        llms: feedSets["llms.txt"].has(canonical),
        llms_full: feedSets["llms-full.txt"].has(canonical),
        api_no_timeout: true,
      };
      records[index] = {
        checks,
        authorityFingerprintSha256: authority.authorityFingerprintSha256,
        sourceRevisionSha256: authority.sourceRevisionSha256,
      };
    } catch (error) {
      const timedOut = isTimeout(error);
      records[index] = {
        checks: {
          public_api: false,
          authority: false,
          authority_fingerprint: false,
          visible_body: false,
          section_completeness: false,
          faq: false,
          jsonld: false,
          canonical: false,
          robots_indexability: false,
          sitemap: feedSets["sitemap.xml"].has(canonical),
          llms: feedSets["llms.txt"].has(canonical),
          llms_full: feedSets["llms-full.txt"].has(canonical),
          api_no_timeout: !timedOut,
        },
      };
    }
  }
}
await Promise.all(Array.from({ length: MAX_CONCURRENCY }, () => worker()));

const evidenceRecords = targetList.map((target, index) => stableRecord(target, records[index]));
const metrics = Object.fromEntries(CHECK_KEYS.map((key) => [
  key.toUpperCase(),
  evidenceRecords.filter((record) => record.checks[key]).length,
]));
metrics.API_TIMEOUTS = 55 - metrics.API_NO_TIMEOUT;
delete metrics.API_NO_TIMEOUT;
const aggregatePassed = Object.entries(metrics).every(([key, value]) => (
  key === "API_TIMEOUTS" ? value === 0 : value === 55
)) && privateUrlLeaks.length === 0;
evidenceRecords.forEach((record) => {
  if (aggregatePassed) validateRecordEvidence(record);
});
const evidenceSignature = sha256({
  target_count: 55,
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  records: evidenceRecords,
});
const runCompletedAt = new Date().toISOString();
const runReport = {
  id: "MBTI-INDEX-52",
  artifact: `MBTI-INDEX-52-FULL-55-RELEASE-GATE-RUN-${RUN}`,
  run: RUN,
  started_at: runStartedAt,
  completed_at: runCompletedAt,
  target_count: 55,
  evidence_scope: "read_only_production_network_revalidation",
  run_decision: aggregatePassed ? "PASS_MBTI_55_RUN" : "HOLD_MBTI_55_INCOMPLETE",
  evidence_signature: evidenceSignature,
  source_revision_set_sha256: sha256(evidenceRecords.map((record) => record.source_revision_sha256)),
  authority_fingerprint_set_sha256: sha256(evidenceRecords.map((record) => record.authority_fingerprint_sha256)),
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  records: evidenceRecords,
};
fs.writeFileSync(RUN === 1 ? ARTIFACT_PATHS.run1 : ARTIFACT_PATHS.run2, `${JSON.stringify(runReport, null, 2)}\n`);

let previousRun = null;
if (RUN === 2 && fs.existsSync(ARTIFACT_PATHS.run1)) {
  previousRun = JSON.parse(fs.readFileSync(ARTIFACT_PATHS.run1, "utf8"));
}
const consecutivePass = Boolean(
  RUN === 2
  && aggregatePassed
  && previousRun?.run_decision === "PASS_MBTI_55_RUN"
  && previousRun?.target_count === 55
  && previousRun?.evidence_signature === evidenceSignature
  && previousRun?.completed_at < runStartedAt,
);
const finalDecision = consecutivePass
  ? "ALLOW_MBTI_55_COMPLETE"
  : (RUN === 1 && aggregatePassed ? "PASS_MBTI_55_RUN_PENDING_SECOND" : "HOLD_MBTI_55_INCOMPLETE");
const finalReport = {
  id: "MBTI-INDEX-52",
  artifact: "MBTI-INDEX-52-FULL-55-RELEASE-GATE",
  generated_at: runCompletedAt,
  final_decision: finalDecision,
  gsc_dependency_unblocked: consecutivePass,
  required_consecutive_runs: 2,
  completed_consecutive_runs: consecutivePass ? 2 : (aggregatePassed ? 1 : 0),
  target_count: 55,
  exact_new_targets: RELEASED_CROSS_TYPE,
  run_1: previousRun ? {
    started_at: previousRun.started_at,
    completed_at: previousRun.completed_at,
    decision: previousRun.run_decision,
    evidence_signature: previousRun.evidence_signature,
    source_revision_set_sha256: previousRun.source_revision_set_sha256,
    authority_fingerprint_set_sha256: previousRun.authority_fingerprint_set_sha256,
    metrics: previousRun.metrics,
  } : (RUN === 1 ? {
    started_at: runStartedAt,
    completed_at: runCompletedAt,
    decision: runReport.run_decision,
    evidence_signature: evidenceSignature,
    source_revision_set_sha256: runReport.source_revision_set_sha256,
    authority_fingerprint_set_sha256: runReport.authority_fingerprint_set_sha256,
    metrics,
  } : null),
  run_2: RUN === 2 ? {
    started_at: runStartedAt,
    completed_at: runCompletedAt,
    decision: runReport.run_decision,
    evidence_signature: evidenceSignature,
    source_revision_set_sha256: runReport.source_revision_set_sha256,
    authority_fingerprint_set_sha256: runReport.authority_fingerprint_set_sha256,
    metrics,
  } : null,
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  records: evidenceRecords,
  safety_boundary: {
    read_only_network: true,
    cms_write_attempted: false,
    database_write_attempted: false,
    publication_mutation_attempted: false,
    indexability_mutation_attempted: false,
    sitemap_llms_mutation_attempted: false,
    sitemap_submission_attempted: false,
    gsc_mutation_attempted: false,
    search_submission_attempted: false,
    production_deploy_attempted: false,
    frontend_editorial_fallback_added: false,
  },
};

const metricLines = Object.entries(metrics).map(([key, value]) => (
  key === "API_TIMEOUTS" ? `${key}=${value}` : `${key}=${value}/55`
));
const markdown = [
  "# MBTI-INDEX-52 Full 55 URL Release Gate",
  "",
  `- Final decision: \`${finalDecision}\``,
  `- Consecutive runs complete: \`${finalReport.completed_consecutive_runs}/2\``,
  `- Target count: \`55\``,
  `- Private URL leaks: \`${privateUrlLeaks.length}\``,
  ...metricLines.map((line) => `- \`${line}\``),
  "",
  "This is read-only production evidence. It does not write CMS/DB data, mutate publication or indexability, deploy, submit sitemap/llms, or request search indexing.",
  "",
  "| Path | Kind | Expected sections | Result | Blockers |",
  "| --- | --- | ---: | --- | --- |",
  ...evidenceRecords.map((record) => `| ${record.path} | ${record.kind} | ${record.expected_section_count} | ${record.blockers.length ? "hold" : "pass"} | ${record.blockers.join(", ") || "none"} |`),
  "",
].join("\n");
const csvHeaders = [
  "path",
  "kind",
  "group",
  "expected_section_count",
  "result",
  ...CHECK_KEYS,
  "authority_fingerprint_sha256",
  "source_revision_sha256",
  "blockers",
];
const csv = [
  csvHeaders.map(csvEscape).join(","),
  ...evidenceRecords.map((record) => csvHeaders.map((header) => csvEscape(
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
if ((RUN === 1 && !aggregatePassed) || (RUN === 2 && !consecutivePass)) process.exitCode = 1;
