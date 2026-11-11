import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { socialContextCategories, type SocialContextRecord } from "@/lib/questionnaires/socialContext20";

export function SocialContextSupport({ locale, compact = false, copy = text => text }: { locale: Locale; compact?: boolean; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  if (compact) return <aside data-social-context-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? copy("不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。") : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-social-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? copy("这是供成年人自愿使用的20条原创社交情境观察，不是LSAS、SIAS、SPIN、社交焦虑量表或诊断。四个可能重叠的主题尚非验证独立维度。类别不能建立社交焦虑障碍、原因、神经类型、信心水平、社交技能、内向或工作适配，中英文测量等值尚未建立。记录不能决定他人意图或证明场景安全，也不能忽视真实威胁、骚扰、歧视或安全担忧。只凭回忆，可保留回答、暂停或离开。") : "These 20 voluntary original social-context observations are for adults, not LSAS, SIAS, SPIN, a social-anxiety scale or a diagnosis. Four overlapping topics are not validated independent dimensions. Categories cannot establish social anxiety disorder, a cause, neurotype, confidence level, social skill, introversion or work suitability. English and Chinese measurement equivalence is not established. The record cannot determine others’ intentions or establish that a setting is safe, or dismiss a real threat, harassment, discrimination or safety concern. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? copy("可向合格医疗或心理健康专业人员询问，不必达到计数、等待六个月或完成记录。不安排暴露、强迫联系、眼神接触、公开讲话、呼吸或身体监测任务。不要用记录推迟评估、取消已有支持、改药或改变专业监测，也不应用它解释掉新出现或变化的健康担忧。页面不能建立身体感觉无害或只是焦虑，不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续。") : "You can ask a qualified healthcare or mental-health professional without a count, six months of symptoms or a completed record. No exposure, forced contact, eye contact, public speaking, breathing or body-monitoring task is assigned. Do not use the record to postpone assessment, cancel existing support, change medicine or professional monitoring, or explain away a new or changing health concern. The page cannot establish that a physical sensation is harmless or only anxiety. This page cannot assess healthcare need or urgency or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? copy("计数只算描述，不是事件、错误、时长、回避代价或身体症状负荷。未计分与没有注意到分开；数量少或未计分不证明健康或安全。四篇全文及支持说明始终公开，页面不能观察你或作紧急响应。") : "Counts concern descriptions, not events, mistakes, duration, avoidance costs or physical-symptom load. Unscored stays separate from did not notice; a small or unscored record does not establish health or safety. Four complete guides and support remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function SocialContextReport({ quiz, records, locale, readingProfiles, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: SocialContextRecord[]; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-social-context-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="social-context-result-heading">
    <h2 id="social-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <SocialContextSupport locale={locale} copy={copy} compact />
    <section className="border-y border-indigo-200 bg-indigo-50/55 p-4 sm:p-6" aria-labelledby="social-context-reading-start">
      <h3 id="social-context-reading-start" className="text-xl font-semibold text-indigo-950">{zh ? copy("在不同社交场合，你留意到什么") : "What did you notice in different social situations?"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("被注视、聊天、改变计划或当时的身体感受，可以各自阅读。每行显示实际选过的类别及对应题目数。") : "Read being observed, talking, changes in plans or bodily sensations as separate topics. Each row shows the categories you selected and their prompt counts."}</p>
      <ul className="mt-4 divide-y divide-indigo-200">
        {records.map((record, index) => <li key={record.id} className="min-w-0 py-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-center md:gap-4">
          <a className="inline-flex min-h-11 items-center font-semibold text-indigo-950 underline underline-offset-4" href={`#record-${quiz.slug}-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts copy={copy} categories={socialContextCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
        </li>)}
      </ul>
    </section>
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3", "section-5"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-social-context-theme={r.id} aria-labelledby={`social-context-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`social-context-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-social-context-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-social-context-choice-pattern>{socialContextCategories.filter(category => r.counts[category.id] > 0).map(category => `${copy(category.label[locale])} ${r.counts[category.id]}${zh ? copy("条") : " statements"}`).join(zh ? copy("；") : "; ")}</p>
        {r.counts.na === 5 && <p data-social-context-unscored className="mb-4 leading-7">{zh ? copy("这五条全部未计分，不代表没有困难或不需要支持。") : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
        <div id={`social-context-public-${r.id}`} className="scroll-mt-24" data-social-context-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`social-context-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy(`查看这${r.observations.length}条回答与类别记录`) : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{socialContextCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? copy("未计分：没有经历／无法回想／保留回答") : "Unscored: no experience / unclear recall / withheld") : copy(c.label[locale])}</dt><dd data-social-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 5</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-social-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? copy("未计分") : "Unscored") : copy(socialContextCategories.find(c => c.id === o.category)!.label[locale])}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, original.id)}>{zh ? copy("单独打开这篇完整公开指南") : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("计数方法、使用范围与支持说明") : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? copy("类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。") : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <SocialContextSupport locale={locale} copy={copy} />
    </details>
  </section>;
}
