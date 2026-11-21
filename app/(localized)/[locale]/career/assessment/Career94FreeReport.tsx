"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { RiasecReadingReport } from "@/components/result/riasec/RiasecReadingReport";
import { ResultExportPanel } from "@/components/result-export/ResultExportPanel";
import { buildRiasecResultExportFromViewModel } from "@/lib/riasec/exportAdapter";
import { getCareer94ReportSnapshot, readCareer94FreeReport, subscribeCareer94Report } from "@/lib/career/career94ReportSession";
import { assembleRiasecResultViewModel, type RiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { ResultPreviewShare } from "@/components/commerce/ResultPreviewShare";
import { interestPreviewStory } from "@/components/commerce/interestPreviewStory";
import unlockStyles from "@/components/career/unlock-report-experience.module.css";
import { UnlockReportExperience } from "@/components/career/UnlockReportExperience";
import { careerAssessmentEndpoint, type Career94Offer } from "./career94-api";
import styles from "./CareerAssessmentResult.module.css";

export function Career94ReportView({ model, locale, sample = false, backHref }: {
  model: RiasecResultViewModel; locale: "zh" | "en"; sample?: boolean; backHref: string;
}) {
  const t = (zh: string, en: string) => locale === "zh" ? zh : en;
  return <div className={styles.readingPage}>
    <header className={styles.readingHeader}>
      <Link href={backHref}>← {sample ? t("返回职业测试", "Back to the career test") : t("返回结果概览", "Back to your overview")}</Link>
      <p className={styles.readingEyebrow}>{sample ? t("虚构作答 · 报告格式预览", "FICTIONAL RESPONSES · REPORT PREVIEW") : t("你的免费报告", "YOUR FREE REPORT")}</p>
      <p>{sample ? t("以下使用虚构作答展示兴趣报告的结构。它不是你的测试结果，也不代表已购买报告。", "This fictional response profile demonstrates the interest report. It is not your assessment result or a purchased report.")
        : t("查看本次六维兴趣、职业候选与探索建议。", "Explore your six interest dimensions, career options and next steps.")}</p>
      {sample && <Link className={styles.readingCta} href={`/${locale}/career/assessment/take`}>{t("开始我的免费职业测试", "Take my free career test")} →</Link>}
    </header>
    <RiasecReadingReport viewModel={model} locale={locale} actions={null} reportTitle={sample ? t("职业兴趣报告示例", "Sample career interest report") : undefined} />
    {!sample && <ResultExportPanel projection={buildRiasecResultExportFromViewModel(model, locale)} locale={locale} />}
  </div>;
}

export function Career94FreeReport({ locale, sample = false, overview = false, designPreview = false }: { locale: "zh" | "en"; sample?: boolean; overview?: boolean; designPreview?: boolean }) {
  const [sampleModel, setModel] = useState<RiasecResultViewModel>();
  const [offers, setOffers] = useState<Career94Offer[]>([]);
  const snapshot = useSyncExternalStore(subscribeCareer94Report, getCareer94ReportSnapshot, () => null);
  const storedModel = useMemo(() => readCareer94FreeReport(locale, snapshot), [locale, snapshot]);
  const model = sample ? sampleModel : storedModel;
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const t = (zh: string, en: string) => locale === "zh" ? zh : en;
  useEffect(() => {
    const abort = new AbortController();
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]);
    if (!sample) return () => abort.abort();
    async function loadSample() {
      const response = await fetch(`${careerAssessmentEndpoint}/questions`, { signal, credentials: "omit", cache: "no-store" });
      if (!response.ok) throw new Error("SAMPLE_UNAVAILABLE");
      const questionnaire = await response.json() as { form_version: string; items: { id: string; section: string; axis: string; reverse?: boolean }[] };
      if (questionnaire.form_version !== "career_v1" || questionnaire.items.length !== 94) throw new Error("SAMPLE_UNAVAILABLE");
      const interests: Record<string, number> = { R: 4, I: 5, A: 3, S: 2, E: 2, C: 3 };
      const answers = Object.fromEntries(questionnaire.items.map(item => {
        const value = item.section === "context" ? null : item.section === "interest" ? interests[item.axis] : 3;
        return [item.id, value !== null && item.reverse ? 6 - value : value];
      }));
      // The native, non-persisting scorer supplies the actual report projection.
      const scored = await fetch(`${careerAssessmentEndpoint}/score`, { method: "POST", signal, credentials: "omit", cache: "no-store",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ form_version: "career_v1", answers, include_report: true, locale }) });
      if (!scored.ok) throw new Error("SAMPLE_UNAVAILABLE");
      const payload = await scored.json();
      if (!payload.riasec_public_projection_v2) throw new Error("SAMPLE_UNAVAILABLE");
      if (!abort.signal.aborted) { setModel(assembleRiasecResultViewModel(payload, locale)); setOffers(payload.purchase_offers ?? []); }
    }
    void loadSample().catch(() => { if (!abort.signal.aborted) setFailed(true); });
    return () => abort.abort();
  }, [locale, sample, retry]);

  if (model && overview) return <>
    {!designPreview && <aside className={styles.previewBanner}>{t("本地设计预览 · 虚构作答 · 支付按钮不可用，不会创建订单", "Local design preview · Fictional responses · Payments are disabled; no orders are created")}</aside>}
    <UnlockReportExperience model={model} locale={locale} assessment="career94" designPreview={designPreview && sample} sampleHref={`/${locale}/career/assessment/sample`} purchase={
      <div className={styles.purchase}>{offers.map(offer => <button type="button" disabled className={styles.cta} key={`${offer.provider}:${offer.currency}`}>
        {offer.provider === "alipay" ? t("支付宝", "Alipay") : offer.currency === "CNY" ? t("微信支付", "WeChat Pay") : t("海外银行卡", "International card")} · {offer.currency === "CNY" ? "¥" : "US$"}{(offer.amount_cents / 100).toFixed(2)}
      </button>)}<p>{t("一次付款，解锁本次完整报告。", "One payment unlocks this full report.")}</p></div>
    } />
    {designPreview && sample && <div className={unlockStyles.previewExplore}>
      <ResultPreviewShare name={t("职业测试", "Career assessment")} locale={locale}
        samplePath={`/${locale}/career/assessment/sample`} highlight="" story={interestPreviewStory(model, locale)} />
    </div>}
  </>;
  if (model) return <Career94ReportView model={model} locale={locale} sample={sample} backHref={`/${locale}/career/assessment${sample ? "" : "/take"}`} />;
  const unavailable = failed || !sample;
  return <div className={styles.readingEmpty}>
    <p role={unavailable ? "alert" : "status"}>{unavailable
      ? sample ? t("示例报告暂时无法加载。", "The sample report is temporarily unavailable.") : t("此浏览器标签页中没有可读取的结果，或保留时间已过。请返回测试结果概览重新打开。", "No result is available in this browser tab, or it has expired. Open this page again from your result overview.")
      : t("正在加载报告…", "Loading the report…")}</p>
    {failed && sample && <button type="button" onClick={() => { setFailed(false); setRetry(value => value + 1); }}>{t("重试", "Retry")}</button>}
    <Link href={`/${locale}/career/assessment${sample ? "" : "/take"}`}>{t("返回职业测试", "Back to the career test")}</Link>
  </div>;
}
