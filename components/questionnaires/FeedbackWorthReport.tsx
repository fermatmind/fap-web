import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { feedbackWorthCategories, type FeedbackWorthRecord } from "@/lib/questionnaires/feedbackWorth12";

export function FeedbackWorthSupport({ locale, compact = false, copy = text => text }: { locale: Locale; compact?: boolean; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  if (compact) return <aside data-feedback-worth-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? copy("可以随时离开；有即时危险时应寻求当地紧急援助，不继续依靠问卷。") : "You can leave at any time; immediate danger calls for local emergency help rather than continuing a questionnaire."}</p></aside>;
  return <aside data-feedback-worth-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? copy("这是成年人原创自述，不作自恋或人格障碍筛查、身份或关系安全判断。支持不以完成题目、标签或计数为条件。") : "This original adult self-description does not screen for narcissism or a personality disorder or judge identity or relationship safety. Support is available without completion, a label or a count."}</p>
    <p>{zh ? copy("对实际顾虑寻求支持，不需标签、计数或完成。可与合格专业人士谈令人困扰的反应，自行决定分享多少。活动不要求披露、对峙、批评试验或联系反馈者，不判断安全、不规定治疗。可以随时离开；有即时危险时应寻求当地紧急援助，不继续依靠问卷。") : "Support is available for an actual concern without a label, a count or completion. You may discuss distressing reactions with a qualified professional and decide what to share. This activity asks for no disclosure, confrontation, criticism experiment or contact with someone who gave feedback. It cannot judge safety or prescribe treatment. You can leave at any time; immediate danger calls for local emergency help rather than continuing a questionnaire."}</p>
    <p>{zh ? copy("不同描述分别保留，不作反向计分。可以随时暂停或离开，不必披露私人经历。") : "Different descriptions remain separate, without reverse scoring. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function FeedbackWorthReport({ quiz, records, locale, readingProfiles, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: FeedbackWorthRecord[]; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-feedback-worth-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="feedback-worth-result-heading">
    <header className="border-y border-rose-200 bg-rose-50/60 p-4 sm:p-6">
      <h2 id="feedback-worth-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold text-rose-950 outline-none">{quiz.resultHeading![locale]}</h2>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("回看过去四周收到反馈后的感受、对自己的看法，以及注意力如何回到手头的事。每个主题都列出你选过的类别和题目数。") : "Look back at how feedback felt, what it brought up about your worth, and how your attention returned to the task in the past four weeks. Each topic shows your selected categories and their prompt counts."}</p>
      <nav className="mt-4" aria-label={zh ? copy("从感受、自我看法或注意力开始读") : "Start with feelings, self-worth or attention"}>
        <ol className="space-y-3">
          {records.map((record, index) => <li key={record.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
            <span className="pt-2 font-semibold tabular-nums text-rose-800" aria-hidden="true">0{index + 1}</span>
            <div className="border-b border-rose-200 pb-3">
              <a className="inline-flex min-h-11 items-center font-semibold text-rose-950 underline underline-offset-4" href={`#feedback-worth-record-${record.id}`}>{quiz.directions[index].title[locale]}</a>
              <ObservationChoiceCounts copy={copy} categories={feedbackWorthCategories} counts={record.counts} locale={locale} shortLabels={{
                "not-now": { zh: "不符合", en: "Does not describe" },
                partly: { zh: "部分符合", en: "Partly describes" },
                fits: { zh: "符合", en: "Describes" },
              }} />
            </div>
          </li>)}
        </ol>
      </nav>
    </header>
    <FeedbackWorthSupport locale={locale} copy={copy} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-2"] as const;
      return <section id={`feedback-worth-record-${r.id}`} key={r.id} data-feedback-worth-theme={r.id} aria-labelledby={`feedback-worth-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`feedback-worth-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-feedback-worth-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-feedback-worth-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{feedbackWorthCategories.filter(category => r.counts[category.id] > 0).map(category => `${copy(category.label[locale])} ${r.counts[category.id]}${zh ? copy("条") : " statements"}`).join(zh ? copy("；") : "; ")}</p>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-feedback-worth-unscored className="mb-4 leading-7">{zh ? copy("本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。") : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <div id={`feedback-worth-public-${r.id}`} data-feedback-worth-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`feedback-worth-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy(`查看这${r.observations.length}条回答与类别记录`) : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{feedbackWorthCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{copy(c.label[locale])}</dt><dd data-feedback-worth-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? copy("逐条陈述与所选类别") : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-feedback-worth-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{copy(feedbackWorthCategories.find(c => c.id === o.category)!.label[locale])}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, original.id)}>{zh ? copy("单独打开这篇公开指南") : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy("计数方法、使用范围与支持说明") : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? copy("类别只作记录，不作点数。各主题六类计数合计各自四条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、身份类别、诊断或医疗结论。") : "Categories are recorded without points. Each theme’s six counts add to its own item count (four), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, identity category, diagnosis or medical verdict."}</p>
      <FeedbackWorthSupport locale={locale} copy={copy} />
    </details>
  </section>;
}
