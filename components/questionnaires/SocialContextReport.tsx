import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { socialContextCategories, type SocialContextRecord } from "@/lib/questionnaires/socialContext20";

export function SocialContextSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-social-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的20条原创社交情境观察，不是LSAS、SIAS、SPIN、社交焦虑量表或诊断。四个可能重叠的主题尚非验证独立维度。类别不能建立社交焦虑障碍、原因、神经类型、信心水平、社交技能、内向或工作适配，中英文测量等值尚未建立。记录不能决定他人意图或证明场景安全，也不能忽视真实威胁、骚扰、歧视或安全担忧。只凭回忆，可保留回答、暂停或离开。" : "These 20 voluntary original social-context observations are for adults, not LSAS, SIAS, SPIN, a social-anxiety scale or a diagnosis. Four overlapping topics are not validated independent dimensions. Categories cannot establish social anxiety disorder, a cause, neurotype, confidence level, social skill, introversion or work suitability. English and Chinese measurement equivalence is not established. The record cannot determine others’ intentions or establish that a setting is safe, or dismiss a real threat, harassment, discrimination or safety concern. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? "可向合格医疗或心理健康专业人员询问，不必达到计数、等待六个月或完成记录。不安排暴露、强迫联系、眼神接触、公开讲话、呼吸或身体监测任务。不要用记录推迟评估、取消已有支持、改药或改变专业监测，也不应用它解释掉新出现或变化的健康担忧。页面不能建立身体感觉无害或只是焦虑，不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续。" : "You can ask a qualified healthcare or mental-health professional without a count, six months of symptoms or a completed record. No exposure, forced contact, eye contact, public speaking, breathing or body-monitoring task is assigned. Do not use the record to postpone assessment, cancel existing support, change medicine or professional monitoring, or explain away a new or changing health concern. The page cannot establish that a physical sensation is harmless or only anxiety. This page cannot assess healthcare need or urgency or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算描述，不是事件、错误、时长、回避代价或身体症状负荷。未计分与没有注意到分开；数量少或未计分不证明健康或安全。四篇全文及支持说明始终公开，页面不能观察你或作紧急响应。" : "Counts concern descriptions, not events, mistakes, duration, avoidance costs or physical-symptom load. Unscored stays separate from did not notice; a small or unscored record does not establish health or safety. Four complete guides and support remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function SocialContextReport({ quiz, records, locale }: { quiz: Questionnaire; records: SocialContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-social-context-result className="space-y-7" aria-labelledby="social-context-result-heading">
    <h2 id="social-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <SocialContextSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-social-context-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 5 && <p data-social-context-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{socialContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-social-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-social-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : socialContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#social-context-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
