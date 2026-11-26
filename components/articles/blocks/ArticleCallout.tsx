import type { ReactNode } from "react";

export function ArticleCallout({ title, paragraphs }: { title: string; paragraphs: ReactNode[] }) {
  return <aside className="fm-article-box" data-article-block="callout" aria-label={title}>
    <div className="fm-article-box-title">{title}</div>
    {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
  </aside>;
}
