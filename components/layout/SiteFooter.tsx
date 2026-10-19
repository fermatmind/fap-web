import { Container } from "@/components/layout/Container";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { SiteFooterSocialRail } from "@/components/layout/SiteFooterSocialRail";
import { PublicNavigationLink } from "@/components/navigation/PublicNavigationPendingIndicator";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
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

export function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
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
          { href: "/topics", label: "认识自己" },
          { href: "/career/guides", label: "职业指南" },
          { href: "/articles", label: dict.header.articles },
        ]
      : [
          { href: "/topics", label: "Understand yourself" },
          { href: "/career/guides", label: "Career Guides" },
          { href: "/articles", label: dict.header.articles },
        ];
  const methodLinks: FooterLinkItem[] =
    locale === "zh"
      ? [
          { href: "/science", label: "测评科学" },
          { href: "/method-boundaries", label: "方法边界" },
          { href: "/item-design-notes", label: "题目设计说明" },
          { href: "/reliability-validity", label: "信度效度" },
          { href: "/data-privacy", label: "数据说明" },
          { href: "/common-misconceptions", label: "常见误区" },
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

          <nav className="fm-footer-navigation" aria-label={locale === "zh" ? "页脚导航" : "Footer navigation"}>
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
