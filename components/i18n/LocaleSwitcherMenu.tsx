"use client";

import Link from "next/link";
import { persistLocalePreferenceCookie } from "@/lib/i18n/clientLocalePreference";
import { toggleLocalePath, type Locale } from "@/lib/i18n/locales";

const languageOptions: Array<{ locale: Locale; label: string }> = [
  { locale: "zh", label: "中文" },
  { locale: "en", label: "English" },
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
      className="fm-header-dropdown-panel min-w-[10rem]"
    >
      {languageOptions.map((option) => {
        if (option.locale === locale) {
          return (
            <span
              key={option.locale}
              role="menuitem"
              aria-current="true"
              className="fm-header-dropdown-link flex cursor-default items-center justify-between bg-[var(--fm-bg-soft)] text-[var(--fm-text-main)]"
            >
              <span>{option.label}</span>
            </span>
          );
        }

        return (
          <Link
            key={option.locale}
            href={toggleLocalePath(pathname, option.locale)}
            prefetch={false}
            role="menuitem"
            className="fm-header-dropdown-link flex items-center justify-between"
            onClick={() => {
              persistLocalePreferenceCookie(option.locale);
              onSelect();
            }}
          >
            <span>{option.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
