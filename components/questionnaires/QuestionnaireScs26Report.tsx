import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Scs26Result } from "@/lib/questionnaires/scs26";
import { formatScs26Mean } from "@/lib/questionnaires/scs26";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireScs26Report({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<Scs26Result, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh", score = result.scs26;
  return <div data-scs26-result className="mt-6 space-y-8">
    <section className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby="scs26-overall-heading">
      <h3 id="scs26-overall-heading" className="text-2xl font-semibold">{zh ? "本次 SCS 整体均分" : "Your SCS overall mean"}</h3>
      <p data-scs26-overall className="my-4 rounded-lg bg-slate-50 p-4 text-xl font-semibold">{score.overallNumerator === null
        ? (zh ? `资料不足：${score.rated}/26 题有量表回答；${score.skipped}题跳过，不计算整体均分。` : `Insufficient information: ${score.rated}/26 scale responses; ${score.skipped} skipped. No overall mean is calculated.`)
        : (zh ? `${formatScs26Mean(score.overallNumerator, 120)}（1到5；26/26题有效）` : `${formatScs26Mean(score.overallNumerator, 120)} (1 to 5; 26/26 scale responses)`)}</p>
      <p className="leading-8 text-slate-700">{zh ? "先将三个负向部分反向，分别算六个未取舍的部分均值，再平均。不是直接平均26题，也不提前平均屏幕上的两位小数。整体均分较大，表示在这些条目定义下报告了较多自我慈悲回应；不代表个人价值、诊断、百分位或招聘资格。" : "The three negative parts are reversed first. Six unrounded part means are then averaged, rather than averaging all 26 items or already-rounded screen values. A larger overall mean reflects more compassionate responding as defined by these items, without measuring personal worth, diagnosis, percentile or hiring eligibility."}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{zh ? "完整26题SCS，注明Neff（2003）并依许可使用。中文为费马新工作译本，尚无心理测量验证或跨语言等值证据。不套用非正式高低分档或成长阶段；缺答不是零，不估算。" : "The full 26-item SCS is used with permission and attribution to Neff (2003). Chinese is a new FermatMind working translation, without psychometric validation or established language equivalence. No informal high/low bands or growth stages are applied. Missing is not zero and is not imputed."}</p>
    </section>
    <section aria-labelledby="scs26-parts-heading">
      <h3 id="scs26-parts-heading" className="mb-4 text-2xl font-semibold">{zh ? "六部分：先看原始与反向标签" : "Six parts: read the raw and reversed labels"}</h3>
      <div className="space-y-4">{quiz.directions.map(direction => {
        const part = score.parts[direction.id as keyof typeof score.parts];
        const negative = ["self-judgment", "isolation", "over-identification"].includes(direction.id);
        return <section key={direction.id} data-scs26-part={direction.id} className="rounded-lg border border-slate-200 p-4">
          <h4 className="text-lg font-semibold">{direction.title[locale]}</h4>
          {part.rawMean === null ? <p data-scs26-part-score className="mt-2 leading-7">{zh ? `资料不足：${part.rated}/${part.total}题有量表回答；不计算本部分均分。` : `Insufficient information: ${part.rated}/${part.total} scale responses. No mean for this part.`}</p>
            : <div data-scs26-part-score className="mt-2 space-y-2 leading-7">
              <p>{zh ? `原始均分：${formatScs26Mean(part.rawSum, part.total)}` : `Raw mean: ${formatScs26Mean(part.rawSum, part.total)}`}</p>
              <p>{negative
                ? (zh ? `反向均分（进入整体分）：${formatScs26Mean(part.keyedSum, part.total)}；越大表示报告的${direction.title.zh}越少。` : `Reversed mean (used in overall): ${formatScs26Mean(part.keyedSum, part.total)}; larger means less reported ${direction.title.en.toLowerCase()}.`)
                : (zh ? `计分后均分（进入整体分）：${formatScs26Mean(part.keyedSum, part.total)}；与原始均分相同。` : `Keyed mean (used in overall): ${formatScs26Mean(part.keyedSum, part.total)}; the same as the raw mean.`)}</p>
              <p className="text-sm text-slate-600">{zh ? `完整度：${part.rated}/${part.total}题；不排名，不设切点。` : `Completeness: ${part.rated}/${part.total} items; no ranking or cutoffs.`}</p>
            </div>}
        </section>;
      })}</div>
      <p className="mt-4 leading-8 text-slate-700">{zh ? "一题跳过只暂不给所在部分与整体均分，其他完整部分保留。相同或接近的数值不产生赢家，不证明差异有意义，也不能用来比较两个人的价值或能力。" : "A skip withholds its part and the overall mean; other complete parts remain available. Equal or close values create no winner and do not establish meaningful differences or compare people’s worth or ability."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`scs26-guide-${profile.id}`}>
      <h3 id={`scs26-guide-${profile.id}`} className="mb-4 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`scs26-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这份公开完整指南" : "Read this complete public guide"}</Link>
    </section>)}
  </div>;
}
