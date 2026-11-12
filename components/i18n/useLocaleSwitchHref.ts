"use client";

import { useSyncExternalStore } from "react";
import { localizedPath, toggleLocalePath, type Locale } from "@/lib/i18n/locales";
import { emailTokenSwitchHref } from "@/lib/i18n/emailDisplayRoutes";
import { normalizeTraditionalPersonalityLanguageAlternates } from "@/lib/personality/traditionalLanguageAlternates";
import { CANONICAL_SITE_URL } from "@/lib/site";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";

function articleReaderHref(pathname: string, language: "zh-CN" | "en" | "zh-TW", document?: ParentNode): string | undefined {
  if (!/^\/(?:zh|en|zh-TW)\/articles\/[^/]+$/u.test(pathname)) return;
  const href = document?.querySelector<HTMLAnchorElement>(`[data-article-reader-languages] a[lang="${language}"]`)?.getAttribute("href");
  const prefix = language === "zh-CN" ? "zh" : language;
  if (href && new RegExp(`^/${prefix}/articles/[A-Za-z0-9][A-Za-z0-9_-]{0,127}$`, "u").test(href)) return href;
}

export function resolveLocaleSwitchHref(pathname: string, targetLocale: Locale, head?: ParentNode, search = ""): string {
  const isCategory = /^\/(?:en|zh|zh-TW)\/articles\/category\/[^/]+\/?$/.test(pathname);
  if (!isCategory && !/^\/(?:en|zh|zh-TW)\/articles\/[^/]+\/?$/.test(pathname)) {
    const target = pathname === "/zh-TW" || pathname.startsWith("/zh-TW/")
      ? localizedPath(pathname.slice("/zh-TW".length) || "/", targetLocale)
      : toggleLocalePath(pathname, targetLocale);
    return emailTokenSwitchHref(pathname, target, search);
  }

  const language = targetLocale === "zh" ? "zh-CN" : "en";
  const readerHref = articleReaderHref(pathname, language, head);
  if (readerHref) return readerHref;
  const fallback = localizedPath("/articles", targetLocale);
  const canonical = head?.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
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
    () => resolveLocaleSwitchHref(pathname, targetLocale, document, window.location.search),
    () => resolveLocaleSwitchHref(pathname, targetLocale),
  );
}

export function resolveTraditionalSwitchHref(pathname: string, head?: ParentNode, search = ""): string {
  const readerHref = articleReaderHref(pathname, "zh-TW", head);
  if (readerHref) return readerHref;
  if (/^\/(?:zh|en)\/topics\/[a-z0-9-]+$/u.test(pathname)) {
    const topicHref = head?.querySelector<HTMLAnchorElement>('[data-topic-reader-language][lang="zh-TW"]')?.getAttribute("href");
    if (topicHref === `/zh-TW${pathname.slice(pathname.indexOf("/", 1))}`) return topicHref;
  }
  const registered = traditionalPath(pathname);
  if (registered) return emailTokenSwitchHref(pathname, registered, search);
  if (/^\/(?:en|zh)\/articles\/[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/u.test(pathname)
    && head?.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href === CANONICAL_SITE_URL + pathname) {
    const alternate = head.querySelector<HTMLLinkElement>('link[rel="alternate"][hreflang="zh-TW"]')?.href;
    const path = alternate?.startsWith(CANONICAL_SITE_URL + "/") ? alternate.slice(CANONICAL_SITE_URL.length) : "";
    if (/^\/zh-TW\/articles\/[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/u.test(path)) return path;
  }
  if (!/^\/(?:en|zh)\/personality(?:\/|$)/u.test(pathname) ||
    head?.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href !== CANONICAL_SITE_URL + pathname) {
    return "/zh-TW/tests";
  }

  const paths = Object.fromEntries(["en", "zh-CN", "zh-TW"].map(locale => {
    const href = head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${locale}"]`)?.href;
    return [locale, href?.startsWith(CANONICAL_SITE_URL + "/") ? href.slice(CANONICAL_SITE_URL.length) : null];
  }));
  return normalizeTraditionalPersonalityLanguageAlternates(paths, pathname)?.["zh-TW"] ?? "/zh-TW/tests";
}

export function useTraditionalSwitchHref(pathname: string): string {
  return useSyncExternalStore(
    subscribeMetadata,
    () => resolveTraditionalSwitchHref(pathname, document, window.location.search),
    () => resolveTraditionalSwitchHref(pathname),
  );
}
