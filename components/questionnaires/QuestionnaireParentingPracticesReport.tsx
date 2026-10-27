import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

type Complete = Extract<FacetResult, { status: "complete" }>;

export function QuestionnaireParentingPracticesReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Complete; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-parenting-practices-result className="my-6 space-y-8">
    <section aria-labelledby="parenting-practices-summaries" className="space-y-4">
      <h3 id="parenting-practices-summaries" className="text-2xl font-semibold">{zh ? "过去四周的两项频率摘要" : "Two frequency summaries for the past four weeks"}</h3>
      <p className="leading-8">{zh
        ? "先读两个部分，再选择一项具体互动回看。它们分别概括你记得的温暖回应与日常边界行为；四种养育风格在下方作为通用框架解释，不由这两个数字派型。"
        : "Read the two parts, then choose one interaction to revisit. They separately summarize recalled warm responses and everyday boundary actions. The four styles below are general framework explanations; these numbers do not assign a type."}</p>
      {quiz.directions.map(direction => {
        const part = result.facets[direction.id];
        return <section key={direction.id} data-parenting-practices-part={direction.id}
          aria-labelledby={`parenting-practices-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
          <h4 id={`parenting-practices-${direction.id}`} className="text-xl font-semibold">{direction.title[locale]}</h4>
          <p data-parenting-practices-mean className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{part.mean === null
            ? (zh ? `资料不足：${part.rated} / 6项有数值回答，需要六项齐全。` : `Insufficient information: ${part.rated} / 6 items rated; all six are required.`)
            : (zh ? `均分：${part.mean.toFixed(1)} / 5（${part.sum} ÷ 6）` : `Mean: ${part.mean.toFixed(1)} / 5 (${part.sum} ÷ 6)`)}</p>
          <p className="leading-8">{part.mean === null
            ? (zh ? "不计分保留为暂缺，不补零或中点；另一完整部分照常显示。下面四份完整指南仍可阅读。" : "Unscored stays missing, without zero or midpoint imputation. A complete other part remains visible, and all four full guides are available below.")
            : direction.id === "warm-response"
              ? (zh ? "这六项回看倾听、承认感受、了解需要及回应的频率。可以选一次具体对话，看看哪些回应被记住、哪些仍不清楚。" : "These six items revisit the frequency of listening, acknowledging feelings, understanding needs and responding. Choose one conversation to examine what you recall and what remains unclear.")
              : (zh ? "这六项回看说明安排、解释调整、设定合理要求及落实边界的频率。可以选一次日常转换，核对要求是否具体、适龄且可实行。" : "These six items revisit explaining arrangements and changes, setting reasonable expectations and following through. Choose one everyday transition to check whether its expectations were specific, age-appropriate and workable.")}</p>
        </section>;
      })}
      <p className="leading-8 text-slate-600">{zh
        ? "均分是六项频率选项的摘要，不是实际次数百分比或养育质量评分。两项不合总分，也没有用于四风格分型的高低界线。"
        : "Each mean summarizes six frequency choices, rather than a percentage of occasions or a parenting-quality rating. The two parts are not combined, and no high/low cutoff assigns one of the four styles."}</p>
    </section>
    <section aria-labelledby="parenting-practices-guides" className="space-y-6">
      <h2 id="parenting-practices-guides" className="text-2xl font-semibold">{zh ? "四种风格的完整通用指南" : "Four complete general parenting-style guides"}</h2>
      <p className="leading-8">{zh ? "每个人都能阅读全部四份，比较概念、算例、日常情境与反例。打开指南不会改变你的作答或均分。" : "Everyone can read all four, comparing concepts, worked examples, everyday situations and counterexamples. Opening a guide does not change your answers or means."}</p>
      {quiz.profiles.map(profile => <section key={profile.id} data-parenting-practices-guide={profile.id}
        aria-labelledby={`parenting-practices-guide-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`parenting-practices-guide-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`parenting-practices-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "打开这份完整公开指南" : "Open this complete public guide"}</Link>
      </section>)}
    </section>
  </div>;
}

export function QuestionnaireParentingPracticesNextSteps({ result, locale }: { result: Complete; locale: Locale }) {
  const zh = locale === "zh";
  const unavailable = Object.values(result.facets).every(part => part.mean === null);
  return <section data-parenting-practices-next-steps className="rounded-lg border border-slate-200 p-4 sm:p-6">
    <h2 className="text-xl font-semibold">{unavailable
      ? (zh ? "本次作答已结束，可以从一个具体情境开始" : "This attempt is finished. You can start with one situation.")
      : (zh ? "把下一步放回一次实际互动" : "Bring the next step to one actual interaction")}</h2>
    <p className="mt-3 leading-8">{zh
      ? "可以选一次普通互动，先听清需要，再说明可实行的下一步与适合的帮助。不必为了提高均分增加规则，也无需让孩子负责改善结果。你可以阅读四份指南、重做，或在这里结束。"
      : "You can choose an ordinary interaction, listen to the need, then clarify a workable next step and suitable help. There is no need to add rules to raise a mean or ask a child to improve the result. Read the four guides, retake or finish here."}</p>
    <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
