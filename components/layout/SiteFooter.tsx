"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { Container } from "@/components/layout/Container";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const locale = useLocale();
  const pathname = usePathname() ?? "/";
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";
  const socialItems = FOOTER_SOCIAL_ITEMS;
  const [activeSocialKey, setActiveSocialKey] = useState<string | null>(null);
  const isHomeRoute = pathname === "/zh" || pathname === "/en" || pathname === "/";
  const isTestsHubRoute =
    pathname === "/zh/tests" ||
    pathname === "/en/tests" ||
    pathname.startsWith("/zh/tests/category/") ||
    pathname.startsWith("/en/tests/category/");
  const homeFooter = getHomePageContent(locale).footer;
  const footerCopy =
    locale === "zh"
      ? {
          testsTitle: "热门测评",
          articlesTitle: "阅读与指南",
          supportTitle: "支持",
          reviewsTitle: "政策",
          tailnote: "识微，见远。See the Micro. Lead the Macro.",
          introLabel: "继续浏览",
          introCopy: "把热门测评、延伸阅读、支持和政策入口放在一起，方便继续往下走。",
          supportMeta: "隐私、条款、退款与联系支持都在这里。",
        }
      : {
          testsTitle: "Top tests",
          articlesTitle: "Reading & guides",
          supportTitle: "Support",
          reviewsTitle: "Policies",
          tailnote: "See the Micro. Lead the Macro.",
          introLabel: "Continue browsing",
          introCopy: "Keep top tests, reading, support, and policy links together so the next step stays easy.",
          supportMeta: "Privacy, terms, refunds, and contact support are all available here.",
        };

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
    { href: "/email/preferences", label: dict.footer.manageEmailPreferences, testId: "footer-email-preferences" },
    { href: "/email/unsubscribe", label: dict.footer.unsubscribeFromEmails, testId: "footer-email-unsubscribe" },
    { href: "/privacy", label: dict.footer.privacy },
    { href: "/terms", label: dict.footer.terms },
    { href: "/refund", label: dict.footer.refund },
  ];

  const testsHubFooter =
    locale === "zh"
      ? {
          introLabel: "继续浏览",
          introCopy: "从这里继续进入热门测评、分类、资源和支持入口。",
          groups: [
            {
              title: "Top Tests",
              links: [
                { href: "/career/tests/riasec", label: "霍兰德职业兴趣测试" },
                { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI 性格测试" },
                { href: "/tests/big-five-personality-test-ocean-model", label: "大五人格测试" },
                { href: "/tests/eq-test-emotional-intelligence-assessment", label: "情商（EQ）测试" },
              ],
            },
            {
              title: "Categories",
              links: [
                { href: "/tests", label: "测评入口中心" },
                { href: "/tests/category/personality", label: "人格与风格" },
                { href: "/tests/category/career", label: "职业与方向" },
                { href: "/career/tests", label: "职业测试" },
              ],
            },
            {
              title: "Resources",
              links: [
                { href: "/articles/mbti-basics", label: "MBTI 入门" },
                { href: "/articles/big-five-tool-guide", label: "大五工具说明" },
                { href: "/career/guides/how-to-find-right-career-direction", label: "如何找到更适合自己的职业方向" },
                { href: "/articles", label: "全部资源" },
              ],
            },
            {
              title: "Support",
              links: [
                { href: "/help", label: "帮助中心" },
                { href: "/privacy", label: dict.footer.privacy },
                { href: "/terms", label: dict.footer.terms },
                { href: "/help/contact", label: "联系支持" },
              ],
            },
          ],
        }
      : {
          introLabel: "Continue browsing",
          introCopy: "Keep moving through top tests, categories, resources, and support from here.",
          groups: [
            {
              title: "Top Tests",
              links: [
                { href: "/career/tests/riasec", label: "RIASEC career interest test" },
                { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI personality test" },
                { href: "/tests/big-five-personality-test-ocean-model", label: "Big Five personality test" },
                { href: "/tests/eq-test-emotional-intelligence-assessment", label: "EQ assessment" },
              ],
            },
            {
              title: "Categories",
              links: [
                { href: "/tests", label: "Tests hub" },
                { href: "/tests/category/personality", label: "Personality & style" },
                { href: "/tests/category/career", label: "Career & direction" },
                { href: "/career/tests", label: "Career tests" },
              ],
            },
            {
              title: "Resources",
              links: [
                { href: "/articles/mbti-basics", label: "MBTI basics" },
                { href: "/articles/big-five-tool-guide", label: "Big Five tool guide" },
                { href: "/career/guides/how-to-find-right-career-direction", label: "How to find a better-fit career direction" },
                { href: "/articles", label: "All resources" },
              ],
            },
            {
              title: "Support",
              links: [
                { href: "/help", label: "Help center" },
                { href: "/privacy", label: dict.footer.privacy },
                { href: "/terms", label: dict.footer.terms },
                { href: "/help/contact", label: "Contact support" },
              ],
            },
          ],
        };

  if (isHomeRoute) {
    return (
      <footer className="border-t border-white/8 bg-[#0a1015] text-white">
        <Container className="max-w-[110rem] px-5 py-12 md:px-8 md:py-14 xl:px-12">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <div className="max-w-[24rem] space-y-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-white/38">
                {homeFooter.tailnote}
              </p>
              <p className="m-0 text-lg font-semibold tracking-[-0.035em] text-white">FermatMind / 费马测试</p>
              <p className="m-0 text-sm leading-7 text-slate-400">
                <span className="text-white/48">{homeFooter.supportEmailLabel}: </span>
                <a href={`mailto:${supportEmail}`} className="text-slate-300 transition hover:text-white">
                  {supportEmail}
                </a>
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {homeFooter.groups.map((group) => (
                <section key={group.title} className="space-y-3">
                  <h3 className="m-0 text-sm font-semibold uppercase tracking-[0.16em] text-white/68">{group.title}</h3>
                  <div className="space-y-2.5">
                    {group.links.map((item) => (
                      <Link key={`${group.title}-${item.href}`} href={withLocale(item.href)} className="block text-sm text-slate-400 transition hover:text-white">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-5 border-t border-white/8 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="fm-social-rail md:w-auto">
              <div className="fm-social-list fm-social-list--footer mx-0 w-full max-w-[30rem] justify-items-start">
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
                            className={cn("fm-social-qr-panel fm-social-qr-panel--footer", activeSocialKey === item.key && "is-open")}
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

            <p data-visual-volatile="true" className="m-0 text-xs text-slate-500 md:text-right">
              © {new Date().getFullYear()} FermatMind. {dict.footer.copyright}
            </p>
          </div>
        </Container>
      </footer>
    );
  }

  if (isTestsHubRoute) {
    return (
      <footer className="fm-section-dark border-t border-white/10 text-white">
        <Container className="space-y-8 py-12">
          <div className="space-y-2 border-b border-white/10 pb-5">
            <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-white/55">{testsHubFooter.introLabel}</p>
            <p className="m-0 text-sm text-slate-300">{testsHubFooter.introCopy}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {testsHubFooter.groups.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{group.title}</p>
                <div className="space-y-2 text-sm">
                  {group.links.map((item) => (
                    <Link key={`${group.title}-${item.href}`} href={withLocale(item.href)} className="block text-slate-300 hover:text-white">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
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

  return (
    <footer className="fm-section-dark border-t border-white/10 text-white">
      <Container className="space-y-8 py-12">
        <div className="space-y-2 border-b border-white/10 pb-5">
          <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-white/55">{footerCopy.introLabel}</p>
          <p className="m-0 text-sm text-slate-300">{footerCopy.introCopy}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.articlesTitle}</p>
            <div className="space-y-2 text-sm">
              {articleLinks.map((item) => (
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
          </div>

          <div className="space-y-3">
            <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-white/82">{footerCopy.reviewsTitle}</p>
            <p className="m-0 text-sm text-slate-300">{footerCopy.supportMeta}</p>
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
