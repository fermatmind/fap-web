import { Container } from "@/components/layout/Container";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { DeferredSiteFooterSocialRail as SiteFooterSocialRail, DeferredSiteFooterPlatforms as SiteFooterPlatforms } from "@/components/layout/DeferredFooterFeatures";
import { PublicNavigationLink } from "@/components/navigation/PublicNavigationPendingIndicator";
import { getDictSync } from "@/lib/i18n/getDict";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import styles from "./site-footer.module.css";

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

export function SiteFooter({ locale = "en" }: { locale?: DisplayLocale }) {
  const dict = getDictSync(locale);
  const withLocale = (path: string) => displayNavigationPath(path, locale);
  const taiwan = locale === "zh-TW";
  const label = (zh: string, en: string, tw: string) => taiwan ? tw : locale === "zh" ? zh : en;
  const footerGroupTitles = dict.footer.groupTitles;

  const testLinks = filterVisiblePublicTestEntries([
    { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI" },
    { href: "/tests/big-five-personality-test-ocean-model", label: label("大五人格", "Big Five", "大五人格") },
    { href: "/tests/enneagram-personality-test-nine-types", label: label("九型人格", "Enneagram", "九型人格") },
    { href: "/tests/holland-career-interest-test-riasec", label: label("霍兰德职业兴趣测试", "RIASEC", "霍蘭德職業興趣測驗") },
    { href: "/tests/iq-test-intelligence-quotient-assessment", label: label("智商测试", "IQ", "IQ 推理練習") },
    { href: "/tests/eq-test-emotional-intelligence-assessment", label: label("情商测试", "EQ", "情緒智力測驗") },
  ]);

  const articleLinks =
    locale !== "en"
      ? [
          { href: "/topics", label: taiwan ? "認識自己" : "认识自己" },
          { href: "/career/guides", label: taiwan ? "職涯指南" : "职业指南" },
          { href: "/articles", label: dict.header.articles },
        ]
      : [
          { href: "/topics", label: "Understand yourself" },
          { href: "/career/guides", label: "Career Guides" },
          { href: "/articles", label: dict.header.articles },
        ];
  const methodLinks: FooterLinkItem[] =
    locale !== "en"
      ? [
          { href: "/science", label: taiwan ? "測評科學" : "测评科学" },
          { href: "/method-boundaries", label: taiwan ? "方法邊界" : "方法边界" },
          { href: "/item-design-notes", label: taiwan ? "題目設計說明" : "题目设计说明" },
          { href: "/reliability-validity", label: taiwan ? "信度與效度" : "信度效度" },
          { href: "/data-privacy", label: taiwan ? "資料說明" : "数据说明" },
          { href: "/common-misconceptions", label: taiwan ? "常見迷思" : "常见误区" },
        ]
      : [
          { href: "/science", label: "Assessment science" },
          { href: "/method-boundaries", label: "Method boundaries" },
          { href: "/item-design-notes", label: "Item design notes" },
          { href: "/reliability-validity", label: "Reliability & validity" },
          { href: "/data-privacy", label: "Data notes" },
          { href: "/common-misconceptions", label: "Common misconceptions" },
        ];
  const reviewLink: FooterLinkItem = {
    href: "https://www.trustpilot.com/review/fermatmind.com",
    label: label("在 Trustpilot 评价使用体验", "Review your experience on Trustpilot", "在 Trustpilot 評價使用體驗"),
    external: true,
  };
  const companyLinks: FooterLinkItem[] =
    locale !== "en"
      ? [
          { href: "/about", label: taiwan ? "關於我們" : "关于我们" },
          { href: "/brand", label: "品牌" },
          { href: "/charter", label: taiwan ? "憲章" : "宪章" },
          { href: "/foundation", label: "公共利益" },
          { href: "/careers", label: taiwan ? "工作機會" : "工作机会" },
          reviewLink,
        ]
      : [
          { href: "/about", label: "About" },
          { href: "/brand", label: "Brand" },
          { href: "/charter", label: "Charter" },
          { href: "/foundation", label: "Public benefit" },
          { href: "/careers", label: "Careers" },
          reviewLink,
        ];
  const policyLinks: FooterLinkItem[] =
    locale !== "en"
      ? [
          { href: "/support", label: dict.footer.support },
          { href: "/privacy", label: dict.footer.privacy },
          { href: "/terms", label: dict.footer.terms },
          { href: "/policies", label: taiwan ? "政策總覽" : "政策概览" },
        ]
      : [
          { href: "/support", label: dict.footer.support },
          { href: "/privacy", label: dict.footer.privacy },
          { href: "/terms", label: dict.footer.terms },
          { href: "/policies", label: "Policy overview" },
        ];
  policyLinks.push(
    { href: "/pricing", label: label("价格与报告内容", "Pricing & report contents", "價格與報告內容") },
    { href: "/help/payment-refund", label: label("退款与取消政策", "Refunds & cancellation", "退款與取消政策") },
  );
  if (taiwan) policyLinks.push({ href: "/help/contact", label: "聯絡支援" });
  const footerGroups: FooterGroup[] = [
    { key: "tests", title: footerGroupTitles.tests, links: testLinks },
    { key: "articles", title: footerGroupTitles.articles, links: articleLinks },
    { key: "methods", title: label("研究与方法", "Research & Methods", "研究與方法"), links: methodLinks },
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
        className="fm-footer-link"
      >
        {item.label}
      </a>
    ) : (
      <PublicNavigationLink
        key={`${item.href}-${item.label}`}
        href={withLocale(item.href)}
        prefetch={false}
        className="fm-footer-link"
      >
        {item.label}
      </PublicNavigationLink>
    );

  return (
    <footer
      data-private-result-print-hidden="true"
      data-site-footer="true"
      className={`${styles.footer} fm-section-footer fm-site-footer-light border-t border-[var(--fm-border-subtle)] text-[var(--fm-text-main)]`}
    >
      <Container className="fm-footer-container">
        <div className="fm-footer-main">
          <div className="fm-footer-brand">
            <PublicNavigationLink
              href={withLocale("/")}
              prefetch={false}
              aria-label={dict.header.brand}
              className="fm-footer-brand-link"
            >
              <BrandLogo locale={locale} />
              <span>{dict.header.brand}</span>
            </PublicNavigationLink>
            <p className="fm-footer-description">{dict.footer.tailnote}</p>
            <SiteFooterSocialRail locale={locale} />
          </div>

          <nav className="fm-footer-navigation" aria-label={label("页脚导航", "Footer navigation", "頁尾導覽")}>
            {footerGroups.map((group) => (
              <div key={group.key} className="fm-footer-group" data-testid={`site-footer-group-${group.key}`}>
                <h2 className="fm-footer-heading">{group.title}</h2>
                <ul className="fm-footer-links">
                  {group.links.map((item) => <li key={item.href}>{renderFooterLink(item)}</li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <SiteFooterPlatforms locale={locale} />

        <div className="fm-footer-legal">
          <p data-visual-volatile="true" className="m-0">
            © {new Date().getFullYear()} FermatMind. {dict.footer.copyright}
          </p>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-footer-link"
          >
            苏ICP备2025222299号-1
          </a>
        </div>
      </Container>
    </footer>
  );
}
