#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DATE = "2026-07-14";
const SITE_ORIGIN = "https://fermatmind.com";
const FERMAT_SITEMAP = `${SITE_ORIGIN}/sitemap.xml`;
const TRUITY_ORIGIN = "https://www.truity.com";
const TRUITY_SITEMAP = `${TRUITY_ORIGIN}/sitemap.xml`;
const OUTPUT_BASE = `docs/seo/personality/big5-authority-v2-benchmark-01-scorecard-${DATE}`;
const LIVE_EVIDENCE_PATH = `docs/seo/personality/big5-authority-v2-benchmark-01-live-evidence-${DATE}.json`;
const ALLOW_NETWORK = process.argv.includes("--allow-network");
const MAX_CONCURRENCY = 6;
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payments?|history|share|account)(?:\/|$|[?#])|\/results\/lookup(?:\/|$|[?#])/i;
const INTERNAL_TERMS = ["Draft and indexability boundary", "SEO / GEO 摘要", "内部链接建议"];
const DEAD_GUIDE_SLUGS = [
  "how-to-read-big-five-results",
  "big-five-score-ranges",
  "big-five-30-day-review",
  "big-five-vs-mbti",
  "discuss-results-with-others",
];
const ZH_LEGACY_ALIASES = {
  "high-openness": "openness-high",
  "low-openness": "openness-low",
  "high-conscientiousness": "conscientiousness-high",
  "low-conscientiousness": "conscientiousness-low",
  "high-extraversion": "extraversion-high",
  "low-extraversion": "extraversion-low",
  "high-agreeableness": "agreeableness-high",
  "low-agreeableness": "agreeableness-low",
  "high-neuroticism": "neuroticism-high",
  "emotional-stability": "neuroticism-low",
};
const DOMAIN_PR = {
  openness: "BIG5-AUTHORITY-V2-RANGE-OPENNESS-10",
  conscientiousness: "BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11",
  extraversion: "BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12",
  agreeableness: "BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13",
  neuroticism: "BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14",
};
const FACET_PR = {
  imagination: "BIG5-AUTHORITY-V2-FACETS-OPENNESS-15",
  aesthetics: "BIG5-AUTHORITY-V2-FACETS-OPENNESS-15",
  feelings: "BIG5-AUTHORITY-V2-FACETS-OPENNESS-15",
  actions: "BIG5-AUTHORITY-V2-FACETS-OPENNESS-15",
  ideas: "BIG5-AUTHORITY-V2-FACETS-OPENNESS-15",
  values: "BIG5-AUTHORITY-V2-FACETS-OPENNESS-15",
  competence: "BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16",
  order: "BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16",
  dutifulness: "BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16",
  "achievement-striving": "BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16",
  "self-discipline": "BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16",
  deliberation: "BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16",
  warmth: "BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17",
  gregariousness: "BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17",
  assertiveness: "BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17",
  activity: "BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17",
  "excitement-seeking": "BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17",
  "positive-emotions": "BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17",
  trust: "BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18",
  straightforwardness: "BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18",
  altruism: "BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18",
  compliance: "BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18",
  modesty: "BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18",
  "tender-mindedness": "BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18",
  anxiety: "BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19",
  anger: "BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19",
  depression: "BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19",
  "self-consciousness": "BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19",
  impulsiveness: "BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19",
  vulnerability: "BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19",
};
const TRUITY_BENCHMARK_URLS = [
  { family: "test_landing", url: "https://www.truity.com/test/big-five-personality-test" },
  { family: "test_directory", url: "https://www.truity.com/view/tests/big-five-personality" },
  { family: "model_hub", url: "https://www.truity.com/blog/page/big-five-personality-traits" },
  { family: "domain", url: "https://www.truity.com/blog/page/openness-dimension-personality" },
  { family: "domain", url: "https://www.truity.com/blog/page/conscientiousness-dimension-personality" },
  { family: "domain", url: "https://www.truity.com/blog/page/extraversion-dimension-personality" },
  { family: "domain", url: "https://www.truity.com/blog/page/agreeableness-dimension-personality" },
  { family: "domain", url: "https://www.truity.com/blog/page/neuroticism-dimension-personality" },
  { family: "topic_hub", url: "https://www.truity.com/blog/topic/big-five" },
  { family: "facet_test", url: "https://www.truity.com/test/30-trait-personality-test" },
  { family: "business_conversion", url: "https://www.truity.com/truity-at-work/product/big-five" },
];
const TRUITY_DOCUMENT_URLS = [
  { family: "technical_document", url: "https://www.truity.com/sites/default/files/uploads/BigFiveTechnicalDocument.pdf" },
  { family: "sample_report", url: "https://www.truity.com/sites/default/files/fillpdf/sample_big_five_personality_test_report.pdf" },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function write(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function extractAttribute(tag, name) {
  return decodeHtml(tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "").trim();
}

function extractMeta(html, attribute, value) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (extractAttribute(tag, attribute).toLowerCase() === value.toLowerCase()) {
      return extractAttribute(tag, "content");
    }
  }
  return "";
}

function extractCanonical(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (extractAttribute(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) {
      return extractAttribute(tag, "href");
    }
  }
  return "";
}

function stripHtml(html) {
  return decodeHtml(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
}

function visibleMainHtml(html) {
  return html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? html.match(/<body\b[\s\S]*?<\/body>/i)?.[0] ?? html;
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  for (const tag of html.match(/<a\b[^>]*>/gi) ?? []) {
    const href = extractAttribute(tag, "href");
    if (!href || /^(?:mailto:|tel:|javascript:|#)/i.test(href)) continue;
    try {
      links.add(new URL(href, baseUrl).toString());
    } catch {
      // Invalid links remain outside the normalized scorecard and are handled by PR02.
    }
  }
  return [...links].sort();
}

function extractJsonLdTypes(html) {
  const types = new Set();
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const typeMatch of match[1].matchAll(/["']@type["']\s*:\s*["']([^"']+)["']/gi)) {
      types.add(typeMatch[1]);
    }
  }
  return [...types].sort();
}

function metricSnapshot(html, requestedUrl, finalUrl, status, headers = {}) {
  const mainHtml = visibleMainHtml(html);
  const text = stripHtml(mainHtml);
  const links = extractLinks(mainHtml, finalUrl || requestedUrl);
  const internalLinks = links.filter((link) => {
    try {
      return new URL(link).hostname.replace(/^www\./, "") === new URL(requestedUrl).hostname.replace(/^www\./, "");
    } catch {
      return false;
    }
  });
  const externalEvidenceLinks = links.filter((link) => {
    try {
      const hostname = new URL(link).hostname.replace(/^www\./, "");
      return hostname !== new URL(requestedUrl).hostname.replace(/^www\./, "") &&
        !/(facebook|twitter|x\.com|linkedin|instagram|youtube)\./i.test(hostname);
    } catch {
      return false;
    }
  });
  const title = decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim();
  const h1 = decodeHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, " ") ?? "").replace(/\s+/g, " ").trim();
  const visibleWordCount = text.split(/\s+/).filter(Boolean).length;
  const cjkCount = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const titleBrandOccurrences = (title.match(/FermatMind|费马测试/gi) ?? []).length;
  return {
    requested_url: requestedUrl,
    final_url: finalUrl,
    http_status: status,
    title,
    title_brand_occurrences: titleBrandOccurrences,
    duplicate_brand_title: titleBrandOccurrences > 1,
    description: extractMeta(html, "name", "description") || extractMeta(html, "property", "og:description"),
    canonical: extractCanonical(html),
    robots: extractMeta(html, "name", "robots").toLowerCase(),
    h1,
    h2_count: (mainHtml.match(/<h2\b/gi) ?? []).length,
    h3_count: (mainHtml.match(/<h3\b/gi) ?? []).length,
    visible_word_count: visibleWordCount,
    visible_cjk_character_count: cjkCount,
    internal_link_count: internalLinks.length,
    internal_links: internalLinks,
    external_evidence_link_count: externalEvidenceLinks.length,
    external_evidence_links: externalEvidenceLinks,
    image_count: (mainHtml.match(/<img\b/gi) ?? []).length,
    og_image: extractMeta(html, "property", "og:image"),
    jsonld_types: extractJsonLdTypes(html),
    visible_author_signal: /\b(?:author|written by|by:)\b|作者|撰稿/i.test(text),
    visible_reviewer_signal: /reviewed by|clinically reviewed|reviewer|审核人|审阅/i.test(text),
    visible_date_signal: /\b(?:published|updated|last reviewed|posted)\b|发布于|更新于|最后审阅/i.test(text),
    visible_source_signal: /\b(?:sources?|references?|doi)\b|来源|参考文献/i.test(text),
    visible_method_boundary_signal: /not (?:a )?diagnos|does not diagnos|not a type|continuous|spectrum|非诊断|不是诊断|连续维度|连续谱|不是类型/i.test(text),
    cta_signal: /take (?:the|a|our) (?:free )?(?:big five|test)|start (?:the )?test|开始测试|立即测试|查看报告|full report/i.test(text),
    internal_operational_terms: INTERNAL_TERMS.filter((term) => text.includes(term)),
    dead_guide_targets: DEAD_GUIDE_SLUGS.filter((slug) => internalLinks.some((link) => new URL(link).pathname.includes(slug))),
    private_path_links: internalLinks.filter((link) => {
      const pathname = new URL(link).pathname;
      return pathname !== "/en/personality/big-five/facets/order" &&
        pathname !== "/zh/personality/big-five/facets/order" &&
        PRIVATE_PATH_PATTERN.test(pathname);
    }),
    last_modified_header: headers["last-modified"] ?? "",
  };
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: options.redirect ?? "follow",
        method: options.method ?? "GET",
        headers: { "User-Agent": "FermatMind-Big5-Authority-V2-Benchmark/1.0", Accept: options.accept ?? "text/html,application/xhtml+xml" },
        signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
      });
      const body = options.method === "HEAD" ? "" : await response.text();
      return {
        status: response.status,
        url: response.url || url,
        body,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
}

function parseSitemap(xml) {
  const lastmodByUrl = new Map();
  for (const block of xml.match(/<url>[\s\S]*?<\/url>/gi) ?? []) {
    const loc = decodeHtml(block.match(/<loc>([^<]+)<\/loc>/i)?.[1] ?? "").trim();
    const lastmod = decodeHtml(block.match(/<lastmod>([^<]+)<\/lastmod>/i)?.[1] ?? "").trim();
    if (loc) lastmodByUrl.set(loc, lastmod);
  }
  return lastmodByUrl;
}

function selectFermatUrls(lastmodByUrl) {
  const urls = [...lastmodByUrl.keys()];
  const personality = urls.filter((url) => /\/(?:en|zh)\/personality\/big-five(?:\/|$)/.test(url));
  const articles = urls.filter((url) => /\/(?:en|zh)\/articles\//.test(url) && /big-five/.test(url));
  const tests = urls.filter((url) => /\/(?:en|zh)\/tests\/big-five-personality-test-ocean-model$/.test(url));
  const topics = urls.filter((url) => /\/(?:en|zh)\/topics\/big-five$/.test(url));
  assert(personality.length === 114, `Expected 114 personality canonicals, received ${personality.length}`);
  assert(articles.length === 9, `Expected 9 article canonicals, received ${articles.length}`);
  assert(tests.length === 2, `Expected 2 test canonicals, received ${tests.length}`);
  assert(topics.length === 2, `Expected 2 topic canonicals, received ${topics.length}`);
  return [...personality, ...articles, ...tests, ...topics].sort();
}

async function mapConcurrent(items, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
      if ((index + 1) % 20 === 0 || index + 1 === items.length) {
        console.log(`captured ${index + 1}/${items.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, items.length) }, run));
  return results;
}

function truityRelatedUrls(urls) {
  const pattern = /(?:big-five|big-5|five-factor|openness|conscientious|extraversion|agreeableness|neuroticism|30-trait)/i;
  return urls.filter((url) => pattern.test(new URL(url).pathname)).sort();
}

async function captureLiveEvidence() {
  const [fermatSitemapResponse, truitySitemapResponse] = await Promise.all([
    fetchWithRetry(FERMAT_SITEMAP, { accept: "application/xml,text/xml" }),
    fetchWithRetry(TRUITY_SITEMAP, { accept: "application/xml,text/xml" }),
  ]);
  assert(fermatSitemapResponse.status === 200, `Fermat sitemap returned ${fermatSitemapResponse.status}`);
  assert(truitySitemapResponse.status === 200, `Truity sitemap returned ${truitySitemapResponse.status}`);
  const fermatLastmod = parseSitemap(fermatSitemapResponse.body);
  const truityLastmod = parseSitemap(truitySitemapResponse.body);
  const targetUrls = selectFermatUrls(fermatLastmod);
  const fermatRecords = await mapConcurrent(targetUrls, async (url) => {
    const response = await fetchWithRetry(url);
    return {
      ...metricSnapshot(response.body, url, response.url, response.status, response.headers),
      sitemap_lastmod: fermatLastmod.get(url) ?? "",
    };
  });
  const legacyAliases = await mapConcurrent(Object.entries(ZH_LEGACY_ALIASES), async ([legacySlug, canonicalSlug]) => {
    const url = `${SITE_ORIGIN}/zh/personality/big-five/${legacySlug}`;
    const response = await fetchWithRetry(url, { redirect: "manual" });
    return {
      legacy_url: url,
      expected_canonical: `${SITE_ORIGIN}/zh/personality/big-five/${canonicalSlug}`,
      http_status: response.status,
      location: response.headers.location ?? "",
    };
  });
  const truityPages = await mapConcurrent(TRUITY_BENCHMARK_URLS, async (entry) => {
    const response = await fetchWithRetry(entry.url);
    return { family: entry.family, ...metricSnapshot(response.body, entry.url, response.url, response.status, response.headers) };
  });
  const truityDocuments = await mapConcurrent(TRUITY_DOCUMENT_URLS, async (entry) => {
    const response = await fetchWithRetry(entry.url, { method: "HEAD", redirect: "follow", accept: "application/pdf" });
    return {
      family: entry.family,
      requested_url: entry.url,
      final_url: response.url,
      http_status: response.status,
      content_type: response.headers["content-type"] ?? "",
      last_modified_header: response.headers["last-modified"] ?? "",
    };
  });
  const evidence = {
    id: "BIG5-AUTHORITY-V2-BENCHMARK-01-LIVE-EVIDENCE",
    captured_at: new Date().toISOString(),
    evidence_scope: "read_only_public_sitemap_html_redirect_and_document_metadata",
    sources: {
      fermat_sitemap: FERMAT_SITEMAP,
      truity_sitemap: TRUITY_SITEMAP,
      fermat_sitemap_total_urls: fermatLastmod.size,
      truity_sitemap_total_urls: truityLastmod.size,
    },
    fermat_records: fermatRecords,
    fermat_zh_legacy_aliases: legacyAliases,
    truity_public_landscape: {
      sitemap_related_urls: truityRelatedUrls([...truityLastmod.keys()]),
      benchmark_pages: truityPages,
      documents: truityDocuments,
    },
    safety_boundary: {
      cms_write_attempted: false,
      production_write_attempted: false,
      deploy_attempted: false,
      indexability_mutation_attempted: false,
      sitemap_or_llms_mutation_attempted: false,
      search_submission_attempted: false,
      private_route_requested: false,
      credentials_recorded: false,
    },
  };
  write(LIVE_EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
  return evidence;
}

function classifyPage(url) {
  const pathname = new URL(url).pathname;
  const locale = pathname.split("/")[1];
  if (pathname.includes("/articles/")) return { locale, family: "article", primary_owner_pr: "BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22" };
  if (pathname.includes("/tests/")) return { locale, family: "test_landing", primary_owner_pr: "BIG5-AUTHORITY-V2-TEST-LANDING-20" };
  if (pathname.includes("/topics/")) return { locale, family: "topic_hub", primary_owner_pr: "BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22" };
  const suffix = pathname.split("/personality/big-five")[1]?.replace(/^\//, "") ?? "";
  if (!suffix) return { locale, family: "personality_hub", primary_owner_pr: "BIG5-AUTHORITY-V2-HUB-07" };
  if (suffix === "facets") return { locale, family: "facet_hub", primary_owner_pr: "BIG5-AUTHORITY-V2-FACET-HUBS-09" };
  if (suffix.startsWith("facets/")) {
    const facet = suffix.split("/")[1];
    return { locale, family: "facet_detail", primary_owner_pr: FACET_PR[facet] ?? "UNKNOWN" };
  }
  if (["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"].includes(suffix)) {
    return { locale, family: "domain", primary_owner_pr: "BIG5-AUTHORITY-V2-DOMAINS-08" };
  }
  const v2Range = suffix.match(/^(openness|conscientiousness|extraversion|agreeableness|neuroticism)-(high|mid|low)$/);
  if (v2Range) return { locale, family: "range_v2", primary_owner_pr: DOMAIN_PR[v2Range[1]] };
  const legacyDomain = suffix === "emotional-stability" ? "neuroticism" : suffix.match(/^(?:high|low)-(openness|conscientiousness|extraversion|agreeableness|neuroticism)$/)?.[1];
  if (legacyDomain) return { locale, family: "legacy_en_canonical", primary_owner_pr: DOMAIN_PR[legacyDomain] };
  return { locale, family: "unknown", primary_owner_pr: "UNKNOWN" };
}

function scoreRecord(record, capturedAt) {
  const effectiveWords = Math.max(record.visible_word_count, Math.floor(record.visible_cjk_character_count / 2));
  const contentDepth = effectiveWords >= 1500 && record.h2_count >= 6 ? 3 : effectiveWords >= 700 && record.h2_count >= 3 ? 2 : effectiveWords >= 200 ? 1 : 0;
  const structure = record.h2_count >= 8 && record.internal_link_count >= 8 ? 3 : record.h2_count >= 4 ? 2 : record.h1 ? 1 : 0;
  const visibleEvidence = record.external_evidence_link_count >= 2 && record.visible_source_signal ? 3 : record.external_evidence_link_count >= 1 ? 2 : record.visible_source_signal ? 1 : 0;
  const authorReviewer = record.visible_author_signal && record.visible_reviewer_signal && record.visible_date_signal ? 3 : (record.visible_author_signal && record.visible_date_signal) || record.visible_reviewer_signal ? 2 : record.visible_author_signal || record.visible_date_signal ? 1 : 0;
  const media = record.og_image && record.image_count >= 1 ? 3 : record.og_image || record.image_count >= 1 ? 2 : 0;
  const internalLinking = record.internal_link_count >= 10 ? 3 : record.internal_link_count >= 5 ? 2 : record.internal_link_count >= 1 ? 1 : 0;
  const lastmodMs = Date.parse(record.sitemap_lastmod);
  const ageDays = Number.isFinite(lastmodMs) ? Math.max(0, (Date.parse(capturedAt) - lastmodMs) / 86_400_000) : null;
  const freshness = ageDays === null ? 0 : ageDays <= 30 ? 3 : ageDays <= 90 ? 2 : 1;
  const seoGeo = record.canonical === record.requested_url && record.description.length >= 80 && /index/.test(record.robots) && !/noindex/.test(record.robots) ? 3 : record.canonical === record.requested_url && record.title ? 2 : record.title ? 1 : 0;
  const conversion = record.cta_signal ? 2 : record.internal_links.some((link) => /\/tests\//.test(new URL(link).pathname)) ? 1 : 0;
  const scores = { content_depth: contentDepth, structure, visible_evidence: visibleEvidence, author_reviewer_dates: authorReviewer, media, internal_linking: internalLinking, freshness, seo_geo: seoGeo, conversion };
  const gaps = [];
  if (contentDepth < 2) gaps.push("content_depth");
  if (visibleEvidence < 2) gaps.push("visible_evidence");
  if (authorReviewer < 2) gaps.push("author_reviewer_dates");
  if (media < 2) gaps.push("media_og");
  if (internalLinking < 2) gaps.push("internal_linking");
  if (seoGeo < 3) gaps.push("seo_geo_completeness");
  if (record.duplicate_brand_title) gaps.push("duplicate_brand_title");
  if (record.internal_operational_terms.length) gaps.push("visible_internal_operational_terms");
  if (record.dead_guide_targets.length) gaps.push("dead_guide_targets_require_pr02_validation");
  return { scores, score_total: Object.values(scores).reduce((sum, value) => sum + value, 0), benchmark_gaps: gaps };
}

function truityFamilySummary(pages) {
  const byFamily = {};
  for (const page of pages) {
    byFamily[page.family] ??= [];
    byFamily[page.family].push(page);
  }
  return Object.fromEntries(Object.entries(byFamily).map(([family, records]) => [family, {
    page_count: records.length,
    urls: records.map((record) => record.requested_url),
    median_visible_words: [...records].sort((a, b) => a.visible_word_count - b.visible_word_count)[Math.floor(records.length / 2)].visible_word_count,
    visible_author_pages: records.filter((record) => record.visible_author_signal).length,
    visible_reviewer_pages: records.filter((record) => record.visible_reviewer_signal).length,
    visible_source_pages: records.filter((record) => record.visible_source_signal || record.external_evidence_link_count > 0).length,
    media_pages: records.filter((record) => record.og_image || record.image_count > 0).length,
    median_internal_links: [...records].sort((a, b) => a.internal_link_count - b.internal_link_count)[Math.floor(records.length / 2)].internal_link_count,
  }]));
}

function trainOwnership() {
  const ids = [
    "BIG5-AUTHORITY-V2-INTEGRITY-GATE-02", "BIG5-AUTHORITY-V2-PUBLIC-CONTRACT-03", "BIG5-AUTHORITY-V2-WEB-TRUST-RENDERER-04",
    "BIG5-AUTHORITY-V2-SOURCE-LEDGER-05", "BIG5-AUTHORITY-V2-EDITORIAL-GATE-06", "BIG5-AUTHORITY-V2-HUB-07",
    "BIG5-AUTHORITY-V2-DOMAINS-08", "BIG5-AUTHORITY-V2-FACET-HUBS-09", "BIG5-AUTHORITY-V2-RANGE-OPENNESS-10",
    "BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11", "BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12", "BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13",
    "BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14", "BIG5-AUTHORITY-V2-FACETS-OPENNESS-15", "BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16",
    "BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17", "BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18", "BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19",
    "BIG5-AUTHORITY-V2-TEST-LANDING-20", "BIG5-AUTHORITY-V2-ARTICLE-IA-21", "BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22",
    "BIG5-AUTHORITY-V2-TECHNICAL-TRUST-23", "BIG5-AUTHORITY-V2-ARTICLE-CORE-MODEL-24", "BIG5-AUTHORITY-V2-ARTICLE-RESULT-READING-25",
    "BIG5-AUTHORITY-V2-ARTICLE-WORKPLACE-26", "BIG5-AUTHORITY-V2-ARTICLE-RELATIONSHIPS-27", "BIG5-AUTHORITY-V2-ARTICLE-LEARNING-HABITS-28",
    "BIG5-AUTHORITY-V2-ARTICLE-GROWTH-CHANGE-29", "BIG5-AUTHORITY-V2-ARTICLE-STRESS-WELLBEING-30", "BIG5-AUTHORITY-V2-ARTICLE-RESEARCH-METHODS-31",
    "BIG5-AUTHORITY-V2-ARTICLE-COMPARISONS-32", "BIG5-AUTHORITY-V2-ARTICLE-RESEARCH-BRIEFINGS-33", "BIG5-AUTHORITY-V2-MEDIA-OG-34",
    "BIG5-AUTHORITY-V2-LINK-GRAPH-35", "BIG5-AUTHORITY-V2-SEO-GEO-AUTHORITY-36", "BIG5-AUTHORITY-V2-RELEASE-GATE-37",
    "BIG5-AUTHORITY-V2-RUNTIME-CLOSEOUT-38",
  ];
  return ids.map((id) => ({
    id,
    ownership: id.endsWith("-02") ? "current integrity repair and validation across all 127 canonicals" :
      id.endsWith("-03") ? "backend public evidence contract" :
      id.endsWith("-04") ? "fap-web visible trust rendering consumer" :
      id.endsWith("-05") ? "bilingual terminology and claim-source ledger" :
      id.endsWith("-06") ? "editorial QA gates" :
      /-(?:07|08|09|1[0-9]|20)$/.test(id) ? "primary page-family content package shown in page_scorecards.primary_owner_pr" :
      id.endsWith("-21") ? "locked 50-topic article intent architecture" :
      id.endsWith("-22") ? "nine existing articles and two topic hubs" :
      id.endsWith("-23") ? "methodology and trust candidates" :
      /-(?:2[4-9]|3[0-3])$/.test(id) ? "one locked five-topic bilingual article batch" :
      id.endsWith("-34") ? "approved Media Library and OG mapping" :
      id.endsWith("-35") ? "final link, canonical, hreflang, and alias graph" :
      id.endsWith("-36") ? "backend SEO/GEO and visible-evidence eligibility authority" :
      id.endsWith("-37") ? "aggregate dry-run and per-page publish eligibility gate" :
      "read-only production runtime closeout after separate production authorization and readback",
  }));
}

function buildReport(evidence) {
  assert(evidence.fermat_records.length === 127, `Expected 127 Fermat records, received ${evidence.fermat_records.length}`);
  assert(evidence.fermat_zh_legacy_aliases.length === 10, `Expected 10 zh legacy aliases, received ${evidence.fermat_zh_legacy_aliases.length}`);
  const records = evidence.fermat_records.map((record) => ({
    ...classifyPage(record.requested_url),
    ...record,
    ...scoreRecord(record, evidence.captured_at),
    cross_cutting_owner_prs: [
      "BIG5-AUTHORITY-V2-INTEGRITY-GATE-02", "BIG5-AUTHORITY-V2-PUBLIC-CONTRACT-03", "BIG5-AUTHORITY-V2-WEB-TRUST-RENDERER-04",
      "BIG5-AUTHORITY-V2-SOURCE-LEDGER-05", "BIG5-AUTHORITY-V2-EDITORIAL-GATE-06", "BIG5-AUTHORITY-V2-MEDIA-OG-34",
      "BIG5-AUTHORITY-V2-LINK-GRAPH-35", "BIG5-AUTHORITY-V2-SEO-GEO-AUTHORITY-36", "BIG5-AUTHORITY-V2-RELEASE-GATE-37",
    ],
  }));
  const count = (predicate) => records.filter(predicate).length;
  const summary = {
    personality_canonical_count: count((record) => record.requested_url.includes("/personality/big-five")),
    article_canonical_count: count((record) => record.family === "article"),
    test_canonical_count: count((record) => record.family === "test_landing"),
    topic_canonical_count: count((record) => record.family === "topic_hub"),
    total_canonical_count: records.length,
    zh_legacy_alias_count: evidence.fermat_zh_legacy_aliases.length,
    personality_hub_count: count((record) => record.family === "personality_hub"),
    domain_count: count((record) => record.family === "domain"),
    facet_hub_count: count((record) => record.family === "facet_hub"),
    range_and_legacy_count: count((record) => ["range_v2", "legacy_en_canonical"].includes(record.family)),
    facet_detail_count: count((record) => record.family === "facet_detail"),
    http_200_count: count((record) => record.http_status === 200),
    duplicate_brand_title_count: count((record) => record.duplicate_brand_title),
    internal_operational_term_page_count: count((record) => record.internal_operational_terms.length > 0),
    dead_guide_target_page_count: count((record) => record.dead_guide_targets.length > 0),
    private_path_link_page_count: count((record) => record.private_path_links.length > 0),
    visible_reviewer_page_count: count((record) => record.visible_reviewer_signal),
    visible_source_page_count: count((record) => record.visible_source_signal || record.external_evidence_link_count > 0),
  };
  assert(summary.personality_canonical_count === 114, "Personality canonical count drifted from 114");
  assert(summary.article_canonical_count === 9, "Article canonical count drifted from 9");
  assert(summary.test_canonical_count === 2, "Test canonical count drifted from 2");
  assert(summary.topic_canonical_count === 2, "Topic canonical count drifted from 2");
  assert(summary.personality_hub_count === 2, "Hub count drifted from 2");
  assert(summary.domain_count === 10, "Domain count drifted from 10");
  assert(summary.facet_hub_count === 2, "Facet hub count drifted from 2");
  assert(summary.range_and_legacy_count === 40, "Range/legacy count drifted from 40");
  assert(summary.facet_detail_count === 60, "Facet detail count drifted from 60");
  assert(records.every((record) => record.primary_owner_pr !== "UNKNOWN"), "A canonical lacks a locked primary owner PR");
  const ownership = trainOwnership();
  assert(ownership.length === 37, `Expected 37 downstream ownership entries, received ${ownership.length}`);
  return {
    id: "BIG5-AUTHORITY-V2-BENCHMARK-01",
    artifact: "BIG5-AUTHORITY-V2-VERSUS-TRUITY-PAGE-SCORECARD",
    generated_from_evidence_at: evidence.captured_at,
    final_decision: "PASS_BIG5_AUTHORITY_V2_BENCHMARK_LOCKED",
    scope: "Read-only benchmark of current public discoverability and visible HTML. Scores are comparative planning signals, not scientific or product-quality validation.",
    summary,
    score_scale: {
      range: "0-3 per dimension; conversion is 0-2",
      zero: "absent or not observed",
      one: "minimal or thin signal",
      two: "material visible signal",
      three: "strong visible signal for structural benchmarking",
      boundary: "Scores do not prove accuracy, validity, review quality, indexability eligibility, search ranking, or AI citation.",
    },
    truity_benchmark: {
      boundary: "Truity is used only for public page-family, intent, depth, evidence, trust, media, internal-link, freshness, SEO/GEO, and conversion structure. Its wording and marketing claims are not FermatMind evidence and must not be copied or paraphrased.",
      sitemap_related_urls: evidence.truity_public_landscape.sitemap_related_urls,
      family_summary: truityFamilySummary(evidence.truity_public_landscape.benchmark_pages),
      benchmark_pages: evidence.truity_public_landscape.benchmark_pages,
      technical_and_report_documents: evidence.truity_public_landscape.documents,
    },
    page_family_counts: {
      hub: 2,
      domain: 10,
      facet_hub: 2,
      range_and_en_legacy: 40,
      facet_detail: 60,
      personality_total: 114,
      articles: 9,
      tests: 2,
      topics: 2,
      canonical_total: 127,
      zh_redirect_aliases_excluded_from_canonical_total: 10,
    },
    downstream_train_ownership: ownership,
    fermat_zh_legacy_aliases: evidence.fermat_zh_legacy_aliases,
    page_scorecards: records,
    authority_boundary: {
      backend_cms_remains_authority: true,
      frontend_editorial_fallback_added: false,
      sitemap_or_llms_runtime_changed: false,
      canonical_or_indexability_changed: false,
      cms_write_attempted: false,
      production_action_attempted: false,
      competitor_copy_reused: false,
      publication_status: "benchmark_only_production_content_unchanged",
    },
    intentionally_deferred: [
      "PR02 integrity repairs and live target validation",
      "PR03 backend visible-evidence public contract",
      "PR04 fap-web trust renderer",
      "PR05-37 source, editorial, content, media, graph, authority, and release gates",
      "separately authorized production deploy/import/SEO mutations",
      "PR38 production runtime closeout after real readback",
    ],
  };
}

function renderCsv(report) {
  const header = [
    "url", "locale", "family", "primary_owner_pr", "http_status", "title", "canonical", "robots", "sitemap_lastmod",
    "visible_words", "visible_cjk_chars", "h2_count", "internal_links", "external_evidence_links", "images", "visible_author",
    "visible_reviewer", "visible_date", "visible_sources", "method_boundary", "content_depth_score", "structure_score",
    "visible_evidence_score", "author_reviewer_dates_score", "media_score", "internal_linking_score", "freshness_score",
    "seo_geo_score", "conversion_score", "score_total", "benchmark_gaps",
  ];
  const rows = report.page_scorecards.map((record) => [
    record.requested_url, record.locale, record.family, record.primary_owner_pr, record.http_status, record.title, record.canonical,
    record.robots, record.sitemap_lastmod, record.visible_word_count, record.visible_cjk_character_count, record.h2_count,
    record.internal_link_count, record.external_evidence_link_count, record.image_count, record.visible_author_signal,
    record.visible_reviewer_signal, record.visible_date_signal, record.visible_source_signal, record.visible_method_boundary_signal,
    record.scores.content_depth, record.scores.structure, record.scores.visible_evidence, record.scores.author_reviewer_dates,
    record.scores.media, record.scores.internal_linking, record.scores.freshness, record.scores.seo_geo, record.scores.conversion,
    record.score_total, record.benchmark_gaps.join("|"),
  ]);
  return `${[header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`;
}

function renderMarkdown(report) {
  const s = report.summary;
  const familyRows = [
    ["Personality hub", 2, "BIG5-AUTHORITY-V2-HUB-07"],
    ["Domains", 10, "BIG5-AUTHORITY-V2-DOMAINS-08"],
    ["Facet hubs", 2, "BIG5-AUTHORITY-V2-FACET-HUBS-09"],
    ["Ranges and EN legacy canonicals", 40, "BIG5-AUTHORITY-V2-RANGE-*-10..14"],
    ["Facet details", 60, "BIG5-AUTHORITY-V2-FACETS-*-15..19"],
    ["Test landings", 2, "BIG5-AUTHORITY-V2-TEST-LANDING-20"],
    ["Existing articles and topic hubs", 11, "BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22"],
  ];
  const records = report.page_scorecards.map((record) => `| ${new URL(record.requested_url).pathname} | ${record.family} | ${record.primary_owner_pr} | ${record.score_total} | ${record.benchmark_gaps.join(", ") || "none observed"} |`).join("\n");
  const aliasRows = report.fermat_zh_legacy_aliases.map((alias) => `| ${new URL(alias.legacy_url).pathname} | ${alias.http_status} | ${alias.location} | ${new URL(alias.expected_canonical).pathname} |`).join("\n");
  const truityRows = report.truity_benchmark.benchmark_pages.map((page) => `| ${page.family} | ${page.requested_url} | ${page.http_status} | ${page.visible_word_count} | ${page.visible_reviewer_signal ? "yes" : "no"} | ${page.external_evidence_link_count} | ${page.internal_link_count} |`).join("\n");
  return `# BIG5-AUTHORITY-V2-BENCHMARK-01 — FermatMind versus Truity\n\n` +
    `- Decision: \`${report.final_decision}\`\n` +
    `- Evidence captured: \`${report.generated_from_evidence_at}\`\n` +
    `- Canonical inventory: ${s.total_canonical_count} = ${s.personality_canonical_count} personality + ${s.article_canonical_count} articles + ${s.test_canonical_count} tests + ${s.topic_canonical_count} topics.\n` +
    `- Redirect-only inventory: ${s.zh_legacy_alias_count} zh legacy aliases, excluded from the canonical total.\n` +
    `- Boundary: read-only benchmark; no CMS write, runtime change, indexability change, deploy, or search submission.\n\n` +
    `## Ownership lock\n\n| Page family | Count | Primary content owner |\n| --- | ---: | --- |\n${familyRows.map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join("\n")}\n\n` +
    `The artifact JSON locks all 37 downstream PR02–38 ownership rows. Cross-cutting contract, source, QA, media, link-graph, SEO/GEO, release-gate, and runtime-closeout ownership remains separate from each page's primary content owner.\n\n` +
    `## Current observed integrity signals\n\n` +
    `- HTTP 200 canonicals: ${s.http_200_count}/${s.total_canonical_count}.\n` +
    `- Duplicate brand titles: ${s.duplicate_brand_title_count} pages.\n` +
    `- Visible internal operational terms: ${s.internal_operational_term_page_count} pages.\n` +
    `- Pages linking to the five named guide targets: ${s.dead_guide_target_page_count}; PR02 must resolve and validate final targets before repair.\n` +
    `- Pages with private-path links: ${s.private_path_link_page_count}.\n` +
    `- Pages with visible reviewer signals: ${s.visible_reviewer_page_count}; visible source/external-evidence signals: ${s.visible_source_page_count}.\n\n` +
    `These are snapshot observations, not publication eligibility decisions. PR02 owns integrity repairs; PR03–06 own the evidence contract and editorial gates.\n\n` +
    `## Truity structural benchmark\n\n` +
    `${report.truity_benchmark.boundary}\n\n| Family | URL | HTTP | Visible words | Reviewer signal | External evidence links | Internal links |\n| --- | --- | ---: | ---: | --- | ---: | ---: |\n${truityRows}\n\n` +
    `Observed reusable architecture patterns are a test landing with explanatory copy and FAQ, a Big Five test directory, a model hub, five domain explainers, a topic stream, a 30-trait test path, technical documentation, a sample report, and a business conversion path. FermatMind must reproduce only appropriate information architecture through backend/CMS authority; Truity claims, reviewer facts, counts, phrasing, and conversion promises are not transferable evidence.\n\n` +
    `## Ten zh redirect-only aliases\n\n| Alias | HTTP | Observed location | Expected canonical |\n| --- | ---: | --- | --- |\n${aliasRows}\n\n` +
    `## Per-page scorecard\n\n` +
    `Scores are planning signals from 0–3 per dimension (conversion 0–2). They do not prove scientific validity, content correctness, human review, search ranking, or AI citation. Detailed raw metrics and all dimensions are in the JSON and CSV.\n\n` +
    `| Path | Family | Primary owner | Total | Observed gaps |\n| --- | --- | --- | ---: | --- |\n${records}\n\n` +
    `## Repository rule impact\n\n` +
    `No authority boundary changes. fap-api remains the CMS/public-content authority; fap-web remains a consumer. This PR adds only read-only evidence, scorecard artifacts, a generator, a focused contract, and exact train bookkeeping.\n\n` +
    `## Intentionally deferred\n\n${report.intentionally_deferred.map((item) => `- ${item}`).join("\n")}\n`;
}

const evidence = ALLOW_NETWORK ? await captureLiveEvidence() : readJson(LIVE_EVIDENCE_PATH);
const report = buildReport(evidence);
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.csv`, renderCsv(report));
write(`${OUTPUT_BASE}.md`, renderMarkdown(report));
console.log(report.final_decision);
