"use client";

import { BookOpen, Sparkles, ChevronDown } from "lucide-react";
import { eqResultPageSchema, type EqResultPage } from "@/lib/eq/resultPage";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { EQResultRedesign } from "./preview/EQResultRedesign";
import styles from "./preview/EQResultRedesign.module.css";

export function EQResultPage({ page, locale, sample = false }: { page: EqResultPage; locale: DisplayLocale; sample?: boolean }) {
  const lang = locale === "zh" ? "zh-CN" : locale;
  if (page.quality) {
    const quality = page.quality[lang], c = page.copy[lang];
    return <div className={styles.root} data-eq-redesign="true" data-eq-quality="true"><main className={styles.report}>
      <section className={styles.hero} id="overview"><h1><span className={styles.heroAccent}>{page.result_labels[page.result_id][lang].title}</span></h1><div className={styles.summary}><span className={styles.summaryIcon}><Sparkles size={20}/></span><div><h2>{quality.summary_title}</h2><p>{quality.summary}</p></div></div></section>
      <section className={styles.qualityPanel}><h2>{quality.reasons_title}</h2><ul>{quality.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>{quality.steps.map(item => <article className={styles.textCard} key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</section>
      <div className={styles.scienceEnd}><details id="science" className={styles.module} open data-eq-module="science"><summary><span className={styles.moduleIcon}><BookOpen size={19}/></span><h2>{c.sections[9]}</h2><ChevronDown size={17}/></summary><div className={styles.moduleBody}>{c.science.map((item,i) => <article className={styles.scienceCard} key={item.title}><span className={styles.scienceIcon}>{i+1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}<ol className={styles.sources}>{page.sources.map((source,i) => <li key={source.id}><span>{i+1}</span><div><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>{source.scope[lang]}</p></div></li>)}</ol></div></details></div>
    </main></div>;
  }
  return <EQResultRedesign candidate={page} locale={lang} preview={false} sample={sample}/>;
}

export function parseEqResultPage(value: unknown) {
  const parsed = eqResultPageSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
