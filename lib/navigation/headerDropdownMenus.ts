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
      { href: "/tests/holland-career-interest-test-riasec", label: "RIASEC career interest test" },
      { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI personality test" },
      { href: "/tests/big-five-personality-test-ocean-model", label: "Big Five personality test" },
      { href: "/tests/iq-test-intelligence-quotient-assessment", label: "IQ assessment" },
      { href: "/tests/eq-test-emotional-intelligence-assessment", label: "EQ assessment" },
    ],
    articles: [
      { href: "/articles", label: "All articles" },
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
      { href: "/orders/lookup", label: "Order lookup" },
      { href: "/email/preferences", label: "Email preferences" },
      { href: "/email/unsubscribe", label: "Unsubscribe" },
    ],
    business: [
      { href: "/business", label: "Business overview" },
      { href: "/help", label: "Help Center" },
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
    ],
    articles: [
      { href: "/articles", label: "全部文章" },
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
      { href: "/orders/lookup", label: "订单查询" },
      { href: "/email/preferences", label: "邮件偏好" },
      { href: "/email/unsubscribe", label: "退订邮件" },
    ],
    business: [
      { href: "/business", label: "企业服务" },
      { href: "/help", label: "帮助中心" },
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
