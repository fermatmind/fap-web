import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { cycleContextCategories, type CycleContextRecord } from "@/lib/questionnaires/cycleContext16";

export function CycleContextSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-cycle-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的16条原创月经周期情境回顾，不是DRSP、PSST、PMDD诊断工具或临床筛查。四个可能重叠的编辑主题尚非验证独立维度。类别不能确认或排除PMDD或其他状况，不能建立周期阶段、激素原因、严重度、人群排名或经核实的重复模式，中英文测量等值尚未建立。回顾不替代前瞻逐日观察或专业评估。" : "These 16 voluntary original menstrual-cycle context recollections are for adults, not DRSP, PSST, a PMDD diagnostic instrument or a clinical screen. Four overlapping editorial topics are not validated independent dimensions. Categories cannot confirm or exclude PMDD or another condition, establish a cycle phase, hormonal cause, severity, population rank or verified recurring pattern. English and Chinese measurement equivalence is not established. Recollection does not replace prospective daily observations or professional assessment."}</p>
    <p>{zh ? "可向合格医疗或心理健康专业人员询问，不必达到计数、再等一个周期或完成记录。只凭回忆，不要求身体检查、回看消息、开始追踪或改变睡眠饮食。已有照护、意见、监测和安全支持独立保留；不用记录推迟评估、改药、改变避孕安排或取消支持，也不把担忧当作只是周期性而忽视。页面不能建立身体变化无害或只是周期性，不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。" : "You can ask a qualified healthcare or mental-health professional without a count, waiting for another cycle or a completed record. Recall only. No body check, message review, tracking, sleep or food change is required. Keep existing care, advice, monitoring and safety support independent; do not use a record to postpone assessment, change medicine or contraception, cancel support or dismiss a concern as only cyclical. The page cannot establish a physical change is harmless or only cyclical. It cannot assess healthcare need or urgency or replace existing advice. In immediate danger or if you cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "参照同一次记得的月经开始前后，以各条所述时间为准，不输入日期、周期史或个人叙述；不假设性别、妊娠史、家长身份或规则周期。标签只描述对回忆的贴切程度，不是频率、点数或症状强度。未计分与不符分开；少量或未计分不证明健康或没有支持需要。四篇全文及支持始终公开，页面不能观察你或作紧急响应。" : "Refer to the same remembered period start; follow each statement’s timing, without entering dates, cycle history or a personal account. Gender, pregnancy history, parenthood and regular cycles are not assumed. Labels describe recollection matches, not frequency, points or symptom intensity. Unscored stays distinct from does not match; a small or unscored record does not establish health or absence of support needs. Four full guides and support remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function CycleContextReport({ quiz, records, locale }: { quiz: Questionnaire; records: CycleContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-cycle-context-result className="space-y-7" aria-labelledby="cycle-context-result-heading">
    <h2 id="cycle-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与不符分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from does not match. There is no total, mean, highest theme or risk judgment."}</p>
    <CycleContextSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-cycle-context-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-cycle-context-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{cycleContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-cycle-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-cycle-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : cycleContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#cycle-context-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
