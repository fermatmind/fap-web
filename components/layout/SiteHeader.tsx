"use client";

import { ChevronDown, Menu, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { AnimatedCounter } from "@/components/design/AnimatedCounter";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath, toggleLocalePath } from "@/lib/i18n/locales";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/localeNegotiation";
import { LIVE_COMPLETED_COUNT } from "@/lib/marketing/completionStats";
import {
  getHeaderDropdownMenus,
  type HeaderNavKey,
} from "@/lib/navigation/headerDropdownMenus";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpandedKey, setMobileExpandedKey] = useState<HeaderNavKey | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<HeaderNavKey | null>(null);
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const isHomeRoute = pathname === "/zh" || pathname === "/en" || pathname === "/";
  const shouldRenderCompletedMetric =
    !isHomeRoute || (typeof LIVE_COMPLETED_COUNT === "number" && LIVE_COMPLETED_COUNT > 0);
  const targetLocale = locale === "zh" ? "en" : "zh";
  const localeBasePath = toggleLocalePath(pathname, targetLocale);
  const localeQuery = searchParams.toString();
  const localeHref = localeQuery ? `${localeBasePath}?${localeQuery}` : localeBasePath;
  const localeLabel = targetLocale === "zh" ? dict.lang.zh_label : dict.lang.en_label;

  const navItems: Array<{ key: HeaderNavKey; href: string; label: string }> = [
    { key: "tests", href: "/tests", label: dict.header.tests },
    { key: "articles", href: "/articles", label: dict.header.articles },
    { key: "personality", href: "/personality", label: dict.header.personality },
    { key: "career", href: "/career", label: dict.header.career },
    { key: "help", href: "/help", label: dict.header.help },
    { key: "business", href: "/business", label: dict.header.business },
  ];

  const dropdownMenuMap = useMemo(() => {
    return Object.fromEntries(
      getHeaderDropdownMenus(locale).map((menu) => [menu.key, menu.items])
    ) as Record<HeaderNavKey, Array<{ href: string; label: string }>>;
  }, [locale]);

  function persistLocalePreference() {
    if (typeof document === "undefined") return;
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE_NAME}=${targetLocale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
  }

  function closeMobileMenu() {
    setMenuOpen(false);
    setMobileExpandedKey(null);
  }

  function handleMobileLinkClick() {
    closeMobileMenu();
  }

  function toggleMobileMenu() {
    setActiveDropdown(null);
    setMenuOpen((prev) => {
      const next = !prev;
      if (!next) {
        setMobileExpandedKey(null);
      }
      return next;
    });
  }

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!desktopNavRef.current) return;
      const target = event.target;
      if (target instanceof Node && !desktopNavRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setMenuOpen(false);
        setMobileExpandedKey(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!menuOpen) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--fm-trust-blue-strong)] bg-[var(--fm-trust-blue)]/95 text-white shadow-[var(--fm-shadow-md)] backdrop-blur-md">
      <Container className="max-w-[1320px] py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 shrink-0">
            <Link href={withLocale("/")} className="font-serif text-xl font-semibold tracking-tight text-white">
              {dict.header.brand}
            </Link>
            {shouldRenderCompletedMetric ? (
              <p
                data-visual-volatile="true"
                className="fm-tabular-nums mt-1 flex flex-wrap items-baseline gap-1 text-xs text-blue-100"
              >
                <span>{dict.header.completedPrefix}</span>
                <AnimatedCounter value={LIVE_COMPLETED_COUNT} className="font-semibold tracking-wide text-white" />
                <span>{dict.header.completedSuffix}</span>
              </p>
            ) : null}
          </div>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={dict.header.menu}
            onClick={toggleMobileMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div ref={desktopNavRef} className="hidden min-w-0 flex-1 items-center justify-end gap-1.5 lg:flex xl:gap-2.5">
            <nav className="flex min-w-0 flex-nowrap items-center justify-end gap-0 xl:gap-0.5">
              {navItems.map((item) => {
                const menuId = `header-dropdown-${item.key}`;
                const isOpen = activeDropdown === item.key;
                const items = dropdownMenuMap[item.key] ?? [];

                return (
                  <div key={item.key} className="relative shrink-0">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={menuId}
                      aria-haspopup="menu"
                      onClick={() => setActiveDropdown((prev) => (prev === item.key ? null : item.key))}
                      className="inline-flex min-h-[44px] items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 text-[13px] font-medium text-blue-100 transition hover:bg-white/10 hover:text-white xl:px-2.5 xl:text-sm"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={isOpen ? "h-4 w-4 rotate-180 transition" : "h-4 w-4 transition"} />
                    </button>

                    {isOpen && items.length > 0 ? (
                      <div id={menuId} role="menu" aria-label={item.label} className="fm-header-dropdown-panel">
                        {items.map((menuItem) => (
                          <Link
                            key={`${item.key}-${menuItem.href}`}
                            href={withLocale(menuItem.href)}
                            role="menuitem"
                            className="fm-header-dropdown-link"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {menuItem.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-1 xl:gap-1.5">
              <Link
                href={withLocale("/tests?q=")}
                className="inline-flex h-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
                aria-label={dict.header.search}
                title={dict.header.search}
              >
                <Search className="h-4 w-4" />
              </Link>
              <Link
                href={withLocale("/history/mbti")}
                className="inline-flex h-11 min-h-[44px] min-w-[112px] shrink-0 items-center justify-center gap-1 rounded-full border border-white/25 bg-white/10 px-3.5 text-[13px] font-semibold text-white transition hover:bg-white/20 whitespace-nowrap xl:min-w-[120px] xl:px-4 xl:text-sm"
              >
                <UserRound className="h-4 w-4" />
                <span>{dict.header.profile}</span>
              </Link>

              <LocaleSwitcher />

              <Link
                href={withLocale("/tests/mbti-personality-test-16-personality-types/take")}
                className={buttonVariants({ size: "sm", className: "shrink-0 whitespace-nowrap px-3.5 text-[13px] xl:px-4 xl:text-sm" })}
              >
                {dict.header.start}
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {menuOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label={dict.header.closeMenu}
            onClick={closeMobileMenu}
            className="absolute inset-0 border-0 bg-slate-950/45 p-0 backdrop-blur-[1px]"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label={dict.header.menu}
            className="absolute right-0 top-0 flex h-[100dvh] w-[clamp(280px,82vw,360px)] flex-col border-l border-white/18 bg-gradient-to-b from-[#1e427f] via-[#173567] to-[#11284f] shadow-[-24px_0_56px_rgba(5,16,34,0.48)]"
          >
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-4">
              <Link href={withLocale("/")} onClick={handleMobileLinkClick} className="font-serif text-xl font-semibold text-white">
                {dict.header.brand}
              </Link>
              <button
                type="button"
                aria-label={dict.header.closeMenu}
                onClick={closeMobileMenu}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <nav className="space-y-1">
                <Link
                  href={withLocale("/")}
                  onClick={handleMobileLinkClick}
                  className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  {dict.header.home}
                </Link>

                {navItems.map((item) => {
                  const isExpanded = mobileExpandedKey === item.key;
                  const menuItems = dropdownMenuMap[item.key] ?? [];

                  return (
                    <div key={`mobile-group-${item.key}`} className="rounded-lg border border-white/10 bg-white/[0.03]">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={`mobile-submenu-${item.key}`}
                        onClick={() => setMobileExpandedKey((prev) => (prev === item.key ? null : item.key))}
                        className="flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={isExpanded ? "h-4 w-4 rotate-180 transition" : "h-4 w-4 transition"} />
                      </button>

                      {isExpanded ? (
                        <div id={`mobile-submenu-${item.key}`} className="space-y-1 border-t border-white/10 px-2 pb-2 pt-2">
                          {menuItems.map((menuItem) => (
                            <Link
                              key={`mobile-submenu-link-${item.key}-${menuItem.href}`}
                              href={withLocale(menuItem.href)}
                              onClick={handleMobileLinkClick}
                              className="block rounded-md px-3 py-2 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
                            >
                              {menuItem.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                <Link
                  href={withLocale("/tests?q=")}
                  onClick={handleMobileLinkClick}
                  className="mt-2 flex min-h-[44px] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Search className="h-4 w-4" />
                  <span>{dict.header.search}</span>
                </Link>

                <Link
                  href={localeHref}
                  onClick={() => {
                    persistLocalePreference();
                    handleMobileLinkClick();
                  }}
                  className="flex min-h-[44px] items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {localeLabel}
                </Link>
              </nav>
            </div>

            <div className="shrink-0 border-t border-white/15 bg-slate-950/20 p-4">
              <div className="flex items-center gap-2">
                <Link
                  href={withLocale("/tests/mbti-personality-test-16-personality-types/take")}
                  className={`${buttonVariants({ size: "sm" })} flex-1 justify-center`}
                  onClick={handleMobileLinkClick}
                >
                  {dict.header.start}
                </Link>
                <Link
                  href={withLocale("/history/mbti")}
                  onClick={handleMobileLinkClick}
                  className="inline-flex h-11 min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <UserRound className="h-4 w-4" />
                  <span>{dict.header.profile}</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
