"use client";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";

import { PublicNavigationLink } from "@/components/navigation/PublicNavigationPendingIndicator";
import { persistLocalePreferenceCookie } from "@/lib/i18n/clientLocalePreference";
import { type DisplayLocale, type Locale } from "@/lib/i18n/locales";
import { useLocaleSwitchHref, useTraditionalSwitchHref } from "@/components/i18n/useLocaleSwitchHref";

const languageOptions: Array<{ locale: Locale; label: string; code: string }> = [
  { locale: "zh", label: "Chinese (Simplified)", code: "ZH" },
  { locale: "en", label: "English", code: "EN" },
];

export default function LocaleSwitcherMenu({
  locale,
  pathname,
  onSelect,
}: {
  locale: DisplayLocale;
  pathname: string;
  onSelect: () => void;
}) {
  const chineseHref = useLocaleSwitchHref(pathname, "zh");
  const englishHref = useLocaleSwitchHref(pathname, "en");
  const traditionalHref = useTraditionalSwitchHref(pathname);
  return (
    <div
      id="site-language-menu"
      role="menu"
      aria-label={locale === "zh-TW" ? "選擇語言" : locale === "zh" ? "选择语言" : "Choose language"}
      className="fm-header-dropdown-panel fm-locale-menu-panel"
    >
      {locale === "zh-TW" ? <span role="menuitem" aria-current="true" className="fm-header-dropdown-link fm-locale-menu-item is-current flex items-center justify-between gap-6"><span>繁體中文（台灣）</span><span aria-hidden="true" className="fm-locale-menu-code">TW</span></span> : <PublicNavigationLink href={traditionalHref} prefetch={false} role="menuitem" className="fm-header-dropdown-link fm-locale-menu-item flex min-h-11 items-center justify-between gap-6" onClick={onSelect}><span>{locale === "zh" ? "繁體中文（台灣）" : "Chinese (Traditional, Taiwan)"}{!traditionalPath(pathname) && traditionalHref === "/zh-TW/tests" ? (locale === "zh" ? " · 可用測評" : " · available quizzes") : ""}</span><span aria-hidden="true" className="fm-locale-menu-code">TW</span></PublicNavigationLink>}
      {languageOptions.map((option) => {
        if (option.locale === locale) {
          return (
            <span
              key={option.locale}
              role="menuitem"
              aria-current="true"
              className="fm-header-dropdown-link fm-locale-menu-item is-current flex cursor-default items-center justify-between gap-6 bg-[var(--fm-bg-soft)] text-[var(--fm-text-main)]"
            >
              <span>{locale !== "en" && option.locale === "zh" ? "简体中文" : option.label}</span>
              <span aria-hidden="true" className="fm-locale-menu-code">{option.code}</span>
            </span>
          );
        }

        return (
          <PublicNavigationLink
            key={option.locale}
            href={option.locale === "zh" ? chineseHref : englishHref}
            prefetch={false}
            role="menuitem"
            className="fm-header-dropdown-link fm-locale-menu-item flex items-center justify-between gap-6"
            onClick={() => {
              persistLocalePreferenceCookie(option.locale);
              onSelect();
            }}
          >
            <span>{locale !== "en" && option.locale === "zh" ? "简体中文" : option.label}</span>
            <span aria-hidden="true" className="fm-locale-menu-code">{option.code}</span>
          </PublicNavigationLink>
        );
      })}
    </div>
  );
}
