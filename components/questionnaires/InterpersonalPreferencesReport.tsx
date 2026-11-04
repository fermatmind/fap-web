import { ResultSection, ResultReadingNav, ResultScoreRow } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function InterpersonalPreferencesReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="mt-6 space-y-8" data-interpersonal-report>
    <p className="leading-8">{zh
      ? "六项分别记录近四周同一情境中的主动行为或期望频率。每项四条，至少三条数字才显示均分；未评分不补零或中点。主动与期望无需一致，不相减、不合成总分，也不计算人际匹配。"
      : "Six separate parts record actions or wishes in one context over four weeks. Each has four items and needs three numeric ratings for a mean; unscored responses are never filled with zero or a midpoint. Actions and wishes need not match. They are not subtracted, totalled or used to calculate interpersonal compatibility."}</p>
    <ResultSection title={zh ? "主动与期望：六项记录" : "Actions and wishes: six separate readings"}>
      <div className="grid gap-x-8 sm:grid-cols-2">{quiz.directions.map(direction => {
        const part = result.facets[direction.id];
        return <ResultScoreRow key={direction.id} label={direction.title[locale]} value={part.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${part.mean.toFixed(1)} / 5`} score={part.mean} min={1} max={5} description={zh ? `原始频率均值 · 1–5；${part.rated}/${part.total}条有效` : `Raw frequency mean · 1–5; ${part.rated}/${part.total} rated`} />;
      })}</div>
    </ResultSection>
    <ResultReadingNav label={zh ? "逐项完整解读" : "Full readings by topic"} sections={quiz.directions.map(direction => ({ id: `interpersonal-${direction.id}`, title: direction.title[locale] }))} />
    {quiz.directions.map(direction => {
      const facet = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-interpersonal-part={direction.id} aria-labelledby={`interpersonal-${direction.id}`} className="border-t border-slate-200 pt-7">
        <h3 id={`interpersonal-${direction.id}`} className="scroll-mt-24 text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-interpersonal-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{facet.mean === null
          ? (zh ? `资料不足：${facet.rated}/4条有效，至少需3条；不显示个人均分。` : `Insufficient information: ${facet.rated}/4 rated, at least 3 needed; no personal mean.`)
          : (zh ? `原始和 ${facet.sum}，${facet.rated}/4条有效，显示均分 ${facet.mean.toFixed(1)} / 5` : `Raw sum ${facet.sum}; ${facet.rated}/4 rated; displayed mean ${facet.mean.toFixed(1)} / 5`)}</p>
        {facet.mean === null && <p className="mb-4 leading-7">{zh ? "以下完整正文是通用读法，不是本次个人状态的结论。" : "The complete text below is a general guide, not a conclusion about your state in this attempt."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`interpersonal-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开指南" : "Read this part’s public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh
      ? "这是费马原创情境反思，不是正式FIRO-B或FIRO Business评估。期望不证明别人做了什么或欠你什么；结果不确定心理需要、固定人格、原因或关系质量。本版尚未建立信效度、常模或跨语言测量等值。"
      : "This is an original FermatMind contextual reflection, not an official FIRO-B or FIRO Business assessment. Wishes do not establish what others did or owed you. Results determine no psychological need, fixed personality, cause or relationship quality. Reliability, validity, norms and cross-language measurement equivalence have not been established."}</p>
  </div>;
}
