import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { focusContextCategories, type FocusContextRecord } from "@/lib/questionnaires/focusContext16";

export function FocusContextSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-focus-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的16条原创情境观察，不是ASRS、ADHD评估或诊断。四个可能重叠的主题尚非验证独立维度；感受、精力背景和社交理解不是追加ADHD诊断标准。类别不建立原因、神经类型、智力、容量、他人意图或工作适配，也不能决定身体问题无害。只凭回忆，可保留回答、暂停或离开。" : "These 16 voluntary original context observations are for adults, not the ASRS, an ADHD assessment or a diagnosis. Four overlapping topics are not validated independent dimensions; feelings, energy context and social interpretation are not additional ADHD diagnostic criteria. Categories cannot establish a cause, neurotype, intelligence, capacity, another person’s intentions or fitness for work, or determine that a physical concern is harmless. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? "可向合格医疗专业人士询问，不必达到计数、持续几个月、证明童年起始或完成记录。不安排表现任务、强制静坐、运动、身体检查或打开消息。不要用记录推迟评估、改变药物、照护或监测，或忽视安全担忧。本页不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续。" : "You can ask a qualified healthcare professional without a count, months of difficulty, proof of childhood onset or a completed record. No performance task, forced sitting, exercise, body check or message opening is assigned. Do not use the record to postpone assessment, change medicine, care or monitoring, or disregard a safety concern. This page cannot assess healthcare need or urgency or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "本页16条与已有独立ADEXI14题不合并成30题或联合分数，不转移回答。计数只算描述，不是事件、分钟或临床症状。计数少或未计分不证明健康或安全；四篇新全文与支持说明始终公开。页面不能观察你或作紧急响应。" : "These 16 observations and the separate existing ADEXI14 form do not become a thirty-item instrument or combined score, and answers are not transferred. Counts concern descriptions, not events, minutes or clinical symptoms. A small or unscored record does not establish health or safety. Four complete guides and support information remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function FocusContextReport({ quiz, records, locale }: { quiz: Questionnaire; records: FocusContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-focus-context-result className="space-y-7" aria-labelledby="focus-context-result-heading">
    <h2 id="focus-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <FocusContextSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-focus-context-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-focus-context-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{focusContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-focus-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-focus-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : focusContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#focus-context-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
