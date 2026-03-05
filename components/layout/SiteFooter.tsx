"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleContext";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

type FooterSocialItem = {
  key: string;
  href: string;
  iconSrc: string;
  brandBg: string;
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
    {
      key: "fb",
      href: "#",
      iconSrc: "/icons/social/facebook.svg",
      brandBg: "#1877F2",
      labels: { zh: "Facebook", en: "Facebook" },
    },
    {
      key: "x",
      href: "#",
      iconSrc: "/icons/social/x.svg",
      brandBg: "#000000",
      labels: { zh: "X", en: "X" },
    },
    {
      key: "yt",
      href: "#",
      iconSrc: "/icons/social/youtube.svg",
      brandBg: "#FF0000",
      labels: { zh: "YouTube", en: "YouTube" },
    },
    {
      key: "ig",
      href: "#",
      iconSrc: "/icons/social/instagram.svg",
      brandBg: "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 45%, #6228d7 100%)",
      labels: { zh: "Instagram", en: "Instagram" },
    },
    {
      key: "in",
      href: "#",
      iconSrc: "/icons/social/linkedin.svg",
      brandBg: "#0A66C2",
      labels: { zh: "LinkedIn", en: "LinkedIn" },
    },
    {
      key: "wx",
      href: "#",
      iconSrc: "/icons/social/wechat.svg",
      brandBg: "#07C160",
      labels: { zh: "微信公众号", en: "WeChat Official Account" },
    },
    {
      key: "xhs",
      href: "#",
      iconSrc: "/icons/social/xiaohongshu.svg",
      brandBg: "#FF2442",
      labels: { zh: "小红书", en: "Xiaohongshu" },
    },
    {
      key: "b",
      href: "#",
      iconSrc: "/icons/social/bilibili.svg",
      brandBg: "#00A1D6",
      labels: { zh: "B站", en: "Bilibili" },
    },
    {
      key: "dy",
      href: "#",
      iconSrc: "/icons/social/douyin.svg",
      brandBg: "linear-gradient(135deg, #22d3ee 0%, #161823 42%, #fe2c55 100%)",
      labels: { zh: "抖音", en: "Douyin" },
    },
    {
      key: "tt",
      href: "#",
      iconSrc: "/icons/social/tiktok.svg",
      brandBg: "#111111",
      labels: { zh: "TikTok", en: "TikTok" },
    },
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

        <div className="border-t border-white/15 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={locale === "zh" ? item.labels.zh : item.labels.en}
                aria-label={locale === "zh" ? item.labels.zh : item.labels.en}
                className="fm-social-badge"
                style={{ background: item.brandBg }}
              >
                <Image
                  src={item.iconSrc}
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                  className="fm-social-logo"
                />
                <span className="fm-social-tooltip">{locale === "zh" ? item.labels.zh : item.labels.en}</span>
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
