import { ListChecks } from "lucide-react";
import type { ReactNode } from "react";

export function ArticleTakeaways({ title, items }: { title: string; items: ReactNode[] }) {
  return <aside className="fm-article-box" data-article-block="takeaways" aria-label={title}>
    <div className="fm-article-box-title"><ListChecks size={16} aria-hidden />{title}</div>
    <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
  </aside>;
}
