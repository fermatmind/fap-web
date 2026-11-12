import Link from "next/link";
import { buildArticleFrontendUrl, type CmsArticle } from "@/lib/cms/articles";

const labels = { "zh-CN": "简体中文", "zh-TW": "繁體中文", en: "English" } as const;
const ariaLabels = { "zh-CN": "页面语言", "zh-TW": "頁面語言", en: "Page language" } as const;

export function ArticleLanguageNavigation({ article }: { article: CmsArticle }) {
  const destinations = article.readerLanguageSlugs;
  if (!destinations) return null;
  const locale = article.locale === "zh-CN" || article.locale === "zh-TW" ? article.locale : "en";

  return (
    <nav data-article-reader-languages hidden aria-label={ariaLabels[locale]} className="hidden">
      {(["zh-CN", "zh-TW", "en"] as const).map((language) => {
        const slug = destinations[language];
        return slug && language !== locale ? (
          <Link key={language} href={buildArticleFrontendUrl(language === "zh-CN" ? "zh" : language, slug)} lang={language} className="min-h-11 py-2 underline">
            {labels[language]}
          </Link>
        ) : null;
      })}
    </nav>
  );
}
