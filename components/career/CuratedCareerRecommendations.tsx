"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CuratedCareer } from "@/lib/career/curatedPoolSchema";
import { curatedCareerComparisonHref, recommendCuratedRiasecCareers } from "@/lib/career/curatedRiasecRecommendations";
import type { RiasecDimension } from "@/lib/riasec/resultAssembler";
import { RiasecTrialRecord } from "@/components/result/riasec/RiasecTrialRecord";
import styles from "./CuratedCareerRecommendations.module.css";

const facets = [
  ["tasks", "日常任务"],
  ["work_style", "工作方式"],
  ["work_conditions", "工作条件"],
] as const;

function CareerLink({ career, children }: { career: CuratedCareer; children: React.ReactNode }) {
  return <Link className={styles.link} href={`/zh/career/jobs/${career.slug}`}>{children}</Link>;
}

function EvidenceComparison({ careers }: { careers: CuratedCareer[] }) {
  return <section className={styles.evidence} aria-label="职业比较">
    <h3>职业比较</h3>
    <p>「已证实」表示职业资料有据可查。「待确认」的项目请对照目标岗位和雇主核实。</p>
    <div className={styles.facets}>
      {facets.map(([key, label]) => <section key={key} className={styles.facet}>
        <h4>{label}</h4>
        {careers.map(career => <div key={career.slug} className={styles.facetCareer}>
          <strong>{career.display_name_zh}</strong>
          <ul>
            {career.comparison_facets[key].map(({ text, status }) => <li key={text}>
              <span className={styles.status} data-status={status}>{status}</span>
              <span>{text}</span>
            </li>)}
          </ul>
        </div>)}
      </section>)}
    </div>
    <div className={styles.unknown}>
      <h4>还需向雇主核实的信息</h4>
      {careers.map(career => <div key={career.slug}>
        <strong>{career.display_name_zh}</strong>
        <ul>{career.comparison_facets.unknown_fields.map(field => <li key={field}>{field}</li>)}</ul>
      </div>)}
    </div>
    <Link className={styles.link} href={curatedCareerComparisonHref(careers)}>打开职业对比工具 →</Link>
  </section>;
}

function RankedCareers({ top, more, mode }: {
  top: CuratedCareer[];
  more: CuratedCareer[];
  mode: "holland" | "career94" | "preview";
}) {
  const [selected, setSelected] = useState<string[]>(() => mode === "career94" ? top.slice(0, 2).map(career => career.slug) : []);
  const [trial, setTrial] = useState<string>();
  const candidates = [...top, ...more];
  const compare = candidates.filter(career => selected.includes(career.slug));
  const trialCareer = candidates.find(career => career.slug === trial);
  const interactive = mode !== "preview";

  const card = (career: CuratedCareer) => {
    const checked = selected.includes(career.slug);
    const task = career.card_depth === "deep"
      ? career.free_task_card.typical_daily_task
      : (career.comparison_facets.tasks.find(item => item.status === "已证实")?.text.split("｜").at(-1));
    return <li className={styles.card} key={career.slug} data-scene={career.scene_cluster} data-tier={career.exposure_tier}>
      <div className={styles.cardHeading}>
        <h4><CareerLink career={career}>{career.display_name_zh}</CareerLink></h4>
        {career.exposure_tier === "specialized_track" && <span className={styles.vertical}>垂直赛道 / 特定门槛</span>}
      </div>
      {task && <p>{task}</p>}
      {interactive && <div className={styles.controls}>
        <label>
          <input type="checkbox" checked={checked} disabled={!checked && compare.length >= 2}
            aria-label={`加入比较：${career.display_name_zh}`}
            onChange={() => setSelected(previous => checked ? previous.filter(slug => slug !== career.slug) : [...previous.slice(0, 1), career.slug])} />
          加入比较
        </label>
        <button type="button" className={styles.link} aria-expanded={trial === career.slug}
          onClick={() => setTrial(trial === career.slug ? undefined : career.slug)}>记录试做</button>
      </div>}
    </li>;
  };

  return <>
    <h3>职业候选</h3>
    <p>从简中精选职业中按六维兴趣轮廓筛选，优先展示任务较常见、适合先了解的方向。</p>
    <ol className={styles.cards} data-testid="riasec-profile-careers">{top.map(card)}</ol>
    {more.length > 0 && <details className={styles.more}>
      <summary>更多高相关垂直方向（展开查看）</summary>
      <ul className={styles.cards} data-testid="curated-more-careers">{more.map(card)}</ul>
    </details>}
    {interactive && <>
      <p className={styles.selection} role="status">选择两个职业，逐项核对日常任务、工作方式和工作条件（已选 {compare.length}/2）。</p>
      {compare.length === 2 && <EvidenceComparison careers={compare} />}
      {trialCareer && <RiasecTrialRecord key={trialCareer.slug} locale="zh"
        activities={trialCareer.card_depth === "deep"
          ? [trialCareer.micro_trial.instruction]
          : trialCareer.comparison_facets.tasks.filter(item => item.status === "已证实").map(item => item.text.split("｜").at(-1) ?? item.text)}
        careerName={trialCareer.display_name_zh} />}
    </>}
  </>;
}

export function CuratedCareerRecommendations({ scores, mode, dark = false, tieLabels }: {
  scores: RiasecDimension[];
  mode: "holland" | "career94" | "preview";
  dark?: boolean;
  tieLabels?: readonly string[];
}) {
  const recommendations = useMemo(() => recommendCuratedRiasecCareers(scores), [scores]);
  return <div className={`${styles.panel}${dark ? ` ${styles.dark}` : ""}`} data-testid="riasec-career-next-steps"
    data-curated-state={recommendations.state}>
    {tieLabels && tieLabels.length > 1 && <p>分数接近的兴趣可以一起探索（{tieLabels.join("、")}）。</p>}
    {recommendations.state === "ranked" && <RankedCareers key={recommendations.top.map(career => career.slug).join("/")} {...recommendations} mode={mode} />}
    {recommendations.state === "flat" && <>
      <h3>先试做两条不同的路线</h3>
      <p>你的六维兴趣分数比较接近。分别试做，再回看哪种任务更愿意继续做。</p>
      <ol className={`${styles.cards} ${styles.routes}`} data-testid="curated-flat-routes">
        {recommendations.trials.map(route => <li className={styles.card} key={route[0].slug}>
          {route.map(career => <div className={styles.trial} key={career.slug}>
            <h4>{career.micro_trial.title}</h4>
            <p>{career.micro_trial.instruction}</p>
            <p className={styles.reflection}>{career.micro_trial.reflection_prompt}</p>
            <CareerLink career={career}>{career.display_name_zh} →</CareerLink>
          </div>)}
        </li>)}
      </ol>
    </>}
    {recommendations.state === "unavailable" && <p>本次暂未提供职业排序。你可以先浏览职业档案。</p>}
    <Link className={styles.link} href="/zh/career">浏览职业目录 →</Link>
  </div>;
}
