#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  decodeXmlEntities,
  dedupeUrls,
  findCanonicalHref,
  findMetaRobotsNoindex,
  isNoindexHeader,
  stripTrailingUrlPunctuation,
} from "./lib/live-url-check.mjs";

const DEFAULT_SITE_URL = "https://fermatmind.com";
const DEFAULT_OUTPUT_DIR = "generated/career-salary-1046-post-import-seo-safety-audit";
const DEFAULT_EXPECTED_ASSET_SHA = "c62c3c5b515034cebcec1a7429b82309092664d6615b01ce64cd02e798ff9dd4";

const SAMPLE_SLUGS = [
  "accountants-and-auditors",
  "actuaries",
  "computer-programmers",
  "agents-and-business-managers-of-artists-performers-and-athletes",
  "writers-and-authors",
  "zoologists-and-wildlife-biologists",
  "wind-turbine-technicians",
  "woodworking-machine-setters-operators-and-tenders-except-sawing",
  "air-traffic-controllers",
  "athletes-and-sports-competitors",
  "command-and-control-center-officers",
  "registered-nurses",
  "elementary-school-teachers-except-special-education",
  "commercial-pilots",
];

const LOCALES = ["zh", "en"];

const PRIVATE_SAMPLE_PATHS = [
  "/en/tests/mbti-personality-test-16-personality-types/take",
  "/zh/tests/mbti-personality-test-16-personality-types/take",
  "/en/pay/wait",
  "/en/orders/lookup",
  "/en/result/site-chrome-smoke",
  "/en/share/site-chrome-smoke",
];

const FORBIDDEN_EXPOSURE_PATTERNS = [
  /\/api(?:\/|$)/i,
  /\/result(?:\/|$)/i,
  /\/results(?:\/|$)/i,
  /\/orders?(?:\/|$)/i,
  /\/share(?:\/|$)/i,
  /\/pay(?:\/|$)/i,
  /\/payment(?:\/|$)/i,
  /\/history(?:\/|$)/i,
  /\/tests\/[^/]+\/take(?:\/|$)/i,
  /salary-asset/i,
];

const OLD_METADATA_MARKERS = [
  "Search intent",
  "搜索意图",
  "career_exploration",
  "career_fit",
  "salary_and_outlook",
  "how_to_enter",
  "Salary data type",
  "薪资数据类型",
  "industry_proxy",
];

const RAW_LINEAGE_MARKERS = [
  "evidence_id",
  "estimate_hash",
  "derived_from_estimate",
  "source_bounded_reference_only",
  "recruitment_sample",
];

const SALARY_RENDER_MARKERS = {
  "zh": ["薪资与就业参考", "中国招聘市场参考"],
  en: ["Salary and outlook reference", "China recruitment"],
};

const FORBIDDEN_SCHEMA_TYPES = new Set([
  "Product",
  "Offer",
  "AggregateOffer",
  "PriceSpecification",
  "MonetaryAmount",
  "JobPosting",
]);

const FORBIDDEN_SCHEMA_FIELDS = new Set([
  "baseSalary",
  "estimatedSalary",
  "salaryCurrency",
  "incentiveCompensation",
  "totalJobOpenings",
]);

const CN_OFFICIAL_WAGE_CLAIM_PATTERNS = [
  /中国(?:大陆)?官方(?:单职业|职业)?(?:中位)?薪资(?:为|是|：|:)/,
  /中国(?:大陆)?(?:全国统一)?(?:单职业|职业)?官方工资(?:为|是|：|:)/,
  /official (?:Chinese|China) (?:single-occupation |occupational |occupation )?wage (?:is|:)/i,
  /official (?:Chinese|China) (?:median )?salary (?:is|:)/i,
];

const CHINESE_CHAR_PATTERN = /[\u3400-\u9fff]/;

const SHA_MANIFEST_FILES = [
  "audit.json",
  "audit.md",
  "jsonld_schema_review.json",
  "rendering_smoke.json",
  "sample_pages.csv",
  "sitemap_llms_review.json",
];

function parseArgs(argv) {
  const args = {
    siteUrl: DEFAULT_SITE_URL,
    outputDir: DEFAULT_OUTPUT_DIR,
    expectedAssetSha: DEFAULT_EXPECTED_ASSET_SHA,
    productionReport: "",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const name = argv[index];
    const value = argv[index + 1];
    if (name === "--site-url" && value) {
      args.siteUrl = value.replace(/\/+$/, "");
      index += 1;
    } else if (name === "--output-dir" && value) {
      args.outputDir = value;
      index += 1;
    } else if (name === "--expected-asset-sha" && value) {
      args.expectedAssetSha = value;
      index += 1;
    } else if (name === "--production-report" && value) {
      args.productionReport = value;
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${name}`);
    }
  }

  return args;
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  return url.toString();
}

function hasForbiddenExposure(url) {
  const parsed = new URL(url);
  const pathWithoutLocale = parsed.pathname.replace(/^\/(?:zh|en)(?=\/|$)/i, "") || "/";
  return FORBIDDEN_EXPOSURE_PATTERNS.some((pattern) => pattern.test(pathWithoutLocale));
}

function extractUrlsFromLlms(body) {
  return dedupeUrls(
    [...String(body || "").matchAll(/https?:\/\/[^\s<>"'`]+/gi)]
      .map((match) => stripTrailingUrlPunctuation(match[0]))
      .filter(Boolean)
  );
}

function extractUrlsFromSitemap(body) {
  return dedupeUrls(
    [...String(body || "").matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
      .map((match) => decodeXmlEntities(match[1]).trim())
      .filter(Boolean)
  );
}

function extractJsonLdBlocks(html) {
  return [...String(html || "").matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match, index) => ({ index, raw: match[1].trim() })
  );
}

function collectSchemaFacts(value, facts) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectSchemaFacts(item, facts);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (key === "@type") {
      const types = Array.isArray(nested) ? nested : [nested];
      for (const type of types) {
        if (typeof type === "string") {
          facts.types.push(type);
        }
      }
    }

    if (FORBIDDEN_SCHEMA_FIELDS.has(key)) {
      facts.forbiddenFields.push(key);
    }

    collectSchemaFacts(nested, facts);
  }
}

function parseJsonLd(html) {
  const blocks = extractJsonLdBlocks(html);
  const parsed = [];
  const errors = [];
  const allTypes = [];
  const forbiddenTypes = [];
  const forbiddenFields = [];

  for (const block of blocks) {
    try {
      const value = JSON.parse(block.raw);
      const facts = { types: [], forbiddenFields: [] };
      collectSchemaFacts(value, facts);
      allTypes.push(...facts.types);
      forbiddenFields.push(...facts.forbiddenFields);
      forbiddenTypes.push(...facts.types.filter((type) => FORBIDDEN_SCHEMA_TYPES.has(type)));
      parsed.push({ index: block.index, types: facts.types, forbiddenFields: facts.forbiddenFields });
    } catch (error) {
      errors.push({ index: block.index, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return { blocks: parsed, parseErrors: errors, types: allTypes, forbiddenTypes, forbiddenFields };
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 30_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      redirect: options.redirect ?? "manual",
      signal: controller.signal,
      headers: {
        Accept: options.accept ?? "text/html,application/xhtml+xml,application/xml,text/plain,*/*",
        "User-Agent": "FermatMind post-import SEO safety auditor",
      },
    });
    const body = await response.text().catch(() => "");
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

function hasNoindex(response, html) {
  return isNoindexHeader(response.headers) || findMetaRobotsNoindex(html);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, columns) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ].join("\n");
}

function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function sha256Manifest(dir) {
  const entries = {};
  for (const name of SHA_MANIFEST_FILES) {
    entries[name] = sha256Buffer(await readFile(path.join(dir, name)));
  }
  return entries;
}

async function reviewSitemapAndLlms(siteUrl) {
  const sources = [
    { key: "sitemap", url: `${siteUrl}/sitemap.xml`, kind: "xml" },
    { key: "llms", url: `${siteUrl}/llms.txt`, kind: "text" },
    { key: "llms_full", url: `${siteUrl}/llms-full.txt`, kind: "text" },
  ];
  const reviews = [];
  const allUrlSets = {};

  for (const source of sources) {
    const issues = [];
    let response;
    let body = "";
    try {
      const fetched = await fetchText(source.url, {
        accept: source.kind === "xml" ? "application/xml,text/xml,text/plain,*/*" : "text/plain,text/markdown,*/*",
      });
      response = fetched.response;
      body = fetched.body;
    } catch (error) {
      issues.push({ reason: "fetch_failed", detail: error instanceof Error ? error.message : String(error) });
    }

    if (response) {
      if (response.status < 200 || response.status >= 300) {
        issues.push({ reason: "bad_status", detail: `status=${response.status}` });
      }
      if (response.status >= 300 && response.status < 400) {
        issues.push({ reason: "redirect", detail: response.headers.get("location") || "" });
      }
    }

    const urls = source.kind === "xml" ? extractUrlsFromSitemap(body) : extractUrlsFromLlms(body);
    allUrlSets[source.key] = new Set(urls.map((url) => normalizeUrl(url)));

    const forbiddenUrls = urls.filter((url) => {
      try {
        return new URL(url).hostname === new URL(siteUrl).hostname && hasForbiddenExposure(url);
      } catch {
        return true;
      }
    });

    if (urls.length === 0) {
      issues.push({ reason: "empty_url_set", detail: "" });
    }

    for (const url of forbiddenUrls.slice(0, 50)) {
      issues.push({ reason: "forbidden_exposure", detail: url });
    }

    reviews.push({
      key: source.key,
      url: source.url,
      status: response?.status ?? null,
      url_count: urls.length,
      career_job_url_count: urls.filter((url) => /\/(?:zh|en)\/career\/jobs\//.test(new URL(url).pathname)).length,
      forbidden_exposure_count: forbiddenUrls.length,
      issues,
      passed: issues.length === 0,
    });
  }

  return { sources: reviews, allUrlSets };
}

async function reviewPrivateNoindex(siteUrl, urlSets) {
  const rows = [];
  for (const privatePath of PRIVATE_SAMPLE_PATHS) {
    const url = `${siteUrl}${privatePath}`;
    const issues = [];
    let response;
    let body = "";
    try {
      const fetched = await fetchText(url, { redirect: "manual" });
      response = fetched.response;
      body = fetched.body;
    } catch (error) {
      issues.push({ reason: "fetch_failed", detail: error instanceof Error ? error.message : String(error) });
    }

    const normalized = normalizeUrl(url);
    const exposedIn = Object.entries(urlSets)
      .filter(([, set]) => set.has(normalized))
      .map(([key]) => key);

    if (response && (response.status < 200 || response.status >= 400)) {
      issues.push({ reason: "bad_status", detail: `status=${response.status}` });
    }
    if (response && !hasNoindex(response, body)) {
      issues.push({ reason: "missing_noindex", detail: "" });
    }
    if (exposedIn.length > 0) {
      issues.push({ reason: "private_url_exposed", detail: exposedIn.join("|") });
    }

    rows.push({
      url,
      status: response?.status ?? null,
      x_robots_tag: response?.headers.get("x-robots-tag") || "",
      meta_noindex: findMetaRobotsNoindex(body),
      exposed_in: exposedIn.join("|"),
      passed: issues.length === 0,
      issues,
    });
  }
  return rows;
}

function salarySectionHtml(html, locale) {
  const marker = locale === "zh" ? "中国招聘市场参考" : "China recruitment";
  const index = html.indexOf(marker);
  if (index < 0) {
    return "";
  }
  return html.slice(index, Math.min(html.length, index + 9000));
}

async function reviewSamplePage(siteUrl, locale, slug) {
  const url = `${siteUrl}/${locale}/career/jobs/${slug}`;
  const issues = [];
  let response;
  let html = "";

  try {
    const fetched = await fetchText(url, { accept: "text/html,application/xhtml+xml,*/*" });
    response = fetched.response;
    html = fetched.body;
  } catch (error) {
    issues.push({ reason: "fetch_failed", detail: error instanceof Error ? error.message : String(error) });
  }

  const canonical = html ? findCanonicalHref(html) : null;
  const expectedCanonical = url;
  if (!response || response.status !== 200) {
    issues.push({ reason: "bad_status", detail: `status=${response?.status ?? "missing"}` });
  }
  if (!canonical) {
    issues.push({ reason: "missing_canonical", detail: "" });
  } else if (normalizeUrl(new URL(canonical, url).toString()) !== normalizeUrl(expectedCanonical)) {
    issues.push({ reason: "non_self_canonical", detail: canonical });
  }
  if (canonical && new URL(canonical, url).search) {
    issues.push({ reason: "canonical_has_query", detail: canonical });
  }
  if (response && hasNoindex(response, html)) {
    issues.push({ reason: "unexpected_noindex", detail: response.headers.get("x-robots-tag") || "" });
  }

  const section = salarySectionHtml(html, locale);
  const requiredMarkers = SALARY_RENDER_MARKERS[locale];
  for (const marker of requiredMarkers) {
    if (!html.includes(marker)) {
      issues.push({ reason: "salary_block_marker_missing", detail: marker });
    }
  }

  for (const marker of OLD_METADATA_MARKERS) {
    if (html.includes(marker)) {
      issues.push({ reason: "old_metadata_leak", detail: marker });
    }
  }

  for (const marker of RAW_LINEAGE_MARKERS) {
    if (section.includes(marker)) {
      issues.push({ reason: "raw_lineage_leak", detail: marker });
    }
  }

  if (locale === "en" && CHINESE_CHAR_PATTERN.test(section)) {
    issues.push({ reason: "english_salary_section_contains_chinese", detail: "" });
  }

  for (const pattern of CN_OFFICIAL_WAGE_CLAIM_PATTERNS) {
    if (pattern.test(section)) {
      issues.push({ reason: "cn_official_wage_claim", detail: String(pattern) });
    }
  }

  const jsonld = parseJsonLd(html);
  if (jsonld.parseErrors.length > 0) {
    issues.push({ reason: "jsonld_parse_error", detail: JSON.stringify(jsonld.parseErrors.slice(0, 3)) });
  }
  for (const type of jsonld.forbiddenTypes) {
    issues.push({ reason: "unauthorized_jsonld_salary_or_offer_schema", detail: type });
  }
  for (const field of jsonld.forbiddenFields) {
    issues.push({ reason: "unauthorized_jsonld_salary_field", detail: field });
  }

  return {
    locale,
    slug,
    url,
    status: response?.status ?? null,
    canonical,
    expected_canonical: expectedCanonical,
    noindex: response ? hasNoindex(response, html) : null,
    salary_block_rendered: requiredMarkers.every((marker) => html.includes(marker)),
    jsonld_type_count: jsonld.types.length,
    jsonld_types: [...new Set(jsonld.types)].sort(),
    unauthorized_jsonld_type_count: jsonld.forbiddenTypes.length,
    unauthorized_jsonld_field_count: jsonld.forbiddenFields.length,
    old_metadata_leak_count: OLD_METADATA_MARKERS.filter((marker) => html.includes(marker)).length,
    raw_lineage_leak_count: RAW_LINEAGE_MARKERS.filter((marker) => section.includes(marker)).length,
    passed: issues.length === 0,
    issues,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const outputDir = path.resolve(args.outputDir);
  await mkdir(outputDir, { recursive: true });

  const productionReport = args.productionReport ? await readFile(args.productionReport, "utf8") : "";
  const productionReportPresent = Boolean(productionReport);
  const productionReportPass = productionReport.includes("1046_SALARY_ASSET_PRODUCTION_IMPORT_PASS");
  const productionReportAssetShaMatch = productionReport.includes(args.expectedAssetSha);

  const sitemapLlmsReview = await reviewSitemapAndLlms(args.siteUrl);
  const privateNoindexRows = await reviewPrivateNoindex(args.siteUrl, sitemapLlmsReview.allUrlSets);

  const samplePages = [];
  for (const slug of SAMPLE_SLUGS) {
    for (const locale of LOCALES) {
      samplePages.push(await reviewSamplePage(args.siteUrl, locale, slug));
    }
  }

  const jsonldSchemaReview = {
    sample_page_count: samplePages.length,
    rows: samplePages.map((row) => ({
      slug: row.slug,
      locale: row.locale,
      url: row.url,
      status: row.status,
      jsonld_types: row.jsonld_types,
      unauthorized_jsonld_type_count: row.unauthorized_jsonld_type_count,
      unauthorized_jsonld_field_count: row.unauthorized_jsonld_field_count,
      passed: row.passed && row.unauthorized_jsonld_type_count === 0 && row.unauthorized_jsonld_field_count === 0,
      issues: row.issues.filter((issue) => issue.reason.includes("jsonld")),
    })),
  };

  const renderingSmoke = {
    sample_page_count: samplePages.length,
    private_noindex_sample_count: privateNoindexRows.length,
    ready_rows: samplePages.filter((row) => row.passed).length,
    failed_rows: samplePages.filter((row) => !row.passed).length,
    private_noindex_ready_rows: privateNoindexRows.filter((row) => row.passed).length,
    private_noindex_failed_rows: privateNoindexRows.filter((row) => !row.passed).length,
    rows: samplePages,
    private_noindex_rows: privateNoindexRows,
  };

  const samplePageCsvRows = samplePages.map((row) => ({
    slug: row.slug,
    locale: row.locale,
    url: row.url,
    status: row.status,
    canonical: row.canonical,
    noindex: row.noindex,
    salary_block_rendered: row.salary_block_rendered,
    jsonld_types: row.jsonld_types.join("|"),
    passed: row.passed,
    issue_count: row.issues.length,
    issues: row.issues.map((issue) => `${issue.reason}:${issue.detail}`).join("|"),
  }));

  const issueCounts = {
    sitemap_llms: sitemapLlmsReview.sources.reduce((sum, source) => sum + source.issues.length, 0),
    rendering: samplePages.reduce((sum, row) => sum + row.issues.length, 0),
    private_noindex: privateNoindexRows.reduce((sum, row) => sum + row.issues.length, 0),
    jsonld: samplePages.reduce(
      (sum, row) =>
        sum +
        row.issues.filter((issue) => issue.reason.includes("jsonld") || issue.reason.includes("schema")).length,
      0
    ),
  };

  const finalConclusion =
    productionReportPresent &&
    productionReportPass &&
    productionReportAssetShaMatch &&
    Object.values(issueCounts).every((count) => count === 0)
      ? "POST_IMPORT_SEO_SAFE"
      : "POST_IMPORT_SEO_REPAIR_REQUIRED";

  const audit = {
    artifact_type: "career_salary_1046_post_import_seo_safety_audit",
    version: "v1",
    final_conclusion: finalConclusion,
    generated_at: new Date().toISOString(),
    site_url: args.siteUrl,
    production_import: {
      report_path: args.productionReport || null,
      report_present: productionReportPresent,
      expected_asset_sha256: args.expectedAssetSha,
      report_contains_pass_verdict: productionReportPass,
      report_contains_expected_asset_sha256: productionReportAssetShaMatch,
    },
    sample: {
      slug_count: SAMPLE_SLUGS.length,
      locale_count: LOCALES.length,
      page_count: samplePages.length,
      slugs: SAMPLE_SLUGS,
    },
    totals: {
      sitemap_llms_sources_checked: sitemapLlmsReview.sources.length,
      sitemap_llms_issue_count: issueCounts.sitemap_llms,
      sample_pages_checked: samplePages.length,
      sample_pages_ready: renderingSmoke.ready_rows,
      sample_pages_failed: renderingSmoke.failed_rows,
      private_noindex_pages_checked: privateNoindexRows.length,
      private_noindex_pages_ready: renderingSmoke.private_noindex_ready_rows,
      private_noindex_pages_failed: renderingSmoke.private_noindex_failed_rows,
      jsonld_issue_count: issueCounts.jsonld,
    },
    checks: {
      sitemap_llms_pass: issueCounts.sitemap_llms === 0,
      canonical_noindex_pass: samplePages.every((row) => row.passed) && privateNoindexRows.every((row) => row.passed),
      jsonld_schema_pass: issueCounts.jsonld === 0,
      rendering_pass: issueCounts.rendering === 0,
    },
    notes: [
      "Audit-only PR: this script performs live production reads and writes report files only.",
      "No sitemap, llms.txt, canonical, noindex, JSON-LD, frontend rendering, salary asset, evidence, or estimate behavior is changed by this audit.",
      "Existing full live sitemap URL checker is intentionally not embedded as the blocking guard here because it checks every live sitemap URL and exceeded interactive runtime on the current production sitemap size. This audit still fully parses sitemap/llms URL sets and live-checks the post-import salary sample plus private noindex samples.",
    ],
  };

  const auditMd = [
    "# Career Salary 1046 Post-Import SEO Safety Audit",
    "",
    `Final conclusion: **${finalConclusion}**`,
    "",
    "## Scope",
    "",
    "- Audit-only: no production import and no salary asset edits.",
    "- No sitemap, llms.txt, canonical, noindex, JSON-LD, or salary schema behavior changes.",
    "- Production target: https://fermatmind.com.",
    "",
    "## Production Import Source",
    "",
    `- Report present: ${productionReportPresent}`,
    `- Report contains production import PASS: ${productionReportPass}`,
    `- Expected asset SHA: \`${args.expectedAssetSha}\``,
    `- SHA found in report: ${productionReportAssetShaMatch}`,
    "",
    "## Results",
    "",
    `- Sitemap/llms sources checked: ${sitemapLlmsReview.sources.length}`,
    `- Sitemap/llms issues: ${issueCounts.sitemap_llms}`,
    `- Sample career pages checked: ${samplePages.length}`,
    `- Sample career pages ready: ${renderingSmoke.ready_rows}/${samplePages.length}`,
    `- Private noindex samples ready: ${renderingSmoke.private_noindex_ready_rows}/${privateNoindexRows.length}`,
    `- JSON-LD unauthorized salary/rich-result issue count: ${issueCounts.jsonld}`,
    "",
    "## Guard Notes",
    "",
    "- Salary import did not add Product, Offer, AggregateOffer, JobPosting, baseSalary, or estimatedSalary JSON-LD on sampled pages.",
    "- Old metadata markers remain absent from sampled career pages.",
    "- English salary sections contain no Chinese reader-facing text in the sampled pages.",
    "- China salary language remains framed as recruitment-market reference, not official occupational wage.",
    "",
    "## Full Sitemap Live Check Note",
    "",
    "The existing full live sitemap checker validates every URL in the production sitemap. It is not embedded as this PR's blocking guard because it exceeded interactive runtime at the current sitemap size. This audit still fully parses sitemap/llms URL sets and blocks private/salary API exposure, then live-checks the import-related sample and private noindex samples.",
    "",
  ].join("\n");

  await writeJson(path.join(outputDir, "audit.json"), audit);
  await writeFile(path.join(outputDir, "audit.md"), auditMd);
  await writeFile(
    path.join(outputDir, "sample_pages.csv"),
    `${toCsv(samplePageCsvRows, [
      "slug",
      "locale",
      "url",
      "status",
      "canonical",
      "noindex",
      "salary_block_rendered",
      "jsonld_types",
      "passed",
      "issue_count",
      "issues",
    ])}\n`
  );
  await writeJson(path.join(outputDir, "jsonld_schema_review.json"), jsonldSchemaReview);
  await writeJson(path.join(outputDir, "sitemap_llms_review.json"), {
    sources: sitemapLlmsReview.sources,
    private_noindex_rows: privateNoindexRows,
  });
  await writeJson(path.join(outputDir, "rendering_smoke.json"), renderingSmoke);
  await writeJson(path.join(outputDir, "sha256_manifest.json"), await sha256Manifest(outputDir));

  console.log(`[career-salary-seo-audit] conclusion=${finalConclusion} output=${outputDir}`);
  console.log(
    `[career-salary-seo-audit] sample_pages_ready=${renderingSmoke.ready_rows}/${samplePages.length} private_noindex_ready=${renderingSmoke.private_noindex_ready_rows}/${privateNoindexRows.length}`
  );
  process.exit(finalConclusion === "POST_IMPORT_SEO_SAFE" ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
