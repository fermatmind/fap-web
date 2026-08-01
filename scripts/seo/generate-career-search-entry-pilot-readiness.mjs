#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const TASK_ID = "CAREER-SEARCH-ENTRY-PILOT-READINESS-01";
export const SCHEMA_VERSION = "career.search_entry_pilot_readiness.v1";
export const EXACT_SLUG_COUNT = 10;
export const EXACT_URL_COUNT = 20;

const DEFAULT_SITE_URL = "https://fermatmind.com";
const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const DEFAULT_OUTPUT = "docs/seo/generated/career-search-entry-pilot-readiness-01.v1.json";
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_CONCURRENCY = 6;
const REVIEW_MAX_AGE_DAYS = 366;
const TIER_RANK = { stable: 0, approved_candidate: 1 };
const GUARANTEE_PATTERNS = [
  /\bguarante(?:e|ed|es)\s+(?:a\s+)?(?:salary|income|job|hiring|employment|career success|success)\b/i,
  /\b(?:salary|income|job|hiring|employment|career success|success)\s+(?:is\s+)?guaranteed\b/i,
  /(?:保证|保障|承诺)[^。！？\n]{0,12}(?:薪资|收入|录用|就业|职业成功)/,
  /(?:薪资|收入|录用|就业|职业成功)[^。！？\n]{0,12}(?:有保证|获保证|被保证|保障|承诺)/,
];

function parseArgs(argv) {
  const args = {
    siteUrl: DEFAULT_SITE_URL,
    apiOrigin: DEFAULT_API_ORIGIN,
    output: DEFAULT_OUTPUT,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    concurrency: DEFAULT_CONCURRENCY,
    pretty: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") args.pretty = true;
    else if (arg === "--site-url") args.siteUrl = argv[++index] || args.siteUrl;
    else if (arg.startsWith("--site-url=")) args.siteUrl = arg.slice(11);
    else if (arg === "--api-origin") args.apiOrigin = argv[++index] || args.apiOrigin;
    else if (arg.startsWith("--api-origin=")) args.apiOrigin = arg.slice(13);
    else if (arg === "--output") args.output = argv[++index] || args.output;
    else if (arg.startsWith("--output=")) args.output = arg.slice(9);
    else if (arg === "--timeout-ms") args.timeoutMs = Number(argv[++index]) || args.timeoutMs;
    else if (arg.startsWith("--timeout-ms=")) args.timeoutMs = Number(arg.slice(13)) || args.timeoutMs;
    else if (arg === "--concurrency") args.concurrency = Number(argv[++index]) || args.concurrency;
    else if (arg.startsWith("--concurrency=")) args.concurrency = Number(arg.slice(14)) || args.concurrency;
  }
  args.siteUrl = args.siteUrl.replace(/\/$/, "");
  args.apiOrigin = args.apiOrigin.replace(/\/$/, "");
  args.concurrency = Math.max(1, Math.min(10, Math.floor(args.concurrency)));
  return args;
}

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function string(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return crypto.createHash("sha256").update(typeof value === "string" ? value : canonicalJson(value)).digest("hex");
}

function normalizeRobots(value) {
  return string(value).toLowerCase().replace(/\s+/g, "");
}

function resolveAbsoluteUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return "";
  }
}

function attribute(tag, name) {
  const match = String(tag).match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? match[1] : "";
}

function flattenJsonLd(value, output = []) {
  if (Array.isArray(value)) value.forEach((item) => flattenJsonLd(item, output));
  else if (value && typeof value === "object") {
    output.push(value);
    Object.values(value).forEach((item) => flattenJsonLd(item, output));
  }
  return output;
}

export function inspectHtml(html, expectedUrl) {
  const tags = String(html).match(/<(?:link|meta)\b[^>]*>/gi) || [];
  const canonicalTag = tags.find((tag) => attribute(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"));
  const robotsTag = tags.find((tag) => attribute(tag, "name").toLowerCase() === "robots");
  const jsonLdObjects = [];
  for (const match of String(html).matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      flattenJsonLd(JSON.parse(match[1]), jsonLdObjects);
    } catch {
      jsonLdObjects.push({ __parse_error: true });
    }
  }
  const faqPages = jsonLdObjects.filter((item) => item["@type"] === "FAQPage");
  const faqQuestionCount = faqPages.reduce((sum, item) => sum + array(item.mainEntity).length, 0);
  const types = [...new Set(jsonLdObjects.flatMap((item) => array(item["@type"]).length ? item["@type"] : [item["@type"]]).filter(Boolean))].sort();
  const canonical = resolveAbsoluteUrl(attribute(canonicalTag || "", "href"), expectedUrl);
  return {
    canonical,
    self_canonical: canonical === expectedUrl,
    robots: normalizeRobots(attribute(robotsTag || "", "content")),
    index_follow: normalizeRobots(attribute(robotsTag || "", "content")) === "index,follow",
    jsonld_types: types,
    faq_question_count: faqQuestionCount,
    jsonld_parse_ok: !jsonLdObjects.some((item) => item.__parse_error),
  };
}

function recursiveText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(recursiveText).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(recursiveText).join("\n");
  return "";
}

function unsupportedGuaranteeMatches(value) {
  const sentences = String(value).split(/[.!?。！？\n]+/).map((part) => part.trim()).filter(Boolean);
  const negativeBoundary = /\b(?:not|no|never|does not|do not|cannot|isn't|is not|without|you need|if you need)\b|不构成|不能|不得|不会|并非|不是|暂无|不要|避免|单个招聘承诺/iu;
  return sentences.filter((sentence) => !negativeBoundary.test(sentence) && GUARANTEE_PATTERNS.some((pattern) => pattern.test(sentence)));
}

function detailStats(detail, locale) {
  const displayPage = record(record(detail.display_surface_v1).page);
  const faqItems = array(record(record(displayPage.content).faq_block).items);
  const visibleText = [string(detail.content_body_md), recursiveText(detail.content_sections), recursiveText(displayPage)].join("\n");
  return {
    visible_text_chars: visibleText.length,
    cjk_chars: (visibleText.match(/[\u3400-\u9fff]/g) || []).length,
    faq_count: faqItems.length,
    thin_or_shell: visibleText.length < 1800 || (locale === "zh" && (visibleText.match(/[\u3400-\u9fff]/g) || []).length < 300) || faqItems.length < 2,
    guarantee_matches: unsupportedGuaranteeMatches(visibleText),
    content_sha256: sha256({
      content_body_md: detail.content_body_md ?? null,
      content_sections: detail.content_sections ?? null,
      display_page: displayPage,
      trust_manifest: detail.trust_manifest ?? null,
    }),
  };
}

export function publicHtmlStats(html, locale) {
  const visibleText = String(html)
    .replace(/<head\b[^>]*>[\s\S]*?<\/head\b[^>]*>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\b[^>]*>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:[a-z][a-z0-9]+|#\d+|#x[0-9a-f]+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const cjkChars = (visibleText.match(/[\u3400-\u9fff]/g) || []).length;
  return {
    visible_text_chars: visibleText.length,
    cjk_chars: cjkChars,
    thin_or_shell: visibleText.length < 1800 || (locale === "zh" && cjkChars < 300),
  };
}

export function exactSitemapLocs(payload) {
  return new Set(array(record(payload).items).map((item) => string(record(item).loc)).filter(Boolean));
}

function qualityScore(detail) {
  const score = Number(record(record(detail.score_bundle).confidence_score).value);
  return Number.isFinite(score) ? score : 0;
}

function reviewerEvidence(detail, authorityItem, observedAt) {
  const trust = record(detail.trust_manifest);
  const detailAuthority = record(detail.search_entry_authority);
  const listItem = record(authorityItem);
  const listAuthority = record(listItem.search_entry_authority);
  const listTrust = record(listItem.trust_summary);
  const reviewedAt = string(trust.last_reviewed_at || trust.reviewed_at);
  const listReviewedAt = string(listTrust.last_reviewed_at);
  const reviewState = string(detailAuthority.review_state || trust.review_state);
  const ageMs = reviewedAt ? new Date(observedAt).getTime() - new Date(reviewedAt).getTime() : Number.POSITIVE_INFINITY;
  return {
    review_state: reviewState,
    reviewer_status: string(trust.reviewer_status),
    reviewed_at: reviewedAt,
    stale: !Number.isFinite(ageMs) || ageMs < 0 || ageMs > REVIEW_MAX_AGE_DAYS * 86_400_000,
    backend_private_package_match_projected:
      reviewState === "approved"
      && string(listAuthority.review_state) === "approved"
      && reviewedAt !== ""
      && reviewedAt === listReviewedAt,
    public_projection_sha256: sha256({
      detail_review_state: reviewState,
      list_review_state: string(listAuthority.review_state),
      reviewed_at: reviewedAt,
      list_reviewed_at: listReviewedAt,
    }),
  };
}

export function evaluateCandidateEvidence(candidate) {
  const reasons = [];
  const tier = string(candidate.tier);
  const en = candidate.locales.en;
  const zh = candidate.locales.zh;
  if (!(tier in TIER_RANK)) reasons.push("unsupported_search_entry_tier");
  if (candidate.authority_tiers?.en !== tier || candidate.authority_tiers?.zh !== tier) reasons.push("search_entry_tier_locale_drift");
  if (!candidate.search_entry_eligible) reasons.push("search_entry_ineligible");
  if (candidate.held) reasons.push("held_slug");
  if (!candidate.sitemap_bilingual) reasons.push("sitemap_bilingual_mismatch");

  for (const locale of ["en", "zh"]) {
    const evidence = candidate.locales[locale];
    const prefix = `${locale}_`;
    if (evidence.detail_status !== 200) reasons.push(`${prefix}detail_api_not_200`);
    if (evidence.seo_authority_status !== 200) reasons.push(`${prefix}seo_authority_not_200`);
    if (evidence.page_status !== 200) reasons.push(`${prefix}page_not_200`);
    if (evidence.page_final_url !== evidence.url) reasons.push(`${prefix}page_final_url_mismatch`);
    if (!evidence.html.self_canonical) reasons.push(`${prefix}canonical_mismatch`);
    if (!evidence.html.index_follow) reasons.push(`${prefix}not_index_follow`);
    if (normalizeRobots(evidence.seo.robots_policy) !== "index,follow" || evidence.seo.index_eligible !== true) {
      reasons.push(`${prefix}seo_not_indexable`);
    }
    if (evidence.review.review_state !== "approved") reasons.push(`${prefix}review_not_approved`);
    if (!evidence.review.backend_private_package_match_projected) reasons.push(`${prefix}approved_package_projection_mismatch`);
    if (evidence.review.stale) reasons.push(`${prefix}review_stale`);
    if (!evidence.content_sha256) reasons.push(`${prefix}content_sha_missing`);
    if (!evidence.seo_sha256 || !evidence.seo.metadata_fingerprint) reasons.push(`${prefix}seo_sha_missing`);
    if (evidence.thin_or_shell) reasons.push(`${prefix}thin_or_shell`);
    if (!evidence.html.jsonld_parse_ok) reasons.push(`${prefix}jsonld_parse_error`);
    if (!evidence.html.jsonld_types.includes("FAQPage") || !evidence.html.jsonld_types.includes("BreadcrumbList")) {
      reasons.push(`${prefix}required_schema_missing`);
    }
    if (evidence.faq_count < 2 || evidence.html.faq_question_count !== evidence.faq_count) {
      reasons.push(`${prefix}faq_schema_mismatch`);
    }
    if (evidence.guarantee_matches.length > 0) reasons.push(`${prefix}unsupported_guarantee_claim`);
  }
  if (en.review.reviewed_at !== zh.review.reviewed_at) reasons.push("reviewer_evidence_locale_drift");
  if (en.content_version !== zh.content_version) reasons.push("content_version_locale_drift");
  if (en.seo.metadata_contract_version !== zh.seo.metadata_contract_version) reasons.push("seo_contract_locale_drift");

  return {
    ...candidate,
    eligible_for_pilot: reasons.length === 0,
    rejection_reasons: [...new Set(reasons)].sort(),
  };
}

export function selectPilot(candidates, expectedSlugCount = EXACT_SLUG_COUNT) {
  const eligible = candidates.filter((item) => item.eligible_for_pilot).sort((a, b) => {
    const tier = TIER_RANK[a.tier] - TIER_RANK[b.tier];
    if (tier !== 0) return tier;
    const quality = b.quality_score - a.quality_score;
    return quality !== 0 ? quality : a.slug.localeCompare(b.slug);
  });
  if (eligible.length < expectedSlugCount) {
    return { result: "HOLD", selected: [], reason: `insufficient_eligible_candidates:${eligible.length}/${expectedSlugCount}` };
  }
  return { result: "GO", selected: eligible.slice(0, expectedSlugCount), reason: null };
}

export function validateExactTargetShape(targets) {
  const slugs = array(targets).map((target) => string(record(target).slug)).filter(Boolean);
  const urls = array(targets).flatMap((target) => array(record(target).urls).map(string).filter(Boolean));
  const bilingualPairs = array(targets).every((target) => {
    const pair = array(record(target).urls);
    return pair.length === 2 && pair.some((url) => /\/en\/career\/jobs\//.test(url)) && pair.some((url) => /\/zh\/career\/jobs\//.test(url));
  });
  return {
    valid: slugs.length === EXACT_SLUG_COUNT && new Set(slugs).size === EXACT_SLUG_COUNT && urls.length === EXACT_URL_COUNT && new Set(urls).size === EXACT_URL_COUNT && bilingualPairs,
    slug_count: slugs.length,
    url_count: urls.length,
    bilingual_pairs_complete: bilingualPairs,
  };
}

export function buildArtifact({ candidates, observedAt, source }) {
  const evaluated = candidates.map((candidate) => evaluateCandidateEvidence(candidate));
  const selection = selectPilot(evaluated);
  const proposedTargets = selection.selected.map((candidate) => ({
    slug: candidate.slug,
    tier: candidate.tier,
    quality_score: candidate.quality_score,
    urls: [candidate.locales.en.url, candidate.locales.zh.url],
    locale_evidence: Object.fromEntries(["en", "zh"].map((locale) => {
      const evidence = candidate.locales[locale];
      return [locale, {
        detail_status: evidence.detail_status,
        seo_authority_status: evidence.seo_authority_status,
        seo_endpoint_status: evidence.seo_endpoint_status,
        seo_source: evidence.seo_source,
        page_status: evidence.page_status,
        page_final_url: evidence.page_final_url,
        canonical: evidence.html.canonical,
        robots: evidence.html.robots,
        sitemap_included: evidence.sitemap_included,
        reviewer_status: evidence.review.reviewer_status,
        reviewed_at: evidence.review.reviewed_at,
        backend_private_package_match_projected: evidence.review.backend_private_package_match_projected,
        review_public_projection_sha256: evidence.review.public_projection_sha256,
        content_version: evidence.content_version,
        content_sha256: evidence.content_sha256,
        seo_metadata_fingerprint: evidence.seo.metadata_fingerprint,
        seo_sha256: evidence.seo_sha256,
        faq_count: evidence.faq_count,
        schema_faq_count: evidence.html.faq_question_count,
        jsonld_types: evidence.html.jsonld_types,
        authority_visible_text_chars: evidence.authority_visible_text_chars,
        visible_text_chars: evidence.visible_text_chars,
        unsupported_guarantee_matches: evidence.guarantee_matches,
      }];
    })),
  }));
  const proposedUrls = proposedTargets.flatMap((target) => target.urls);
  const exactShape = validateExactTargetShape(proposedTargets);
  const result = selection.result === "GO" && exactShape.valid ? "GO" : "HOLD";
  const holdReason = selection.reason || (exactShape.valid ? null : `invalid_exact_target_shape:${exactShape.slug_count}/${exactShape.url_count}`);
  const targets = result === "GO" ? proposedTargets : [];
  const urls = result === "GO" ? proposedUrls : [];
  const targetSetSha = result === "GO" ? sha256({ slugs: targets.map((target) => target.slug), urls }) : null;
  const body = {
    schema_version: SCHEMA_VERSION,
    task: TASK_ID,
    observed_at: observedAt,
    mode: "read_only_backend_authority_and_public_surface_observation",
    source,
    dependencies: {
      batch_review_run: "30678387519",
      batch_review_control_plane_sha: "0386505910f1de5a054171df152dc08126b04217",
      quality_package_sha256: "5b9585ed95bb15b04dc00702b89a4bf5bc65e8b2c27a6002a307e7a6e638ac58",
      review_package_sha256: "2b2a736650a89512a1f85d4baff3bc6d430d669a7fba1e7aa379c2d8376b1a91",
      review_evidence_sha256: "da85e056b56945287aa67551a636333782f637f9f37faa2e9a0fc6a212d3fc5d",
      task12_result: "PASS_APPLY_READBACK",
      task12_operator_evidence: "2546dbd6",
      review_binding_contract: "backend approved review projection is emitted only while the exact private bilingual content, SEO, visible-claims, and index-entry package still matches its approved_all attestation",
    },
    selection_policy: {
      exact_slug_count: EXACT_SLUG_COUNT,
      exact_url_count: EXACT_URL_COUNT,
      order: ["stable_first", "quality_score_desc", "slug_asc"],
      insufficient_candidates: "HOLD_without_lowering_gate",
    },
    inventory: {
      observed_candidate_count: evaluated.length,
      eligible_candidate_count: evaluated.filter((item) => item.eligible_for_pilot).length,
      rejected_candidate_count: evaluated.filter((item) => !item.eligible_for_pilot).length,
      tier_counts: Object.fromEntries(Object.keys(TIER_RANK).map((tier) => [tier, evaluated.filter((item) => item.tier === tier).length])),
      rejection_reason_counts: evaluated.flatMap((item) => item.rejection_reasons).reduce((counts, reason) => ({ ...counts, [reason]: (counts[reason] || 0) + 1 }), {}),
    },
    result,
    hold_reason: holdReason,
    targets,
    target_set_sha256: targetSetSha,
    rollback_batch_id: result === "GO" ? `career-search-entry-pilot-${targetSetSha.slice(0, 16)}` : null,
    evidence_summary: {
      slug_count: targets.length,
      url_count: urls.length,
      bilingual_pairs_complete: targets.every((target) => target.urls.length === 2),
      all_detail_api_and_pages_200: targets.every((target) => Object.values(target.locale_evidence).every((item) => item.detail_status === 200 && item.page_status === 200 && item.page_final_url === target.urls[item === target.locale_evidence.en ? 0 : 1])),
      all_seo_authority_resolved: targets.every((target) => Object.values(target.locale_evidence).every((item) => item.seo_authority_status === 200 && ["career_seo_endpoint", "career_detail_seo_contract"].includes(item.seo_source))),
      dedicated_seo_endpoint_200_count: targets.flatMap((target) => Object.values(target.locale_evidence)).filter((item) => item.seo_endpoint_status === 200).length,
      detail_seo_contract_fallback_count: targets.flatMap((target) => Object.values(target.locale_evidence)).filter((item) => item.seo_source === "career_detail_seo_contract").length,
      all_self_canonical_index_follow: targets.every((target) => Object.values(target.locale_evidence).every((item) => item.canonical === target.urls[item === target.locale_evidence.en ? 0 : 1] && item.robots === "index,follow")),
      all_sitemap_bilingual: targets.every((target) => Object.values(target.locale_evidence).every((item) => item.sitemap_included)),
      all_reviewer_content_seo_evidence_current: targets.every((target) => Object.values(target.locale_evidence).every((item) => item.backend_private_package_match_projected && item.reviewed_at && item.content_sha256 && item.seo_sha256)),
      all_faq_schema_aligned: targets.every((target) => Object.values(target.locale_evidence).every((item) => item.faq_count >= 2 && item.faq_count === item.schema_faq_count)),
      exact_target_shape: exactShape.valid,
    },
    negative_guarantees: {
      unsupported_strong_claim_added: false,
      salary_guarantee_present: false,
      hiring_guarantee_present: false,
      career_success_guarantee_present: false,
      generated_or_modified_public_content: false,
      search_channel_action_performed: false,
      url_submission_performed: false,
      sitemap_mutation_performed: false,
      cms_or_database_write_performed: false,
      deploy_or_rollback_performed: false,
    },
    rejected_candidates: evaluated.filter((item) => !item.eligible_for_pilot).map((item) => ({ slug: item.slug, tier: item.tier, quality_score: item.quality_score, reasons: item.rejection_reasons })),
  };
  return { ...body, artifact_sha256: sha256(body) };
}

export async function fetchStatus(url, timeoutMs, json = true) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "manual", headers: { Accept: json ? "application/json" : "text/html" } });
    const payload = json ? await response.json().catch(() => null) : await response.text().catch(() => "");
    return { status: response.status, payload, final_url: response.url };
  } catch (error) {
    return { status: null, payload: null, final_url: "", error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await mapper(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function apiUrl(origin, route) {
  return `${origin}/api${route}`;
}

async function collectLocale({ slug, locale, authorityItem, args, sitemapLocs, observedAt }) {
  const apiLocale = locale === "zh" ? "zh-CN" : "en";
  const url = `${args.siteUrl}/${locale}/career/jobs/${slug}`;
  const [detailResult, seoResult, pageResult] = await Promise.all([
    fetchStatus(apiUrl(args.apiOrigin, `/v0.5/career/jobs/${encodeURIComponent(slug)}?locale=${encodeURIComponent(apiLocale)}`), args.timeoutMs),
    fetchStatus(apiUrl(args.apiOrigin, `/v0.5/career-jobs/${encodeURIComponent(slug)}/seo?locale=${encodeURIComponent(apiLocale)}&org_id=0`), args.timeoutMs),
    fetchStatus(url, args.timeoutMs, false),
  ]);
  const detail = record(record(detailResult.payload).data).identity ? record(detailResult.payload).data : record(detailResult.payload);
  const seoPayload = record(seoResult.payload);
  const endpointSeo = record(seoPayload.seo_surface_v1);
  const detailSeo = record(detail.seo_contract);
  const seo = Object.keys(endpointSeo).length > 0 ? endpointSeo : detailSeo;
  const effectiveSeoStatus = Object.keys(seo).length > 0 && detailResult.status === 200 ? 200 : seoResult.status;
  const stats = detailStats(detail, locale);
  const renderedStats = publicHtmlStats(pageResult.payload, locale);
  const seoSha256 = effectiveSeoStatus === 200 ? sha256(seo) : "";
  return {
    url,
    detail_status: detailResult.status,
    seo_authority_status: effectiveSeoStatus,
    seo_endpoint_status: seoResult.status,
    seo_source: Object.keys(endpointSeo).length > 0 ? "career_seo_endpoint" : "career_detail_seo_contract",
    page_status: pageResult.status,
    page_final_url: pageResult.final_url,
    sitemap_included: sitemapLocs.has(url),
    html: inspectHtml(pageResult.payload, url),
    seo: {
      metadata_contract_version: string(seo.metadata_contract_version),
      metadata_fingerprint: string(seo.metadata_fingerprint),
      robots_policy: string(seo.robots_policy),
      index_eligible: seo.index_eligible === true,
    },
    seo_sha256: seoSha256,
    review: reviewerEvidence(detail, authorityItem, observedAt),
    content_version: string(record(detail.trust_manifest).content_version || record(detail.provenance_meta).content_version),
    quality_score: qualityScore(detail),
    ...stats,
    authority_visible_text_chars: stats.visible_text_chars,
    authority_cjk_chars: stats.cjk_chars,
    visible_text_chars: renderedStats.visible_text_chars,
    cjk_chars: renderedStats.cjk_chars,
    thin_or_shell: stats.thin_or_shell || renderedStats.thin_or_shell,
  };
}

async function collectLive(args) {
  const observedAt = new Date().toISOString();
  const [enListResult, zhListResult, sitemapResult] = await Promise.all([
    fetchStatus(apiUrl(args.apiOrigin, "/v0.5/career/jobs?locale=en&org_id=0"), args.timeoutMs),
    fetchStatus(apiUrl(args.apiOrigin, "/v0.5/career/jobs?locale=zh-CN&org_id=0"), args.timeoutMs),
    fetchStatus(apiUrl(args.apiOrigin, "/v0.5/seo/sitemap-source"), args.timeoutMs),
  ]);
  if (enListResult.status !== 200 || zhListResult.status !== 200 || sitemapResult.status !== 200) {
    throw new Error(`Authority preflight failed: en=${enListResult.status}, zh=${zhListResult.status}, sitemap=${sitemapResult.status}`);
  }
  const enItems = array(record(enListResult.payload).items);
  const zhBySlug = new Map(array(record(zhListResult.payload).items).map((item) => [string(record(item.identity).canonical_slug), item]));
  const eligible = enItems.filter((item) => record(item.search_entry_authority).search_entry_eligible === true);
  const sitemapLocs = exactSitemapLocs(sitemapResult.payload);
  if (eligible.length !== 50 || sitemapLocs.size < EXACT_URL_COUNT) {
    throw new Error(`Authority snapshot incomplete: eligible=${eligible.length}/50, sitemap_locs=${sitemapLocs.size}`);
  }
  const candidates = await mapLimit(eligible, args.concurrency, async (item) => {
    const slug = string(record(item.identity).canonical_slug);
    const authority = record(item.search_entry_authority);
    const zhItem = zhBySlug.get(slug);
    const enTier = string(item.search_entry_tier || authority.search_entry_tier);
    const zhAuthority = record(zhItem?.search_entry_authority);
    const zhTier = string(record(zhItem).search_entry_tier || zhAuthority.search_entry_tier);
    const [en, zh] = await Promise.all([
      collectLocale({ slug, locale: "en", authorityItem: item, args, sitemapLocs, observedAt }),
      collectLocale({ slug, locale: "zh", authorityItem: zhItem, args, sitemapLocs, observedAt }),
    ]);
    return {
      slug,
      tier: enTier,
      authority_tiers: { en: enTier, zh: zhTier },
      search_entry_eligible: authority.search_entry_eligible === true && zhAuthority.search_entry_eligible === true,
      held: authority.held_slug === true || zhAuthority.held_slug === true,
      sitemap_bilingual: en.sitemap_included && zh.sitemap_included,
      quality_score: Math.min(en.quality_score, zh.quality_score),
      locales: { en, zh },
    };
  });
  return buildArtifact({
    candidates,
    observedAt,
    source: {
      site_url: args.siteUrl,
      api_origin: args.apiOrigin,
      career_directory_authority: ["/api/v0.5/career/jobs?locale=en&org_id=0", "/api/v0.5/career/jobs?locale=zh-CN&org_id=0"],
      career_detail_authority: "/api/v0.5/career/jobs/{slug}?locale={en|zh-CN}",
      career_seo_authority: "/api/v0.5/career-jobs/{slug}/seo?locale={en|zh-CN}&org_id=0",
      sitemap_authority: "/api/v0.5/seo/sitemap-source",
      public_surface: "/{en|zh}/career/jobs/{slug}",
    },
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = await collectLive(args);
  const output = path.resolve(process.cwd(), args.output);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(artifact, null, args.pretty ? 2 : 0)}\n`);
  process.stdout.write(`${artifact.result} ${artifact.targets.length}/${artifact.evidence_summary.url_count} ${artifact.artifact_sha256}\n`);
  if (artifact.result !== "GO") process.exitCode = 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  await main();
}
