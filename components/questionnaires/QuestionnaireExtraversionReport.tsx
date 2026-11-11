import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { ExtraversionResult } from "@/lib/questionnaires/extraversion";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireExtraversionReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<ExtraversionResult, { status: "complete" }>; locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  const newTabLabel = zh ? displayText("（新标签页）") : " (new tab)";
  if (result.total === null || result.mean === null) return <section className="my-6 space-y-4 rounded-lg bg-slate-50 p-4" data-extraversion-insufficient>
    <h3 className="text-xl font-semibold">{zh ? displayText("资料不足，未生成分数或个人分区") : "Insufficient information: no score or personal band"}</h3>
    <p className="leading-8">{zh ? displayText(`本次有${result.rated}项有效评分，需要十项全部有效才能计分。暂不作答或无法判断不补成零分或中间值。可以重新测试，也可以直接阅读下面四份公开说明。`) : `${result.rated} of ten items have ratings. All ten are required for scoring. An unscored response is never replaced by zero or a midpoint. You can retake the test or read any of the four public guides below.`}</p>
    <ul>{quiz.profiles.map(profile => <li key={profile.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)} target="_blank" rel="noopener">{profile.title[locale]}{newTabLabel}</Link></li>)}</ul>
  </section>;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 sm:p-6" aria-label={zh ? displayText("本次外向性原始分数") : "Raw extraversion scores for this attempt"} data-extraversion-score>
      <h3 className="text-xl font-semibold">{zh ? displayText("十项原始分数与均分") : "Ten-item raw total and mean"}</h3>
      <dl className="space-y-3"><div className="flex justify-between gap-4"><dt>{zh ? displayText("原始总分（范围10—50）") : "Raw total (range 10–50)"}</dt><dd data-extraversion-total>{result.total}</dd></div><div className="flex justify-between gap-4"><dt>{zh ? displayText("均分（范围1—5）") : "Mean (range 1–5)"}</dt><dd data-extraversion-mean>{result.mean.toFixed(1)}</dd></div></dl>
      <div aria-hidden="true" className="grid gap-1">
        <div className="relative mx-2 h-2 rounded-full bg-indigo-200">
          <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-800" style={{ left: `${(result.total - 10) / 40 * 100}%` }} />
        </div>
        <div className="flex justify-between text-sm tabular-nums"><span>10</span><span>50</span></div>
      </div>
      <p className="text-sm leading-7">{zh ? displayText("五条正向题按原值计分，五条反向题按6减原回答。均分3只是回答尺度的中点，不是人群平均。总分20、30、40时保留相邻两份报告；这是本站阅读约定，不是IPIP官方分类、常模、百分位或置信区间。") : "Five positive items use the response; five negative items use 6 minus the response. A mean of three is the response-scale midpoint, not a population average. Totals of 20, 30 and 40 keep both adjacent reports. This is a website reading convention, not official IPIP classification, norms, percentiles or confidence intervals."}</p>
    </section>
    <nav className="space-y-2 border-l-2 border-indigo-200 pl-4" aria-label={zh ? displayText("从读数进入对应情境") : "Find the examples for your reading"}>
      <p className="leading-7">{zh ? displayText(`本次对应${result.scaleProfileIds.length}份完整说明，全部呈现在下方。标签帮助阅读一个连续维度，不是固定人格、社交能力或MBTI类型。`) : `This attempt corresponds to ${result.scaleProfileIds.length} full guide${result.scaleProfileIds.length === 1 ? "" : "s"}, all shown below. Labels help read one continuous dimension; they do not establish a fixed personality, social skill or MBTI type.`}</p>
      <ul className="flex flex-wrap gap-x-5">{result.scaleProfileIds.map(id => <li key={id}><a className="inline-flex min-h-11 items-center font-semibold text-indigo-950 underline underline-offset-4" href={`#extraversion-title-${id}`}>{quiz.profiles.find(profile => profile.id === id)!.title[locale]}</a></li>)}</ul>
    </nav>
    {result.scaleProfileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      return <section key={id} aria-labelledby={`extraversion-title-${id}`} data-extraversion-match={id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`extraversion-title-${id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`report-${id}`} mode="result" previewSectionIds={["meaning", "everyday", "experiment"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, id)} target="_blank" rel="noopener">{zh ? displayText("阅读这项结果的公开说明") : "Read this result’s public guide"}{newTabLabel}</Link>
      </section>;
    })}
  </div>;
}
