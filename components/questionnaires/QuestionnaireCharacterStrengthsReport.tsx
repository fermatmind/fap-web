import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { QuestionnaireCharacterSource } from "./QuestionnaireCharacterSource";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { trackEvent } from "@/lib/analytics";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { appendSeoCtaContextParamsToHref, buildSeoCtaContextParams, buildSeoCtaTrackingPayload } from "@/lib/tracking/seoCtaAttribution";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCharacterStrengthsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  const riasecBase = `/${locale}/tests/${SCALE_CANONICAL_SLUG_MAP.RIASEC}`;
  const recommendation = { locale, sourceRouteFamily: "test_detail" as const, sourceSlug: quiz.slug, sourcePath: questionnairePath(locale, quiz.slug), href: riasecBase, ctaId: "questionnaire_result_riasec", targetAction: "questionnaire_result_riasec", targetTestSlug: SCALE_CANONICAL_SLUG_MAP.RIASEC, scaleCode: "RIASEC" };
  const riasecHref = appendSeoCtaContextParamsToHref(riasecBase, buildSeoCtaContextParams(recommendation));
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="character-strengths-title">
      <h3 id="character-strengths-title" className="text-xl font-semibold">{zh ? "24项自述，保留全部完整解释" : "24 self-reports with every full explanation"}</h3>
      <p className="leading-8">{zh ? `24部分中，${valid}个有完整四条有效评分。每部分2正2反，反向条按6减评分；原始合计4—20，再除以4显示一位小数均分1—5。NA不补值，任一条NA只让该部分资料不足。均分和全部四条要求是本站呈现与完整度约定。` : `${valid} of 24 parts have all four valid ratings. Each has two positive and two reverse items; reverse ratings use six minus the response. A raw sum of 4–20 is divided by four for a one-decimal mean of 1–5. NA is never imputed; any NA leaves only that part insufficient. Mean display and the all-four requirement are website conventions.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-character-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-character-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条有效` : `${facet.rated} / 4 rated items`}{facet.mean !== null && <span data-character-sum>{zh ? ` · 原始合计${facet.sum} / 20` : ` · raw sum ${facet.sum} / 20`}</span>}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-character-insufficient>{zh ? "本次作答已结束，24部分均未生成个人分数。全部24份完整公开说明仍可阅读，也可以选择重测或在这里结束。" : "This attempt is finished without personal scores for any part. All 24 full public guides remain readable; you can retake it or stop here."}</p>}
      <p className="text-sm leading-7">{zh ? "不合成道德分、百分位或六美德总分，不按最高、近分或并列派型，也不自动指定五项标志性优势。相同均分保留，小数差异不证明显著、能力或改变；低项、休息、不信仰和保护界限都不等于人品缺陷。" : "There is no moral total, percentile, six-virtue total, highest-score or tied type, or automatic five signature strengths. Equal means remain equal; decimal gaps establish neither significance, ability nor change. Lower endorsement, rest, nonbelief and protecting boundaries imply no character defect."}</p>
    </section>
    <QuestionnaireCharacterSource locale={locale} />
    {quiz.profiles.map(profile => <section key={profile.id} data-character-profile={profile.id} aria-labelledby={`character-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`character-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一项的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
    <section className="space-y-3 leading-8" data-character-career-next>
      <h3 className="text-xl font-semibold">{zh ? "如果还想探索职业兴趣" : "If you also want to explore career interests"}</h3>
      <p>{zh ? "RIASEC另外询问职业活动兴趣，需要独立完整作答。先查看实际可用题本和负担，再决定是否继续；兴趣不同于能力、资格或工作机会，本次性格优势分数不换算为职业匹配。也可以在这里结束。" : "RIASEC separately asks about interests in work activities and needs its own full attempt. Check the available forms and effort before choosing to continue. Interest differs from ability, qualifications and job opportunities; these character-strength scores do not convert to career matches. You can also stop here."}</p>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={riasecHref} onClick={() => trackEvent("click_test", buildSeoCtaTrackingPayload(recommendation))}>{zh ? "查看RIASEC职业兴趣与题本" : "Explore RIASEC interests and forms"}</Link>
    </section>
  </div>;
}
