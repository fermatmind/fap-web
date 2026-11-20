"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BarChart3, BriefcaseBusiness, FileText, Sparkles } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { InterestRadar } from "@/components/result/riasec/RiasecReadingReport";
import { rankRiasecCareers } from "@/lib/career/riasecProfileMatch";
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

export function CareerAssessmentResult({ model, locale, displayLocale = locale, assessment = "career94", sampleHref, onReview, purchase, premium }: {
  model: RiasecResultViewModel;
  locale: "zh" | "en";
  displayLocale?: DisplayLocale;
  assessment?: "career94" | "riasec60";
  sampleHref?: string;
  onReview?: () => void;
  purchase?: ReactNode;
  premium?: Career94Premium;
}) {
  const [traditional, setTraditional] = useState<((source: string) => string) | "failed" | null>(null);
  useEffect(() => {
    if (displayLocale !== "zh-TW") return;
    let active = true;
    void loadTraditionalAssessmentText().then(convert => { if (active) setTraditional(() => convert); })
      .catch(() => { if (active) setTraditional("failed"); });
    return () => { active = false; };
  }, [displayLocale]);
  const t = (zh: string, en: string) => locale === "en" ? en : typeof traditional === "function" ? traditional(zh) : zh;
  const holland = assessment === "riasec60";
  const reportTitle = holland ? t("霍兰德职业兴趣深度报告", "Holland career interest deep report") : t("职业深度报告", "Career deep report");
  const modules = holland ? reportModules.map(row => row[0] === BarChart3
    ? [BarChart3, "RIASEC 六维兴趣解读", "RIASEC interest breakdown"] as const : row) : reportModules;
  const [selected, setSelected] = useState(model.primaryType);
  const dimensionDetailId = useId();
  const canReadDimensions = getRiasecModuleVisibility(model, "six_dimension_map") !== "hidden";
  const dimensions = canReadDimensions ? model.dimensions : [];
  const isTied = (model.interpretationState?.tieDisplay?.dimensions ?? []).includes(model.primaryType);
  const leading = dimensions.find(dimension => dimension.code === model.primaryType && dimension.scoreAvailable);
  const title = leading && !isTied
    ? leading.label
    : t("你的职业兴趣轮廓", "Your career interest profile");
  const tiedLabels = (model.interpretationState?.tieDisplay?.dimensions ?? []).map(code => dimensions.find(d => d.code === code)?.label ?? code);
  const active = dimensions.find(dimension => dimension.code === selected) ?? leading ?? dimensions[0];
  const explanations = getRenderableRiasecDeepContentSlots(model).filter(slot =>
    slot.slotKey === "dimension_deep_copy" && slot.selection?.dimensionCode === active?.code &&
    getRiasecModuleVisibility(model, slot.moduleKey) !== "hidden");
  const explanation = explanations[0]?.content.summary;
  const rankedJobs = canReadDimensions && model.scoreKind === "dimension_scores_0_100"
    ? rankRiasecCareers(dimensions, displayLocale).jobs.slice(0, 8)
    : [];
  const jobs = rankedJobs.slice(0, 3);
  const art = leading && !isTied && portraits[leading.code] ? portraits[leading.code] : "ai-career-interests";

  if (displayLocale === "zh-TW" && !traditional) return <p role="status">正在載入繁體預覽…</p>;
  if (displayLocale === "zh-TW" && traditional === "failed") return <p role="alert">繁體顯示暫時無法載入，請重新整理。</p>;

  return <>
    <div className={styles.result} data-testid="career-assessment-result">
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{holland ? t("霍兰德职业兴趣测试 · 60 题", "Holland Career Interest Test · 60 questions") : t("费马职业测试 · 94 题", "FermatMind Career Assessment · 94 questions")}</p>
          <h1>{title}</h1>
          <Image src={`/images/riasec/${art}.webp`} width={340} height={340} sizes="(max-width: 600px) 65vw, 340px" alt="" className={styles.portrait} />
          <p>{tiedLabels.length > 1 ? `${tiedLabels.join(" / ")} · ` : ""}{model.resultSummary?.tieNote || model.interpretationState?.tieDisplay?.note ||
            t("从本次答卷看，你更愿意尝试哪些工作活动？", "Which work activities did this assessment suggest you might want to try?")}</p>
          {model.topCode && canReadDimensions && <section className={styles.topCode} aria-label={t("本次霍兰德兴趣代码", "Your Holland interest code")}>
            <p>{t("你的霍兰德兴趣代码", "Your Holland interest code")}</p>
            <strong className={styles.code}>{model.topCode}</strong>
            <ul>{model.topCode.split("").map((code, index) => <li key={`${code}-${index}`}><span aria-hidden>{code}</span>{dimensions.find(d => d.code === code)?.label ?? code}</li>)}</ul>
          </section>}
          {onReview && <button type="button" className={styles.textButton} onClick={onReview}>{t("回看答卷", "Review answers")}</button>}
        </header>

        {dimensions.length > 0 ? <section className={styles.section} aria-label={t("六维兴趣", "Six interest dimensions")}>
          <div className={styles.sectionHeading}><p>{t("兴趣地图", "YOUR INTEREST MAP")}</p><h2>{t("你更愿意投入哪些工作活动？", "Which work activities draw you in?")}</h2></div>
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
          <div className={styles.sectionHeading}><p>{t("值得探索的方向", "DIRECTIONS TO EXPLORE")}</p><h2>{t("从兴趣走向真实的工作", "Connect your interests to real work")}</h2></div>
          <p>{t("根据六维兴趣分布，从美国 O*NET 职业资料中选出。", "Selected by comparing your six interest scores with U.S. O*NET occupational profiles.")}</p>
          <ol className={styles.jobs}>
            {jobs.map(job => <li key={job.slug}>
              <Link href={displayNavigationPath(`/career/jobs/${job.slug}`, displayLocale)}><strong>{job.name}</strong><span aria-hidden="true">↗</span></Link>
              <p>{job.summary}</p>
            </li>)}
          </ol>
        </section> : null}

        {premium ? <section className={styles.premium} aria-label={t("已解锁的职业深度报告", "Unlocked career report")}>
          <h2>{reportTitle}</h2>
          {rankedJobs.length > 0 && <>
            <h3>{t("职业候选与岗位对比", "Compare your career shortlist")}</h3>
            <ol className={styles.jobs}>{rankedJobs.map(job => <li key={job.slug}>
              <Link href={displayNavigationPath(`/career/jobs/${job.slug}`, displayLocale)}>{job.name}</Link><p>{job.summary}</p>
            </li>)}</ol>
          </>}
          <h3>{t("六维兴趣解读", "Interest breakdown")}</h3>
          <dl>{premium.dimensions.map(row => <div key={row.label}><dt>{row.label} · {Math.round(row.score)}</dt><dd>{row.detail}</dd></div>)}</dl>
          {premium.preferences.length > 0 && <>
            <h3>{t("工作方式与条件", "Work preferences and conditions")}</h3>
            <dl>{premium.preferences.map(row => <div key={row.label}><dt>{row.label} · {Math.round(row.score)}</dt><dd>{row.detail}</dd></div>)}</dl>
          </>}
          <p>{premium.condition_note}</p>
          <h3>{holland ? t("职业探索行动计划", "Career exploration action plan") : t("七天职业行动计划", "Seven-day career action plan")}</h3>
          <ol className={styles.actions}>{premium.actions.map(action => <li key={action}>{action}</li>)}</ol>
          <h3>{t("AI 职业探索提示词", "AI career exploration prompt")}</h3>
          <p>{premium.ai_prompt}</p>
          <button type="button" className={styles.cta} onClick={() => window.print()}>{t("打印或保存为 PDF", "Print or save as PDF")}</button>
        </section> : <>
        <section id={holland ? "riasec60-paywall" : "career94-paywall"} className={styles.offer} aria-label={reportTitle}>
          <h2>{reportTitle}</h2>
          <p>{t("把职业兴趣变成可以验证的方向。", "Turn your interests into career directions you can test.")}</p>
          <ul>{modules.map(([Icon, cn, en]) => <li key={en}><Icon aria-hidden="true" size={23} /><span>{t(cn, en)}</span></li>)}</ul>
          {purchase || <p className={styles.status}>{t("深度报告预览 · 暂未开放购买", "Deep report preview · Purchase unavailable")}</p>}
          <Link className={styles.sampleLink} href={sampleHref ?? `/${locale}/career/assessment/sample`} target="_blank" rel="noopener">{t("查看示例报告", "View sample report")} <ArrowUpRight size={14} aria-hidden /></Link>
        </section>

        </>}

      </div>
    </div>
  </>;
}
