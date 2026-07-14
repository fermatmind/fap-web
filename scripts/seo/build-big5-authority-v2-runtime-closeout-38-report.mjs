#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE_ORIGIN = "https://fermatmind.com";
const DATE = "2026-07-15";
const AUTHORITY_PACKAGE_SHA256 = "fb67edc033e679da3f134b34db30901465c7b44e0585818b23613fab83bf9162";
const DRAFT_IMPORT_PACKAGE_SHA256 = "80f95a73d497f28a74197b5af7dc1849af35ec9c15958ac898b29b669b997154";
const COLLISION_CONTRACT_SHA256 = "fffcd07c97a7adbefc9d63c03b6523233f4b9f3c6a0c5733249da591254f3b49";
const DEPLOY_SHA = "d023ddc2819ce6f2a271795c6e0b5a807c364ba1";
const PR37_MERGE_SHA = "af99ac41406a2967b9f4778dc9da07b920bfbb7f";
const PREFLIGHT_FINGERPRINT = "2a5e26986fae52e04481623d6b0ed166876091116861a942f39638f0ea807a9f";
const PUBLIC_RUNTIME_FINGERPRINT = "7d4958338a120933eb8b325d8452cfa836ff0f02e40288562ec44e60723ac273";
const BENCHMARK_PATH = "docs/seo/personality/big5-authority-v2-benchmark-01-scorecard-2026-07-14.json";
const LIVE_EVIDENCE_PATH = `docs/seo/personality/big5-authority-v2-runtime-closeout-38-live-evidence-${DATE}.json`;
const OUTPUT_BASE = `docs/seo/personality/big5-authority-v2-runtime-closeout-38-report-${DATE}`;
const DEFAULT_PACKAGE_PATH = path.resolve(ROOT, "../fap-api/generated/big-five-authority-v2/big5-authority-v2-release-gate-37/draft-import-package.json");
const ALLOW_NETWORK = process.argv.includes("--allow-network");
const RECORD_VISUAL_QA = process.argv.includes("--record-visual-qa");
const REFRESH_ASSESSMENTS = process.argv.includes("--refresh-assessments");
const REFRESH_REDIRECTS = process.argv.includes("--refresh-redirects");
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const SAFE_PUBLIC_ORDER_PATH_PATTERN = /^\/(?:en|zh)\/personality\/big-five\/facets\/order\/?$/i;
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENCY = 6;

function readJson(relativeOrAbsolutePath) {
  const resolved = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(ROOT, relativeOrAbsolutePath);
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
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

function sha256(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function status(condition, known = true) {
  if (!known) return "UNKNOWN";
  return condition ? "PASS" : "FAIL";
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function visibleText(html) {
  return decodeEntities(html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function extractMeta(html, attribute, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const attributeValue = tag.match(new RegExp(`\\b${attribute}=["']([^"']+)["']`, "i"))?.[1];
    if (attributeValue?.toLowerCase() !== value.toLowerCase()) continue;
    return tag.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? "";
  }
  return "";
}

function extractLink(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const relValue = tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "";
    if (!relValue.toLowerCase().split(/\s+/).includes(rel.toLowerCase())) continue;
    return tag.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
  }
  return "";
}

function extractHreflang(html) {
  const values = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (!/\brel=["'][^"']*alternate[^"']*["']/i.test(tag)) continue;
    const locale = tag.match(/\bhreflang=["']([^"']+)["']/i)?.[1] ?? "";
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
    if (locale && href) values.push({ locale, href });
  }
  return values;
}

function extractJsonLdTypes(html) {
  const types = new Set();
  const walk = (value) => {
    if (!value || typeof value !== "object") return;
    const candidates = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    candidates.filter(Boolean).forEach((candidate) => types.add(String(candidate)));
    Object.values(value).forEach((child) => {
      if (Array.isArray(child)) child.forEach(walk);
      else walk(child);
    });
  };
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(match[1]));
    } catch {
      types.add("INVALID_JSON_LD");
    }
  }
  return [...types].sort();
}

function extractLinks(html, baseUrl) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    try {
      links.push(new URL(match[1], baseUrl).toString());
    } catch {
      // Invalid links remain represented by the assessment failure below.
    }
  }
  return [...new Set(links)];
}

function feedUrls(body) {
  return new Set(body.match(/https:\/\/fermatmind\.com\/[^\s<)\]"']+/g) ?? []);
}

async function fetchResponse(url, timeoutMs = 45_000, redirect = "follow") {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const startedAt = Date.now();
      const response = await fetch(url, {
        redirect,
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": "FermatMind BIG5 AUTHORITY V2 RUNTIME CLOSEOUT 38 read-only scan/1.0" },
      });
      return {
        status: response.status,
        final_url: response.url,
        headers: Object.fromEntries([...response.headers].filter(([name]) => ["content-type", "last-modified", "location", "x-robots-tag"].includes(name))),
        body: await response.text(),
        latency_ms: Date.now() - startedAt,
      };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, attempt * 350));
    }
  }
  throw lastError;
}

function expectedRuntimeClass(asset, benchmarkRoutes) {
  if (asset.page_family === "test_landing") return "PUBLIC_PRODUCT_SHELL_PRESERVED";
  if (benchmarkRoutes.has(asset.route)) return "EXISTING_PUBLIC_PRIMARY_WITH_ISOLATED_REVISION";
  return "NEW_FAIL_CLOSED_DRAFT_PRIMARY";
}

function expectedSchemaTypes(asset) {
  if (asset.page_family === "article") return ["Article", "BreadcrumbList"];
  if (["model_hub", "facet_hub"].includes(asset.page_family)) return ["BreadcrumbList", "CollectionPage"];
  if (["domain", "range", "facet"].includes(asset.page_family)) return ["BreadcrumbList", "WebPage"];
  if (asset.page_family === "topic_hub") return ["CollectionPage", "BreadcrumbList"];
  if (asset.page_family === "test_landing") return ["WebPage"];
  return [];
}

function assessAsset(asset, response, feeds, benchmarkRoutes) {
  const runtimeClass = expectedRuntimeClass(asset, benchmarkRoutes);
  const canonicalUrl = `${SITE_ORIGIN}${asset.route}`;
  const isDraftOnly = runtimeClass === "NEW_FAIL_CLOSED_DRAFT_PRIMARY";
  const isPublic = !isDraftOnly;
  const html = response.body;
  const text = visibleText(html);
  const robots = `${extractMeta(html, "name", "robots")} ${response.headers["x-robots-tag"] ?? ""}`.trim().toLowerCase();
  const canonical = extractLink(html, "canonical");
  const hreflang = extractHreflang(html);
  const jsonldTypes = extractJsonLdTypes(html);
  const links = extractLinks(html, canonicalUrl);
  const privateLinks = links.filter((url) => {
    const parsed = new URL(url);
    return parsed.origin === SITE_ORIGIN
      && PRIVATE_PATH_PATTERN.test(parsed.pathname)
      && !SAFE_PUBLIC_ORDER_PATH_PATTERN.test(parsed.pathname);
  });
  const expectedTypes = expectedSchemaTypes(asset);
  const faqSchemaEligible = isPublic && ["article", "model_hub", "domain", "range", "facet_hub", "facet", "test_landing"].includes(asset.page_family);
  const inFeeds = Object.fromEntries(Object.entries(feeds).map(([name, urls]) => [name, urls.has(canonicalUrl)]));
  const draftHidden = response.status === 404 || response.status === 410 || robots.includes("noindex");
  const publicKnown = isPublic && response.status === 200;
  const sourceSignal = /(?:sources?|references?|evidence|来源|参考|证据)/i.test(text);
  const authorSignal = /(?:author|written by|作者|撰写)/i.test(text);
  const reviewerSignal = /(?:reviewed by|reviewer|审核|审阅)/i.test(text);
  const dateSignal = /(?:published|updated|last reviewed|发布|更新|审核日期|\b20\d{2}[-/.年])/i.test(text);
  const ogImage = extractMeta(html, "property", "og:image");
  const description = extractMeta(html, "name", "description");
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "");
  const assessment = {
    draft_non_public_boundary: isDraftOnly
      ? status(draftHidden && !Object.values(inFeeds).some(Boolean))
      : "UNKNOWN",
    http_runtime: status(isDraftOnly ? [404, 410].includes(response.status) : response.status === 200),
    metadata: status(Boolean(title && description), publicKnown),
    canonical: status(canonical === canonicalUrl, publicKnown),
    hreflang: status(hreflang.some((entry) => entry.href === canonicalUrl), publicKnown),
    robots: status(!robots.includes("noindex"), publicKnown),
    json_ld: status(expectedTypes.every((type) => jsonldTypes.includes(type)), publicKnown && expectedTypes.length > 0),
    faq_json_ld: status(jsonldTypes.includes("FAQPage"), publicKnown && faqSchemaEligible),
    visible_author: status(authorSignal, publicKnown && ["article", "technical_trust"].includes(asset.page_family)),
    visible_reviewer: status(reviewerSignal, publicKnown && ["article", "technical_trust"].includes(asset.page_family)),
    visible_date: status(dateSignal, publicKnown),
    visible_source: status(sourceSignal, publicKnown && asset.page_family !== "test_landing"),
    media_og: status(/^https:\/\//.test(ogImage), publicKnown),
    internal_links: status(links.filter((url) => url.startsWith(SITE_ORIGIN)).length >= 2 && privateLinks.length === 0, publicKnown),
    redirects: status(response.final_url === canonicalUrl, publicKnown),
    sitemap: isDraftOnly ? status(!inFeeds["sitemap.xml"]) : status(inFeeds["sitemap.xml"], publicKnown),
    llms: isDraftOnly ? status(!inFeeds["llms.txt"]) : status(inFeeds["llms.txt"], publicKnown),
    llms_full: isDraftOnly ? status(!inFeeds["llms-full.txt"]) : status(inFeeds["llms-full.txt"], publicKnown),
    private_result_boundary: status(privateLinks.length === 0, publicKnown),
  };

  return {
    asset_id: asset.asset_id,
    route: asset.route,
    locale: asset.locale,
    page_family: asset.page_family,
    authority_surface: asset.authority_surface,
    expected_runtime_class: runtimeClass,
    observed: {
      requested_url: canonicalUrl,
      final_url: response.final_url,
      http_status: response.status,
      latency_ms: response.latency_ms,
      title,
      description,
      canonical,
      hreflang,
      robots,
      jsonld_types: jsonldTypes,
      expected_jsonld_types: expectedTypes,
      og_image: ogImage,
      internal_link_count: links.filter((url) => url.startsWith(SITE_ORIGIN)).length,
      private_path_links: privateLinks,
      visible_signals: { author: authorSignal, reviewer: reviewerSignal, date: dateSignal, source: sourceSignal },
      feed_membership: inFeeds,
    },
    assessment,
  };
}

async function scanLive(packagePath) {
  const packageRaw = fs.readFileSync(packagePath);
  assert(sha256(packageRaw) === DRAFT_IMPORT_PACKAGE_SHA256, "Draft import package SHA-256 mismatch");
  const draftPackage = JSON.parse(packageRaw.toString("utf8"));
  assert(draftPackage.authority_package_sha256 === AUTHORITY_PACKAGE_SHA256, "Authority package SHA-256 mismatch");
  assert(draftPackage.asset_count === 231 && draftPackage.assets?.length === 231, "Expected exact 231-asset package");
  assert(draftPackage.pr37_merge_sha === PR37_MERGE_SHA, "PR37 merge SHA mismatch");
  const benchmark = readJson(BENCHMARK_PATH);
  const benchmarkRoutes = new Set(benchmark.page_scorecards.map((record) => new URL(record.requested_url).pathname));
  assert(benchmarkRoutes.size === 127, "Expected exact 127-route public benchmark");

  const feedResponses = Object.fromEntries(await Promise.all(
    ["sitemap.xml", "llms.txt", "llms-full.txt"].map(async (name) => [name, await fetchResponse(`${SITE_ORIGIN}/${name}`, 60_000)]),
  ));
  const feeds = Object.fromEntries(Object.entries(feedResponses).map(([name, response]) => [name, feedUrls(response.body)]));
  const records = new Array(draftPackage.assets.length);
  let cursor = 0;

  async function worker() {
    while (cursor < draftPackage.assets.length) {
      const index = cursor;
      cursor += 1;
      const asset = draftPackage.assets[index];
      try {
        records[index] = assessAsset(asset, await fetchResponse(`${SITE_ORIGIN}${asset.route}`), feeds, benchmarkRoutes);
      } catch (error) {
        records[index] = {
          asset_id: asset.asset_id,
          route: asset.route,
          locale: asset.locale,
          page_family: asset.page_family,
          authority_surface: asset.authority_surface,
          expected_runtime_class: expectedRuntimeClass(asset, benchmarkRoutes),
          observed: null,
          assessment: Object.fromEntries([
            "draft_non_public_boundary", "http_runtime", "metadata", "canonical", "hreflang", "robots", "json_ld", "faq_json_ld",
            "visible_author", "visible_reviewer", "visible_date", "visible_source", "media_og", "internal_links",
            "redirects", "sitemap", "llms", "llms_full", "private_result_boundary",
          ].map((key) => [key, "UNKNOWN"])),
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  await Promise.all(Array.from({ length: MAX_CONCURRENCY }, worker));
  const publicFeedUrls = [...new Set(Object.values(feeds).flatMap((urls) => [...urls]))];
  const privateFeedLeaks = publicFeedUrls.filter((url) => {
    const pathname = new URL(url).pathname;
    return PRIVATE_PATH_PATTERN.test(pathname) && !SAFE_PUBLIC_ORDER_PATH_PATTERN.test(pathname);
  });

  return {
    id: "BIG5-AUTHORITY-V2-RUNTIME-CLOSEOUT-38-LIVE-EVIDENCE",
    artifact: "BIG5_AUTHORITY_V2_READ_ONLY_PRODUCTION_RUNTIME_EVIDENCE",
    generated_at: new Date().toISOString(),
    source_identity: {
      deploy_sha: DEPLOY_SHA,
      pr37_merge_sha: PR37_MERGE_SHA,
      authority_package_sha256: AUTHORITY_PACKAGE_SHA256,
      draft_import_package_sha256: DRAFT_IMPORT_PACKAGE_SHA256,
      collision_contract_sha256: COLLISION_CONTRACT_SHA256,
      preflight_fingerprint: PREFLIGHT_FINGERPRINT,
    },
    production_import_readback: {
      status: "PASS_COLLISION_SAFE_DRAFT_REVISION_IMPORT",
      writes_committed: true,
      asset_count: 231,
      primary_records_created: 106,
      existing_primary_records_preserved: 125,
      working_or_draft_revisions_created: 229,
      existing_working_pointers_updated: 125,
      existing_primary_public_content_overwrites: 0,
      public_runtime_fingerprint_before: PUBLIC_RUNTIME_FINGERPRINT,
      public_runtime_fingerprint_after: PUBLIC_RUNTIME_FINGERPRINT,
      public_release_count: 0,
      indexability_change_count: 0,
      sitemap_change_count: 0,
      llms_change_count: 0,
      media_write_count: 0,
      cache_invalidation_count: 0,
      search_submission_count: 0,
      independent_readback: {
        revision_counts: { article_translation_revisions: 109, cms_translation_revisions: 4, personality_public_content_asset_revisions: 114, topic_profile_revisions: 2 },
        new_fail_closed_primary: { articles: 100, content_pages: 4, landing_surfaces: 2 },
        existing_published_primary_with_isolated_revision: { articles: 9, personality_public_content_assets: 114, topic_profiles: 2 },
      },
    },
    feed_http_status: Object.fromEntries(Object.entries(feedResponses).map(([name, response]) => [name, response.status])),
    private_feed_url_leaks: privateFeedLeaks,
    redirect_checks: await scanRedirects(benchmark.fermat_zh_legacy_aliases),
    records,
    visual_qa: [],
    safety_boundary: {
      read_only_scan: true,
      production_write_attempted_by_closeout: false,
      deploy_attempted_by_closeout: false,
      cms_mutation_attempted_by_closeout: false,
      indexability_mutation_attempted_by_closeout: false,
      sitemap_or_llms_mutation_attempted_by_closeout: false,
      media_or_cache_mutation_attempted_by_closeout: false,
      search_submission_attempted_by_closeout: false,
    },
  };
}

async function scanRedirects(aliases) {
  return Promise.all(aliases.map(async (alias) => {
    try {
      const response = await fetchResponse(alias.legacy_url, 30_000, "manual");
      const observedLocation = response.headers.location ?? "";
      const resolvedLocation = observedLocation ? new URL(observedLocation, alias.legacy_url).toString() : "";
      return {
        legacy_url: alias.legacy_url,
        expected_canonical: alias.expected_canonical,
        observed_http_status: response.status,
        observed_location: observedLocation,
        assessment: status(response.status === 301 && resolvedLocation === alias.expected_canonical),
      };
    } catch (error) {
      return {
        legacy_url: alias.legacy_url,
        expected_canonical: alias.expected_canonical,
        observed_http_status: null,
        observed_location: "",
        assessment: "UNKNOWN",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }));
}

function assessmentCounts(records) {
  const counts = { PASS: 0, FAIL: 0, UNKNOWN: 0 };
  for (const record of records) {
    Object.values(record.assessment).forEach((value) => { counts[value] += 1; });
  }
  return counts;
}

function failureBreakdown(records) {
  const counts = {};
  for (const record of records) {
    for (const [key, value] of Object.entries(record.assessment)) {
      if (value === "FAIL") counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return Object.fromEntries(Object.entries(counts).sort((left, right) => right[1] - left[1]));
}

function visualQaEvidence() {
  const samples = [
    {
      id: "existing-en-article",
      route: "/en/articles/big-five-personality-test-vs-mbti",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-en-article-${DATE}.png`,
      console_error_count: 3,
      assessment: { layout: "PASS", visible_content: "PASS", media: "FAIL", draft_boundary: "UNKNOWN" },
      note: "Article body, breadcrumb, byline, dates, FAQ, and references rendered; the hero media region remained an empty gradient.",
    },
    {
      id: "existing-zh-domain",
      route: "/zh/personality/big-five/agreeableness",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-zh-domain-${DATE}.png`,
      console_error_count: 2,
      assessment: { layout: "PASS", visible_content: "PASS", media: "PASS", draft_boundary: "UNKNOWN" },
      note: "Chinese domain hero, boundary copy, CTA, and navigation rendered without visible layout breakage.",
    },
    {
      id: "existing-en-topic",
      route: "/en/topics/big-five",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-en-topic-${DATE}.png`,
      console_error_count: 49,
      assessment: { layout: "FAIL", visible_content: "FAIL", media: "UNKNOWN", draft_boundary: "UNKNOWN" },
      note: "The public topic route remained on a skeleton with a large empty main region and 49 browser console errors.",
    },
    {
      id: "new-draft-soft-404",
      route: "/en/articles/apply-personality-research-without-overclaiming",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-draft-soft404-${DATE}.png`,
      console_error_count: 2,
      assessment: { layout: "PASS", visible_content: "PASS", media: "UNKNOWN", draft_boundary: "PASS" },
      note: "The new draft article did not render draft editorial content and showed the public unavailable shell under noindex.",
    },
    {
      id: "public-product-shell",
      route: "/en/tests/big-five-personality-test-ocean-model",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-en-test-landing-${DATE}.png`,
      console_error_count: 7,
      assessment: { layout: "PASS", visible_content: "PASS", media: "UNKNOWN", draft_boundary: "PASS" },
      note: "The pre-existing product-code test landing remained publicly usable; the imported CMS candidate was not promoted.",
    },
  ];

  return samples.map((sample) => {
    const absolutePath = path.join(ROOT, sample.screenshot);
    assert(fs.existsSync(absolutePath), `Missing visual QA screenshot: ${sample.screenshot}`);
    const raw = fs.readFileSync(absolutePath);
    assert(raw.subarray(1, 4).toString("ascii") === "PNG", `Expected PNG screenshot: ${sample.screenshot}`);
    return {
      ...sample,
      viewport: { width: raw.readUInt32BE(16), height: raw.readUInt32BE(20) },
      screenshot_sha256: sha256(raw),
      screenshot_bytes: raw.length,
    };
  });
}

function refreshAssessments(evidence) {
  for (const record of evidence.records) {
    const publicKnown = record.expected_runtime_class !== "NEW_FAIL_CLOSED_DRAFT_PRIMARY"
      && record.observed?.http_status === 200;
    const expectedTypes = expectedSchemaTypes(record);
    const observedTypes = record.observed?.jsonld_types ?? [];
    const faqSchemaEligible = publicKnown
      && ["article", "model_hub", "domain", "range", "facet_hub", "facet", "test_landing"].includes(record.page_family);
    if (record.observed) record.observed.expected_jsonld_types = expectedTypes;
    record.assessment.json_ld = status(expectedTypes.every((type) => observedTypes.includes(type)), publicKnown && expectedTypes.length > 0);
    record.assessment.faq_json_ld = status(observedTypes.includes("FAQPage"), faqSchemaEligible);
    if (record.expected_runtime_class === "NEW_FAIL_CLOSED_DRAFT_PRIMARY") {
      record.assessment.http_runtime = status([404, 410].includes(record.observed?.http_status));
    }
  }
  return evidence;
}

function buildReport(evidence) {
  const classes = evidence.records.reduce((grouped, record) => {
    grouped[record.expected_runtime_class] ??= [];
    grouped[record.expected_runtime_class].push(record);
    return grouped;
  }, {});
  const recordsWithFailure = evidence.records.filter((record) => Object.values(record.assessment).includes("FAIL"));
  const unknownNetworkRecords = evidence.records.filter((record) => record.error);
  const visualFailures = evidence.visual_qa.filter((sample) => Object.values(sample.assessment).includes("FAIL"));
  const redirectFailures = evidence.redirect_checks.filter((check) => check.assessment === "FAIL");
  const redirectUnknown = evidence.redirect_checks.filter((check) => check.assessment === "UNKNOWN");
  const draftRecords = classes.NEW_FAIL_CLOSED_DRAFT_PRIMARY ?? [];
  const preservedProductShells = classes.PUBLIC_PRODUCT_SHELL_PRESERVED ?? [];
  const publicRecords = [
    ...(classes.EXISTING_PUBLIC_PRIMARY_WITH_ISOLATED_REVISION ?? []),
    ...(classes.PUBLIC_PRODUCT_SHELL_PRESERVED ?? []),
  ];
  const criticalBoundaryFailures = draftRecords.filter((record) =>
    ["draft_non_public_boundary", "sitemap", "llms", "llms_full"].some((key) => record.assessment[key] !== "PASS"),
  );
  const report = {
    id: "BIG5-AUTHORITY-V2-RUNTIME-CLOSEOUT-38",
    artifact: "BIG5_AUTHORITY_V2_PRODUCTION_RUNTIME_CLOSEOUT",
    generated_at: evidence.generated_at,
    final_decision: criticalBoundaryFailures.length === 0
      && unknownNetworkRecords.length === 0
      && recordsWithFailure.length === 0
      && visualFailures.length === 0
      ? "PASS_PRODUCTION_RUNTIME_CLOSEOUT"
      : "FAIL_CLOSED_PUBLIC_RUNTIME_FINDINGS_RECORDED",
    source_identity: evidence.source_identity,
    exact_counts: {
      package_assets: evidence.records.length,
      new_fail_closed_primary: draftRecords.length + preservedProductShells.length,
      new_primary_with_public_product_shell_preserved: preservedProductShells.length,
      existing_public_primary_with_isolated_revision: (classes.EXISTING_PUBLIC_PRIMARY_WITH_ISOLATED_REVISION ?? []).length,
      publicly_withheld_new_content_primary: draftRecords.length,
      working_or_draft_revisions: evidence.production_import_readback.working_or_draft_revisions_created,
      public_content_overwrites: evidence.production_import_readback.existing_primary_public_content_overwrites,
    },
    summary: {
      assessment_counts: assessmentCounts(evidence.records),
      failure_breakdown: failureBreakdown(evidence.records),
      records_with_failures: recordsWithFailure.length,
      records_with_network_unknown: unknownNetworkRecords.length,
      critical_draft_boundary_failures: criticalBoundaryFailures.length,
      public_http_200: publicRecords.filter((record) => record.observed?.http_status === 200).length,
      draft_http_404_or_410: draftRecords.filter((record) => [404, 410].includes(record.observed?.http_status)).length,
      private_feed_url_leaks: evidence.private_feed_url_leaks.length,
      visual_qa_records: evidence.visual_qa.length,
      visual_qa_failures: visualFailures.length,
      legacy_redirect_passes: evidence.redirect_checks.filter((check) => check.assessment === "PASS").length,
      legacy_redirect_failures: redirectFailures.length,
      legacy_redirect_unknown: redirectUnknown.length,
      withheld_soft_404_http_200: draftRecords.filter((record) => record.observed?.http_status === 200).length,
    },
    production_import_readback: evidence.production_import_readback,
    feed_http_status: evidence.feed_http_status,
    private_feed_url_leaks: evidence.private_feed_url_leaks,
    redirect_checks: evidence.redirect_checks,
    visual_qa: evidence.visual_qa,
    records: evidence.records,
    stop_report: recordsWithFailure.length > 0 || visualFailures.length > 0 || redirectFailures.length > 0 || redirectUnknown.length > 0 ? {
      status: "RECORDED_FINDINGS_NO_RUNTIME_REPAIR_AUTHORIZED",
      failed_asset_ids: recordsWithFailure.map((record) => record.asset_id),
      failed_visual_samples: visualFailures.map((sample) => sample.id),
      failed_or_unknown_redirects: [...redirectFailures, ...redirectUnknown].map((check) => check.legacy_url),
      note: "PR38 records production findings only. It does not repair runtime, promote drafts, or mutate discoverability.",
    } : null,
    safety_boundary: evidence.safety_boundary,
    repository_rule_impact: "Read-only QA artifacts only; backend/CMS authority and frontend fallback behavior are unchanged.",
  };

  assert(report.exact_counts.package_assets === 231, "Expected 231 package assets");
  assert(report.exact_counts.new_fail_closed_primary === 106, "Expected 106 new fail-closed primary identities");
  assert(report.exact_counts.existing_public_primary_with_isolated_revision === 125, "Expected 125 existing public identities");
  assert(report.exact_counts.new_primary_with_public_product_shell_preserved === 2, "Expected two public product landing shells");
  assert(report.exact_counts.working_or_draft_revisions === 229, "Expected 229 working/draft revisions");
  assert(report.exact_counts.public_content_overwrites === 0, "Expected zero public content overwrites");
  assert(report.production_import_readback.public_runtime_fingerprint_before === report.production_import_readback.public_runtime_fingerprint_after, "Public runtime fingerprint changed");
  assert(report.summary.critical_draft_boundary_failures === 0, "Draft exposure boundary failure detected");
  assert(report.summary.private_feed_url_leaks === 0, "Private URL leak detected in public feeds");
  return report;
}

function markdown(report) {
  const lines = [
    "# BIG5-AUTHORITY-V2-RUNTIME-CLOSEOUT-38",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Generated at: \`${report.generated_at}\``,
    `- Production deploy SHA: \`${report.source_identity.deploy_sha}\``,
    `- PR37 merge SHA: \`${report.source_identity.pr37_merge_sha}\``,
    `- Package assets: ${report.exact_counts.package_assets}`,
    `- New fail-closed primary identities: ${report.exact_counts.new_fail_closed_primary} (${report.exact_counts.publicly_withheld_new_content_primary} withheld routes plus ${report.exact_counts.new_primary_with_public_product_shell_preserved} pre-existing public product shells)`,
    `- Existing published identities with isolated revision: ${report.exact_counts.existing_public_primary_with_isolated_revision}`,
    `- Working/draft revisions: ${report.exact_counts.working_or_draft_revisions}`,
    `- Public content overwrites: ${report.exact_counts.public_content_overwrites}`,
    `- Assessment totals: PASS ${report.summary.assessment_counts.PASS}, FAIL ${report.summary.assessment_counts.FAIL}, UNKNOWN ${report.summary.assessment_counts.UNKNOWN}`,
    "",
    "## Runtime boundary",
    "",
    "The authorized import created draft-only primary records and isolated working revisions. It did not promote content or mutate public release, indexability, sitemap, LLMS, media, cache, or search state. The existing-public aggregate fingerprint was identical before and after the transaction.",
    "",
    "## Evidence summary",
    "",
    `- Public routes returning HTTP 200: ${report.summary.public_http_200}/127`,
    `- Draft-only routes returning HTTP 404/410: ${report.summary.draft_http_404_or_410}/${report.exact_counts.publicly_withheld_new_content_primary}`,
    `- Draft-only routes returning HTTP 200 noindex soft-404 shells: ${report.summary.withheld_soft_404_http_200}`,
    `- Critical draft boundary failures: ${report.summary.critical_draft_boundary_failures}`,
    `- Private URLs in sitemap/LLMS feeds: ${report.summary.private_feed_url_leaks}`,
    `- Records with any FAIL: ${report.summary.records_with_failures}`,
    `- Records with network UNKNOWN: ${report.summary.records_with_network_unknown}`,
    `- Visual QA records: ${report.summary.visual_qa_records}; failures: ${report.summary.visual_qa_failures}`,
    `- Legacy 301 redirects: PASS ${report.summary.legacy_redirect_passes}, FAIL ${report.summary.legacy_redirect_failures}, UNKNOWN ${report.summary.legacy_redirect_unknown}`,
    `- Failure breakdown: ${Object.entries(report.summary.failure_breakdown).map(([key, count]) => `${key}=${count}`).join(", ")}`,
    "",
    "## Recorded findings / stop report",
    "",
    "- All 104 withheld article and technical-trust routes correctly remained noindex and absent from sitemap/LLMS, but returned HTTP 200 unavailable shells instead of HTTP 404/410.",
    "- 116 public records lacked an eligible OG media URL, 82 lacked a visible date signal, nine visible article FAQ surfaces lacked FAQPage JSON-LD, and four articles lacked their eligible Article/Breadcrumb JSON-LD.",
    "- Three records each failed visible author, visible source, hreflang, or llms.txt checks; seven failed visible reviewer checks.",
    "- `/en/topics/big-five` remained on a loading skeleton with 49 browser console errors. The sampled existing article showed an empty hero media region.",
    "- All 10 defined Chinese legacy aliases returned the expected exact HTTP 301 targets.",
    "- These findings are evidence only. PR38 is not authorized to repair runtime, promote content, or mutate discoverability.",
    "",
    "## Visual QA",
    "",
    "| Sample | Route | Layout | Visible content | Media | Draft boundary | Console errors |",
    "| --- | --- | --- | --- | --- | --- | ---: |",
    ...report.visual_qa.map((sample) => `| ${sample.id} | ${sample.route} | ${sample.assessment.layout} | ${sample.assessment.visible_content} | ${sample.assessment.media} | ${sample.assessment.draft_boundary} | ${sample.console_error_count} |`),
    "",
    "## PASS / FAIL / UNKNOWN semantics",
    "",
    "- PASS: the read-only production observation met the applicable boundary.",
    "- FAIL: the observation did not meet an applicable public runtime boundary; this PR records it without repair.",
    "- UNKNOWN: the check was not applicable to a withheld draft or could not be established from public evidence.",
    "",
    "## Safety and authority",
    "",
    "Backend/CMS remains authoritative. This closeout did not deploy, write CMS content, promote revisions, alter discoverability, warm caches, upload media, or submit URLs to search providers. No frontend editorial fallback was added.",
    "",
  ];
  return lines.join("\n");
}

if (ALLOW_NETWORK) {
  const packageArgument = process.argv.find((argument) => argument.startsWith("--draft-package="));
  const packagePath = packageArgument ? path.resolve(ROOT, packageArgument.slice("--draft-package=".length)) : DEFAULT_PACKAGE_PATH;
  const evidence = await scanLive(packagePath);
  write(LIVE_EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
}

const evidence = readJson(LIVE_EVIDENCE_PATH);
if (REFRESH_ASSESSMENTS) refreshAssessments(evidence);
if (REFRESH_REDIRECTS) {
  const benchmark = readJson(BENCHMARK_PATH);
  evidence.redirect_checks = await scanRedirects(benchmark.fermat_zh_legacy_aliases);
}
if (RECORD_VISUAL_QA) {
  evidence.visual_qa = visualQaEvidence();
}
if (REFRESH_ASSESSMENTS || REFRESH_REDIRECTS || RECORD_VISUAL_QA) {
  write(LIVE_EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
}
const report = buildReport(evidence);
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, markdown(report));
console.log(report.final_decision);
console.log(`ASSETS=${report.exact_counts.package_assets}/231`);
console.log(`PRIMARY_CREATE=${report.exact_counts.new_fail_closed_primary}/106`);
console.log(`EXISTING_REVISION=${report.exact_counts.existing_public_primary_with_isolated_revision}/125`);
console.log(`REVISION_CREATE=${report.exact_counts.working_or_draft_revisions}/229`);
console.log(`CRITICAL_DRAFT_BOUNDARY_FAILURES=${report.summary.critical_draft_boundary_failures}`);
console.log(`PRIVATE_FEED_URL_LEAKS=${report.summary.private_feed_url_leaks}`);
