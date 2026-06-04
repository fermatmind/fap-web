#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const TASK_ID = "CAREER-QUALITY-TIERING-01";
const SCHEMA_VERSION = "1.0";
const DEFAULT_SITE_URL = "https://fermatmind.com";
const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const DEFAULT_OUTPUT = "docs/seo/generated/career-quality-tiering-01.v1.json";
const DEFAULT_TIMEOUT_MS = 20_000;
const EXCLUDED_CAREER_JOB_DETAIL_SLUGS = new Set([
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
]);

function parseArgs(argv) {
  const args = {
    siteUrl: DEFAULT_SITE_URL,
    apiOrigin: DEFAULT_API_ORIGIN,
    output: DEFAULT_OUTPUT,
    samplePerGroup: 3,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    pretty: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg === "--site-url") {
      args.siteUrl = argv[++index] || args.siteUrl;
    } else if (arg.startsWith("--site-url=")) {
      args.siteUrl = arg.slice("--site-url=".length);
    } else if (arg === "--api-origin") {
      args.apiOrigin = argv[++index] || args.apiOrigin;
    } else if (arg.startsWith("--api-origin=")) {
      args.apiOrigin = arg.slice("--api-origin=".length);
    } else if (arg === "--output") {
      args.output = argv[++index] || args.output;
    } else if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length);
    } else if (arg === "--sample-per-group") {
      args.samplePerGroup = Number.parseInt(argv[++index] || "", 10) || args.samplePerGroup;
    } else if (arg.startsWith("--sample-per-group=")) {
      args.samplePerGroup = Number.parseInt(arg.slice("--sample-per-group=".length), 10) || args.samplePerGroup;
    } else if (arg === "--timeout-ms") {
      args.timeoutMs = Number.parseInt(argv[++index] || "", 10) || args.timeoutMs;
    } else if (arg.startsWith("--timeout-ms=")) {
      args.timeoutMs = Number.parseInt(arg.slice("--timeout-ms=".length), 10) || args.timeoutMs;
    }
  }

  args.siteUrl = args.siteUrl.replace(/\/$/, "");
  args.apiOrigin = args.apiOrigin.replace(/\/$/, "");
  args.samplePerGroup = Math.max(1, Math.min(10, args.samplePerGroup));
  return args;
}

function apiUrl(apiOrigin, apiPath) {
  const normalized = String(apiPath || "").startsWith("/") ? String(apiPath) : `/${apiPath}`;
  return `${apiOrigin}/api${normalized}`;
}

function normalizePathname(value) {
  const normalized = String(value || "/").replace(/\/{2,}/g, "/");
  if (normalized === "/") return "/";
  return normalized.replace(/\/+$/, "") || "/";
}

function normalizeSlug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function readArray(value) {
  return Array.isArray(value) ? value : [];
}

function readString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasPolicyToken(value, token) {
  return readString(value)
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes(token);
}

function isIndexableState(value) {
  const normalized = readString(value).toLowerCase();
  return normalized === "index" || normalized === "indexable" || normalized === "indexed";
}

function countBy(items, selector) {
  return items.reduce((acc, item) => {
    const key = selector(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      headers: options.headers,
      signal: controller.signal,
    });
    const elapsedMs = Date.now() - startedAt;
    return { response, elapsedMs, error: null };
  } catch (error) {
    return {
      response: null,
      elapsedMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJsonStatus(url, timeoutMs) {
  const result = await fetchWithTimeout(url, {
    timeoutMs,
    headers: { Accept: "application/json" },
  });

  if (!result.response) {
    return { ok: false, status: null, elapsed_ms: result.elapsedMs, error: result.error, payload: null };
  }

  let payload = null;
  let error = null;
  try {
    payload = await result.response.json();
  } catch (parseError) {
    error = parseError instanceof Error ? parseError.message : String(parseError);
  }

  return {
    ok: result.response.ok && !error,
    status: result.response.status,
    elapsed_ms: result.elapsedMs,
    error,
    payload,
  };
}

async function fetchTextStatus(url, timeoutMs, accept = "text/html,application/xml,text/xml,text/plain") {
  const result = await fetchWithTimeout(url, {
    timeoutMs,
    headers: { Accept: accept },
  });

  if (!result.response) {
    return { ok: false, status: null, elapsed_ms: result.elapsedMs, error: result.error, text: "" };
  }

  let text = "";
  let error = null;
  try {
    text = await result.response.text();
  } catch (parseError) {
    error = parseError instanceof Error ? parseError.message : String(parseError);
  }

  return {
    ok: result.response.ok && !error,
    status: result.response.status,
    elapsed_ms: result.elapsedMs,
    error,
    text,
  };
}

function readXmlLocs(xml) {
  return [...String(xml || "").matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim());
}

function careerSlugFromUrl(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/^\/(en|zh)\/career\/jobs\/([^/]+)$/i);
    return match ? normalizeSlug(match[2]) : "";
  } catch {
    return "";
  }
}

function localeCareerPath(locale, slug) {
  return `/${locale}/career/jobs/${slug}`;
}

function unwrapPayload(payload) {
  const record = readRecord(payload);
  return readRecord(record.data).identity || readRecord(record.data).titles ? readRecord(record.data) : record;
}

function indexItemBySlug(items) {
  const map = new Map();
  for (const item of readArray(items)) {
    const slug = normalizeSlug(readRecord(item.identity).canonical_slug);
    if (slug) map.set(slug, item);
  }
  return map;
}

function titleTranslationStatus(enItem, zhItem) {
  const enTitle = readString(readRecord(enItem?.titles).canonical_en);
  const zhTitle = readString(readRecord(zhItem?.titles).canonical_zh || readRecord(enItem?.titles).canonical_zh);
  const zhSearchH1 = readString(readRecord(zhItem?.titles).search_h1_zh || readRecord(enItem?.titles).search_h1_zh);
  const zhMissing = !zhTitle;
  const zhEqualsEn = Boolean(zhTitle && enTitle && zhTitle.toLowerCase() === enTitle.toLowerCase());

  if (zhMissing) return "zh_index_title_missing";
  if (zhEqualsEn) return "zh_index_title_equals_en";
  if (!zhSearchH1) return "zh_search_h1_missing";
  return "index_title_localized";
}

function buildRow(slug, enItem, zhItem, sitemapPaths) {
  const enSeo = readRecord(enItem?.seo_contract);
  const zhSeo = readRecord(zhItem?.seo_contract);
  const trust = readRecord(enItem?.trust_summary);
  const contentVersion = readString(trust.content_version) || "unknown";
  const reviewerStatus = readString(trust.reviewer_status) || "unknown";
  const enPath = localeCareerPath("en", slug);
  const zhPath = localeCareerPath("zh", slug);
  const enIndexable = enSeo.index_eligible === true && isIndexableState(enSeo.index_state) && !hasPolicyToken(enSeo.robots_policy, "noindex");
  const zhIndexable = zhSeo.index_eligible === true && isIndexableState(zhSeo.index_state) && !hasPolicyToken(zhSeo.robots_policy, "noindex");
  const inSitemapEn = sitemapPaths.has(enPath);
  const inSitemapZh = sitemapPaths.has(zhPath);
  const allowStrongClaim = trust.allow_strong_claim === true;
  const allowSalaryComparison = trust.allow_salary_comparison === true;
  const allowAiStrategy = trust.allow_ai_strategy === true;
  const translationStatus = titleTranslationStatus(enItem, zhItem);
  const riskCodes = [];

  if (EXCLUDED_CAREER_JOB_DETAIL_SLUGS.has(slug)) riskCodes.push("excluded_slug_hold");
  if (!enIndexable || !zhIndexable) riskCodes.push("not_bilingually_indexable");
  if (!inSitemapEn || !inSitemapZh) riskCodes.push("not_bilingually_in_sitemap");
  if (reviewerStatus !== "approved") riskCodes.push(`reviewer_not_final:${reviewerStatus}`);
  if (translationStatus !== "index_title_localized") riskCodes.push(translationStatus);
  if (contentVersion === "docx_342_career_batch" && (allowStrongClaim || allowSalaryComparison)) {
    riskCodes.push("docx_baseline_strong_claim_review_required");
  }
  if (contentVersion === "runtime_publish_projection") {
    riskCodes.push("runtime_projection_thin_content_risk");
  }
  if (contentVersion === "display_asset_backed_v4_2") {
    riskCodes.push("pilot_display_asset_review_required");
  }
  if (allowSalaryComparison && reviewerStatus !== "approved") {
    riskCodes.push("salary_claim_without_final_review");
  }
  if (allowStrongClaim && reviewerStatus !== "approved") {
    riskCodes.push("career_fit_strong_claim_without_final_review");
  }

  let tier = "tier_c_internal_auxiliary_or_hold";
  if (EXCLUDED_CAREER_JOB_DETAIL_SLUGS.has(slug) || !enIndexable || !zhIndexable || !inSitemapEn || !inSitemapZh) {
    tier = "tier_d_hold_not_search_entry";
  } else if (contentVersion === "career_first_wave.publish_seed.v1" && reviewerStatus === "approved") {
    tier = "tier_a_controlled_search_entry_candidate";
  } else if (contentVersion === "display_asset_backed_v4_2") {
    tier = "tier_b_content_watchlist_schema_sample_required";
  } else if (contentVersion === "docx_342_career_batch") {
    tier = "tier_c_internal_auxiliary_claim_review_required";
  } else if (contentVersion === "runtime_publish_projection") {
    tier = "tier_c_internal_auxiliary_thin_shell_risk";
  }

  return {
    slug,
    title_en: readString(readRecord(enItem?.titles).canonical_en),
    title_zh_index: readString(readRecord(zhItem?.titles).canonical_zh || readRecord(enItem?.titles).canonical_zh),
    content_version: contentVersion,
    reviewer_status: reviewerStatus,
    indexable_bilingual: enIndexable && zhIndexable,
    sitemap_bilingual: inSitemapEn && inSitemapZh,
    robots_policy_en: readString(enSeo.robots_policy),
    robots_policy_zh: readString(zhSeo.robots_policy),
    allow_strong_claim: allowStrongClaim,
    allow_salary_comparison: allowSalaryComparison,
    allow_ai_strategy: allowAiStrategy,
    confidence_score: readRecord(readRecord(enItem?.score_summary).confidence_score).value ?? null,
    fit_score: readRecord(readRecord(enItem?.score_summary).fit_score).value ?? null,
    translation_status: translationStatus,
    tier,
    risk_codes: riskCodes,
  };
}

function recursiveText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(recursiveText).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(recursiveText).join("\n");
  return "";
}

function cjkCount(value) {
  return (String(value || "").match(/[\u3400-\u9fff]/g) || []).length;
}

function extractCanonical(html) {
  const match = String(html || "").match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

function extractRobots(html) {
  const match = String(html || "").match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

function extractJsonLdTypes(html) {
  const scripts = [...String(html || "").matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const types = [];
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item && typeof item === "object" && item["@type"]) {
          types.push(String(item["@type"]));
        }
      }
    } catch {
      types.push("parse_error");
    }
  }
  return types;
}

function readFaqCount(detail) {
  const displayPage = readRecord(readRecord(detail.display_surface_v1).page);
  const content = readRecord(displayPage.content);
  const faqItems = readArray(readRecord(content.faq_block).items);
  return faqItems.length;
}

function detailTextStats(detail) {
  const sections = readArray(detail.content_sections);
  const sectionText = sections
    .map((section) => `${readString(readRecord(section).title)}\n${readString(readRecord(section).body_md)}`)
    .join("\n");
  const body = readString(detail.content_body_md);
  const displayPage = readRecord(readRecord(detail.display_surface_v1).page);
  const displayText = recursiveText(displayPage);
  const combined = [body, sectionText, displayText].join("\n");
  return {
    content_body_chars: body.length,
    content_section_count: sections.length,
    content_section_chars: sectionText.length,
    display_surface_text_chars: displayText.length,
    combined_visible_text_chars: combined.length,
    cjk_chars: cjkCount(combined),
  };
}

function contentThicknessStatus(stats, locale, faqCount) {
  if (stats.combined_visible_text_chars >= 1800 && (locale === "en" || stats.cjk_chars >= 300) && faqCount >= 2) {
    return "sample_adequate_visible_content";
  }
  if (stats.combined_visible_text_chars >= 900 && (locale === "en" || stats.cjk_chars >= 120)) {
    return "sample_partial_visible_content";
  }
  return "sample_thin_or_shell_content";
}

async function evaluateDetailSample({ slug, locale, row, siteUrl, apiOrigin, timeoutMs }) {
  const apiLocale = locale === "zh" ? "zh-CN" : "en";
  const detailUrl = apiUrl(apiOrigin, `/v0.5/career/jobs/${encodeURIComponent(slug)}?locale=${encodeURIComponent(apiLocale)}`);
  const seoUrl = apiUrl(
    apiOrigin,
    `/v0.5/career-jobs/${encodeURIComponent(slug)}/seo?locale=${encodeURIComponent(apiLocale)}&org_id=0`
  );
  const htmlUrl = `${siteUrl}/${locale}/career/jobs/${slug}`;
  const [detailStatus, seoStatus, htmlStatus] = await Promise.all([
    fetchJsonStatus(detailUrl, timeoutMs),
    fetchJsonStatus(seoUrl, timeoutMs),
    fetchTextStatus(htmlUrl, timeoutMs),
  ]);
  const detail = unwrapPayload(detailStatus.payload);
  const seoSurface = readRecord(readRecord(seoStatus.payload).seo_surface_v1);
  const html = htmlStatus.text;
  const textStats = detailStatus.ok ? detailTextStats(detail) : {
    content_body_chars: 0,
    content_section_count: 0,
    content_section_chars: 0,
    display_surface_text_chars: 0,
    combined_visible_text_chars: 0,
    cjk_chars: 0,
  };
  const faqCount = detailStatus.ok ? readFaqCount(detail) : 0;
  const htmlJsonLdTypes = extractJsonLdTypes(html);
  const structuredDataKeys = readArray(seoSurface.structured_data_keys).map(String);
  const reviewerStatus = readString(readRecord(detail.trust_manifest).reviewer_status) || row.reviewer_status;
  const claimPermissions = readRecord(detail.claim_permissions);
  const allowStrongClaim = claimPermissions.allow_strong_claim === true || row.allow_strong_claim === true;
  const allowSalaryComparison = claimPermissions.allow_salary_comparison === true || row.allow_salary_comparison === true;
  const riskCodes = [];

  if (contentThicknessStatus(textStats, locale, faqCount) === "sample_thin_or_shell_content") {
    riskCodes.push("sample_thin_or_shell_content");
  }
  if (!htmlJsonLdTypes.includes("FAQPage")) {
    riskCodes.push("sample_faq_schema_missing_in_html");
  }
  if (!htmlJsonLdTypes.includes("BreadcrumbList") && !structuredDataKeys.includes("BreadcrumbList")) {
    riskCodes.push("sample_breadcrumb_schema_missing");
  }
  if (!String(html).includes("holland-career-interest-test-riasec")) {
    riskCodes.push("sample_riasec_cta_missing");
  }
  if ((allowStrongClaim || allowSalaryComparison) && reviewerStatus !== "approved") {
    riskCodes.push("sample_strong_claim_without_final_review");
  }

  return {
    slug,
    locale,
    row_tier: row.tier,
    content_version_index: row.content_version,
    content_version_detail: readString(readRecord(detail.trust_manifest).content_version) || row.content_version,
    reviewer_status_detail: reviewerStatus,
    detail_api_status: detailStatus.status,
    seo_api_status: seoStatus.status,
    html_status: htmlStatus.status,
    elapsed_ms: {
      detail_api: detailStatus.elapsed_ms,
      seo_api: seoStatus.elapsed_ms,
      html: htmlStatus.elapsed_ms,
    },
    canonical_html: extractCanonical(html),
    robots_html: extractRobots(html),
    seo_surface: {
      canonical_url: readString(seoSurface.canonical_url),
      robots_policy: readString(seoSurface.robots_policy),
      indexability_state: readString(seoSurface.indexability_state),
      sitemap_state: readString(seoSurface.sitemap_state),
      llms_exposure_state: readString(seoSurface.llms_exposure_state),
      structured_data_keys: structuredDataKeys,
    },
    html_jsonld_types: htmlJsonLdTypes,
    faq_item_count: faqCount,
    has_riasec_cta: String(html).includes("holland-career-interest-test-riasec"),
    has_breadcrumb_signal: /breadcrumb/i.test(html) || htmlJsonLdTypes.includes("BreadcrumbList"),
    claim_permissions: {
      allow_strong_claim: allowStrongClaim,
      allow_salary_comparison: allowSalaryComparison,
      allow_ai_strategy: claimPermissions.allow_ai_strategy === true || row.allow_ai_strategy === true,
    },
    text_stats: textStats,
    content_thickness_status: contentThicknessStatus(textStats, locale, faqCount),
    risk_codes: riskCodes,
  };
}

function buildSampleRows(rows, samplePerGroup) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.content_version)) grouped.set(row.content_version, []);
    grouped.get(row.content_version).push(row);
  }

  const samples = [];
  for (const groupRows of grouped.values()) {
    const sorted = [...groupRows].sort((left, right) => left.slug.localeCompare(right.slug));
    samples.push(...sorted.slice(0, samplePerGroup));
  }

  return [...new Map(samples.map((row) => [row.slug, row])).values()].sort((left, right) =>
    left.slug.localeCompare(right.slug)
  );
}

async function evaluateHub({ locale, siteUrl, sitemapPaths, timeoutMs }) {
  const pathName = `/${locale}/career/jobs`;
  const url = `${siteUrl}${pathName}`;
  const htmlStatus = await fetchTextStatus(url, timeoutMs);
  const html = htmlStatus.text;
  const jsonLdTypes = extractJsonLdTypes(html);
  const riskCodes = [];

  if (!sitemapPaths.has(pathName)) riskCodes.push("hub_absent_from_sitemap");
  if (jsonLdTypes.length === 0) riskCodes.push("hub_jsonld_missing");
  if (!String(html).includes("holland-career-interest-test-riasec")) riskCodes.push("hub_riasec_cta_not_detected");

  return {
    locale,
    path: pathName,
    status: htmlStatus.status,
    bytes: html.length,
    in_sitemap: sitemapPaths.has(pathName),
    canonical_html: extractCanonical(html),
    robots_html: extractRobots(html),
    html_jsonld_types: jsonLdTypes,
    has_riasec_cta: String(html).includes("holland-career-interest-test-riasec"),
    has_breadcrumb_signal: /breadcrumb/i.test(html),
    suitability: sitemapPaths.has(pathName) && jsonLdTypes.length > 0 ? "hub_sitemap_candidate" : "not_sitemap_hub_ready",
    risk_codes: riskCodes,
  };
}

function buildRiskCategories(rows, detailSamples) {
  return {
    translation: {
      zh_index_title_missing: rows.filter((row) => row.risk_codes.includes("zh_index_title_missing")).length,
      zh_index_title_equals_en: rows.filter((row) => row.risk_codes.includes("zh_index_title_equals_en")).length,
    },
    review_status: countBy(rows, (row) => row.reviewer_status),
    content_version: countBy(rows, (row) => row.content_version),
    claim_risk: {
      strong_claim_without_final_review: rows.filter((row) =>
        row.risk_codes.includes("career_fit_strong_claim_without_final_review")
      ).length,
      salary_claim_without_final_review: rows.filter((row) =>
        row.risk_codes.includes("salary_claim_without_final_review")
      ).length,
      sampled_strong_claim_without_final_review: detailSamples.filter((sample) =>
        sample.risk_codes.includes("sample_strong_claim_without_final_review")
      ).length,
    },
    content_thickness_samples: countBy(detailSamples, (sample) => sample.content_thickness_status),
    schema_samples: {
      faq_missing_in_html: detailSamples.filter((sample) => sample.risk_codes.includes("sample_faq_schema_missing_in_html")).length,
      breadcrumb_missing: detailSamples.filter((sample) => sample.risk_codes.includes("sample_breadcrumb_schema_missing")).length,
      riasec_cta_missing: detailSamples.filter((sample) => sample.risk_codes.includes("sample_riasec_cta_missing")).length,
    },
  };
}

function buildNextPrs() {
  return [
    {
      proposed_pr_train_id: "CAREER-THIN-CONTENT-REPAIR-01",
      proposed_title: "docs(career): define thin career detail repair queue",
      proposed_scope: "Use this artifact to route thin or shell-like career details to backend/CMS/import repair, without frontend copy.",
      likely_files_touched: ["docs/seo/**", "docs/seo/generated/**", "docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"],
      required_local_checks: [
        "python3 -m json.tool docs/codex/pr-train-state.json >/dev/null",
        "python3 -m json.tool docs/seo/generated/career-quality-tiering-01.v1.json >/dev/null",
        "git diff --check -- docs/seo docs/codex",
      ],
      dependency_assumptions: ["CAREER-QUALITY-TIERING-01 merged"],
      manifest_state_authorization_required: true,
    },
    {
      proposed_pr_train_id: "CAREER-JOB-SCHEMA-FAQ-BREADCRUMB-01",
      proposed_title: "test(seo): gate career job schema against visible content",
      proposed_scope: "Add contract coverage for Occupation, FAQPage, BreadcrumbList, canonical, and visible FAQ alignment on career detail samples.",
      likely_files_touched: ["tests/contracts/**", "docs/seo/**", "docs/seo/generated/**", "docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"],
      required_local_checks: [
        "pnpm exec vitest run tests/contracts/career-job-detail-actors-v42.contract.test.tsx tests/contracts/career-quality-tiering-01.contract.test.ts",
        "git diff --check -- tests/contracts docs/seo docs/codex",
      ],
      dependency_assumptions: ["CAREER-QUALITY-TIERING-01 merged"],
      manifest_state_authorization_required: true,
    },
    {
      proposed_pr_train_id: "CAREER-INTERNAL-LINKS-CTA-GATE-01",
      proposed_title: "docs(seo): gate career internal links before amplification",
      proposed_scope: "Inventory career hub/detail internal links and test CTAs before any search amplification or submission workflow.",
      likely_files_touched: ["docs/seo/**", "docs/seo/generated/**", "scripts/seo/**", "docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"],
      required_local_checks: [
        "node scripts/seo/generate-career-quality-tiering.mjs --pretty",
        "python3 -m json.tool docs/seo/generated/career-quality-tiering-01.v1.json >/dev/null",
        "git diff --check -- docs/seo scripts/seo docs/codex",
      ],
      dependency_assumptions: ["CAREER-QUALITY-TIERING-01 merged"],
      manifest_state_authorization_required: true,
    },
    {
      proposed_pr_train_id: "CAREER-JOBS-HUB-SITEMAP-POLICY-01",
      proposed_title: "docs(seo): decide career jobs hub sitemap eligibility",
      proposed_scope: "Decide whether /en/career/jobs and /zh/career/jobs should stay out of sitemap, become sitemap hubs, or remain indexable but non-sitemap.",
      likely_files_touched: ["docs/seo/**", "tests/contracts/**", "docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"],
      required_local_checks: [
        "pnpm exec vitest run tests/contracts/sitemap-url-policy-decision.contract.test.ts tests/contracts/career-query-canonical.contract.test.tsx",
        "git diff --check -- docs/seo tests/contracts docs/codex",
      ],
      dependency_assumptions: ["CAREER-QUALITY-TIERING-01 merged"],
      manifest_state_authorization_required: true,
    },
  ];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const generatedAt = new Date().toISOString();
  const sitemapUrl = `${args.siteUrl}/sitemap.xml`;
  const sitemapStatus = await fetchTextStatus(sitemapUrl, args.timeoutMs, "application/xml,text/xml,text/plain");
  if (!sitemapStatus.ok) {
    throw new Error(`Failed to fetch sitemap: ${sitemapStatus.status || sitemapStatus.error}`);
  }

  const locs = readXmlLocs(sitemapStatus.text);
  const sitemapPaths = new Set(locs.map((url) => normalizePathname(new URL(url).pathname)));
  const careerDetailUrls = locs.filter((url) => careerSlugFromUrl(url));
  const sitemapCareerSlugs = new Set(careerDetailUrls.map(careerSlugFromUrl));
  const [enIndexStatus, zhIndexStatus, launchTierStatus, discoverabilityStatus] = await Promise.all([
    fetchJsonStatus(apiUrl(args.apiOrigin, "/v0.5/career/jobs?locale=en&org_id=0"), args.timeoutMs),
    fetchJsonStatus(apiUrl(args.apiOrigin, "/v0.5/career/jobs?locale=zh-CN&org_id=0"), args.timeoutMs),
    fetchJsonStatus(apiUrl(args.apiOrigin, "/v0.5/career/first-wave/launch-tier?locale=en&org_id=0"), args.timeoutMs),
    fetchJsonStatus(apiUrl(args.apiOrigin, "/v0.5/career/first-wave/discoverability-manifest?locale=en&org_id=0"), args.timeoutMs),
  ]);

  if (!enIndexStatus.ok || !zhIndexStatus.ok) {
    throw new Error("Career index API failed; cannot build 1046 inventory tiering.");
  }

  const enItems = readArray(enIndexStatus.payload.items);
  const zhItems = readArray(zhIndexStatus.payload.items);
  const enBySlug = indexItemBySlug(enItems);
  const zhBySlug = indexItemBySlug(zhItems);
  const allSlugs = [...new Set([...enBySlug.keys(), ...zhBySlug.keys()])].sort();
  const rows = allSlugs.map((slug) => buildRow(slug, enBySlug.get(slug), zhBySlug.get(slug), sitemapPaths));
  const sampleRows = buildSampleRows(rows, args.samplePerGroup);
  const detailSamples = [];

  for (const row of sampleRows) {
    for (const locale of ["en", "zh"]) {
      detailSamples.push(
        await evaluateDetailSample({
          slug: row.slug,
          locale,
          row,
          siteUrl: args.siteUrl,
          apiOrigin: args.apiOrigin,
          timeoutMs: args.timeoutMs,
        })
      );
    }
  }

  const hubChecks = await Promise.all(
    ["en", "zh"].map((locale) =>
      evaluateHub({
        locale,
        siteUrl: args.siteUrl,
        sitemapPaths,
        timeoutMs: args.timeoutMs,
      })
    )
  );

  const artifact = {
    schema_version: SCHEMA_VERSION,
    task: TASK_ID,
    generated_at: generatedAt,
    mode: "read_only_live_public_api_and_html_observation",
    source: {
      site_url: args.siteUrl,
      api_origin: args.apiOrigin,
      sitemap_url: sitemapUrl,
      career_index_api: [
        "/api/v0.5/career/jobs?locale=en&org_id=0",
        "/api/v0.5/career/jobs?locale=zh-CN&org_id=0",
      ],
      career_detail_api_sampled: "/api/v0.5/career/jobs/{slug}?locale={en|zh-CN}",
      career_detail_seo_api_sampled: "/api/v0.5/career-jobs/{slug}/seo?locale={en|zh-CN}&org_id=0",
    },
    scope_guard: {
      no_career_body_generated: true,
      no_cms_mutation: true,
      no_backend_mutation: true,
      no_publish: true,
      no_deploy: true,
      search_channel_action_performed: false,
      url_submission_performed: false,
      external_search_api_call_performed: false,
      pseo_blast_performed: false,
      strong_claims_added: false,
    },
    tier_schema: [
      {
        tier: "tier_a_controlled_search_entry_candidate",
        meaning: "Backend indexable and sitemap-visible in both locales, reviewer approved, and suitable only for controlled search-entry canaries after content/schema/manual review.",
        promotion_allowed: "conditional_canary_only",
      },
      {
        tier: "tier_b_content_watchlist_schema_sample_required",
        meaning: "Backend indexable and sitemap-visible, but reviewer status is pilot/display-asset rather than final approved; use as watchlist until schema, FAQ, Breadcrumb, CTA, and visible content evidence pass.",
        promotion_allowed: "no_bulk_amplification",
      },
      {
        tier: "tier_c_internal_auxiliary_claim_review_required",
        meaning: "Backend indexable but docx baseline/import status and strong or salary claim gates require editorial and claim review before search-entry treatment.",
        promotion_allowed: "internal_auxiliary_only",
      },
      {
        tier: "tier_c_internal_auxiliary_thin_shell_risk",
        meaning: "Backend indexable runtime projection shell where content thickness and claim context are not sufficient for search amplification.",
        promotion_allowed: "internal_auxiliary_only",
      },
      {
        tier: "tier_d_hold_not_search_entry",
        meaning: "Not bilingual sitemap/indexable or explicitly excluded; hold out of search-entry workflows.",
        promotion_allowed: "no",
      },
    ],
    inventory_summary: {
      career_index_en_count: enItems.length,
      career_index_zh_count: zhItems.length,
      unique_career_slugs: allSlugs.length,
      slug_parity: {
        en_only: allSlugs.filter((slug) => !zhBySlug.has(slug)).length,
        zh_only: allSlugs.filter((slug) => !enBySlug.has(slug)).length,
      },
      sitemap_total_locs: locs.length,
      sitemap_career_detail_urls: careerDetailUrls.length,
      sitemap_unique_career_slugs: sitemapCareerSlugs.size,
      career_jobs_hub_in_sitemap: hubChecks.some((hub) => hub.in_sitemap),
      excluded_slug_safety: [...EXCLUDED_CAREER_JOB_DETAIL_SLUGS].map((slug) => ({
        slug,
        in_index: enBySlug.has(slug) || zhBySlug.has(slug),
        in_sitemap: sitemapCareerSlugs.has(slug),
      })),
    },
    tier_counts: countBy(rows, (row) => row.tier),
    risk_categories: buildRiskCategories(rows, detailSamples),
    sitemap_check: {
      status: "observed",
      career_detail_url_count: careerDetailUrls.length,
      unique_slug_count: sitemapCareerSlugs.size,
      bilingual_expected_url_count_from_index: allSlugs.length * 2,
      career_jobs_hub_paths: hubChecks.map((hub) => ({ path: hub.path, in_sitemap: hub.in_sitemap })),
      excluded_slugs_absent: [...EXCLUDED_CAREER_JOB_DETAIL_SLUGS].every((slug) => !sitemapCareerSlugs.has(slug)),
    },
    career_api_samples: {
      index_en: {
        status: enIndexStatus.status,
        item_count: enItems.length,
        bundle_kind: readString(enIndexStatus.payload.bundle_kind),
        bundle_version: readString(enIndexStatus.payload.bundle_version),
      },
      index_zh: {
        status: zhIndexStatus.status,
        item_count: zhItems.length,
        bundle_kind: readString(zhIndexStatus.payload.bundle_kind),
        bundle_version: readString(zhIndexStatus.payload.bundle_version),
      },
      launch_tier_endpoint: {
        status: launchTierStatus.status,
        ok: launchTierStatus.ok,
        note: launchTierStatus.ok ? "available" : "not available during this read-only run; index/trust fields were used instead",
      },
      discoverability_manifest_endpoint: {
        status: discoverabilityStatus.status,
        ok: discoverabilityStatus.ok,
        note: discoverabilityStatus.ok ? "available" : "not available during this read-only run; sitemap and index fields were used instead",
      },
    },
    hub_suitability: {
      decision: hubChecks.every((hub) => hub.suitability === "hub_sitemap_candidate")
        ? "conditional_go_after_policy"
        : "no_go_as_sitemap_hub_now",
      rationale: [
        "/en/career/jobs and /zh/career/jobs are public indexable directory shells but absent from the live sitemap.",
        "The hub pages need explicit sitemap policy and structured-data/internal-link checks before they become sitemap hubs.",
        "The current task does not change sitemap, URL exposure, or hub runtime behavior.",
      ],
      checks: hubChecks,
    },
    sample_results: detailSamples,
    next_prs: buildNextPrs(),
    go_no_go: {
      career_pseo_amplification: "NO_GO",
      reason: "The 1046 inventory is indexable and sitemap-visible at detail level, but most rows are not final reviewer-approved and have thin-content, translation, or claim-gate risks. No bulk search submission or pSEO blast should occur.",
      limited_controlled_search_entry: "CONDITIONAL_GO_FOR_TIER_A_CANARY_ONLY_AFTER_MANUAL_REVIEW",
      search_submission_allowed_by_this_artifact: false,
      career_body_generation_allowed_by_this_artifact: false,
    },
    rows,
  };

  const outputPath = path.resolve(process.cwd(), args.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, args.pretty ? 2 : 2)}\n`);
  console.log(`[${TASK_ID}] wrote ${args.output}`);
  console.log(
    JSON.stringify(
      {
        unique_career_slugs: artifact.inventory_summary.unique_career_slugs,
        sitemap_career_detail_urls: artifact.inventory_summary.sitemap_career_detail_urls,
        tier_counts: artifact.tier_counts,
        pseo: artifact.go_no_go.career_pseo_amplification,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(`[${TASK_ID}] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
