"use client";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";

import { PublicNavigationLink } from "@/components/navigation/PublicNavigationPendingIndicator";
import { persistLocalePreferenceCookie } from "@/lib/i18n/clientLocalePreference";
import { type Locale } from "@/lib/i18n/locales";
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
  locale: Locale;
  pathname: string;
  onSelect: () => void;
}) {
  const targetHref = useLocaleSwitchHref(pathname, locale === "zh" ? "en" : "zh");
  const traditionalHref = useTraditionalSwitchHref(pathname);
  return (
    <div
      id="site-language-menu"
      role="menu"
      aria-label={locale === "zh" ? "选择语言" : "Choose language"}
      className="fm-header-dropdown-panel fm-locale-menu-panel"
    >
      <PublicNavigationLink href={traditionalHref} prefetch={false} role="menuitem" className="fm-header-dropdown-link fm-locale-menu-item flex min-h-11 items-center justify-between gap-6" onClick={onSelect}><span>{locale === "zh" ? "繁體中文（台灣）" : "Chinese (Traditional, Taiwan)"}{!traditionalPath(pathname) && traditionalHref === "/zh-TW/tests" ? (locale === "zh" ? " · 可用測評" : " · available quizzes") : ""}</span><span aria-hidden="true" className="fm-locale-menu-code">TW</span></PublicNavigationLink>
      {languageOptions.map((option) => {
        if (option.locale === locale) {
          return (
            <span
              key={option.locale}
              role="menuitem"
              aria-current="true"
              className="fm-header-dropdown-link fm-locale-menu-item is-current flex cursor-default items-center justify-between gap-6 bg-[var(--fm-bg-soft)] text-[var(--fm-text-main)]"
            >
              <span>{locale === "zh" && option.locale === "zh" ? "简体中文" : option.label}</span>
              <span aria-hidden="true" className="fm-locale-menu-code">{option.code}</span>
            </span>
          );
        }

        return (
          <PublicNavigationLink
            key={option.locale}
            href={targetHref}
            prefetch={false}
            role="menuitem"
            className="fm-header-dropdown-link fm-locale-menu-item flex items-center justify-between gap-6"
            onClick={() => {
              persistLocalePreferenceCookie(option.locale);
              onSelect();
            }}
          >
            <span>{locale === "zh" && option.locale === "zh" ? "简体中文" : option.label}</span>
            <span aria-hidden="true" className="fm-locale-menu-code">{option.code}</span>
          </PublicNavigationLink>
        );
      })}
    </div>
  );
}
