import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function DatingOutlookReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div data-dating-outlook-report className="mt-6 space-y-8">
    <p className="leading-8">{zh ? "四项分别记录自己当前的恋爱信念认同程度。每项四条，至少三条数字才显示均值；3是中立，未评分不当中立或零分。各项可以同时高、低或相同，不相减、不合总分、不找主要心态。条形只定位原始1至5，不是匹配率、成功率或人群排名。" : "Four parts separately record agreement with your current dating beliefs. Each has four statements and needs three numeric ratings for a mean. Three is neutral; unscored answers are neither neutral nor zero. Parts can all be high, low or equal, without subtraction, a total or a main outlook. Bars locate the raw 1–5 mean, not compatibility, success probability or population rank."}</p>
    {quiz.directions.map(direction => {
      const part = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-dating-outlook-part={direction.id} aria-labelledby={`dating-outlook-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`dating-outlook-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-dating-outlook-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{part.mean === null
          ? (zh ? `资料不足：${part.rated}/4条有效，至少需3条；不显示个人均值或条形。` : `Insufficient information: ${part.rated}/4 rated, at least 3 needed; no personal mean or bar.`)
          : (zh ? `原始和 ${part.sum}，${part.rated}/4条有效，认同均值 ${part.mean.toFixed(1)} / 5` : `Raw sum ${part.sum}; ${part.rated}/4 rated; agreement mean ${part.mean.toFixed(1)} / 5`)}</p>
        {part.mean !== null && <div className="mb-5"><div role="meter" aria-labelledby={`dating-outlook-${direction.id}`} aria-valuemin={1} aria-valuemax={5} aria-valuenow={part.mean} aria-valuetext={zh ? `原始认同均值${part.mean.toFixed(1)}，范围1强烈不同意至5强烈同意` : `Raw agreement mean ${part.mean.toFixed(1)}, from 1 strongly disagree to 5 strongly agree`} className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${(part.mean - 1) / 4 * 100}%` }} /></div><p className="mt-2 flex justify-between gap-4 text-xs leading-6 text-slate-600"><span>{zh ? "1 强烈不同意" : "1 Strongly disagree"}</span><span>{zh ? "5 强烈同意" : "5 Strongly agree"}</span></p></div>}
        <p className="mb-4 leading-7">{part.mean === null ? (zh ? "以下完整正文是通用读法，不是本次个人看法的结论。" : "The complete text below is a general guide, not a conclusion about your views in this attempt.") : (zh ? "较高只表示更认同本组陈述，不证明观点真实、你已具备某种技巧，或任何关系将怎样发展。请逐句阅读。" : "A higher mean records more agreement with these statements. It does not verify a belief, demonstrate a skill or establish how a relationship will develop. Read each statement in context.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`dating-outlook-reading-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一信念的完整公开指南" : "Read this belief’s full public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh ? "题目和读法为费马原创，尚未建立信效度、常模或跨语言等价。不识别群体成员、个人价值、男性气质或性取向，不评估别人，也不预测关系。努力从不带来获得别人兴趣、回应或继续联系的权利。" : "FermatMind authored these prompts and readings; reliability, validity, norms and language equivalence have not been established. They identify no group membership, worth, masculinity or sexuality, assess no other person and predict no relationship. Effort never creates an entitlement to another person’s interest, reply or continued contact."}</p>
  </div>;
}

export function DatingOutlookNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-dating-outlook-next-steps className="my-8 space-y-4 leading-8"><h3 className="text-xl font-semibold">{zh ? "保留一句观察，或到这里结束" : "Keep one observation, or stop here"}</h3><p>{zh ? "可以回看一句最贴近或最不贴近自己的陈述，无需分享答案、联系任何人或去约会。若另想观察亲近关系中的担心与距离，可独立阅读依恋风格测试；它是另一套原创题，不从本次信念换算。也可不继续。" : "Revisit one statement that fits well or poorly, without sharing answers, contacting anyone or dating. To separately observe worry and distance in a close relationship, you may explore the attachment reflection. It is a distinct original questionnaire and is not inferred from these beliefs. No further step is required."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnairePath(locale, "attachment-styles")}>{zh ? "可选：了解独立的依恋关系自我观察" : "Optional: explore the separate attachment reflection"}</Link><br /><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Return to all tests"}</Link></section>;
}
