import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type ContentReleasePayload = {
  content?: {
    type?: string;
    slug?: string;
    locale?: string;
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

function normalizeLocaleToSegment(locale: string | null | undefined): "en" | "zh" {
  return String(locale ?? "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function normalizePath(path: string, requestOrigin: string): string | null {
  const normalized = String(path ?? "").trim();
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const url = new URL(normalized);
      if (url.origin !== requestOrigin) {
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

function isAllowedPublicPath(path: string): boolean {
  if (path === "/" || path === "/zh" || path === "/en") {
    return true;
  }

  if (path === "/llms.txt" || path === "/llms-full.txt") {
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

  let decoded = path;
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

function secureEquals(expected: string, actual: string): boolean {
  const expectedHash = createHash("sha256").update(expected).digest();
  const actualHash = createHash("sha256").update(actual).digest();

  return timingSafeEqual(expectedHash, actualHash);
}

export function collectPathDecisions(payload: ContentReleasePayload, requestOrigin = "https://fermatmind.com") {
  const locale = normalizeLocaleToSegment(payload.content?.locale);
  const directPaths = [...(payload.cache_signal?.paths ?? []), ...(payload.cache_signal?.urls ?? [])]
    .map((path) => normalizePath(path, requestOrigin));

  const localized = directPaths
    .filter((path): path is string => Boolean(path))
    .map((path) => localizedPath(path, locale));
  const type = String(payload.content?.type ?? "").trim();

  if (type === "support_article" || type === "interpretation_guide") {
    localized.push(localizedPath("/support", locale));
  }

  if (type === "content_page" && String(payload.content?.slug ?? "").startsWith("help-")) {
    localized.push(localizedPath("/support", locale));
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
  const expectedToken = String(process.env.CONTENT_RELEASE_REVALIDATE_TOKEN ?? "").trim();
  const providedToken = request.headers.get("x-fm-content-release-token")?.trim() ?? "";

  if (!expectedToken || !providedToken || !secureEquals(expectedToken, providedToken)) {
    return NextResponse.json(
      {
        ok: false,
        error_code: "UNAUTHORIZED",
        message: "content release revalidation token is invalid.",
      },
      { status: 401 }
    );
  }

  const payload = (await request.json().catch(() => null)) as ContentReleasePayload | null;
  const { accepted, rejected } = collectPathDecisions(payload ?? {}, request.nextUrl.origin);

  for (const path of accepted) {
    revalidatePath(path);
  }

  return NextResponse.json({
    ok: true,
    revalidated_paths: accepted,
    rejected_paths: rejected,
  });
}
