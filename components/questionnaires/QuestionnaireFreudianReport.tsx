import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireFreudianReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "八个主题分别描述近四周所列选择的频率，不相加、排名或选出胜出类型。每主题六条都有效才显示个人总和与均分；任一NA只保留所属主题不足。八份完整指南都可阅读，未评分主题的指南是通用说明。" : "Eight themes separately describe the frequency of the listed choices during four weeks, without a combined total, ranking or winning type. Each theme needs all six valid ratings for a personal sum and mean; any NA withholds only its own theme. All eight full guides remain available; an unscored theme’s guide is general information."}</p>
    <p className="text-sm leading-7 text-slate-600">{zh ? "本版48条与指南为本站原创，历史词语注明出自Smith（2014）的个人解释。正向频率1至5分，未舍入原始和除6后显示两位小数；有序类别与小数不证明等距精度，3也不是人口平均。本版尚无独立心理测量验证；近期动作不能反推童年、潜意识原因、性、性别或临床状态。" : "The forty-eight prompts and guides are our original work; historical terms are attributed to Smith’s personal 2014 interpretation. Direct frequency codes run from one to five. The unrounded sum divided by six is displayed to two decimals; ordered categories and decimals establish no interval precision, and three is not a population average. This edition has no independent psychometric validation. Recent actions cannot establish childhood, unconscious causes, sexuality, gender or a clinical state."}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {quiz.directions.map(direction => {
        const score = result.facets[direction.id], scored = score.rated === score.total && score.mean !== null;
        return <section key={direction.id} data-freudian-domain={direction.id} aria-labelledby={`freudian-title-${direction.id}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 id={`freudian-title-${direction.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
          <dl className="my-4 space-y-3 rounded-lg bg-slate-50 p-4">
            <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "原始和（6—30）" : "Raw sum (6–30)"}</dt><dd data-freudian-sum>{scored ? score.sum : missing}</dd></div>
            <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "描述性均分（1—5）" : "Descriptive mean (1–5)"}</dt><dd data-freudian-mean>{scored ? `${(score.sum / score.total).toFixed(2)} / 5` : missing}</dd></div>
            <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "有效频率回答" : "Valid frequency ratings"}</dt><dd data-freudian-rated>{zh ? `${score.rated} / ${score.total}条有效频率评分` : `${score.rated} / ${score.total} rated frequency items`}</dd></div>
          </dl>
          {!scored && <p data-freudian-insufficient className="leading-7">{zh ? "本主题资料不足，未生成个人总和或均分；下方完整指南可作为通用说明阅读。" : "This theme has insufficient information, so no personal sum or mean was generated. Its full guide below remains general information."}</p>}
        </section>;
      })}
    </div>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`freudian-guide-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`freudian-guide-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <div data-freudian-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} /></div>
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本主题完整公开说明" : "Read this theme’s full public guide"}</Link>
    </section>)}
  </div>;
}
