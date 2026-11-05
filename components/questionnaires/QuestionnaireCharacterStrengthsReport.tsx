"use client";

import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
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
    <header className="max-w-[74ch] space-y-3" aria-labelledby="character-strengths-title">
      <h3 id="character-strengths-title" className="text-xl font-semibold">{zh ? "24项性格优势，放进日常生活里看" : "Explore 24 strengths through everyday life"}</h3>
      <p className="leading-7">{zh ? "分数描述你怎样评价自己的日常表现。先选一项，读一个生活例子，再看看有没有想尝试的小事。" : "The scores describe how you see your everyday experiences. Choose a part, read an everyday example and consider whether you want to try a small observation."}</p>
      <p className="text-sm leading-7 text-slate-600">{zh ? "1—5是条目认同程度，不是能力或人品等级；24项分开读，不指定五项标志性优势。" : "The 1–5 means describe endorsement, not ability or character grades. Read the 24 parts separately; no five signature strengths are assigned."}</p>
    </header>
    <label className="grid max-w-xl gap-2 text-sm font-medium lg:hidden">
      <span>{zh ? "先了解哪一项？" : "Which part would you like to explore?"}</span>
      <select className="min-h-12 min-w-0 w-full rounded-lg border border-slate-300 bg-white p-3 text-base" defaultValue={quiz.profiles[0].id} onChange={event => {
        const target = document.getElementById(`character-title-${event.target.value}`);
        target?.focus({ preventScroll: true });
        target?.scrollIntoView({ block: "start", behavior: "instant" });
      }}>{quiz.profiles.map(profile => {
        const facet = result.facets[profile.directionIds[0]];
        return <option key={profile.id} value={profile.id}>{profile.title[locale]} · {facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</option>;
      })}</select>
    </label>
    <nav className="hidden rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 lg:block" aria-label={zh ? "二十四项优势读数与例子" : "Twenty-four strength readings and examples"}>
      <ul className="grid grid-cols-4 gap-x-4 xl:grid-cols-6">{quiz.profiles.map(profile => {
        const facet = result.facets[profile.directionIds[0]];
        return <li key={profile.id} className="min-w-0 border-b border-emerald-200">
          <a href={`#character-title-${profile.id}`} className="flex min-h-12 flex-col justify-center py-2 text-emerald-950">
            <span className="font-semibold underline decoration-emerald-400 underline-offset-4">{profile.title[locale]}</span>
            <span className="text-sm leading-6 tabular-nums">{facet.mean === null ? (zh ? `${facet.rated}/4 项有效` : `${facet.rated}/4 rated`) : `${facet.mean.toFixed(1)} / 5`}</span>
          </a>
        </li>;
      })}</ul>
    </nav>
    {valid === 0 && <p className="leading-8" data-character-insufficient>{zh ? "本次作答已结束，24部分均未生成个人分数。全部24份完整公开说明仍可阅读，也可以选择重测或在这里结束。" : "This attempt is finished without personal scores for any part. All 24 full public guides remain readable; you can retake it or stop here."}</p>}
    {quiz.profiles.map(profile => {
      const facet = result.facets[profile.directionIds[0]];
      return <section key={profile.id} data-character-profile={profile.id} aria-labelledby={`character-title-${profile.id}`} className="border-t border-slate-200 pt-6">
        <h3 id={`character-title-${profile.id}`} tabIndex={-1} className="mb-3 scroll-mt-24 text-2xl font-semibold leading-snug">{profile.title[locale]}</h3>
        <dl className="mb-5" data-character-facet={profile.directionIds[0]}>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1"><dt>{zh ? "本次均分" : "Your mean"}</dt><dd className="text-2xl font-semibold tabular-nums" data-character-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</dd></div>
          <div className="mt-1 flex flex-wrap gap-x-3 text-sm leading-7 text-slate-600"><dt>{zh ? "有效回答" : "Rated items"}</dt><dd>{facet.rated} / 4{facet.mean !== null && <span data-character-sum>{zh ? ` · 原始合计${facet.sum} / 20` : ` · raw sum ${facet.sum} / 20`}</span>}</dd></div>
        </dl>
        {facet.mean === null && <p className="mb-4 text-sm leading-7">{zh ? "本项资料不足，不计算个人分数；下方为通用读法。" : "This part has insufficient information for a personal score. The reading below is general guidance."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" showHeadline={false} previewSectionIds={["reading", "worked-example", "observation"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "单独阅读这一项的完整指南" : "Read this part’s full guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计分、来源与使用范围" : "Scoring, sources and scope"}</summary>
      <p className="mt-4 leading-8">{zh ? `24部分中，${valid}个有完整四条有效评分。每部分2正2反，反向条按6减评分；原始合计4—20，再除以4显示一位小数均分1—5。NA不补值，任一条NA只让该部分资料不足。均分和全部四条要求是本站呈现与完整度约定。` : `${valid} of 24 parts have all four valid ratings. Each has two positive and two reverse items; reverse ratings use six minus the response. A raw sum of 4–20 is divided by four for a one-decimal mean of 1–5. NA is never imputed; any NA leaves only that part insufficient. Mean display and the all-four requirement are website conventions.`}</p>
      <p className="mt-4 text-sm leading-7">{zh ? "不合成道德分、百分位或六美德总分，不按最高、近分或并列派型，也不自动指定五项标志性优势。相同均分保留，小数差异不证明显著、能力或改变；低项、休息、不信仰和保护界限都不等于人品缺陷。" : "There is no moral total, percentile, six-virtue total, highest-score or tied type, or automatic five signature strengths. Equal means remain equal; decimal gaps establish neither significance, ability nor change. Lower endorsement, rest, nonbelief and protecting boundaries imply no character defect."}</p>
      <QuestionnaireCharacterSource locale={locale} />
    </details>
    <section className="space-y-3 leading-8" data-character-career-next>
      <h3 className="text-xl font-semibold">{zh ? "如果还想探索职业兴趣" : "If you also want to explore career interests"}</h3>
      <p>{zh ? "RIASEC另外询问职业活动兴趣，需要独立完整作答。先查看实际可用题本和负担，再决定是否继续；兴趣不同于能力、资格或工作机会，本次性格优势分数不换算为职业匹配。也可以在这里结束。" : "RIASEC separately asks about interests in work activities and needs its own full attempt. Check the available forms and effort before choosing to continue. Interest differs from ability, qualifications and job opportunities; these character-strength scores do not convert to career matches. You can also stop here."}</p>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={riasecHref} onClick={() => trackEvent("click_test", buildSeoCtaTrackingPayload(recommendation))}>{zh ? "查看RIASEC职业兴趣与题本" : "Explore RIASEC interests and forms"}</Link>
    </section>
  </div>;
}
