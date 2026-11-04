import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { traumaResponseCategories, type TraumaResponseRecord } from "@/lib/questionnaires/traumaResponse20";

export function TraumaResponseSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-trauma-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。" : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-trauma-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "无需完成问卷或达到某种数量，想得到帮助时就可以联系合格健康专业人士。你可以先询问评估流程，决定分享多少信息，也可以暂停或退出。" : "You do not need to finish or reach a count to contact a qualified health professional when you want help. You can ask about the assessment process, decide how much to share, pause or leave."}</p>
    <p>{zh ? "若正处于即时危险或无法保障自身安全，请寻求当地紧急援助，而不是继续本练习。本页不能判断紧急程度，也不排除身体疾病。" : "If you are in immediate danger or cannot stay safe, seek local emergency help instead of continuing this exercise. This page cannot assess urgency or rule out a physical condition."}</p>
    <p className="text-sm">{zh ? "这是成年人的原创教育性观察，不是PCL-5或PTSD筛查；没有诊断、临床阈值、风险档位或治疗建议。无需讲述事件，也无需主动接触提醒材料。" : "This original educational observation is for adults, and is not the PCL-5 or a PTSD screen. It has no diagnosis, clinical cutoff, risk tier or treatment advice. No event narrative or deliberate contact with reminders is required."}</p>
  </aside>;
}
export function TraumaResponseReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: TraumaResponseRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-trauma-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="trauma-result-heading">
    <h2 id="trauma-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <ResultReadingNav collapsible label={zh ? "选择一个主题阅读" : "Choose a topic to read"} sections={records.map((record, index) => ({ id: `record-${quiz.slug}-${record.id}`, title: quiz.directions[index].title[locale] }))} />
    <TraumaResponseSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-2", "section-4"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-trauma-theme={r.id} aria-labelledby={`trauma-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`trauma-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-trauma-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-trauma-choice-pattern>{traumaResponseCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
        {r.counts.na === 5 && <p data-trauma-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有相关反应或不需要支持。" : "All five are unscored; this does not mean no reactions or no need for support."}</p>}
        <div id={`trauma-public-${r.id}`} className="scroll-mt-24" data-trauma-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`trauma-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{traumaResponseCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-trauma-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 5</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-trauma-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : traumaResponseCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇完整公开指南" : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <TraumaResponseSupport locale={locale} />
    </details>
  </section>;
}
