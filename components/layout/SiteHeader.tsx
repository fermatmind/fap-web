"use client";

import { Menu, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { AnimatedCounter } from "@/components/design/AnimatedCounter";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const liveCompletedCount = 1_049_165;
  const navItems = [
    { href: "/tests", label: dict.header.tests },
    { href: "/articles", label: dict.header.articles },
    { href: "/professions", label: dict.header.professions },
    { href: "/help", label: dict.header.help },
    { href: "/business", label: dict.header.business },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--fm-trust-blue-strong)] bg-[var(--fm-trust-blue)]/95 text-white shadow-[var(--fm-shadow-md)] backdrop-blur-md">
      <Container className="py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link href={withLocale("/")} className="font-serif text-xl font-semibold tracking-tight text-white">
              {dict.header.brand}
            </Link>
            <p data-visual-volatile="true" className="fm-tabular-nums mt-1 flex flex-wrap items-baseline gap-1 text-xs text-blue-100">
              <span>{dict.header.completedPrefix}</span>
              <AnimatedCounter value={liveCompletedCount} className="font-semibold tracking-wide text-white" />
              <span>{dict.header.completedSuffix}</span>
            </p>
          </div>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={dict.header.menu}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 lg:flex">
            <nav className="flex flex-wrap items-center justify-end gap-[var(--fm-gap-xs)]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={withLocale(item.href)}
                  className="rounded-full px-3 py-2 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href={withLocale("/tests?q=")}
              className="inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
              aria-label={dict.header.search}
              title={dict.header.search}
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href={withLocale("/orders/lookup")}
              className="inline-flex h-11 items-center justify-center gap-1 rounded-full border border-white/25 bg-white/10 px-[var(--fm-pad-btn-sm-x)] text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <UserRound className="h-4 w-4" />
              <span>{dict.header.profile}</span>
            </Link>

            <LocaleSwitcher />

            <Link href={withLocale("/tests/mbti-personality-test-16-personality-types/take")} className={buttonVariants({ size: "sm" })}>
              {dict.header.start}
            </Link>
          </div>
        </div>

        {menuOpen ? (
          <div className="mt-3 space-y-3 rounded-[var(--fm-radius-lg)] border border-white/20 bg-white/8 p-3 lg:hidden">
            <nav className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={`mobile-${item.href}`}
                  href={withLocale(item.href)}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/95"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={withLocale("/tests?q=")}
                className="inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-white"
                aria-label={dict.header.search}
                onClick={() => setMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
              </Link>
              <Link
                href={withLocale("/orders/lookup")}
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 items-center justify-center gap-1 rounded-full border border-white/25 bg-white/10 px-[var(--fm-pad-btn-sm-x)] text-xs font-semibold text-white"
              >
                <UserRound className="h-4 w-4" />
                {dict.header.profile}
              </Link>
              <LocaleSwitcher />
              <Link
                href={withLocale("/tests/mbti-personality-test-16-personality-types/take")}
                className={buttonVariants({ size: "sm" })}
                onClick={() => setMenuOpen(false)}
              >
                {dict.header.start}
              </Link>
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
