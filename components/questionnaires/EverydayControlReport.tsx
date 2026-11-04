import { ResultSection, ResultReadingNav, ResultScoreRow } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function EverydayControlReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="mt-6 space-y-8" data-everyday-control-report>
    <p className="leading-8">{zh
      ? "六组分别记录过去四周同一普通情境中的自报行动频率。每组四条，至少三条数字回答才计算均分；未评分不补零或中点。它们可以同时较高，不相加、不排名、不派支配或顺从身份。"
      : "Six separate parts record self-reported action frequency in one ordinary context over the past four weeks. Each has four items and needs at least three numeric ratings for a mean. Unscored responses are never filled with zero or a midpoint. Parts can all be frequent; they are not added, ranked or used to assign a dominant or submissive identity."}</p>
    <ResultSection title={zh ? "六种情境行动概览" : "Six contextual action readings"}>
      <div className="grid gap-x-8 sm:grid-cols-2">{quiz.directions.map(direction => {
        const part = result.facets[direction.id];
        return <ResultScoreRow key={direction.id} label={direction.title[locale]} value={part.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${part.mean.toFixed(1)} / 5`} score={part.mean} min={1} max={5} description={zh ? `原始频率均值 · 1–5；${part.rated}/${part.total}条有效` : `Raw frequency mean · 1–5; ${part.rated}/${part.total} rated`} />;
      })}</div>
    </ResultSection>
    <ResultReadingNav label={zh ? "逐项完整解读" : "Full readings by topic"} sections={quiz.directions.map(direction => ({ id: `control-${direction.id}`, title: direction.title[locale] }))} />
    {quiz.directions.map(direction => {
      const facet = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-control-part={direction.id} aria-labelledby={`control-${direction.id}`} className="border-t border-slate-200 pt-7">
        <h3 id={`control-${direction.id}`} className="scroll-mt-24 text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-control-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{facet.mean === null
          ? (zh ? `资料不足：${facet.rated}/4条有效，至少需3条；不显示个人均分。` : `Insufficient information: ${facet.rated}/4 rated, at least 3 needed; no personal mean.`)
          : (zh ? `原始和 ${facet.sum}，${facet.rated}/4条有效，显示均分 ${facet.mean.toFixed(1)} / 5` : `Raw sum ${facet.sum}; ${facet.rated}/4 rated; displayed mean ${facet.mean.toFixed(1)} / 5`)}</p>
        {facet.mean === null && <p className="mb-4 leading-7">{zh ? "以下通用正文仍完整开放，不能当作你本次状态的结论。" : "The complete general guide remains available; it is not a conclusion about your state in this attempt."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`control-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开指南" : "Read this part’s public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh
      ? "这些均分不确认行动效果、他人感受、真实权限或同意。题本与解释由费马原创，尚未建立信效度、常模或跨语言测量等值；不能用于招聘、临床、法律、安全或关系筛选。"
      : "Means do not confirm effectiveness, another person’s experience, actual authority or consent. FermatMind authored these items and readings; reliability, validity, norms and cross-language measurement equivalence have not been established. They are not for hiring, clinical, legal, safety or relationship screening."}</p>
  </div>;
}
