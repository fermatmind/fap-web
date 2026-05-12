"use client";

import { ChevronDown, Menu, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { LiveCompletedCounter } from "@/components/marketing/LiveCompletedCounter";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath, toggleLocalePath } from "@/lib/i18n/locales";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/localeNegotiation";
import { LIVE_COMPLETED_COUNT } from "@/lib/marketing/completionStats";
import {
  getHeaderDropdownMenus,
  type HeaderNavKey,
} from "@/lib/navigation/headerDropdownMenus";
import type { ProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { cn } from "@/lib/utils";

function shouldHideNavItem(
  item: { key: HeaderNavKey; href: string; label: string },
  flags: ProductPriorityEnvSnapshot
): boolean {
  return item.key === "articles" && !flags.articlesEnabled;
}

function shouldHideMenuHref(href: string, flags: ProductPriorityEnvSnapshot): boolean {
  if (!flags.articlesEnabled && href.startsWith("/articles")) return true;
  if (!flags.topicsEnabled && href.startsWith("/topics")) return true;
  if (!flags.careerRecommendEnabled && href.startsWith("/career/recommendations")) return true;
  return false;
}

export function SiteHeader({
  productPriority,
}: {
  productPriority?: ProductPriorityEnvSnapshot;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpandedKey, setMobileExpandedKey] = useState<HeaderNavKey | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<HeaderNavKey | null>(null);
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const openDropdownTimeoutRef = useRef<number | null>(null);
  const closeDropdownTimeoutRef = useRef<number | null>(null);
  const pathname = usePathname() ?? "/";
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const isHomeRoute = pathname === "/zh" || pathname === "/en" || pathname === "/";
  const isTestsHubRoute =
    pathname === "/zh/tests" ||
    pathname === "/en/tests" ||
    pathname.startsWith("/zh/tests/category/") ||
    pathname.startsWith("/en/tests/category/");
  const isBrandSurfaceRoute = isHomeRoute || isTestsHubRoute;
  const shouldRenderCompletedMetric =
    !isBrandSurfaceRoute && typeof LIVE_COMPLETED_COUNT === "number" && LIVE_COMPLETED_COUNT > 0;
  const targetLocale = locale === "zh" ? "en" : "zh";
  const localeHref = toggleLocalePath(pathname, targetLocale);
  const localeLabel = targetLocale === "zh" ? dict.lang.zh_label : dict.lang.en_label;
  const priorityFlags: ProductPriorityEnvSnapshot = useMemo(
    () =>
      productPriority ?? {
        mbtiPriorityMode: false,
        articlesEnabled: true,
        topicsEnabled: true,
        careerRecommendEnabled: true,
      },
    [productPriority]
  );

  const navItems = [
    { key: "tests", href: "/tests", label: dict.header.tests },
    { key: "articles", href: "/articles", label: dict.header.articles },
    { key: "personality", href: "/personality", label: dict.header.personality },
    { key: "career", href: "/career", label: dict.header.career },
    { key: "help", href: "/support", label: dict.header.help },
    { key: "business", href: "/business", label: dict.header.business },
  ] satisfies Array<{ key: HeaderNavKey; href: string; label: string }>;
  const visibleNavItems = navItems.filter((item) => !shouldHideNavItem(item, priorityFlags));

  const dropdownMenuMap = useMemo(() => {
    return Object.fromEntries(
      getHeaderDropdownMenus(locale).map((menu) => [
        menu.key,
        menu.items.filter((item) => !shouldHideMenuHref(item.href, priorityFlags)),
      ])
    ) as Record<HeaderNavKey, Array<{ href: string; label: string }>>;
  }, [locale, priorityFlags]);
  const startButtonClass =
    "inline-flex h-9 min-h-[36px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/12 bg-[#e6ece8] px-4 text-[13px] font-semibold text-[#121923] shadow-none transition hover:bg-[#f1f5f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

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

  function clearDropdownTimers() {
    if (openDropdownTimeoutRef.current) {
      window.clearTimeout(openDropdownTimeoutRef.current);
      openDropdownTimeoutRef.current = null;
    }

    if (closeDropdownTimeoutRef.current) {
      window.clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
  }

  function openDropdown(key: HeaderNavKey, delay = 0) {
    clearDropdownTimers();

    if (delay > 0) {
      openDropdownTimeoutRef.current = window.setTimeout(() => {
        setActiveDropdown(key);
        openDropdownTimeoutRef.current = null;
      }, delay);
      return;
    }

    setActiveDropdown(key);
  }

  function closeDropdown(delay = 0) {
    if (openDropdownTimeoutRef.current) {
      window.clearTimeout(openDropdownTimeoutRef.current);
      openDropdownTimeoutRef.current = null;
    }

    if (delay > 0) {
      if (closeDropdownTimeoutRef.current) {
        window.clearTimeout(closeDropdownTimeoutRef.current);
      }

      closeDropdownTimeoutRef.current = window.setTimeout(() => {
        setActiveDropdown(null);
        closeDropdownTimeoutRef.current = null;
      }, delay);
      return;
    }

    setActiveDropdown(null);
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
      clearDropdownTimers();
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
    <header
      className="sticky top-0 z-50 border-b border-white/10 bg-[#353e49]/92 text-white shadow-[0_16px_44px_rgba(3,8,16,0.3)] backdrop-blur-xl"
    >
      <Container
        className="max-w-[1320px] px-6 py-2.5 md:px-10 xl:px-12"
      >
        <div className="flex items-center justify-between gap-3">
          <div className={cn("min-w-0 shrink-0", isHomeRoute && "lg:justify-self-start")}>
            <Link
              href={withLocale("/")}
              className={cn(
                "font-serif font-semibold tracking-tight text-white",
                isHomeRoute
                  ? "text-[1.22rem] leading-none xl:text-[1.28rem]"
                  : "text-[1.22rem] leading-none xl:text-[1.28rem]"
              )}
            >
              {dict.header.brand}
            </Link>
            {shouldRenderCompletedMetric ? (
              <p
                data-visual-volatile="true"
                className="fm-tabular-nums mt-1 flex flex-wrap items-baseline gap-1 text-xs text-blue-100"
              >
                <span>{dict.header.completedPrefix}</span>
                <LiveCompletedCounter className="font-semibold tracking-wide text-white" />
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

          <div
            ref={desktopNavRef}
            className="hidden min-w-0 flex-1 items-center justify-end gap-3 xl:gap-3.5 lg:flex"
          >
            <nav
              className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-2.5 xl:gap-3.5"
            >
              {visibleNavItems.map((item) => {
                const menuId = `header-dropdown-${item.key}`;
                const triggerId = `header-trigger-${item.key}`;
                const isOpen = activeDropdown === item.key;
                const items = dropdownMenuMap[item.key] ?? [];

                return (
                  <div
                    key={item.key}
                    className="relative shrink-0"
                    onMouseEnter={() => openDropdown(item.key, 70)}
                    onMouseLeave={() => closeDropdown(110)}
                    onBlur={(event) => {
                      const nextTarget = event.relatedTarget;
                      if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
                        closeDropdown();
                      }
                    }}
                  >
                    <div className="flex items-center gap-0.5">
                      <Link
                        href={withLocale(item.href)}
                        prefetch={false}
                        className="fm-site-header-link"
                        data-testid={`desktop-primary-nav-link-${item.key}`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.label}
                      </Link>
                      <button
                        id={triggerId}
                        type="button"
                        aria-label={`${item.label} menu`}
                        aria-haspopup={items.length > 0 ? "menu" : undefined}
                        aria-expanded={isOpen}
                        aria-controls={items.length > 0 ? menuId : undefined}
                        onClick={() => setActiveDropdown((prev) => (prev === item.key ? null : item.key))}
                        onKeyDown={(event) => {
                          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openDropdown(item.key);
                          }

                          if (event.key === "Escape") {
                            event.preventDefault();
                            closeDropdown();
                          }
                        }}
                        className={cn(
                          "fm-site-header-link fm-site-header-trigger px-1.5"
                        )}
                      >
                        <ChevronDown className={isOpen ? "h-3.5 w-3.5 rotate-180 transition" : "h-3.5 w-3.5 transition"} />
                      </button>
                    </div>

                    {isOpen && items.length > 0 ? (
                      <div
                        id={menuId}
                        role="menu"
                        aria-labelledby={triggerId}
                        className="fm-header-dropdown-panel"
                      >
                        {items.map((menuItem, menuItemIndex) => (
                          <Link
                            key={`${item.key}-${menuItem.href}-${menuItemIndex}`}
                            href={withLocale(menuItem.href)}
                            prefetch={false}
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

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={withLocale("/tests?q=")}
                prefetch={false}
                className="inline-flex h-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
                aria-label={dict.header.search}
                title={dict.header.search}
              >
                <Search className="h-4 w-4" />
              </Link>
              <Link
                href={withLocale("/results/lookup")}
                prefetch={false}
                className="inline-flex h-11 min-h-[44px] min-w-[112px] shrink-0 items-center justify-center gap-1 rounded-full border border-white/25 bg-white/10 px-3.5 text-[13px] font-semibold text-white transition hover:bg-white/20 whitespace-nowrap xl:min-w-[120px] xl:px-4 xl:text-sm"
              >
                <UserRound className="h-4 w-4" />
                <span>{dict.header.profile}</span>
              </Link>

              <LocaleSwitcher />

              <Link
                href={withLocale("/tests/mbti-personality-test-16-personality-types")}
                prefetch={false}
                className={startButtonClass}
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
            className="absolute right-0 top-0 flex h-[100dvh] w-[clamp(280px,82vw,360px)] flex-col border-l border-white/18 bg-gradient-to-b from-[#101921] via-[#0d151d] to-[#0a1218] shadow-[-24px_0_56px_rgba(5,16,34,0.48)]"
          >
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-4">
              <Link href={withLocale("/")} prefetch={false} onClick={handleMobileLinkClick} className="font-serif text-xl font-semibold text-white">
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
                {!isHomeRoute ? (
                  <Link
                    href={withLocale("/")}
                    prefetch={false}
                    onClick={handleMobileLinkClick}
                    className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    {dict.header.home}
                  </Link>
                ) : null}

                {visibleNavItems.map((item) => {
                  const isExpanded = mobileExpandedKey === item.key;
                  const menuItems = dropdownMenuMap[item.key] ?? [];

                  return (
                    <div key={`mobile-group-${item.key}`} className="rounded-lg border border-white/10 bg-white/[0.03]">
                      <div className="flex min-h-[44px] items-stretch">
                        <Link
                          href={withLocale(item.href)}
                          prefetch={false}
                          onClick={handleMobileLinkClick}
                          data-testid={`mobile-primary-nav-link-${item.key}`}
                          className="flex flex-1 items-center rounded-l-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          aria-label={`${item.label} menu`}
                          aria-expanded={isExpanded}
                          aria-controls={`mobile-submenu-${item.key}`}
                          onClick={() => setMobileExpandedKey((prev) => (prev === item.key ? null : item.key))}
                          className="flex min-h-[44px] w-12 items-center justify-center rounded-r-lg text-white transition hover:bg-white/10"
                        >
                          <ChevronDown className={isExpanded ? "h-4 w-4 rotate-180 transition" : "h-4 w-4 transition"} />
                        </button>
                      </div>

                      {isExpanded ? (
                        <div id={`mobile-submenu-${item.key}`} role="menu" className="space-y-1 border-t border-white/10 px-2 pb-2 pt-2">
                          {menuItems.map((menuItem, menuItemIndex) => (
                            <Link
                              key={`mobile-submenu-link-${item.key}-${menuItem.href}-${menuItemIndex}`}
                              href={withLocale(menuItem.href)}
                              prefetch={false}
                              role="menuitem"
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
                  prefetch={false}
                  onClick={handleMobileLinkClick}
                  className="mt-2 flex min-h-[44px] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Search className="h-4 w-4" />
                  <span>{dict.header.search}</span>
                </Link>

                <Link
                  href={localeHref}
                  prefetch={false}
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
                  href={withLocale("/tests/mbti-personality-test-16-personality-types")}
                  prefetch={false}
                  className={`${buttonVariants({ size: "sm" })} flex-1 justify-center`}
                  onClick={handleMobileLinkClick}
                >
                  {dict.header.start}
                </Link>
                <Link
                  href={withLocale("/results/lookup")}
                  prefetch={false}
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
