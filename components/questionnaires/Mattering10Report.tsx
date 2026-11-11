import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { scoreMattering10, type Mattering10Questionnaire, type Mattering10Result } from "@/lib/questionnaires/mattering10";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
type Readout = Extract<Mattering10Result, { scales: unknown }>;
export function Mattering10Report({ quiz, result, locale, readingProfiles }: { quiz: Mattering10Questionnaire; result: Readout; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[] }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  const answers = Object.fromEntries(result.scales.flatMap(s => s.contributions.map(p => [p.id, String(p.value)])));
  const checked = scoreMattering10(quiz, answers);
  if (JSON.stringify(checked) !== JSON.stringify(result)) return <p role="status">{zh ? displayText("读数暂不可用，请清除后重试。") : "Readout unavailable. Clear and try again."}</p>;
  return <div data-mattering10-result className="my-6 space-y-8">
    <section className="space-y-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-4 sm:p-6" aria-labelledby="mattering-readouts-title">
      <h3 id="mattering-readouts-title" className="text-xl font-semibold text-violet-950">{zh ? displayText("两种经历分别读") : "Read each experience separately"}</h3>
      <p className="max-w-prose leading-7">{zh ? displayText("两项分数分别阅读，不合并、不相减、不排名。相同数字没有特殊含义。选一项可看计分与日常例子。") : "Read the totals separately without combining, subtracting or ranking them. Equal numbers have no special meaning. Select either total for its calculation and an everyday example."}</p>
      <div className="grid gap-3 sm:grid-cols-2">{result.scales.map((scale, index) => <a key={scale.id} href={`#mattering-reading-${scale.id}`} className="block min-w-0 rounded-xl border border-violet-200 bg-white px-4 py-3 text-violet-950">
        <span className="block font-semibold underline decoration-violet-400 underline-offset-4">{quiz.directions[index].title[locale]} ({scale.id})</span>
        <span className="mt-1 block text-xl font-semibold tabular-nums">{scale.total === null ? (zh ? displayText("资料不足") : "Insufficient information") : `${scale.total} / 20`}</span>
        <span className="block text-sm leading-7">{zh ? displayText(`可得范围 5–20 · ${scale.answered}/5 题`) : `Possible range 5–20 · ${scale.answered}/5 items`}</span>
      </a>)}</div>
    </section>
    {result.scales.map((s, i) => {
      const profile = quiz.profiles[i];
      const readingProfile = readingProfiles?.find(item => item.id === profile.id && item.directionIds.length === 1 && item.directionIds[0] === s.id && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === profile.id) ?? profile;
      return <section key={s.id} data-mattering10-scale={s.id} className="rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
      <h3 id={`mattering-reading-${s.id}`} className="scroll-mt-24 text-2xl font-semibold">{quiz.directions[i].title[locale]} ({s.id})</h3>
      <p data-mattering10-total={s.id} className="my-4 text-xl font-semibold">{s.total === null ? (zh ? displayText(`资料不足：${s.answered}/5题`) : `Incomplete: ${s.answered}/5 items`) : `${s.total} (${zh ? displayText("可得范围") : "possible range"}: 5–20)`}</p>
      <p className="leading-8">{quiz.profiles[i].scoreReading[locale]}</p>
      {s.total !== null && <p className="my-4 leading-8">{s.contributions.map(p => p.value).join(" + ")} = {s.total}</p>}
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`mattering10-${s.id}`} mode="result" previewSectionIds={["example", "action"]} />
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, quiz.profiles[i].id)}>{zh ? displayText("单独阅读这份完整指南") : "Read this full guide separately"}</Link>
    </section>; })}
  </div>;
}
