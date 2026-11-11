"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";

import { LoveTypeNeighborComparison } from "./LoveTypeNeighborComparison";
import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { LOVE_TYPE16_AXES, type LoveType16Result } from "@/lib/questionnaires/loveType16";
import type { Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnaireLoveType16Report({ quiz, result, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: Questionnaire["profiles"]; result: Extract<LoveType16Result, { status: "complete" }>; locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-love-type16-result>
    <section aria-labelledby="love-type16-compatible-title" className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50">
      <div className="p-4 sm:p-6">
        <p className="text-sm font-semibold text-rose-900">{zh ? displayText("四组亲密互动选择") : "Four relationship preference comparisons"}</p>
        <h3 id="love-type16-compatible-title" className="mt-2 text-xl font-semibold text-rose-950">{zh ? displayText(`符合本次选择的组合 · ${result.compatibleProfileIds.length} 种`) : `Combinations that fit these choices · ${result.compatibleProfileIds.length}`}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-700">{zh ? displayText("一组两侧各选 4 次时，两侧都保留。可以直接点组合代码阅读。") : "When each side gets four choices in a group, both remain. Choose a code to read that combination."}</p>
        <ul className="mt-3 flex flex-wrap gap-2">{result.compatibleProfileIds.map(id => <li key={id}><a className="inline-flex min-h-11 items-center rounded-lg border border-rose-200 bg-white px-3 font-semibold text-rose-950 underline" href={`#love-type16-${id}`}>{id.toUpperCase()}</a></li>)}</ul>
      </div>
      <div className="border-t border-rose-200 bg-white p-4 sm:p-6" aria-labelledby="love-type16-counts-title">
        <h4 id="love-type16-counts-title" className="text-lg font-semibold">{zh ? displayText("本次四组原始次数") : "Your four raw comparisons"}</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">{result.loveType16.map((axis, index) => <section key={axis.id} data-love-axis={axis.id} className="min-w-0 rounded-lg border border-rose-100 bg-rose-50/60 p-3">
          <h5 className="font-semibold">{LOVE_TYPE16_AXES[index].title[locale]}</h5>
          <dl className="mt-2 space-y-2">{LOVE_TYPE16_AXES[index].sides.map(id => <div key={id} data-love-side={id} className="flex flex-wrap items-baseline justify-between gap-x-3">
            <dt className="min-w-0">{quiz.directions.find(direction => direction.id === id)!.title[locale]}</dt>
            <dd className="shrink-0 font-semibold tabular-nums">{axis.counts[id]} / 8</dd>
          </div>)}</dl>
          <p className="mt-2 text-sm leading-6 text-slate-700">{axis.retained.length === 2 ? (zh ? displayText("4:4 并列，两侧保留。") : "A 4:4 tie keeps both sides.") : (zh ? displayText(`这组保留 ${axis.retained[0].toUpperCase()}。`) : `This group keeps ${axis.retained[0].toUpperCase()}.`)}</p>
        </section>)}</div>
      </div>
    </section>

    {result.compatibleProfileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      const readingProfile = readingProfiles?.find(p => p.id === id && p.resultReading?.quizSlug === quiz.slug && p.resultReading.profileId === id) ?? profile;
      return <section key={id} id={`love-type16-${id}`} data-love-profile={id} className="scroll-mt-24 rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 className="mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
        <LoveTypeNeighborComparison quiz={quiz} id={id} locale={locale} />
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile} locale={locale} headingLevel={4} idPrefix={`love-type16-${id}`} mode="result" previewSectionIds={["meaning", "example", "reflection"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, id)} target="_blank" rel="noopener">{zh ? displayText("本组合的公开完整指南") : "This combination’s complete public guide"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-3" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("计数与组合的读法") : "How to read the counts and combinations"}</summary>
      <p className="leading-8">{zh ? displayText("四轴分别计次，两侧合为8；不合总分、不跨轴排名。次数只描述本题本的选择，不是人格占比、爱意或伴侣成功概率。4:4保留两侧，展示全部兼容组合；显示顺序不是排名。") : "Each axis is counted separately and its two sides sum to eight. There is no overall total or ranking across axes. Counts describe this bank’s choices, not a share of personality, love, or couple success probability. A 4:4 tie keeps both sides; every compatible combination is shown, without ranking."}</p>
      <p className="mt-3 leading-8">{zh ? displayText("兼容表示符合本次四组保留字母。所有符合的组合与指南都保留。") : "Compatible means consistent with the letters retained in these four groups. Every matching combination and guide remains available."}</p>
    </details>
  </div>;
}

export function QuestionnaireLoveType16NextSteps({ locale }: { locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? displayText("可以比较一个相邻组合，或在这里结束") : "Compare one nearby combination, or finish here"}</h3>
    <p className="my-4 leading-8">{zh ? displayText("选一个只差一字母的组合，比较具体情境；也可以只保留一条私人偏好笔记。无需联系伴侣、披露答案或寻求配对。不把次数转换成MBTI、依恋或关系成功预测。") : "Choose a one-letter neighbor and compare the actual situations, or keep a single private preference note. No contact, disclosure, or partner matching is needed. Counts do not convert into MBTI, attachment, or relationship success predictions."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests/explore/love-type-16#questionnaire-results`}>{zh ? displayText("比较全部16份完整指南") : "Compare all 16 complete guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests#more-tests`}>{zh ? displayText("返回全部测试") : "Back to all tests"}</Link>
  </section>;
}
