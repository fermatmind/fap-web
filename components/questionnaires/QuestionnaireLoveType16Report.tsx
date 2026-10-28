import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { LOVE_TYPE16_AXES, type LoveType16Result } from "@/lib/questionnaires/loveType16";
import type { Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireLoveType16Report({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<LoveType16Result, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-love-type16-result>
    <p className="leading-8">{zh ? "四轴分别计次，两侧合为8；不合总分、不跨轴排名。次数只描述本题本的选择，不是人格占比、爱意或伴侣成功概率。4:4保留两侧，展示全部兼容组合；显示顺序不是排名。" : "Each axis is counted separately and its two sides sum to eight. There is no overall total or ranking across axes. Counts describe this bank’s choices, not a share of personality, love, or couple success probability. A 4:4 tie keeps both sides; every compatible combination is shown, without ranking."}</p>
    <section aria-labelledby="love-type16-counts-title" className="rounded-lg bg-slate-50 p-4 sm:p-6">
      <h3 id="love-type16-counts-title" className="text-xl font-semibold">{zh ? "四组原始次数" : "Your four raw comparisons"}</h3>
      <div className="mt-5 space-y-6">{result.loveType16.map((axis, i) => <div key={axis.id} data-love-axis={axis.id}>
        <h4 className="font-semibold">{LOVE_TYPE16_AXES[i].title[locale]}</h4>
        <dl className="my-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{LOVE_TYPE16_AXES[i].sides.map(id => <div key={id} data-love-side={id}>
          <dt>{quiz.directions.find(d => d.id === id)!.title[locale]}</dt><dd className="mt-1 font-semibold">{axis.counts[id]} / 8</dd>
        </div>)}</dl>
        <p className="text-sm leading-7">{axis.retained.length === 2 ? (zh ? "4:4并列，两个字母都保留。" : "A 4:4 tie: both letters remain.") : (zh ? `本轴保留 ${axis.retained[0].toUpperCase()}；仅为本组内次数较多的一侧。` : `This axis retains ${axis.retained[0].toUpperCase()}, the side selected more often within this group only.`)}</p>
      </div>)}</div>
    </section>
    <section aria-labelledby="love-type16-compatible-title">
      <h3 id="love-type16-compatible-title" className="text-xl font-semibold">{zh ? `全部兼容组合：${result.compatibleProfileIds.length}种` : `All compatible combinations: ${result.compatibleProfileIds.length}`}</h3>
      <p className="mt-3 leading-8">{zh ? "没有抽签、隐藏破并列或补题。本次代码如下，每份完整解读都在下面；可以先按链接跳到想读的组合。兼容表示符合本次四轴保留字母，不表示适配某个伴侣。" : "No draw, hidden tie-break, or extra question selects a winner. Every complete compatible reading appears below; use these links to jump to one. Compatible means consistent with this attempt’s retained letters, not compatible with a partner."}</p>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">{result.compatibleProfileIds.map(id => <li key={id}><a className="inline-block min-h-11 py-2 underline" href={`#love-type16-${id}`}>{id.toUpperCase()}</a></li>)}</ul>
    </section>
    {result.compatibleProfileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      return <section key={id} id={`love-type16-${id}`} data-love-profile={id} className="scroll-mt-24 rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`love-type16-${id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "本组合的公开完整指南" : "This combination’s complete public guide"}</Link>
      </section>;
    })}
  </div>;
}
export function QuestionnaireLoveType16NextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "可以比较一个相邻组合，或在这里结束" : "Compare one nearby combination, or finish here"}</h3>
    <p className="my-4 leading-8">{zh ? "选一个只差一字母的组合，比较具体情境；也可以只保留一条私人偏好笔记。无需联系伴侣、披露答案或寻求配对。不把次数转换成MBTI、依恋或关系成功预测。" : "Choose a one-letter neighbor and compare the actual situations, or keep a single private preference note. No contact, disclosure, or partner matching is needed. Counts do not convert into MBTI, attachment, or relationship success predictions."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/love-type-16#questionnaire-results`}>{zh ? "比较全部16份完整指南" : "Compare all 16 complete guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
