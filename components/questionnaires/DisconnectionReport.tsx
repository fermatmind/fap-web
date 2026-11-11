import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { disconnectionCategories, type DisconnectionRecord } from "@/lib/questionnaires/disconnection20";

export function DisconnectionSupport({ locale, compact = false, copy = text => text }: { locale: Locale; compact?: boolean; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  if (compact) return <aside data-disconnection-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? copy("页面不评原因、医疗需要或紧急程度，不应推迟照护或改变治疗。有即时危险或无法保障安全时，请寻求当地合适的紧急援助而非继续。") : "This page cannot assess causes, medical need or urgency and should not delay care or change treatment. If immediate danger is present or you cannot stay safe, seek appropriate local emergency assistance rather than continuing."}</p></aside>;
  return <aside data-disconnection-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? copy("供成年人自愿回顾过去四周的自身体验、周围环境、投入与日常回忆不确定，不是DES、DES-II、解离或身份障碍筛查与诊断。不确定回忆不证明隐藏事件、另一身份或原因；无需检查身体或现实、重做感觉、查记录或重建记忆。正向、中性与困难描述不反向、不合分。") : "For adults voluntarily recalling their own self-experience, surroundings, absorption and everyday recall uncertainty over the past four weeks, not DES, DES-II, a dissociation or identity-disorder screen or a diagnosis. Uncertain recall does not prove a hidden event, another identity or a cause. No body or reality checks, recreated sensations, record search or memory reconstruction is needed. Positive, neutral and difficult descriptions are not reversed or combined."}</p>
    <p>{zh ? copy("体验若是新出现、令人困扰或影响日常，可以向合格医疗专业人士讨论，无需完成或达到计数。页面不评原因、医疗需要或紧急程度，不应推迟照护或改变治疗。有即时危险或无法保障安全时，请寻求当地合适的紧急援助而非继续。四篇全文与支持说明始终公开，回答只在当前页面内存。") : "If experiences are new, distressing or affecting everyday life, you can discuss them with a qualified healthcare professional without completing or reaching a count. This page cannot assess causes, medical need or urgency and should not delay care or change treatment. If immediate danger is present or you cannot stay safe, seek appropriate local emergency assistance rather than continuing. All four full guides and support information remain public. Answers stay in current-page memory only."}</p>
  </aside>;
}
export function DisconnectionReport({ quiz, records, locale, readingProfiles, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: DisconnectionRecord[]; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-disconnection-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="disconnection-result-heading">
    <h2 id="disconnection-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <DisconnectionSupport locale={locale} copy={copy} compact />
    <section className="rounded-xl bg-slate-100/75 p-4 sm:p-6" aria-labelledby="disconnection-context-start">
      <h3 id="disconnection-context-start" className="text-xl font-semibold text-slate-950">{zh ? copy("在一个具体情境里读自己的体验") : "Read an experience in its own context"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("关于自己、周围、注意和回忆的回答分开显示。选一个你愿意回看的主题，数字是所选类别对应的题目数。") : "Responses about yourself, surroundings, attention and recall stay separate. Choose a topic you want to revisit. The numbers count prompts in each selected category."}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {records.map((record, index) => <li key={record.id} className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 pb-3">
          <a className="inline-flex min-h-11 items-center font-semibold text-slate-950 underline underline-offset-4" href={`#disconnection-record-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts copy={copy} categories={disconnectionCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
        </li>)}
      </ul>
    </section>
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3"] as const;
      return <section id={`disconnection-record-${r.id}`} key={r.id} data-disconnection-theme={r.id} aria-labelledby={`disconnection-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`disconnection-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-disconnection-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-disconnection-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{disconnectionCategories.filter(category => r.counts[category.id] > 0).map(category => `${copy(category.label[locale])} ${r.counts[category.id]}${zh ? copy("条") : " statements"}`).join(zh ? copy("；") : "; ")}</p>
      {r.counts.na === 5 && <p data-disconnection-unscored className="mb-4 leading-7">{zh ? copy("这五条全部未计分，不代表没有困难或不需要支持。") : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <div id={`disconnection-public-${r.id}`} data-disconnection-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`disconnection-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy(`查看这${r.observations.length}条回答与类别记录`) : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{disconnectionCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? copy("未计分：没有机会／无法回想／保留回答") : "Unscored: no opportunity / unclear recall / withheld") : copy(c.label[locale])}</dt><dd data-disconnection-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? copy("逐条观察与所选类别") : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-disconnection-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? copy("未计分") : "Unscored") : copy(disconnectionCategories.find(c => c.id === o.category)!.label[locale])}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, original.id)}>{zh ? copy("单独打开这篇公开指南") : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy("计数方法、使用范围与支持说明") : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? copy("类别只作记录，不作点数。每个主题六种计数合计五条；未计分与有相关机会时没有注意到分别显示。没有总分、均值、最高项或风险判断。") : "Categories are recorded without points. Each theme’s six counts add to five descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or risk judgment."}</p>
      <DisconnectionSupport locale={locale} copy={copy} />
    </details>
  </section>;
}
