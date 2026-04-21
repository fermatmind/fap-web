#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const DEFAULT_TIMEOUT_MS = 2500;
const DEFAULT_ORG_ID = "0";
const LOCALHOST_PATTERN = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/)?$/i;
const RECOMMENDED_ARTICLE_BLOCK_KEYS = new Set(["recommended_articles", "homepage_recommended_articles"]);
const REQUIRED_HOME_QUICK_START_HREFS = [
  "/tests/mbti-personality-test-16-personality-types",
  "/tests/big-five-personality-test-ocean-model",
  "/tests/enneagram-personality-test-nine-types",
  "/career/tests/riasec",
  "/tests/iq-test-intelligence-quotient-assessment",
  "/tests/clinical-depression-anxiety-assessment-professional-edition",
];
const REQUIRED_SCALE_LOOKUP_SLUGS = [
  "mbti-personality-test-16-personality-types",
  "big-five-personality-test-ocean-model",
  "enneagram-personality-test-nine-types",
  "iq-test-intelligence-quotient-assessment",
  "clinical-depression-anxiety-assessment-professional-edition",
];
const REQUIRED_SCALE_QUESTION_FORMS = [
  {
    label: "MBTI 144Q",
    scaleCode: "MBTI",
    formCode: "mbti_144",
    minQuestions: 144,
  },
  {
    label: "MBTI 93Q",
    scaleCode: "MBTI",
    formCode: "mbti_93",
    minQuestions: 93,
  },
];
const REQUIRED_STATIC_MEDIA_ASSETS = [
  {
    label: "footer WeChat official QR",
    path: "/static/social/wechat-qr-official-258.jpg",
  },
  {
    label: "footer WeChat fallback QR",
    path: "/static/social/wechat-qr.jpg",
  },
  {
    label: "default MBTI share image",
    path: "/static/share/mbti_wide_1200x630.png",
  },
  {
    label: "default test cover image",
    path: "/static/share/mbti_square_600x600.png",
  },
];

function parseEnvFile(pathname) {
  if (!existsSync(pathname)) return {};

  const result = {};
  const content = readFileSync(pathname, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function readEnvValue(key) {
  const cwd = process.cwd();
  const fileEnv = {
    ...parseEnvFile(resolve(cwd, ".env")),
    ...parseEnvFile(resolve(cwd, ".env.local")),
  };

  return process.env[key] || fileEnv[key] || "";
}

function normalizeOrigin(value) {
  const normalized = String(value ?? "").trim().replace(/\/$/, "");
  if (!normalized) return "";
  return /^https?:\/\//i.test(normalized) ? normalized : "";
}

function readTimeoutMs() {
  const rawValue = Number.parseInt(String(process.env.CMS_API_HEALTH_TIMEOUT_MS ?? ""), 10);
  if (Number.isFinite(rawValue) && rawValue > 0) return rawValue;
  return DEFAULT_TIMEOUT_MS;
}

function buildArticlesHealthUrl(origin) {
  const url = new URL("/api/v0.5/articles", origin);
  url.searchParams.set("locale", "zh-CN");
  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", "6");
  url.searchParams.set("org_id", DEFAULT_ORG_ID);
  return url;
}

function buildHomeSurfaceHealthUrl(origin) {
  const url = new URL("/api/v0.5/landing-surfaces/home", origin);
  url.searchParams.set("locale", "zh-CN");
  url.searchParams.set("org_id", DEFAULT_ORG_ID);
  return url;
}

function buildScaleLookupHealthUrl(origin, slug) {
  const url = new URL("/api/v0.3/scales/lookup", origin);
  url.searchParams.set("slug", slug);
  url.searchParams.set("locale", "zh-CN");
  return url;
}

function buildScaleQuestionsHealthUrl(origin, scaleCode, formCode) {
  const url = new URL(`/api/v0.3/scales/${encodeURIComponent(scaleCode)}/questions`, origin);
  url.searchParams.set("form_code", formCode);
  url.searchParams.set("locale", "zh-CN");
  return url;
}

function buildStaticMediaHealthUrl(origin, pathname) {
  return new URL(pathname, origin);
}

function readBooleanEnv(key, fallback = false) {
  const value = String(readEnvValue(key) || "").trim().toLowerCase();
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return String(value ?? "").trim();
}

function normalizeArticleRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const wrapper = value;
  const article = wrapper.article && typeof wrapper.article === "object" && !Array.isArray(wrapper.article)
    ? wrapper.article
    : wrapper;
  return article && typeof article === "object" && !Array.isArray(article) ? article : null;
}

function isPublishedPublicZhArticle(value) {
  const article = normalizeArticleRecord(value);
  if (!article) return false;
  return (
    text(article.slug) &&
    text(article.title) &&
    text(article.locale).toLowerCase() === "zh-cn" &&
    text(article.status || "published") === "published" &&
    article.is_public !== false
  );
}

function recommendedArticlesFromLandingSurface(payload) {
  const blocks = asArray(payload?.surface?.page_blocks);
  const block = blocks
    .filter((item) => item?.is_enabled !== false && RECOMMENDED_ARTICLE_BLOCK_KEYS.has(text(item?.block_key)))
    .sort((a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0))[0];

  if (!block) return [];

  const blockPayload = block.payload_json;
  if (Array.isArray(blockPayload)) return blockPayload;
  if (blockPayload && typeof blockPayload === "object") {
    if (Array.isArray(blockPayload.items)) return blockPayload.items;
    if (Array.isArray(blockPayload.articles)) return blockPayload.articles;
  }

  return [];
}

function quickStartItemsFromLandingSurface(payload) {
  const items = asArray(payload?.surface?.payload_json?.quickStart?.items);
  if (items.length > 0) return items;

  const blocks = asArray(payload?.surface?.page_blocks);
  const block = blocks
    .filter((item) => item?.is_enabled !== false && text(item?.block_key).toLowerCase() === "quickstart")
    .sort((a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0))[0];

  return asArray(block?.payload_json?.items);
}

function warn(lines) {
  console.warn(lines.join("\n"));
}

function fail(lines) {
  console.error(lines.join("\n"));
  process.exit(1);
}

const configuredOrigin = normalizeOrigin(readEnvValue("NEXT_PUBLIC_API_URL"));
const apiOrigin = configuredOrigin || DEFAULT_API_ORIGIN;
const timeoutMs = readTimeoutMs();
const isLocalApi = LOCALHOST_PATTERN.test(apiOrigin);
const strictMode = readBooleanEnv("CMS_API_HEALTH_STRICT", true);
const articlesHealthUrl = buildArticlesHealthUrl(apiOrigin);
const homeSurfaceHealthUrl = buildHomeSurfaceHealthUrl(apiOrigin);

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url.pathname}${url.search}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Non-JSON response for ${url.pathname}${url.search}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

async function fetchHead(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        accept: "image/*",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url.pathname}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error(`Non-image response for ${url.pathname}`);
    }

    return true;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

function reportProblem(lines) {
  const message = [
    ...lines,
    `[check-cms-api] NEXT_PUBLIC_API_URL=${apiOrigin}`,
    "[check-cms-api] CMS-backed content must come from backend CMS/API; do not patch frontend fallback content.",
    "[check-cms-api] Use production/staging API for frontend review, or start and seed the local backend before using localhost.",
  ];

  if (strictMode) {
    fail([
      "[check-cms-api] Error: required CMS API health check failed.",
      ...message,
      "[check-cms-api] Set CMS_API_HEALTH_STRICT=0 only for intentionally degraded product-shell work.",
    ]);
  }

  warn(["[check-cms-api] Warning: CMS API health check found degraded content.", ...message]);
}

try {
  const [articlesPayload, homeSurfacePayload] = await Promise.all([
    fetchJson(articlesHealthUrl),
    fetchJson(homeSurfaceHealthUrl),
  ]);

  const articleItems = asArray(articlesPayload?.items).filter(isPublishedPublicZhArticle);
  const recommendedArticles = recommendedArticlesFromLandingSurface(homeSurfacePayload).filter(isPublishedPublicZhArticle);
  const quickStartHrefs = quickStartItemsFromLandingSurface(homeSurfacePayload).map((item) => text(item?.href));
  const problems = [];

  if (articleItems.length === 0) {
    problems.push("[check-cms-api] Article list returned no published public zh-CN article records for the smoke query.");
  }

  if (recommendedArticles.length < 6) {
    problems.push(
      `[check-cms-api] Homepage recommended_articles block expected 6 published public zh-CN articles, found ${recommendedArticles.length}.`
    );
  }

  const missingQuickStartHrefs = REQUIRED_HOME_QUICK_START_HREFS.filter((href) => !quickStartHrefs.includes(href));
  const disallowedQuickStartHrefs = quickStartHrefs.filter(
    (href) => href === "/tests" || href.endsWith("/take")
  );

  if (missingQuickStartHrefs.length > 0) {
    problems.push(
      `[check-cms-api] Homepage quickStart expected dedicated test pages, missing: ${missingQuickStartHrefs.join(", ")}.`
    );
  }

  if (disallowedQuickStartHrefs.length > 0) {
    problems.push(
      `[check-cms-api] Homepage quickStart must link to dedicated pages, not direct take or aggregate pages: ${disallowedQuickStartHrefs.join(", ")}.`
    );
  }

  const scaleLookupResults = await Promise.allSettled(
    REQUIRED_SCALE_LOOKUP_SLUGS.map(async (slug) => {
      const payload = await fetchJson(buildScaleLookupHealthUrl(apiOrigin, slug));
      return {
        slug,
        ok: payload?.ok === true,
        primarySlug: text(payload?.primary_slug || payload?.slug),
      };
    })
  );
  const missingScaleLookupSlugs = scaleLookupResults
    .map((result, index) => {
      if (result.status === "rejected") return REQUIRED_SCALE_LOOKUP_SLUGS[index];
      if (!result.value.ok || result.value.primarySlug !== REQUIRED_SCALE_LOOKUP_SLUGS[index]) {
        return REQUIRED_SCALE_LOOKUP_SLUGS[index];
      }
      return "";
    })
    .filter(Boolean);

  if (missingScaleLookupSlugs.length > 0) {
    problems.push(
      `[check-cms-api] Homepage test entries must resolve through scale lookup before users can answer them; missing lookup slugs: ${missingScaleLookupSlugs.join(", ")}.`
    );
  }

  const scaleQuestionResults = await Promise.allSettled(
    REQUIRED_SCALE_QUESTION_FORMS.map(async (form) => {
      const payload = await fetchJson(buildScaleQuestionsHealthUrl(apiOrigin, form.scaleCode, form.formCode));
      const questions = asArray(payload?.questions?.items);
      return {
        ...form,
        ok: payload?.ok === true,
        questionCount: questions.length,
      };
    })
  );
  const missingScaleQuestionForms = scaleQuestionResults
    .map((result, index) => {
      const form = REQUIRED_SCALE_QUESTION_FORMS[index];
      if (result.status === "rejected") {
        return `${form.label} (${form.scaleCode}/${form.formCode}: ${result.reason?.message || "request failed"})`;
      }
      if (!result.value.ok || result.value.questionCount < form.minQuestions) {
        return `${form.label} (${form.scaleCode}/${form.formCode}: ${result.value.questionCount}/${form.minQuestions} questions)`;
      }
      return "";
    })
    .filter(Boolean);

  if (missingScaleQuestionForms.length > 0) {
    problems.push(
      `[check-cms-api] Required test question packs are unavailable; check backend content_packs.root, seeded scale forms, and pack manifests: ${missingScaleQuestionForms.join(", ")}.`
    );
  }

  const staticMediaResults = await Promise.allSettled(
    REQUIRED_STATIC_MEDIA_ASSETS.map(async (asset) => {
      await fetchHead(buildStaticMediaHealthUrl(apiOrigin, asset.path));
      return asset;
    })
  );
  const missingStaticMediaAssets = staticMediaResults
    .map((result, index) => {
      const asset = REQUIRED_STATIC_MEDIA_ASSETS[index];
      if (result.status === "rejected") {
        return `${asset.label} (${asset.path}: ${result.reason?.message || "request failed"})`;
      }
      return "";
    })
    .filter(Boolean);

  if (missingStaticMediaAssets.length > 0) {
    problems.push(
      `[check-cms-api] Required backend static media assets are unavailable; footer QR and social previews must be served by backend media/static hosting: ${missingStaticMediaAssets.join(", ")}.`
    );
  }

  if (problems.length > 0) {
    reportProblem(problems);
    process.exit(0);
  }

  const localHint = isLocalApi ? " Local API mode is intended for backend/CMS contract work only." : "";
  console.log(
    `[check-cms-api] OK: CMS API reachable at ${apiOrigin}; article list, homepage recommended articles, homepage test entry links, scale lookups, required question packs, and backend static media assets are populated.${localHint}`
  );
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  reportProblem([
    `[check-cms-api] CMS API health check failed: ${reason}`,
    "[check-cms-api] A stale Next.js fetch cache can otherwise make missing CMS data look like a valid homepage.",
  ]);
}

process.exit(0);
