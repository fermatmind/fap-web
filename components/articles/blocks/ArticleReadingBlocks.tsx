import type { ReactNode } from "react";
import { sanitizeCmsUrl } from "@/lib/cms/sanitizeCmsRichText";
import { stripMarkdownEmphasisMarkers } from "@/lib/content/markdownInline";
import type { ArticleDirective } from "@/lib/content/articleDirectives";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { articleEditorialCopy } from "../articleEditorialCopy";
import { ArticleCallout } from "./ArticleCallout";
import { ArticleChecklist } from "./ArticleChecklist";
import { ArticleScriptCompare } from "./ArticleScriptCompare";
import { ArticleTakeaways } from "./ArticleTakeaways";
import { ArticleTimeline } from "./ArticleTimeline";
import { ArticleVerdictGrid } from "./ArticleVerdictGrid";

/** A callout action is a Markdown link that occupies a line by itself. */
const STANDALONE_LINK_LINE = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/u;
const SITE_ABSOLUTE_LINK = /^https?:\/\/(?:www\.)?fermatmind\.com(?:[/?#]|$)/iu;

/**
 * Resolves the reusable first-screen callout action from a callout block.
 * Only a sanitized, site-internal Markdown link that stands alone on its own
 * line qualifies; inline links inside sentences stay in the prose.
 */
export function resolveCalloutAction(lines: string[]): { label: string; href: string; index: number } | null {
  for (let index = 0; index < lines.length; index++) {
    const match = STANDALONE_LINK_LINE.exec((lines[index] ?? "").trim());
    if (!match) continue;
    const label = stripMarkdownEmphasisMarkers(match[1] ?? "").replace(/\s*→\s*$/u, "").trim();
    const href = sanitizeCmsUrl(match[2] ?? "");
    if (!label || !href) continue;
    const internal = href.startsWith("/") || SITE_ABSOLUTE_LINK.test(href);
    if (!internal) continue;
    return { label, href, index };
  }
  return null;
}


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
      const action = resolveCalloutAction(block.lines);
      if (!action) {
        return <ArticleCallout title={block.title ?? copy.callout} paragraphs={block.lines.map((line, i) => inline(line, String(i)))} />;
      }
      const paragraphs = block.lines.filter((_, i) => i !== action.index);
      return <ArticleCallout title={block.title ?? copy.callout}
        paragraphs={paragraphs.map((line, i) => inline(line, String(i)))}
        action={inline(`[${action.label} →](${action.href})`, "action")} />;
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
