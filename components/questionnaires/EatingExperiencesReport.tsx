import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { eatingExperiencesCategories, type EatingExperiencesRecord } from "@/lib/questionnaires/eatingExperiences20";

export function EatingExperiencesSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-eating-experiences-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人原创自述，不是进食障碍筛查或身体评定。支持始终可用，不以完成题目、外表或计数为条件。" : "This original adult self-description is not an eating-disorder screen or body assessment. Support is available without completion, a particular appearance or a count."}</p>
    <p>{zh ? "进食或身体相关顾虑让你难受时，可以向合格医疗专业人士寻求支持，不必完成表单、达到计数或符合某种外表。本练习不指派限制进食、代偿、身体检查、称重、食物日记，或改变食物与活动。它不能判定紧急程度或解释身体症状。有即时危险或当前严重症状时，请寻求当地紧急医疗帮助，不要继续靠问卷处理。" : "If eating or body concerns trouble you, you can seek support from a qualified health professional without finishing this form, a particular count or a particular appearance. This exercise prescribes no restriction, compensation, body checking, weighing, food diary or change to food or activity. It cannot decide urgency or explain physical symptoms. For immediate danger or severe current symptoms, seek local emergency medical help rather than continue the questionnaire."}</p>
    <p>{zh ? "未知、没有经历或保留回答不是一切没事的结论。可随时暂停或离开，不必披露私人经历。" : "Unknown, no relevant experience and withheld are not an all-clear finding. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function EatingExperiencesReport({ quiz, records, locale }: { quiz: Questionnaire; records: EatingExperiencesRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-eating-experiences-result className="space-y-7" aria-labelledby="eating-experiences-result-heading">
    <h2 id="eating-experiences-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自四条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、健康等级、诊断或医疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (four), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, health tier, diagnosis or medical verdict."}</p>
    <EatingExperiencesSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-eating-experiences-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-eating-experiences-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <dl className="space-y-3">{eatingExperiencesCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.label[locale]}</dt><dd data-eating-experiences-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条陈述与所选类别" : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-eating-experiences-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{eatingExperiencesCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#eating-experiences-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
