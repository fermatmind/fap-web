import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { writtenLanguageCategories, type WrittenLanguageRecord } from "@/lib/questionnaires/writtenLanguage20";

export function WrittenLanguageSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-written-language-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。" : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-written-language-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的20条原创书面语言观察，不是BDA成人清单、阅读障碍筛查工具、诊断或能力测试。四个可能重叠的主题尚非验证独立维度；辅助方式不是追加症状。类别不建立阅读障碍、智力、努力、语言熟练度、神经类型、原因或教育就业资格，中英文测量等值尚未建立。只凭回忆，可保留回答、暂停或离开。" : "These 20 voluntary original written-language observations are for adults, not the BDA adult checklist, a dyslexia screener, diagnosis or ability test. Four overlapping topics are not validated independent dimensions; access methods are not additional symptoms. Categories cannot establish dyslexia, intelligence, effort, language proficiency, neurotype, a cause or eligibility for education or work. English and Chinese measurement equivalence is not established. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? "可向合适的学习支持或评估专业人员询问，不必达到计数、证明童年困难或完成记录。不安排朗读、拼写、抄写、记忆测试或重现错误；无需撤掉有用辅助、上传文字或向雇主披露。不要用记录推迟医疗、评估或已有支持，也不应用它解释掉新出现或变化的健康担忧。本页不评估医疗需要或紧急程度，不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续。" : "You can ask an appropriately qualified learning-support or assessment professional without a count, proof of childhood difficulty or a completed record. No reading aloud, spelling, copying, memory test or recreated error is assigned; no removal of useful aids, writing upload or employer disclosure is required. Do not use the record to postpone healthcare, assessment or existing support, or explain away a new or changing health concern. This page cannot assess healthcare need or urgency or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算描述，不是错误、任务、分钟、熟练程度或阅读障碍概率。计数少或未计分不证明没有困难；四篇全文及支持说明始终公开。页面不能观察你或作紧急响应。" : "Counts concern descriptions, not errors, tasks, minutes, proficiency or the probability of dyslexia. A small or unscored record does not establish an absence of difficulty. Four complete guides and support information remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function WrittenLanguageReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: WrittenLanguageRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-written-language-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="written-language-result-heading">
    <h2 id="written-language-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <ResultReadingNav collapsible label={zh ? "选择一个主题阅读" : "Choose a topic to read"} sections={records.map((record, index) => ({ id: `record-${quiz.slug}-${record.id}`, title: quiz.directions[index].title[locale] }))} />
    <WrittenLanguageSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3", "section-5"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-written-language-theme={r.id} aria-labelledby={`written-language-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`written-language-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-written-language-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-written-language-choice-pattern>{writtenLanguageCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
        {r.counts.na === 5 && <p data-written-language-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
        <div id={`written-language-public-${r.id}`} className="scroll-mt-24" data-written-language-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`written-language-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{writtenLanguageCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-written-language-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 5</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-written-language-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : writtenLanguageCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇完整公开指南" : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <WrittenLanguageSupport locale={locale} />
    </details>
  </section>;
}
