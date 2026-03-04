"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleContext";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

type SocialTone = "blue" | "ink" | "teal" | "cyan" | "orange" | "gold" | "fusion";

type FooterSocialItem = {
  key: string;
  shortLabel: string;
  href: string;
  tone: SocialTone;
  labels: {
    zh: string;
    en: string;
  };
};

export function SiteFooter() {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";
  const socialItems: FooterSocialItem[] = [
    { key: "fb", shortLabel: "FB", href: "#", tone: "blue", labels: { zh: "Facebook", en: "Facebook" } },
    { key: "x", shortLabel: "X", href: "#", tone: "ink", labels: { zh: "X", en: "X" } },
    { key: "yt", shortLabel: "YT", href: "#", tone: "gold", labels: { zh: "YouTube", en: "YouTube" } },
    { key: "ig", shortLabel: "IG", href: "#", tone: "fusion", labels: { zh: "Instagram", en: "Instagram" } },
    { key: "in", shortLabel: "IN", href: "#", tone: "cyan", labels: { zh: "LinkedIn", en: "LinkedIn" } },
    { key: "wx", shortLabel: "WX", href: "#", tone: "teal", labels: { zh: "微信公众号", en: "WeChat Official Account" } },
    { key: "xhs", shortLabel: "XHS", href: "#", tone: "orange", labels: { zh: "小红书", en: "Xiaohongshu" } },
    { key: "b", shortLabel: "B", href: "#", tone: "blue", labels: { zh: "B站", en: "Bilibili" } },
    { key: "dy", shortLabel: "DY", href: "#", tone: "orange", labels: { zh: "抖音", en: "Douyin" } },
    { key: "tt", shortLabel: "TT", href: "#", tone: "fusion", labels: { zh: "TikTok", en: "TikTok" } },
  ];

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

  const helpLinks = [
    { href: "/help", label: locale === "zh" ? "帮助中心" : "Help Center" },
    { href: "/privacy", label: dict.footer.privacy },
    { href: "/terms", label: dict.footer.terms },
    { href: "/refund", label: dict.footer.refund },
  ];

  return (
    <footer className="fm-section-dark border-t border-white/10 text-white">
      <Container className="space-y-8 py-12">
        <p className="m-0 text-sm text-slate-300">
          {dict.legal.medical_disclaimer}
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
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
            <p className="m-0 text-sm font-semibold uppercase tracking-[0.14em] text-white">{dict.footer.support}</p>
            <div className="space-y-2 text-sm">
              {helpLinks.map((item) => (
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
          <p className="m-0 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">
            {dict.footer.socialTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={locale === "zh" ? item.labels.zh : item.labels.en}
                aria-label={locale === "zh" ? item.labels.zh : item.labels.en}
                className={`fm-social-badge fm-social-badge--${item.tone}`}
              >
                {item.shortLabel}
              </a>
            ))}
          </div>
        </div>

        <p data-visual-volatile="true" className="m-0 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} FermatMind. {dict.footer.copyright}
        </p>
      </Container>
    </footer>
  );
}
