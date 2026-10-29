import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { healthWorryCategories, type HealthWorryRecord } from "@/lib/questionnaires/healthWorry21";

export function HealthWorrySupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-health-worry-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的原创健康担忧回顾，不是简式健康焦虑量表、诊断或身体检查。三个可能重叠的主题尚非验证独立维度；类别不能判断症状无害、只是焦虑或属于疾病，也不估患病概率或与典型人群比较。可以只凭回忆、保留回答、暂停或离开，无需检查身体、搜索或披露症状。" : "This voluntary original health-worry reflection is for adults. It is not the Short Health Anxiety Inventory, a diagnosis or physical examination. The three overlapping topics are not validated independent dimensions. Categories cannot determine that a symptom is harmless, only anxiety or a medical condition, estimate illness probability or compare you with typical people. You may recall, withhold, pause or leave without body checks, searching or symptom disclosure."}</p>
    <p>{zh ? "健康问题与担忧都可以向合格医疗专业人士询问；不必完成练习或达到某种计数。不用记录推迟评估、取消照护、改药或调整专业人士要求的监测。本页不评估照护需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续本页。" : "You can ask a qualified healthcare professional about a health concern or worry. No completion or count is required. Do not use the record to postpone assessment, cancel care, change medicine or alter monitoring requested by a professional. This page cannot assess the need or urgency of care or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算陈述，不是就诊、搜索或疾病次数。数量少或未计分不证明健康，也不提供医学安心保证；三篇全文及支持说明始终公开。页面不能观察你或提供紧急响应。" : "Counts concern statements, not visits, searches or illnesses. A small count or unscored record does not establish health or provide medical reassurance. All three full guides and support information remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function HealthWorryReport({ quiz, records, locale }: { quiz: Questionnaire; records: HealthWorryRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-health-worry-result className="space-y-7" aria-labelledby="health-worry-result-heading">
    <h2 id="health-worry-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计七条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to seven statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <HealthWorrySupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-health-worry-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 7 && <p data-health-worry-unscored className="mb-4 leading-7">{zh ? "这七条全部未计分，不代表没有困难或不需要支持。" : "All seven are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{healthWorryCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-health-worry-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 7</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-health-worry-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : healthWorryCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#health-worry-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
