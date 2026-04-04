"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleContext";
import { getDictSync } from "@/lib/i18n/getDict";
import { toggleLocalePath, type Locale } from "@/lib/i18n/locales";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/localeNegotiation";

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

  function persistLocalePreference() {
    if (typeof document === "undefined") return;
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE_NAME}=${targetLocale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
  }

  return (
    <Link
      href={href}
      onClick={persistLocalePreference}
      className="inline-flex h-11 min-h-[44px] min-w-[52px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 px-2 text-[12px] font-semibold text-white transition hover:bg-white/20 whitespace-nowrap xl:min-w-[56px] xl:px-2.5 xl:text-[12.5px]"
      aria-label={targetLocale === "zh" ? dict.lang.zh_label : dict.lang.en_label}
    >
      {targetLocale === "zh" ? dict.lang.zh_label : dict.lang.en_label}
    </Link>
  );
}
