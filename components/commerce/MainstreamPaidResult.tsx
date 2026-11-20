"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ReportResponse, ResultResponse, RiasecPurchase } from "@/lib/api/v0_3";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { Career94Checkout } from "@/app/(localized)/[locale]/career/assessment/Career94Purchase";
import { CareerRefundPanel } from "./CareerRefundPanel";

const names: Record<string, [string, string, string]> = {
  MBTI: ["MBTI 性格", "MBTI 性格", "MBTI-style personality"],
  BIG5_OCEAN: ["大五人格", "大五人格", "Big Five personality"],
  ENNEAGRAM: ["九型人格", "九型人格", "Enneagram"],
  IQ_RAVEN: ["推理测试", "推理測試", "Reasoning test"],
  IQ_INTELLIGENCE_QUOTIENT: ["推理测试", "推理測試", "Reasoning test"],
  EQ_60: ["情商自评", "情商自評", "Emotional intelligence self-report"],
  JUNG_ARCHETYPES: ["荣格十二原型", "榮格十二原型", "Jungian archetypes"],
  JUNG_COGNITIVE_FUNCTIONS: ["荣格认知功能", "榮格認知功能", "Jungian cognitive functions"],
  DISC_BEHAVIOR: ["DISC 行为风格", "DISC 行為風格", "DISC behavioral styles"],
};
const sections: Record<string, [string, string, string][]> = {
  MBTI: [["完整偏好与类型解读", "完整偏好與型別解讀", "Full preference and type readings"], ["工作与人际关系章节", "工作與人際關係章節", "Work and relationship chapters"]],
  BIG5_OCEAN: [["五维详细解读", "五維詳細解讀", "Detailed readings of the five traits"], ["本题本已有的侧面与行动建议", "本題本現有的側面與行動建議", "Facet readings and actions available for this form"]],
  ENNEAGRAM: [["候选类型与动机解读", "候選型別與動機解讀", "Candidate types and motivation readings"], ["现有关系与成长章节", "現有關係與成長章節", "Existing relationship and growth chapters"]],
  IQ_RAVEN: [["本题本各类推理表现", "本題本各類推理表現", "Performance by reasoning category"], ["现有结果解读与报告导出", "現有結果解讀與報告匯出", "Existing result readings and report export"]],
  EQ_60: [["四维详细解释", "四維詳細解釋", "Detailed readings of the four dimensions"], ["现有交叉解读与日常练习", "現有交叉解讀與日常練習", "Existing cross-dimension readings and everyday exercises"]],
  JUNG_ARCHETYPES: [["主导、辅助与接近原型", "主導、輔助與接近原型", "Primary, secondary and nearby archetypes"], ["原型动机、盲区与协作解读", "原型動機、盲區與協作解讀", "Archetype motives, blind spots and collaboration readings"]],
  JUNG_COGNITIVE_FUNCTIONS: [["功能轴与功能栈候选", "功能軸與功能棧候選", "Function axes and stack-fit candidates"], ["现有功能解读与情境反思", "現有功能解讀與情境反思", "Existing function readings and situational reflections"]],
  DISC_BEHAVIOR: [["本次选择对应的完整解读", "本次選擇對應的完整解讀", "The complete reading for your choices"], ["现有行为例子、情境取舍与观察练习", "現有行為例子、情境取捨與觀察練習", "Existing behavior examples, contextual trade-offs and observation exercises"]],
};

export function MainstreamPaidResult({ data, purchase, locale, children }: {
  data: ResultResponse | ReportResponse; purchase: RiasecPurchase; locale: DisplayLocale; children?: ReactNode;
}) {
  const [refunded, setRefunded] = useState(false);
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const record = data as unknown as Record<string, unknown>;
  const scale = String(data.meta?.scale_code ?? record.scale_code ?? "");
  const name = names[scale] ?? [scale, scale, scale];
  const paid = purchase.unlocked && !refunded;
  const existing = purchase.order_no && purchase.payment_state !== "canceled";
  const raw = typeof record.result === "object" && record.result !== null ? record.result as Record<string, unknown> : null;
  const scores = raw && typeof raw.scores_pct === "object" && raw.scores_pct ? raw.scores_pct : {};
  const summary = raw && typeof raw.summary === "object" && raw.summary ? raw.summary as Record<string, unknown> : {};
  const metrics: Record<string, [string,string,string]> = {
    correct: ["答对题数", "答對題數", "Correct answers"], total: ["总题数", "總題數", "Total questions"],
    percent_correct: ["答题正确率", "答對率", "Answer accuracy"], duration_ms: ["用时（分钟）", "作答時間（分鐘）", "Time taken (minutes)"],
  };
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8" data-result-visible-root data-testid="mainstream-paid-result">
    {purchase.order_no && <CareerRefundPanel orderNo={purchase.order_no} locale={locale} onRefunded={() => setRefunded(true)} />}
    {paid ? children : <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 sm:p-8">
        <h1 className="text-3xl font-semibold">{t(...name)} · {t("本次基础结果", "本次基礎結果", "Your basic result")}</h1>
        {typeof raw?.type_code === "string" && <p className="mt-4 text-xl font-semibold">{String(raw.type_code)}</p>}
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">{Object.entries(scores).filter(([, value]) => typeof value === "number" && Number.isFinite(value)).map(([key, value]) => <div key={key} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2"><dt>{key}</dt><dd className="tabular-nums">{Number(value).toLocaleString(locale === "en" ? "en" : locale === "zh-TW" ? "zh-TW" : "zh-CN", { maximumFractionDigits: 1 })}</dd></div>)}</dl>
        <dl className="mt-4 grid grid-cols-2 gap-3">{Object.entries(metrics).filter(([key]) => typeof summary[key] === "number").map(([key,label]) => <div key={key}><dt>{t(...label)}</dt><dd>{Number(key === "duration_ms" ? Number(summary[key])/60000 : summary[key]).toLocaleString(locale === "en" ? "en" : "zh", {maximumFractionDigits:1})}{key === "percent_correct" ? "%" : ""}</dd></div>)}</dl>
        <p className="mt-5 text-sm leading-6 text-slate-600">{t("结果反映本次作答，请结合具体经历和测评方法说明阅读。", "結果反映本次作答，請結合具體經歷與測評方法說明閱讀。", "These results reflect this attempt. Read them alongside your experiences and the assessment’s method and limitations.")}</p>
        {scale.startsWith("IQ_") && <p className="mt-2 text-sm text-slate-600">{t("推理练习不替代专业智力评估；付费不会改变计分或常模适用范围。", "推理練習不替代專業智力評估；付費不會改變計分或常模適用範圍。", "This reasoning exercise does not replace a professional intelligence assessment. Payment does not change scoring or the applicability of norms.")}</p>}
      </section>
      <section className="mx-auto max-w-xl rounded-2xl border border-violet-300 bg-slate-950 p-6 text-white sm:p-8" aria-labelledby="paid-report-heading">
        <h2 id="paid-report-heading" className="text-center text-2xl font-semibold">{t("解锁本次完整报告", "解鎖本次完整報告", "Unlock this full report")}</h2>
        <ul className="mx-auto my-6 w-fit space-y-3">{(sections[scale === "IQ_INTELLIGENCE_QUOTIENT" ? "IQ_RAVEN" : scale] ?? []).map((copy, i) => <li key={i}>✓ {t(...copy)}</li>)}</ul>
        {existing ? <p role="status">{refunded || purchase.payment_state === "refunded" ? t("此订单已退款，付费报告访问已停止。", "此訂單已退款，付費報告存取已停止。", "This order was refunded. Access to the paid report has ended.") : t("此报告已有订单，可查看支付和退款进度。", "此報告已有訂單，可查看付款與退款進度。", "This report has an existing order. Check its payment or refund status.")}{" "}<Link className="underline" href={`/${locale}/pay/wait?order_no=${encodeURIComponent(purchase.order_no!)}`}>{t("查看订单", "查看訂單", "View order")}</Link></p>
          : purchase.offers.length ? <Career94Checkout locale={locale === "en" ? "en" : "zh"} displayLocale={locale} attemptId={purchase.attempt_id} offers={purchase.offers} />
            : <p role="status">{t("本次结果暂不提供购买，请稍后重试。", "本次結果暫不提供購買，請稍後重試。", "Purchasing is unavailable for this result. Please try again later.")}</p>}
      </section>
    </>}
  </div>;
}
