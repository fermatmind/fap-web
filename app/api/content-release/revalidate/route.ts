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

function normalizeLocaleToSegment(locale: string | null | undefined): "en" | "zh" {
  return String(locale ?? "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function normalizePath(path: string): string | null {
  const normalized = String(path ?? "").trim();
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      return new URL(normalized).pathname || null;
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

  if (path.startsWith("/en/") || path.startsWith("/zh/")) {
    return path;
  }

  return `/${locale}${path}`;
}

function secureEquals(expected: string, actual: string): boolean {
  const expectedHash = createHash("sha256").update(expected).digest();
  const actualHash = createHash("sha256").update(actual).digest();

  return timingSafeEqual(expectedHash, actualHash);
}

function collectPaths(payload: ContentReleasePayload): string[] {
  const locale = normalizeLocaleToSegment(payload.content?.locale);
  const directPaths = [...(payload.cache_signal?.paths ?? []), ...(payload.cache_signal?.urls ?? [])]
    .map(normalizePath)
    .filter((path): path is string => Boolean(path));

  const localized = directPaths.map((path) => localizedPath(path, locale));
  const type = String(payload.content?.type ?? "").trim();

  if (type === "support_article" || type === "interpretation_guide") {
    localized.push(localizedPath("/support", locale));
  }

  if (type === "content_page" && String(payload.content?.slug ?? "").startsWith("help-")) {
    localized.push(localizedPath("/support", locale));
  }

  return [...new Set(localized)];
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
  const paths = collectPaths(payload ?? {});

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    ok: true,
    revalidated_paths: paths,
  });
}
