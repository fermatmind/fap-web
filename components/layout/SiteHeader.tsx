"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleContext";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export function SiteHeader() {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const navItems = [
    { href: "/tests", label: dict.header.tests },
    { href: "/types", label: dict.header.types },
    { href: "/blog", label: dict.header.blog },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--fm-border)] bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={withLocale("/")} className="font-serif text-lg font-semibold tracking-tight text-[var(--fm-text)]">
          {dict.header.brand}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={withLocale(item.href)}
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--fm-text-muted)] transition hover:bg-[var(--fm-surface-muted)] hover:text-[var(--fm-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Link
            href={withLocale("/tests/personality-mbti-test/take")}
            className={buttonVariants({ size: "sm" })}
          >
            {dict.header.start}
          </Link>
        </div>
      </Container>
    </header>
  );
}
