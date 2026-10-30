import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { disconnectionCategories, type DisconnectionRecord } from "@/lib/questionnaires/disconnection20";

export function DisconnectionSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-disconnection-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人自愿回顾过去四周的自身体验、周围环境、投入与日常回忆不确定，不是DES、DES-II、解离或身份障碍筛查与诊断。不确定回忆不证明隐藏事件、另一身份或原因；无需检查身体或现实、重做感觉、查记录或重建记忆。正向、中性与困难描述不反向、不合分。" : "For adults voluntarily recalling their own self-experience, surroundings, absorption and everyday recall uncertainty over the past four weeks, not DES, DES-II, a dissociation or identity-disorder screen or a diagnosis. Uncertain recall does not prove a hidden event, another identity or a cause. No body or reality checks, recreated sensations, record search or memory reconstruction is needed. Positive, neutral and difficult descriptions are not reversed or combined."}</p>
    <p>{zh ? "体验若是新出现、令人困扰或影响日常，可以向合格医疗专业人士讨论，无需完成或达到计数。页面不评原因、医疗需要或紧急程度，不应推迟照护或改变治疗。有即时危险或无法保障安全时，请寻求当地合适的紧急援助而非继续。四篇全文与支持说明始终公开，回答只在当前页面内存。" : "If experiences are new, distressing or affecting everyday life, you can discuss them with a qualified healthcare professional without completing or reaching a count. This page cannot assess causes, medical need or urgency and should not delay care or change treatment. If immediate danger is present or you cannot stay safe, seek appropriate local emergency assistance rather than continuing. All four full guides and support information remain public. Answers stay in current-page memory only."}</p>
  </aside>;
}
export function DisconnectionReport({ quiz, records, locale }: { quiz: Questionnaire; records: DisconnectionRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-disconnection-result className="space-y-7" aria-labelledby="disconnection-result-heading">
    <h2 id="disconnection-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与有相关机会时没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or risk judgment."}</p>
    <DisconnectionSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-disconnection-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 5 && <p data-disconnection-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{disconnectionCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-disconnection-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-disconnection-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : disconnectionCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#disconnection-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
