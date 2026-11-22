"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { hollandPoint, hollandReportSamples } from "@/lib/tests/hollandLanding";
import styles from "./holland-landing.module.css";

type ReportSample = (typeof hollandReportSamples)[number];

function CodeBadges({ code }: { code: string }) {
  return <strong className={styles.codeBadges} aria-label={code}>
    {[...code].map((letter) => <span key={letter} className={styles.letter} data-dimension={letter}>{letter}</span>)}
  </strong>;
}

function HollandReportChart({ sample }: { sample: ReportSample }) {
  const { dimensions, ranked } = sample;
  const point = (index: number, score: number) => hollandPoint(index, score * 0.78);
  return <div className={styles.chart}>
    <svg viewBox="0 0 220 220" aria-hidden="true" data-holland-radar>
      {[100, 75, 50, 25].map((value) => <polygon key={value}
        points={dimensions.map((_, i) => point(i, value).join(",")).join(" ")}
        fill={value === 100 ? "#f0f7f4" : "none"} stroke="#c8dcd6" />)}
      {dimensions.map(({ code }, i) => {
        const [x, y] = point(i, 100);
        return <line key={code} x1="110" y1="110" x2={x} y2={y} stroke="#c8dcd6" />;
      })}
      <polygon data-holland-profile points={dimensions.map(({ score }, i) => point(i, score).join(",")).join(" ")}
        fill="#5ca895" fillOpacity=".36" stroke="#207863" strokeWidth="2.5" />
      {dimensions.map(({ code, score }, i) => {
        const [x, y] = point(i, score);
        const [lx, ly] = point(i, 119);
        return <g key={code} data-dimension={code}>
          <circle cx={x} cy={y} r="4.5" className={styles.plotDot} />
          <rect x={lx - 12} y={ly - 12} width="24" height="24" rx="6" className={styles.plotBadge} />
          <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className={styles.plotLabel}>{code}</text>
        </g>;
      })}
    </svg>
    <dl aria-label="六维兴趣分数（0–100）" className={styles.bars}>
      {ranked.map(({ code, label, score }) => <div key={code} data-dimension={code}>
        <dt><span className={styles.letter}>{code}</span>{label}</dt>
        <dd><span>{score}</span><span className={styles.track} aria-hidden="true"><span style={{ width: `${score}%` }} /></span></dd>
      </div>)}
    </dl>
  </div>;
}

export function HollandHeroReport() {
  const [active, setActive] = useState(0);
  const sample = hollandReportSamples[active];
  return <aside className={styles.heroReport} aria-label="霍兰德报告样张">
    <div className={styles.reportBar}><strong>职业兴趣报告</strong><span>虚构示例</span></div>
    <div className={styles.sampleTabs} role="group" aria-label="切换报告样张">
      {hollandReportSamples.map(({ code, name }, index) => <button key={code} type="button" aria-pressed={active === index}
        aria-controls="holland-report-sample" onClick={() => setActive(index)}><strong>{code}</strong> {name}</button>)}
    </div>
    <div id="holland-report-sample" aria-live="polite">
      <div className={styles.reportSummary}>
        <div><p>前三兴趣代码</p><CodeBadges code={sample.code} /></div>
        <div><p>第一与第二名分差</p><b>{sample.gap} 分</b></div>
      </div>
      <HollandReportChart sample={sample} />
      <div className={styles.reportTip}><b>下一步试做</b><span>{sample.task}</span></div>
    </div>
  </aside>;
}

const tabs = ["六维图谱", "三字代码", "职业探索"] as const;
const defaultSample = hollandReportSamples[0];

export function HollandReportPreview({ samplePath }: { samplePath: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  return <>
    <button type="button" className={styles.secondary} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>查看报告样张</button>
    <dialog className={styles.dialog} ref={dialog} aria-labelledby="holland-report-title">
      <div className={styles.dialogHeader}>
        <div><h2 id="holland-report-title">霍兰德职业兴趣报告样张</h2><p>虚构示例 · 你的结果根据实际作答生成</p></div>
        <form method="dialog"><button className={styles.close} aria-label="关闭报告样张"><X size={22} aria-hidden="true" /></button></form>
      </div>
      <div className={styles.tabs} role="group" aria-label="报告样张章节">
        {tabs.map((tab, index) => <button type="button" key={tab} aria-pressed={index === active} onClick={() => setActive(index)}>{tab}</button>)}
      </div>
      <div className={styles.dialogBody}>
        {active === 0 ? <><h3>六维兴趣图谱</h3><HollandReportChart sample={defaultSample} /><p>研究型和艺术型相差 {defaultSample.gap} 分。分化程度为 {defaultSample.spread} 分，反映六项得分围绕平均值的分散程度。</p></> : null}
        {active === 1 ? <><h3>{defaultSample.code} · 研究、艺术与社会</h3><p>试着把三个维度放到同一个场景中理解。先访谈用户（S），归纳问题（I），再画一版解决方案（A），记录哪一步最想继续做。</p></> : null}
        {active === 2 ? <><h3>从兴趣代码找到值得试做的任务</h3><p>可以先对照数据科学家的分析工作和平面设计师的视觉表达，再挑一个任务试做。</p><ul className={styles.dialogLinks}>
          <li><Link href="/zh/career/jobs/data-scientists">数据科学家 · 分析数据并解释发现</Link></li>
          <li><Link href="/zh/career/jobs/graphic-designers">平面设计师 · 把信息转成视觉设计</Link></li>
          <li><Link href="/zh/career/compare">打开双职业对比</Link></li>
          <li><Link href="/zh/holland-test/pdf-download">填写职业探索行动工作表</Link></li>
        </ul></> : null}
        <Link className={styles.sampleLink} href={samplePath} prefetch={false}>打开深度报告示例 <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </dialog>
  </>;
}
