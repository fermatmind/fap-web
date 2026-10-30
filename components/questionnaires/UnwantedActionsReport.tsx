import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { unwantedActionsCategories, type UnwantedActionsRecord } from "@/lib/questionnaires/unwantedActions20";

export function UnwantedActionsSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-unwanted-actions-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的原创描述回顾，不是Y-BOCS、OCI、发表的囤积量表或诊断。五个可能重叠的阅读主题尚非验证独立维度，也不是五种强迫症亚型；囤积障碍被视为独立状况，本页两者均不诊断。不想要的想法本身不建立意图或行动；页面不能评估实际意图、计划、即时危险或能否保障安全，也不能用来忽视已有安全担忧。" : "This voluntary original adult reflection is not Y-BOCS, OCI, a published hoarding scale or a diagnosis. Five overlapping reading topics are not validated independent dimensions or five OCD subtypes. Hoarding disorder is considered a separate condition; the page diagnoses neither condition. An unwanted thought does not by itself establish intent or action. The page cannot assess actual intent, plans, immediate danger or ability to stay safe, and must not be used to dismiss an existing safety concern."}</p>
    <p>{zh ? "可向合格医疗专业人士询问，不必达到计数、耗时或完成记录。只凭回忆，不安排接触、阻止反应、压制、抵消、停止仪式、改变卫生或丢弃任务。不因记录改变安全要求、药物、照护、监测或财物决定，不用记录推迟评估。本页不评估医疗需要或紧急程度，也不替代专业意见。若有实际伤害意图或计划、即时危险或无法保障安全，请寻求合适的紧急或当地急救援助，而不是继续。" : "You can ask a qualified healthcare professional without a count, time threshold or completed record. Recall only; no exposure, response prevention, suppression, neutralising, stopping of rituals, hygiene change or discarding task is assigned. Do not change safety requirements, medicine, care, monitoring or property decisions because of the record, or use it to postpone assessment. This page cannot assess healthcare need or urgency or replace professional advice. If there is actual intent or a plan to harm, immediate danger or inability to stay safe, seek appropriate urgent or local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算描述，不是动作、想法、耗时、污染或住房安全。计数少或未计分不证明健康或安全，频繁也不证明意图或疾病；五篇全文和支持说明始终公开。页面不能观察你或作紧急响应。" : "Counts concern descriptions, not actions, thoughts, time, contamination or housing safety. A small or unscored record does not establish health or safety, and frequent labels do not establish intent or a disorder. Five full guides and support information remain public. The page cannot observe you or respond to an emergency."}</p>
  </aside>;
}
export function UnwantedActionsReport({ quiz, records, locale }: { quiz: Questionnaire; records: UnwantedActionsRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-unwanted-actions-result className="space-y-7" aria-labelledby="unwanted-actions-result-heading">
    <h2 id="unwanted-actions-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <UnwantedActionsSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-unwanted-actions-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-unwanted-actions-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{unwantedActionsCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-unwanted-actions-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-unwanted-actions-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : unwantedActionsCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#unwanted-actions-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
