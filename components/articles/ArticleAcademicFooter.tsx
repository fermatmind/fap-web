import "@/app/article-editorial.css";
import type { ReactNode } from "react";
import { articleByline } from "@/lib/content/articleByline";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { ArticleCiteBox } from "./ArticleCiteBox";
import { articleEditorialCopy } from "./articleEditorialCopy";

export function ArticleAcademicFooter({ title, authorName, publishedAt, canonicalUrl, locale, slug, sources }: {
  title: string;
  authorName?: string | null;
  publishedAt?: string | null;
  canonicalUrl: string;
  locale: DisplayLocale;
  slug: string;
  sources?: ReactNode;
}) {
  const copy = articleEditorialCopy[locale];
  const author = articleByline(authorName, locale).name;
  const date = publishedAt?.match(/^\d{4}-\d{2}-\d{2}/u)?.[0];
  const undated = locale === "en" ? "n.d." : "無日期".replace("無", locale === "zh" ? "无" : "無");
  const apa = `${author}. (${date?.slice(0, 4) ?? undated}). ${title}. ${author === "FermatMind" ? "" : "FermatMind. "}${canonicalUrl}`;
  const gb = `${author}. ${title}[EB/OL]. ${date ? `(${date}). ` : ""}${canonicalUrl}.`;

  return <section className="fm-article-academic-footer" aria-label={copy.cite}>
    {sources}
    <ArticleCiteBox locale={locale} slug={slug} apa={apa} gb={gb} />
  </section>;
}
