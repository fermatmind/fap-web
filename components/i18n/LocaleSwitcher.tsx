"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { toggleLocalePath, type Locale } from "@/lib/i18n/locales";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/localeNegotiation";
import { shouldDisableLocaleSwitchLinks } from "@/lib/seo/seoHoldlistRoutes";

const languageOptions: Array<{ locale: Locale; code: string; label: string }> = [
  { locale: "zh", code: "ZH", label: "中文" },
  { locale: "en", code: "EN", label: "English" },
];

export function LocaleSwitcher() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const locale = useLocale();
  const currentOption = languageOptions.find((option) => option.locale === locale) ?? languageOptions[0];

  function persistLocalePreference(targetLocale: Locale) {
    if (typeof document === "undefined") return;
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE_NAME}=${targetLocale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
  }

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (shouldDisableLocaleSwitchLinks(pathname)) return null;

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="fm-site-header-locale inline-flex h-9 min-h-[36px] min-w-[58px] shrink-0 items-center justify-center gap-1 rounded-full border border-[var(--fm-border-subtle)] bg-white px-3 text-[13px] font-medium text-[var(--fm-text-main)] transition hover:bg-[var(--fm-lime-soft)] whitespace-nowrap xl:min-w-[60px]"
        aria-label={locale === "zh" ? "语言菜单" : "Language menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="site-language-menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{currentOption.code}</span>
        <ChevronDown className={open ? "h-3.5 w-3.5 rotate-180 transition" : "h-3.5 w-3.5 transition"} />
      </button>

      {open ? (
        <div
          id="site-language-menu"
          role="menu"
          aria-label={locale === "zh" ? "选择语言" : "Choose language"}
          className="fm-header-dropdown-panel min-w-[10rem]"
        >
          {languageOptions.map((option) => {
            const isCurrent = option.locale === locale;

            if (isCurrent) {
              return (
                <span
                  key={option.locale}
                  role="menuitem"
                  aria-current="true"
                  className="fm-header-dropdown-link flex cursor-default items-center justify-between bg-[var(--fm-bg-soft)] text-[var(--fm-text-main)]"
                >
                  <span>{option.label}</span>
                  <span className="text-xs font-semibold text-[var(--fm-text-secondary)]">{option.code}</span>
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
                  persistLocalePreference(option.locale);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                <span className="text-xs font-semibold text-[var(--fm-text-secondary)]">{option.code}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
