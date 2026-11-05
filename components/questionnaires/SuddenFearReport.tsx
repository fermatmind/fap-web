import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { suddenFearCategories, type SuddenFearRecord } from "@/lib/questionnaires/suddenFear20";

export function SuddenFearSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-sudden-fear-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。" : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-sudden-fear-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的原创突然恐惧回顾，不是惊恐障碍严重程度量表、诊断或身体检查。四个可能重叠的主题尚非验证独立维度；类别不能识别惊恐发作或障碍、排除医学原因，或说明症状无害、只是焦虑或身体误报。只凭回忆，不要求引出感觉、检查身体、控制呼吸、接触或返回害怕场景；可保留回答、暂停或离开。" : "This voluntary original sudden-fear reflection is for adults. It is not the Panic Disorder Severity Scale, a diagnosis or physical examination. Four overlapping topics are not validated independent dimensions. Categories cannot identify a panic attack or disorder, exclude a medical cause or establish that symptoms are harmless, only anxiety or a false alarm. Recall only; no sensation-provocation, body-checking, breathing-control, exposure or return-to-setting task is assigned. You may withhold, pause or leave."}</p>
    <p>{zh ? "强烈恐惧或身体问题都可向合格医疗专业人士询问；不必完成、反复出现或等一个月。不用记录推迟评估、等待症状过去、取消照护、改药或改变专业监测指示。本页不评估照护需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续本页。" : "You can ask a qualified healthcare professional about strong fear or a physical concern without completion, repeated episodes or waiting a month. Do not use a record to postpone assessment, wait for symptoms to pass, cancel care, change medicine or alter professional monitoring instructions. This page cannot assess the need or urgency of care or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算描述，不是发作、天数、时长或危险概率。数量少或未计分不证明健康、不提供医学安心保证；四篇全文及支持说明始终公开。页面不能观察你或提供紧急响应。" : "Counts concern descriptions, not attacks, days, duration or danger probability. A small count or unscored record does not establish health or provide medical reassurance. All four full guides and support information remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function SuddenFearReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: SuddenFearRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-sudden-fear-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="sudden-fear-result-heading">
    <h2 id="sudden-fear-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <SuddenFearSupport locale={locale} compact />
    <nav className="rounded-xl bg-sky-50/65 p-4 sm:p-6" aria-label={zh ? "分开读当时与之后的观察" : "Read observations during and after fear"}>
      <p className="max-w-prose leading-7">{zh ? "你可以先读当时留意到的感受，也可以从之后的担心或日常安排开始。数字对应所选类别的题目数。" : "Start with what you noticed at the time, or with later worries and changes in plans. The numbers count prompts for each category you selected."}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[
          { id: "during", label: zh ? "当时" : "During the experience", records: records.slice(0, 2) },
          { id: "after", label: zh ? "之后" : "Afterwards", records: records.slice(2) },
        ].map(group => <section key={group.id} className="min-w-0 border-t border-sky-300 pt-3">
          <h3 className="font-semibold text-sky-950">{group.label}</h3>
          {group.records.map(record => <div className="py-2" key={record.id}>
            <a className="inline-flex min-h-11 items-center font-semibold text-sky-950 underline underline-offset-4" href={`#record-${quiz.slug}-${record.id}`}>{quiz.directions.find(direction => direction.id === record.id)!.title[locale]}</a>
            <ObservationChoiceCounts categories={suddenFearCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
          </div>)}
        </section>)}
      </div>
    </nav>
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3", "section-4"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-sudden-fear-theme={r.id} aria-labelledby={`sudden-fear-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`sudden-fear-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-sudden-fear-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-sudden-fear-choice-pattern>{suddenFearCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
        {r.counts.na === 5 && <p data-sudden-fear-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
        <div id={`sudden-fear-public-${r.id}`} className="scroll-mt-24" data-sudden-fear-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`sudden-fear-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{suddenFearCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-sudden-fear-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 5</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-sudden-fear-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : suddenFearCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇完整公开指南" : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <SuddenFearSupport locale={locale} />
    </details>
  </section>;
}
