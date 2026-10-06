"use client";

import { useSyncExternalStore } from "react";
import { localizedPath, toggleLocalePath, type Locale } from "@/lib/i18n/locales";

export function resolveLocaleSwitchHref(pathname: string, targetLocale: Locale, head?: ParentNode): string {
  const isCategory = /^\/(?:en|zh)\/articles\/category\/[^/]+\/?$/.test(pathname);
  if (!isCategory && !/^\/(?:en|zh)\/articles\/[^/]+\/?$/.test(pathname)) {
    return toggleLocalePath(pathname, targetLocale);
  }

  const fallback = localizedPath("/articles", targetLocale);
  const canonical = head?.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  const language = targetLocale === "zh" ? "zh-CN" : "en";
  const alternate = head?.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${language}"]`)?.href;
  if (!canonical || !alternate) return fallback;

  try {
    const current = new URL(canonical);
    const target = new URL(alternate);
    const targetPattern = isCategory ? new RegExp(`^/${targetLocale}/articles/category/[^/]+$`) : new RegExp(`^/${targetLocale}/articles/[^/]+$`);
    const safeQuery = isCategory && /^\?page=[1-9]\d*$/.test(target.search) && Number(target.searchParams.get("page")) <= 100;
    if (current.pathname !== pathname || current.origin !== target.origin
      || !/^https?:$/.test(target.protocol) || (target.search && !safeQuery) || target.hash
      || !targetPattern.test(target.pathname)) return fallback;
    return target.pathname + target.search;
  } catch {
    return fallback;
  }
}

function subscribeMetadata(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  // Next.js can stream article metadata into the body after hydration.
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "hreflang", "rel"] });
  return () => observer.disconnect();
}

export function useLocaleSwitchHref(pathname: string, targetLocale: Locale): string {
  return useSyncExternalStore(
    subscribeMetadata,
    () => resolveLocaleSwitchHref(pathname, targetLocale, document),
    () => resolveLocaleSwitchHref(pathname, targetLocale),
  );
}
