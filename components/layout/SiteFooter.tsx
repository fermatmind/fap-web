"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";
import { cn } from "@/lib/utils";

type FooterLinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

export function SiteFooter() {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const socialItems = FOOTER_SOCIAL_ITEMS;
  const [activeSocialKey, setActiveSocialKey] = useState<string | null>(null);
  const [qrFallbackState, setQrFallbackState] = useState<Record<string, boolean>>({});
  const footerCopy =
    locale === "zh"
      ? {
          testsTitle: "热门测评",
          articlesTitle: "内容与指南",
          companyTitle: "公司",
          policiesTitle: "条款与政策",
          tailnote: "测量自己，看见职业，训练未来。",
        }
      : {
          testsTitle: "Top tests",
          articlesTitle: "Reading & guides",
          companyTitle: "Company",
          policiesTitle: "Terms & policies",
          tailnote: "See the Micro. Lead the Macro.",
        };

  const testLinks = filterVisiblePublicTestEntries([
    { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI" },
    { href: "/tests/big-five-personality-test-ocean-model", label: "Big Five" },
    { href: "/tests/clinical-depression-anxiety-assessment-professional-edition", label: "Clinical Combo" },
    { href: "/tests/depression-screening-test-standard-edition", label: "SDS-20" },
    { href: "/tests/iq-test-intelligence-quotient-assessment", label: "IQ" },
    { href: "/tests/eq-test-emotional-intelligence-assessment", label: "EQ" },
  ]);

  const articleLinks =
    locale === "zh"
      ? [{ href: "/articles", label: "全部文章" }]
      : [
          { href: "/articles", label: "All articles" },
          { href: "/articles/mbti-basics", label: "MBTI Basics" },
        ];
  const companyLinks: FooterLinkItem[] =
    locale === "zh"
      ? [
          { href: "/about", label: "关于我们" },
          { href: "/charter", label: "我们的宪章" },
          { href: "/foundation", label: "基金会" },
          { href: "/careers", label: "工作机会" },
          { href: "/brand", label: "品牌" },
        ]
      : [];
  const policyLinks: FooterLinkItem[] =
    locale === "zh"
      ? [
          { href: "/terms", label: "使用条款" },
          { href: "/privacy", label: "隐私政策" },
          { href: "/policies", label: "其他政策" },
        ]
      : [];
  const renderFooterLink = (item: FooterLinkItem) =>
    item.external ? (
      <a
        key={`${item.href}-${item.label}`}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-slate-300 hover:text-white"
      >
        {item.label}
      </a>
    ) : (
      <Link
        key={`${item.href}-${item.label}`}
        href={withLocale(item.href)}
        prefetch={false}
        className="block text-slate-300 hover:text-white"
      >
        {item.label}
      </Link>
    );

  return (
    <footer className="fm-section-dark border-t border-white/10 text-white">
      <Container className="space-y-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.testsTitle}</p>
            <div className="space-y-2 text-sm">
              {testLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} prefetch={false} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.articlesTitle}</p>
            <div className="space-y-2 text-sm">
              {articleLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} prefetch={false} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {companyLinks.length ? (
            <div className="space-y-3">
              <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.companyTitle}</p>
              <div className="space-y-2 text-sm">{companyLinks.map(renderFooterLink)}</div>
            </div>
          ) : null}

          {policyLinks.length ? (
            <div className="space-y-3">
              <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.policiesTitle}</p>
              <div className="space-y-2 text-sm">{policyLinks.map(renderFooterLink)}</div>
            </div>
          ) : null}
        </div>

        <div className="fm-social-rail border-t border-white/15 pt-6">
          <div className="fm-social-list">
            {socialItems.map((item) => (
              <div
                key={item.key}
                className="fm-social-item"
                onMouseEnter={() => setActiveSocialKey(item.key)}
                onMouseLeave={() => setActiveSocialKey((current) => (current === item.key ? null : current))}
              >
                {item.kind === "qr" ? (
                  <>
                    <button
                      type="button"
                      title={locale === "zh" ? item.labels.zh : item.labels.en}
                      aria-label={locale === "zh" ? item.labels.zh : item.labels.en}
                      aria-expanded={activeSocialKey === item.key}
                      className="fm-social-badge cursor-pointer border-0 bg-transparent p-0"
                      onClick={() => setActiveSocialKey((current) => (current === item.key ? null : item.key))}
                      onFocus={() => setActiveSocialKey(item.key)}
                      onBlur={() => setActiveSocialKey((current) => (current === item.key ? null : current))}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="fm-social-logo">
                        <path d={item.icon.path} />
                      </svg>
                      <span className="fm-social-tooltip">{locale === "zh" ? item.labels.zh : item.labels.en}</span>
                    </button>

                    {item.qrImageSrc ? (
                      <div
                        className={cn("fm-social-qr-panel", activeSocialKey === item.key && "is-open")}
                        aria-hidden={activeSocialKey === item.key ? "false" : "true"}
                      >
                        <Image
                          src={qrFallbackState[item.key] && item.qrFallbackSrc ? item.qrFallbackSrc : item.qrImageSrc}
                          alt={locale === "zh" ? "微信二维码" : "WeChat QR code"}
                          width={258}
                          height={258}
                          unoptimized
                          priority
                          className="fm-social-qr-image"
                          onError={() => {
                            if (!item.qrFallbackSrc || qrFallbackState[item.key]) return;
                            setQrFallbackState((current) => ({ ...current, [item.key]: true }));
                          }}
                        />
                        <p className="fm-social-qr-label">{locale === "zh" ? "微信扫码关注" : "Scan in WeChat"}</p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={locale === "zh" ? item.labels.zh : item.labels.en}
                    aria-label={locale === "zh" ? item.labels.zh : item.labels.en}
                    className="fm-social-badge"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="fm-social-logo">
                      <path d={item.icon.path} />
                    </svg>
                    <span className="fm-social-tooltip">{locale === "zh" ? item.labels.zh : item.labels.en}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 text-center">
          <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-white/62">{footerCopy.tailnote}</p>
          <p data-visual-volatile="true" className="m-0 mt-3 text-xs text-slate-400">
            © {new Date().getFullYear()} FermatMind. {dict.footer.copyright}
          </p>
        </div>
      </Container>
    </footer>
  );
}
