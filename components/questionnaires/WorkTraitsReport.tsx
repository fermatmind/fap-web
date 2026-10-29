import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function WorkTraitsContext({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-work-traits-context className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh
      ? "本表回顾近四周的七类工作行为。题目、分组与读法由费马原创，不是Hogan人格问卷（HPI）、HDS、MVPI或IPIP-HPI量表，也不提供它们的分数。"
      : "This reflects on seven work-behavior themes during the past four weeks. The prompts, groups and readings are FermatMind originals, not the Hogan Personality Inventory (HPI), HDS, MVPI or IPIP-HPI scales, and do not provide their scores."}</p>
    <p className="text-sm">{zh
      ? "七个均值只概括所评行为的自报频率，不能跨组认定最高特质、排名、推断稳定人格或匹配岗位。英文与中文均未建立本题本的信效度、常模或测量等值。"
      : "The seven means summarize reported frequency for the rated behaviors. They do not establish a highest trait, rank people, infer stable personality or match jobs. This form has no established reliability, validity, norms or English–Chinese measurement equivalence."}</p>
  </aside>;
}

export function WorkTraitsReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="mt-6 space-y-8" data-work-traits-report>
    <p className="leading-8">{zh
      ? "七组按固定顺序显示，不产生总分或胜出类型。每组六条至少五条数字才显示一位小数均值；3表示“有时”，未评分保持缺失。原始和只加有效项。均值相同可能来自不同回答、机会和任务，不代表七组已在同一人格尺度上校准。"
      : "Seven groups stay in a fixed order without a total or winning type. Each six-item group needs five numeric ratings for a mean rounded to one decimal. A 3 means Sometimes; unscored remains missing. Raw sums include rated items only. Equal means can reflect different responses, opportunities and tasks; the groups are not calibrated to a common personality scale."}</p>
    <WorkTraitsContext locale={locale} />
    {quiz.directions.map(direction => {
      const facet = result.facets[direction.id], profile = quiz.profiles.find(item => item.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-work-traits-part={direction.id} aria-labelledby={`work-traits-${direction.id}`}
        className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`work-traits-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-work-traits-coverage={direction.id} className="mt-4 leading-7">{zh
          ? `有效项原始和 ${facet.rated ? facet.sum : "—"}；${facet.rated}/6项有效`
          : `Rated-item raw sum ${facet.rated ? facet.sum : "—"}; ${facet.rated}/6 rated`}</p>
        <p data-work-traits-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{facet.mean === null
          ? (zh ? "资料不足：至少需5条数字，不显示个人均值。" : "Insufficient information: at least 5 numeric ratings needed; no personal mean.")
          : (zh ? `所评行为的频率均值 ${facet.mean.toFixed(1)} / 5` : `Rated-behavior frequency mean ${facet.mean.toFixed(1)} / 5`)}</p>
        <p className="mb-4 leading-7">{facet.mean === null
          ? (zh ? "以下完整指南对所有人相同，不是本次个人特质结论。" : "The complete guide below is identical for everyone, not a personal trait conclusion from this attempt.")
          : (zh ? "更频繁不自动代表更合适、表现更好或更符合雇主要求；以下读法对所有回答相同。" : "More frequent does not automatically mean more appropriate, better performance or a better employer fit. The reading below is the same for every response pattern.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`work-traits-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
  </div>;
}

export function WorkTraitsNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "选一项实际情境，再考虑下一步" : "Choose a real context before deciding what comes next"}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "可私下回看一个愿意讨论的实例，区分自己的行动、任务需要和外部条件。无需上传工作材料或证明品格。本表不决定招聘、晋升、领导潜力或职业适配；七篇全文始终开放，也可以在这里结束，无需购买服务或继续测试。"
      : "Privately revisit an instance you are comfortable discussing, separating your action, the task’s needs and outside conditions. No work material upload or proof of character is needed. This does not decide hiring, promotion, leadership potential or career fit. All seven full readings stay open, and you can stop here without buying a service or taking another test."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试与练习" : "Back to all tests and practice"}</Link>
  </section>;
}
