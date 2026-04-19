import { resolveApiOrigin } from "@/lib/api-base";

export function backendStaticMediaUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${resolveApiOrigin()}${normalized}`;
}

export const DEFAULT_SHARE_IMAGE_URL = backendStaticMediaUrl("/static/share/mbti_wide_1200x630.png");
export const DEFAULT_TEST_COVER_URL = backendStaticMediaUrl("/static/share/mbti_square_600x600.png");
