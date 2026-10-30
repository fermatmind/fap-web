import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { caregiverContextCategories, type CaregiverContextRecord } from "@/lib/questionnaires/caregiverContext20";

export function CaregiverContextSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-caregiver-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年照顾者回顾过去四周自己直接观察的儿童日常行动，不是儿童自评、ADHD筛查或诊断。未亲自观察、没有机会、回忆不清或保留回答均可选未计分。正向行动与困难不反向、不合分；标签不确定年龄差异、原因、亚型或儿童品格。不要要求孩子演示、保持不动或重做，也不以学校报告或他人说法填空。" : "For adult caregivers recalling children’s everyday actions they directly observed over the past four weeks, not a child self-report, ADHD screen or diagnosis. No direct observation, no opportunity, unclear recall and withholding can stay unscored. Positive actions and difficulties are not reversed or combined. Labels cannot establish age differences, causes, subtypes or character. Do not ask a child to demonstrate, remain still or repeat, or fill gaps with school reports or other people’s accounts."}</p>
    <p>{zh ? "若对儿童发展或日常参与有疑问，可以向合适的医疗专业人士讨论观察，无需完成或达到计数。本页不评医疗需要或紧急程度；不要用记录推迟照护、改变药物、撤掉已有调整或强加行为方案。有即时危险时寻求当地合适的紧急援助而非继续。四篇全文与支持说明始终公开；不收集儿童身份或私人叙述，回答只在本页内存。" : "You can discuss concerns about a child’s development or everyday participation with an appropriately qualified healthcare professional without completing or reaching a count. This page cannot assess medical need or urgency. Do not use a record to delay care, change medicine, remove an existing adjustment or impose a behaviour plan. If immediate danger is present, seek appropriate local emergency assistance instead of continuing. All four full guides and support information remain public. No child identity or private narrative is collected; answers stay in this page’s memory only."}</p>
  </aside>;
}
export function CaregiverContextReport({ quiz, records, locale }: { quiz: Questionnaire; records: CaregiverContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-caregiver-context-result className="space-y-7" aria-labelledby="caregiver-context-result-heading">
    <h2 id="caregiver-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与相关情境中没有观察到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five descriptions; unscored stays separate from did not observe in a relevant situation. There is no total, mean, highest theme or risk judgment."}</p>
    <CaregiverContextSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-caregiver-context-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 5 && <p data-caregiver-context-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{caregiverContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：未直接观察／没有机会／回忆不清／保留回答" : "Unscored: no direct observation / no opportunity / unclear / withheld") : c.label[locale]}</dt><dd data-caregiver-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-caregiver-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : caregiverContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#caregiver-context-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
