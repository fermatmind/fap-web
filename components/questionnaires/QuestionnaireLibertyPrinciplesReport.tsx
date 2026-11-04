import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireLibertyPrinciplesReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <ResultPage variant="dimensions" className="my-6 space-y-8">
    <ResultOverview locale={locale} title={zh ? "各部分读数概览" : "Your separate readings"}
      description={zh ? "按题本顺序呈现，各部分独立阅读。点击名称可查看完整解释；资料不足与低分分开保留。" : "Shown in the form’s order, with each part read separately. Select a name for its full explanation. Insufficient information stays distinct from a lower value."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#liberty-title-${direction.id}`,
          value: score.rated === score.total && score.mean !== null ? `${(score.sum / score.total).toFixed(2)} / 5` : (zh ? "资料不足" : "Insufficient information"),
          note: zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items` };
      })} />
    <p className="leading-8">{zh ? "四个自编议题分别汇总对所列政治原则的回答，不是经验因子、政治身份或纯度量表。每组八条全部有效才显示所属键向调整总和与均分；任一NA只使本组不足。不相加、不排名，也不以最高组决定类型；四份完整指南始终可读。" : "Four authored topic groups separately summarize responses to the stated political principles. They are not empirical factors, political identities or a purity scale. A group needs all eight valid ratings for its own key-adjusted sum and mean; any NA withholds only that group. There is no combined total, ranking or highest-group type. All four full guides remain available."}</p>
    <p className="text-sm leading-7 text-slate-600">{zh ? "本版32条、双语与指南为费马原创；每组四条相反键向用6减所选1—5编码。未舍入调整总和除8，均分显示两位小数；小数方便复算，不证明心理距离等距，3也不是人口平均。较高只表示更认同本组键向命题，不表示更好的政治观点。自由意志主义内部也有财产权、自然资源和国家论证的分歧；本版没有心理测量或文化等价验证，不匹配政党、人物或定向政治信息。" : "The thirty-two items, bilingual wording and guides are original FermatMind materials. Each group has four opposite-keyed items scored as six minus the chosen one-to-five code. The unrounded adjusted sum divided by eight is displayed to two decimals. Decimals support recalculation without proving equal psychological distances, and three is not a population average. Higher means more endorsement of these keyed propositions, not a better political outlook. Libertarian traditions also disagree about property, natural resources and the state. This edition lacks established psychometric or cultural-equivalence validation and matches no parties, people or targeted political messages."}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {quiz.directions.map(direction => {
        const score = result.facets[direction.id], scored = score.rated === score.total && score.mean !== null;
        return <section key={direction.id} data-liberty-domain={direction.id} aria-labelledby={`liberty-title-${direction.id}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 id={`liberty-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold">{direction.title[locale]}</h3>
          <dl className="my-4 space-y-3 rounded-lg bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? "键向调整总和（8—40）" : "Key-adjusted sum (8–40)"}</dt><dd data-liberty-sum>{scored ? score.sum : missing}</dd></div>
            <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? "命题回答均分（1—5）" : "Proposition-response mean (1–5)"}</dt><dd data-liberty-mean>{scored ? `${(score.sum / score.total).toFixed(2)} / 5` : missing}</dd></div>
            <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "有效同意程度回答" : "Valid agreement ratings"}</dt><dd data-liberty-rated>{zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items`}</dd></div>
          </dl>
          {!scored && <p data-liberty-insufficient className="leading-7">{zh ? "本议题资料不足，未生成个人总和或均分。其他完整议题仍可单独读，下方指南是通用说明。" : "This topic has insufficient information, so no personal sum or mean was generated. Other complete topics can still be read separately; the guides below are general information."}</p>}
        </section>;
      })}
    </div>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`liberty-guide-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`liberty-guide-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <div data-liberty-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} /></div>
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本议题完整公开说明" : "Read this topic’s full public guide"}</Link>
    </section>)}
  </ResultPage>;
}
