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
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";
  const socialItems = ["FB", "X", "YT", "IG", "IN"];

  const testLinks = [
    { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI" },
    { href: "/tests/big-five-personality-test-ocean-model", label: "Big Five" },
    { href: "/tests/clinical-depression-anxiety-assessment-professional-edition", label: "Clinical Combo" },
    { href: "/tests/depression-screening-test-standard-edition", label: "SDS-20" },
    { href: "/tests/iq-test-intelligence-quotient-assessment", label: "IQ" },
    { href: "/tests/eq-test-emotional-intelligence-assessment", label: "EQ" },
  ];

  const articleLinks = [
    { href: "/articles", label: locale === "zh" ? "全部文章" : "All articles" },
    { href: "/articles/mbti-basics", label: "MBTI Basics" },
  ];

  return (
    <footer className="fm-section-dark border-t border-white/10 text-white">
      <Container className="space-y-8 py-12">
        <p className="m-0 text-sm text-slate-300">
          {dict.legal.medical_disclaimer}
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="m-0 text-sm font-semibold uppercase tracking-[0.14em] text-white">{dict.footer.allTestsTitle}</p>
            <div className="space-y-2 text-sm">
              {testLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 text-sm font-semibold uppercase tracking-[0.14em] text-white">{dict.footer.articlesTitle}</p>
            <div className="space-y-2 text-sm">
              {articleLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 text-sm font-semibold uppercase tracking-[0.14em] text-white">{dict.footer.localesTitle}</p>
            <div className="space-y-2 text-sm">
              <Link href="/en" className="block text-slate-300 hover:text-white">EN</Link>
              <Link href="/zh" className="block text-slate-300 hover:text-white">中文</Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 text-sm font-semibold uppercase tracking-[0.14em] text-white">{dict.footer.reviewsTitle}</p>
            <p className="m-0 text-sm text-slate-300">{dict.footer.ratingLabel}</p>
            <p className="m-0 text-sm text-slate-300">
              {dict.footer.contactLabel}:{" "}
              <a href={`mailto:${supportEmail}`} className="font-semibold text-white hover:text-[var(--fm-gold)]">
                {supportEmail}
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-4 border-t border-white/15 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialItems.map((item) => (
              <span
                key={item}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white transition hover:bg-[var(--fm-gold)] hover:text-amber-900"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href={withLocale("/privacy")} className="text-slate-300 hover:text-white">{dict.footer.privacy}</Link>
            <Link href={withLocale("/terms")} className="text-slate-300 hover:text-white">{dict.footer.terms}</Link>
            <Link href={withLocale("/refund")} className="text-slate-300 hover:text-white">{dict.footer.refund}</Link>
            <Link href={withLocale("/help")} className="text-slate-300 hover:text-white">{dict.footer.support}</Link>
          </div>
        </div>

        <p data-visual-volatile="true" className="m-0 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} FermatMind. {dict.footer.copyright}
        </p>
      </Container>
    </footer>
  );
}
