import type { Ref } from "react";
import Link from "next/link";
import { sevenSinsCardPeaks, sevenSinsCardRows, sevenSinsRadarPoint, type SevenSinsTrack } from "@/lib/questionnaires/sevenSinsCard";
import { sevenSinsShareCopy, sevenSinsTrackLabel } from "@/lib/questionnaires/sevenSinsShareCopy";
import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";
import type { DisplayLocale as Locale } from "@/lib/i18n/locales";
import { miniVirtuesDefinitions, scoreMiniVirtuesQuestionnaire, type MiniVirtuesDualResult } from "@/lib/questionnaires/miniVirtues";
import styles from "./SevenSinsOverview.module.css";

type Track = "sin" | "virtue";
type Axis = { label: (typeof miniVirtuesDefinitions)[number][Track]; score: number; track: Track };
const axisOrder = { sin: [2, 3, 5, 6, 1, 4, 0], virtue: [2, 4, 1, 6, 5, 3, 0] } as const;
const tracks = ["sin", "virtue"] as const;
const center = [180, 178] as const;
const radius = 105;
// Keep long English labels outside the plot at phone widths, with each score below its label.
const phoneLabels = [[180, 25], [240, 55], [287, 93], [313, 139], [313, 211], [287, 257], [270, 303], [180, 330], [90, 303], [73, 257], [46, 211], [46, 139], [73, 93], [120, 55]] as const;

function point(index: number, distance: number) {
  const angle = index * Math.PI / 7 - Math.PI / 2;
  return [center[0] + Math.cos(angle) * distance, center[1] + Math.sin(angle) * distance] as const;
}

function Radar({ axes, locale, sample = false, landing = false }: { axes: Axis[]; locale: Locale; sample?: boolean; landing?: boolean }) {
  const zh = locale !== "en";
  const headingId = sample ? "seven-sins-sample-heading" : "seven-sins-radar-heading";
  const valuesId = sample ? "seven-sins-sample-values" : "seven-sins-radar-values";
  const Heading = sample ? "h2" : "h3";
  return <section className={landing ? `${styles.chart} ${styles.previewChart}` : styles.chart} data-seven-sins-radar aria-labelledby={headingId}>
    <Heading id={headingId} className={landing ? "sr-only" : styles.lined}>{sample ? (zh ? sevenSinsDisplay("结果示例", locale) : "Sample result") : (locale === "zh-TW" ? "本次14項作答結果" : zh ? "十四维人格雷达" : "14-Axis Personality Radar")}</Heading>
    {landing ? <div className={styles.previewLegend}><span>{{ zh: "红色：七宗罪", "zh-TW": "紅色：七宗罪", en: "Red: Seven sins" }[locale]}</span><span>{{ zh: "金色：七美德", "zh-TW": "金色：七美德", en: "Gold: Seven virtues" }[locale]}</span></div> : <p className={styles.chartSubtitle}>{zh ? sevenSinsDisplay("红色七宗罪 · 金色七美德 · 双轨独立计分", locale) : "Red: seven sins · Gold: seven virtues · Independent scores"}</p>}
    <svg className={styles.radar} viewBox="0 0 360 344" role="img" aria-labelledby={headingId} aria-describedby={valuesId}>
      <path d="M180 8 A170 170 0 0 1 180 348 Z" fill="#9e333d" fillOpacity=".13" />
      <path d="M180 8 A170 170 0 0 0 180 348 Z" fill="#cab381" fillOpacity=".08" />
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
        return <g key={axis.label.en} className={zh ? undefined : styles.standardEnglishLabels}>
          <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" className={zh ? styles.axisLabel : styles.axisLabelEn}>{sevenSinsDisplay(axis.label[locale === "en" ? "en" : "zh"], locale)}</text>
          <text x={scoreX} y={scoreY} textAnchor={anchor} dominantBaseline="central" className={axis.track === "sin" ? styles.sinValue : styles.virtueValue} data-seven-sins-axis={axis.label.en}>{Math.round(axis.score)}</text>
        </g>;
      })}
      {!zh && <g className={styles.phoneEnglishLabels} aria-hidden="true">
        {axes.map((axis, index) => <g key={axis.label.en}>
          <text x={phoneLabels[index][0]} y={phoneLabels[index][1]} textAnchor="middle" dominantBaseline="central" className={styles.axisLabelEn}>{axis.label.en}</text>
          <text x={phoneLabels[index][0]} y={phoneLabels[index][1] + 22} textAnchor="middle" dominantBaseline="central" className={axis.track === "sin" ? styles.sinValue : styles.virtueValue} data-seven-sins-phone-axis={axis.label.en}>{Math.round(axis.score)}</text>
        </g>)}
      </g>}
    </svg>
    <p id={valuesId} className="sr-only">
      {axes.map(axis => `${sevenSinsDisplay(axis.label[locale === "en" ? "en" : "zh"], locale)} ${Math.round(axis.score)}/100`).join(zh ? "，" : ", ")}
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

const sampleOptions = ["3", "4", "2", "5", "4", "2", "2", "3", "3", "5", "3", "3", "3", "3", "4", "3", "5", "3", "3", "4", "4", "4", "2", "4", "4", "3", "5", "3"] as const;

export function buildSevenSinsSample(quiz: { questions: readonly { id: string }[] }) {
  const answers = Object.fromEntries(quiz.questions.map((question, index) => [question.id, sampleOptions[index]]));
  return scoreMiniVirtuesQuestionnaire(quiz, answers);
}

export function SevenSinsPreviewRadar({ result, locale }: { result: MiniVirtuesDualResult; locale: Locale }) {
  return <Radar axes={[...resultAxes(result, "sin"), ...resultAxes(result, "virtue")]} locale={locale} sample landing />;
}

export function QuestionnaireSevenSinsSample({ result, locale }: { result: MiniVirtuesDualResult; locale: Locale }) {
  const axes = [...resultAxes(result, "sin"), ...resultAxes(result, "virtue")];
  const anger = result.miniVirtues.find(part => part.id === "ANGER_PATIENCE")!;
  return <div id="seven-sins-sample" className={`${styles.frame} ${styles.sample}`} tabIndex={-1}>
    <Radar axes={axes} locale={locale} sample />
    <p>{locale !== "en"
      ? sevenSinsDisplay("这份虚构答卷中，暴怒和耐心各得 {score} 分。两项来自不同题目，因此可以同时较高。", locale).replace("{score}", String(anger.sin))
      : `In this fictional response, Wrath and Patience each score ${anger.sin}. They use different questions, so both can be high.`}</p>
  </div>;
}

const assessmentPaths = [
  "/tests/big-five-personality-test-ocean-model",
  "/tests/eq-test-emotional-intelligence-assessment",
  "/tests/mbti-personality-test-16-personality-types",
];

export function QuestionnaireSevenSinsOverview({ result, locale, headingRef }: {
  result: MiniVirtuesDualResult;
  locale: Locale;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const rows = sevenSinsCardRows(result);
  if (!rows) return null;
  const peaks = sevenSinsCardPeaks(rows);
  const copy = sevenSinsShareCopy[locale];
  const coordinates = (index: number, score: number) => sevenSinsRadarPoint(index, 79 * score / 100, 160, 119);
  const polygon = (values: number[]) => values.map((score, index) => {
    const { x, y } = coordinates(index, score);
    return `${x},${y}`;
  }).join(" ");
  return <section className={styles.honor} data-seven-sins-board aria-label={copy.name}>
    <header className={styles.honorHeader}><h2 ref={headingRef} tabIndex={-1}>{copy.name}</h2><span>{copy.time}</span></header>
    <div className={styles.peakGrid}>
      {tracks.map(track => {
        const leaders = peaks[track];
        const names = leaders.map(row => sevenSinsTrackLabel(row, track, locale));
        const abbreviated = names.length > 2 ? `${names.slice(0, 2).join(" · ")} +${names.length - 2}` : names.join(" · ");
        return <div className={track === "sin" ? styles.peakShadow : styles.peakLight} key={track} data-seven-sins-leader={track}>
          <span>{track === "sin" ? copy.shadow : copy.light}{names.length > 1 && <small>{copy.tied}</small>}</span>
          <div aria-label={names.join(" · ")}>{abbreviated}</div>
          <strong>{Math.round(leaders[0].scores[track])}</strong>
        </div>;
      })}
    </div>
    <figure className={styles.honorRadar} data-seven-sins-radar>
      <svg viewBox="0 0 320 236" role="img" aria-label={copy.legend.join(". ")}>
        {[25, 50, 75, 100].map(score => <polygon key={score} points={polygon(rows.map(() => score))} fill="none" stroke="#d5ae7038" />)}
        {rows.map((row, index) => {
          const outer = coordinates(index, 100);
          const label = coordinates(index, 125);
          return <g key={row.id}><line x1="160" y1="119" x2={outer.x} y2={outer.y} stroke="#d5ae7038" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="central">{copy.pairs[index]}</text></g>;
        })}
        {tracks.map(track => {
          const color = track === "sin" ? "#f77181" : "#f6cb79";
          return <g key={track}>
            <polygon points={polygon(rows.map(row => row.scores[track]))} fill={color} fillOpacity=".18" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {rows.map((row, index) => {
              const point = coordinates(index, row.scores[track]);
              return <circle key={row.id} cx={point.x} cy={point.y} r="2.6" fill={color} />;
            })}
          </g>;
        })}
      </svg>
      <figcaption><span>{copy.legend[0]}</span><span>{copy.legend[1]}</span></figcaption>
    </figure>
    <p className={styles.honorLine} data-seven-sins-pattern={peaks.pattern}>{copy.patterns[peaks.pattern]}</p>
    <p className={styles.honorWatermark}>FermatMind.com</p>
  </section>;
}

export function SevenSinsScoreDetails({ result, locale }: { result: MiniVirtuesDualResult; locale: Locale }) {
  const rows = sevenSinsCardRows(result);
  if (!rows) return null;
  const copy = sevenSinsShareCopy[locale];
  return <section className={styles.scoreDetails}>
    <h3>{copy.details}</h3>
    <table><thead><tr><th scope="col">{copy.sin}</th><th scope="col">{copy.virtue}</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}>
        {tracks.map((track: SevenSinsTrack) => <td key={track} data-seven-sins-axis={row[track].en}>
          <span>{sevenSinsTrackLabel(row, track, locale)}</span><strong>{Math.round(row.scores[track])}</strong>
          {(track === "sin" ? row.leadingSin : row.leadingVirtue) && <span className="sr-only">{copy[track === "sin" ? "shadow" : "light"]}</span>}
        </td>)}
      </tr>)}</tbody>
    </table>
  </section>;
}

export function SevenSinsNextAssessments({ locale }: { locale: Locale }) {
  const copy = sevenSinsShareCopy[locale];
  return <section className={styles.assessmentBridge} aria-labelledby="seven-sins-next">
    <h3 id="seven-sins-next">{copy.next}</h3><p>{copy.nextLead}</p>
    <ul>{assessmentPaths.map((path, index) => <li key={path}><Link prefetch={false} referrerPolicy="no-referrer" href={`/${locale}${path}`}>{copy.options[index]} →</Link></li>)}</ul>
  </section>;
}
