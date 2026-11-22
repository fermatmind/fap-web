"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { StartTestButton } from "@/components/tests/StartTestButton";
import type { Sample } from "@/lib/tests/trioLanding";
import { landingUi } from "@/lib/tests/localized-landings/ui";
import type { LocalizedLandingKind, LocalizedLandingLocale } from "@/lib/tests/localized-landings/types";
import { hollandPoint } from "@/lib/tests/hollandLanding";
import { mbtiFunctionStacks, type MbtiLandingType } from "@/lib/mbti/landingTypeDynamics";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import styles from "./trio-landing.module.css";

export type Entry = {
  href: string | null;
  label: string;
  testId: string;
  eventProperties?: Record<string, string>;
  nativeGet?: boolean;
};

export function TrioStart({entry, className, identify = false}: {entry: Entry; className: string; identify?: boolean}) {
  if (!entry.href) return null;
  const label = <>{entry.label} <ArrowRight size={16} aria-hidden /></>;
  return entry.nativeGet
    ? <StartTestButton href={entry.href} className={className}>{label}</StartTestButton>
    : <TrackedEntryCtaLink className={className} href={entry.href} data-testid={identify ? entry.testId : undefined} eventProperties={entry.eventProperties ?? {}}>{label}</TrackedEntryCtaLink>;
}

const colors = ["#287867", "#456db3", "#7961aa", "#ad5d40", "#6e7185"];

export function TrioSample({sampleSet, kind, sampleLink, locale}: {sampleSet: Sample[]; kind: LocalizedLandingKind; sampleLink: string; locale?: LocalizedLandingLocale}) {
  const [index, setIndex] = useState(0);
  const sample = sampleSet[index];
  const ui = locale ? landingUi[locale] : null;
  const correctRate = sample?.count ? sample.count[0] / sample.count[1] * 100 : null;
  return <aside id="scored-report-example" className={styles.sample} aria-label={ui?.report ?? "结果报告预览"}>
    <div className={styles.sampleHead}>
      <h2>{ui?.report ?? "结果报告预览"}</h2>
      <span className={styles.reportMark} aria-hidden>{kind === "big5" ? "OCEAN" : kind === "iq" ? "IQ" : kind === "enneagram" ? "01–09" : kind === "eq" ? "EQ" : kind === "disc" ? "DISC" : kind === "holland" ? "RIASEC" : (ui?.types ?? "12 原型")}</span>
    </div>
    <div className={styles.sampleTabs} role="group" aria-label={ui?.switchReport ?? "选择预览"}>
      {sampleSet.map((view, i) => <button type="button" key={view.label} aria-controls="trio-report-view" aria-pressed={i === index} onClick={()=>setIndex(i)}>{view.label}</button>)}
    </div>
    <div id="trio-report-view" className={styles.sampleBody} aria-live="polite">
      {sample ? <>
        <p className={styles.sampleCaption}>{sample.caption}</p>
        {kind === "enneagram" && sample.rows.length === 9 ? <NineBars rows={sample.rows} locale={locale}/> :
          sample.count && correctRate !== null ? <div className={styles.iqScore}>
            <div><strong>{sample.count[0]}<small> / {sample.count[1]}</small></strong><span>{ui?.correct ?? "答对题数"}</span></div>
            <div><strong>{correctRate.toFixed(1)}<small>%</small></strong><span>{ui?.accuracy ?? "答题正确率"}</span></div>
            <span className={styles.scoreTrack} aria-hidden><span style={{width:`${correctRate}%`}} /></span>
          </div> : <div className={sample.artwork || kind === "holland" ? styles.sampleWithArt : undefined}><ul className={styles.sampleRows}>
            {sample.rows.map(row => <li key={row.key} style={{"--bar":kind === "big5" ? colors["OCEAN".indexOf(row.key[0]) % colors.length] : undefined} as React.CSSProperties}>
              <b>{row.key}</b><span>{row.name}</span><span className={styles.scoreTrack} aria-hidden><span style={{width:`${row.value / (row.limit ?? 100) * 100}%`}} /></span><strong>{row.value}</strong>
            </li>)}
          </ul>{kind === "holland" && <HollandRadar rows={sample.rows}/>} {sample.artwork && <Image src={sample.artwork} alt="" width={116} height={116} unoptimized />}</div>}
        <p className={styles.sampleNote}>{sample.note}</p>
      </> : <p>{ui?.noSample ?? "可直接打开公开样张查看版式。"}</p>}
    </div>
    <Link className={styles.reportLink} href={sample?.url ?? sampleLink} prefetch={false}>{sample?.url ? (ui?.reportLink ?? "查看完整公开样张") : (ui?.referenceReport ?? "另看固定公开样张")} <ArrowUpRight size={16} aria-hidden /></Link>
  </aside>;
}

function HollandRadar({rows}: {rows: Sample["rows"]}) {
  const points = (scale: (index: number) => number) => rows.map((_, i) => hollandPoint(i, scale(i)).join(",")).join(" ");
  return <svg className={styles.hollandRadar} viewBox="0 0 220 220" aria-hidden="true">
    {[25,50,75,100].map(radius => <polygon key={radius} points={points(() => radius*.78)} fill="none" stroke="#b9d3c8"/>)}
    {rows.map(({key}, i) => {
      const [x, y] = hollandPoint(i, 94);
      return <text key={key} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="currentColor">{key}</text>;
    })}
    <polygon points={points(i => rows[i].value*.78)} fill="#a0d1be" fillOpacity=".65" stroke="#287867" strokeWidth="2"/>
  </svg>;
}

function NineBars({rows, locale}: {rows: Sample["rows"]; locale?: LocalizedLandingLocale}) {
  const strongest = Math.max(...rows.map(row=>row.value));
  return <ol className={styles.nineBars} aria-label={locale ? landingUi[locale].typeScores : "九型样张分布"}>
    {rows.map(row => <li key={row.key} data-leading={row.value === strongest} aria-label={`${row.name} ${row.value}${locale ? "" : " 分"}`}>
      <strong>{Number(row.value.toFixed(2))}</strong><span className={styles.verticalTrack} aria-hidden><span style={{height:`${row.value}%`}} /></span><span>{row.key}{locale ? "" : "号"}</span>
    </li>)}
  </ol>;
}

export function TrioExplorer({items, locale, kind}: {items: [string, string, string][]; locale?: LocalizedLandingLocale; kind?: LocalizedLandingKind}) {
  const [index,setIndex] = useState(0);
  const [title, observation, prompt] = items[index];
  return <div className={styles.explorer}>
    {kind === "holland" && <svg className={styles.hexagon} viewBox="0 0 220 220" aria-hidden="true">
      <polygon points={items.map((_, i) => hollandPoint(i, 85).join(",")).join(" ")} fill="none" stroke="#bed7cc" strokeWidth="2"/>
      {[-1, 1, 3].map(offset => {
        const [x1, y1] = hollandPoint(index, 85);
        const [x2, y2] = hollandPoint((index + offset + 6) % 6, 85);
        return <line key={offset} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#287867" strokeWidth="3" strokeDasharray={offset === 3 ? "6 5" : undefined}/>;
      })}
      {items.map(([label], i) => {
        const [x, y] = hollandPoint(i, 85);
        return <g key={label}><circle cx={x} cy={y} r="16" fill={i === index ? "#246a55" : "#e4f1eb"}/>
          <text x={x} y={y} fill={i === index ? "white" : "#246a55"} textAnchor="middle" dominantBaseline="central">{label[0]}</text></g>;
      })}
    </svg>}
    <div className={styles.explorerTabs} data-four={items.length === 4} role="group" aria-label={locale ? landingUi[locale].choosePerspective : "切换观察角度"}>
      {items.map(([label], i) => <button key={label} type="button" aria-controls="trio-explorer-panel" aria-pressed={i === index} onClick={()=>setIndex(i)}>{label}</button>)}
    </div>
    <div id="trio-explorer-panel" className={styles.explorerBody} aria-live="polite">
      <span className={styles.explorerIndex} aria-hidden>{String(index+1).padStart(2,"0")}</span>
      <div><h3>{title}</h3><p>{observation}</p><p className={styles.explorerQuestion}>{prompt}</p></div>
    </div>
    {kind === "mbti" && locale && <CognitiveStack locale={locale}/>}
  </div>;
}

const stackExamples: MbtiLandingType[] = ["ISFJ", "INTP", "ENFJ"];
const stackRoleNames = {
  en: ["Dominant", "Auxiliary", "Tertiary", "Inferior"],
  "zh-TW": ["主導", "輔助", "第三", "劣勢"],
};

function CognitiveStack({locale}: {locale: LocalizedLandingLocale}) {
  const [type, setType] = useState<MbtiLandingType>("ISFJ");
  const label = locale === "en" ? "Explore a theoretical function stack" : "看三種人格的理論功能序列";
  return <div className={styles.stackExplorer}>
    <h3>{label}</h3>
    <div className={styles.explorerTabs} role="group" aria-label={label}>
      {stackExamples.map(code => <button key={code} type="button" aria-pressed={type === code}
        aria-controls="trio-cognitive-stack" onClick={() => setType(code)}>{code}</button>)}
    </div>
    <ol id="trio-cognitive-stack" aria-live="polite">
      {mbtiFunctionStacks[type].map((fn, i) => <li key={fn}><b>{fn}</b><span>{stackRoleNames[locale][i]}</span></li>)}
    </ol>
  </div>;
}

export function MatrixExercise({locale}: {locale?: LocalizedLandingLocale}) {
  const ui = locale ? landingUi[locale] : null;
  const [answer,setAnswer] = useState<number | null>(null);
  return <div id="iq-sample-question" className={styles.explorer}>
    <p className={styles.eyebrow}>{ui?.sampleExercise ?? "原创教学演示 · 不计分"}</p>
    <div className={styles.puzzle} role="img" aria-label={ui?.exerciseImage ?? "第一行一、二、三个空心圆；第二行一、二个实心方块和一格空白"}>
      {[1,2,3,1,2,0].map((count,i)=><span key={i}>
        {count === 0 ? <b>?</b> : <svg viewBox="0 0 80 36" aria-hidden>
          {Array.from({length:count},(_,j)=> {
            const x = 40 + (j - (count-1)/2)*18;
            return i < 3 ? <circle key={j} cx={x} cy="18" r="5.5" fill="none" stroke="currentColor" strokeWidth="2"/> :
              <rect key={j} x={x-5} y="13" width="10" height="10" fill="currentColor"/>;
          })}
        </svg>}
      </span>)}
    </div>
    <div className={styles.explorerTabs} role="group" aria-label={ui?.exerciseOptions ?? "补全第二行"}>
      {[2,3,4].map(value=><button key={value} type="button" aria-pressed={answer===value} onClick={()=>setAnswer(value)}>{value} {ui?.squares ?? "个方块"}</button>)}
    </div>
    <p className={styles.puzzleFeedback} role="status">{answer === null ? (ui?.exerciseStart ?? "选一个答案，看看它是否同时满足两条线索。") : answer === 3 ? (ui?.exerciseCorrect ?? "答对了。行内形状不变，数量每格加一。") : (ui?.exerciseRetry ?? "再看第二行。已有 1 个、2 个，下一格应该有几个？")}</p>
  </div>;
}

export function TrioSticky({name, entry}: {name: string; entry: Entry}) {
  const [visible,setVisible] = useState(false);
  useEffect(() => {
    const scroll = () => setVisible(window.scrollY >= 650);
    scroll();
    window.addEventListener("scroll",scroll,{passive:true});
    return () => window.removeEventListener("scroll",scroll);
  },[]);
  if (!visible || !entry.href) return null;
  return <div className={styles.sticky} data-trio-sticky>
    <div className={styles.wrap}><strong>{name}</strong><TrioStart entry={entry} className={styles.cta}/></div>
  </div>;
}
