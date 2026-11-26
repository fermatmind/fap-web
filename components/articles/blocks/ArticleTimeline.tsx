import type { ReactNode } from "react";

export function ArticleTimeline({ label, title, entries }: {
  label: string;
  title?: string;
  entries: Array<{ tag?: string; title: ReactNode; body: ReactNode }>;
}) {
  return <section data-article-block="timeline" aria-label={label}>
    {title ? <div className="fm-article-box-title">{title}</div> : null}
    <ol className="fm-article-block-grid list-none pl-0">
      {entries.map((entry, index) => <li key={index} className="fm-article-box">
        <span className="fm-article-tag">{entry.tag}</span>
        <strong>{entry.title}</strong>
        <p>{entry.body}</p>
      </li>)}
    </ol>
  </section>;
}
