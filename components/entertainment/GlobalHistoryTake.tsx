"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { matchGlobalHistory } from "@/lib/entertainment/global-history/actions";
import { GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { rememberGlobalHistoryResult } from "@/lib/entertainment/global-history/local-result";
import { historyScenes } from "@/lib/entertainment/global-history/questions";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./ChanganQuiz.module.css";

const subscribe = () => () => {};

export function GlobalHistoryTake({ locale }: { locale: Locale }) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [started, setStarted] = useState(false);
  const [choices, setChoices] = useState<number[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const submitting = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const zh = locale === "zh";
  const step = choices.length;
  const scene = historyScenes[step];
  const track = (action: "start" | "complete" | "result_view") =>
    recordEntertainmentActivity(GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, locale, action);

  useEffect(() => { heading.current?.focus(); }, [started, step]);

  async function choose(option: number) {
    if (submitting.current) return;
    const next = [...choices, option];
    if (next.length < historyScenes.length) {
      setChoices(previous => previous.length === step ? next : previous);
      return;
    }
    submitting.current = true;
    setPending(true);
    setError(false);
    try {
      const result = await matchGlobalHistory(next);
      if (!result) throw new Error("No historical profile matched");
      rememberGlobalHistoryResult(result.id, result.vector);
      track("complete");
      track("result_view");
      router.push(globalHistoryResultPath(locale, result.id));
    } catch {
      setError(true);
      setPending(false);
      submitting.current = false;
    }
  }

  return <div className={styles.stage} data-stage={started ? "answer" : "intro"}>
    {!started ? <div className={styles.scene}>
      <p className={styles.eyebrow}>{zh ? "全球卷 · 展馆值班手记" : "World Edition · A day at the museum"}</p>
      <h2 ref={heading} tabIndex={-1}>{zh ? "钥匙交给你了。两小时后，展馆开门。" : "The keys are yours. The museum opens in two hours."}</h2>
      <p>{zh ? "今天由你负责展馆。每次选择你最可能先做的事。" : "You’re in charge for the day. In each scene, choose what you’d most likely do first."}</p>
      <button type="button" className={styles.primary} disabled={!hydrated} onClick={() => { track("start"); setStarted(true); }}>
        {zh ? "走进展馆" : "Enter the museum"} <span aria-hidden="true">→</span>
      </button>
    </div> : <div className={styles.scene} aria-busy={pending}>
      <progress className={styles.progress} aria-label={zh ? "作答进度" : "Quiz progress"} value={step} max={historyScenes.length} />
      <p className={styles.eyebrow}>{zh ? `第 ${step + 1} / ${historyScenes.length} 题` : `Question ${step + 1} of ${historyScenes.length}`} · {scene.label[locale]}</p>
      <h2 ref={heading} tabIndex={-1}>{scene.prompt[locale]}</h2>
      <div className={styles.choices}>
        {scene.options.map(([, chinese, english], index) => <button type="button" disabled={pending} className={styles.option} key={index} onClick={() => void choose(index)}>
          <span aria-hidden="true">{"ABCD"[index]}</span>{zh ? chinese : english}
        </button>)}
      </div>
      {error && <p role="alert">{zh ? "暂时没能生成结果。前面的选择已保留，请再选一次。" : "We couldn’t load your result. Your previous choices are still here. Pick this answer again to retry."}</p>}
      {pending && <p role="status">{zh ? "正在寻找你的人物卡…" : "Finding your portrait…"}</p>}
      {step > 0 && <button type="button" disabled={pending} className={styles.secondary} onClick={() => {
        setError(false);
        setChoices(previous => previous.slice(0, -1));
      }}>{zh ? "返回上一题" : "Previous question"}</button>}
    </div>}
  </div>;
}
