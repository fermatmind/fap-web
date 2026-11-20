import Link from "next/link";
import { notFound } from "next/navigation";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { resolveApiBaseUrl } from "@/lib/api-base";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { projectTraditionalResultDisplay } from "@/lib/tests/traditionalAssessmentDisplay";
import { RiasecReadingReport } from "./RiasecReadingReport";

export async function RiasecReportSample({ locale }: { locale: DisplayLocale }) {
  const sourceLocale = locale === "en" ? "en" : "zh";
  const response = await fetch(`${resolveApiBaseUrl()}/v0.5/riasec-assessment/sample?locale=${sourceLocale === "en" ? "en" : "zh-CN"}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!response.ok) notFound();
  const data = await projectTraditionalResultDisplay(await response.json(), locale);
  if (data.sample !== true || data.riasec_public_projection_v2?.holland_code?.code !== "IAR") notFound();
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  return <main className="mx-auto max-w-7xl px-4 pb-12">
    <p className="my-5 rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-950">{t("示例报告 · 使用固定虚构分数展示；你的报告按实际作答生成。", "示例報告 · 使用固定虛構分數展示；你的報告按實際作答產生。", "Sample report · This fixed fictional example is the same for everyone. Your report is based on your own answers.")}</p>
    <RiasecReadingReport viewModel={assembleRiasecResultViewModel(data, sourceLocale)} locale={sourceLocale} displayLocale={locale}
      actions={<Link href={`/${locale}/tests/holland-career-interest-test-riasec`}>{t("开始霍兰德测试", "開始霍蘭德測試", "Start the Holland test")}</Link>} />
  </main>;
}
