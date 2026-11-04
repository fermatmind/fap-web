import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { emotionsConnectionsCategories, type EmotionsConnectionsRecord } from "@/lib/questionnaires/emotionsConnections21";

export function EmotionsConnectionsSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-emotions-connections-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "有即时危险或无法保障自身安全时，请寻求当地紧急援助，不要继续靠练习处理。" : "If there is immediate danger or you cannot stay safe, seek local emergency help instead of continuing."}</p></aside>;
  return <aside data-emotions-connections-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人原创自述，不作人格障碍筛查、身份或关系安全判断。支持不以完成题目、标签或计数为条件。" : "This original adult self-description does not screen for a personality disorder or judge identity or relationship safety. Support is available without completion, a label or a count."}</p>
    <p>{zh ? "对实际困扰寻求支持，不必完成、达到计数、接受标签或分享记录。合格心理健康专业人士可在适当的个别场合考虑需要。活动不能评估安全、解释原因或选择治疗，不要求披露、对峙或重现场景。有即时危险或无法保障自身安全时，请寻求当地紧急援助，不要继续靠练习处理。" : "You can seek support for an actual concern without finishing, reaching a count, accepting a label or sharing this record. A qualified mental health professional can consider your needs in an appropriate individual setting. This activity cannot assess safety, explain a cause or choose treatment. It asks for no disclosure, confrontation or reenactment. If there is immediate danger or you cannot stay safe, seek local emergency help instead of continuing."}</p>
    <p>{zh ? "不同描述分别保留，不作反向计分。可以随时暂停或离开，不必披露私人经历。" : "Different descriptions remain separate, without reverse scoring. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function EmotionsConnectionsReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: EmotionsConnectionsRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-emotions-connections-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="emotions-connections-result-heading">
    <h2 id="emotions-connections-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <ResultReadingNav collapsible label={zh ? "本次主题记录" : "Topics in this record"} sections={records.map((record, index) => ({
      id: `emotions-connections-record-${record.id}`,
      title: `${quiz.directions[index].title[locale]} · ${record.observations.length}${zh ? "条记录" : " records"}`,
    }))} />
    <EmotionsConnectionsSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-2"] as const;
      return <section id={`emotions-connections-record-${r.id}`} key={r.id} data-emotions-connections-theme={r.id} aria-labelledby={`emotions-connections-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`emotions-connections-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-emotions-connections-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-emotions-connections-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{emotionsConnectionsCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-emotions-connections-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <div id={`emotions-connections-public-${r.id}`} data-emotions-connections-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`emotions-connections-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{emotionsConnectionsCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{c.label[locale]}</dt><dd data-emotions-connections-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? "逐条陈述与所选类别" : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-emotions-connections-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{emotionsConnectionsCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇公开指南" : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自三条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、身份类别、诊断或医疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (three), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, identity category, diagnosis or medical verdict."}</p>
      <EmotionsConnectionsSupport locale={locale} />
    </details>
  </section>;
}
