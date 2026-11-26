import type { ReactNode } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { articleEditorialCopy } from "../articleEditorialCopy";
import { ArticleCopyButton } from "./ArticleCopyButton";

export function ArticleScriptCompare({ title, badLabel, goodLabel, bad, good, plain, locale, slug, index }: {
  title?: string;
  badLabel?: string;
  goodLabel?: string;
  bad: ReactNode;
  good: ReactNode;
  plain: string;
  locale: DisplayLocale;
  slug?: string;
  index: number;
}) {
  const copy = articleEditorialCopy[locale];
  return <section className="fm-article-script" data-article-block="script-compare" aria-label={title ?? copy.good}>
    {title ? <div className="fm-article-box-title">{title}</div> : null}
    <div className="fm-article-script-grid">
      <div data-tone="red"><strong>{badLabel ?? copy.bad}</strong><p>{bad}</p></div>
      <div data-tone="green"><strong>{goodLabel ?? copy.good}</strong><p>{good}</p>
        <ArticleCopyButton label={copy.copyScript} value={plain} locale={locale}
          tracking={slug ? { name: "article_script_copied", slug, blockIndex: index } : undefined} />
      </div>
    </div>
  </section>;
}
