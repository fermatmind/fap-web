#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-04T08:30:00.000Z";
const OUT_DIR = path.join(ROOT, "docs/seo/personality");
const JSON_PATH = path.join(OUT_DIR, "mbti-seo-07-discoverability-audit-2026-07-04.json");
const MD_PATH = path.join(OUT_DIR, "mbti-seo-07-discoverability-audit-2026-07-04.md");

const REQUIRED_FILES = [
  "app/llms.txt/route.ts",
  "app/llms-full.txt/route.ts",
  "lib/seo/llmsRouteBudget.ts",
  "lib/seo/sitemapAuthorityAdapters.cjs",
  "tests/contracts/sitemap-indexability.contract.test.ts",
  "tests/contracts/mbti64-llms-full-pilot-exposure-repair.contract.test.ts",
  "tests/contracts/personality-llms-full-comparison-repair-01.contract.test.ts",
  "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
  "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json",
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertContains(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`${label} missing required token: ${needle}`);
  }
}

function assertNotContains(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`${label} contains forbidden token: ${needle}`);
  }
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    throw new Error(`required_file_missing: ${file}`);
  }
}

const llmsRoute = read("app/llms.txt/route.ts");
const llmsFullRoute = read("app/llms-full.txt/route.ts");
const budget = read("lib/seo/llmsRouteBudget.ts");
const sitemapAdapters = read("lib/seo/sitemapAuthorityAdapters.cjs");
const sitemapIndexabilityTest = read("tests/contracts/sitemap-indexability.contract.test.ts");
const llmsFullPilotTest = read("tests/contracts/mbti64-llms-full-pilot-exposure-repair.contract.test.ts");
const llmsFullComparisonRepairTest = read("tests/contracts/personality-llms-full-comparison-repair-01.contract.test.ts");
const topProfilePackage = readJson("docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json");
const comparisonPackage = readJson("docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json");

assertContains(llmsRoute, "listPersonalityProfiles({ locale: \"en\"", "llms.txt");
assertContains(llmsRoute, "listPersonalityProfiles({ locale: \"zh\"", "llms.txt");
assertContains(llmsRoute, "listPersonalityComparisons(\"en\")", "llms.txt");
assertContains(llmsRoute, "listPersonalityComparisons(\"zh\")", "llms.txt");
assertContains(llmsRoute, "item.isPublic && item.isIndexable", "llms.txt");
assertContains(llmsRoute, "Personality coverage is CMS-authoritative; do not fall back to local MBTI data here.", "llms.txt");
assertNotContains(llmsRoute, "MBTI_BASE_TYPES.map", "llms.txt");

assertContains(llmsFullRoute, "LLMS_FULL_PERSONALITY_DETAIL_URL_COUNT_PER_LOCALE = 32", "llms-full");
assertContains(llmsFullRoute, "LLMS_FULL_PERSONALITY_COMPARISON_URL_COUNT_PER_LOCALE = 16", "llms-full");
assertContains(llmsFullRoute, "LLMS_FULL_PERSONALITY_DETAIL_URL_COUNT + LLMS_FULL_PERSONALITY_COMPARISON_URL_COUNT", "llms-full");
assertContains(llmsFullRoute, "function buildPersonalityVariantEntries(", "llms-full");
assertContains(llmsFullRoute, "function buildPersonalityComparisonEntries(", "llms-full");
assertContains(llmsFullRoute, "Personality coverage is CMS-authoritative; do not fall back to local MBTI data here.", "llms-full");
assertContains(llmsFullRoute, "/zh/personality/intp-a", "llms-full");
assertContains(llmsFullRoute, "/zh/personality/istp-a", "llms-full");
assertNotContains(llmsFullRoute, "buildPersonalityComparisonSlugsFromProfiles", "llms-full");

assertContains(budget, "personalityProfiles: 64", "llmsRouteBudget");

assertContains(sitemapAdapters, "\"/en/personality\"", "sitemapAuthorityAdapters");
assertContains(sitemapAdapters, "\"/zh/personality\"", "sitemapAuthorityAdapters");
assertNotContains(sitemapAdapters, "\"/en/personality/intj-a\"", "sitemapAuthorityAdapters");
assertNotContains(sitemapAdapters, "\"/zh/personality/intj-a\"", "sitemapAuthorityAdapters");
assertContains(sitemapIndexabilityTest, "frontend sitemap config keeps backend-owned MBTI personality A/T variant routes", "sitemap-indexability");
assertContains(sitemapIndexabilityTest, "/en/personality/intp-a", "sitemap-indexability");
assertContains(sitemapIndexabilityTest, "expect(locs).not.toContain(\"/en/personality/intp\")", "sitemap-indexability");

assertContains(llmsFullPilotTest, "expect(personalityUrls.size).toBe(96)", "llms-full-pilot");
assertContains(llmsFullComparisonRepairTest, "LLMS_FULL_PERSONALITY_COMPARISON_URL_COUNT = 16 * 2", "llms-full-comparison");

const topProfileAssets = Array.isArray(topProfilePackage.assets) ? topProfilePackage.assets : [];
const comparisonAssets = Array.isArray(comparisonPackage.assets) ? comparisonPackage.assets : [];
const atComparisonAssets = comparisonAssets.filter((asset) => asset.page_type === "at_comparison");
const hotComparisonAssets = comparisonAssets.filter((asset) => asset.page_type === "hot_comparison");

const audit = {
  id: "MBTI-SEO-07",
  title: "MBTI-SEO-07: llms.txt / sitemap / discoverability audit",
  generated_at: GENERATED_AT,
  scope: {
    goal:
      "Verify MBTI personality profile and comparison discoverability through llms/sitemap authority paths without widening URL sets before content and indexability gates are ready.",
    runtime_url_expansion: false,
    sitemap_url_expansion: false,
    llms_url_expansion: false,
    cms_write_or_import: false,
    production_deploy: false,
  },
  current_authority: {
    llms_txt: {
      source: "CMS public personality APIs",
      profiles: "listPersonalityProfiles per locale, budgeted at 64 entries",
      comparisons: "listPersonalityComparisons per locale, filtered by isPublic and isIndexable",
      fallback_policy: "fail closed; no local MBTI personality fallback",
    },
    llms_full_txt: {
      source: "CMS public personality APIs plus per-entry enrichment",
      profile_cohort: "32 A/T variants per locale, 64 total",
      comparison_cohort: "16 comparison pages per locale, 32 total",
      cache_gate: "complete artifact requires the MBTI64 personality cohort unless explicitly disabled in tests",
    },
    sitemap_xml: {
      hub_paths: ["/en/personality", "/zh/personality"],
      detail_paths: "accepted only from backend sitemap-source authority when canonical/indexability gates are ready",
      no_static_detail_expansion: true,
      invalid_base_type_policy: "base 16 slugs such as /en/personality/intp are excluded from sitemap detail promotion",
    },
  },
  content_readiness_inputs: {
    top_profile_package: {
      path: "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
      asset_count: topProfileAssets.length,
    },
    comparison_package: {
      path: "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json",
      asset_count: comparisonAssets.length,
      at_comparison_count: atComparisonAssets.length,
      hot_cross_type_comparison_count: hotComparisonAssets.length,
    },
  },
  release_gates_before_url_expansion: [
    "CMS/backend import dry-run succeeds for target personality profiles or comparison pages.",
    "CMS public API marks each target route public and indexable.",
    "Backend sitemap-source emits the exact canonical route with sitemap eligibility.",
    "llms.txt and llms-full.txt include only CMS/API-authoritative public entries.",
    "No frontend local editorial fallback is added.",
    "Canonical/noindex and JSON-LD behavior remain owned by the relevant authority layer.",
  ],
  recommended_next_actions: [
    "Keep sitemap detail expansion backend-source-only in PR7.",
    "Use MBTI-OPS-08 GSC data to choose the next profile/comparison URLs before any wider llms/sitemap promotion.",
    "After CMS import/indexability gates are ready, expand the URL set in a separate scoped PR with live-source evidence.",
  ],
};

if (topProfileAssets.length < 10) {
  throw new Error(`top_profile_asset_count_too_low: ${topProfileAssets.length}`);
}

if (comparisonAssets.length !== 20 || atComparisonAssets.length !== 16 || hotComparisonAssets.length !== 4) {
  throw new Error(
    `comparison_asset_counts_unexpected: total=${comparisonAssets.length}, at=${atComparisonAssets.length}, hot=${hotComparisonAssets.length}`
  );
}

fs.writeFileSync(JSON_PATH, `${JSON.stringify(audit, null, 2)}\n`);

const md = [
  "# MBTI-SEO-07 Discoverability Audit",
  "",
  `Generated: ${GENERATED_AT}`,
  "",
  "## Decision",
  "",
  "- Runtime URL expansion: no",
  "- Sitemap URL expansion: no",
  "- llms URL expansion: no",
  "- CMS write/import: no",
  "",
  "## Current Authority",
  "",
  "- `llms.txt` enumerates personality profiles and comparisons from CMS public personality APIs.",
  "- `llms-full.txt` keeps the MBTI64 cohort at 64 A/T profile URLs plus 32 comparison URLs.",
  "- `sitemap.xml` keeps `/en/personality` and `/zh/personality` as static hub entries; detail URLs must come from backend sitemap-source authority.",
  "",
  "## Content Readiness Inputs",
  "",
  `- Top profile package assets: ${topProfileAssets.length}`,
  `- Comparison package assets: ${comparisonAssets.length} total, ${atComparisonAssets.length} A/T, ${hotComparisonAssets.length} hot cross-type`,
  "",
  "## Required Gates Before Any URL Expansion",
  "",
  ...audit.release_gates_before_url_expansion.map((item) => `- ${item}`),
  "",
].join("\n");

fs.writeFileSync(MD_PATH, `${md}\n`);

console.log(JSON.stringify({ json: path.relative(ROOT, JSON_PATH), markdown: path.relative(ROOT, MD_PATH) }, null, 2));
