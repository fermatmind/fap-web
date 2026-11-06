import { JsonLd } from "@/components/seo/JsonLd";
import { buildItemListJsonLd } from "@/lib/seo/generateSchema";
import { TestDirectory } from "@/components/tests/TestDirectory";
import { directoryDescription, directoryQuizzes } from "@/lib/entertainment/directory";
import questionnaires from "@/lib/questionnaires/catalog.json";
import { getFreeTestPrimaryLabel } from "@/lib/marketing/testsHubContent";
import type { HubTestCardItem } from "@/lib/marketing/testsHubContent";
import type { Locale } from "@/lib/i18n/locales";

export const FUN_CATEGORIES: Record<string, { en: string; zh: string }> = {
  framework: { en: "Personality frameworks & behavior", zh: "人格框架与行为" },
  nature: { en: "Animals & nature", zh: "动物与自然" },
  fantasy: { en: "Fantasy & stories", zh: "幻想与故事" },
  social: { en: "Friends & teams", zh: "社交与团队" },
  everyday: { en: "Everyday choices", zh: "日常选择" },
  relationships: { en: "Connection & relationships", zh: "相处与关系" },
  metaphor: { en: "Responses & preferences", zh: "行为与偏好" },
};

const TOOL_SLUGS = new Set([
  "career-match",
  "life-path-number",
  "nine-star-ki",
  "natal-chart",
  "nakshatra-spica-reference",
  "typing-speed",
  "ten-key-test",
  "data-entry",
]);

const catalog = [
  {
    slug: "friendship-quiz",
    category: "social",
    title: { en: "How Well Do You Know Me?", zh: "朋友默契：你有多了解我？" },
    description: {
      en: "Make a two-choice quiz about yourself. Invite friends to guess, compare categories and share a score card. No sign-up.",
      zh: "自己出题，朋友来猜。六类二选一，查看类别对照、并列榜单与分数卡，无需注册。",
    },
    minQuestionCount: 30,
    questionCount: 150,
    minutes: "5–25",
    pathname: "/tests/play/friendship-quiz",
  },
  ...questionnaires.map((quiz) => ({
    ...quiz,
    minQuestionCount: quiz.questionCount,
    pathname: `/tests/${quiz.collection}/${quiz.slug}`,
  })),
  ...directoryQuizzes
    .filter(
      (quiz) => !questionnaires.some((native) => native.slug === quiz.slug),
    )
    .map((quiz) => ({ ...quiz, pathname: `/tests/play/${quiz.slug}` })),
];

export const MORE_TEST_PRODUCT_COUNT = catalog.length;

export function MoreTests({
  locale,
  coreTests = [],
  heroTitle,
}: {
  locale: Locale;
  coreTests?: HubTestCardItem[];
  heroTitle?: string;
}) {
  const items = catalog.map((q) => ({
    slug: q.slug,
    kind: TOOL_SLUGS.has(q.slug) ? ("tool" as const) : ("test" as const),
    category: q.category,
    title: q.title[locale],
    description: directoryDescription(q)[locale],
    href: `/${locale}${q.pathname}`,
    meta:
      q.slug === "cognitive-functions-test"
        ? locale === "zh"
          ? "32条自评／56题二选一 · 约10–15分钟 · 全部免费"
          : "32 ratings / 56 choices · About 10–15 min · fully free"
        : q.slug === "caliper-style-assessment-test"
          ? locale === "zh"
            ? "16组四陈述 · 约8分钟 · 完整读法免费"
            : "16 four-statement blocks · About 8 min · Full guides free"
          : q.slug === "career-match"
            ? locale === "zh"
              ? "兴趣主题＋2—3个职业 · 免费比较"
              : "Interest themes + 2–3 roles · Free comparison"
            : q.slug === "nakshatra-spica-reference"
              ? locale === "zh"
                ? "已知出生时间与时区 · 27篇完整文化指南 · 全部免费"
                : "Known birth time & zone · 27 complete cultural guides · fully free"
              : q.slug === "natal-chart"
                ? locale === "zh"
                  ? "已知时间与地点 · 十天体星盘 · 全部免费"
                  : "Known time and place · Ten-body chart · fully free"
                : q.slug === "nine-star-ki"
                  ? locale === "zh"
                    ? "年份与立春界点 · 九篇完整文化指南 · 全部免费"
                    : "Year & Spring boundary · Nine complete cultural guides · fully free"
                  : q.slug === "life-path-number"
                    ? locale === "zh"
                      ? "两种日期规则 · 十二篇完整指南 · 全部免费"
                      : "Two date rules · Twelve complete guides · fully free"
                    : q.slug === "data-entry"
                      ? locale === "zh"
                        ? "2种虚构记录模式 · 每轮60秒 · 全部免费"
                        : "2 fictional record modes · 60 seconds per round · fully free"
                      : q.slug === "typing-speed"
                        ? locale === "zh"
                          ? "英/中文两种输入模式 · 每轮60秒 · 全部免费"
                          : "English & Chinese modes · 60 seconds per round · fully free"
                        : q.slug === "ten-key-test"
                          ? locale === "zh"
                            ? "3种输入模式 · 每轮60秒 · 全部免费"
                            : "3 entry modes · 60 seconds per round · fully free"
                          : locale === "zh"
                            ? `${q.minQuestionCount === q.questionCount ? q.questionCount : `${q.minQuestionCount}–${q.questionCount}`} 题 · 约 ${q.minutes} 分钟 · 全部免费`
                            : `${q.minQuestionCount === q.questionCount ? q.questionCount : `${q.minQuestionCount}–${q.questionCount}`} questions · about ${q.minutes} min · fully free`,
  }));
  return (
    <>
    <JsonLd id={`exploration-tests-${locale}`} data={buildItemListJsonLd({ path: `/${locale}/tests`, idSuffix: "exploration-test-itemlist", title: locale === "zh" ? "测试与实用工具" : "Tests and practical tools", description: locale === "zh" ? "当前目录中可见的285项测试与工具。" : "The 285 tests and tools visible in this directory.", locale, items: [...items].sort((a, b) => Object.keys(FUN_CATEGORIES).indexOf(a.category) - Object.keys(FUN_CATEGORIES).indexOf(b.category)).map(item => ({ name: item.title, path: item.href, description: item.description })) })} />
    <TestDirectory
      items={items}
      categories={FUN_CATEGORIES}
      locale={locale}
      coreTests={coreTests.map((item) => ({
        ...item,
        primaryLabel: getFreeTestPrimaryLabel(item, locale),
      }))}
      heroTitle={heroTitle}
    />
    </>
  );
}
