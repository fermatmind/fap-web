import type { DisplayLocale } from "@/lib/i18n/locales";
import { ArticleByline } from "./ArticleByline";
import { articleEditorialCopy } from "./articleEditorialCopy";

export function ArticleTrustHeader({ authorName, revisedAt, readingMinutes, sourceChecked, locale }: {
  authorName?: string | null;
  revisedAt?: string | null;
  readingMinutes?: number | null;
  sourceChecked: boolean;
  locale: DisplayLocale;
}) {
  const copy = articleEditorialCopy[locale];
  const date = revisedAt?.match(/^\d{4}-\d{2}-\d{2}/u)?.[0];
  return <div className="fm-article-trust">
    <div><ArticleByline authorName={authorName} locale={locale} />{sourceChecked ? <span>{copy.sourceChecked}</span> : null}</div>
    <div>{date ? <span>{copy.revised} <time dateTime={date}>{date}</time></span> : null}
      {readingMinutes ? <span>{copy.read.replace("{minutes}", String(readingMinutes))}</span> : null}</div>
  </div>;
}
