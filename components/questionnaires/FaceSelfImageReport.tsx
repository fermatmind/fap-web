import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function FaceSelfImageReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div data-face-self-image-report className="mt-6 space-y-8">
    <p className="leading-8">{zh ? "四项分别记录过去一个月自己一侧的体验。每项四条，至少三条数字才显示均值；3是有时，未评分不当零分。条形只定位原始1至5，不是颜值、百分比、人群位置或别人对你的评价。四项可以同时高、低或相同，不合总分或划分等级。" : "Four parts separately record your own experience over the past month. Each has four prompts and needs three numeric ratings for a mean. Three means sometimes; unscored answers are not zero. Bars locate the raw 1–5 mean, not beauty, a percentage, population position or someone else’s assessment. Parts can all be high, low or equal, without a total or assigned tier."}</p>
    {quiz.directions.map(direction => {
      const part = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-face-self-image-part={direction.id} aria-labelledby={`face-self-image-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`face-self-image-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-face-self-image-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{part.mean === null
          ? (zh ? `资料不足：${part.rated}/4条有效，至少需3条；不显示个人均值或条形。` : `Insufficient information: ${part.rated}/4 rated, at least 3 needed; no personal mean or bar.`)
          : (zh ? `原始和 ${part.sum}，${part.rated}/4条有效，频率均值 ${part.mean.toFixed(1)} / 5` : `Raw sum ${part.sum}; ${part.rated}/4 rated; frequency mean ${part.mean.toFixed(1)} / 5`)}</p>
        {part.mean !== null && <div className="mb-5"><div role="meter" aria-labelledby={`face-self-image-${direction.id}`} aria-valuemin={1} aria-valuemax={5} aria-valuenow={part.mean} aria-valuetext={zh ? `原始自报频率${part.mean.toFixed(1)}，范围1从不至5几乎每次` : `Raw self-reported frequency ${part.mean.toFixed(1)}, from 1 never to 5 almost always`} className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${(part.mean - 1) / 4 * 100}%` }} /></div><p className="mt-2 flex justify-between gap-4 text-xs leading-6 text-slate-600"><span>{zh ? "1 从不" : "1 Never"}</span><span>{zh ? "5 几乎每次" : "5 Almost always"}</span></p></div>}
        <p className="mb-4 leading-7">{part.mean === null ? (zh ? "以下完整正文是通用读法，不是本次个人自我形象的结论。" : "The complete text below is a general guide, not a conclusion about your self-image in this attempt.") : (zh ? "较高只记录更常认同这些时刻，不证明更好看、更健康、别人觉得你自信，或需要改变外表。请结合具体题目与场合阅读。" : "A higher mean records more frequent endorsement of these moments. It does not establish better looks, health, confidence as seen by others or a need to change appearance. Read the actual prompts in context.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`face-self-image-reading-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一观察的完整公开指南" : "Read this observation’s full public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh ? "题目和读法为费马原创，尚未建立信效度、常模或跨语言等价。不使用照片、相机或AI分析，不测面部吸引力、偏差值、健康或他人印象，也不建议购买、打理或改变五官。" : "FermatMind authored these prompts and readings; reliability, validity, norms and language equivalence have not been established. No photograph, camera or AI analysis is used. This is not facial attractiveness, hensachi, health or another person’s impression, and no purchase, grooming or feature change is recommended."}</p>
  </div>;
}

export function FaceSelfImageNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-face-self-image-next-steps className="my-8 space-y-4 leading-8"><h3 className="text-xl font-semibold">{zh ? "保留一个场合观察，或到这里结束" : "Keep one observation about context, or stop here"}</h3><p>{zh ? "可以选一句题目，看看它在哪个普通场合更贴近自己。无需拍照、照镜练习、征求外貌评价、改变打理方式或分享答案。四份完整指南已经开放，也可以不再继续。" : "Choose one prompt and consider the ordinary setting in which it fits you better. No photograph, mirror exercise, appearance evaluation, change of routine or answer sharing is needed. All four full guides are already available, and no further step is required."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Return to all tests"}</Link></section>;
}
