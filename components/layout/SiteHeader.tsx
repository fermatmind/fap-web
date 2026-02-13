"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

const navItems = [
  { href: "/tests", label: "Tests" },
  { href: "/types", label: "Types" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={withLocale("/")} className="text-lg font-semibold tracking-tight text-slate-900">
          FermatMind
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={withLocale(item.href)}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={withLocale("/tests/personality-mbti-test/take")}
            className={buttonVariants({ size: "sm" })}
          >
            Start
          </Link>
        </div>
      </Container>
    </header>
  );
}
