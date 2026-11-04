import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { uncertaintyEaseCategories, type UncertaintyEaseRecord } from "@/lib/questionnaires/uncertaintyEase6";

export function UncertaintyEaseSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-uncertainty-ease-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。" : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-uncertainty-ease-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人原创自述，不作精神病态、临床冲动或危险性筛查，也不判身份或关系安全。支持不以完成题目、标签或计数为条件。" : "This original adult self-description does not screen for psychopathy, clinical impulsivity or dangerousness or judge identity or relationship safety. Support is available without completion, a label or a count."}</p>
    <p>{zh ? "对令人困扰的体验寻求支持，不需标签、计数或完成。合格专业人士可在适当的个别场合考虑实际顾虑。本活动不作风险许可、不提治疗建议，也不授权重要后果的行动；不要求恐惧挑战、风险试验、披露或联系别人。可读完就停，有即时危险时寻求当地紧急帮助，不依赖记录。" : "You may seek support for a troubling experience without a label, a count or completion. A qualified professional can consider actual concerns in an appropriate individual setting. The activity gives no risk clearance, treatment advice or permission for a consequential action. It asks for no fear challenge, risky experiment, disclosure or contact with another person. You can stop after reading. For immediate danger, seek local emergency help rather than rely on this record."}</p>
    <p>{zh ? "不同描述分别保留，不作反向计分。可以随时暂停或离开，不必披露私人经历。" : "Different descriptions remain separate, without reverse scoring. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function UncertaintyEaseReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: UncertaintyEaseRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-uncertainty-ease-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="uncertainty-ease-result-heading">
    <h2 id="uncertainty-ease-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <ResultReadingNav collapsible label={zh ? "选择一个主题阅读" : "Choose a topic to read"} sections={records.map((record, index) => ({ id: `record-${quiz.slug}-${record.id}`, title: quiz.directions[index].title[locale] }))} />
    <UncertaintyEaseSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-2", "section-5"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-uncertainty-ease-theme={r.id} aria-labelledby={`uncertainty-ease-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`uncertainty-ease-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-uncertainty-ease-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-uncertainty-ease-choice-pattern>{uncertaintyEaseCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>

        <div id={`uncertainty-ease-public-${r.id}`} className="scroll-mt-24" data-uncertainty-ease-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`uncertainty-ease-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{uncertaintyEaseCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.label[locale]}</dt><dd data-uncertainty-ease-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-uncertainty-ease-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{uncertaintyEaseCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇完整公开指南" : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自六条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、身份类别、诊断或医疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (six), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, identity category, diagnosis or medical verdict."}</p>
      <UncertaintyEaseSupport locale={locale} />
    </details>
  </section>;
}
