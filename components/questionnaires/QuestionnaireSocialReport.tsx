import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireSocialReport({ quiz, result, locale, displayLocale = locale, copy = value => value }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh", facet = result.facets["social-intelligence"], total = facet.rated === 4 ? facet.sum : null;
  const missing = zh ? copy("资料不足") : "Insufficient information";
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/65 p-4 sm:p-6" aria-labelledby="social-total-title">
      <h3 id="social-total-title" className="text-xl font-semibold">{zh ? copy("IPIP-VIA-R社交理解四条原始分数") : "The four-item IPIP-VIA-R social-understanding raw score"}</h3>
      <dl data-social-facet="social-intelligence" className="space-y-3">
        <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? copy("原始总分（4—20）") : "Raw total (4–20)"}</dt><dd data-social-total>{total === null ? missing : total}</dd></div>
        <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? copy("描述性均分（1—5）") : "Descriptive mean (1–5)"}</dt><dd data-social-mean>{total === null ? missing : `${(total / 4).toFixed(2)} / 5`}</dd></div>
        <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? copy("本次有效条目") : "Ratings supplied"}</dt><dd data-social-rated>{zh ? copy(`${facet.rated} / 4条有效符合度评分`) : `${facet.rated} / 4 rated accuracy items`}</dd></div>
      </dl>
      <p className="leading-8">{zh ? copy("按呈现顺序，两条正向直接计分，两条反向（第2、4条）按6减有效回答。四条全部有效才给4—20原始总分，均分用未舍入总和除4，不从一位小数均分倒推。任一NA保留不足，不补零、中立或按三条估算。") : "In presentation order, the two positive items are direct and the two negative items, second and fourth, use six minus the rating. All four ratings are required for a raw total of 4–20. The mean divides the unrounded sum by four, never reconstructing it from a one-decimal mean. Any NA retains insufficient information without zero, neutral or estimates from three items."}</p>
      {total === null && <p data-social-insufficient className="leading-8">{zh ? copy("本次作答已结束，没有生成个人总分或均分。可以重测，下面完整说明仍可阅读。") : "This attempt is finished without a personal total or mean. You can retake it; the full guide remains readable below."}</p>}
      <p className="text-sm leading-7">{zh ? copy("较高较低只描述这四条的自报方向，不证明真实能力、读心、共情或IQ／EQ。12可来自不同组合，不认证平衡或人群平均。与本站品格优势中的同一四条复用题目和键向，独立作答语境仍可能改变回答；公有领域许可不等于中文或个人结果验证。") : "Higher and lower describe self-reports on these four items, not demonstrated ability, mind-reading, empathy or IQ/EQ. Twelve can come from different patterns without an ideal balance or population average. Items and keys are shared with the same facet in our character-strengths form; separate administration can still affect responses. Public-domain permission establishes no Chinese or individual validation."}</p>
      <aside className="border-l-2 border-sky-300 pl-4 leading-7">
        <p>{zh ? copy("回想一次你试着读懂别人意思的情境。下面的例子可以帮助你分开看观察、猜测和向对方确认。") : "Think of a time you tried to understand someone. The examples distinguish what you noticed, what you guessed and what you checked with them."}</p>
        <a className="inline-flex min-h-11 items-center font-semibold text-sky-950 underline underline-offset-4" href={`#social-title-${quiz.profiles[0].id}`}>{zh ? copy("从本次读数继续看相处例子") : "Continue from your result to social examples"}</a>
      </aside>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} data-social-profile={profile.id} aria-labelledby={`social-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`social-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["higher-reading", "lower-reading", "examples", "review-privacy"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读社交理解的完整公开说明") : "Read the full public social-understanding guide"}</Link>
    </section>)}
  </div>;
}
