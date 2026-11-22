"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { careerDirections, careerJobs, careerLayers, careerSamples, careerText } from "@/lib/tests/career94Landing";
import styles from "./career94-landing.module.css";

const angles = careerDirections.map((_, index) => index * Math.PI / 3 - Math.PI / 2);
function points(ratios: readonly number[], radius = 65) {
  return angles.map((angle, index) =>
    `${(93 + Math.cos(angle) * radius * ratios[index]).toFixed(3)},${(90 + Math.sin(angle) * radius * ratios[index]).toFixed(3)}`).join(" ");
}

export function Career94Sample({ locale, labels, notes }: { locale: DisplayLocale; labels?: readonly string[]; notes?: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [sampleNotice, setSampleNotice] = useState("");
  const sample = careerSamples[index];
  const t = (zh: string, en: string, tw: string) => careerText(locale, [zh, en, tw]);
  const span = Math.max(...sample.scores) - Math.min(...sample.scores);
  return <aside className={styles.sample} aria-labelledby="career-sample-heading">
    <div className={styles.sampleHeader}>
      <h2 id="career-sample-heading">{t("报告样张", "Report preview", "報告範例")}</h2>
      <span>{t("公开合成示例 · 真实计分", "Synthetic responses · Actual scoring", "公開合成範例 · 實際計分")}</span>
    </div>
    <div className={styles.sampleTabs} role="group" aria-label={t("切换报告样张", "Choose a sample profile", "切換報告範例")}>
      {careerSamples.map((option, i) => <button key={option.code} type="button" aria-pressed={index === i}
        aria-controls="career-sample-panel" onClick={() => {
          setIndex(i);
          setSampleNotice(`${careerText(locale, option.name)} · ${option.code}`);
        }}>{labels?.[i] ?? careerText(locale, option.name)}</button>)}
    </div>
    <p className={styles.srOnly} aria-live="polite">{sampleNotice}</p>
    <div id="career-sample-panel">
      <div className={styles.sampleIdentity}>
        <div><strong>{sample.code}</strong><span>{t("并列", "Tie", "並列")} · {sample.tie}</span></div>
        <p>{t("兴趣有分化", "Differentiated profile", "興趣有分化")} <b>{t("跨度", "Range", "跨度")} {span}</b></p>
      </div>
      <div className={styles.sampleChart}>
        <svg viewBox="0 0 186 180" width="186" height="180" aria-hidden="true">
          {[.25,.5,.75,1].map(scale => <polygon key={scale} points={points(careerDirections.map(() => scale))} fill="none" stroke="#d6e6df" />)}
          {angles.map((angle, i) => <line key={careerDirections[i].code} x1="93" y1="90" x2={93 + Math.cos(angle)*65} y2={90 + Math.sin(angle)*65} stroke="#d6e6df" />)}
          <polygon data-career-radar points={points(sample.scores.map(score => score / 100))} fill="#83c3ac" fillOpacity=".52" stroke="#166655" strokeWidth="2" />
          {angles.map((angle, i) => <text key={careerDirections[i].code} data-code={careerDirections[i].code}
            x={93 + Math.cos(angle)*78} y={90 + Math.sin(angle)*78} dominantBaseline="central" textAnchor="middle"
            className={styles.axisLetter}>{careerDirections[i].code}</text>)}
        </svg>
        <ul aria-label={t("六维兴趣，满分 100", "Six interest scores, out of 100", "六維興趣，滿分 100")}>
          {careerDirections.map(({code, name}, i) => <li key={code} data-code={code}>
            <span className={styles.badge}>{code}</span>
            <span className={styles.axisName}>{careerText(locale, name)}</span>
            <span className={styles.track} aria-hidden="true"><span style={{ width: `${sample.scores[i]}%` }} /></span>
            <b>{sample.scores[i]}</b>
          </li>)}
        </ul>
      </div>
      <div className={styles.baselines}>
        {careerLayers.slice(1, 3).map(layer => <div key={layer.count}>
          <span>{careerText(locale, layer.title)}</span><b>50 <small>/ 100</small></b>
          <span className={styles.track} aria-hidden="true"><span style={{ width: "50%" }} /></span>
        </div>)}
      </div>
      {notes?.[index] && <p className={styles.sampleNote}>{notes[index]}</p>}
      <p className={styles.sampleNote}>{t("方式与条件预览为中性样张，正式计分分别覆盖 5 项与 6 项。", "Neutral example scores for work style and conditions. Scoring covers five and six dimensions respectively.", "方式與條件預覽採中性分數，正式計分各涵蓋 5 項及 6 項。")}</p>
      <div className={styles.sampleJobs}>
        <h3>{index === 0 ? t("样张的前三个兴趣候选", "Top three suggestions in this sample", "範例的前三個興趣選項") : t("可先探索的示例职业", "Illustrative roles to explore", "可先探索的示例職業")}</h3>
        <ul>{sample.jobs.map(slug => <li key={slug}><Link prefetch={false} href={`/${locale}/career/jobs/${slug}`}>{careerText(locale, careerJobs[slug])}</Link>
          {slug === "geographers" && <small>{t("共同兴趣", "Shared interests", "共同興趣")} R·I·A·C</small>}</li>)}</ul>
      </div>
    </div>
  </aside>;
}

export function Career94Layers({ locale }: { locale: DisplayLocale }) {
  const [active, setActive] = useState(0);
  const current = careerLayers[active];
  const label = careerText(locale, ["探索 94 题的四部分", "Explore the four parts", "探索 94 題的四個部分"]);
  return <div className={styles.layers} aria-label={label}>
    <div className={styles.layerButtons} role="group" aria-label={label}>
      <svg viewBox="0 0 400 10" preserveAspectRatio="none" aria-hidden="true"><path d="M25 5 H375" stroke="#a9c8bc" strokeWidth="2" strokeDasharray="4 4"/></svg>
      {careerLayers.map((layer, index) => <button type="button" key={layer.count} aria-controls="career-active-layer"
        aria-pressed={active === index} onClick={() => setActive(index)}>
        <strong>{layer.count}</strong><span>{careerText(locale, layer.title)}</span>
      </button>)}
    </div>
    <div id="career-active-layer" className={styles.layerDetail} aria-live="polite">
      <h3>{careerText(locale, current.lead)}</h3>
      <ul>{current.axes.map(axis => <li key={axis[0]}>{careerText(locale, axis)}</li>)}</ul>
    </div>
  </div>;
}

export function Career94Sticky({ locale, href, label }: { locale: DisplayLocale; href: string; label: string }) {
  const [shown, setShown] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(64);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const update = () => {
      setShown(window.scrollY > 650);
      if (header) setHeaderBottom(Math.max(0, Math.round(header.getBoundingClientRect().bottom)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  if (!shown) return null;
  return <aside data-career-sticky className={styles.sticky} style={{ top: headerBottom }} aria-label={label}>
    <div className={styles.wrap}>
      <p><b>{careerText(locale, ["费马职业测试", "FermatMind Career94", "費馬職業測驗"])}</b> <span>{careerText(locale, ["94 题 · 约 12–15 分钟", "94 questions · About 12–15 min", "94 題 · 約 12–15 分鐘"])}</span></p>
      <TrackedEntryCtaLink href={href} eventProperties={{}} className={styles.primary}>{label} <ArrowRight size={16} aria-hidden /></TrackedEntryCtaLink>
    </div>
  </aside>;
}
