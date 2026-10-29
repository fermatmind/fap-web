import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { scoreMattering10, type Mattering10Questionnaire, type Mattering10Result } from "@/lib/questionnaires/mattering10";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";
type Readout = Extract<Mattering10Result, { scales: unknown }>;
export function Mattering10Report({ quiz, result, locale }: { quiz: Mattering10Questionnaire; result: Readout; locale: Locale }) {
  const zh = locale === "zh";
  const answers = Object.fromEntries(result.scales.flatMap(s => s.contributions.map(p => [p.id, String(p.value)])));
  const checked = scoreMattering10(quiz, answers);
  if (JSON.stringify(checked) !== JSON.stringify(result)) return <p role="status">{zh ? "读数暂不可用，请清除后重试。" : "Readout unavailable. Clear and try again."}</p>;
  return <div data-mattering10-result className="my-6 space-y-8">
    <p className="leading-8">{zh ? "两项分数分别阅读；不合并、不相减、不排名。相同数字没有特殊含义。" : "Read separately: do not combine, subtract or rank the totals. Equal numbers have no special meaning."}</p>
    {result.scales.map((s, i) => <section key={s.id} data-mattering10-scale={s.id} className="rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
      <h3 className="text-2xl font-semibold">{quiz.directions[i].title[locale]} ({s.id})</h3>
      <p data-mattering10-total={s.id} className="my-4 text-xl font-semibold">{s.total === null ? (zh ? `资料不足：${s.answered}/5题` : `Incomplete: ${s.answered}/5 items`) : `${s.total} (${zh ? "可得范围" : "possible range"}: 5–20)`}</p>
      <p className="leading-8">{quiz.profiles[i].scoreReading[locale]}</p>
      {s.total !== null && <p className="my-4 leading-8">{s.contributions.map(p => p.value).join(" + ")} = {s.total}</p>}
      <QuestionnaireReport profile={quiz.profiles[i]} locale={locale} headingLevel={4} idPrefix={`mattering10-${s.id}`} />
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "单独阅读这份完整指南" : "Read this full guide separately"}</Link>
    </section>)}
  </div>;
}
