import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { SecsResult, SecsDomain } from "@/lib/questionnaires/secs";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireSecsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<SecsResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "两组分别描述本次对2013年美国议题词语的温度回答，不相加、跨域排名或派政治身份。社会组七项、经济组五项都有效才显示该域个人原始和与均分；NA只使所属域保留不足。两份完整指南均可读，未评分领域的指南是通用说明。" : "The two domains separately describe this attempt’s warmth toward 2013 U.S. issue terms, without a combined total, cross-domain ranking or political identity. All seven social or five economic ratings are needed for that domain’s personal raw sum and mean; NA withholds only its own domain. Both full guides remain available; an unscored domain’s guide is general information."}</p>
    <p className="text-sm leading-7 text-slate-600">{zh ? "本版保留Everett（2013）完整SECS十二个英文词语、原分组与两处反向键，中文为本站试译。堕胎和福利补助用100减所选温度，其余词保留回答值。均分直接用未舍入原始和除所属题数，显示两位小数；这仍是回答标尺，不是保守程度百分比、百分位或概率，50也不是人口平均。原版美国历史证据不证明当下或中文等值；本版中文、NA处理和呈现尚未经独立验证。" : "This edition retains Everett’s complete 2013 SECS twelve English terms, source groupings and two reverse keys, with our Chinese trial translation. Abortion and welfare benefits score one hundred minus the chosen warmth; other terms retain it. The unrounded sum divided by its own item count gives a mean displayed to two decimals. This is still the response scale, not a percentage conservative, percentile or probability, and fifty is not a population average. Historical U.S. evidence establishes no current or Chinese equivalence; our Chinese, NA handling and presentation lack independent validation here."}</p>
    {quiz.directions.map(direction => {
      const score = result.secsDomains[direction.id as SecsDomain], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      const scored = score.sum !== null && score.mean !== null;
      return <section key={direction.id} data-secs-domain={direction.id} aria-labelledby={`secs-title-${direction.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <h3 id={`secs-title-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <dl className="my-5 space-y-3 rounded-lg bg-slate-50 p-4">
          <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? `原始和（0—${score.total * 100}）` : `Raw sum (0–${score.total * 100})`}</dt><dd data-secs-sum>{scored ? score.sum : missing}</dd></div>
          <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "描述性均分（0—100）" : "Descriptive mean (0–100)"}</dt><dd data-secs-mean>{scored ? `${score.mean!.toFixed(2)} / 100` : missing}</dd></div>
          <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "有效温度回答" : "Valid warmth ratings"}</dt><dd data-secs-rated>{zh ? `${score.rated} / ${score.total}项有效温度评分` : `${score.rated} / ${score.total} rated warmth items`}</dd></div>
        </dl>
        {!scored && <p data-secs-insufficient className="mb-5 leading-8">{zh ? "本领域资料不足，没有生成个人总和或均分；下面完整指南不能当作对你本次政治立场的判断。你可以保留未评分，也可以重测。" : "This domain has insufficient information, so no personal sum or mean was generated. The full guide below is not a judgement of your political position in this attempt. You can leave it unscored or retake."}</p>}
        <div data-secs-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} /></div>
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本领域完整公开说明" : "Read this domain’s full public guide"}</Link>
      </section>;
    })}
  </div>;
}
