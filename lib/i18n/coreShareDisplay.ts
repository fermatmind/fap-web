import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

export function isCoreSharePath(path: string): boolean {
  return /^\/share\/(?:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}|[a-z0-9_]{6,64})\/?$/i.test(path);
}

export function coreShareUrlForDisplay(value: unknown): unknown {
  if (typeof window === "undefined" || !window.location.pathname.startsWith("/zh-TW/")) return value;
  const href = normalizeInternalHref(value);
  if (!href) return null;
  const url = new URL(href, window.location.origin);
  const sharePath = url.pathname.replace(/^\/(?:en|zh|zh-TW)(?=\/)/, "");
  if (!isCoreSharePath(sharePath)) return null;
  url.pathname = `/zh-TW${sharePath}`;
  return url.toString();
}
