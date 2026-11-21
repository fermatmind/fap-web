"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, BarChart3, BriefcaseBusiness, Check, ChevronDown, Copy, FileText, LockKeyhole, Sparkles } from "lucide-react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import { rankRiasecCareers } from "@/lib/career/riasecProfileMatch";
import { getRiasecModuleVisibility, getRenderableRiasecDeepContentSlots, type RiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { interestPreviewArt } from "@/components/commerce/interestPreviewStory";
import { ResultPreviewChapters } from "@/components/commerce/ResultPreviewChapters";
import { InterestRadar } from "@/components/result/riasec/RiasecReadingReport";
import type { Career94Premium } from "@/app/(localized)/[locale]/career/assessment/career94-api";
import styles from "./unlock-report-experience.module.css";

export type UnlockDimensionReading = { code: string; label: string; score: number; reading: string; examples: string[]; nextStep: string; nextSteps?: string[] };
const firstSentence = (copy?: string) => copy?.split(/(?<=[。！？])|(?<=[.!?])\s+/u).find(Boolean);

/** Shared presentation for unlock pages. Full sample reports use the actual reading renderer. */
export function UnlockReportExperience({ model, locale, assessment = "riasec60", premium, readings = [], chainReading, purchase, sampleHref, designPreview = false }: {
  model: RiasecResultViewModel; locale: DisplayLocale; assessment?: "riasec60" | "career94";
  premium?: Career94Premium; readings?: UnlockDimensionReading[]; chainReading?: string; purchase?: ReactNode; sampleHref: string; designPreview?: boolean;
}) {
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const previewPayments = designPreview ? (
    <div className="grid gap-3" data-testid="career-interest-preview-payment">
      <p>{t("本地示例 · 支付已停用", "本機示例 · 付款已停用", "Local sample · Payments disabled")}</p>
      {[
        t("微信支付 · ¥2.99", "微信支付 · ¥2.99", "WeChat Pay · ¥2.99"),
        t("支付宝 · ¥2.99", "支付寶 · ¥2.99", "Alipay · ¥2.99"),
        t("海外银行卡 · US$2.99", "海外銀行卡 · US$2.99", "International card · US$2.99"),
      ].map(label => <button key={label} type="button" disabled>{label}</button>)}
      <p>{t("一次付款，解锁本次完整报告。", "一次付款，解鎖本次完整報告。", "One payment unlocks this full report.")}</p>
      <p><Link className="underline" href={displayNavigationPath("/help/payment-refund", locale)}>{t("付款与退款说明", "付款與退款說明", "Payment and refund information")}</Link></p>
    </div>
  ) : undefined;
  const [selectedDimension, setSelectedDimension] = useState(model.primaryType);
  const [comparison, setComparison] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const full = Boolean(premium);
  const holland = assessment === "riasec60";
  const visible = getRiasecModuleVisibility(model, "six_dimension_map") !== "hidden";
  const dimensions = visible ? model.dimensions : [];
  const tied = model.interpretationState?.tieDisplay?.dimensions ?? [];
  const leadTied = tied.includes(model.primaryType);
  const lead = dimensions.find(row => row.code === model.primaryType && row.scoreAvailable);
  const title = lead && !leadTied ? lead.label : t("你的职业兴趣轮廓", "你的職業興趣輪廓", "Your career interest profile");
  const primaryReading = readings.find(row => row.code === model.primaryType);
  const slotSummary = getRenderableRiasecDeepContentSlots(model).find(slot => slot.slotKey === "dimension_deep_copy" && slot.selection?.dimensionCode === model.primaryType)?.content.summary;
  const insight = firstSentence(primaryReading?.reading ?? (typeof slotSummary === "string" ? slotSummary : undefined));
  const reportTitle = holland ? t("霍兰德职业兴趣深度报告", "霍蘭德職業興趣深度報告", "Holland career interest deep report") : t("职业深度报告", "職業深度報告", "Career deep report");
  const jobs = visible && model.scoreKind === "dimension_scores_0_100" ? rankRiasecCareers(dimensions, locale).jobs : [];
  const selectedJobs = jobs.filter(job => comparison.includes(job.slug));
  const activeDimension = dimensions.find(row => row.code === selectedDimension);
  const modules = [
    { Icon: BriefcaseBusiness, title: t("职业候选与岗位对比", "職業候選與職務比較", "Career shortlist and comparisons"), body: t("看日常任务，比一比哪些方向值得继续了解。", "看看日常任務，比較哪些方向值得繼續了解。", "Look beyond job titles and compare the work behind them.") },
    { Icon: BarChart3, title: holland ? t("RIASEC 六维兴趣解读", "RIASEC 六維興趣解讀", "RIASEC interest breakdown") : t("六维兴趣与工作偏好解读", "六維興趣與工作偏好解讀", "Interest and work preference breakdown"), body: t("把分数放回具体情境，看清你更愿意投入的活动。", "把分數放回具體情境，看清你更願意投入的活動。", "Understand your scores through concrete work activities.") },
    { Icon: Sparkles, title: t("AI 职业探索提示词", "AI 職業探索提示詞", "AI prompts for career exploration"), body: t("带着自己的兴趣线索，继续追问真实工作。", "帶著自己的興趣線索，繼續追問真實工作。", "Continue exploring with a prompt grounded in your interests.") },
    { Icon: FileText, title: t("职业行动计划与 PDF", "職業行動計畫與 PDF", "Career action plan and PDF"), body: t("带走下一步验证任务，打印或保存这份报告。", "帶走下一步驗證任務，列印或儲存這份報告。", "Leave with a practical next step and a report you can save.") },
  ];
  async function copyPrompt() {
    if (!premium) return;
    try { await navigator.clipboard.writeText(premium.ai_prompt); setCopyState("copied"); }
    catch { setCopyState("failed"); }
  }
  function compare(slug: string) {
    setComparison(current => current.includes(slug) ? current.filter(id => id !== slug) : current.length < 2 ? [...current, slug] : current);
  }

  return <div className={`${styles.page} ${full ? styles.full : styles.locked}`} data-testid="unlock-report-experience">
    <div className={styles.shell}>
      {full && <p className={styles.sampleNotice}>{t("示例报告 · 以下使用虚构分数展示报告结构，你的报告将根据自己的作答生成。", "示例報告 · 以下使用虛構分數展示報告結構，你的報告將根據自己的作答產生。", "Sample report · This fictional profile shows the report structure. Your report will reflect your own responses.")}</p>}
      <header className={designPreview ? `${styles.hero} ${styles.traitResultHero}` : styles.hero}>
        <div className={styles.heroCopy}>
          {!designPreview && <p className={styles.eyebrow}>{holland ? t("霍兰德职业兴趣测试 · 60 题", "霍蘭德職業興趣測試 · 60 題", "Holland Career Interest Test · 60 questions") : t("费马职业测试 · 94 题", "費馬職業測試 · 94 題", "FermatMind Career Assessment · 94 questions")}</p>}
          <p className={styles.sectionLabel}>{t("你的兴趣重点", "你的興趣重點", "YOUR INTEREST FOCUS")}</p>
          <h1>{title}</h1>
          <p className={styles.type}>{designPreview ? `RIASEC · ${model.topCode}` : lead && !leadTied ? `RIASEC · ${lead.code}` : model.topCode}</p>
          <p className={styles.heroLine}>{leadTied ? model.interpretationState?.tieDisplay?.note : insight ?? t("从兴趣出发，看看哪些工作活动值得亲自试一试。", "從興趣出發，看看哪些工作活動值得親自試一試。", "Start with your interests. Find work activities worth trying.")}</p>
          {full ? <span className={styles.reportBadge}><Sparkles size={14} />{t("完整报告示例", "完整報告示例", "FULL REPORT SAMPLE")}</span>
            : <a className={styles.heroCta} href="#unlock-purchase">{t("探索我的完整报告", "探索我的完整報告", "Explore my full report")}<ArrowDown size={17} /></a>}
        </div>
        <div className={styles.art} aria-hidden="true"><Image src={interestPreviewArt(!leadTied ? lead?.code : undefined)} width={400} height={400} sizes="(max-width: 640px) 72vw, 370px" alt="" priority /></div>
      </header>

      {!full && model.topCode && visible && <section className={styles.codePanel} aria-label={t("本次霍兰德兴趣代码", "本次霍蘭德興趣代碼", "Your Holland interest code")}>
        <p>{t("你的霍兰德兴趣代码", "你的霍蘭德興趣代碼", "YOUR HOLLAND INTEREST CODE")}</p><strong>{model.topCode}</strong>
        <ul>{model.topCode.split("").map((code, index) => <li key={`${code}-${index}`}><span>{code}</span>{dimensions.find(row => row.code === code)?.label ?? code}</li>)}</ul>
        <small>{t("兴趣是探索的起点。下一步，看看它在真实工作中意味着什么。", "興趣是探索的起點。下一步，看看它在真實工作中意味著什麼。", "Interests are a starting point. Next, explore what they mean in real work.")}</small>
      </section>}

      {full && primaryReading && <section className={styles.analysis} aria-label={t("主要兴趣解读", "主要興趣解讀", "Primary interest reading")}>
        <p className={styles.sectionLabel}>{t("从作答到日常活动", "從作答到日常活動", "FROM ANSWERS TO EVERYDAY ACTIVITIES")}</p>
        <h2>{t("看见兴趣在工作中的样子", "看見興趣在工作中的樣子", "See your interests in everyday work")}</h2>
        <p>{chainReading ?? primaryReading.reading}</p>
        {primaryReading.examples.length > 0 && <><h3>{t("值得试试的活动", "值得試試的活動", "Activities worth trying")}</h3><ul className={styles.activityList}>{primaryReading.examples.map(example => <li key={example}><Check size={17} />{example}</li>)}</ul></>}
        <div className={styles.nextQuestion}><span>{t("带着这个问题看岗位", "帶著這個問題看職務", "A QUESTION TO TAKE INTO YOUR SEARCH")}</span><p>{primaryReading.nextStep}</p></div>
      </section>}

      {full && <nav className={styles.chapterNav} aria-label={t("报告章节", "報告章節", "Report chapters")}>
        {[["unlock-interests", t("兴趣解读", "興趣解讀", "Interests")], ["unlock-careers", t("职业探索", "職業探索", "Careers")], ["unlock-plan", t("行动计划", "行動計畫", "Action plan")], ["unlock-ai", t("AI 探索", "AI 探索", "AI exploration")]].map(([id, label]) => <a key={id} href={`#${id}`}>{label}<ArrowDown size={12} /></a>)}
      </nav>}

      {dimensions.length > 0 && <section id="unlock-interests" className={styles.section} aria-label={t("六维兴趣", "六維興趣", "Six interest dimensions")}>
        <div className={styles.sectionHeading}><span>01</span><div><p>{t("你的兴趣地图", "你的興趣地圖", "YOUR INTEREST MAP")}</p><h2>{t("哪些活动，让你更想投入？", "哪些活動，讓你更想投入？", "Which activities draw you in?")}</h2></div></div>
        <div className={styles.chart}><InterestRadar dimensions={dimensions} theme="dark" /><div className={styles.scores}>{dimensions.map(row => <button key={row.code} type="button" aria-pressed={selectedDimension === row.code} onClick={() => setSelectedDimension(row.code)}><span>{row.code} · {row.label}</span><strong>{Math.round(row.score)}</strong><span className={styles.track} aria-hidden><i style={{width:`${row.score}%`}} /></span></button>)}</div></div>
        {designPreview && activeDimension?.scoreAvailable && <div className={styles.previewSummary}>
          <div className={styles.traitScoreCallout}>
            {t("当前查看", "目前檢視", "Viewing")}
            <strong>{activeDimension.label} {Math.round(activeDimension.score)} / 100</strong>
          </div>
        </div>}
        <p className={styles.scoreNote}>{activeDimension?.label} · {t("0–100 为本次作答的兴趣维度分。", "0–100 為本次作答的興趣維度分。", "0–100 describes interest reported in this assessment.")}</p>
        {premium && <div className={styles.dimensionReadings}>{premium.dimensions.map((row, index) => { const detail = readings.find(reading => reading.label === row.label); return <details key={row.label} open><summary><span><b>{detail?.code ?? String(index + 1).padStart(2,"0")}</b>{row.label}</span><span>{Math.round(row.score)}<ChevronDown size={17}/></span></summary><div className={styles.readingBody}><p>{row.detail}</p>{detail?.examples.length ? <ul className={styles.activityList}>{detail.examples.map(example => <li key={example}><Check size={15}/>{example}</li>)}</ul> : null}{detail?.nextStep && <div className={styles.nextQuestion}><span>{t("下一步", "下一步", "NEXT STEPS")}</span><ul>{(detail.nextSteps?.length ? detail.nextSteps : [detail.nextStep]).map(step => <li key={step}>{step}</li>)}</ul></div>}</div></details>; })}</div>}
        {full && chainReading && !primaryReading && <div className={styles.combination}><p className={styles.sectionLabel}>{model.topCode} · {t("把三个兴趣一起看", "把三個興趣一起看", "READ YOUR THREE INTERESTS TOGETHER")}</p><p>{chainReading}</p></div>}
      </section>}

      {premium ? <>
        <section id="unlock-careers" className={styles.section} aria-label={t("职业候选", "職業候選", "Careers to explore")}>
          <div className={styles.sectionHeading}><span>02</span><div><p>{t("把兴趣带进真实工作", "把興趣帶進真實工作", "CONNECT INTERESTS TO REAL WORK")}</p><h2>{t("哪些职业，值得进一步了解？", "哪些職業，值得進一步了解？", "Which careers are worth a closer look?")}</h2></div></div>
          <p className={styles.muted}>{t("根据六维兴趣分布，与美国 O*NET 职业兴趣资料比较选出。可以选择两个候选并排阅读。", "根據六維興趣分布，與美國 O*NET 職業興趣資料比較選出。可以選擇兩個候選並排閱讀。", "Selected by comparing six interest scores with U.S. O*NET occupational profiles. Select two to read side by side.")}</p>
          {jobs.length > 0 ? <ol className={styles.careerList}>{jobs.map((job, index) => <li key={job.slug}><span className={styles.jobNumber}>{String(index+1).padStart(2,"0")}</span><div><h3><Link href={displayNavigationPath(`/career/jobs/${job.slug}`,locale)}>{job.name}<ArrowUpRight size={16}/></Link></h3><p>{job.summary}</p><label><input type="checkbox" checked={comparison.includes(job.slug)} disabled={comparison.length===2&&!comparison.includes(job.slug)} onChange={()=>compare(job.slug)}/>{t("加入比较", "加入比較", "Compare")}</label></div></li>)}</ol> : <p className={styles.muted}>{t("本示例暂无可展示的职业候选。", "本示例暫無可展示的職業候選。", "No career shortlist is available for this sample.")}</p>}
          {selectedJobs.length===2 && <div className={styles.compare} role="region" aria-label={t("职业并排比较", "職業並排比較", "Career comparison")}>{selectedJobs.map(job=><article key={job.slug}><h3>{job.name}</h3><p>{job.summary}</p><Link href={displayNavigationPath(`/career/jobs/${job.slug}`,locale)}>{t("查看职业档案", "查看職業檔案", "Read career profile")}<ArrowUpRight size={14}/></Link></article>)}</div>}
        </section>
        {premium.preferences.length>0 && <section className={styles.section}><div className={styles.sectionHeading}><span>+</span><h2>{t("工作方式与条件", "工作方式與條件", "Work preferences and conditions")}</h2></div><dl className={styles.preferenceList}>{premium.preferences.map(row=><div key={row.label}><dt>{row.label} · {Math.round(row.score)}</dt><dd>{row.detail}</dd></div>)}</dl></section>}
        <section id="unlock-plan" className={styles.section}><div className={styles.sectionHeading}><span>03</span><div><p>{t("把方向变成一次尝试", "把方向變成一次嘗試", "TURN A DIRECTION INTO AN EXPERIMENT")}</p><h2>{t("下一步，可以从这里开始", "下一步，可以從這裡開始", "A practical place to start")}</h2></div></div><ol className={styles.plan}>{premium.actions.map((action,index)=><li key={action}><span>{String(index+1).padStart(2,"0")}</span><p>{action}</p></li>)}</ol></section>
        <section id="unlock-ai" className={styles.prompt}><div className={styles.promptHeading}><Sparkles size={24}/><h2>{t("带着报告，继续探索", "帶著報告，繼續探索", "Take your report into the next conversation")}</h2></div><p className={styles.muted}>{t("复制这段提示词，在你使用的 AI 工具中继续讨论。", "複製這段提示詞，在你使用的 AI 工具中繼續討論。", "Copy this prompt into the AI tool you use to continue exploring.")}</p><blockquote>{premium.ai_prompt}</blockquote><button type="button" className={styles.secondaryButton} onClick={()=>void copyPrompt()}><Copy size={16}/>{copyState==="copied" ? t("已复制", "已複製", "Copied") : copyState==="failed" ? t("复制失败，请重试", "複製失敗，請重試", "Copy failed — retry") : t("复制提示词", "複製提示詞", "Copy prompt")}</button><span role="status" className={styles.srOnly}>{copyState==="copied" ? t("提示词已复制", "提示詞已複製", "Prompt copied") : ""}</span></section>
        <footer className={styles.reportFooter}><FileText size={28}/><h2>{t("把这份探索，留给下一步", "把這份探索，留給下一步", "Keep your next step within reach")}</h2><p>{t("打印或保存 PDF，带着问题去了解真实工作。", "列印或儲存 PDF，帶著問題去了解真實工作。", "Print or save a PDF, then take your questions into real conversations.")}</p><button type="button" className={styles.primaryButton} onClick={()=>window.print()}>{t("打印或保存为 PDF", "列印或儲存為 PDF", "Print or save as PDF")}<ArrowRight size={17}/></button><p className={styles.boundary}>{premium.condition_note}</p></footer>
      </> : <>
      {designPreview && <ResultPreviewChapters locale={locale} offerId="unlock-purchase" jobs={jobs} insights={[
        t("挑一类你愿意多花时间的活动，找一项真实工作里的类似任务。", "挑一類你願意多花時間的活動，找一項真實工作裡的類似任務。", "Pick an activity you would spend more time on and look for a comparable task at work."),
        t("比较同一任务在不同环境中的感受，再决定要不要继续探索。", "比較同一任務在不同環境中的感受，再決定要不要繼續探索。", "Compare how the same task feels in different settings before deciding what to explore next."),
      ]} />}
      <section id="unlock-purchase" className={styles.offer} aria-label={reportTitle}>
        <div className={styles.offerIcon}><LockKeyhole size={23}/></div><p className={styles.eyebrow}>{t("从兴趣线索，到下一步行动", "從興趣線索，到下一步行動", "FROM INTERESTS TO YOUR NEXT STEP")}</p><h2>{reportTitle}</h2><p className={styles.offerIntro}>{t("看懂自己的兴趣，也看清值得验证的职业方向。", "看懂自己的興趣，也看清值得驗證的職業方向。", "Understand your interests and find career directions you can put to the test.")}</p>
        <ul className={styles.benefits}>{modules.map(({Icon,title,body})=><li key={title}><Icon size={23}/><div><strong>{title}</strong><p>{body}</p></div></li>)}</ul>
        <div className={styles.purchaseSlot}>{previewPayments ?? purchase ?? <p>{t("购买暂未开放", "購買暫未開放", "Purchase is not yet available")}</p>}</div>
        <Link className={styles.sampleLink} href={sampleHref} target="_blank" rel="noopener">{t("查看完整示例报告", "查看完整示例報告", "View the full sample report")}<ArrowUpRight size={14}/></Link>
      </section></>}
    </div>
  </div>;
}
