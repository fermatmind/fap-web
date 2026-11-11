import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { caregiverContextCategories, type CaregiverContextRecord } from "@/lib/questionnaires/caregiverContext20";

export function CaregiverContextSupport({ locale, compact = false, copy = text => text }: { locale: Locale; compact?: boolean; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  if (compact) return <aside data-caregiver-context-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? copy("本页不评医疗需要或紧急程度；不要用记录推迟照护、改变药物、撤掉已有调整或强加行为方案。有即时危险时寻求当地合适的紧急援助而非继续。") : "This page cannot assess medical need or urgency. Do not use a record to delay care, change medicine, remove an existing adjustment or impose a behaviour plan. If immediate danger is present, seek appropriate local emergency assistance instead of continuing."}</p></aside>;
  return <aside data-caregiver-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? copy("供成年照顾者回顾过去四周自己直接观察的儿童日常行动，不是儿童自评、ADHD筛查或诊断。未亲自观察、没有机会、回忆不清或保留回答均可选未计分。正向行动与困难不反向、不合分；标签不确定年龄差异、原因、亚型或儿童品格。不要要求孩子演示、保持不动或重做，也不以学校报告或他人说法填空。") : "For adult caregivers recalling children’s everyday actions they directly observed over the past four weeks, not a child self-report, ADHD screen or diagnosis. No direct observation, no opportunity, unclear recall and withholding can stay unscored. Positive actions and difficulties are not reversed or combined. Labels cannot establish age differences, causes, subtypes or character. Do not ask a child to demonstrate, remain still or repeat, or fill gaps with school reports or other people’s accounts."}</p>
    <p>{zh ? copy("若对儿童发展或日常参与有疑问，可以向合适的医疗专业人士讨论观察，无需完成或达到计数。本页不评医疗需要或紧急程度；不要用记录推迟照护、改变药物、撤掉已有调整或强加行为方案。有即时危险时寻求当地合适的紧急援助而非继续。四篇全文与支持说明始终公开；不收集儿童身份或私人叙述，回答只在本页内存。") : "You can discuss concerns about a child’s development or everyday participation with an appropriately qualified healthcare professional without completing or reaching a count. This page cannot assess medical need or urgency. Do not use a record to delay care, change medicine, remove an existing adjustment or impose a behaviour plan. If immediate danger is present, seek appropriate local emergency assistance instead of continuing. All four full guides and support information remain public. No child identity or private narrative is collected; answers stay in this page’s memory only."}</p>
  </aside>;
}
export function CaregiverContextReport({ quiz, records, locale, readingProfiles, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: CaregiverContextRecord[]; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-caregiver-context-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="caregiver-context-result-heading">
    <h2 id="caregiver-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <CaregiverContextSupport locale={locale} copy={copy} compact />
    <section className="rounded-xl bg-orange-50/65 p-4 sm:p-6" aria-labelledby="caregiver-example-reading">
      <h3 id="caregiver-example-reading" className="text-xl font-semibold text-orange-950">{zh ? copy("选一次你亲眼看到的活动") : "Choose an activity you directly observed"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("同一孩子在不同场合可能有不同表现。选择你想回顾的情境，看看本次各类观察对应几条题目，以及当时有哪些支持。") : "A child may act differently in different settings. Choose a context to see how many prompts you marked in each category and consider what support was present."}</p>
      <ul className="mt-4 grid gap-x-6 md:grid-cols-2">
        {records.map((record, index) => <li key={record.id} className="min-w-0 border-b border-orange-200 py-2">
          <a className="inline-flex min-h-11 items-center font-semibold text-orange-950 underline underline-offset-4" href={`#caregiver-context-record-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts copy={copy} categories={caregiverContextCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
        </li>)}
      </ul>
    </section>
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3"] as const;
      return <section id={`caregiver-context-record-${r.id}`} key={r.id} data-caregiver-context-theme={r.id} aria-labelledby={`caregiver-context-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`caregiver-context-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-caregiver-context-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-caregiver-context-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{caregiverContextCategories.filter(category => r.counts[category.id] > 0).map(category => `${copy(category.label[locale])} ${r.counts[category.id]}${zh ? copy("条") : " statements"}`).join(zh ? copy("；") : "; ")}</p>
      {r.counts.na === 5 && <p data-caregiver-context-unscored className="mb-4 leading-7">{zh ? copy("这五条全部未计分，不代表没有困难或不需要支持。") : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <div id={`caregiver-context-public-${r.id}`} data-caregiver-context-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`caregiver-context-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy(`查看这${r.observations.length}条回答与类别记录`) : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{caregiverContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? copy("未计分：未直接观察／没有机会／回忆不清／保留回答") : "Unscored: no direct observation / no opportunity / unclear / withheld") : copy(c.label[locale])}</dt><dd data-caregiver-context-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? copy("逐条观察与所选类别") : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-caregiver-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? copy("未计分") : "Unscored") : copy(caregiverContextCategories.find(c => c.id === o.category)!.label[locale])}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, original.id)}>{zh ? copy("单独打开这篇公开指南") : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy("计数方法、使用范围与支持说明") : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? copy("类别只作记录，不作点数。每个主题六种计数合计五条；未计分与相关情境中没有观察到分别显示。没有总分、均值、最高项或风险判断。") : "Categories are recorded without points. Each theme’s six counts add to five descriptions; unscored stays separate from did not observe in a relevant situation. There is no total, mean, highest theme or risk judgment."}</p>
      <CaregiverContextSupport locale={locale} copy={copy} />
    </details>
  </section>;
}
