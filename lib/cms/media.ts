import { resolveApiOrigin } from "@/lib/api-base";
import { normalizeMediaAssetUrl } from "@/lib/url/safeContentUrls";

export const CANONICAL_MEDIA_ASSET_ORIGIN = "https://assets.fermatmind.com";

const LEGACY_MUTABLE_MEDIA_HOST_PATTERNS = [
  /(?:^|\.)myqcloud\.com$/i,
  /(?:^|\.)qcloud\.com$/i,
  /(?:^|\.)tencentcos\.com$/i,
  /(?:^|\.)cos\.[^.]+\.myqcloud\.com$/i,
];

export function backendStaticMediaUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${resolveApiOrigin()}${normalized}`;
}

export function isLegacyMutableMediaUrl(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return LEGACY_MUTABLE_MEDIA_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname));
  } catch {
    return false;
  }
}

export function cmsManagedMediaUrl(value: string | null | undefined): string | null {
  if (!value || isLegacyMutableMediaUrl(value)) {
    return null;
  }

  return normalizeMediaAssetUrl(value, {
    allowedOrigins: [
      CANONICAL_MEDIA_ASSET_ORIGIN,
      resolveApiOrigin(),
      process.env.NEXT_PUBLIC_CDN_URL,
    ],
  });
}

export const DEFAULT_SHARE_IMAGE_URL = backendStaticMediaUrl("/static/share/mbti_wide_1200x630.png");
export const DEFAULT_TEST_COVER_URL = backendStaticMediaUrl("/static/share/mbti_square_600x600.png");
