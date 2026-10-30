import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { seasonContextCategories, type SeasonContextRecord } from "@/lib/questionnaires/seasonContext16";

export function SeasonContextSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-season-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的16条原创回顾，不是SPAQ、临床筛查或诊断。四个可能重叠的编辑主题尚非验证独立维度。类别不能确认或排除季节性情感障碍或其他状况，不能建立原因、严重度、人群排名、临床发作或缓解，中英文测量等值尚未建立。" : "These 16 original recollections are optional for adults, not SPAQ, a clinical screen or a diagnosis. Four overlapping editorial topics are not validated independent dimensions. Categories cannot confirm or exclude seasonal affective disorder or another condition, establish a cause, severity, population rank, clinical episode or remission. English and Chinese measurement equivalence is not established."}</p>
    <p>{zh ? "可向合格医疗或心理健康专业人员询问，不必达到计数、完成记录或再等一个季节年份。只凭回忆，不要求重建日历、接触天气、监测食物或身体，不提供光照、饮食、补充剂、睡眠或药物指示。已有照护、意见、监测和支持独立保留，不用记录推迟评估、改药或把持续担忧当作只是季节性而忽略。页面不能评估医疗需要、紧急程度或个人安全。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。" : "You can ask a qualified healthcare or mental-health professional without a count, a completed record or another season or year. Recall only. No calendar reconstruction, weather exposure, food or body monitoring is required; no light, diet, supplement, sleep or medicine instructions are provided. Keep existing care, advice, monitoring and support independent; do not use a record to postpone assessment, change medicine or dismiss an ongoing concern as only seasonal. The page cannot assess healthcare need or urgency or personal safety. In immediate danger or if you cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "过去两年只是编辑回忆窗口，不核实两次年度发作或临床持续规则。不输入日期、月份、地点、半球或个人史，不假设冬季或日照原因；页面不能建立天气或生理原因。标签描述回忆贴切程度，不是频率、点数或变化量；时间主题不额外加权，例外不扣分。未计分与不符分开，稀疏记录或未询问自伤不证明健康或安全。四篇全文与支持始终公开，页面不能观察季节或紧急响应。" : "Two years is an editorial recall window, not verification of two annual episodes or a clinical duration rule. No dates, months, location, hemisphere or personal history are entered, and winter or a daylight cause is not assumed. The page cannot establish a weather or biological cause. Labels describe recollection matches, not frequency, points or size of change; timing has no extra weight and exceptions subtract no points. Unscored stays distinct from does not match; a sparse record or not asking about self-harm does not establish health or safety. Four complete guides and support remain public. The page cannot observe a season or provide emergency response."}</p>
  </aside>;
}
export function SeasonContextReport({ quiz, records, locale }: { quiz: Questionnaire; records: SeasonContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-season-context-result className="space-y-7" aria-labelledby="season-context-result-heading">
    <h2 id="season-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与不符分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from does not match. There is no total, mean, highest theme or risk judgment."}</p>
    <SeasonContextSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-season-context-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-season-context-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{seasonContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-season-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-season-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : seasonContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#season-context-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
