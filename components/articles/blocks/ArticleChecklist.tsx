"use client";

import { useState, type ReactNode } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { articleEditorialCopy } from "../articleEditorialCopy";
import { ArticleCopyButton } from "./ArticleCopyButton";

export function ArticleChecklist({ title, items, plain, locale }: {
  title: string;
  items: ReactNode[];
  plain: string[];
  locale: DisplayLocale;
}) {
  const [checked, setChecked] = useState<boolean[]>([]);
  const copy = articleEditorialCopy[locale];
  return <section className="fm-article-box" data-article-block="checklist" aria-label={title}>
    <div className="fm-article-box-title">{title}</div>
    <p className="fm-article-interaction" role="status">{copy.progress.replace("{done}", String(checked.filter(Boolean).length)).replace("{total}", String(items.length))}</p>
    <ArticleCopyButton label={copy.copyList} value={plain.map((item) => `- [ ] ${item}`).join("\n")} locale={locale} />
    <ul className="fm-article-checklist">
      {items.map((item, index) => <li key={index}>
        <input type="checkbox" aria-label={plain[index]} checked={Boolean(checked[index])} onChange={(event) => {
          const value = event.currentTarget.checked;
          setChecked((previous) => Object.assign([...previous], { [index]: value }));
        }} />
        <span>{item}</span>
      </li>)}
    </ul>
  </section>;
}
