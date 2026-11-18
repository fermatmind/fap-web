"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, BarChart3, BriefcaseBusiness, FileText, Sparkles } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { ResultExportPanel } from "@/components/result-export/ResultExportPanel";
import { InterestRadar, RiasecReadingReport } from "@/components/result/riasec/RiasecReadingReport";
import { rankRiasecCareers } from "@/lib/career/riasecProfileMatch";
import { buildRiasecResultExportFromViewModel } from "@/lib/riasec/exportAdapter";
import {
  getRenderableRiasecDeepContentSlots,
  getRiasecModuleVisibility,
  type RiasecResultViewModel,
} from "@/lib/riasec/resultAssembler";
import type { Career94Premium } from "./career94-api";
import styles from "./CareerAssessmentResult.module.css";

const portraits: Record<string, string> = {
  R: "realistic", I: "ias-researcher", A: "artistic",
  S: "social", E: "enterprising", C: "conventional",
};

const reportModules = [
  [BriefcaseBusiness, "职业候选与岗位对比", "Career shortlist and comparisons"],
  [BarChart3, "六维兴趣与工作偏好解读", "Interest and work preference breakdown"],
  [Sparkles, "AI 职业探索提示词", "AI prompts for career exploration"],
  [FileText, "职业行动计划与 PDF", "Career action plan and PDF"],
] as const;

export function CareerAssessmentResult({ model, locale, onReview, purchase, premium }: {
  model: RiasecResultViewModel;
  locale: "zh" | "en";
  onReview?: () => void;
  purchase?: ReactNode;
  premium?: Career94Premium;
}) {
  const t = (zh: string, en: string) => locale === "zh" ? zh : en;
  const [selected, setSelected] = useState(model.primaryType);
  const dimensionDetailId = useId();
  const sample = useRef<HTMLDetailsElement>(null);
  const canReadDimensions = getRiasecModuleVisibility(model, "six_dimension_map") !== "hidden";
  const dimensions = canReadDimensions ? model.dimensions : [];
  const isTied = (model.interpretationState?.tieDisplay?.dimensions.length ?? 0) > 1;
  const leading = dimensions.find(dimension => dimension.code === model.primaryType && dimension.scoreAvailable);
  const title = leading && !isTied
    ? leading.label
    : t("你的职业兴趣轮廓", "Your career interest profile");
  const active = dimensions.find(dimension => dimension.code === selected) ?? leading ?? dimensions[0];
  const explanations = getRenderableRiasecDeepContentSlots(model).filter(slot =>
    slot.slotKey === "dimension_deep_copy" && slot.selection?.dimensionCode === active?.code &&
    getRiasecModuleVisibility(model, slot.moduleKey) !== "hidden");
  const explanation = explanations[0]?.content.summary;
  const rankedJobs = canReadDimensions && model.scoreKind === "dimension_scores_0_100"
    ? rankRiasecCareers(dimensions, locale).jobs.slice(0, 8)
    : [];
  const jobs = rankedJobs.slice(0, 3);
  const art = leading && !isTied && portraits[leading.code] ? portraits[leading.code] : "ai-career-interests";

  return <>
    <div className={styles.result} data-testid="career-assessment-result">
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{t("费马职业测试 · 94 题", "FermatMind Career Assessment · 94 questions")}</p>
          <h1>{title}</h1>
          {model.topCode && canReadDimensions ? <p className={styles.code}>{model.topCode}</p> : null}
          <Image src={`/images/riasec/${art}.webp`} width={340} height={340} sizes="(max-width: 600px) 65vw, 340px" alt="" className={styles.portrait} />
          <p>{model.resultSummary?.tieNote || model.interpretationState?.tieDisplay?.note ||
            t("从本次答卷看，你更愿意尝试哪些工作活动？", "Which work activities did this assessment suggest you might want to try?")}</p>
          {onReview && <button type="button" className={styles.textButton} onClick={onReview}>{t("回看答卷", "Review answers")}</button>}
        </header>

        {dimensions.length > 0 ? <section className={styles.section} aria-label={t("六维兴趣", "Six interest dimensions")}>
          <h2>{t("六维兴趣", "Six interest dimensions")}</h2>
          <div className={styles.chart}>
            <InterestRadar dimensions={dimensions} theme="dark" />
            <div className={styles.dimensions}>
              {dimensions.map(dimension => <button key={dimension.code} type="button" aria-pressed={active?.code === dimension.code}
                aria-controls={dimensionDetailId} onClick={() => setSelected(dimension.code)}>
                <span>{dimension.code} · {dimension.label}</span>
                <strong>{dimension.scoreAvailable ? Math.round(dimension.score) : "—"}</strong>
                <span className={styles.track} aria-hidden="true"><span style={{ width: `${dimension.scoreAvailable ? dimension.score : 0}%` }} /></span>
              </button>)}
            </div>
          </div>
          <p id={dimensionDetailId} aria-live="polite">{active && explanation
            ? `${active.label} · ${explanation}`
            : t("分数表示你在本次作答中对这类活动的兴趣程度。", "Scores describe how much interest you reported in each activity group.")}</p>
        </section> : null}

        {jobs.length > 0 ? <section className={styles.section} aria-label={t("职业候选", "Careers to explore")}>
          <h2>{t("职业候选", "Careers to explore")}</h2>
          <p>{t("根据六维兴趣分布，从美国 O*NET 职业资料中选出。", "Selected by comparing your six interest scores with U.S. O*NET occupational profiles.")}</p>
          <ol className={styles.jobs}>
            {jobs.map(job => <li key={job.slug}>
              <Link href={`/${locale}/career/jobs/${job.slug}`}><strong>{job.name}</strong><span aria-hidden="true">↗</span></Link>
              <p>{job.summary}</p>
            </li>)}
          </ol>
        </section> : null}

        {premium ? <section className={styles.premium} aria-label={t("已解锁的职业深度报告", "Unlocked career report")}>
          <h2>{t("职业深度报告", "Career deep report")}</h2>
          {rankedJobs.length > 0 && <>
            <h3>{t("职业候选与岗位对比", "Compare your career shortlist")}</h3>
            <ol className={styles.jobs}>{rankedJobs.map(job => <li key={job.slug}>
              <Link href={`/${locale}/career/jobs/${job.slug}`}>{job.name}</Link><p>{job.summary}</p>
            </li>)}</ol>
          </>}
          <h3>{t("六维兴趣解读", "Interest breakdown")}</h3>
          <dl>{premium.dimensions.map(row => <div key={row.label}><dt>{row.label} · {Math.round(row.score)}</dt><dd>{row.detail}</dd></div>)}</dl>
          {premium.preferences.length > 0 && <>
            <h3>{t("工作方式与条件", "Work preferences and conditions")}</h3>
            <dl>{premium.preferences.map(row => <div key={row.label}><dt>{row.label} · {Math.round(row.score)}</dt><dd>{row.detail}</dd></div>)}</dl>
          </>}
          <p>{premium.condition_note}</p>
          <h3>{t("七天职业行动计划", "Seven-day career action plan")}</h3>
          <ol className={styles.actions}>{premium.actions.map(action => <li key={action}>{action}</li>)}</ol>
          <h3>{t("AI 职业探索提示词", "AI career exploration prompt")}</h3>
          <p>{premium.ai_prompt}</p>
          <button type="button" className={styles.cta} onClick={() => window.print()}>{t("打印或保存为 PDF", "Print or save as PDF")}</button>
        </section> : <>
        <section className={styles.offer} aria-label={t("职业深度报告", "Career deep report")}>
          <h2>{t("职业深度报告", "Career deep report")}</h2>
          <p>{t("把职业兴趣变成可以验证的方向。", "Turn your interests into career directions you can test.")}</p>
          <ul>{reportModules.map(([Icon, cn, en]) => <li key={en}><Icon aria-hidden="true" size={23} /><span>{t(cn, en)}</span></li>)}</ul>
          <a className={styles.cta} href="#career94-sample" onClick={() => { if (sample.current) sample.current.open = true; }}>{t("查看示例报告", "View sample report")} <ArrowDown aria-hidden="true" size={18} /></a>
          {purchase || <p className={styles.status}>{t("深度报告预览 · 暂未开放购买", "Deep report preview · Purchase unavailable")}</p>}
        </section>

        <section className={styles.section} id="career94-sample" aria-label={t("报告示例", "Report sample")}>
          <details ref={sample} className={styles.sample}>
            <summary>{t("展开一份示例 · 研究型与现实型", "Open a sample · Investigative and Realistic")}</summary>
            <p>{t("示例用虚构的作答情境展示报告格式。", "This sample uses a fictional response profile to show the report format.")}</p>
            <dl>
              <dt>{t("解读", "Interpretation")}</dt><dd>{t("你可能既喜欢查清问题的原因，也喜欢用工具验证结论。比较岗位时，先找同时包含分析和实际操作的任务。", "You might enjoy both tracing a problem to its cause and using tools to test a conclusion. Start with roles that combine analysis and hands-on work.")}</dd>
              <dt>{t("岗位对比", "Compare roles")}</dt><dd>{t("对比质量检验员与实验室技术员：前者常围绕合格标准检查产品，后者常按流程准备样本并记录结果。", "Compare quality control inspectors with laboratory technicians: one checks products against standards, the other prepares samples and records results.")}</dd>
              <dt>{t("一周行动", "This week")}</dt><dd>{t("每个方向找一份当地招聘启事，标出三项日常任务，再选一项做 30 分钟小练习。", "Find one local posting per direction, highlight three daily tasks, then try one of them for 30 minutes.")}</dd>
            </dl>
          </details>
        </section>
        </>}
        <a className={styles.jump} href="#career94-free-report">{t("查看现有职业兴趣报告 ↓", "Read your career interest report ↓")}</a>
      </div>
    </div>

    <div id="career94-free-report" className={styles.currentReport}>
      <RiasecReadingReport viewModel={model} locale={locale} actions={null} />
      <ResultExportPanel projection={buildRiasecResultExportFromViewModel(model, locale)} locale={locale} />
    </div>
  </>;
}
