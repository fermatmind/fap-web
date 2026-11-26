import type { ReactNode } from "react";
import type { ArticleDirective } from "@/lib/content/articleDirectives";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { articleEditorialCopy } from "../articleEditorialCopy";
import { ArticleCallout } from "./ArticleCallout";
import { ArticleChecklist } from "./ArticleChecklist";
import { ArticleScriptCompare } from "./ArticleScriptCompare";
import { ArticleTakeaways } from "./ArticleTakeaways";
import { ArticleTimeline } from "./ArticleTimeline";
import { ArticleVerdictGrid } from "./ArticleVerdictGrid";

export function ArticleReadingBlock({ block, inline, text, locale, slug, index }: {
  block: ArticleDirective;
  inline: (value: string, key: string) => ReactNode;
  text: (value: string) => string;
  locale: DisplayLocale;
  slug?: string;
  index: number;
}) {
  const copy = articleEditorialCopy[locale];
  switch (block.name) {
    case "script-compare":
      return <ArticleScriptCompare title={block.title} badLabel={block.badLabel} goodLabel={block.goodLabel}
        bad={inline(block.bad, "bad")} good={inline(block.good, "good")} plain={text(block.good)}
        locale={locale} slug={slug} index={index} />;
    case "timeline":
    case "verdict-grid": {
      const entries = block.entries.map((entry, i) => ({
        ...entry, title: inline(entry.title, `title-${i}`), body: inline(entry.body, `body-${i}`),
      }));
      return block.name === "timeline"
        ? <ArticleTimeline label={block.title ?? copy.timeline} title={block.title} entries={entries} />
        : <ArticleVerdictGrid label={block.title ?? copy.verdict} title={block.title} entries={entries} />;
    }
    case "checklist":
      return <ArticleChecklist locale={locale} title={block.title ?? copy.checklist}
        plain={block.lines.map(text)} items={block.lines.map((line, i) => inline(line, String(i)))} />;
    case "takeaways":
      return <ArticleTakeaways title={block.title ?? copy.takeaways} items={block.lines.map((line, i) => inline(line, String(i)))} />;
    case "callout":
      return <ArticleCallout title={block.title ?? copy.callout} paragraphs={block.lines.map((line, i) => inline(line, String(i)))} />;
    case "references":
    case "methodology": {
      const groups: Array<{ heading?: string; entries: string[] }> = [{ entries: [] }];
      for (const line of block.lines) {
        const label = /^\*\*([^*]+)\*\*$/u.exec(line);
        if (block.name === "references" && label) groups.push({ heading: label[1], entries: [] });
        else groups[groups.length - 1].entries.push(line);
      }
      return <details className="fm-article-box fm-article-academic" data-article-block={block.name}>
        <summary>{block.title ?? copy[block.name]}</summary>
        {groups.filter(({ entries, heading }) => entries.length || heading).map(({ entries, heading }, i) => (
          <div key={i}>
            {heading ? <h3>{inline(heading, `group-${i}`)}</h3> : null}
            {entries.length ? <ul>{entries.map((line, j) => <li key={j}>{inline(line, `entry-${i}-${j}`)}</li>)}</ul> : null}
          </div>
        ))}
      </details>;
    }
  }
}
