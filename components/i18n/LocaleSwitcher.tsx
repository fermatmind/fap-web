"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleContext";
import { getDictSync } from "@/lib/i18n/getDict";
import { toggleLocalePath, type Locale } from "@/lib/i18n/locales";

function nextLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

export function LocaleSwitcher() {
  const pathname = usePathname() ?? "/";

  const locale = useLocale();
  const targetLocale = nextLocale(locale);
  const dict = getDictSync(locale);

  const targetPath = toggleLocalePath(pathname, targetLocale);
  const query = typeof window !== "undefined" ? window.location.search : "";
  const href = query ? `${targetPath}${query}` : targetPath;

  return (
    <Link
      href={href}
      className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full border border-white/25 bg-white/10 px-[var(--fm-pad-btn-sm-x)] text-xs font-semibold text-white transition hover:bg-white/20"
      aria-label={targetLocale === "zh" ? dict.lang.zh_label : dict.lang.en_label}
    >
      {targetLocale === "zh" ? dict.lang.zh_label : dict.lang.en_label}
    </Link>
  );
}
