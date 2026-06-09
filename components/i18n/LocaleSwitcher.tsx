"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleContext";
import { getDictSync } from "@/lib/i18n/getDict";
import { toggleLocalePath, type Locale } from "@/lib/i18n/locales";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/localeNegotiation";
import { shouldDisableLocaleSwitchLinks } from "@/lib/seo/seoHoldlistRoutes";

function nextLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

export function LocaleSwitcher() {
  const pathname = usePathname() ?? "/";

  const locale = useLocale();
  const targetLocale = nextLocale(locale);
  const dict = getDictSync(locale);

  if (shouldDisableLocaleSwitchLinks(pathname)) return null;

  const targetPath = toggleLocalePath(pathname, targetLocale);

  function persistLocalePreference() {
    if (typeof document === "undefined") return;
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE_NAME}=${targetLocale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
  }

  return (
    <Link
      href={targetPath}
      onClick={persistLocalePreference}
      className="fm-site-header-locale inline-flex h-9 min-h-[36px] min-w-[54px] shrink-0 items-center justify-center rounded-full border border-[var(--fm-border-subtle)] bg-white px-3 text-[13px] font-medium text-[var(--fm-text-main)] transition hover:bg-[var(--fm-lime-soft)] whitespace-nowrap xl:min-w-[56px]"
      aria-label={targetLocale === "zh" ? dict.lang.zh_label : dict.lang.en_label}
    >
      {targetLocale === "zh" ? dict.lang.zh_label : dict.lang.en_label}
    </Link>
  );
}
