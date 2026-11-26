"use client";

import { useId, useState } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { articleEditorialCopy } from "./articleEditorialCopy";
import { ArticleCopyButton } from "./blocks/ArticleCopyButton";

export function ArticleCiteBox({ apa, gb, locale, slug }: { apa: string; gb: string; locale: DisplayLocale; slug: string }) {
  const name = useId();
  const [format, setFormat] = useState<"apa" | "gb">("apa");
  const copy = articleEditorialCopy[locale];
  return <div className="fm-article-box fm-article-cite" data-article-block="cite">
    <fieldset>
      <legend>{copy.cite}</legend>
      <input className="fm-cite-apa" type="radio" name={name} id={`${name}-apa`} defaultChecked onChange={() => setFormat("apa")} />
      <label htmlFor={`${name}-apa`}>APA 7th</label>
      <input className="fm-cite-gb" type="radio" name={name} id={`${name}-gb`} onChange={() => setFormat("gb")} />
      <label htmlFor={`${name}-gb`}>GB/T 7714-2015</label>
      <p data-format="apa">{apa}</p>
      <p data-format="gb">{gb}</p>
    </fieldset>
    <ArticleCopyButton key={format} label={copy.copyCitation} value={format === "apa" ? apa : gb} locale={locale}
      tracking={{ name: "article_citation_copied", slug }} />
  </div>;
}
