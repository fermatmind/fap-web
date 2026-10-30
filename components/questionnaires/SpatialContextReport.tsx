import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { spatialContextCategories, type SpatialContextRecord } from "@/lib/questionnaires/spatialContext4";

export function SpatialContextSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-spatial-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人自愿回顾过去四周的空间关系思考，不是计时心理旋转或视觉空间能力测验。尝试、不确定与困难分别保留，不反向、不合成能力分；没有对错核查、常模、固定认知风格、神经类型、学习风格或职业适配判断。无机会、回忆不清或保留回答可选未计分。" : "For adults voluntarily recalling spatial-relationship thinking over the past four weeks, not a timed mental-rotation or visual-spatial ability test. Attempts, uncertainty and difficulty stay separate without reversal or an ability score. There is no correctness check, norm, fixed cognitive style, neurotype, learning style or career-fit judgment. No opportunity, unclear recall and withholding can stay unscored."}</p>
    <p>{zh ? "无需形成生动画面、转动物品、绘图、演示能力或重复练习。实际任务按真实要求核对，可使用合适辅助，不由标签决定能力或资格。完整指南与独立资源始终公开，不转移回答或合成雷达图；回答只在本页内存，公开复制不含私人选择。" : "No vivid image, object turning, drawing, ability demonstration or repeated practice is required. Check a real task against real requirements and use an appropriate aid; labels do not determine ability or eligibility. The full guide and separate resources remain public, without answer transfer or a combined radar. Answers stay in this page’s memory only, and public copying contains no private selections."}</p>
  </aside>;
}
export function SpatialContextReport({ quiz, records, locale }: { quiz: Questionnaire; records: SpatialContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-spatial-context-result className="space-y-7" aria-labelledby="spatial-context-result-heading">
    <h2 id="spatial-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与有机会时没有注意到分别显示。没有总分、均值、最高项或能力排名。" : "Categories are recorded without points. Each theme’s six counts add to four descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or ability ranking."}</p>
    <SpatialContextSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-spatial-context-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-spatial-context-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表能力高低或没有支持需要。" : "All four are unscored; this establishes neither ability nor absence of support needs."}</p>}
      <dl className="space-y-3">{spatialContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-spatial-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-spatial-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : spatialContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#spatial-context-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
