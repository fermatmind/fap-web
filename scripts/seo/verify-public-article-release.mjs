#!/usr/bin/env node
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import {
  fetchNoRedirect,
  findCanonicalHref,
  isNoindexHeader,
  looksLikeHtml,
  normalizeUrlForCompare,
} from "./lib/live-url-check.mjs";
import { extractJsonLdTypesFromHtml } from "./lib/jsonld-types.mjs";

const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_SITE_URL = "https://fermatmind.com";
const DEFAULT_EXPECTED_HOST = "fermatmind.com";

function usage() {
  return `Usage: node scripts/seo/verify-public-article-release.mjs --url=<public-article-url> [options]

Options:
  --expect-title[=<exact title>]       Require a non-empty title, or an exact title when a value is provided.
  --expect-meta[=<exact description>]  Require a non-empty meta description, or an exact value when provided.
  --expect-canonical[=<url>]           Require canonical to match the provided URL, or --url when no value is provided.
  --expect-robots=index,follow         Require an index/follow robots state and no x-robots noindex.
  --expect-sitemap                     Require sitemap.xml to contain the article URL.
  --expect-llms                        Require llms.txt to contain the article path or URL.
  --expect-llms-full                   Require llms-full.txt to contain the article path or URL.
  --expect-jsonld=Article,BreadcrumbList
  --forbid-jsonld=FAQPage
  --forbid-hreflang
  --expect-hreflang=en=<url>,zh-CN=<url>,x-default=<url>
  --expect-body-visual=<public-cdn-url>
  --expect-body-anchor=<anchor-or-id>
  --expect-answer-block=<answer-block-id>
  --forbid-body-visual
  --retry=3
  --retry-delay-ms=60000
  --timeout-ms=30000
  --json
`;
}

function parseBooleanOrValue(args, index) {
  const raw = args[index];
  const equalIndex = raw.indexOf("=");
  if (equalIndex >= 0) {
    return { value: raw.slice(equalIndex + 1), consumed: 1 };
  }

  const next = args[index + 1];
  if (next && !next.startsWith("--")) {
    return { value: next, consumed: 2 };
  }

  return { value: true, consumed: 1 };
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseCsv(value) {
  if (!value || value === true) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseHreflangMap(value) {
  if (!value || value === true) {
    return {};
  }

  const map = {};
  for (const item of String(value).split(",")) {
    const trimmed = item.trim();
    if (!trimmed) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator <= 0 || separator === trimmed.length - 1) {
      throw new Error(`Invalid hreflang expectation: ${trimmed}`);
    }

    const key = trimmed.slice(0, separator).trim();
    const url = trimmed.slice(separator + 1).trim();
    if (!key || !url) {
      throw new Error(`Invalid hreflang expectation: ${trimmed}`);
    }
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      throw new Error(`Duplicate hreflang expectation: ${key}`);
    }

    map[key] = url;
  }

  return map;
}

export function parseArgs(argv) {
  const options = {
    retry: DEFAULT_RETRY_COUNT,
    retryDelayMs: DEFAULT_RETRY_DELAY_MS,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    siteUrl: DEFAULT_SITE_URL,
    expectedHost: DEFAULT_EXPECTED_HOST,
    expectTitle: false,
    expectMeta: false,
    expectCanonical: false,
    expectRobots: "",
    expectSitemap: false,
    expectLlms: false,
    expectLlmsFull: false,
    expectJsonLd: [],
    forbidJsonLd: [],
    forbidHreflang: false,
    expectHreflang: {},
    expectBodyVisual: "",
    expectBodyAnchor: "",
    expectAnswerBlock: "",
    forbidBodyVisual: false,
    json: false,
  };

  for (let i = 0; i < argv.length; ) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      i += 1;
      continue;
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.split("=")[0];
    const { value, consumed } = parseBooleanOrValue(argv, i);
    i += consumed;

    switch (key) {
      case "--url":
        options.url = String(value);
        break;
      case "--site-url":
        options.siteUrl = String(value);
        break;
      case "--expected-host":
        options.expectedHost = String(value);
        break;
      case "--expect-title":
        options.expectTitle = value;
        break;
      case "--expect-meta":
        options.expectMeta = value;
        break;
      case "--expect-canonical":
        options.expectCanonical = value;
        break;
      case "--expect-robots":
        options.expectRobots = String(value);
        break;
      case "--expect-sitemap":
        options.expectSitemap = true;
        break;
      case "--expect-llms":
        options.expectLlms = true;
        break;
      case "--expect-llms-full":
        options.expectLlmsFull = true;
        break;
      case "--expect-jsonld":
        options.expectJsonLd = parseCsv(value);
        break;
      case "--forbid-jsonld":
        options.forbidJsonLd = parseCsv(value);
        break;
      case "--forbid-hreflang":
        options.forbidHreflang = true;
        break;
      case "--expect-hreflang":
        options.expectHreflang = parseHreflangMap(value);
        break;
      case "--expect-body-visual":
        options.expectBodyVisual = String(value);
        break;
      case "--expect-body-anchor":
        options.expectBodyAnchor = String(value);
        break;
      case "--expect-answer-block":
        options.expectAnswerBlock = String(value);
        break;
      case "--forbid-body-visual":
        options.forbidBodyVisual = true;
        break;
      case "--retry":
        options.retry = parsePositiveInt(value, DEFAULT_RETRY_COUNT);
        break;
      case "--retry-delay-ms":
        options.retryDelayMs = parsePositiveInt(value, DEFAULT_RETRY_DELAY_MS);
        break;
      case "--timeout-ms":
        options.timeoutMs = parsePositiveInt(value, DEFAULT_TIMEOUT_MS);
        break;
      case "--json":
        options.json = true;
        break;
      default:
        throw new Error(`Unknown option: ${key}`);
    }
  }

  return options;
}

function readAttribute(tag, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const match = tag.match(pattern);
  return match ? match[2] ?? match[3] ?? match[4] ?? "" : "";
}

function normalizeSpace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractTitle(html) {
  const match = String(html || "").match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? normalizeSpace(match[1]) : "";
}

function extractNamedMetaContent(html, name) {
  const tags = String(html || "").match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (readAttribute(tag, "name").toLowerCase() === name.toLowerCase()) {
      return normalizeSpace(readAttribute(tag, "content"));
    }
  }

  return "";
}

function extractHreflangLinks(html, baseUrl) {
  const tags = String(html || "").match(/<link\b[^>]*>/gi) || [];
  const links = [];

  for (const tag of tags) {
    const rel = readAttribute(tag, "rel").toLowerCase();
    const hreflang = readAttribute(tag, "hreflang");
    const href = readAttribute(tag, "href");

    if (!rel.split(/\s+/).includes("alternate") || !hreflang) {
      continue;
    }

    links.push({
      hreflang,
      href: href ? new URL(href, baseUrl).toString() : "",
    });
  }

  return links;
}

function extractArticleBody(html) {
  const source = String(html || "");
  const opening = source.match(/<article\b[^>]*data-testid=["']article-detail-content["'][^>]*>/i);
  if (!opening || opening.index === undefined) {
    return "";
  }

  const start = opening.index;
  const end = source.indexOf("</article>", start + opening[0].length);
  return end >= 0 ? source.slice(start, end + "</article>".length) : "";
}

function decodedImageUrl(value, baseUrl) {
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value, baseUrl);
    if (parsed.pathname === "/_next/image" && parsed.searchParams.get("url")) {
      return new URL(parsed.searchParams.get("url"), baseUrl).toString();
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function extractBodyImages(articleBody, baseUrl) {
  const tags = String(articleBody || "").match(/<img\b[^>]*>/gi) || [];
  return tags.map((tag) => {
    const candidates = [readAttribute(tag, "src")];
    const srcset = readAttribute(tag, "srcset");
    if (srcset) {
      candidates.push(...srcset.split(",").map((item) => item.trim().split(/\s+/)[0]));
    }

    return {
      alt: normalizeSpace(readAttribute(tag, "alt")),
      className: readAttribute(tag, "class"),
      urls: Array.from(new Set(candidates.map((item) => decodedImageUrl(item, baseUrl)).filter(Boolean))),
    };
  });
}

function hasElementId(html, expectedId) {
  if (!expectedId) {
    return false;
  }
  const tags = String(html || "").match(/<[^>]+>/g) || [];
  return tags.some((tag) => readAttribute(tag, "id") === expectedId);
}

function isSafePublicBodyVisualUrl(value) {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      parsed.port === "" &&
      (host === "fermatmind.com" || host.endsWith(".fermatmind.com")) &&
      !/(?:^|[?&])(token|access_token|result_access_token|order_id|session_id)=/i.test(parsed.search)
    );
  } catch {
    return false;
  }
}

function robotsTokens(value) {
  return new Set(
    String(value || "")
      .toLowerCase()
      .split(/[,\s]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  );
}

function addIssue(issues, code, detail = "") {
  issues.push({ code, detail });
}

function sameNormalizedUrl(left, right) {
  return normalizeUrlForCompare(left) === normalizeUrlForCompare(right);
}

function expectedHreflangEntries(options) {
  const expected = options.expectHreflang || {};
  return Object.entries(expected).filter(([key, value]) => key && value);
}

async function fetchText(url, options = {}) {
  const fetched = await fetchNoRedirect(url, {
    timeoutMs: options.timeoutMs,
    expectedHost: options.expectedHost,
    accept: options.accept || "text/html,application/xhtml+xml,text/plain,application/xml,*/*",
  });

  return {
    status: fetched.response.status,
    contentType: fetched.response.headers.get("content-type") || "",
    xRobotsTag: fetched.response.headers.get("x-robots-tag") || "",
    body: fetched.body,
    noindexHeader: isNoindexHeader(fetched.response.headers),
  };
}

function checkHtml(url, fetched, options) {
  const issues = [];
  const title = extractTitle(fetched.body);
  const description = extractNamedMetaContent(fetched.body, "description");
  const robots = extractNamedMetaContent(fetched.body, "robots");
  const canonicalHref = findCanonicalHref(fetched.body);
  const canonical = canonicalHref ? new URL(canonicalHref, url).toString() : "";
  const jsonLdTypes = extractJsonLdTypesFromHtml(fetched.body);
  const hreflangLinks = extractHreflangLinks(fetched.body, url);
  const expectedCanonical =
    options.expectCanonical === true ? url : options.expectCanonical ? String(options.expectCanonical) : "";
  const articleBody = extractArticleBody(fetched.body);
  const bodyImages = extractBodyImages(articleBody, url);
  const expectedBodyVisual = String(options.expectBodyVisual || "");
  const matchingBodyImages = expectedBodyVisual
    ? bodyImages.filter((image) => image.urls.some((candidate) => sameNormalizedUrl(candidate, expectedBodyVisual)))
    : [];
  const bodyAnchorMatch = hasElementId(articleBody, String(options.expectBodyAnchor || ""));
  const answerBlockMatch = hasElementId(articleBody, String(options.expectAnswerBlock || ""));

  if ((expectedBodyVisual || options.forbidBodyVisual) && !articleBody) {
    addIssue(issues, "missing-article-body-container");
  }
  if (expectedBodyVisual) {
    if (!isSafePublicBodyVisualUrl(expectedBodyVisual)) {
      addIssue(issues, "unsafe-body-visual-url", expectedBodyVisual);
    }
    if (matchingBodyImages.length === 0) {
      addIssue(issues, "body-visual-not-public-visible", expectedBodyVisual);
    } else if (!matchingBodyImages.some((image) => image.alt !== "")) {
      addIssue(issues, "body-visual-alt-missing");
    }
  }
  if (options.expectBodyAnchor && !bodyAnchorMatch) {
    addIssue(issues, "body-anchor-mismatch", String(options.expectBodyAnchor));
  }
  if (options.expectAnswerBlock && !answerBlockMatch) {
    addIssue(issues, "answer-block-mismatch", String(options.expectAnswerBlock));
  }
  if (options.forbidBodyVisual && bodyImages.some((image) => image.className.includes("aspect-[16/9]"))) {
    addIssue(issues, "forbidden-body-visual");
  }

  if (fetched.status < 200 || fetched.status >= 300) {
    addIssue(issues, "bad-status", `status=${fetched.status}`);
  }

  if (!looksLikeHtml(fetched.contentType, fetched.body)) {
    addIssue(issues, "not-html", fetched.contentType);
  }

  if (options.expectTitle === true && !title) {
    addIssue(issues, "missing-title");
  } else if (typeof options.expectTitle === "string" && title !== options.expectTitle) {
    addIssue(issues, "title-mismatch", title);
  }

  if (options.expectMeta === true && !description) {
    addIssue(issues, "missing-meta-description");
  } else if (typeof options.expectMeta === "string" && description !== options.expectMeta) {
    addIssue(issues, "meta-description-mismatch", description);
  }

  if (expectedCanonical) {
    if (!canonical) {
      addIssue(issues, "missing-canonical");
    } else if (!sameNormalizedUrl(canonical, expectedCanonical)) {
      addIssue(issues, "canonical-mismatch", canonical);
    }
  }

  if (options.expectRobots) {
    const expectedTokens = robotsTokens(options.expectRobots);
    const actualTokens = robotsTokens(robots);
    if (fetched.noindexHeader) {
      addIssue(issues, "x-robots-noindex", fetched.xRobotsTag);
    }
    if (expectedTokens.has("index") && !actualTokens.has("index")) {
      addIssue(issues, "robots-missing-index", robots);
    }
    if (expectedTokens.has("follow") && !actualTokens.has("follow")) {
      addIssue(issues, "robots-missing-follow", robots);
    }
    if (actualTokens.has("noindex")) {
      addIssue(issues, "robots-noindex", robots);
    }
  }

  for (const expectedType of options.expectJsonLd || []) {
    if (!jsonLdTypes.includes(expectedType)) {
      addIssue(issues, "missing-jsonld", expectedType);
    }
  }

  for (const forbiddenType of options.forbidJsonLd || []) {
    if (jsonLdTypes.includes(forbiddenType)) {
      addIssue(issues, "forbidden-jsonld", forbiddenType);
    }
  }

  if (options.forbidHreflang && hreflangLinks.length > 0) {
    addIssue(issues, "forbidden-hreflang", JSON.stringify(hreflangLinks));
  }

  const expectedHreflang = expectedHreflangEntries(options);
  if (expectedHreflang.length > 0) {
    const actualByLanguage = new Map();
    for (const link of hreflangLinks) {
      if (actualByLanguage.has(link.hreflang)) {
        addIssue(issues, "duplicate-hreflang", link.hreflang);
        continue;
      }
      actualByLanguage.set(link.hreflang, link.href);
    }

    const expectedLanguages = new Set(expectedHreflang.map(([language]) => language));
    for (const [language, expectedUrl] of expectedHreflang) {
      const actualUrl = actualByLanguage.get(language);
      if (!actualUrl) {
        addIssue(issues, "missing-hreflang", language);
      } else if (!sameNormalizedUrl(actualUrl, expectedUrl)) {
        addIssue(issues, "hreflang-mismatch", `${language}: ${actualUrl}`);
      }
    }

    for (const link of hreflangLinks) {
      if (!expectedLanguages.has(link.hreflang)) {
        addIssue(issues, "unexpected-hreflang", `${link.hreflang}: ${link.href}`);
      }
    }
  }

  return {
    issues,
    html: {
      status: fetched.status,
      content_type: fetched.contentType,
      title,
      meta_description: description,
      robots,
      x_robots_tag: fetched.xRobotsTag,
      canonical,
      jsonld_types: jsonLdTypes,
      hreflang_links: hreflangLinks,
      body_visual: {
        ok:
          !expectedBodyVisual ||
          (isSafePublicBodyVisualUrl(expectedBodyVisual) &&
            matchingBodyImages.some((image) => image.alt !== "") &&
            (!options.expectBodyAnchor || bodyAnchorMatch) &&
            (!options.expectAnswerBlock || answerBlockMatch)),
        required: Boolean(expectedBodyVisual),
        url: expectedBodyVisual,
        public_visible: matchingBodyImages.length > 0,
        body_anchor_match: bodyAnchorMatch,
        answer_block_match: answerBlockMatch,
        alt_text_present: matchingBodyImages.some((image) => image.alt !== ""),
        url_count: matchingBodyImages.length,
      },
    },
  };
}

function documentContainsArticle(text, url) {
  const parsed = new URL(url);
  const pathOnly = parsed.pathname.replace(/\/+$/, "") || "/";
  const normalizedUrl = normalizeUrlForCompare(url);
  return String(text || "").includes(pathOnly) || String(text || "").includes(normalizedUrl);
}

async function checkDocumentMembership(url, documentUrl, label, options) {
  const fetched = await fetchText(documentUrl, {
    timeoutMs: options.timeoutMs,
    expectedHost: options.expectedHost,
    accept: "text/plain,application/xml,text/xml,*/*",
  });
  const contains = documentContainsArticle(fetched.body, url);
  return {
    issue: contains ? null : { code: `${label}-missing-url`, detail: documentUrl },
    check: {
      url: documentUrl,
      status: fetched.status,
      content_type: fetched.contentType,
      contains_article: contains,
    },
  };
}

async function runAttempt(options, attempt) {
  const url = options.url;
  const siteUrl = new URL(options.siteUrl || DEFAULT_SITE_URL);
  const issues = [];
  const checks = {};

  try {
    const htmlFetched = await fetchText(url, {
      timeoutMs: options.timeoutMs,
      expectedHost: options.expectedHost,
      accept: "text/html,application/xhtml+xml,*/*",
    });
    const htmlResult = checkHtml(url, htmlFetched, options);
    checks.html = htmlResult.html;
    issues.push(...htmlResult.issues);
  } catch (error) {
    addIssue(issues, "article-fetch-failed", error instanceof Error ? error.message : String(error));
  }

  const membershipChecks = [
    [options.expectSitemap, "/sitemap.xml", "sitemap"],
    [options.expectLlms, "/llms.txt", "llms"],
    [options.expectLlmsFull, "/llms-full.txt", "llms_full"],
  ];

  for (const [enabled, pathname, label] of membershipChecks) {
    if (!enabled) {
      continue;
    }

    try {
      const documentUrl = new URL(pathname, siteUrl).toString();
      const result = await checkDocumentMembership(url, documentUrl, label, options);
      checks[label] = result.check;
      if (result.issue) {
        issues.push(result.issue);
      }
    } catch (error) {
      addIssue(issues, `${label}-fetch-failed`, error instanceof Error ? error.message : String(error));
    }
  }

  return {
    attempt,
    ok: issues.length === 0,
    issues,
    checks,
  };
}

export async function verifyPublicArticleRelease(rawOptions) {
  if (!rawOptions?.url) {
    throw new Error("--url is required");
  }

  const options = {
    retry: DEFAULT_RETRY_COUNT,
    retryDelayMs: DEFAULT_RETRY_DELAY_MS,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    siteUrl: DEFAULT_SITE_URL,
    expectedHost: DEFAULT_EXPECTED_HOST,
    expectTitle: false,
    expectMeta: false,
    expectCanonical: false,
    expectRobots: "",
    expectSitemap: false,
    expectLlms: false,
    expectLlmsFull: false,
    expectJsonLd: [],
    forbidJsonLd: [],
    forbidHreflang: false,
    expectHreflang: {},
    expectBodyVisual: "",
    expectBodyAnchor: "",
    expectAnswerBlock: "",
    forbidBodyVisual: false,
    ...rawOptions,
  };
  const attempts = [];

  for (let attempt = 1; attempt <= options.retry; attempt += 1) {
    const result = await runAttempt(options, attempt);
    attempts.push(result);

    if (result.ok) {
      break;
    }

    if (attempt < options.retry && options.retryDelayMs > 0) {
      await delay(options.retryDelayMs);
    }
  }

  const finalAttempt = attempts[attempts.length - 1];
  const ok = Boolean(finalAttempt?.ok);
  const bodyVisualCheck = finalAttempt?.checks?.html?.body_visual || {
    ok: !options.expectBodyVisual,
    required: Boolean(options.expectBodyVisual),
    url: String(options.expectBodyVisual || ""),
    public_visible: false,
    body_anchor_match: false,
    answer_block_match: false,
    alt_text_present: false,
    url_count: 0,
  };

  return {
    ok,
    decision: ok ? "PUBLIC_ARTICLE_RELEASE_SMOKE_PASSED" : "BLOCKED_PUBLIC_HTML_DRIFT",
    type: "public_article_release_smoke",
    url: options.url,
    allowed_path_scope: "single_public_article",
    retry_policy: {
      attempts_requested: options.retry,
      retry_delay_ms: options.retryDelayMs,
      timeout_ms: options.timeoutMs,
    },
    attempts,
    issues: finalAttempt?.issues || [],
    checks: {
      body_visual: bodyVisualCheck,
    },
    body_visual_required: Boolean(options.expectBodyVisual),
    body_visual_url: String(options.expectBodyVisual || ""),
    body_visual_public_visible: Boolean(bodyVisualCheck.public_visible),
    body_anchor_match: Boolean(bodyVisualCheck.body_anchor_match),
    answer_block_match: Boolean(bodyVisualCheck.answer_block_match),
    alt_text_present: Boolean(bodyVisualCheck.alt_text_present),
    body_visual_url_count: Number(bodyVisualCheck.url_count || 0),
    external_search_submission_attempted: false,
    cms_content_write_attempted: false,
    production_write_attempted: false,
    token_output: false,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const result = await verifyPublicArticleRelease(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`${result.decision}: ${result.url}`);
  } else {
    console.error(`${result.decision}: ${result.url}`);
    for (const issue of result.issues) {
      console.error(`- ${issue.code}${issue.detail ? `: ${issue.detail}` : ""}`);
    }
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
