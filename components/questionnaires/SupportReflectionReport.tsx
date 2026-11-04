import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { supportReflectionCategories, type SupportReflectionRecord } from "@/lib/questionnaires/supportReflection18";

export function SupportReflectionSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-support-reflection-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。" : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-support-reflection-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人的原创个人回顾，不是临床筛查，不判是否需要治疗、是否准备好，也不划改变阶段。困扰、资源、障碍与疑问可以并存，不相互抵消。可以保留回答、暂停或离开，无需披露私人经历。" : "This original personal reflection is for adults, not a clinical screen. It gives no verdict about needing therapy, being ready or a stage of change. Concerns, resources, barriers and questions can coexist without cancelling each other. You may withhold answers, pause or leave without private disclosure."}</p>
    <p>{zh ? "想得到支持时，可以联系合格专业人士，先问流程并决定分享多少；不必完成练习、达到计数或等待规定时长。如果有即时危险或无法保障自身安全，请寻求当地紧急援助，而不是继续本练习。" : "When you want support, you can contact a qualified professional, ask about the process and choose how much to share. No completion or count is required, and this reflection sets no waiting period. If you are in immediate danger or cannot stay safe, seek local emergency help instead of continuing."}</p>
    <p className="text-sm">{zh ? "未知、没有经历或保留回答不代表一切没事；四篇全文在任何回答状态都公开。记录不替代个别评估，也不能解释或排除身体健康问题。" : "Unknown, inapplicable or withheld answers are not an all-clear finding. All four full guides remain public for every response pattern. The record does not replace an individual assessment or explain or exclude a physical health concern."}</p>
  </aside>;
}
export function SupportReflectionReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: SupportReflectionRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-support-reflection-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="support-reflection-result-heading">
    <h2 id="support-reflection-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <ResultReadingNav collapsible label={zh ? "选择一个主题阅读" : "Choose a topic to read"} sections={records.map((record, index) => ({ id: `record-${quiz.slug}-${record.id}`, title: quiz.directions[index].title[locale] }))} />
    <SupportReflectionSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3", "section-5"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-support-reflection-theme={r.id} aria-labelledby={`support-reflection-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`support-reflection-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-support-reflection-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-support-reflection-choice-pattern>{supportReflectionCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
        {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-support-reflection-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}

        <div id={`support-reflection-public-${r.id}`} className="scroll-mt-24" data-support-reflection-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`support-reflection-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{supportReflectionCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.label[locale]}</dt><dd data-support-reflection-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-support-reflection-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{supportReflectionCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇完整公开指南" : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自条数（4或5条），逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、准备等级、诊断或治疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (four or five), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, readiness tier, diagnosis or therapy verdict."}</p>
      <SupportReflectionSupport locale={locale} />
    </details>
  </section>;
}
