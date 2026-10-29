import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function RelationshipHabitsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div data-relationship-habits-report className="mt-6 space-y-8">
    <p className="leading-8">{zh ? "四项记录过去三个月自己一侧的原始频率。每项四条，至少三条数字才显示均值；3表示有时，未评分保持缺失。四项可同时高、低或相同，不合红旗总分、不排名或派型，也不评判另一人。条形只定位1至5，不是百分比或危险程度。" : "Four parts record raw self-reported frequency on your own side over the past three months. Each has four prompts and needs three numeric ratings for a mean. Three means sometimes; unscored responses remain missing. Parts can all be high, low or equal, without a red-flag total, rank, assigned type or judgement of another person. Bars locate 1–5, not a percentage or danger level."}</p>
    {quiz.directions.map(direction => {
      const part = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-relationship-habits-part={direction.id} aria-labelledby={`relationship-habit-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`relationship-habit-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-relationship-habits-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{part.mean === null
          ? (zh ? `资料不足：${part.rated}/4条有效，至少需3条；不显示个人均值或条形。` : `Insufficient information: ${part.rated}/4 rated, at least 3 needed; no personal mean or bar.`)
          : (zh ? `原始和 ${part.sum}，${part.rated}/4条有效，频率均值 ${part.mean.toFixed(1)} / 5` : `Raw sum ${part.sum}; ${part.rated}/4 rated; frequency mean ${part.mean.toFixed(1)} / 5`)}</p>
        {part.mean !== null && <div className="mb-5">
          <div role="meter" data-relationship-habits-bar={direction.id} aria-labelledby={`relationship-habit-${direction.id}`} aria-valuemin={1} aria-valuemax={5} aria-valuenow={part.mean} aria-valuetext={zh ? `自报原始频率${part.mean.toFixed(1)}，范围1从不至5几乎每次` : `Raw self-reported frequency ${part.mean.toFixed(1)}, from 1 never to 5 almost always`} className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${(part.mean - 1) / 4 * 100}%` }} /></div>
          <p className="mt-2 flex justify-between gap-4 text-xs leading-6 text-slate-600"><span>{zh ? "1 从不" : "1 Never"}</span><span>{zh ? "5 几乎每次" : "5 Almost always"}</span></p>
        </div>}
        <p className="mb-4 leading-7">{part.mean === null
          ? (zh ? "以下完整正文是通用读法，不是本次个人习惯的结论。" : "The complete text below is a general guide, not a conclusion about your habits in this attempt.")
          : (zh ? "较高只表示本组时刻更常被你报告，不确定动机、客观公平、后果或别人的感受。请结合实际题目和场合阅读。" : "A higher mean records more frequent endorsement of these moments. It does not establish motives, objective fairness, outcomes or another person’s feelings. Read the actual prompts in context.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`relationship-habits-reading-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一习惯的完整公开指南" : "Read this habit’s full public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh ? "题目与读法为费马原创，尚未建立信效度、常模或跨语言测量等价。只描述自己的选定近期场合，不作诊断、安全或虐待评估，也不决定一段关系是否应继续。" : "FermatMind authored these prompts and readings; reliability, validity, norms and language equivalence have not been established. They describe only your selected recent context, without a diagnosis, safety or abuse assessment, or a decision about continuing a relationship."}</p>
  </div>;
}

export function RelationshipHabitsNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-relationship-habits-next-steps className="my-8 space-y-4 leading-8"><h3 className="text-xl font-semibold">{zh ? "保留一个具体观察，或到这里结束" : "Keep one concrete observation, or stop here"}</h3><p>{zh ? "可以选一条题，想想当时的场合，不必分享答案、联系另一人或让别人也来作答。若另外想观察冲突中怎样表达暂停、回到具体问题和修复，可以独立阅读冲突过程测试；它是另一任务，不从本次四项频率推算。也可不再继续。" : "Choose one prompt and consider its setting, without sharing answers, contacting another person or asking them to take the test. To observe expressing a pause, returning to a specific issue and repair during conflict, you may separately explore the conflict-process test. That is a different task and is not inferred from these four frequencies. No further step is required."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnairePath(locale, "love-fight-style")}>{zh ? "可选：了解不同的冲突过程自我观察" : "Optional: explore the distinct conflict-process reflection"}</Link><br /><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Return to all tests"}</Link></section>;
}
