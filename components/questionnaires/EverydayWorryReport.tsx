import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { everydayWorryCategories, type EverydayWorryRecord } from "@/lib/questionnaires/everydayWorry12";

export function EverydayWorrySupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-everyday-worry-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的12条原创日常担心观察，不是GAD-7、PTQ、PSS-4、发表焦虑量表或诊断。三个可能重叠的编辑主题尚非验证独立维度。类别不能确认或排除焦虑或其他状况，不能建立原因、严重度、人群排名、人格或工作适配，中英文测量等值尚未建立。只凭回忆，可以保留回答、暂停或离开。" : "These 12 voluntary original everyday-worry observations are for adults, not GAD-7, PTQ, PSS-4, a published anxiety scale or a diagnosis. Three overlapping editorial topics are not validated independent dimensions. Categories cannot confirm or exclude anxiety or another condition, establish a cause, severity, population rank, personality or work suitability. English and Chinese measurement equivalence is not established. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? "可向合格医疗或心理健康专业人员询问，不必达到计数、等待六个月或完成记录。不安排压制想法、暴露、呼吸、身体检查或安心确认任务。已有照护、意见和安全支持独立保留；不要因记录推迟评估、改药或取消支持，也不用它解释掉新出现或变化的健康担忧。页面不能建立身体感觉无害或只是焦虑，不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。" : "You can ask a qualified healthcare or mental-health professional without a count, six months of symptoms or a completed record. No thought-suppression, exposure, breathing, body-checking or reassurance task is assigned. Keep existing care, advice and safety support independent. Do not use a record to postpone assessment, change medicine, cancel support or explain away a new or changing health concern. The page cannot establish that a physical sensation is harmless or only anxiety. It cannot assess healthcare need or urgency or replace existing advice. In immediate danger or if you cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数针对描述，不是天数、事件、症状或生活影响的数量。未计分与没有注意到分开；少量或未计分不证明健康或没有支持需要。三篇全文及支持说明始终公开，页面不能观察你或作紧急响应。" : "Counts concern descriptions, not days, events, symptoms or amounts of impact. Unscored stays separate from did not notice; a small or unscored record does not establish health or absence of support needs. Three complete guides and support remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function EverydayWorryReport({ quiz, records, locale }: { quiz: Questionnaire; records: EverydayWorryRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-everyday-worry-result className="space-y-7" aria-labelledby="everyday-worry-result-heading">
    <h2 id="everyday-worry-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <EverydayWorrySupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-everyday-worry-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-everyday-worry-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{everydayWorryCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-everyday-worry-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-everyday-worry-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : everydayWorryCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#everyday-worry-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
