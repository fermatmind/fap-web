import type { ReactNode } from "react";
import { YEAR_END_BONUS_ARTICLE_SLUG } from "@/lib/content/articleEditorial";
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
    case "callout": {
      const match = slug === YEAR_END_BONUS_ARTICLE_SLUG
        ? block.lines[0]?.match(/\[[^\]]+\]\(((?:https:\/\/fermatmind\.com)?\/(?:zh|en|zh-TW)\/tests\/career-planning-and-work-style-test)\)/u)
        : null;
      if (!match) {
        return <ArticleCallout title={block.title ?? copy.callout} paragraphs={block.lines.map((line, i) => inline(line, String(i)))} />;
      }
      const label = locale === "zh" ? "开始 94 题费马职业测试" : locale === "zh-TW" ? "開始費馬 94 題職涯測驗" : "Start the 94-question career test";
      const firstLine = block.lines[0].replace(match[0], "").replace(/^[。.,，]$|([。.!?])\s*[。.,，]+$/u, "$1").replace(/。\s*，/gu, "。").trim();
      return <ArticleCallout title={block.title ?? copy.callout}
        paragraphs={[firstLine, ...block.lines.slice(1)].filter(Boolean).map((line, i) => inline(line, String(i)))}
        action={inline(`[${label} →](${match[1]})`, "action")} />;
    }
    case "references":
    case "methodology": {
      const groups: Array<{ heading?: string; entries: string[] }> = [{ entries: [] }];
      for (const line of block.lines) {
        const label = /^\*\*([^*]+)\*\*$/u.exec(line);
        if (block.name === "references" && label) groups.push({ heading: label[1], entries: [] });
        else groups[groups.length - 1].entries.push(line);
      }
      return <section className="fm-article-box fm-article-academic" data-article-block={block.name}>
        <h2 className="fm-article-academic-heading">{block.title ?? copy[block.name]}</h2>
        {groups.filter(({ entries, heading }) => entries.length || heading).map(({ entries, heading }, i) => (
          <div key={i}>
            {heading ? <h3>{inline(heading, `group-${i}`)}</h3> : null}
            {entries.length ? <ul>{entries.map((line, j) => <li key={j}>{inline(line, `entry-${i}-${j}`)}</li>)}</ul> : null}
          </div>
        ))}
      </section>;
    }
  }
}
