import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { E105ReportAssets } from "@/lib/enneagram/e105ReportAssets";
import type { DisplayLocale } from "@/lib/i18n/locales";
import styles from "./enneagramResult.module.css";

type Props = {
  assets: E105ReportAssets;
  candidateId: string;
  candidateScores: string;
  locale: DisplayLocale;
  displayText: (value: string) => string;
};

export function EnneagramE105Applications({ assets, candidateId, candidateScores, locale, displayText }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const candidate = assets.candidates.find((entry) => entry.type_id === candidateId);
  if (!candidate) return null;

  const label = (zh: string, en: string) => locale === "en" ? en : displayText(zh);
  const scenarios = [
    ["work", label("职场协作", "Working with others")],
    ["stress", label("压力之下", "Under pressure")],
    ["money", label("金钱与日常选择", "Money and daily choices")],
    ["relationships", label("人际关系", "Relationships")],
  ] as const;
  const prompt = [label("我的 105 题九型报告候选与分数", "Candidates and scores from my 105-item Enneagram report"), candidateScores, displayText(assets.ai_prompt)].join("\n\n");

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="grid gap-4">
      <section className={styles.chapter} aria-labelledby="e105-careers">
        <header className={styles.chapterHeader}><h2 id="e105-careers">{label("职业匹配", "Career task matches")}</h2></header>
        <div className="grid gap-4 p-5">
          <p>{label("对照这些任务和自己的经历，再核对岗位要求与工作条件。", "Compare these tasks with your experience, then check the job requirements and working conditions.")}</p>
          {candidate.careers.map((career) => (
            <article key={career.slug} className="grid gap-2 rounded-lg border border-emerald-900/15 p-4">
              <h3 className="font-semibold">{displayText(career.name)}</h3>
              <p>{displayText(career.task)}</p>
              <p>{displayText(career.connection)}</p>
              <p><strong>{label("试做", "Try it")}</strong> {displayText(career.verify)}</p>
              <div className="flex flex-wrap gap-4 text-sm underline underline-offset-2">
                <Link href={`/${locale}/career/jobs/${career.slug}`}>{label("查看职业详情", "Career details")}</Link>
                <a href={career.source}>{label("O*NET 任务来源", "O*NET task source")}</a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.chapter} aria-labelledby="e105-life">
        <header className={styles.chapterHeader}><h2 id="e105-life">{label("工作与生活", "Work and life")}</h2></header>
        <dl className="grid gap-4 p-5 sm:grid-cols-2">
          {scenarios.map(([id, title]) => (
            <div key={id}>
              <dt className="font-semibold">{title}</dt>
              <dd className="mt-1">{displayText(candidate.life_scenarios[id])}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className={styles.chapter} aria-labelledby="e105-plan">
        <header className={styles.chapterHeader}><h2 id="e105-plan">{label("行动计划", "Action plan")}</h2></header>
        <ol className="m-5 grid gap-4 border-s border-emerald-900/25 ps-5">
          {assets.plan.map((stage, index) => (
            <li key={stage.period} className="relative rounded-lg border border-emerald-900/15 p-4">
              <span className="absolute top-4 -start-8 grid size-6 place-items-center rounded-full bg-emerald-800 text-xs text-white">{index + 1}</span>
              <div className="flex flex-wrap justify-between gap-x-4 text-sm">
                <strong>{displayText(stage.period)}</strong>
                <span>{displayText(stage.duration)}</span>
              </div>
              <h3 className="mt-2 font-semibold">{displayText(stage.title)}</h3>
              <p className="mt-1">{displayText(stage.body)}</p>
              {index === 3 ? <p className="mt-2">{displayText(candidate.practice_experiment)}</p> : null}
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.chapter} aria-labelledby="e105-science">
        <header className={styles.chapterHeader}><h2 id="e105-science">{label("科学依据", "Evidence and scoring")}</h2></header>
        <div className="grid gap-4 p-5">
          {assets.science.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{displayText(item.title)}</h3>
              <p className="mt-1">{displayText(item.body)}</p>
            </div>
          ))}
          {assets.science_sources.map((url) => <a key={url} className="underline underline-offset-2" href={url}>{label("阅读系统综述", "Read the systematic review")}</a>)}
        </div>
      </section>
      <section className={`${styles.chapter} grid items-center gap-5 p-5 sm:grid-cols-[1fr_3fr]`} aria-labelledby="e105-ai">
        <Image className="mx-auto w-36" src="/images/enneagram-report-reflection.webp" width={192} height={192} alt="" />
        <div className="grid gap-3">
          <h2 id="e105-ai" className="text-xl font-semibold">{label("和 AI 继续探索", "Continue exploring with AI")}</h2>
          <p className="whitespace-pre-wrap">{prompt}</p>
          <button className="w-fit rounded-lg bg-emerald-800 px-4 py-2 text-white" type="button" onClick={copyPrompt}>{label("复制提示词", "Copy prompt")}</button>
          <p role="status">
            {copyState === "copied" ? label("已复制", "Copied") : copyState === "failed" ? label("请选中上方文字手动复制。", "Select the text above to copy it manually.") : null}
          </p>
        </div>
      </section>
    </div>
  );
}
