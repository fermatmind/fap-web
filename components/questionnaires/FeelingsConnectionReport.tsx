import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { feelingsConnectionCategories, type FeelingsConnectionRecord } from "@/lib/questionnaires/feelingsConnection8";

export function FeelingsConnectionSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-feelings-connection-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "本页不评医疗需要或紧急程度，不应用来推迟照护或改变治疗。有即时危险或无法保障安全时，寻求当地合适的紧急援助而非继续。" : "This page cannot assess medical need or urgency and should not delay care or change treatment. If immediate danger is present or you cannot stay safe, seek appropriate local emergency assistance rather than continuing."}</p></aside>;
  return <aside data-feelings-connection-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人自愿回顾过去四周的自身感受与联系，不是ITQ、PTSD或复杂性PTSD筛查或诊断。无需证明事件、反复暴露或伤害时长；当前感受不能核实过去事件或原因。两主题保留独立标签，正向与困难描述不反向、不合分。无需重建记忆、制造提醒或联系人测试关系。" : "For adults voluntarily recalling their own feelings and connection over the past four weeks, not the ITQ, a PTSD or complex-PTSD screen or a diagnosis. No proof of an event, repeated exposure or duration of harm is needed. Current feelings cannot verify a past event or cause. Two topics retain separate labels; positive and difficult descriptions are not reversed or combined. No memory reconstruction, recreated reminder or contact to test a relationship is needed."}</p>
    <p>{zh ? "支持不以完成、高计数或过去事件证明为条件，可以按实际需要向合格专业人士求助。本页不评医疗需要或紧急程度，不应用来推迟照护或改变治疗。有即时危险或无法保障安全时，寻求当地合适的紧急援助而非继续。两篇全文与既有独立资源公开；不同题本不转移回答、不合成临床总分，回答只在本页内存。" : "Support does not require completion, a high count or proof of a past event; you can discuss actual needs with a qualified professional. This page cannot assess medical need or urgency and should not delay care or change treatment. If immediate danger is present or you cannot stay safe, seek appropriate local emergency assistance rather than continuing. Both full guides and separate existing resources are public. Forms do not transfer answers or create a combined clinical total; answers stay in this page’s memory only."}</p>
  </aside>;
}
export function FeelingsConnectionReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: FeelingsConnectionRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-feelings-connection-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="feelings-connection-result-heading">
    <h2 id="feelings-connection-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <FeelingsConnectionSupport locale={locale} compact />
    <section className="rounded-xl border border-rose-200 bg-rose-50/55 p-4 sm:p-6" aria-labelledby="feelings-connection-reading-start">
      <h3 id="feelings-connection-reading-start" className="text-xl font-semibold text-rose-950">{zh ? "先看看感受，也可以先读靠近与边界" : "Start with feelings, or with closeness and boundaries"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? "两组可以分开回看，不必从一组推断另一组。数字是你本次各类选择对应的题目数。" : "Open either topic separately. The numbers count prompts in each category you selected."}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {records.map((record, index) => <li key={record.id} className="min-w-0 rounded-lg bg-white px-3 pb-3">
          <a className="inline-flex min-h-11 items-center font-semibold text-rose-950 underline underline-offset-4" href={`#feelings-connection-record-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts categories={feelingsConnectionCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
        </li>)}
      </ul>
    </section>
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3"] as const;
      return <section id={`feelings-connection-record-${r.id}`} key={r.id} data-feelings-connection-theme={r.id} aria-labelledby={`feelings-connection-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`feelings-connection-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-feelings-connection-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-feelings-connection-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{feelingsConnectionCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
      {r.counts.na === 4 && <p data-feelings-connection-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <div id={`feelings-connection-public-${r.id}`} data-feelings-connection-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`feelings-connection-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{feelingsConnectionCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-feelings-connection-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-feelings-connection-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : feelingsConnectionCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇公开指南" : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与有机会时没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or risk judgment."}</p>
      <FeelingsConnectionSupport locale={locale} />
    </details>
  </section>;
}
