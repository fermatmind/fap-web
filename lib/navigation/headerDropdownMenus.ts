import type { Locale } from "@/lib/i18n/locales";

export type HeaderNavKey = "tests" | "articles" | "professions" | "help" | "business";

export type HeaderDropdownMenuItem = {
  href: string;
  label: string;
};

export type HeaderDropdownMenu = {
  key: HeaderNavKey;
  items: HeaderDropdownMenuItem[];
};

type HeaderDropdownRegistry = Record<HeaderNavKey, HeaderDropdownMenuItem[]>;

const HEADER_DROPDOWN_MENUS: Record<Locale, HeaderDropdownRegistry> = {
  en: {
    tests: [
      { href: "/tests", label: "All tests" },
      { href: "/tests/mbti-personality-test-16-personality-types/take", label: "MBTI personality test" },
      { href: "/tests/big-five-personality-test-ocean-model/take", label: "Big Five personality test" },
      {
        href: "/tests/clinical-depression-anxiety-assessment-professional-edition/take",
        label: "Clinical depression & anxiety assessment",
      },
      { href: "/tests/depression-screening-test-standard-edition/take", label: "Depression screening" },
      { href: "/tests/iq-test-intelligence-quotient-assessment/take", label: "IQ assessment" },
      { href: "/tests/eq-test-emotional-intelligence-assessment/take", label: "EQ assessment" },
    ],
    articles: [
      { href: "/articles", label: "All articles" },
      { href: "/articles/mbti-basics", label: "MBTI basics" },
      { href: "/articles/mbti-growth-guide", label: "MBTI growth guide" },
      { href: "/articles/big-five-tool-guide", label: "Big Five tool guide" },
      { href: "/articles/eq-test-tool-guide", label: "EQ tool guide" },
    ],
    professions: [
      { href: "/professions", label: "All professions" },
      { href: "/professions/ENFJ", label: "ENFJ profile" },
      { href: "/professions/INFP", label: "INFP profile" },
    ],
    help: [
      { href: "/help", label: "Help Center" },
      { href: "/help/faq", label: "FAQ" },
      { href: "/help/about", label: "About FermatMind" },
      { href: "/help/team", label: "Team" },
      { href: "/help/used-and-mentioned", label: "Used and mentioned" },
      { href: "/help/for-business-and-research", label: "Business and research" },
      { href: "/help/contact", label: "Contact support" },
    ],
    business: [
      { href: "/business", label: "Business overview" },
      { href: "/help/for-business-and-research", label: "Business and research usage" },
      { href: "/help/contact", label: "Contact business support" },
    ],
  },
  zh: {
    tests: [
      { href: "/tests", label: "全部测试" },
      { href: "/tests/mbti-personality-test-16-personality-types/take", label: "MBTI 性格测试" },
      { href: "/tests/big-five-personality-test-ocean-model/take", label: "大五人格测试" },
      {
        href: "/tests/clinical-depression-anxiety-assessment-professional-edition/take",
        label: "抑郁焦虑综合测评（专业版）",
      },
      { href: "/tests/depression-screening-test-standard-edition/take", label: "抑郁筛查" },
      { href: "/tests/iq-test-intelligence-quotient-assessment/take", label: "IQ 测评" },
      { href: "/tests/eq-test-emotional-intelligence-assessment/take", label: "EQ 测评" },
    ],
    articles: [
      { href: "/articles", label: "全部文章" },
      { href: "/articles/mbti-basics", label: "MBTI 入门" },
      { href: "/articles/mbti-growth-guide", label: "MBTI 成长指南" },
      { href: "/articles/big-five-tool-guide", label: "大五工具说明" },
      { href: "/articles/eq-test-tool-guide", label: "EQ 工具说明" },
    ],
    professions: [
      { href: "/professions", label: "全部职业画像" },
      { href: "/professions/ENFJ", label: "ENFJ 画像" },
      { href: "/professions/INFP", label: "INFP 画像" },
    ],
    help: [
      { href: "/help", label: "帮助中心" },
      { href: "/help/faq", label: "常见问题" },
      { href: "/help/about", label: "关于我们" },
      { href: "/help/team", label: "团队" },
      { href: "/help/used-and-mentioned", label: "使用与提及" },
      { href: "/help/for-business-and-research", label: "企业与研究" },
      { href: "/help/contact", label: "联系方式" },
    ],
    business: [
      { href: "/business", label: "企业服务" },
      { href: "/help/for-business-and-research", label: "企业与研究使用" },
      { href: "/help/contact", label: "联系商务支持" },
    ],
  },
};

export function getHeaderDropdownMenus(locale: Locale): HeaderDropdownMenu[] {
  const source = HEADER_DROPDOWN_MENUS[locale];
  const order: HeaderNavKey[] = ["tests", "articles", "professions", "help", "business"];

  return order.map((key) => ({ key, items: source[key] }));
}
