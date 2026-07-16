import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { articleDetailCacheTag, articleSeoCacheTag } from "@/lib/cms/articleCacheTags";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
} from "@/lib/personality/enneagramPublicRoutes";
import { clearLlmsFullResponseCache } from "@/lib/seo/llmsFullResponseCache";
import { authenticateContentReleaseRevalidation } from "@/lib/security/contentReleaseRevalidationAuth";

type ContentReleasePayload = {
  content?: {
    type?: string;
    slug?: string;
    locale?: string;
    publication_state?: string;
    indexable?: boolean;
  };
  cache_signal?: {
    paths?: string[];
    urls?: string[];
  };
};

type PathDecision = {
  path: string;
  reason?: string;
};

const DEFAULT_PUBLIC_FRONTEND_ORIGINS = ["https://fermatmind.com", "https://www.fermatmind.com"];
const PUBLIC_CONTENT_PAGE_SLUGS = new Set(["about", "brand", "charter", "foundation", "careers", "policies"]);
const PERSONALITY_CONTENT_TYPES = new Set([
  "personality_profile",
  "personality_profile_variant",
  "personality_profile_comparison",
  "mbti64_personality_profile",
  "mbti64_personality_profile_variant",
  "mbti64_personality_profile_comparison",
]);
const CAREER_JOB_CONTENT_TYPES = new Set(["career_job", "career_job_detail"]);
const ENNEAGRAM_PUBLIC_REVALIDATION_PATHS = new Set(
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
    buildEnneagramPublicContentPath("en", entry),
    buildEnneagramPublicContentPath("zh", entry),
  ])
);

function normalizeLocaleToSegment(locale: string | null | undefined): "en" | "zh" {
  return String(locale ?? "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function configuredPublicOrigins(requestOrigin: string): Set<string> {
  const origins = new Set([requestOrigin, ...DEFAULT_PUBLIC_FRONTEND_ORIGINS]);

  for (const candidate of [process.env.NEXT_PUBLIC_SITE_URL, process.env.PUBLIC_BASE_URL]) {
    const normalized = String(candidate ?? "").trim();
    if (!normalized) {
      continue;
    }

    try {
      origins.add(new URL(normalized).origin);
    } catch {
      // Ignore malformed deployment metadata; request-origin validation still applies.
    }
  }

  return origins;
}

function normalizePath(path: string, requestOrigin: string): string | null {
  const normalized = String(path ?? "").trim();
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const url = new URL(normalized);
      if (!configuredPublicOrigins(requestOrigin).has(url.origin)) {
        return null;
      }

      return url.pathname || null;
    } catch {
      return null;
    }
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function localizedPath(path: string, locale: "en" | "zh"): string {
  if (path === "/") {
    return locale === "zh" ? "/" : "/en";
  }

  if (
    path === "/en" ||
    path === "/zh" ||
    path.startsWith("/en/") ||
    path.startsWith("/zh/") ||
    path === "/llms.txt" ||
    path === "/llms-full.txt" ||
    path.startsWith("/api/") ||
    path.startsWith("/ops/") ||
    path.startsWith("/result/") ||
    path.startsWith("/results/") ||
    path.startsWith("/orders/") ||
    path.startsWith("/payment/") ||
    path.startsWith("/pay/") ||
    path.startsWith("/share/")
  ) {
    return path;
  }

  return `/${locale}${path}`;
}

function normalizeSlug(slug: string | null | undefined): string | null {
  const normalized = String(slug ?? "").trim().toLowerCase();

  return /^[a-z0-9][a-z0-9-]*$/.test(normalized) ? normalized : null;
}

function isAllowedPublicPath(path: string): boolean {
  if (path === "/" || path === "/zh" || path === "/en") {
    return true;
  }

  if (path === "/llms.txt" || path === "/llms-full.txt") {
    return true;
  }

  if (ENNEAGRAM_PUBLIC_REVALIDATION_PATHS.has(path)) {
    return true;
  }

  const publicPatterns = [
    /^\/articles(?:\/[a-z0-9][a-z0-9-]*)?$/,
    /^\/(?:zh|en)\/articles(?:\/[a-z0-9][a-z0-9-]*)?$/,
    /^\/(?:zh|en)\/topics\/[a-z0-9][a-z0-9-]*$/,
    /^\/(?:zh|en)\/career\/guides\/[a-z0-9][a-z0-9-]*$/,
    /^\/(?:zh|en)\/career\/jobs\/[a-z0-9][a-z0-9-]*$/,
    /^\/(?:zh|en)\/tests\/[a-z0-9][a-z0-9-]*$/,
    /^\/(?:zh|en)\/personality(?:\/[a-z0-9][a-z0-9-]*)?$/,
    /^\/(?:zh|en)\/personality\/big-five\/[a-z0-9][a-z0-9-]*$/,
    /^\/(?:zh|en)\/(?:about|brand|charter|foundation|careers|policies)$/,
    /^\/(?:zh|en)\/help\/[a-z0-9][a-z0-9-]*$/,
    /^\/(?:zh|en)\/support(?:\/[a-z0-9][a-z0-9-]*)?$/,
    /^\/support(?:\/[a-z0-9][a-z0-9-]*)?$/,
  ];

  return publicPatterns.some((pattern) => pattern.test(path));
}

function rejectionReason(path: string | null): string | null {
  if (!path) {
    return "malformed_path";
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return "malformed_path";
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "malformed_path";
  }

  if (decoded.includes("..") || decoded.includes("\\")) {
    return "path_traversal";
  }

  if (
    path.startsWith("/api/") ||
    path.startsWith("/ops/") ||
    path.startsWith("/result/") ||
    path.startsWith("/results/") ||
    path.startsWith("/orders/") ||
    path.startsWith("/payment/") ||
    path.startsWith("/pay/") ||
    path.startsWith("/share/") ||
    /^\/(?:zh|en)\/tests\/[^/]+\/take(?:\/|$)/.test(path) ||
    /^\/tests\/[^/]+\/take(?:\/|$)/.test(path)
  ) {
    return "private_or_api_path";
  }

  if (!isAllowedPublicPath(path)) {
    return "not_allowlisted";
  }

  return null;
}

export function collectPathDecisions(payload: ContentReleasePayload, requestOrigin = "https://fermatmind.com") {
  const locale = normalizeLocaleToSegment(payload.content?.locale);
  const directPaths = [...(payload.cache_signal?.paths ?? []), ...(payload.cache_signal?.urls ?? [])]
    .map((path) => normalizePath(path, requestOrigin));

  const localized = directPaths
    .filter((path): path is string => Boolean(path))
    .map((path) => localizedPath(path, locale));
  const type = String(payload.content?.type ?? "").trim();
  const slug = normalizeSlug(payload.content?.slug);

  if (type === "article") {
    localized.push("/zh/articles", "/en/articles");

    if (slug) {
      localized.push(`/zh/articles/${slug}`, `/en/articles/${slug}`);
    }

    localized.push("/llms.txt", "/llms-full.txt");
  } else if (type === "support_article" || type === "interpretation_guide") {
    localized.push(localizedPath("/support", locale));
  }

  if (type === "content_page") {
    let derivesPublicContentPagePath = false;

    if (slug && PUBLIC_CONTENT_PAGE_SLUGS.has(slug)) {
      localized.push(localizedPath(`/${slug}`, locale));
      derivesPublicContentPagePath = true;
    }

    if (String(payload.content?.slug ?? "").startsWith("help-")) {
      localized.push(localizedPath("/support", locale));
      derivesPublicContentPagePath = true;
    }

    if (derivesPublicContentPagePath) {
      localized.push("/llms.txt", "/llms-full.txt");
    }
  }

  if (PERSONALITY_CONTENT_TYPES.has(type)) {
    localized.push(localizedPath("/personality", locale));

    if (slug) {
      localized.push(localizedPath(`/personality/${slug}`, locale));
    }

    localized.push("/llms.txt", "/llms-full.txt");
  }

  if (CAREER_JOB_CONTENT_TYPES.has(type) && slug) {
    localized.push(localizedPath(`/career/jobs/${slug}`, locale));
  }

  const accepted: string[] = [];
  const rejected: PathDecision[] = [];
  const seen = new Set<string>();

  for (const rawPath of localized) {
    const reason = rejectionReason(rawPath);
    if (reason) {
      rejected.push({ path: rawPath, reason });
      continue;
    }

    if (!seen.has(rawPath)) {
      accepted.push(rawPath);
      seen.add(rawPath);
    }
  }

  for (const rawPath of directPaths) {
    if (rawPath !== null) {
      continue;
    }
    rejected.push({ path: "", reason: "malformed_or_external_url" });
  }

  return { accepted, rejected };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const auth = await authenticateContentReleaseRevalidation(request, rawBody);
  if (!auth.ok) {
    console.warn("content_release_revalidation_rejected", { error_code: auth.errorCode });
    return NextResponse.json(
      {
        ok: false,
        error_code: auth.errorCode,
        message: auth.message,
      },
      { status: auth.status }
    );
  }

  const payload = (() => {
    try { return JSON.parse(rawBody) as ContentReleasePayload; } catch { return null; }
  })();
  const { accepted, rejected } = collectPathDecisions(payload ?? {}, request.nextUrl.origin);

  for (const path of accepted) {
    revalidatePath(path);
  }

  const contentType = String(payload?.content?.type ?? "").trim();
  const contentSlug = normalizeSlug(payload?.content?.slug);
  const contentLocale = normalizeLocaleToSegment(payload?.content?.locale) === "zh" ? "zh-CN" : "en";
  const invalidatedTags: string[] = [];
  if (CAREER_JOB_CONTENT_TYPES.has(contentType) && contentSlug) {
    const tag = `career-detail:${contentLocale}:${contentSlug}`;
    revalidateTag(tag, { expire: 0 });
    invalidatedTags.push(tag);
  }
  if (contentType === "article" && contentSlug) {
    const tags = [
      articleDetailCacheTag(contentLocale, contentSlug),
      articleSeoCacheTag(contentLocale, contentSlug),
    ];
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
      invalidatedTags.push(tag);
    }
  }

  if (accepted.includes("/llms-full.txt")) {
    clearLlmsFullResponseCache();
  }

  console.info("content_release_revalidation_completed", {
    nonce_hash: auth.nonceHash,
    accepted_count: accepted.length,
    rejected_count: rejected.length,
    invalidated_tag_count: invalidatedTags.length,
  });

  return NextResponse.json({
    ok: true,
    revalidated_paths: accepted,
    rejected_paths: rejected,
    invalidated_tags: invalidatedTags,
  });
}
