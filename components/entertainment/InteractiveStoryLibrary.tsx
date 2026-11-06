import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import { directoryDescription, storyQuizzes } from "@/lib/entertainment/directory";
import { buildItemListJsonLd } from "@/lib/seo/generateSchema";
import { MORE_TEST_PRODUCT_COUNT, FUN_CATEGORIES } from "./MoreTests";
import { StoryDirectory } from "./StoryDirectory";

export function InteractiveStoryLibrary({ locale }: { locale: Locale }) {
  const items = storyQuizzes.map((quiz) => ({
    slug: quiz.slug,
    category: quiz.category,
    title: quiz.title[locale],
    description: directoryDescription(quiz)[locale],
    href: `/${locale}/tests/play/${quiz.slug}`,
    meta: locale === "zh"
      ? `${quiz.minQuestionCount === quiz.questionCount ? quiz.questionCount : `${quiz.minQuestionCount}–${quiz.questionCount}`}次选择 · 约${quiz.minutes}分钟 · 完整故事免费`
      : `${quiz.minQuestionCount === quiz.questionCount ? quiz.questionCount : `${quiz.minQuestionCount}–${quiz.questionCount}`} choices · About ${quiz.minutes} min · Complete stories free`,
  }));
  return <>
    <JsonLd id={`interactive-stories-${locale}`} data={buildItemListJsonLd({
      path: `/${locale}/tests`, idSuffix: "interactive-story-itemlist", locale,
      title: locale === "zh" ? "原创互动故事与趣味探索" : "Original interactive stories and playful exploration",
      description: locale === "zh" ? "原创想象情境与选择故事，独立于测试与工具目录。" : "Original imagined scenes and choice-based stories, separate from tests and tools.",
      items: items.map((item) => ({ name: item.title, description: item.description, path: item.href })),
    })} />
    <StoryDirectory items={items} categories={FUN_CATEGORIES} locale={locale} testToolCount={MORE_TEST_PRODUCT_COUNT} />
  </>;
}
