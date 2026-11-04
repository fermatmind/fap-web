import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function SocialAttitudesReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" className="mt-6 space-y-8" data-social-attitudes-report>


    {quiz.directions.map(direction => {
      const facet = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-social-attitudes-part={direction.id} aria-labelledby={`social-attitudes-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`social-attitudes-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-social-attitudes-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{facet.mean === null
          ? (zh ? `资料不足：${facet.rated}/6条有效，至少需4条；不显示个人均分。` : `Insufficient information: ${facet.rated}/6 rated, at least 4 needed; no personal mean.`)
          : (zh ? `原始和 ${facet.sum}，${facet.rated}/6条有效，显示均分 ${facet.mean.toFixed(1)} / 5` : `Raw sum ${facet.sum}; ${facet.rated}/6 rated; displayed mean ${facet.mean.toFixed(1)} / 5`)}</p>
        <p className="mb-4 leading-7">{facet.mean === null
          ? (zh ? "以下完整正文是通用读法，不是本次个人看法的结论。" : "The complete text below is a general guide, not a conclusion about your views in this attempt.")
          : (zh ? "均分较高只表示更认同本组陈述；较低不确定反对理由，任何数字都不证明真实行为或他人体验。" : "A higher mean records more agreement with this set. A lower mean does not establish a reason for disagreement; no number proves actual conduct or another person’s experience.")}</p>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`social-attitudes-report-${profile.id}`} mode="result" previewSectionIds={[`${profile.id}-2`, `${profile.id}-5`]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一主题的公开指南" : "Read this topic’s public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh
      ? "题目和读法为费马原创，尚未建立信效度、常模或跨语言测量等值。不从这些回答推断性取向、性别、种族、信仰或党派；不评判别人，也不决定某次事件是否公平。"
      : "FermatMind authored these statements and readings; reliability, validity, norms and cross-language measurement equivalence have not been established. Responses infer no orientation, gender, race, faith or party, assess no other person and do not decide whether a particular event was fair."}</p>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看全部读数、计分与使用说明" : "View all readings, scoring and use notes"}</summary>
      <ResultOverview locale={locale} title={zh ? "各部分读数概览" : "Your separate readings"}
      description={zh ? "按题本顺序呈现，各部分独立阅读。点击名称可查看完整解释；资料不足与低分分开保留。" : "Shown in the form’s order, with each part read separately. Select a name for its full explanation. Insufficient information stays distinct from a lower value."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#social-attitudes-${direction.id}`,
          value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? "资料不足" : "Insufficient information"),
          note: zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items` };
      })} />
      <p className="leading-8">{zh
      ? "四项分别概括对所列具体陈述的认同。每项六条，至少四条数字才显示均分；中立回答为3，未评分保持缺失。四项不合成总分，不评偏见、道德或身份。相同均分也可能来自不同回答组合。"
      : "Four separate parts summarize agreement with the particular statements shown. Each has six items and needs four numeric ratings for a mean. Neutral responses score 3; unscored responses remain missing. Parts are not combined into a total or used to rate prejudice, morality or identity. Different answer patterns can yield the same mean."}</p>
    </details>
  </ResultPage>;
}
