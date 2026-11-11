import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { everydayWorryCategories, type EverydayWorryRecord } from "@/lib/questionnaires/everydayWorry12";

export function EverydayWorrySupport({ locale, compact = false, copy = text => text }: { locale: Locale; compact?: boolean; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  if (compact) return <aside data-everyday-worry-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? copy("已有照护、意见和安全支持独立保留；不要因记录推迟评估、改药或取消支持，也不用它解释掉新出现或变化的健康担忧。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。") : "Keep existing care, advice and safety support independent. Do not use a record to postpone assessment, change medicine, cancel support or explain away a new or changing health concern. In immediate danger or if you cannot stay safe, seek local emergency assistance instead of continuing."}</p></aside>;
  return <aside data-everyday-worry-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? copy("这是供成年人自愿使用的12条原创日常担心观察，不是GAD-7、PTQ、PSS-4、发表焦虑量表或诊断。三个可能重叠的编辑主题尚非验证独立维度。类别不能确认或排除焦虑或其他状况，不能建立原因、严重度、人群排名、人格或工作适配，中英文测量等值尚未建立。只凭回忆，可以保留回答、暂停或离开。") : "These 12 voluntary original everyday-worry observations are for adults, not GAD-7, PTQ, PSS-4, a published anxiety scale or a diagnosis. Three overlapping editorial topics are not validated independent dimensions. Categories cannot confirm or exclude anxiety or another condition, establish a cause, severity, population rank, personality or work suitability. English and Chinese measurement equivalence is not established. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? copy("可向合格医疗或心理健康专业人员询问，不必达到计数、等待六个月或完成记录。不安排压制想法、暴露、呼吸、身体检查或安心确认任务。已有照护、意见和安全支持独立保留；不要因记录推迟评估、改药或取消支持，也不用它解释掉新出现或变化的健康担忧。页面不能建立身体感觉无害或只是焦虑，不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。") : "You can ask a qualified healthcare or mental-health professional without a count, six months of symptoms or a completed record. No thought-suppression, exposure, breathing, body-checking or reassurance task is assigned. Keep existing care, advice and safety support independent. Do not use a record to postpone assessment, change medicine, cancel support or explain away a new or changing health concern. The page cannot establish that a physical sensation is harmless or only anxiety. It cannot assess healthcare need or urgency or replace existing advice. In immediate danger or if you cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? copy("计数针对描述，不是天数、事件、症状或生活影响的数量。未计分与没有注意到分开；少量或未计分不证明健康或没有支持需要。三篇全文及支持说明始终公开，页面不能观察你或作紧急响应。") : "Counts concern descriptions, not days, events, symptoms or amounts of impact. Unscored stays separate from did not notice; a small or unscored record does not establish health or absence of support needs. Three complete guides and support remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function EverydayWorryReport({ quiz, records, locale, readingProfiles, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: EverydayWorryRecord[]; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-everyday-worry-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="everyday-worry-result-heading">
    <header className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-slate-900 sm:p-6">
      <h2 id="everyday-worry-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("从你想回看的情境进入。每行显示本次选过的类别和题目数，点开可读具体题目与对应情境。") : "Start with the situation you want to revisit. Each row shows the categories you selected and how many prompts they cover, with a link to those prompts and examples."}</p>
      <nav className="mt-4 divide-y divide-amber-200" aria-label={zh ? copy("按担忧情境阅读") : "Read by worry context"}>
        {records.map((record, index) => <div key={record.id} className="py-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-center md:gap-4">
          <a className="inline-flex min-h-11 items-center font-semibold text-amber-950 underline underline-offset-4" href={`#everyday-worry-record-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts copy={copy} categories={everydayWorryCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
        </div>)}
      </nav>
    </header>
    <EverydayWorrySupport locale={locale} copy={copy} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3"] as const;
      return <section id={`everyday-worry-record-${r.id}`} key={r.id} data-everyday-worry-theme={r.id} aria-labelledby={`everyday-worry-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`everyday-worry-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-everyday-worry-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-everyday-worry-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{everydayWorryCategories.filter(category => r.counts[category.id] > 0).map(category => `${copy(category.label[locale])} ${r.counts[category.id]}${zh ? copy("条") : " statements"}`).join(zh ? copy("；") : "; ")}</p>
      {r.counts.na === 4 && <p data-everyday-worry-unscored className="mb-4 leading-7">{zh ? copy("这四条全部未计分，不代表没有困难或不需要支持。") : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <div id={`everyday-worry-public-${r.id}`} data-everyday-worry-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`everyday-worry-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy(`查看这${r.observations.length}条回答与类别记录`) : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{everydayWorryCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? copy("未计分：没有经历／无法回想／保留回答") : "Unscored: no experience / unclear recall / withheld") : copy(c.label[locale])}</dt><dd data-everyday-worry-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? copy("逐条观察与所选类别") : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-everyday-worry-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? copy("未计分") : "Unscored") : copy(everydayWorryCategories.find(c => c.id === o.category)!.label[locale])}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, original.id)}>{zh ? copy("单独打开这篇公开指南") : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy("计数方法、使用范围与支持说明") : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? copy("类别只作记录，不作点数。每个主题六种计数合计四条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。") : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <EverydayWorrySupport locale={locale} copy={copy} />
    </details>
  </section>;
}
