"use client";

import { PublicNavigationLink } from "@/components/navigation/PublicNavigationPendingIndicator";
import { persistLocalePreferenceCookie } from "@/lib/i18n/clientLocalePreference";
import { toggleLocalePath, type Locale } from "@/lib/i18n/locales";

const languageOptions: Array<{ locale: Locale; label: string; code: string }> = [
  { locale: "zh", label: "简体中文", code: "ZH" },
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
  return (
    <div
      id="site-language-menu"
      role="menu"
      aria-label={locale === "zh" ? "选择语言" : "Choose language"}
      className="fm-header-dropdown-panel fm-locale-menu-panel"
    >
      {languageOptions.map((option) => {
        if (option.locale === locale) {
          return (
            <span
              key={option.locale}
              role="menuitem"
              aria-current="true"
              className="fm-header-dropdown-link fm-locale-menu-item is-current flex cursor-default items-center justify-between gap-6 bg-[var(--fm-bg-soft)] text-[var(--fm-text-main)]"
            >
              <span>{option.label}</span>
              <span aria-hidden="true" className="fm-locale-menu-code">{option.code}</span>
            </span>
          );
        }

        return (
          <PublicNavigationLink
            key={option.locale}
            href={toggleLocalePath(pathname, option.locale)}
            prefetch={false}
            role="menuitem"
            className="fm-header-dropdown-link fm-locale-menu-item flex items-center justify-between gap-6"
            onClick={() => {
              persistLocalePreferenceCookie(option.locale);
              onSelect();
            }}
          >
            <span>{option.label}</span>
            <span aria-hidden="true" className="fm-locale-menu-code">{option.code}</span>
          </PublicNavigationLink>
        );
      })}
    </div>
  );
}
