#!/usr/bin/env node
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { csvEscape } from "./artifactSafety.mjs";

const require = createRequire(import.meta.url);
const { isSharedDiscoverabilityDeniedPath } = require(
  "../../lib/seo/discoverabilityExposurePolicy.cjs",
);
const SITE_ORIGIN = "https://fermatmind.com";
const API_ORIGIN = "https://api.fermatmind.com/api/v0.5/personality";
const FEED_URLS = Object.freeze({
  "sitemap.xml": "https://fermatmind.com/sitemap.xml",
  "llms.txt": "https://fermatmind.com/llms.txt",
  "llms-full.txt": "https://fermatmind.com/llms-full.txt",
});
const ALLOW_NETWORK = process.argv.includes("--allow-network");
const DIAGNOSE_VISIBLE_ONLY = process.argv.includes("--diagnose-visible-only");
const diagnoseSlug = process.argv.find((argument) => argument.startsWith("--diagnose-slug="))
  ?.split("=")[1] ?? null;
const DIAGNOSE_VISIBLE_BODY = process.env.MBTI_INDEX_DIAGNOSE_VISIBLE_BODY === "1";
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
const MAX_CONCURRENCY = 1;
const REQUEST_TIMEOUT_MS = 45_000;
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
const RELEASED_CROSS_SOURCE_SHA256 = Object.freeze({
  "enfp-vs-entp": "a7b14d279daa3d2ccaaffa9442b5254f8e6f75e1ea0d3bf7a5c08817b912af7e",
  "estj-vs-entj": "b73514962b2d72be47c9004f2b5e5fb7572ea82f918c2a0f5a3374e15b2f36cc",
  "isfp-vs-infp": "41e62902dae206acc8735b19ff7e698fd51b5a609d2aeb34bb02556867399a65",
});
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
const PROFILE_V85_VISIBLE_SECTION_KEYS = Object.freeze([
  "v8_5_thirty_second_overview",
  "v8_5_strengths_watchouts",
  "v8_5_module_01_core_reading",
  "v8_5_module_02_judgment_style",
  "v8_5_module_03_agency_boundary",
  "v8_5_module_04_standards_drive",
  "v8_5_module_05_learning_revision",
  "v8_5_module_06_stress_blindspot",
  "v8_5_module_07_social_feedback",
  "v8_5_module_08_career_workflow",
  "v8_5_module_09_relationships",
  "v8_5_module_10_faq_boundary",
]);
const PROFILE_LEADING_PROJECTION_SECTION_KEYS = Object.freeze([
  "letters_intro",
  "trait_overview",
]);
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
const SAFETY_BOUNDARY = Object.freeze({
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
});

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
  if (name === "jsonld-node-identity") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const structured = {
      invalid: false,
      types: ["AboutPage", "BreadcrumbList", "FAQPage", "WebPage"],
      pageIdentities: [
        { types: ["AboutPage"], id: "", url: `${SITE_ORIGIN}/zh/personality/intp-a` },
        { types: ["WebPage"], id: `${canonical}#webpage`, url: canonical },
      ],
      breadcrumbTargets: [canonical],
    };
    if (jsonLdValid("profile", structured, canonical)) {
      throw new Error("Stale required JSON-LD page node unexpectedly passed");
    }
    return;
  }
  if (name === "projection-visibility") {
    const payload = {
      comparison_public_projection_v1: {
        claim_boundary: "Use this comparison for reflection, not diagnosis or selection.",
        variants: {
          a: {
            runtime_type_code: "INTJ-A",
            display_type: "INTJ-A",
            type_name: "Architect",
            nickname: "Assertive Architect",
            rarity: "Rare",
            keywords: ["decisive", "steady"],
            summary_card: { summary: "Trusts the plan sooner." },
          },
          t: {
            runtime_type_code: "INTJ-T",
            display_type: "INTJ-T",
            type_name: "Architect",
            nickname: "Turbulent Architect",
            rarity: "Rare",
            keywords: ["reflective", "adaptive"],
            hero_summary: "Rechecks the plan longer.",
          },
        },
        comparison_blocks: [{
          key: "core_difference",
          title: "Core difference",
          variants: {
            a: "Moves once the plan is sound.",
            t: "Keeps testing the plan.",
          },
          body_md: "",
        }],
      },
    };
    const completeVisibleText = [
      "Use this comparison for reflection, not diagnosis or selection.",
      "INTJ-A Architect Assertive Architect Trusts the plan sooner. Rare decisive steady",
      "INTJ-T Architect Turbulent Architect Rechecks the plan longer. Rare reflective adaptive",
      "Core difference Moves once the plan is sound. Keeps testing the plan.",
    ].join(" ");
    if (!comparisonProjectionVisible(
      payload,
      { kind: "at_comparison", slug: "intj-a-vs-intj-t" },
      completeVisibleText,
    )) {
      throw new Error("Complete comparison projection unexpectedly failed");
    }
    if (comparisonProjectionVisible(
      payload,
      { kind: "at_comparison", slug: "intj-a-vs-intj-t" },
      completeVisibleText.replace("Keeps testing the plan.", ""),
    )) {
      throw new Error("Missing comparison projection content unexpectedly passed");
    }
    const crossTypeLinks = Array.from({ length: 7 }, (_, index) => ({
      label: `Comparison link ${index + 1}`,
      href: `/zh/personality/cross-link-${index + 1}`,
      reason: `Check related contrast ${index + 1}.`,
    }));
    const crossTypePayload = {
      comparison_public_projection_v1: {
        claim_boundary: "Use this comparison for reflection, not diagnosis or selection.",
        internal_links: crossTypeLinks,
      },
    };
    const crossTypeVisibleText = crossTypeLinks
      .flatMap((link) => [link.label, link.reason])
      .concat("Use this comparison for reflection, not diagnosis or selection.")
      .join(" ");
    const crossTypeAnchors = crossTypeLinks.map((link) => ({
      href: link.href,
      text: `${link.label} ${link.reason}`,
    }));
    if (!comparisonProjectionVisible(
      crossTypePayload,
      { kind: "cross_type_comparison", slug: "enfp-vs-entp" },
      crossTypeVisibleText,
      crossTypeAnchors,
    )) {
      throw new Error("Complete cross-type internal link unexpectedly failed");
    }
    if (comparisonProjectionVisible(
      crossTypePayload,
      { kind: "cross_type_comparison", slug: "enfp-vs-entp" },
      crossTypeVisibleText,
      [
        { ...crossTypeAnchors[0], href: "/zh/personality/enfp-vs-entp" },
        ...crossTypeAnchors.slice(1),
      ],
    )) {
      throw new Error("Misdirected cross-type internal link unexpectedly passed");
    }
    return;
  }
  if (name === "answer-surface-all-summaries") {
    const payload = {
      answer_surface_v1: {
        summary_blocks: [
          { title: "First summary", body: "First summary body." },
          { title: "Second summary", body: "Second summary body." },
        ],
        faq_blocks: [{ question: "Question?", answer: "Answer." }],
        compare_blocks: [{ title: "Comparison", body: "Comparison body." }],
        next_step_blocks: [{
          title: "Next step",
          body: "Next step body.",
          href: "/zh/tests/mbti-personality-test-16-personality-types",
        }],
      },
    };
    const visibleText = [
      "First summary",
      "First summary body.",
      "Second summary",
      "Comparison",
      "Comparison body.",
      "Next step",
      "Next step body.",
    ].join(" ");
    const visibleAnchors = [{
      text: "Next step",
      href: "/zh/tests/mbti-personality-test-16-personality-types",
    }];
    if (answerSurfaceVisible(payload, "at_comparison", visibleText, visibleAnchors)) {
      throw new Error("Incomplete comparison summary set unexpectedly passed");
    }
    return;
  }
  if (name === "profile-reader-section-membership") {
    const sections = [
      ...PROFILE_LEADING_PROJECTION_SECTION_KEYS.map((key) => ({ key })),
      ...PROFILE_V85_VISIBLE_SECTION_KEYS.map((section_key) => ({ section_key })),
    ];
    sections[sections.length - 1] = {
      section_key: PROFILE_V85_VISIBLE_SECTION_KEYS[0],
    };
    if (profileReaderSectionMembershipValid(sections)) {
      throw new Error("Duplicate profile reader section key unexpectedly passed");
    }
    return;
  }
  if (name === "robots-header-indexability") {
    if (robotsIndexable({ robots: "index,follow", xRobotsTag: "none" })) {
      throw new Error("X-Robots-Tag none unexpectedly passed");
    }
    return;
  }
  if (name === "css-hidden-visibility") {
    const facts = documentFacts(`
      <html><body>
        <main><p>Visible reader content</p><div class="hidden">Hidden authority content</div></main>
      </body></html>
    `);
    if (facts.visibleText.includes("Hidden authority content")) {
      throw new Error("CSS-hidden content unexpectedly counted as visible");
    }
    return;
  }
  if (name === "frontend-revision-sequence") {
    const revision = "a".repeat(40);
    if (sameFrontendRevisionAcrossSequence({ frontend_revision: "b".repeat(40) }, revision, revision)) {
      throw new Error("Mixed frontend revisions unexpectedly passed");
    }
    return;
  }
  if (name === "profile-hero-visibility") {
    const projection = {
      display_type: "INTJ-A",
      profile: {
        type_name: "建筑师型",
        hero_summary: "先建立可靠结构，再稳定推进。",
        rarity: "较少见",
        keywords: ["战略", "独立", "坚定"],
      },
    };
    const incompleteVisibleText = "INTJ-A 建筑师人格 先建立可靠结构，再稳定推进。 稀有度：较少见 战略 独立";
    if (profileHeroVisible(projection, incompleteVisibleText)) {
      throw new Error("Incomplete profile hero unexpectedly passed");
    }
    return;
  }
  if (name === "comparison-robots-authority") {
    const payload = {
      seo_surface_v1: { robots_policy: "noindex,follow" },
      seo_meta: { robots: "index,follow" },
    };
    if (comparisonRobotsAuthorityPresent(payload, { robots: "index,follow" })) {
      throw new Error("Backend noindex comparison policy unexpectedly passed");
    }
    return;
  }
  if (name === "profile-robots-authority") {
    const seoPayload = {
      meta: { robots: "index,follow" },
      surface: { robots_policy: "noindex,follow" },
    };
    if (profileRobotsAuthorityPresent(
      seoPayload,
      { seo_surface_v1: { robots_policy: "index,follow" } },
      { robots: "index,follow" },
    )) {
      throw new Error("Backend profile noindex policy unexpectedly passed");
    }
    return;
  }
  if (name === "disabled-runtime-sections") {
    const sections = runtimeComparisonSections({
      sections: [
        { section_key: "enabled", is_enabled: true },
        { section_key: "disabled", is_enabled: false },
      ],
    });
    if (sections.length !== 1 || sections[0]?.section_key !== "enabled") {
      throw new Error("Disabled runtime comparison section was not filtered");
    }
    return;
  }
  if (name === "profile-hero-completeness") {
    if (profileHeroVisible(
      { display_type: "INTJ-A", profile: { type_name: "", keywords: [] } },
      "INTJ-A",
    )) {
      throw new Error("Incomplete profile hero authority unexpectedly passed");
    }
    return;
  }
  if (name === "feed-exact-url-membership") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const urls = feedUrls(`${canonical}?preview=1`);
    if (urls.has(canonical)) {
      throw new Error("Query-bearing feed URL unexpectedly satisfied canonical membership");
    }
    return;
  }
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
    else if (name === "revision") record.checks.authority_fingerprint = false;
    else if (name === "membership") record.checks.llms_full = false;
    else throw new Error("Unknown MBTI-INDEX-52 contract probe");
    validateRecordEvidence(record);
    throw new Error("Invalid record probe unexpectedly passed");
  }
  validateInventory(inventory);
  throw new Error("Invalid inventory probe unexpectedly passed");
}

if (CONTRACT_PROBE) {
  runContractProbe(CONTRACT_PROBE);
  process.exit(0);
}
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

async function fetchBody(
  url,
  parseBody,
  timeoutMs = REQUEST_TIMEOUT_MS,
  extraHeaders = {},
  redirectMode = "follow",
) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: redirectMode,
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

async function fetchPage(url) {
  return fetchBody(url, async (response) => ({
    html: await response.text(),
    xRobotsTag: normalizeText(response.headers.get("x-robots-tag")).toLowerCase(),
  }), REQUEST_TIMEOUT_MS, {}, "manual");
}

async function fetchJson(url) {
  return fetchBody(url, async (response) => {
    const payload = await response.json();
    return payload?.data ?? payload;
  });
}

async function fetchFrontendRevision() {
  const payload = await fetchJson(`${SITE_ORIGIN}/revision`);
  const revision = normalizeText(payload?.revision);
  if (!/^[0-9a-f]{40}$/.test(revision)) {
    throw new Error("Production frontend revision is absent or malformed");
  }
  return revision;
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

function documentFacts(html, xRobotsTag = "") {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => {
    try {
      return JSON.parse(node.textContent ?? "");
    } catch {
      return { __invalid_jsonld: true };
    }
  });
  const visibleBody = document.body?.cloneNode(true);
  visibleBody?.querySelectorAll(
    [
      "script",
      "style",
      "template",
      "noscript",
      "[hidden]",
      '[aria-hidden="true"]',
      'input[type="hidden"]',
      '[class~="hidden"]',
      '[class~="invisible"]',
      '[class~="sr-only"]',
      '[style*="display: none"]',
      '[style*="display:none"]',
      '[style*="visibility: hidden"]',
      '[style*="visibility:hidden"]',
    ].join(", "),
  ).forEach((node) => node.remove());
  const visibleAnchors = [...(visibleBody?.querySelectorAll("a[href]") ?? [])].map((node) => ({
    href: node.getAttribute("href") ?? "",
    text: normalizeText(node.textContent),
  }));
  const alternates = Object.fromEntries(
    [...document.querySelectorAll('link[rel~="alternate"][hreflang]')]
      .map((node) => [
        node.getAttribute("hreflang") ?? "",
        node.getAttribute("href") ?? "",
      ])
      .filter(([locale, href]) => locale && href),
  );
  return {
    title: normalizeText(document.title),
    description: normalizeText(
      document.querySelector('meta[name="description"]')?.getAttribute("content"),
    ),
    canonical: document.querySelector('link[rel~="canonical"]')?.getAttribute("href") ?? "",
    alternates,
    robots: (document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "").toLowerCase(),
    xRobotsTag,
    visibleText: normalizeText(visibleBody?.textContent ?? ""),
    visibleAnchors,
    jsonld,
  };
}

function robotsIndexable(facts) {
  return /(?:^|[\s,])index(?:[\s,]|$)/.test(facts.robots)
    && /(?:^|[\s,])follow(?:[\s,]|$)/.test(facts.robots)
    && !facts.robots.includes("noindex")
    && !/(?:^|[\s,])(?:noindex|none)(?:[\s,]|$)/.test(facts.xRobotsTag);
}

function robotsSourceAllowsIndex(value) {
  const robots = normalizeText(value).toLowerCase();
  return !/(?:^|[\s,])(?:noindex|none)(?:[\s,]|$)/.test(robots);
}

function comparisonRobotsAuthorityPresent(payload, pageFacts) {
  const robotsPolicy = normalizeText(
    payload?.seo_surface_v1?.robots_policy ?? payload?.seo_meta?.robots,
  ).toLowerCase();
  return Boolean(robotsPolicy)
    && robotsIndexable({ robots: robotsPolicy, xRobotsTag: "" })
    && robotsIndexable({ robots: pageFacts?.robots ?? "", xRobotsTag: "" });
}

function profileRobotsAuthorityPresent(seoPayload, detailPayload, pageFacts) {
  const metaRobots = normalizeText(seoPayload?.meta?.robots).toLowerCase();
  const additionalRobotsSources = [
    seoPayload?.surface?.robots_policy ?? seoPayload?.surface?.robotsPolicy,
    detailPayload?.seo_surface_v1?.robots_policy,
    detailPayload?.mbti_public_projection_v1?.seo?.robots,
    detailPayload?.seo_meta?.robots,
  ].filter((value) => nonemptyString(value));
  return robotsIndexable({ robots: metaRobots, xRobotsTag: "" })
    && additionalRobotsSources.every(robotsSourceAllowsIndex)
    && robotsIndexable({ robots: pageFacts?.robots ?? "", xRobotsTag: "" });
}

function sameFrontendRevisionAcrossSequence(previousRun, revisionAtStart, revisionAtEnd) {
  return /^[0-9a-f]{40}$/.test(revisionAtStart)
    && revisionAtStart === revisionAtEnd
    && (
      previousRun === null
      || previousRun?.frontend_revision === revisionAtStart
    );
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
  const pageIdentities = [];
  const breadcrumbTargets = [];
  let invalid = false;
  blocks.forEach((block) => walkJson(block, (node) => {
    if (node.__invalid_jsonld) invalid = true;
    const nodeTypes = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    nodeTypes.filter(Boolean).forEach((type) => types.add(String(type)));
    if (nodeTypes.some((type) => ["AboutPage", "WebPage", "CollectionPage"].includes(type))) {
      pageIdentities.push({
        types: nodeTypes,
        id: normalizeText(node["@id"]),
        url: normalizeText(node.url),
      });
    }
    if (nodeTypes.includes("BreadcrumbList") && Array.isArray(node.itemListElement)) {
      node.itemListElement.forEach((item) => {
        const target = normalizeText(item?.item ?? item?.url);
        if (target) breadcrumbTargets.push(target);
      });
    }
    if (node["@type"] !== "FAQPage" || !Array.isArray(node.mainEntity)) return;
    node.mainEntity.forEach((question) => faq.push({
      question: normalizeText(question?.name),
      answer: normalizeText(question?.acceptedAnswer?.text),
    }));
  }));
  return {
    types: [...types].sort(),
    faq,
    pageIdentities,
    breadcrumbTargets,
    invalid,
  };
}

function comparisonProjection(payload) {
  return payload?.comparison_public_projection_v1 ?? payload?.comparison ?? {};
}

function runtimeSectionFaq(payload, kind) {
  if (kind !== "at_comparison") return [];
  return runtimeComparisonSections(payload)
    .filter((section) => section?.is_enabled !== false)
    .flatMap((section) => {
      const sectionKey = section?.section_key ?? section?.key;
      const sectionPayload = section?.payload_json ?? section?.payload ?? {};
      const rows = sectionKey === "mbti64_comparison_a_vs_t"
        ? sectionPayload?.faq
        : (sectionKey === "faq" ? sectionPayload?.items : []);
      return (Array.isArray(rows) ? rows : []).map((row) => ({
        question: normalizeText(row?.question),
        answer: normalizeText(row?.answer),
      }));
    })
    .filter((row) => row.question && row.answer);
}

function apiFaq(payload, kind) {
  const primaryRows = kind === "profile"
    ? []
    : comparisonProjection(payload)?.faq;
  const answerSurfaceRows = payload?.answer_surface_v1?.faq_blocks;
  const rows = [
    ...(Array.isArray(primaryRows) ? primaryRows : []),
    ...runtimeSectionFaq(payload, kind),
    ...(Array.isArray(answerSurfaceRows) ? answerSurfaceRows : []),
  ];
  const deduped = new Map();
  rows.map((row) => ({
      question: normalizeText(row?.question),
      answer: normalizeText(row?.answer),
    }))
    .filter((row) => row.question && row.answer)
    .forEach((row) => {
      if (!deduped.has(row.question)) deduped.set(row.question, row);
    });
  return [...deduped.values()];
}

function apiSections(payload, kind) {
  const rows = kind === "profile" ? payload?.sections : comparisonProjection(payload)?.sections;
  return Array.isArray(rows) ? rows : [];
}

function runtimeComparisonSections(payload) {
  return Array.isArray(payload?.sections)
    ? payload.sections.filter((section) => section?.is_enabled !== false)
    : [];
}

function nonemptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

function collectTextLeaves(value, results = []) {
  if (typeof value === "string") {
    const normalized = normalizeMarkdownText(value);
    if (normalized) results.push(normalized);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectTextLeaves(item, results));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectTextLeaves(item, results));
  }
  return results;
}

function normalizeMarkdownText(value) {
  return normalizeText(value)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^(?:[-+*]|\d+[.)])\s+/g, "")
    .replace(/[*_~`]+/g, "")
    .replace(/[#>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownContentBlocks(value) {
  return String(value ?? "")
    .split(/\n+/)
    .map((block) => normalizeMarkdownText(block))
    .map((block) => {
      if (/^Strengths$/i.test(block)) return "优势";
      if (/^Watch-outs$/i.test(block)) return "注意风险";
      return block;
    })
    .filter((block) => block.length >= 2);
}

function normalizeComparableText(value) {
  return normalizeText(value).replace(/([。！？.!?：；，,])\s+/g, "$1");
}

function profileSectionVisible(section, visibleText) {
  const sectionKey = section?.section_key ?? section?.key;
  const payload = section?.payload_json ?? section?.payload ?? {};
  let candidates;
  if (sectionKey === "letters_intro") {
    candidates = (Array.isArray(payload?.letters) ? payload.letters : []).flatMap((item) => [
      normalizeText(item?.letter),
      normalizeText(item?.title).replace(/\s*[（(][A-Z-]+[）)]\s*$/, ""),
      normalizeText(item?.description),
    ]).filter(Boolean);
  } else if (sectionKey === "trait_overview") {
    candidates = (Array.isArray(payload?.dimensions) ? payload.dimensions : []).flatMap((item) => [
      normalizeText(item?.summary),
      normalizeText(item?.description),
    ]).filter(Boolean);
  } else {
    candidates = markdownContentBlocks(section?.body_md);
    if (sectionKey === "v8_5_module_10_faq_boundary" && /FAQ|常见问题/.test(candidates[0] ?? "")) {
      candidates = candidates.slice(1);
    }
    if (candidates.length === 0 && nonemptyString(section?.body_html)) {
      candidates = [normalizeText(section.body_html)];
    }
  }
  const comparableVisibleText = normalizeComparableText(visibleText);
  const missingCandidates = candidates.filter((value) => (
    !comparableVisibleText.includes(normalizeComparableText(value))
  ));
  if (missingCandidates.length > 0 && DIAGNOSE_VISIBLE_BODY) {
    console.error(JSON.stringify({
      section_key: sectionKey,
      candidate_count: candidates.length,
      missing_candidate_count: missingCandidates.length,
      missing_candidate_lengths: missingCandidates.map((value) => value.length),
      missing_candidate_prefixes: missingCandidates.map((value) => value.slice(0, 40)),
    }));
  }
  return nonemptyString(sectionKey)
    && candidates.length > 0
    && missingCandidates.length === 0;
}

function comparisonSectionVisible(section, visibleText) {
  const title = normalizeText(section?.title);
  if (title.length < 2 || !visibleText.includes(title)) return false;
  const expectedValues = [
    ...(Array.isArray(section?.body) ? section.body : [section?.body]),
    ...(Array.isArray(section?.rows) ? section.rows.flatMap((row) => Object.values(row ?? {})) : []),
  ].flatMap((value) => collectTextLeaves(value));
  return expectedValues.length > 0 && expectedValues.every((value) => visibleText.includes(value));
}

function visibleCandidates(candidates, visibleText) {
  const comparableVisibleText = normalizeComparableText(visibleText);
  return candidates.length > 0 && candidates.every((candidate) => (
    comparableVisibleText.includes(normalizeComparableText(candidate))
  ));
}

function comparisonVariantVisible(variant, visibleText) {
  if (!variant || typeof variant !== "object") return false;
  const summary = normalizeText(variant?.summary_card?.summary)
    || normalizeText(variant?.hero_summary)
    || normalizeText(variant?.seo?.description);
  const candidates = [
    normalizeText(variant?.runtime_type_code),
    normalizeText(variant?.type_name) || normalizeText(variant?.display_type),
    normalizeText(variant?.nickname),
    summary,
    normalizeText(variant?.rarity),
    ...(Array.isArray(variant?.keywords) ? variant.keywords.slice(0, 3).map(normalizeText) : []),
  ].filter(Boolean);
  return candidates.length >= 2 && visibleCandidates(candidates, visibleText);
}

function comparisonBlockVisible(block, visibleText) {
  if (!block || typeof block !== "object") return false;
  const key = normalizeText(block?.key);
  const title = normalizeText(block?.title) || key;
  const assertive = normalizeText(block?.variants?.a);
  const turbulent = normalizeText(block?.variants?.t);
  const body = normalizeText(block?.body_md);
  const candidates = [
    title,
    assertive || body,
    turbulent,
  ].filter(Boolean);
  const templateKeywords = [
    "misread", "confus", "mistake", "risk", "watchout", "误", "混淆", "误判", "风险",
    "scenario", "work", "career", "relationship", "communication", "social", "love",
    "stress", "pressure", "场景", "工作", "职业", "关系", "沟通", "压力",
  ];
  if (body && templateKeywords.some((keyword) => `${key} ${title}`.toLowerCase().includes(keyword))) {
    candidates.push(body);
  }
  return Boolean(key)
    && candidates.length >= 2
    && visibleCandidates(candidates, visibleText);
}

function normalizePublicHref(value) {
  try {
    return new URL(String(value ?? ""), SITE_ORIGIN).href;
  } catch {
    return "";
  }
}

function comparisonInternalLinksVisible(projection, target, visibleText, visibleAnchors) {
  const links = Array.isArray(projection?.internal_links) ? projection.internal_links : [];
  const expectedLinkCount = RELEASED_CROSS_TYPE.includes(target.slug) ? 7 : 5;
  return links.length === expectedLinkCount && links.every((link) => {
    const label = normalizeText(link?.label);
    const reason = normalizeText(link?.reason);
    const href = normalizePublicHref(link?.href);
    const matchingAnchor = visibleAnchors.find((anchor) => (
      normalizePublicHref(anchor?.href) === href
      && normalizeComparableText(anchor?.text).includes(normalizeComparableText(label))
      && (!reason || normalizeComparableText(anchor?.text).includes(normalizeComparableText(reason)))
    ));
    return Boolean(label)
      && Boolean(href)
      && visibleCandidates([label, ...(reason ? [reason] : [])], visibleText)
      && Boolean(matchingAnchor);
  });
}

function comparisonProjectionVisible(payload, target, visibleText, visibleAnchors = []) {
  const projection = comparisonProjection(payload);
  const claimBoundary = normalizeText(projection?.claim_boundary);
  if (!claimBoundary || !visibleCandidates([claimBoundary], visibleText)) return false;
  if (target.kind === "cross_type_comparison") {
    return comparisonInternalLinksVisible(projection, target, visibleText, visibleAnchors);
  }
  if (target.kind !== "at_comparison") return true;
  const variants = projection?.variants;
  const blocks = Array.isArray(projection?.comparison_blocks)
    ? projection.comparison_blocks
    : [];
  return comparisonVariantVisible(variants?.a, visibleText)
    && comparisonVariantVisible(variants?.t, visibleText)
    && blocks.length > 0
    && blocks.every((block) => comparisonBlockVisible(block, visibleText));
}

function answerSurfaceBlockCandidates(block, { includeTitle = true, includeBody = true } = {}) {
  const title = normalizeText(block?.title);
  const body = normalizeText(block?.body);
  const href = normalizeText(block?.href);
  const linkLabel = title || (
    href.includes("/tests/mbti-personality-test-16-personality-types")
      ? "MBTI免费测试"
      : href
  );
  return [
    ...(includeTitle && linkLabel ? [linkLabel] : []),
    ...(includeBody && body ? [body] : []),
  ];
}

function requiredAnswerSurfaceCollectionsPresent(surface, kind) {
  const requiredCollections = kind === "profile"
    ? ["summary_blocks", "faq_blocks", "compare_blocks", "scene_summary_blocks", "next_step_blocks"]
    : ["summary_blocks", "faq_blocks", "compare_blocks", "next_step_blocks"];
  return requiredCollections.every((key) => (
    Array.isArray(surface?.[key]) && surface[key].length > 0
  ));
}

function answerSurfaceLinksVisible(surface, visibleAnchors) {
  const linkedBlocks = [
    ...(Array.isArray(surface?.scene_summary_blocks) ? surface.scene_summary_blocks : []),
    ...(Array.isArray(surface?.next_step_blocks) ? surface.next_step_blocks : []),
  ];
  return linkedBlocks.every((block) => {
    const href = normalizePublicHref(block?.href);
    const label = normalizeText(block?.title) || normalizeText(block?.href);
    return Boolean(href)
      && Boolean(label)
      && visibleAnchors.some((anchor) => (
        normalizePublicHref(anchor?.href) === href
        && normalizeComparableText(anchor?.text).includes(normalizeComparableText(label))
      ));
  });
}

function answerSurfaceVisible(payload, kind, visibleText, visibleAnchors = []) {
  const surface = payload?.answer_surface_v1;
  if (
    !surface
    || typeof surface !== "object"
    || !requiredAnswerSurfaceCollectionsPresent(surface, kind)
  ) {
    return false;
  }

  let candidates = [];
  if (kind === "profile") {
    candidates = [
      ...(Array.isArray(surface.summary_blocks) ? surface.summary_blocks : []),
      ...(Array.isArray(surface.compare_blocks) ? surface.compare_blocks : []),
      ...(Array.isArray(surface.scene_summary_blocks) ? surface.scene_summary_blocks : []),
      ...(Array.isArray(surface.next_step_blocks) ? surface.next_step_blocks : []),
    ].map((block) => answerSurfaceBlockCandidates(block));
  } else {
    const summaryBlocks = Array.isArray(surface.summary_blocks) ? surface.summary_blocks : [];
    const comparisonCards = [
      ...(Array.isArray(surface.compare_blocks) ? surface.compare_blocks : []),
      ...(Array.isArray(surface.scene_summary_blocks) ? surface.scene_summary_blocks : []),
    ].filter((block) => normalizeText(block?.title) && normalizeText(block?.body));
    candidates = [
      ...summaryBlocks.map((block) => answerSurfaceBlockCandidates(block)),
      ...comparisonCards.map((block) => answerSurfaceBlockCandidates(block)),
      ...(Array.isArray(surface.next_step_blocks) ? surface.next_step_blocks : [])
        .map((block) => answerSurfaceBlockCandidates(block)),
    ];
  }

  const comparableVisibleText = normalizeComparableText(visibleText);
  return candidates.every((blockCandidates) => (
    blockCandidates.length > 0
    && blockCandidates.every((value) => (
      comparableVisibleText.includes(normalizeComparableText(value))
    ))
  )) && answerSurfaceLinksVisible(surface, visibleAnchors);
}

function profileReaderVisibleSections(payload) {
  const rawSections = Array.isArray(payload?.sections) ? payload.sections : [];
  const projectionSections = Array.isArray(payload?.mbti_public_projection_v1?.sections)
    ? payload.mbti_public_projection_v1.sections
    : [];
  const v85Sections = rawSections.filter((section) => (
    PROFILE_V85_VISIBLE_SECTION_KEYS.includes(section?.section_key)
  ));
  const leadingSections = projectionSections.filter((section) => (
    PROFILE_LEADING_PROJECTION_SECTION_KEYS.includes(section?.key)
  ));
  return [...leadingSections, ...v85Sections];
}

function profileReaderSectionMembershipValid(sections) {
  const expectedKeys = [
    ...PROFILE_LEADING_PROJECTION_SECTION_KEYS,
    ...PROFILE_V85_VISIBLE_SECTION_KEYS,
  ];
  const actualKeys = sections.map((section) => section?.key ?? section?.section_key);
  return actualKeys.length === expectedKeys.length
    && new Set(actualKeys).size === expectedKeys.length
    && expectedKeys.every((key) => actualKeys.includes(key));
}

function profileHeroVisible(projection, visibleText) {
  const profile = projection?.profile ?? {};
  const requiredScalars = [
    normalizeText(projection?.display_type),
    normalizeText(profile?.type_name).replace(/型$/u, ""),
    normalizeText(profile?.hero_summary),
    normalizeText(profile?.rarity),
  ];
  const keywords = Array.isArray(profile?.keywords)
    ? profile.keywords.slice(0, 5).map(normalizeText).filter(Boolean)
    : [];
  if (requiredScalars.some((value) => !value) || keywords.length === 0) return false;
  const candidates = [
    ...requiredScalars,
    ...keywords,
  ];
  const comparableVisibleText = normalizeComparableText(visibleText);
  return candidates.length > 0 && candidates.every((candidate) => (
    comparableVisibleText.includes(normalizeComparableText(candidate))
  ));
}

function profileSeoAuthorityPresent(seoPayload, detailPayload, canonical, pageFacts) {
  if (!seoPayload || typeof seoPayload !== "object") return false;
  const meta = seoPayload?.meta ?? {};
  const seoStructured = structuredFacts([seoPayload?.jsonld]);
  const aboutPageNodes = seoStructured.pageIdentities.filter(({ types }) => (
    types.includes("AboutPage")
  ));
  return nonemptyString(meta?.title)
    && nonemptyString(meta?.description)
    && meta?.canonical === canonical
    && meta?.alternates?.["zh-CN"] === canonical
    && meta?.alternates?.en === canonical.replace("/zh/", "/en/")
    && profileRobotsAuthorityPresent(seoPayload, detailPayload, pageFacts)
    && !seoStructured.invalid
    && aboutPageNodes.length > 0
    && aboutPageNodes.every(({ id, url }) => (
      url === canonical || id === canonical || id === `${canonical}#webpage`
    ))
    && pageFacts?.title === normalizeText(meta?.title)
    && pageFacts?.description === normalizeText(meta?.description)
    && pageFacts?.canonical === meta?.canonical
    && pageFacts?.alternates?.["zh-CN"] === meta?.alternates?.["zh-CN"]
    && pageFacts?.alternates?.en === meta?.alternates?.en;
}

function comparisonIdentityPresent(comparison, target) {
  if (
    comparison?.comparison_slug !== target.slug
    || comparison?.locale !== "zh-CN"
  ) {
    return false;
  }
  if (target.kind === "at_comparison") {
    const baseType = target.slug.slice(0, 4).toUpperCase();
    return comparison?.base_type_code === baseType
      && comparison?.variants?.a?.base_type_code === baseType
      && comparison?.variants?.a?.runtime_type_code === `${baseType}-A`
      && comparison?.variants?.a?.variant_code === "A"
      && comparison?.variants?.a?.public_route_slug === `${baseType.toLowerCase()}-a`
      && comparison?.variants?.t?.base_type_code === baseType
      && comparison?.variants?.t?.runtime_type_code === `${baseType}-T`
      && comparison?.variants?.t?.variant_code === "T"
      && comparison?.variants?.t?.public_route_slug === `${baseType.toLowerCase()}-t`;
  }
  const [leftType, rightType] = target.slug.split("-vs-").map((value) => value.toUpperCase());
  return comparison?.comparison_type === "mbti_cross_type"
    && comparison?.left_type === leftType
    && comparison?.right_type === rightType
    && Array.isArray(comparison?.base_type_codes)
    && comparison.base_type_codes.length === 2
    && comparison.base_type_codes[0] === leftType
    && comparison.base_type_codes[1] === rightType;
}

function comparisonRenderedMetadataPresent(payload, pageFacts, canonical) {
  const comparison = comparisonProjection(payload);
  const title = normalizeText(payload?.seo_surface_v1?.title)
    || normalizeText(comparison?.title)
    || normalizeText(comparison?.seo_title)
    || normalizeText(payload?.seo_meta?.seo_title);
  const description = normalizeText(payload?.seo_surface_v1?.description)
    || normalizeText(comparison?.description)
    || normalizeText(comparison?.seo_description)
    || normalizeText(comparison?.summary)
    || normalizeText(payload?.seo_meta?.seo_description);
  const documentTitle = /FermatMind$/i.test(title) ? title : `${title} | FermatMind`;
  const expectedEnglishCanonical = canonical.replace("/zh/", "/en/");
  return Boolean(title)
    && Boolean(description)
    && pageFacts?.title === documentTitle
    && pageFacts?.description === description
    && comparison?.alternates?.["zh-CN"] === canonical
    && comparison?.alternates?.en === expectedEnglishCanonical
    && pageFacts?.alternates?.["zh-CN"] === canonical
    && pageFacts?.alternates?.en === expectedEnglishCanonical
    && comparisonRobotsAuthorityPresent(payload, pageFacts);
}

function authorityFacts(payload, target, canonical, seoPayload = null, pageFacts = null) {
  const sections = apiSections(payload, target.kind);
  if (target.kind === "profile") {
    const profile = payload?.profile ?? {};
    const projection = payload?.mbti_public_projection_v1 ?? {};
    const expectedTypeCode = target.slug.slice(0, 4).toUpperCase();
    const expectedVariantCode = target.slug.slice(-1).toUpperCase();
    const expectedRuntimeTypeCode = target.slug.toUpperCase();
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
      projection,
      answer_surface: payload?.answer_surface_v1,
      faq: payload?.answer_surface_v1?.faq_blocks,
      canonical: payload?.seo_meta?.canonical_url,
      robots: payload?.seo_meta?.robots,
      seo_endpoint: seoPayload,
    };
    const revisionPresent = Number.isInteger(profile.id)
      && profile.id > 0
      && profile.slug === target.slug.split("-")[0]
      && nonemptyString(profile.schema_version)
      && nonemptyString(profile.published_at)
      && nonemptyString(profile.updated_at)
      && projection.canonical_type_code === expectedTypeCode
      && projection.variant_code === expectedVariantCode
      && projection.runtime_type_code === expectedRuntimeTypeCode
      && projection.display_type === expectedRuntimeTypeCode
      && projection?._meta?.authority_source === "personality_cms_v2"
      && nonemptyString(projection?._meta?.schema_version)
      && Array.isArray(projection.sections)
      && projection.sections.length > 0
      && profileSeoAuthorityPresent(seoPayload, payload, canonical, pageFacts);
    return {
      present: profile.status === "published"
        && profile.is_public === true
        && profile.is_indexable === true
        && payload?.seo_meta?.canonical_url === canonical
        && profileSeoAuthorityPresent(seoPayload, payload, canonical, pageFacts),
      revisionPresent,
      sourceRevisionSha256: sha256(revision),
      authorityFingerprintSha256: sha256(authority),
    };
  }

  const comparison = comparisonProjection(payload);
  if (target.kind === "at_comparison") {
    const expectedOverlaySource = target.slug === "intp-a-vs-intp-t"
      ? "mbti-comp-runtime-46-intp-revision"
      : "mbti_cms_import_40_at_comparison_draft_v1";
    const expectedBaseType = target.slug.slice(0, 4).toUpperCase();
    const revision = {
      contract: comparison.comparison_contract_version,
      overlay_source: comparison.overlay_source,
      source_refs: comparison.source_refs,
    };
    const revisionPresent = comparison.comparison_contract_version === "mbti.at_comparison.v1.mbti64_overlay"
      && comparison.overlay_source?.source === expectedOverlaySource
      && nonemptyString(comparison.overlay_source?.snapshot_key)
      && comparison.overlay_source?.base_type_code === expectedBaseType
      && Array.isArray(comparison.source_refs)
      && comparison.source_refs.length > 0
      && comparison.source_refs.includes(comparison.overlay_source.snapshot_key);
    return {
      present: comparison.comparison_contract_version === "mbti.at_comparison.v1.mbti64_overlay"
        && comparison.overlay_source?.source === expectedOverlaySource
        && comparison.is_public === true
        && comparison.is_indexable === true
        && comparison.canonical_url === canonical
        && comparisonIdentityPresent(comparison, target)
        && comparisonRenderedMetadataPresent(payload, pageFacts, canonical),
      revisionPresent,
      sourceRevisionSha256: sha256(revision),
      authorityFingerprintSha256: sha256({
        projection: comparison,
        sections: runtimeComparisonSections(payload),
        answer_surface: payload?.answer_surface_v1,
        seo_meta: payload?.seo_meta,
        seo_surface: payload?.seo_surface_v1,
        jsonld: payload?.jsonld,
      }),
    };
  }

  const approvedSourceSha256 = RELEASED_CROSS_SOURCE_SHA256[target.slug];
  const revisionPresent = validSha256(comparison.source_sha256)
    && (!approvedSourceSha256 || comparison.source_sha256 === approvedSourceSha256)
    && nonemptyString(comparison.indexability_status)
    && comparison.publish_status === "published"
    && Array.isArray(comparison.source_refs)
    && comparison.source_refs.length > 0;
  return {
    present: comparison.authority_source === "database"
      && comparison.publish_status === "published"
      && comparison.review_status === "approved"
      && comparison.is_public === true
      && comparison.is_indexable === true
      && comparison.sitemap_eligible === true
      && comparison.llms_eligible === true
      && comparison.canonical_url === canonical
      && comparisonIdentityPresent(comparison, target)
      && comparisonRenderedMetadataPresent(payload, pageFacts, canonical),
    revisionPresent,
    sourceRevisionSha256: sha256({
      source_sha256: comparison.source_sha256,
      indexability_status: comparison.indexability_status,
      publish_status: comparison.publish_status,
      source_refs: comparison.source_refs,
    }),
    authorityFingerprintSha256: sha256({
      projection: comparison,
      sections: runtimeComparisonSections(payload),
      answer_surface: payload?.answer_surface_v1,
      seo_meta: payload?.seo_meta,
      seo_surface: payload?.seo_surface_v1,
      jsonld: payload?.jsonld,
    }),
  };
}

function jsonLdValid(kind, structured, canonical) {
  if (structured.invalid) return false;
  const identityMatchesCanonical = ({ id, url }) => (
    url === canonical || id === canonical || id === `${canonical}#webpage`
  );
  const requiredPageTypes = kind === "profile"
    ? ["AboutPage", "WebPage"]
    : ["CollectionPage"];
  const requiredPageNodesMatch = requiredPageTypes.every((requiredType) => {
    const nodes = structured.pageIdentities.filter(({ types }) => types.includes(requiredType));
    return nodes.length > 0 && nodes.every(identityMatchesCanonical);
  });
  const breadcrumbMatches = structured.breadcrumbTargets.includes(canonical);
  if (!requiredPageNodesMatch || !breadcrumbMatches) return false;
  if (kind === "profile") {
    return structured.types.includes("FAQPage")
      && structured.types.includes("BreadcrumbList")
      && requiredPageTypes.every((type) => structured.types.includes(type));
  }
  return ["CollectionPage", "ItemList", "BreadcrumbList", "FAQPage"]
    .every((type) => structured.types.includes(type));
}

function visibleBodyComplete(payload, target, visibleText, visibleAnchors = []) {
  const sections = apiSections(payload, target.kind);
  if (target.kind === "profile") {
    const readerVisibleSections = profileReaderVisibleSections(payload);
    const expectedReaderVisibleCount = PROFILE_LEADING_PROJECTION_SECTION_KEYS.length
      + PROFILE_V85_VISIBLE_SECTION_KEYS.length;
    const failedSectionKeys = readerVisibleSections
      .filter((section) => !profileSectionVisible(section, visibleText))
      .map((section) => section?.section_key ?? section?.key ?? "unknown");
    const complete = visibleText.length >= 5_000
      && profileReaderSectionMembershipValid(readerVisibleSections)
      && failedSectionKeys.length === 0
      && profileHeroVisible(payload?.mbti_public_projection_v1, visibleText)
      && answerSurfaceVisible(payload, target.kind, visibleText, visibleAnchors);
    if (!complete && DIAGNOSE_VISIBLE_BODY) {
      console.error(JSON.stringify({
        slug: target.slug,
        visible_text_length: visibleText.length,
        reader_visible_section_count: readerVisibleSections.length,
        expected_reader_visible_section_count: expectedReaderVisibleCount,
        failed_section_keys: failedSectionKeys,
      }));
    }
    return complete;
  }
  const runtimeSections = runtimeComparisonSections(payload);
  const requiredRuntimeSectionsPresent = target.kind !== "at_comparison"
    || runtimeSections.some((section) => (
      (section?.section_key ?? section?.key) === "mbti64_comparison_a_vs_t"
      && section?.is_enabled !== false
    ));
  return sections.length > 0
    && sections.every((section) => comparisonSectionVisible(section, visibleText))
    && requiredRuntimeSectionsPresent
    && runtimeSections.every((section) => profileSectionVisible(section, visibleText))
    && comparisonProjectionVisible(payload, target, visibleText, visibleAnchors)
    && answerSurfaceVisible(payload, target.kind, visibleText, visibleAnchors);
}

function feedUrls(body) {
  const tokens = body.match(/https:\/\/fermatmind\.com\/[^\s<>"'`)\]}]+/gi) ?? [];
  return new Set(tokens.map((token) => {
    const presentationTrimmed = token.replace(/[.,;:!]+$/u, "");
    try {
      return new URL(presentationTrimmed).href;
    } catch {
      return presentationTrimmed;
    }
  }));
}

function writeFinalValidationHold(startedAt, sessionId = null) {
  const holdReport = {
    id: "MBTI-INDEX-52",
    artifact: "MBTI-INDEX-52-FULL-55-RELEASE-GATE",
    generated_at: startedAt,
    final_decision: "HOLD_MBTI_55_INCOMPLETE",
    gsc_dependency_unblocked: false,
    required_consecutive_runs: 2,
    completed_consecutive_runs: 0,
    validation_session_id: sessionId,
    target_count: 55,
    exact_new_targets: RELEASED_CROSS_TYPE,
    failure_reason: "validation_in_progress",
    records: [],
    safety_boundary: SAFETY_BOUNDARY,
  };
  fs.writeFileSync(ARTIFACT_PATHS.reportJson, `${JSON.stringify(holdReport, null, 2)}\n`);
  fs.writeFileSync(
    ARTIFACT_PATHS.reportMarkdown,
    [
      "# MBTI-INDEX-52 Full 55 URL Release Gate",
      "",
      "- Final decision: `HOLD_MBTI_55_INCOMPLETE`",
      "- Consecutive runs complete: `0/2`",
      "- Failure reason: `validation_in_progress`",
      "",
      "The previous ALLOW evidence is invalid while the current read-only validation is in progress.",
      "",
    ].join("\n"),
  );
  fs.writeFileSync(ARTIFACT_PATHS.reportCsv, "path,kind,result,blockers\n");
}

function writeRunValidationHold(startedAt, sessionId) {
  const holdRun = {
    id: "MBTI-INDEX-52",
    artifact: `MBTI-INDEX-52-FULL-55-RELEASE-GATE-RUN-${RUN}`,
    run: RUN,
    validation_session_id: sessionId,
    sequence_state: "in_progress",
    started_at: startedAt,
    completed_at: null,
    target_count: 55,
    evidence_scope: "read_only_production_network_revalidation",
    run_decision: "HOLD_MBTI_55_INCOMPLETE",
    failure_reason: "validation_in_progress",
    records: [],
  };
  fs.writeFileSync(
    RUN === 1 ? ARTIFACT_PATHS.run1 : ARTIFACT_PATHS.run2,
    `${JSON.stringify(holdRun, null, 2)}\n`,
  );
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
if (DIAGNOSE_VISIBLE_ONLY) {
  const profileTargets = targetList.filter((target) => (
    target.kind === "profile" && (!diagnoseSlug || target.slug === diagnoseSlug)
  ));
  const profileResults = [];
  for (let offset = 0; offset < profileTargets.length; offset += MAX_CONCURRENCY) {
    const batch = profileTargets.slice(offset, offset + MAX_CONCURRENCY);
    profileResults.push(...await Promise.all(batch.map(async (target) => {
      const canonical = `${SITE_ORIGIN}/zh/personality/${target.slug}`;
      const apiUrl = `${API_ORIGIN}/${target.slug}?locale=zh-CN`;
      const [payload, page] = await Promise.all([fetchJson(apiUrl), fetchPage(canonical)]);
      const facts = documentFacts(page.html, page.xRobotsTag);
      return {
        slug: target.slug,
        visible_body: visibleBodyComplete(
          payload,
          target,
          facts.visibleText,
          facts.visibleAnchors,
        ),
      };
    })));
  }
  const failed = profileResults.filter((record) => !record.visible_body);
  console.log(JSON.stringify({
    checked_profile_count: profileResults.length,
    passed_profile_count: profileResults.length - failed.length,
    failed_profile_slugs: failed.map((record) => record.slug),
  }));
  process.exit(failed.length === 0 ? 0 : 1);
}
const runStartedAt = new Date().toISOString();
writeFinalValidationHold(runStartedAt);
let previousRun = null;
let validationSessionId = RUN === 1 ? crypto.randomUUID() : null;
if (RUN === 2) {
  let runOneDescriptor = null;
  try {
    runOneDescriptor = fs.openSync(ARTIFACT_PATHS.run1, "r+");
    previousRun = JSON.parse(fs.readFileSync(runOneDescriptor, "utf8"));
    validationSessionId = nonemptyString(previousRun?.validation_session_id)
      ? previousRun.validation_session_id
      : null;
    const consumedRun = `${JSON.stringify({
      ...previousRun,
      sequence_state: "consumed",
      consumed_by_run_2_at: runStartedAt,
    }, null, 2)}\n`;
    fs.ftruncateSync(runOneDescriptor, 0);
    fs.writeSync(runOneDescriptor, consumedRun, 0, "utf8");
    fs.fsyncSync(runOneDescriptor);
  } catch (error) {
    if (!(error && typeof error === "object" && error.code === "ENOENT")) throw error;
  } finally {
    if (runOneDescriptor !== null) fs.closeSync(runOneDescriptor);
  }
}
writeRunValidationHold(runStartedAt, validationSessionId);
writeFinalValidationHold(runStartedAt, validationSessionId);
const frontendRevisionAtStart = await fetchFrontendRevision();

const feedNames = ["sitemap.xml", "llms.txt", "llms-full.txt"];
const feedEntries = [];
for (const name of feedNames) {
  feedEntries.push([name, await fetchFeed(name)]);
}
const feeds = Object.fromEntries(feedEntries);
const feedSets = Object.fromEntries(Object.entries(feeds).map(([name, body]) => [name, feedUrls(body)]));
const privateUrlLeaks = [...new Set(Object.values(feedSets).flatMap((urls) => [...urls]))]
  .filter((url) => isSharedDiscoverabilityDeniedPath(new URL(url).pathname));

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
      const seoUrl = target.kind === "profile"
        ? `${API_ORIGIN}/${target.slug}/seo?locale=zh-CN&org_id=0&scale_code=MBTI`
        : null;
      const [payload, page, seoPayload] = await Promise.all([
        fetchJson(apiUrl),
        fetchPage(canonical),
        seoUrl ? fetchJson(seoUrl) : Promise.resolve(null),
      ]);
      const facts = documentFacts(page.html, page.xRobotsTag);
      const structured = structuredFacts(facts.jsonld);
      const faq = apiFaq(payload, target.kind);
      const schemaFaq = new Map(structured.faq.map((row) => [row.question, row.answer]));
      const authority = authorityFacts(payload, target, canonical, seoPayload, facts);
      const sectionCount = apiSections(payload, target.kind).length;
      const checks = {
        public_api: payload?.ok === true,
        authority: authority.present,
        authority_fingerprint: /^[0-9a-f]{64}$/.test(authority.authorityFingerprintSha256)
          && /^[0-9a-f]{64}$/.test(authority.sourceRevisionSha256)
          && authority.revisionPresent === true,
        visible_body: visibleBodyComplete(
          payload,
          target,
          facts.visibleText,
          facts.visibleAnchors,
        ),
        section_completeness: sectionCount === target.expectedSectionCount,
        faq: faq.length > 0 && faq.every((row) => (
          schemaFaq.get(row.question) === row.answer
          && facts.visibleText.includes(row.question)
          && facts.visibleText.includes(row.answer)
        )),
        jsonld: jsonLdValid(target.kind, structured, canonical),
        canonical: facts.canonical === canonical,
        robots_indexability: robotsIndexable(facts),
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
const frontendRevisionAtEnd = await fetchFrontendRevision();
const frontendRevisionStable = sameFrontendRevisionAcrossSequence(
  null,
  frontendRevisionAtStart,
  frontendRevisionAtEnd,
);

const evidenceRecords = targetList.map((target, index) => stableRecord(target, records[index]));
const metrics = Object.fromEntries(CHECK_KEYS.map((key) => [
  key.toUpperCase(),
  evidenceRecords.filter((record) => record.checks[key]).length,
]));
metrics.API_TIMEOUTS = 55 - metrics.API_NO_TIMEOUT;
delete metrics.API_NO_TIMEOUT;
const aggregatePassed = Object.entries(metrics).every(([key, value]) => (
  key === "API_TIMEOUTS" ? value === 0 : value === 55
)) && privateUrlLeaks.length === 0 && frontendRevisionStable;
evidenceRecords.forEach((record) => {
  if (aggregatePassed) validateRecordEvidence(record);
});
const evidenceSignature = sha256({
  target_count: 55,
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  frontend_revision: frontendRevisionAtStart,
  records: evidenceRecords,
});
const runCompletedAt = new Date().toISOString();
const runReport = {
  id: "MBTI-INDEX-52",
  artifact: `MBTI-INDEX-52-FULL-55-RELEASE-GATE-RUN-${RUN}`,
  run: RUN,
  validation_session_id: validationSessionId,
  sequence_state: RUN === 1
    ? (aggregatePassed ? "awaiting_run_2" : "failed")
    : (aggregatePassed ? "completed" : "failed"),
  started_at: runStartedAt,
  completed_at: runCompletedAt,
  target_count: 55,
  evidence_scope: "read_only_production_network_revalidation",
  run_decision: aggregatePassed ? "PASS_MBTI_55_RUN" : "HOLD_MBTI_55_INCOMPLETE",
  evidence_signature: evidenceSignature,
  frontend_revision: frontendRevisionAtStart,
  frontend_revision_stable_within_run: frontendRevisionStable,
  source_revision_set_sha256: sha256(evidenceRecords.map((record) => record.source_revision_sha256)),
  authority_fingerprint_set_sha256: sha256(evidenceRecords.map((record) => record.authority_fingerprint_sha256)),
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  records: evidenceRecords,
};
fs.writeFileSync(RUN === 1 ? ARTIFACT_PATHS.run1 : ARTIFACT_PATHS.run2, `${JSON.stringify(runReport, null, 2)}\n`);

const consecutivePass = Boolean(
  RUN === 2
  && aggregatePassed
  && previousRun?.run_decision === "PASS_MBTI_55_RUN"
  && previousRun?.sequence_state === "awaiting_run_2"
  && nonemptyString(validationSessionId)
  && previousRun?.validation_session_id === validationSessionId
  && previousRun?.target_count === 55
  && sameFrontendRevisionAcrossSequence(
    previousRun,
    frontendRevisionAtStart,
    frontendRevisionAtEnd,
  )
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
  validation_session_id: validationSessionId,
  target_count: 55,
  exact_new_targets: RELEASED_CROSS_TYPE,
  frontend_revision: frontendRevisionAtStart,
  run_1: previousRun ? {
    validation_session_id: previousRun.validation_session_id,
    started_at: previousRun.started_at,
    completed_at: previousRun.completed_at,
    decision: previousRun.run_decision,
    evidence_signature: previousRun.evidence_signature,
    frontend_revision: previousRun.frontend_revision,
    source_revision_set_sha256: previousRun.source_revision_set_sha256,
    authority_fingerprint_set_sha256: previousRun.authority_fingerprint_set_sha256,
    metrics: previousRun.metrics,
  } : (RUN === 1 ? {
    validation_session_id: validationSessionId,
    started_at: runStartedAt,
    completed_at: runCompletedAt,
    decision: runReport.run_decision,
    evidence_signature: evidenceSignature,
    frontend_revision: frontendRevisionAtStart,
    source_revision_set_sha256: runReport.source_revision_set_sha256,
    authority_fingerprint_set_sha256: runReport.authority_fingerprint_set_sha256,
    metrics,
  } : null),
  run_2: RUN === 2 ? {
    validation_session_id: validationSessionId,
    started_at: runStartedAt,
    completed_at: runCompletedAt,
    decision: runReport.run_decision,
    evidence_signature: evidenceSignature,
    frontend_revision: frontendRevisionAtStart,
    source_revision_set_sha256: runReport.source_revision_set_sha256,
    authority_fingerprint_set_sha256: runReport.authority_fingerprint_set_sha256,
    metrics,
  } : null,
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  records: evidenceRecords,
  safety_boundary: SAFETY_BOUNDARY,
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
