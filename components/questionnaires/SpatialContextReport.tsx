import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { spatialContextCategories, type SpatialContextRecord } from "@/lib/questionnaires/spatialContext4";

export function SpatialContextSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-spatial-context-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。" : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-spatial-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人自愿回顾过去四周的空间关系思考，不是计时心理旋转或视觉空间能力测验。尝试、不确定与困难分别保留，不反向、不合成能力分；没有对错核查、常模、固定认知风格、神经类型、学习风格或职业适配判断。无机会、回忆不清或保留回答可选未计分。" : "For adults voluntarily recalling spatial-relationship thinking over the past four weeks, not a timed mental-rotation or visual-spatial ability test. Attempts, uncertainty and difficulty stay separate without reversal or an ability score. There is no correctness check, norm, fixed cognitive style, neurotype, learning style or career-fit judgment. No opportunity, unclear recall and withholding can stay unscored."}</p>
    <p>{zh ? "无需形成生动画面、转动物品、绘图、演示能力或重复练习。实际任务按真实要求核对，可使用合适辅助，不由标签决定能力或资格。完整指南与独立资源始终公开，不转移回答或合成雷达图；回答只在本页内存，公开复制不含私人选择。" : "No vivid image, object turning, drawing, ability demonstration or repeated practice is required. Check a real task against real requirements and use an appropriate aid; labels do not determine ability or eligibility. The full guide and separate resources remain public, without answer transfer or a combined radar. Answers stay in this page’s memory only, and public copying contains no private selections."}</p>
  </aside>;
}
export function SpatialContextReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: SpatialContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-spatial-context-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="spatial-context-result-heading">
    <h2 id="spatial-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <ResultReadingNav collapsible label={zh ? "选择一个主题阅读" : "Choose a topic to read"} sections={records.map((record, index) => ({ id: `record-${quiz.slug}-${record.id}`, title: quiz.directions[index].title[locale] }))} />
    <SpatialContextSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3", "section-5"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-spatial-context-theme={r.id} aria-labelledby={`spatial-context-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`spatial-context-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-spatial-context-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-spatial-context-choice-pattern>{spatialContextCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
        {r.counts.na === 4 && <p data-spatial-context-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表能力高低或没有支持需要。" : "All four are unscored; this establishes neither ability nor absence of support needs."}</p>}
        <div id={`spatial-context-public-${r.id}`} className="scroll-mt-24" data-spatial-context-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`spatial-context-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{spatialContextCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-spatial-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 4</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-spatial-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : spatialContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇完整公开指南" : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与有机会时没有注意到分别显示。没有总分、均值、最高项或能力排名。" : "Categories are recorded without points. Each theme’s six counts add to four descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or ability ranking."}</p>
      <SpatialContextSupport locale={locale} />
    </details>
  </section>;
}
