import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Bpi21Result, Bpi21Key } from "@/lib/questionnaires/bpi21";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function Bpi21Report({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<Bpi21Result, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="bpi21-summary-title">
      <h3 id="bpi21-summary-title" className="text-xl font-semibold">{zh ? "三个关联选择计数分别阅读" : "Read all three mapped-choice counts together"}</h3>
      <p className="leading-8">{zh ? "全部21项计分时，每项对应列加一、另两列加零，三个计数合计21。各列计数除以21乘100，一位小数；这是选择占比，不是身体含量、人群百分位或健康概率。独立取整后总和可能略有差异。" : "When all 21 items are scored, each choice adds one to its mapped column and zero to the others. The three counts sum to 21. Divide each count by 21 and multiply by 100, to one decimal. These are choice shares, without bodily quantities, population percentiles or health probabilities. Independent rounding may slightly change the displayed total."}</p>
      {!result.counts && <p data-bpi21-insufficient className="leading-8">{zh ? "本次已完成；存在未评分，不显示任何个人dosha计数或百分比。不补零、不改分母。无需补答，三篇全文仍在下方。" : "This attempt is complete. An unscored response withholds every personal dosha count and percentage, without a substituted zero or changed denominator. No further answers are required; all three full guides remain below."}</p>}
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const key = direction.id as Bpi21Key;
        return <div key={key} data-bpi21-record={key} className="space-y-2"><dt className="font-semibold leading-7">{direction.title[locale]}</dt><dd>
          {result.counts && result.percentages ? <><span data-bpi21-count>{result.counts[key]} / 21</span><span data-bpi21-percentage className="ml-3">{result.percentages[key].toFixed(1)}%</span></> : <span>{zh ? "资料不足" : "Insufficient information"}</span>}
        </dd></div>;
      })}</dl>
      <p className="text-sm leading-7">{zh ? "三个数字由同一组21项选择分配而来，不是三个独立测量。这里不实施最高类型、双dosha、Sama、潜在类别或IRT估计。平分照实保留，不打破并列。网站译文、未评分扩展与数字呈现未完成自己的验证。" : "All three numbers divide the same 21 choices; they are not three independent measurements. This display applies no highest type, dual-dosha or Sama classification, latent class or IRT estimate. Equal counts stay equal without a tie-break. The website translation, unscored extension and digital presentation have not completed their own validation."}</p>
    </section>
    <p className="leading-8">{zh ? "三篇八节全文全部保留，包括资料不足时。把文化框架、发表题本与个人选择记录分开阅读。" : "All three eight-section guides remain open, including when information is insufficient. Keep the cultural framework, published bank and personal choice record distinct."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-bpi21-profile={profile.id} aria-labelledby={`bpi21-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`bpi21-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一关联选项的公开说明" : "Read this mapped choice key’s public explanation"}</Link>
    </section>)}
  </div>;
}
