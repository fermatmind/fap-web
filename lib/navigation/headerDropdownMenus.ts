import type { Locale } from "@/lib/i18n/locales";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";

export type HeaderNavKey = "tests" | "articles" | "personality" | "career" | "help" | "business";

export type HeaderDropdownMenuItem = {
  href: string;
  label: string;
  forceVisible?: boolean;
};

export type HeaderDropdownMenu = {
  key: HeaderNavKey;
  items: HeaderDropdownMenuItem[];
};

type HeaderDropdownRegistry = Record<HeaderNavKey, HeaderDropdownMenuItem[]>;

const HEADER_DROPDOWN_MENUS: Record<Locale, HeaderDropdownRegistry> = {
  en: {
    tests: [
      { href: "/tests", label: "Tests hub" },
      { href: "/tests/category/personality", label: "Personality & style" },
      { href: "/tests/category/career", label: "Career & direction" },
      { href: "/career/tests/riasec", label: "RIASEC career interest test" },
      { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI personality test" },
      { href: "/tests/big-five-personality-test-ocean-model", label: "Big Five personality test" },
      {
        href: "/tests/clinical-depression-anxiety-assessment-professional-edition",
        label: "Clinical depression & anxiety assessment",
      },
      { href: "/tests/depression-screening-test-standard-edition", label: "Depression screening" },
      { href: "/tests/iq-test-intelligence-quotient-assessment", label: "IQ assessment" },
      { href: "/tests/eq-test-emotional-intelligence-assessment", label: "EQ assessment" },
    ],
    articles: [
      { href: "/articles", label: "All articles" },
      { href: "/topics", label: "Topic clusters" },
      { href: "/articles/mbti-basics", label: "MBTI basics" },
      { href: "/articles/mbti-growth-guide", label: "MBTI growth guide" },
      { href: "/articles/big-five-tool-guide", label: "Big Five tool guide" },
      { href: "/articles/eq-test-tool-guide", label: "EQ tool guide" },
    ],
    personality: [
      { href: "/personality", label: "All personality profiles" },
      { href: "/personality#nt", label: "Analysts (NT)" },
      { href: "/personality#nf", label: "Diplomats (NF)" },
      { href: "/personality#sj", label: "Sentinels (SJ)" },
      { href: "/personality#sp", label: "Explorers (SP)" },
      { href: "/topics/mbti", label: "MBTI topic hub" },
      { href: "/career/recommendations", label: "Career recommendations" },
    ],
    career: [
      { href: "/career/jobs", label: "All occupations" },
      { href: "/career/industries", label: "Browse by industry" },
      { href: "/career/recommendations", label: "Career recommendations" },
      { href: "/career/guides", label: "Career guides" },
      { href: "/career/tests", label: "Career tests" },
    ],
    help: [
      { href: "/help", label: "Help Center" },
      { href: "/help/faq", label: "FAQ" },
      { href: "/about", label: "About FermatMind" },
      { href: "/charter", label: "Our charter" },
      { href: "/brand", label: "Brand guidelines" },
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
      { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI 性格测试" },
      { href: "/tests/big-five-personality-test-ocean-model", label: "大五人格测试" },
      { href: "/tests", label: "九型人格测试" },
      { href: "/tests/iq-test-intelligence-quotient-assessment", label: "智商测试" },
      { href: "/tests/eq-test-emotional-intelligence-assessment", label: "情商测试" },
      {
        href: "/tests/clinical-depression-anxiety-assessment-professional-edition",
        label: "抑郁焦虑综合检测",
        forceVisible: true,
      },
    ],
    articles: [
      { href: "/articles", label: "全部文章" },
      { href: "/topics", label: "主题聚合" },
      { href: "/articles/mbti-basics", label: "MBTI 入门" },
      { href: "/articles/mbti-growth-guide", label: "MBTI 成长指南" },
      { href: "/articles/big-five-tool-guide", label: "大五工具说明" },
      { href: "/articles/eq-test-tool-guide", label: "EQ 工具说明" },
    ],
    personality: [
      { href: "/personality", label: "全部人格画像" },
      { href: "/personality#nt", label: "分析家（NT）" },
      { href: "/personality#nf", label: "外交家（NF）" },
      { href: "/personality#sj", label: "守护者（SJ）" },
      { href: "/personality#sp", label: "探索者（SP）" },
      { href: "/topics/mbti", label: "MBTI 主题中心" },
      { href: "/career/recommendations", label: "职业推荐" },
    ],
    career: [
      { href: "/career/jobs", label: "全部职业库" },
      { href: "/career/industries", label: "按行业浏览" },
      { href: "/career/recommendations", label: "职业推荐" },
      { href: "/career/guides", label: "职业发展" },
      { href: "/career/tests", label: "职业测试" },
    ],
    help: [
      { href: "/help", label: "帮助中心" },
      { href: "/help/faq", label: "常见问题" },
      { href: "/about", label: "关于我们" },
      { href: "/charter", label: "我们的宪章" },
      { href: "/brand", label: "品牌规范" },
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
  const order: HeaderNavKey[] = ["tests", "articles", "personality", "career", "help", "business"];

  return order.map((key) => ({
    key,
    items:
      key === "tests"
        ? Array.from(
            new Map(
              filterVisiblePublicTestEntries(source[key])
                .concat(source[key].filter((item) => item.forceVisible))
                .map((item) => [`${item.href}:${item.label}`, item])
            ).values()
          )
        : source[key],
  }));
}
