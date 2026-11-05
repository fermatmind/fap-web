import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { careFeelingsCategories, type CareFeelingsRecord } from "@/lib/questionnaires/careFeelings20";

export function CareFeelingsSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-care-feelings-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不要用记录推迟照护、改变药物或忽视安全担忧；页面不评医疗需要或紧急程度。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。" : "Do not use a record to delay care, change medicine or dismiss a safety concern; this page cannot assess medical need or urgency. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p></aside>;
  return <aside data-care-feelings-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人自愿描述自己的回忆与近期感受，不是童年创伤问卷、忽视筛查或诊断。前15条回想童年或青少年时期，后5条只看过去四周。正向与困难经历不反向、不合分；当前感受不证明过去事件、原因或照顾者意图。回忆不清可选未计分，不必重建记忆、查照片或询问家人。" : "For adults voluntarily describing their own recollections and recent feelings, not the Childhood Trauma Questionnaire, a neglect screen or a diagnosis. The first fifteen concern childhood or adolescence; the last five concern the past four weeks. Positive and difficult descriptions are not reversed or combined. Current feelings cannot prove past events, causes or caregiver intentions. Unclear recall can stay unscored without reconstructing memories, searching photos or questioning family."}</p>
    <p>{zh ? "可向合格医疗专业人士询问支持，无需完成、达到计数或证明童年伤害。不要用记录推迟照护、改变药物或忽视安全担忧；页面不评医疗需要或紧急程度。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。四篇全文与支持说明始终公开，回答只在本页内存。" : "You can ask a qualified healthcare professional for support without completing, reaching a count or proving childhood harm. Do not use a record to delay care, change medicine or dismiss a safety concern; this page cannot assess medical need or urgency. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing. All four full guides and support information remain public. Answers stay in this page’s memory only."}</p>
  </aside>;
}
export function CareFeelingsReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: CareFeelingsRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-care-feelings-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="care-feelings-result-heading">
    <h2 id="care-feelings-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <nav className="rounded-xl bg-stone-100/75 p-4 sm:p-6" aria-label={zh ? "分开回看过去和近期" : "Read past and recent experiences separately"}>
      <p className="max-w-prose leading-7">{zh ? "先选择一段记得的经历，或只读近期感受。每个主题的数字是本次各类回答对应的题目数。" : "Start with a memory, or read only about recent feelings. Each topic lists how many prompts you placed in each category."}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {[
          { id: "remembered", label: zh ? "过去记得的经历" : "Remembered experiences", records: records.slice(0, 3) },
          { id: "recent", label: zh ? "近期的感受与支持" : "Recent feelings and support", records: records.slice(3) },
        ].map(group => <section key={group.id} className="min-w-0 border-t-2 border-stone-400 pt-3">
          <h3 className="font-semibold text-stone-900">{group.label}</h3>
          {group.records.map(record => <div className="border-b border-stone-300 py-2 last:border-b-0" key={record.id}>
            <a className="inline-flex min-h-11 items-center font-semibold text-stone-950 underline underline-offset-4" href={`#care-feelings-record-${record.id}`}>{quiz.directions.find(direction => direction.id === record.id)!.title[locale]}</a>
            <ObservationChoiceCounts categories={careFeelingsCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
          </div>)}
        </section>)}
      </div>
    </nav>
    <CareFeelingsSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3"] as const;
      return <section id={`care-feelings-record-${r.id}`} key={r.id} data-care-feelings-theme={r.id} aria-labelledby={`care-feelings-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`care-feelings-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-care-feelings-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-care-feelings-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{careFeelingsCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
      {r.counts.na === 5 && <p data-care-feelings-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <div id={`care-feelings-public-${r.id}`} data-care-feelings-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`care-feelings-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{careFeelingsCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: cannot say / no recall / withheld") : c.label[locale]}</dt><dd data-care-feelings-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-care-feelings-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : careFeelingsCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇公开指南" : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与回忆不符分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five descriptions; unscored stays separate from does not fit. There is no total, mean, highest theme or risk judgment."}</p>
      <CareFeelingsSupport locale={locale} />
    </details>
  </section>;
}
