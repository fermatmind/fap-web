import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { suddenFearCategories, type SuddenFearRecord } from "@/lib/questionnaires/suddenFear20";

export function SuddenFearSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-sudden-fear-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的原创突然恐惧回顾，不是惊恐障碍严重程度量表、诊断或身体检查。四个可能重叠的主题尚非验证独立维度；类别不能识别惊恐发作或障碍、排除医学原因，或说明症状无害、只是焦虑或身体误报。只凭回忆，不要求引出感觉、检查身体、控制呼吸、接触或返回害怕场景；可保留回答、暂停或离开。" : "This voluntary original sudden-fear reflection is for adults. It is not the Panic Disorder Severity Scale, a diagnosis or physical examination. Four overlapping topics are not validated independent dimensions. Categories cannot identify a panic attack or disorder, exclude a medical cause or establish that symptoms are harmless, only anxiety or a false alarm. Recall only; no sensation-provocation, body-checking, breathing-control, exposure or return-to-setting task is assigned. You may withhold, pause or leave."}</p>
    <p>{zh ? "强烈恐惧或身体问题都可向合格医疗专业人士询问；不必完成、反复出现或等一个月。不用记录推迟评估、等待症状过去、取消照护、改药或改变专业监测指示。本页不评估照护需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续本页。" : "You can ask a qualified healthcare professional about strong fear or a physical concern without completion, repeated episodes or waiting a month. Do not use a record to postpone assessment, wait for symptoms to pass, cancel care, change medicine or alter professional monitoring instructions. This page cannot assess the need or urgency of care or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算描述，不是发作、天数、时长或危险概率。数量少或未计分不证明健康、不提供医学安心保证；四篇全文及支持说明始终公开。页面不能观察你或提供紧急响应。" : "Counts concern descriptions, not attacks, days, duration or danger probability. A small count or unscored record does not establish health or provide medical reassurance. All four full guides and support information remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function SuddenFearReport({ quiz, records, locale }: { quiz: Questionnaire; records: SuddenFearRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-sudden-fear-result className="space-y-7" aria-labelledby="sudden-fear-result-heading">
    <h2 id="sudden-fear-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <SuddenFearSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-sudden-fear-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 5 && <p data-sudden-fear-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{suddenFearCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-sudden-fear-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-sudden-fear-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : suddenFearCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#sudden-fear-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
