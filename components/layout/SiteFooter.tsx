"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleContext";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export function SiteFooter() {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <footer className="border-t border-[var(--fm-border)] bg-white/80 backdrop-blur-sm">
      <Container className="space-y-4 py-8">
        <p className="text-sm text-[var(--fm-text-muted)]">
          {dict.legal.medical_disclaimer}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href={withLocale("/privacy")} className="text-[var(--fm-text-muted)] hover:text-[var(--fm-text)]">
            {dict.footer.privacy}
          </Link>
          <Link href={withLocale("/terms")} className="text-[var(--fm-text-muted)] hover:text-[var(--fm-text)]">
            {dict.footer.terms}
          </Link>
          <Link href={withLocale("/refund")} className="text-[var(--fm-text-muted)] hover:text-[var(--fm-text)]">
            {dict.footer.refund}
          </Link>
          <Link href={withLocale("/support")} className="text-[var(--fm-text-muted)] hover:text-[var(--fm-text)]">
            {dict.footer.support}
          </Link>
        </div>

        <p className="text-xs text-[var(--fm-text-muted)]">
          © {new Date().getFullYear()} FermatMind. {dict.footer.copyright}
        </p>
      </Container>
    </footer>
  );
}
