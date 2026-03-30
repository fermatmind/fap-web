"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const withLocale = (path: string) => normalizePublicHref(path, locale);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";
  const socialItems = FOOTER_SOCIAL_ITEMS;
  const [activeSocialKey, setActiveSocialKey] = useState<string | null>(null);
  const footerCopy =
    locale === "zh"
      ? {
          hubsTitle: "专题 Hub",
          typesTitle: "实体 / 类型",
          methodsTitle: "方法 / 数据",
          guidesTitle: "指南网络",
          testsTitle: "测试入口",
          careerTitle: "职业图谱",
          supportTitle: "治理与支持",
          tailnote: "From Noise to Clarity.",
        }
      : {
          hubsTitle: "Hub network",
          typesTitle: "Entities / types",
          methodsTitle: "Methods / data",
          guidesTitle: "Guide network",
          testsTitle: "Test entrypoints",
          careerTitle: "Career graph",
          supportTitle: "Governance & support",
          tailnote: "From Noise to Clarity.",
        };

  const hubLinks = [
    { href: "/topics", label: locale === "zh" ? "全部专题" : "All hubs" },
    { href: "/career/recommendations", label: locale === "zh" ? "职业推荐 Hub" : "Career hubs" },
    { href: "/career/industries", label: locale === "zh" ? "行业 Hub" : "Industry hubs" },
  ];

  const typeLinks = [
    { href: "/personality", label: locale === "zh" ? "全部人格实体" : "All entities" },
    { href: "/personality/intp-a", label: "INTP" },
    { href: "/personality/entj-a", label: "ENTJ" },
    { href: "/personality/infp-a", label: "INFP" },
  ];

  const guideLinks = [
    { href: "/articles", label: locale === "zh" ? "全部指南" : "All guides" },
    { href: "/career/guides", label: locale === "zh" ? "职业指南" : "Career guides" },
    { href: "/help", label: locale === "zh" ? "帮助指南" : "Help guides" },
  ];

  const methodDataLinks = [
    { href: "/methods", label: locale === "zh" ? "方法页中心" : "Methods hub" },
    { href: "/data", label: locale === "zh" ? "数据页中心" : "Data hub" },
  ];

  const testLinks = [
    { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI" },
    { href: "/tests/big-five-personality-test-ocean-model", label: "Big Five" },
    { href: "/tests/clinical-depression-anxiety-assessment-professional-edition", label: "Clinical Combo" },
    { href: "/tests/depression-screening-test-standard-edition", label: "SDS-20" },
    { href: "/tests/iq-test-intelligence-quotient-assessment", label: "IQ" },
    { href: "/tests/eq-test-emotional-intelligence-assessment", label: "EQ" },
  ];

  const careerLinks = [
    { href: "/career", label: locale === "zh" ? "职业中心" : "Career center" },
    { href: "/career/jobs", label: locale === "zh" ? "职业库" : "Job library" },
    { href: "/career/guides", label: locale === "zh" ? "职业指南" : "Career guides" },
    { href: "/career/recommendations", label: locale === "zh" ? "职业推荐" : "Recommendations" },
  ];

  const helpLinks = [
    { href: "/help", label: locale === "zh" ? "帮助中心" : "Help Center" },
    { href: "/business", label: dict.header.business },
    { href: "/email/preferences", label: dict.footer.manageEmailPreferences, testId: "footer-email-preferences" },
    { href: "/email/unsubscribe", label: dict.footer.unsubscribeFromEmails, testId: "footer-email-unsubscribe" },
    { href: "/privacy", label: dict.footer.privacy },
    { href: "/terms", label: dict.footer.terms },
    { href: "/refund", label: dict.footer.refund },
  ];

  return (
    <footer className="fm-section-dark border-t border-white/10 text-white">
      <Container className="space-y-8 py-12">
        <div className="space-y-2 border-b border-white/10 pb-5">
          <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-white/55">Protocol footer</p>
          <p className="m-0 text-sm text-slate-300">
            {locale === "zh"
              ? "用专题、实体、指南、测试和职业图谱收束全站公共语义入口，治理与支持链接只保留在辅助区。"
              : "Public semantics close through hubs, entities, guides, tests, and career graph links, while governance links stay in the support rail."}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-7">
          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.hubsTitle}</p>
            <div className="space-y-2 text-sm">
              {hubLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.typesTitle}</p>
            <div className="space-y-2 text-sm">
              {typeLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.guidesTitle}</p>
            <div className="space-y-2 text-sm">
              {guideLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.methodsTitle}</p>
            <div className="space-y-2 text-sm">
              {methodDataLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.testsTitle}</p>
            <div className="space-y-2 text-sm">
              {testLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.careerTitle}</p>
            <div className="space-y-2 text-sm">
              {careerLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.supportTitle}</p>
            <div className="space-y-2 text-sm">
              {helpLinks.map((item) => (
                <Link
                  key={item.href}
                  href={withLocale(item.href)}
                  className="block text-slate-300 hover:text-white"
                  data-testid={item.testId}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="m-0 text-sm text-slate-300">{dict.footer.ratingLabel}</p>
            <p className="m-0 text-sm text-slate-300">
              <a href={`mailto:${supportEmail}`} className="font-semibold text-white hover:text-[var(--fm-gold)]">
                {supportEmail}
              </a>
            </p>
          </div>
        </div>

        <div className="fm-social-rail border-t border-white/15 pt-6">
          <p className="m-0 mb-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white/90">
            {dict.footer.socialTitle}
          </p>
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
                          src={item.qrImageSrc}
                          alt={locale === "zh" ? "微信二维码" : "WeChat QR code"}
                          width={144}
                          height={144}
                          className="fm-social-qr-image"
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
