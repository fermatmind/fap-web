"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { getDictionarySync } from "@/lib/i18n/getDictionary";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

export function SiteFooter() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictionarySync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="space-y-4 py-8">
        <p className="text-sm text-slate-600">
          {dict.legal.medical_disclaimer}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href={withLocale("/privacy")} className="text-slate-600 hover:text-slate-900">
            {dict.footer.privacy}
          </Link>
          <Link href={withLocale("/terms")} className="text-slate-600 hover:text-slate-900">
            {dict.footer.terms}
          </Link>
          <Link href={withLocale("/refund")} className="text-slate-600 hover:text-slate-900">
            {dict.footer.refund}
          </Link>
          <Link href={withLocale("/support")} className="text-slate-600 hover:text-slate-900">
            {dict.footer.support}
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} FermatMind. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
