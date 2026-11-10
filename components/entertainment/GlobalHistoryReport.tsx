"use client";

import { useQuestionnaireDisplayCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { useSyncExternalStore } from "react";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, globalHistoryFilename, globalHistoryImagePath } from "@/lib/entertainment/global-history/config";
import { globalHistoryResultKey } from "@/lib/entertainment/global-history/local-result";
import { isHistoryVector } from "@/lib/entertainment/global-history/matching";
import { historyAxes } from "@/lib/entertainment/global-history/questions";
import { historyReflections } from "@/lib/entertainment/global-history/reflection";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import styles from "./GlobalHistory.module.css";

const subscribe = () => () => {};
function readSaved() {
  try {
    return sessionStorage.getItem(globalHistoryResultKey);
  } catch {
    return null;
  }
}
function readVector(raw: string | null, id: string) {
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw);
    return saved?.id === id && isHistoryVector(saved.vector) ? saved.vector : null;
  } catch {
    return null;
  }
}

export function GlobalHistoryShare({ id, locale, displayLocale = locale }: { id: string; locale: Locale; displayLocale?: DisplayLocale }) {
  const traditional = displayLocale === "zh-TW";
  const zh = locale === "zh";
  const image = globalHistoryImagePath(displayLocale, id);
  return <div className={styles.actions}>
    <a className={styles.primary} href={`${image}&download=1`} download={globalHistoryFilename(displayLocale, id)}
      onClick={() => recordEntertainmentActivity(GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, locale, "share", "single", "image")}>
      {traditional ? "下載人物卡 PNG" : zh ? "下载人物卡 PNG" : "Download portrait PNG"}
    </a>
    <a className={styles.secondary} href={image} target="_blank" rel="noopener noreferrer">{traditional ? "開啟圖片" : zh ? "打开图片" : "Open image"}</a>
  </div>;
}

export function GlobalHistoryReport({ id, profile, locale }: { id: string; profile: readonly number[]; locale: Locale }) {
  const { displayText } = useQuestionnaireDisplayCopy();
  const raw = useSyncExternalStore(subscribe, readSaved, () => null);
  const vector = readVector(raw, id);
  const zh = locale === "zh";
  const scores = historyAxes.map((axis, index) => ({ axis, index, figure: profile[index], own: vector?.[index] }));
  const closest = scores.filter(({ own }) => own !== undefined)
    .sort((a, b) => Math.abs(a.own! - a.figure) - Math.abs(b.own! - b.figure)
      || Math.abs(b.own! - 3) - Math.abs(a.own! - 3)).slice(0, 2);
  const mostDistinct = vector ? scores.reduce((best, item) =>
    Math.abs(item.own! - 3) > Math.abs(best.own! - 3) ? item : best) : undefined;
  const describe = (value: number, axis: typeof historyAxes[number]) =>
    value < 3 ? displayText(axis.low[locale]) : value > 3 ? displayText(axis.high[locale]) : zh ? displayText("视情况而定") : "Depends on the situation";

  return <>
    <section className={styles.panel} aria-labelledby="history-axes">
      <p className={styles.kicker}>02</p>
      <h2 id="history-axes">{vector ? (zh ? displayText("你的六维选择") : "Your choices across six dimensions") : (zh ? displayText("人物的六维故事画像") : "The figure’s story profile")}</h2>
      <p>{vector
        ? (zh ? displayText("朱红是你的作答，深棕是人物的故事画像。两端是不同做法，位置高低没有好坏之分。") : "Red marks your choices. Brown marks the figure’s story profile. The ends describe different approaches without ranking them.")
        : (zh ? displayText("这六条记录的是费马为这位人物编写的故事画像。") : "These six lines describe the story profile FermatMind wrote for this figure.")}</p>
      <ul className={styles.axes}>
        {scores.map(({ axis, index, own, figure }) => <li key={index}>
          <strong>{displayText(axis[locale])}</strong>
          <div className={styles.axisLabels}><span>{displayText(axis.low[locale])}</span><span>{displayText(axis.high[locale])}</span></div>
          <div className={styles.axisChart} aria-hidden="true">
            {own !== undefined && <div className={styles.axisTrack}><span className={styles.ownDot} style={{ left: `${own / 6 * 100}%` }} /></div>}
            <div className={styles.axisTrack}><span className={styles.figureDot} style={{ left: `${figure / 6 * 100}%` }} /></div>
          </div>
          <span className="sr-only">{own !== undefined && (zh ? displayText(`你的选择 ${own} / 6。`) : `Your choices ${own} out of 6. `)}
            {zh ? displayText(`人物画像 ${figure} / 6。`) : `Figure profile ${figure} out of 6.`}</span>
        </li>)}
      </ul>
    </section>
    {vector && mostDistinct && <>
      <section className={styles.panel} aria-labelledby="history-closest">
        <p className={styles.kicker}>03</p>
        <h2 id="history-closest">{zh ? displayText("最接近的两处") : "Where your approaches come closest"}</h2>
        <dl className={styles.overlap}>{closest.map(({ axis, index, own, figure }) => <div key={index}>
          <dt>{displayText(axis[locale])}</dt>
          <dd>{zh ? displayText("你的选择") : "Your choices"} · {describe(own!, axis)}</dd>
          <dd>{zh ? displayText("人物画像") : "Figure profile"} · {describe(figure, axis)}</dd>
        </div>)}</dl>
      </section>
      <section className={styles.panel} aria-labelledby="history-reflection">
        <p className={styles.kicker}>04</p>
        <h2 id="history-reflection">{zh ? displayText("下一次可以试试") : "Something to try next time"}</h2>
        <p>{mostDistinct.own === 3
          ? (zh ? displayText("挑一道你最犹豫的题，想想什么信息会让你选另一种做法。") : "Pick a scene you hesitated over. What new information would make you choose a different approach?")
          : displayText(historyReflections[mostDistinct.index][mostDistinct.own! < 3 ? "low" : "high"][locale])}</p>
      </section>
    </>}
  </>;
}
