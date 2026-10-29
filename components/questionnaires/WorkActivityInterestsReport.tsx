import Link from "next/link";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function WorkActivityContext({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-work-activity-context className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh
      ? "完整核心RIASEC（60项标准版／140项增强版）仍是了解更广兴趣轮廓的主入口。本页只补充六组具体活动兴趣，不替换核心题本或计分，不产生核心前三代码，也不把答案转移过去。"
      : "The complete core RIASEC assessment (60-item standard / 140-item enhanced) remains the main route for a broader interest profile. This page adds six concrete-task interest readings. It does not replace core forms or scoring, produce their top-three code or transfer answers."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`/${locale}/tests/${SCALE_CANONICAL_SLUG_MAP.RIASEC}`}>{zh ? "进入完整核心 RIASEC" : "Visit the full core RIASEC assessment"}</Link>
    <p className="text-sm">{zh
      ? "本补充题本为费马原创，英中文均未建立信效度、常模或测量等值；不是官方O*NET兴趣问卷或原题译本。"
      : "This supplement is a FermatMind original, without established reliability, validity, norms or English–Chinese measurement equivalence. It is not the official O*NET Interest Profiler or a translation of its items."}</p>
  </aside>;
}

export function WorkActivityInterestsReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="mt-6 space-y-8" data-work-activity-report>
    <p className="leading-8">{zh
      ? "六组分别汇总对所列具体活动的兴趣，固定顺序显示，不跨组排名。每组十项至少八条数字才有一位小数均分；3是有效中立，未评分保持缺失。原始和只加有效数字，没有总分、前三代码、能力等级或职业匹配。相同均分可能来自不同回答。"
      : "Six separate summaries describe interest in the specific activities, displayed in a fixed order without ranking. Each ten-task group needs eight numeric ratings for a mean rounded to one decimal. Neutral is a valid 3; unscored stays missing. Raw sums include rated items only. There is no total, top-three code, ability level or job match. Different responses can yield the same mean."}</p>
    <WorkActivityContext locale={locale} />
    {quiz.directions.map(direction => {
      const facet = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-work-activity-part={direction.id} aria-labelledby={`work-activity-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`work-activity-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-work-activity-coverage={direction.id} className="mt-4 leading-7">{zh
          ? `有效项原始和 ${facet.rated ? facet.sum : "—"}；${facet.rated}/10项有效`
          : `Rated-item raw sum ${facet.rated ? facet.sum : "—"}; ${facet.rated}/10 rated`}</p>
        <p data-work-activity-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{facet.mean === null
          ? (zh ? "资料不足：至少需8条数字，不显示个人均分。" : "Insufficient information: at least 8 numeric ratings needed; no personal mean.")
          : (zh ? `显示均分 ${facet.mean.toFixed(1)} / 5` : `Displayed mean ${facet.mean.toFixed(1)} / 5`)}</p>
        <p className="mb-4 leading-7">{facet.mean === null
          ? (zh ? "以下是对所有人相同的完整指南，不是本次个人兴趣结论。" : "The complete guide below is identical for everyone, not a personal interest conclusion from this attempt.")
          : (zh ? "较高只表示更喜欢本组已评任务，不表示更擅长或更适任；以下指南对所有回答相同。" : "Higher means more liking for this group’s rated tasks, not greater skill or suitability. The guide below is the same for every response pattern.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`work-activity-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
  </div>;
}
