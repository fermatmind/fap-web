import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { genderExperiencesCategories, type GenderExperiencesRecord } from "@/lib/questionnaires/genderExperiences16";

export function GenderExperiencesSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-gender-experiences-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人原创自述，不用于识别性别身份、性别烦躁或医疗需要。支持不以完成题目、标签或计数为条件。" : "This original adult self-description does not identify gender, dysphoria or medical needs. Support is available without completion, a label or a count."}</p>
    <p>{zh ? "想得到支持时，无需先有标签、特定答案或完成记录。可与尊重隐私和个人选择的合格专业人士谈谈，自行决定分享多少。本练习不要求公开身份、改变身体或呈现、试用姓名代词，或采取医疗行动；不能评估个人安全或选择照护路径。有即时危险或无法保障自身安全时，请寻求当地紧急援助，不要继续靠练习处理。" : "Support is available if you want it, without a label, a particular answer or completion. You may speak with a qualified professional who respects your privacy and choices, and decide how much to share. This exercise asks for no disclosure, changes to your body or presentation, trial of a name or pronoun, or medical action. It cannot assess personal safety or choose a care pathway. For immediate danger or an inability to stay safe, seek local emergency help rather than continue."}</p>
    <p>{zh ? "自在、不自在和未知分别保留，不作反向计分。可以随时暂停或离开，不必披露私人经历。" : "Comfort, discomfort and uncertainty remain separate, without reverse scoring. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function GenderExperiencesReport({ quiz, records, locale }: { quiz: Questionnaire; records: GenderExperiencesRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-gender-experiences-result className="space-y-7" aria-labelledby="gender-experiences-result-heading">
    <h2 id="gender-experiences-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自四条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、身份类别、诊断或医疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (four), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, identity category, diagnosis or medical verdict."}</p>
    <GenderExperiencesSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-gender-experiences-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-gender-experiences-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <dl className="space-y-3">{genderExperiencesCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.label[locale]}</dt><dd data-gender-experiences-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条陈述与所选类别" : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-gender-experiences-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{genderExperiencesCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#gender-experiences-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
