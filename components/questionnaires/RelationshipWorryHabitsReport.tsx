import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function RelationshipWorryHabitsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div data-relationship-worry-habits-report className="mt-6 space-y-8">
    <p className="leading-8">{zh ? "四项分别记录过去三个月自己一侧的反应。每项四条，至少三条数字才显示均值；3是有时，未评分不当零分。各项可同时高、低或相同，不合总分、不找主要类型，也不划沉重等级。较低不证明平静。条形只定位原始1至5，不是百分比、爱意或严重程度。" : "Four parts separately record your own responses over the past three months. Each has four prompts and needs three numeric ratings for a mean. Three means sometimes; unscored answers are not zero. Parts can all be high, low or equal, without a total, main type or heaviness level. Lower values do not establish calmness. Bars locate the raw 1–5 mean, not a percentage, amount of love or severity."}</p>
    {quiz.directions.map(direction => {
      const part = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-relationship-worry-habits-part={direction.id} aria-labelledby={`relationship-worry-habits-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`relationship-worry-habits-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-relationship-worry-habits-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{part.mean === null
          ? (zh ? `资料不足：${part.rated}/4条有效，至少需3条；不显示个人均值或条形。` : `Insufficient information: ${part.rated}/4 rated, at least 3 needed; no personal mean or bar.`)
          : (zh ? `原始和 ${part.sum}，${part.rated}/4条有效，频率均值 ${part.mean.toFixed(1)} / 5` : `Raw sum ${part.sum}; ${part.rated}/4 rated; frequency mean ${part.mean.toFixed(1)} / 5`)}</p>
        {part.mean !== null && <div className="mb-5"><div role="meter" aria-labelledby={`relationship-worry-habits-${direction.id}`} aria-valuemin={1} aria-valuemax={5} aria-valuenow={part.mean} aria-valuetext={zh ? `原始自报频率${part.mean.toFixed(1)}，范围1从不至5几乎每次` : `Raw self-reported frequency ${part.mean.toFixed(1)}, from 1 never to 5 almost always`} className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${(part.mean - 1) / 4 * 100}%` }} /></div><p className="mt-2 flex justify-between gap-4 text-xs leading-6 text-slate-600"><span>{zh ? "1 从不" : "1 Never"}</span><span>{zh ? "5 几乎每次" : "5 Almost always"}</span></p></div>}
        <p className="mb-4 leading-7">{part.mean === null ? (zh ? "以下完整正文是通用读法，不是本次个人反应的结论。" : "The complete text below is a general guide, not a conclusion about your responses in this attempt.") : (zh ? "较高只记录更常认同题中的行动和明说的意图，不从普通暂停或帮忙推断动机，也不确定别人怎样想。请结合实际句子和场合阅读。" : "A higher mean records more frequent endorsement of the action and intention stated in each prompt. It does not infer motives from an ordinary pause or offer of help, or establish what someone else thinks. Read the actual statements in context.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`relationship-worry-habits-reading-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一反应的完整公开指南" : "Read this response’s full public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh ? "题目和读法为费马原创，尚未建立信效度、常模或跨语言等价。不识别menhera身份、依恋类型、心理健康状况或伴侣的在意程度，不决定是否继续关系。结果不要求披露、联系、监控或获得别人更多回应。" : "FermatMind authored these prompts and readings; reliability, validity, norms and language equivalence have not been established. They identify no menhera identity, attachment type, mental health condition or level of a partner’s care, and decide no relationship outcome. No disclosure, contact, monitoring or additional response from someone else is required."}</p>
  </div>;
}

export function RelationshipWorryHabitsNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-relationship-worry-habits-next-steps className="my-8 space-y-4 leading-8"><h3 className="text-xl font-semibold">{zh ? "保留自己的一个问题，或到这里结束" : "Keep one question of your own, or stop here"}</h3><p>{zh ? "如果有用，可选一句符合自己的题，私下写当时想知道什么。无需再问一次、试探对方、索取承诺、提供聊天记录或分享答案。全部完整指南已开放，也可以不再继续。" : "If useful, choose a statement that fits and privately note what you had wanted to know. No repeated question, check on another person, promise, message history or answer sharing is needed. All full guides are already available, and no further step is required."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Return to all tests"}</Link></section>;
}
