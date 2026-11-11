import { ResultSection } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function FaceSelfImageReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <div data-face-self-image-report className="mt-6 space-y-8">

    <ResultSection title={zh ? copy("你在镜子、照片和相处里怎样看自己") : "How you see yourself in mirrors, photos and company"} description={zh ? copy("回看过去一个月四个场合里的体验频率。1 表示从不，5 表示几乎每次。可以直接选一个场合读例子。") : "Look back at how often you noticed these experiences across four settings in the past month. One means never and five means almost always. Pick a setting to read its example."} tone="framed" className="rounded-xl border border-stone-200 bg-stone-50/75" data-face-self-image-overview>
      <dl className="mt-3 grid gap-x-6 md:grid-cols-2">{quiz.directions.map(direction => {
        const part = result.facets[direction.id];
        return <div key={direction.id} className="min-w-0 border-t border-stone-200 py-2" data-face-self-image-overview-part={direction.id}>
          <dt><a className="inline-flex min-h-11 items-center py-1 font-semibold text-stone-950 underline decoration-stone-400 underline-offset-4" href={`#face-self-image-${direction.id}`}>{direction.title[locale]}</a></dt>
          <dd className="flex flex-wrap items-baseline gap-x-3"><strong className="tabular-nums">{part.mean === null ? (zh ? copy("资料不足") : "Insufficient information") : `${part.mean.toFixed(1)} / 5`}</strong>
            <span className="text-sm text-stone-600">{zh ? copy(`${part.rated}/${part.total} 条有效`) : `${part.rated}/${part.total} rated`}</span></dd>
        </div>;
      })}</dl>
    </ResultSection>
    {quiz.directions.map(direction => {
      const part = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-face-self-image-part={direction.id} aria-labelledby={`face-self-image-${direction.id}`} className="border-t border-slate-200 pt-7">
        <h3 id={`face-self-image-${direction.id}`} className="scroll-mt-24 text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-face-self-image-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{part.mean === null
          ? (zh ? copy(`资料不足：${part.rated}/4条有效，至少需3条；不显示个人均值或条形。`) : `Insufficient information: ${part.rated}/4 rated, at least 3 needed; no personal mean or bar.`)
          : (zh ? copy(`原始和 ${part.sum}，${part.rated}/4条有效，频率均值 ${part.mean.toFixed(1)} / 5`) : `Raw sum ${part.sum}; ${part.rated}/4 rated; frequency mean ${part.mean.toFixed(1)} / 5`)}</p>
        {part.mean !== null && <div className="mb-5"><div role="meter" aria-labelledby={`face-self-image-${direction.id}`} aria-valuemin={1} aria-valuemax={5} aria-valuenow={part.mean} aria-valuetext={zh ? copy(`原始自报频率${part.mean.toFixed(1)}，范围1从不至5几乎每次`) : `Raw self-reported frequency ${part.mean.toFixed(1)}, from 1 never to 5 almost always`} className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${(part.mean - 1) / 4 * 100}%` }} /></div><p className="mt-2 flex justify-between gap-4 text-xs leading-6 text-slate-600"><span>{zh ? copy("1 从不") : "1 Never"}</span><span>{zh ? copy("5 几乎每次") : "5 Almost always"}</span></p></div>}
        <p className="mb-4 leading-7">{part.mean === null ? (zh ? copy("以下完整正文是通用读法，不是本次个人自我形象的结论。") : "The complete text below is a general guide, not a conclusion about your self-image in this attempt.") : (zh ? copy("较高只记录更常认同这些时刻，不证明更好看、更健康、别人觉得你自信，或需要改变外表。请结合具体题目与场合阅读。") : "A higher mean records more frequent endorsement of these moments. It does not establish better looks, health, confidence as seen by others or a need to change appearance. Read the actual prompts in context.")}</p>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`face-self-image-reading-${profile.id}`} mode="result" previewSectionIds={[`${profile.id}-2`, `${profile.id}-6`]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一观察的完整公开指南") : "Read this observation’s full public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh ? copy("题目和读法为费马原创，尚未建立信效度、常模或跨语言等价。不使用照片、相机或AI分析，不测面部吸引力、偏差值、健康或他人印象，也不建议购买、打理或改变五官。") : "FermatMind authored these prompts and readings; reliability, validity, norms and language equivalence have not been established. No photograph, camera or AI analysis is used. This is not facial attractiveness, hensachi, health or another person’s impression, and no purchase, grooming or feature change is recommended."}</p>
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy("均值与未评分回答怎样计算") : "How means and unscored responses are handled"}</summary>
    <p className="leading-8">{zh ? copy("四项分别记录过去一个月自己一侧的体验。每项四条，至少三条数字才显示均值；3是有时，未评分不当零分。条形只定位原始1至5，不是颜值、百分比、人群位置或别人对你的评价。四项可以同时高、低或相同，不合总分或划分等级。") : "Four parts separately record your own experience over the past month. Each has four prompts and needs three numeric ratings for a mean. Three means sometimes; unscored answers are not zero. Bars locate the raw 1–5 mean, not beauty, a percentage, population position or someone else’s assessment. Parts can all be high, low or equal, without a total or assigned tier."}</p>
    </details>
  </div>;
}

export function FaceSelfImageNextSteps({ locale, displayLocale = locale, copy = text => text }: { locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-face-self-image-next-steps className="my-8 space-y-4 leading-8"><h3 className="text-xl font-semibold">{zh ? copy("保留一个场合观察，或到这里结束") : "Keep one observation about context, or stop here"}</h3><p>{zh ? copy("可以选一句题目，看看它在哪个普通场合更贴近自己。无需拍照、照镜练习、征求外貌评价、改变打理方式或分享答案。四份完整指南已经开放，也可以不再继续。") : "Choose one prompt and consider the ordinary setting in which it fits you better. No photograph, mirror exercise, appearance evaluation, change of routine or answer sharing is needed. All four full guides are already available, and no further step is required."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${displayLocale}/tests#more-tests`}>{zh ? copy("返回全部测试") : "Return to all tests"}</Link></section>;
}
