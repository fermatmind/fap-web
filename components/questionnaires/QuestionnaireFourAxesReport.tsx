import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { FOUR_AXES_IDS, type FourAxesQuestionnaire, type FourAxesResult } from "@/lib/questionnaires/fourAxes";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

type Complete = Extract<FourAxesResult, { status: "complete" }>;
export function QuestionnaireFourAxesReport({ quiz, result, locale, readingProfiles }: { quiz: FourAxesQuestionnaire; result: Complete; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[] }) {
  const zh = locale === "zh";
  const valid = result.status === "complete" && result.answered === 60 && FOUR_AXES_IDS.every(id => {
    const a = result.axes[id];
    return a && a.count === 15 && Number.isInteger(a.sum) && a.sum >= 0 && a.sum <= 60
      && a.highPercent === a.sum / 60 * 100 && a.lowPercent === 100 - a.highPercent;
  });
  if (!valid) return <p role="status">{zh ? "本次结果暂不可用，可以清除后重新开始。" : "This result is unavailable. Clear it and start again."}</p>;
  return <div data-four-axes-result className="my-6 space-y-8">
    <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 sm:p-6" aria-labelledby="four-axes-readout-title">
      <h3 id="four-axes-readout-title" className="text-xl font-semibold text-violet-950">{zh ? "四条轴，四个本次位置" : "Your position on each of the four axes"}</h3>
      <p className="mt-3 max-w-prose leading-7">{quiz.fourAxes.scoreExplanation[locale]}</p>
      <div className="mt-5 grid gap-x-6 md:grid-cols-2">
        {quiz.fourAxes.axes.map(axis => {
          const value = result.axes[axis.id];
          return <a key={axis.id} href={`#four-axes-${axis.id}`} className="min-w-0 border-t border-violet-200 py-3">
            <span className="block font-semibold text-violet-950 underline decoration-violet-400 underline-offset-4">{axis.title[locale]}</span>
            <span className="mt-2 flex justify-between gap-2 text-sm leading-6"><span>{axis.low[locale]} {value.lowPercent.toFixed(1)}%</span><span className="text-right">{axis.high[locale]} {value.highPercent.toFixed(1)}%</span></span>
            <span aria-hidden="true" className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-violet-100"><span className="bg-violet-700" style={{ width: `${value.lowPercent}%` }} /><span className="bg-teal-600" style={{ width: `${value.highPercent}%` }} /></span>
          </a>;
        })}
      </div>
    </section>
    {quiz.fourAxes.axes.map(axis => {
      const value = result.axes[axis.id], profile = quiz.profiles.find(p => p.id === axis.id)!;
      const readingProfile = readingProfiles?.find(item => item.id === profile.id && item.directionIds.length === 1 && item.directionIds[0] === axis.id && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === profile.id) ?? profile;
      return <section key={axis.id} data-four-axes-part={axis.id} aria-labelledby={`four-axes-${axis.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`four-axes-${axis.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{axis.title[locale]}</h3>
        <p className="my-3 leading-8">{axis.definition[locale]}</p>
        <div role="img" aria-label={`${axis.low[locale]} ${value.lowPercent.toFixed(1)}%; ${axis.high[locale]} ${value.highPercent.toFixed(1)}%`} className="my-4">
          <div className="flex justify-between gap-4 text-sm leading-7"><span>{axis.low[locale]} {value.lowPercent.toFixed(1)}%</span><span className="text-right">{axis.high[locale]} {value.highPercent.toFixed(1)}%</span></div>
          <div aria-hidden="true" className="mt-2 flex h-4 overflow-hidden rounded-full bg-violet-100"><div className="bg-violet-700" style={{ width: `${value.lowPercent}%` }} /><div className="bg-teal-600" style={{ width: `${value.highPercent}%` }} /></div>
        </div>
        <p data-four-axes-sum className="mb-5 text-sm leading-7">{zh ? `原始和：${value.sum} / 60；高端位置：${value.sum} ÷ 60 × 100。显示一位小数。` : `Raw sum: ${value.sum} / 60; high-end position: ${value.sum} ÷ 60 × 100. Displayed to one decimal.`}</p>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile} locale={locale} headingLevel={4} idPrefix={`four-axes-report-${profile.id}`} mode="result" previewSectionIds={["meaning", "context", "reflection"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "单独阅读本轴完整公开指南" : "Read this axis’s complete public guide separately"}</Link>
      </section>;
    })}
    <p className="rounded-lg border border-slate-200 p-4 leading-8">{quiz.fourAxes.privacy[locale]}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </div>;
}
