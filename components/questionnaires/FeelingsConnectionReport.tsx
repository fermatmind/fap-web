import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { feelingsConnectionCategories, type FeelingsConnectionRecord } from "@/lib/questionnaires/feelingsConnection8";

export function FeelingsConnectionSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-feelings-connection-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人自愿回顾过去四周的自身感受与联系，不是ITQ、PTSD或复杂性PTSD筛查或诊断。无需证明事件、反复暴露或伤害时长；当前感受不能核实过去事件或原因。两主题保留独立标签，正向与困难描述不反向、不合分。无需重建记忆、制造提醒或联系人测试关系。" : "For adults voluntarily recalling their own feelings and connection over the past four weeks, not the ITQ, a PTSD or complex-PTSD screen or a diagnosis. No proof of an event, repeated exposure or duration of harm is needed. Current feelings cannot verify a past event or cause. Two topics retain separate labels; positive and difficult descriptions are not reversed or combined. No memory reconstruction, recreated reminder or contact to test a relationship is needed."}</p>
    <p>{zh ? "支持不以完成、高计数或过去事件证明为条件，可以按实际需要向合格专业人士求助。本页不评医疗需要或紧急程度，不应用来推迟照护或改变治疗。有即时危险或无法保障安全时，寻求当地合适的紧急援助而非继续。两篇全文与既有独立资源公开；不同题本不转移回答、不合成临床总分，回答只在本页内存。" : "Support does not require completion, a high count or proof of a past event; you can discuss actual needs with a qualified professional. This page cannot assess medical need or urgency and should not delay care or change treatment. If immediate danger is present or you cannot stay safe, seek appropriate local emergency assistance rather than continuing. Both full guides and separate existing resources are public. Forms do not transfer answers or create a combined clinical total; answers stay in this page’s memory only."}</p>
  </aside>;
}
export function FeelingsConnectionReport({ quiz, records, locale }: { quiz: Questionnaire; records: FeelingsConnectionRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-feelings-connection-result className="space-y-7" aria-labelledby="feelings-connection-result-heading">
    <h2 id="feelings-connection-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与有机会时没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or risk judgment."}</p>
    <FeelingsConnectionSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-feelings-connection-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-feelings-connection-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{feelingsConnectionCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-feelings-connection-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-feelings-connection-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : feelingsConnectionCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#feelings-connection-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
