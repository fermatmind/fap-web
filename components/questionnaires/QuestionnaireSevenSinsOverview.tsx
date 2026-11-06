import type { Ref } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { miniVirtuesDefinitions, type MiniVirtuesDualResult } from "@/lib/questionnaires/miniVirtues";
import styles from "./SevenSinsOverview.module.css";

type Track = "sin" | "virtue";
type Axis = { label: (typeof miniVirtuesDefinitions)[number][Track]; score: number; track: Track };
const axisOrder = { sin: [2, 3, 5, 6, 1, 4, 0], virtue: [2, 4, 1, 6, 5, 3, 0] } as const;
const tracks = ["sin", "virtue"] as const;
const center = [180, 178] as const;
const radius = 105;

function point(index: number, distance: number) {
  const angle = index * Math.PI / 7 - Math.PI / 2;
  return [center[0] + Math.cos(angle) * distance, center[1] + Math.sin(angle) * distance] as const;
}

function LeadingCard({ axes, locale }: { axes: Axis[]; locale: Locale }) {
  const zh = locale === "zh";
  const sin = axes[0].track === "sin";
  const highest = Math.max(...axes.map(axis => axis.score));
  const leaders = axes.filter(axis => axis.score === highest);
  return <div className={styles.card} data-seven-sins-leader={axes[0].track}>
    <p className={styles.cardLabel}>{sin ? (zh ? "七宗罪之首" : "Leading sin") : (zh ? "七美德之首" : "Leading virtue")}</p>
    {zh && leaders.length === 1 && <p className={styles.cardEnglish}>{leaders[0].label.en}</p>}
    <p className={leaders.length === 1 ? styles.cardName : styles.cardTies}>
      {leaders.length > 1 && <span className={styles.tieLabel}>{zh ? "并列" : "Joint leaders"}</span>}
      {leaders.map(axis => axis.label[locale]).join(zh ? "、" : ", ")}
    </p>
    <p className={styles.cardScore}><strong>{Math.round(highest)}</strong><span> / 100</span></p>
  </div>;
}

function Radar({ axes, locale, sample = false }: { axes: Axis[]; locale: Locale; sample?: boolean }) {
  const zh = locale === "zh";
  const headingId = sample ? "seven-sins-sample-heading" : "seven-sins-radar-heading";
  const valuesId = sample ? "seven-sins-sample-values" : "seven-sins-radar-values";
  const Heading = sample ? "h2" : "h3";
  return <section className={styles.chart} data-seven-sins-radar aria-labelledby={headingId}>
    <Heading id={headingId} className={styles.lined}>{sample ? (zh ? "结果示例" : "Sample result") : (zh ? "十四维人格雷达" : "14-Axis Personality Radar")}</Heading>
    <p className={styles.chartSubtitle}>{zh ? "红色七宗罪 · 金色七美德 · 双轨独立计分" : "Red: seven sins · Gold: seven virtues · Independent scores"}</p>
    <svg className={styles.radar} viewBox="0 0 360 344" role="img" aria-labelledby={headingId} aria-describedby={valuesId}>
      <path d="M180 8 A170 170 0 0 1 180 348 Z" fill="#cab381" fillOpacity=".08" />
      <path d="M180 8 A170 170 0 0 0 180 348 Z" fill="#9e333d" fillOpacity=".13" />
      {[25, 50, 75, 100].map(value => <polygon key={value} points={axes.map((_, index) => point(index, radius * value / 100).join(",")).join(" ")} className={styles.grid} />)}
      {axes.map((axis, index) => {
        const [x, y] = point(index, radius);
        return <line key={axis.label.en} x1={center[0]} y1={center[1]} x2={x} y2={y} className={styles.grid} />;
      })}
      <line x1={center[0]} y1={center[1] - radius} x2={center[0]} y2={center[1] + radius} className={styles.divide} />
      {tracks.map((track, trackIndex) => {
        const points = axes.slice(trackIndex * 7, trackIndex * 7 + 7).map((axis, i) => point(i + trackIndex * 7, radius * axis.score / 100));
        return <g key={track} className={track === "sin" ? styles.sinShape : styles.virtueShape}>
          <polygon points={[center, ...points].map(p => p.join(",")).join(" ")} />
          {points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="3.7" />)}
        </g>;
      })}
      {axes.map((axis, index) => {
        const [x, y] = point(index, 137);
        const [scoreX, scoreY] = point(index, 114);
        const anchor = index % 7 === 0 ? "middle" : index < 7 ? "start" : "end";
        return <g key={axis.label.en}>
          <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" className={zh ? styles.axisLabel : styles.axisLabelEn}>{axis.label[locale]}</text>
          <text x={scoreX} y={scoreY} textAnchor={anchor} dominantBaseline="central" className={axis.track === "sin" ? styles.sinValue : styles.virtueValue} data-seven-sins-axis={axis.label.en}>{Math.round(axis.score)}</text>
        </g>;
      })}
    </svg>
    <p id={valuesId} className="sr-only">
      {axes.map(axis => `${axis.label[locale]} ${Math.round(axis.score)}/100`).join(zh ? "，" : ", ")}
    </p>
  </section>;
}

function resultAxes(result: MiniVirtuesDualResult, track: Track): Axis[] {
  return axisOrder[track].map(index => ({
    label: miniVirtuesDefinitions[index][track],
    score: result.miniVirtues[index][track],
    track,
  }));
}

export function QuestionnaireSevenSinsSample({ result, locale }: { result: MiniVirtuesDualResult; locale: Locale }) {
  const axes = [...resultAxes(result, "sin"), ...resultAxes(result, "virtue")];
  const anger = result.miniVirtues.find(part => part.id === "ANGER_PATIENCE")!;
  return <div id="seven-sins-sample" className={`${styles.frame} ${styles.sample}`} tabIndex={-1}>
    <Radar axes={axes} locale={locale} sample />
    <p>{locale === "zh"
      ? `这份虚构答卷中，暴怒和耐心各得 ${anger.sin} 分。两项来自不同题目，因此可以同时较高。`
      : `In this fictional response, Wrath and Patience each score ${anger.sin}. They use different questions, so both can be high.`}</p>
  </div>;
}

export function QuestionnaireSevenSinsOverview({ result, locale, headingRef }: {
  result: MiniVirtuesDualResult;
  locale: Locale;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const zh = locale === "zh";
  const sins = resultAxes(result, "sin");
  const virtues = resultAxes(result, "virtue");
  const average = (items: Axis[]) => Math.round(items.reduce((sum, axis) => sum + axis.score, 0) / items.length);
  const sinAverage = average(sins);
  const virtueAverage = average(virtues);
  const balance = virtueAverage === sinAverage ? (zh ? "双轨均值持平" : "The tracks are level")
    : virtueAverage > sinAverage ? (zh ? "光辉略占上风" : "Light has the edge")
      : (zh ? "暗影略占上风" : "Shadow has the edge");
  return <div className={styles.frame} data-seven-sins-board>
    <div className={styles.board}>
      <div className={styles.summary}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Seven Sins vs Seven Virtues</p>
          <h2 ref={headingRef} tabIndex={-1} className={styles.title}>
            {zh ? "你的" : "Your"} <span>{zh ? "七宗罪 VS 七美德" : "Seven Sins vs Seven Virtues"}</span> {zh ? "结果" : "Results"}
          </h2>
          <p className={`${styles.lined} ${styles.tagline}`}>{zh ? "左侧暗影牵引 · 右侧光辉托举" : "Shadow pulls · Light lifts"}</p>
        </header>
        <div className={styles.cards}>
          <LeadingCard axes={sins} locale={locale} />
          <LeadingCard axes={virtues} locale={locale} />
        </div>
        <p className={styles.balance} data-seven-sins-balance>
          <span>{balance}</span><span>{zh ? "美德均值" : "Virtue avg."} {virtueAverage}</span><span>{zh ? "罪均值" : "Sin avg."} {sinAverage}</span>
        </p>
        <a className={styles.readingsLink} href="#seven-sins-readings">{zh ? "查看七组解读" : "Explore the seven readings"} <span aria-hidden="true">↓</span></a>
      </div>
      <Radar axes={[...sins, ...virtues]} locale={locale} />
    </div>
  </div>;
}
