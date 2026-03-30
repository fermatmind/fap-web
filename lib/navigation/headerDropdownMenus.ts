import type { Locale } from "@/lib/i18n/locales";

export type HeaderNavKey = "hub" | "type" | "guide" | "test" | "career";

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
    hub: [
      { href: "/topics", label: "Topic hubs" },
      { href: "/methods", label: "Method hub" },
      { href: "/data", label: "Data hub" },
      { href: "/career/recommendations", label: "Career recommendation hubs" },
      { href: "/career/industries", label: "Industry hubs" },
    ],
    type: [
      { href: "/personality", label: "All personality entities" },
      { href: "/personality/intp-a", label: "INTP entity" },
      { href: "/personality/entj-a", label: "ENTJ entity" },
      { href: "/personality/infp-a", label: "INFP entity" },
      { href: "/personality/enfj-a", label: "ENFJ entity" },
    ],
    guide: [
      { href: "/articles", label: "All guides" },
      { href: "/methods", label: "Method pages" },
      { href: "/data", label: "Data pages" },
      { href: "/career/guides", label: "Career guides" },
      { href: "/articles/mbti-basics", label: "MBTI basics" },
      { href: "/articles/mbti-growth-guide", label: "MBTI growth guide" },
      { href: "/articles/big-five-tool-guide", label: "Big Five tool guide" },
      { href: "/help", label: "Help guides" },
    ],
    test: [
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
    career: [
      { href: "/career", label: "Career center" },
      { href: "/career/recommendations", label: "Career recommendations" },
      { href: "/career/jobs", label: "Job library" },
      { href: "/career/industries", label: "Industry guide" },
      { href: "/career/guides", label: "Career guides" },
      { href: "/career/tests", label: "Career tests" },
    ],
  },
  zh: {
    hub: [
      { href: "/topics", label: "主题 Hub" },
      { href: "/methods", label: "方法 Hub" },
      { href: "/data", label: "数据 Hub" },
      { href: "/career/recommendations", label: "职业推荐 Hub" },
      { href: "/career/industries", label: "行业 Hub" },
    ],
    type: [
      { href: "/personality", label: "全部人格实体" },
      { href: "/personality/intp-a", label: "INTP 实体页" },
      { href: "/personality/entj-a", label: "ENTJ 实体页" },
      { href: "/personality/infp-a", label: "INFP 实体页" },
      { href: "/personality/enfj-a", label: "ENFJ 实体页" },
    ],
    guide: [
      { href: "/articles", label: "全部指南" },
      { href: "/methods", label: "方法页" },
      { href: "/data", label: "数据页" },
      { href: "/career/guides", label: "职业指南" },
      { href: "/articles/mbti-basics", label: "MBTI 入门" },
      { href: "/articles/mbti-growth-guide", label: "MBTI 成长指南" },
      { href: "/articles/big-five-tool-guide", label: "大五工具说明" },
      { href: "/help", label: "帮助指南" },
    ],
    test: [
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
    career: [
      { href: "/career", label: "职业发展中心" },
      { href: "/career/recommendations", label: "职业推荐" },
      { href: "/career/jobs", label: "职业库" },
      { href: "/career/industries", label: "行业指南" },
      { href: "/career/guides", label: "职业发展" },
      { href: "/career/tests", label: "职业测试" },
    ],
  },
};

export function getHeaderDropdownMenus(locale: Locale): HeaderDropdownMenu[] {
  const source = HEADER_DROPDOWN_MENUS[locale];
  const order: HeaderNavKey[] = ["hub", "type", "guide", "test", "career"];

  return order.map((key) => ({ key, items: source[key] }));
}
