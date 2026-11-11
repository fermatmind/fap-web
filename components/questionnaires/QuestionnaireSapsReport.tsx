import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { SapsDomain, SapsResult } from "@/lib/questionnaires/saps";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnaireSapsReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<SapsResult, { status: "complete" }>; locale: Locale;
}) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <div data-saps-result className="mt-6 space-y-8">
    <section className="rounded-xl border border-stone-300 bg-stone-50 p-4 sm:p-6" aria-labelledby="saps-readout-title">
      <h3 id="saps-readout-title" className="text-xl font-semibold text-stone-950">{zh ? displayText("想做到怎样，和感觉做到多少") : "The standards you set and how close you feel to them"}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {quiz.directions.map(direction => {
          const score = result.sapsDomains[direction.id as SapsDomain];
          return <a key={direction.id} href={`#saps-title-${direction.id}`} className="min-w-0 border-t border-stone-300 py-3">
            <span className="block font-semibold text-stone-950 underline decoration-stone-500 underline-offset-4">{direction.title[locale]}</span>
            <span className="mt-2 block text-2xl font-semibold tabular-nums">{score.mean.toFixed(2)} / 7</span>
            <span className="block text-sm leading-6">{zh ? displayText(`原始和 ${score.sum}，四题有效`) : `Raw sum ${score.sum}, four valid items`}</span>
          </a>;
        })}
      </div>
    </section>
    <p className="leading-8 text-slate-700">{zh
      ? displayText("八题均有有效回答。标准与差距分别呈现四题原始总和及均值，不合成完美主义百分比、人口排名、类型或诊断。两篇完整指南始终可以阅读。")
      : "All eight responses are valid. Standards and Discrepancy show separate four-item sums and means, without a combined perfectionism percentage, population rank, type or diagnosis. Both complete guides remain available."}</p>
    <p className="text-sm leading-7 text-slate-600">{zh
      ? displayText("中文为经费马编辑复核的工作译稿，尚未独立验证或建立跨语言等价；不是量表原作者审阅或认可的中文版本。")
      : "Chinese is a working translation reviewed by FermatMind editors, without independent validation or established language equivalence. It is not a Chinese version reviewed or endorsed by the scale’s original authors."}</p>
    {quiz.directions.map(direction => {
      const score = result.sapsDomains[direction.id as SapsDomain];
      const profile = quiz.profiles.find(candidate => candidate.directionIds[0] === direction.id)!;
      return <section className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`saps-title-${direction.id}`}>
        <h3 id={`saps-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-saps-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 text-xl font-semibold">{zh
          ? displayText(`四题均值：${score.mean.toFixed(2)}（范围 1—7；4/4题有效）`)
          : `Four-item mean: ${score.mean.toFixed(2)} (range 1–7; 4/4 valid)`}</p>
        <p data-saps-sum={direction.id} className="mb-4 leading-7 text-slate-600">{zh
          ? displayText(`四题原始总和：${score.sum}（范围 4—28）。均值是总和除以4，不是人群百分位。`)
          : `Four-item raw sum: ${score.sum} (range 4–28). The mean is the sum divided by four, not a population percentile.`}</p>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`saps-reading-${profile.id}`} mode="result" previewSectionIds={["3", "6"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh
          ? displayText("阅读这一维度的完整公开指南") : "Read this dimension’s complete public guide"}</Link>
      </section>;
    })}
  </div>;
}

export function QuestionnaireSapsNextSteps({ locale }: { locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <section data-saps-next-steps className="my-6 space-y-3 leading-8">
    <h3 className="text-xl font-semibold">{zh ? displayText("保留一个具体观察，或到这里结束") : "Keep one concrete observation, or stop here"}</h3>
    <p>{zh ? displayText("可以先读两篇完整指南，选一个与实际任务有关的问题。两个均值不替你选择人格类型；也可以不采取下一步。") : "Read either complete guide and choose a question connected with an actual task. The two means do not select a personality type for you, and no further step is required."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests#more-tests`}>{zh ? displayText("返回全部测试") : "Return to all tests"}</Link>
  </section>;
}
