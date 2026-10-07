import type { CmsArticleCategory, CmsBlog } from "@/lib/cms/articles";
import type { Locale } from "@/lib/i18n/locales";

export function articleCategoryLabel(category: CmsArticleCategory, blog: CmsBlog | undefined, locale: Locale): string | null {
  if (!category) return null;
  // The published locale-specific blog configuration owns reader-facing labels.
  // The shared taxonomy name remains intact for identity and legacy categories.
  const configured = blog?.configurationState === "published"
    ? blog.categories.find((item) => item.slug === category.slug)?.name : undefined;
  const label = configured || category.name;
  return !label || (locale === "en" && /[\u3400-\u9fff]/u.test(label)) ? null : label;
}
