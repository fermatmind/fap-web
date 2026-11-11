"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HISTORY_DISPLAY_PATHS } from "@/lib/i18n/historyDisplayRoutes";
import { assessmentDisplayLocale } from "@/lib/tests/traditionalAssessmentDisplay";

const languages = [
  { locale: "zh-TW", lang: "zh-TW", label: "繁體中文（台灣）" },
  { locale: "zh", lang: "zh-CN", label: "简体中文" },
  { locale: "en", lang: "en", label: "English" },
] as const;

export default function HistoryLanguageLinks({ comparisonOnly = false }: { comparisonOnly?: boolean }) {
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const active = assessmentDisplayLocale(pathname);
  const route = pathname.replace(/^\/(?:zh-TW|zh|en)(?=\/)/u, "").replace(/\/$/u, "");
  const comparison = route === "/history/big5/compare";
  if (comparison !== comparisonOnly || !HISTORY_DISPLAY_PATHS.some(path => path === route)) return null;

  const pair = new URLSearchParams();
  if (comparison) {
    const current = search.get("current") ?? "";
    const previous = search.get("previous") ?? "";
    if ([current, previous].every(value => /^[A-Za-z0-9_-]{1,128}$/u.test(value))) {
      pair.set("current", current);
      pair.set("previous", previous);
    }
  }
  const suffix = pair.size > 0 ? `?${pair}` : "";
  const label = active === "zh-TW" ? "頁面語言" : active === "zh" ? "页面语言" : "Page language";
  return <nav aria-label={label} className="mb-4 flex flex-wrap gap-x-5 text-sm">
    {languages.map(({ locale, lang, label }) => locale === active
      ? <span key={locale} aria-current="page" lang={lang} className="min-h-11 py-2">{label}</span>
      : <Link key={locale} href={`/${locale}${route}${suffix}`} lang={lang} prefetch={false} className="min-h-11 py-2 underline">{label}</Link>)}
  </nav>;
}
