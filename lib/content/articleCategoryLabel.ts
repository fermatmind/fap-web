import type { CmsArticleCategory, CmsBlog } from "@/lib/cms/articles";
import type { Locale } from "@/lib/i18n/locales";
import type { AnswerContentBlockViewModel } from "@/lib/answer/answerSurface";

export function articleCategoryLabel(category: CmsArticleCategory, blog: CmsBlog | undefined, locale: Locale): string | null {
  if (!category) return null;
  // The published locale-specific blog configuration owns reader-facing labels.
  // The shared taxonomy name remains intact for identity and legacy categories.
  const configured = blog?.configurationState === "published"
    ? blog.categories.find((item) => item.slug === category.slug)?.name : undefined;
  const label = configured || category.name;
  return !label || (locale === "en" && /[\u3400-\u9fff]/u.test(label)) ? null : label;
}

export function articleCategoryCompareBlocks(blocks: AnswerContentBlockViewModel[], label: string | null, locale: Locale): AnswerContentBlockViewModel[] {
  return blocks.flatMap((block) => {
    if (locale !== "en" || block.key !== "article_category" || !/[\u3400-\u9fff]/u.test(block.body)) return [block];
    // Use the same published locale authority as the badge; absent labels stay absent.
    return label ? [{ ...block, body: label }] : [];
  });
}
