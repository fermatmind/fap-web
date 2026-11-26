import type { ReactNode } from "react";

export function ArticleVerdictGrid({ label, title, entries }: {
  label: string;
  title?: string;
  entries: Array<{ tone?: "green" | "yellow" | "red"; title: ReactNode; body: ReactNode }>;
}) {
  return <section data-article-block="verdict-grid" aria-label={label}>
    {title ? <div className="fm-article-box-title">{title}</div> : null}
    <ul className="fm-article-block-grid">
      {entries.map((entry, index) => <li key={index} className="fm-article-box" data-tone={entry.tone}>
        <strong>{entry.title}</strong>
        <p>{entry.body}</p>
      </li>)}
    </ul>
  </section>;
}
