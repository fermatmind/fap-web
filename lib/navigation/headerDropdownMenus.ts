import { getSelfUnderstandingMenu } from "@/lib/navigation/selfUnderstandingResources";
import type { DisplayLocale } from "@/lib/i18n/locales";
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

const HEADER_DROPDOWN_MENUS: Record<DisplayLocale, HeaderDropdownRegistry> = {
  "zh-TW": {
    tests: [
      { href: "/tests", label: "全部測驗" },
      { href: "/tests/category/personality", label: "人格與風格" },
      { href: "/tests/category/career", label: "職業與方向" },
      { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI 性格測驗" },
      { href: "/tests/big-five-personality-test-ocean-model", label: "大五人格測驗" },
      { href: "/tests/enneagram-personality-test-nine-types", label: "九型人格測驗" },
      { href: "/tests/holland-career-interest-test-riasec", label: "霍蘭德職業興趣測驗" },
      { href: "/tests/iq-test-intelligence-quotient-assessment", label: "IQ 推理練習" },
      { href: "/tests/eq-test-emotional-intelligence-assessment", label: "情緒智力測驗" },
    ],
    articles: [{ href: "/articles", label: "全部文章" }],
    personality: [
      { href: "/topics", label: "所有專題" },
      { href: "/personality", label: "人格百科" },
      { href: "/topics/mbti", label: "MBTI 專題" },
      { href: "/topics/big-five", label: "大五人格專題" },
      { href: "/topics/iq-eq", label: "IQ 與 EQ 專題" },
    ],
    career: [
      { href: "/career/recommendations", label: "職涯建議" },
      { href: "/career", label: "職涯資料庫" },
      { href: "/career/guides", label: "職涯指南" },
    ],
    help: [
      { href: "/help/contact", label: "聯絡支援" },
      { href: "/email/preferences", label: "電子郵件與資料管理" },
    ],
    business: [],
  },
  en: {
    tests: [
      { href: "/tests", label: "Tests hub" },
      { href: "/tests/category/personality", label: "Personality & style" },
      { href: "/tests/category/career", label: "Career & direction" },
      { href: "/tests/holland-career-interest-test-riasec", label: "RIASEC career interest test" },
      { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI personality test" },
      { href: "/tests/big-five-personality-test-ocean-model", label: "Big Five personality test" },
      { href: "/tests/enneagram-personality-test-nine-types", label: "Enneagram test" },
      { href: "/tests/iq-test-intelligence-quotient-assessment", label: "IQ assessment" },
      { href: "/tests/eq-test-emotional-intelligence-assessment", label: "EQ assessment" },
    ],
    articles: [
      { href: "/articles", label: "All articles" },
    ],
    personality: getSelfUnderstandingMenu("en"),
    career: [
      { href: "/career/tests", label: "Choose career tests" },
      { href: "/career/recommendations", label: "Career fit" },
      { href: "/career", label: "Occupation library" },
      { href: "/career/guides", label: "Career Guides" },
    ],
    help: [
      { href: "/email/preferences", label: "Email & data management" },
    ],
    business: [
      { href: "/business", label: "Business overview" },
    ],
  },
  zh: {
    tests: [
      { href: "/tests", label: "全部测试" },
      { href: "/tests/mbti-personality-test-16-personality-types", label: "MBTI 性格测试" },
      { href: "/tests/big-five-personality-test-ocean-model", label: "大五人格测试" },
      { href: "/tests/enneagram-personality-test-nine-types", label: "九型人格测试" },
      { href: "/tests/holland-career-interest-test-riasec", label: "霍兰德职业兴趣测试" },
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
    personality: getSelfUnderstandingMenu("zh"),
    career: [
      { href: "/career/tests", label: "职业测试选型" },
      { href: "/career/recommendations", label: "职业匹配" },
      { href: "/career", label: "职业库" },
      { href: "/career/guides", label: "职业指南" },
    ],
    help: [
      { href: "/email/preferences", label: "邮箱与数据管理" },
    ],
    business: [
      { href: "/business", label: "企业服务" },
    ],
  },
};

export function getHeaderDropdownMenus(locale: DisplayLocale): HeaderDropdownMenu[] {
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
