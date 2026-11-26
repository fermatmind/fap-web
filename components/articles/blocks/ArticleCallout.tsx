import type { ReactNode } from "react";

export function ArticleCallout({ title, paragraphs, action }: { title: string; paragraphs: ReactNode[]; action?: ReactNode }) {
  return <aside className="fm-article-box" data-article-block="callout" aria-label={title}>
    <div className="fm-article-box-title">{title}</div>
    {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    {action && <div className="fm-article-callout-action">{action}</div>}
  </aside>;
}
