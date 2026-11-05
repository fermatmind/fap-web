import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { SecsResult, SecsDomain } from "@/lib/questionnaires/secs";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireSecsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<SecsResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <ResultPage variant="reflection" className="my-6 space-y-8">
    <section className="rounded-xl border border-amber-200 bg-amber-50/65 p-4 sm:p-6" aria-labelledby="secs-historical-readings">
      <h3 id="secs-historical-readings" className="text-xl font-semibold text-amber-950">{zh ? "两组 2013 年议题，分别看回答温度" : "Read warmth separately across two sets of 2013 issues"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? "0–100 是对这份题本中议题的回答刻度。可从任一领域进入历史情境与读法，两组不合成政治身份。" : "The 0–100 scale describes responses to the issues in this questionnaire. Open either domain for its historical context and interpretation. The two domains do not assign a political identity."}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{quiz.directions.map(direction => {
        const score = result.secsDomains[direction.id as SecsDomain];
        return <a key={direction.id} className="min-w-0 border-t border-amber-300 py-3" href={`#secs-title-${direction.id}`}>
          <span className="block font-semibold text-amber-950 underline underline-offset-4">{direction.title[locale]}</span>
          <span className="mt-2 block font-semibold tabular-nums">{score.mean === null ? missing : `${score.mean.toFixed(2)} / 100`}</span>
          <span className="block text-sm leading-6">{zh ? `${score.rated}/${score.total} 项有效` : `${score.rated}/${score.total} rated`}</span>
        </a>;
      })}</div>
    </section>

    {quiz.directions.map(direction => {
      const score = result.secsDomains[direction.id as SecsDomain], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      const scored = score.sum !== null && score.mean !== null;
      return <section key={direction.id} data-secs-domain={direction.id} aria-labelledby={`secs-title-${direction.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <h3 id={`secs-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <dl className="my-5 space-y-3 rounded-lg bg-slate-50 p-4">
          <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? `原始和（0—${score.total * 100}）` : `Raw sum (0–${score.total * 100})`}</dt><dd data-secs-sum>{scored ? score.sum : missing}</dd></div>
          <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? "描述性均分（0—100）" : "Descriptive mean (0–100)"}</dt><dd data-secs-mean>{scored ? `${score.mean!.toFixed(2)} / 100` : missing}</dd></div>
          <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "有效温度回答" : "Valid warmth ratings"}</dt><dd data-secs-rated>{zh ? `${score.rated} / ${score.total}项有效温度评分` : `${score.rated} / ${score.total} rated warmth items`}</dd></div>
        </dl>
        {!scored && <p data-secs-insufficient className="mb-5 leading-8">{zh ? "本领域资料不足，没有生成个人总和或均分；下面完整指南不能当作对你本次政治立场的判断。你可以保留未评分，也可以重测。" : "This domain has insufficient information, so no personal sum or mean was generated. The full guide below is not a judgement of your political position in this attempt. You can leave it unscored or retake."}</p>}
        <div data-secs-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["higher-reading", "lower-reading", "counterexample", "next-step"]} /></div>
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本领域完整公开说明" : "Read this domain’s full public guide"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看计分与使用说明" : "View scoring and use notes"}</summary>
      <p className="leading-8">{zh ? "两组分别描述本次对2013年美国议题词语的温度回答，不相加、跨域排名或派政治身份。社会组七项、经济组五项都有效才显示该域个人原始和与均分；NA只使所属域保留不足。两份完整指南均可读，未评分领域的指南是通用说明。" : "The two domains separately describe this attempt’s warmth toward 2013 U.S. issue terms, without a combined total, cross-domain ranking or political identity. All seven social or five economic ratings are needed for that domain’s personal raw sum and mean; NA withholds only its own domain. Both full guides remain available; an unscored domain’s guide is general information."}</p>
      <p className="text-sm leading-7 text-slate-600">{zh ? "本版保留Everett（2013）完整SECS十二个英文词语、原分组与两处反向键，中文为本站试译。堕胎和福利补助用100减所选温度，其余词保留回答值。均分直接用未舍入原始和除所属题数，显示两位小数；这仍是回答标尺，不是保守程度百分比、百分位或概率，50也不是人口平均。原版美国历史证据不证明当下或中文等值；本版中文、NA处理和呈现尚未经独立验证。" : "This edition retains Everett’s complete 2013 SECS twelve English terms, source groupings and two reverse keys, with our Chinese trial translation. Abortion and welfare benefits score one hundred minus the chosen warmth; other terms retain it. The unrounded sum divided by its own item count gives a mean displayed to two decimals. This is still the response scale, not a percentage conservative, percentile or probability, and fifty is not a population average. Historical U.S. evidence establishes no current or Chinese equivalence; our Chinese, NA handling and presentation lack independent validation here."}</p>
    </details>
  </ResultPage>;
}
