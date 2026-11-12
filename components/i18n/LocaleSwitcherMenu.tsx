"use client";

import { PublicNavigationLink } from "@/components/navigation/PublicNavigationPendingIndicator";
import { persistLocalePreferenceCookie } from "@/lib/i18n/clientLocalePreference";
import { LANGUAGE_MENU_LABELS, LANGUAGE_MENU_ORDER, type DisplayLocale } from "@/lib/i18n/locales";
import { useLocaleSwitchHref, useTraditionalSwitchHref } from "@/components/i18n/useLocaleSwitchHref";

export default function LocaleSwitcherMenu({
  locale,
  pathname,
  onSelect,
}: {
  locale: DisplayLocale;
  pathname: string;
  onSelect: () => void;
}) {
  const hrefs = {
    zh: useLocaleSwitchHref(pathname, "zh"),
    en: useLocaleSwitchHref(pathname, "en"),
    "zh-TW": useTraditionalSwitchHref(pathname),
  };
  return (
    <div
      id="site-language-menu"
      role="menu"
      aria-label={locale === "zh-TW" ? "選擇語言" : locale === "zh" ? "选择语言" : "Choose language"}
      className="fm-header-dropdown-panel fm-locale-menu-panel"
    >
      {LANGUAGE_MENU_ORDER.map((language) => {
        const lang = language === "zh" ? "zh-CN" : language;
        const label = LANGUAGE_MENU_LABELS[language];
        const className = "fm-header-dropdown-link fm-locale-menu-item flex min-h-11 items-center";
        if (language === locale) {
          return <span key={language} role="menuitem" lang={lang} aria-current="true" className={`${className} is-current cursor-default`}>{label}</span>;
        }

        return (
          <PublicNavigationLink
            key={language}
            href={hrefs[language]}
            lang={lang}
            prefetch={false}
            role="menuitem"
            className={className}
            onClick={() => {
              if (language !== "zh-TW") persistLocalePreferenceCookie(language);
              onSelect();
            }}
          >
            {label}
          </PublicNavigationLink>
        );
      })}
    </div>
  );
}
