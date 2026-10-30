import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { unfamiliarCategories, type UnfamiliarRecord } from "@/lib/questionnaires/unfamiliar20";

export function UnfamiliarSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-unfamiliar-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人自愿回顾过去四周自身感官印象、思路、戒备、参与及日常安排，不是PQ-B、PRIME Screen、精神病风险筛查、预测或诊断。不确定印象不证明外部事件、别人意图或未来疾病。无需检查现实、重做印象、录下别人、寻找迹象或对质。正向与困难描述不反向、不合分。" : "For adults voluntarily recalling their own sensory impressions, thought threads, wariness, participation and routines over the past four weeks, not PQ-B, PRIME Screen, a psychosis-risk screen, prediction or diagnosis. An uncertain impression cannot prove an external event, another person\u2019s intention or a future illness. No reality checks, recreated impressions, recording of others, search for signs or confrontation is needed. Positive and difficult descriptions are not reversed or combined."}</p>
    <p>{zh ? "体验若新出现、令人担忧、持续或影响日常，可以向合格医疗专业人士讨论，无需做完或达到计数。页面不评原因、医疗需要或紧急程度，不应推迟照护或改变治疗。若有即时危险或无法保障安全，请寻求当地合适紧急援助而非继续。五篇全文与支持说明始终公开，回答只在当前页面内存。" : "If an experience is new, concerning, continuing or affecting daily life, you can discuss it with a qualified healthcare professional without completing or reaching a count. This page cannot assess causes, medical need or urgency and should not delay care or change treatment. If immediate danger is present or you cannot stay safe, seek appropriate local emergency assistance rather than continuing. All five full guides and support information remain public. Answers stay in current-page memory only."}</p>
  </aside>;
}
export function UnfamiliarReport({ quiz, records, locale }: { quiz: Questionnaire; records: UnfamiliarRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-unfamiliar-result className="space-y-7" aria-labelledby="unfamiliar-result-heading">
    <h2 id="unfamiliar-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与有相关机会时没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or risk judgment."}</p>
    <UnfamiliarSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-unfamiliar-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-unfamiliar-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{unfamiliarCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-unfamiliar-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-unfamiliar-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : unfamiliarCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#unfamiliar-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
