"use client";
import { RichResultReport } from "@/components/result/RichResultReport";
import { IqResultShell } from "@/components/result/iq/IqResultShell";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { JungResult } from "@/components/result/jung/JungResult";
import { DiscPaidReport } from "@/components/result/disc/DiscPaidReport";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
export function MainstreamSampleReport({data,locale,mbtiContent}:{data:ReportResponse,locale:DisplayLocale,mbtiContent?:PersonalityDesktopCloneContentPayload|null}) {
 const base=locale==="en"?"en":"zh";
 const scale=String(data.meta?.scale_code??data.scale_code??"");
 const report = <RichResultReport sampleMode locale={base} displayLocale={locale} reportData={data} snapshotDesktopCloneContent={mbtiContent}/>;
 return <main className="mx-auto max-w-6xl px-4 py-8"><aside className="mb-6 rounded-xl border border-purple-300 bg-purple-50 p-4 text-slate-900">{locale==="en"?"Fixed sample report · This is one illustrative result. Your own report is based on your answers.":locale==="zh-TW"?"固定示例報告 · 以下展示一組示例結果。你的報告會依自己的作答生成。":"固定示例报告 · 以下展示一组示例结果。你的报告会依自己的作答生成。"}</aside>
 {scale.startsWith("IQ_")?<IqResultShell locale={base} displayLocale={locale} reportData={data} resultData={data as unknown as ResultResponse} accessView={null}/>:scale==="EQ_60"?<EQResultV5 locale={base} displayLocale={locale} reportData={data} attemptId="fixed-sample"/>:scale.startsWith("JUNG_")?<JungResult scale={scale} locale={base} displayLocale={locale} payload={data.report?.jung}/>:scale==="DISC_BEHAVIOR"?<DiscPaidReport locale={base} displayLocale={locale} payload={data.report?.disc}/>:(locale === "zh-TW" && scale === "MBTI" ? <TraditionalQuestionnaireCopy loadingText="正在載入繁體報告…">{report}</TraditionalQuestionnaireCopy> : report)}</main>;
}
