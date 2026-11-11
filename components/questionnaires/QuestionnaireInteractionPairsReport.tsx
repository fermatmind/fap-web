"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";

import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { InteractionPairsResult } from "@/lib/questionnaires/interactionPairs";
import type { Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnaireInteractionPairsReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<InteractionPairsResult, { status: "complete" }>;
  locale: Locale;
}) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" className="my-6 space-y-8" data-interaction-pairs-result>
    <section className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/50 p-4 sm:p-6" aria-labelledby="interaction-choice-overview">
      <h3 id="interaction-choice-overview" className="text-xl font-semibold text-fuchsia-950">{zh ? displayText("这六次，你更常选哪边") : "Which side did you pick in these six choices?"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? displayText("每组的小格各表示一次选择。两边都是可选做法，三比三时原样呈现。点开主题可看两侧在对话中怎么用。") : "Each block is one choice within a pair. Both sides are options, and three choices each stays a tie. Open a pair to see both options in conversation."}</p>
      <div className="mt-4 grid gap-x-6 lg:grid-cols-2">
        {result.interactionPairs.map(pair => {
          const profile = quiz.profiles.find(item => item.id === pair.profileId)!;
          const [left, right] = profile.directionIds;
          return <article key={pair.id} className="min-w-0 border-t border-fuchsia-200 py-2">
            <a href={`#interaction-${pair.id}`} className="inline-flex min-h-11 items-center font-semibold text-fuchsia-950 underline decoration-fuchsia-400 underline-offset-4">{profile.title[locale]}</a>
            <p className="grid grid-cols-2 gap-2 text-sm leading-6">{[left, right].map(id => <span key={id} className="min-w-0 last:text-right">{quiz.directions.find(direction => direction.id === id)!.title[locale]} <strong className="tabular-nums">{pair.counts[id]}</strong></span>)}</p>
            <div aria-hidden="true" className="mt-2 grid grid-cols-6 gap-1">{Array.from({ length: 6 }, (_, index) => <span key={index} className={`h-2 rounded-sm ${index < pair.counts[left] ? "bg-fuchsia-700" : "bg-indigo-500"}`} />)}</div>
          </article>;
        })}
      </div>
    </section>

    {result.interactionPairs.map(pair => {
      const profile = quiz.profiles.find(p => p.id === pair.profileId)!;
      return <section key={pair.id} data-interaction-pair={pair.id} aria-labelledby={`interaction-${pair.id}`}
        className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`interaction-${pair.id}`} className="scroll-mt-24 text-xl font-semibold">{profile.title[locale]}</h3>
        <dl className="my-4 space-y-3" aria-label={zh ? displayText("本组原始选择次数") : "Raw choices within this comparison"}>
          {profile.directionIds.map(id => <div key={id} data-interaction-pole={id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-slate-200 py-3">
            <dt>{quiz.directions.find(d => d.id === id)!.title[locale]}</dt>
            <dd className="font-semibold" data-interaction-count>{pair.counts[id]} / 6</dd>
          </div>)}
        </dl>
        <p className="mb-5 leading-8" data-interaction-tie={pair.leaders.length === 2 ? "true" : "false"}>{pair.leaders.length === 2
          ? (zh ? displayText("两侧各三次，保留并列；这不证明完美平衡，也不需要改答来选出唯一方向。") : "Three choices each: both sides remain. A tie does not prove perfect balance, and you need not change answers to produce a single direction.")
          : (zh ? displayText("本组一侧次数较多，只表示这六次相对选择；较少的一侧仍有完整解释，不表示缺失或缺点。") : "One side has more choices in this set of six. The less-selected side still has a full explanation and is not a deficit.")}</p>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`interaction-report-${pair.id}`} mode="result" previewSectionIds={["coverage", "dialogue", "example", "experiment"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("阅读本组完整公开指南") : "Read this comparison’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? displayText("本原创题本和新增英文译文尚未完成心理测量学验证。互动选择会随对象、场合、精力、文化和安全条件改变。可以只作私人观察，不要求披露、联系他人或改变边界。")
      : "This original bank and its new English translation have not completed psychometric validation. Choices may change with the person, setting, energy, culture and safety. Private observation is enough; no disclosure, contact or change of boundaries is required."}</p>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8">{zh
      ? displayText("四组分别阅读，每组两侧次数之和为六。这里显示的是本题组的选择次数，不是魅力、人气、能力或百分位；四组不合成类型，也不跨组排名。")
      : "Read the four comparisons separately. Each pair sums to six choices from this bank, not charm, popularity, ability or a percentile. The groups do not form a combined type or a cross-group ranking."}</p>
    </details>
  </ResultPage>;
}
