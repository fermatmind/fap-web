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

type FooterGroup = {
  key: "tests" | "articles" | "methods" | "company" | "policies";
  title: string;
  links: FooterLinkItem[];
};

export function SiteFooter() {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const socialItems = FOOTER_SOCIAL_ITEMS;
  const [activeSocialKey, setActiveSocialKey] = useState<string | null>(null);
  const [qrFallbackState, setQrFallbackState] = useState<Record<string, boolean>>({});
  const footerGroupTitles = dict.footer.groupTitles;

  const testLinks = filterVisiblePublicTestEntries([
    { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI" },
    { href: "/tests/big-five-personality-test-ocean-model", label: locale === "zh" ? "大五人格" : "Big Five" },
    { href: "/tests/enneagram-personality-test-nine-types", label: locale === "zh" ? "九型人格" : "Enneagram" },
    { href: "/tests/holland-career-interest-test-riasec", label: locale === "zh" ? "霍兰德职业兴趣测试" : "RIASEC" },
    { href: "/tests/iq-test-intelligence-quotient-assessment", label: locale === "zh" ? "智商测试" : "IQ" },
    { href: "/tests/eq-test-emotional-intelligence-assessment", label: locale === "zh" ? "情商测试" : "EQ" },
  ]);

  const articleLinks =
    locale === "zh"
      ? [
          { href: "/topics", label: "主题" },
          { href: "/career/guides", label: "测评指南" },
          { href: "/articles", label: "博客" },
          { href: "/articles", label: "研究报告" },
        ]
      : [
          { href: "/topics", label: "Topics" },
          { href: "/career/guides", label: "Assessment Guides" },
          { href: "/articles", label: "Journal" },
          { href: "/articles", label: "Research reports" },
        ];
  const methodLinks: FooterLinkItem[] =
    locale === "zh"
      ? [
          { href: "/method-boundaries", label: "方法边界" },
        ]
      : [
          { href: "/science", label: "Assessment science" },
          { href: "/method-boundaries", label: "Method boundaries" },
          { href: "/item-design-notes", label: "Item design notes" },
          { href: "/reliability-validity", label: "Reliability & validity" },
          { href: "/data-privacy", label: "Data notes" },
          { href: "/common-misconceptions", label: "Common misconceptions" },
        ];
  const companyLinks: FooterLinkItem[] =
    locale === "zh"
      ? [
          { href: "/about", label: "关于我们" },
          { href: "/brand", label: "品牌" },
          { href: "/charter", label: "宪章" },
          { href: "/foundation", label: "公共利益" },
          { href: "/careers", label: "工作机会" },
        ]
      : [
          { href: "/about", label: "About" },
          { href: "/brand", label: "Brand" },
          { href: "/charter", label: "Charter" },
          { href: "/foundation", label: "Public benefit" },
          { href: "/careers", label: "Careers" },
        ];
  const policyLinks: FooterLinkItem[] =
    locale === "zh"
      ? [
          { href: "/support", label: dict.footer.support },
          { href: "/privacy", label: dict.footer.privacy },
          { href: "/terms", label: dict.footer.terms },
          { href: "/policies", label: "政策概览" },
        ]
      : [
          { href: "/support", label: dict.footer.support },
          { href: "/privacy", label: dict.footer.privacy },
          { href: "/terms", label: dict.footer.terms },
          { href: "/policies", label: "Policy overview" },
        ];
  const footerGroups: FooterGroup[] = [
    { key: "tests", title: footerGroupTitles.tests, links: testLinks },
    { key: "articles", title: footerGroupTitles.articles, links: articleLinks },
    { key: "methods", title: locale === "zh" ? "研究与方法" : "Research & Methods", links: methodLinks },
    { key: "company", title: footerGroupTitles.company, links: companyLinks },
    { key: "policies", title: footerGroupTitles.policies, links: policyLinks },
  ];
  const renderFooterLink = (item: FooterLinkItem) =>
    item.external ? (
      <a
        key={`${item.href}-${item.label}`}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-fit text-[0.98rem] font-medium leading-7 text-slate-950 transition-colors duration-150 hover:text-lime-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-500"
      >
        {item.label}
      </a>
    ) : (
      <Link
        key={`${item.href}-${item.label}`}
        href={withLocale(item.href)}
        prefetch={false}
        className="block w-fit text-[0.98rem] font-medium leading-7 text-slate-950 transition-colors duration-150 hover:text-lime-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-500"
      >
        {item.label}
      </Link>
    );

  return (
    <footer className="fm-section-footer fm-site-footer-light border-t border-[var(--fm-border-subtle)] text-[var(--fm-text-main)]">
      <Container className="max-w-7xl space-y-16 py-20 md:py-28">
        <div className="grid grid-cols-2 gap-x-14 gap-y-14 md:grid-cols-5 lg:gap-x-18 xl:gap-x-24">
          {footerGroups.map((group) => (
            <div key={group.key} className="space-y-5" data-testid={`site-footer-group-${group.key}`}>
              <p className="m-0 text-sm font-medium leading-6 text-slate-500">{group.title}</p>
              <div className="min-h-5 space-y-2.5">{group.links.map(renderFooterLink)}</div>
            </div>
          ))}
        </div>

        <div className="fm-social-rail border-t border-slate-300/70 pt-8">
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
                      className="fm-social-badge fm-social-badge--footer cursor-pointer border-0 bg-transparent p-0"
                      onClick={() => setActiveSocialKey(item.key)}
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
                    className="fm-social-badge fm-social-badge--footer"
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

        <div className="border-t border-slate-300/70 pt-7 text-center">
          <p className="m-0 text-sm font-medium leading-6 text-slate-500">{dict.footer.tailnote}</p>
          <p data-visual-volatile="true" className="m-0 mt-3 text-sm text-slate-500">
            © {new Date().getFullYear()} FermatMind. {dict.footer.copyright}
          </p>
        </div>
      </Container>
    </footer>
  );
}
