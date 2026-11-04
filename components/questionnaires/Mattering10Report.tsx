import { ResultSection, ResultReadingNav, ResultScoreRow } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { scoreMattering10, type Mattering10Questionnaire, type Mattering10Result } from "@/lib/questionnaires/mattering10";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
type Readout = Extract<Mattering10Result, { scales: unknown }>;
export function Mattering10Report({ quiz, result, locale, readingProfiles }: { quiz: Mattering10Questionnaire; result: Readout; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[] }) {
  const zh = locale === "zh";
  const answers = Object.fromEntries(result.scales.flatMap(s => s.contributions.map(p => [p.id, String(p.value)])));
  const checked = scoreMattering10(quiz, answers);
  if (JSON.stringify(checked) !== JSON.stringify(result)) return <p role="status">{zh ? "读数暂不可用，请清除后重试。" : "Readout unavailable. Clear and try again."}</p>;
  return <div data-mattering10-result className="my-6 space-y-8">
    <p className="leading-8">{zh ? "两项分数分别阅读；不合并、不相减、不排名。相同数字没有特殊含义。" : "Read separately: do not combine, subtract or rank the totals. Equal numbers have no special meaning."}</p>
    <ResultSection title={zh ? "两项独立读数" : "Two separate readouts"}>
      <div className="grid gap-x-8 sm:grid-cols-2">{result.scales.map((scale, index) => <ResultScoreRow key={scale.id} label={quiz.directions[index].title[locale]} value={scale.total === null ? (zh ? "资料不足" : "Insufficient information") : `${scale.total} / 20`} score={scale.total} min={5} max={20} description={zh ? `可得范围5–20；${scale.answered}/5题已答` : `Possible range 5–20; ${scale.answered}/5 answered`} />)}</div>
    </ResultSection>
    <ResultReadingNav label={zh ? "完整读法" : "Full readings"} sections={result.scales.map((scale, index) => ({ id: `mattering-reading-${scale.id}`, title: quiz.directions[index].title[locale] }))} />
    {result.scales.map((s, i) => {
      const profile = quiz.profiles[i];
      const readingProfile = readingProfiles?.find(item => item.id === profile.id && item.directionIds.length === 1 && item.directionIds[0] === s.id && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === profile.id) ?? profile;
      return <section key={s.id} data-mattering10-scale={s.id} className="rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
      <h3 id={`mattering-reading-${s.id}`} className="scroll-mt-24 text-2xl font-semibold">{quiz.directions[i].title[locale]} ({s.id})</h3>
      <p data-mattering10-total={s.id} className="my-4 text-xl font-semibold">{s.total === null ? (zh ? `资料不足：${s.answered}/5题` : `Incomplete: ${s.answered}/5 items`) : `${s.total} (${zh ? "可得范围" : "possible range"}: 5–20)`}</p>
      <p className="leading-8">{quiz.profiles[i].scoreReading[locale]}</p>
      {s.total !== null && <p className="my-4 leading-8">{s.contributions.map(p => p.value).join(" + ")} = {s.total}</p>}
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile} locale={locale} headingLevel={4} idPrefix={`mattering10-${s.id}`} mode="result" previewSectionIds={["example", "action"]} />
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "单独阅读这份完整指南" : "Read this full guide separately"}</Link>
    </section>; })}
  </div>;
}
