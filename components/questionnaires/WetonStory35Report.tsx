import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { wetonWeekdays, wetonPasaran, type WetonStoryResult } from "@/lib/questionnaires/wetonStory35";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function WetonStory35Report({ quiz, result, locale, displayCopy }: { quiz: Questionnaire; result: Extract<WetonStoryResult, { status: "complete" }>; locale: Locale; displayCopy?: (text: string) => string }) {
  const displayText = (text: string) => displayCopy?.(text) ?? text;
  const zh = locale === "zh";
  const counts = result.counts;
  const leaders = [
    { keys: result.weekdayLeaders, title: zh ? displayText("星期故事角色") : "Weekday story roles", appearances: 9 },
    { keys: result.pasaranLeaders, title: zh ? displayText("市日故事视角") : "Pasaran story lenses", appearances: 14 },
  ];
  const matches = quiz.profiles.filter(profile => result.profileIds.includes(profile.id));
  return <div className="my-6 space-y-8">
    <p className="leading-7">{zh ? displayText("这些是本次选择对应的原创故事组合，不是出生人格。每份都可分别阅读。") : "These original story pairings reflect this set of choices, not a birth personality. Read each pairing separately."}</p>
    {counts && matches.length > 0 && <section aria-label={zh ? displayText("本次故事组合") : "Story pairings from this attempt"} className="overflow-hidden rounded-xl border border-orange-200">
      <div className="grid gap-px bg-orange-200 md:grid-cols-2">{leaders.map(bank => <div key={bank.title} className="min-w-0 bg-orange-50 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-orange-950">{bank.title}</h3>
        <dl className="mt-3 space-y-3">{bank.keys.map(key => <div key={key} className="flex flex-wrap items-baseline justify-between gap-x-4">
          <dt>{quiz.directions.find(direction => direction.id === key)!.title[locale]}</dt>
          <dd className="font-semibold tabular-nums">{counts[key]} / {bank.appearances}</dd>
        </div>)}</dl>
      </div>)}</div>
      <div className="space-y-3 border-t border-orange-200 bg-white p-4 sm:p-6">
        <p className="text-sm leading-7 text-slate-700">{zh ? displayText("两组分别计数。每组保留所有并列最高项，再把角色和视角配成下方故事。") : "The two banks are counted separately. Every highest role pairs with every highest lens in the stories below."}</p>
        <a className="inline-block min-h-11 py-2 font-medium underline" href={`#weton-title-${matches[0].id}`}>{matches.length === 1 ? (zh ? displayText("读这个故事组合") : "Read this story pairing") : (zh ? displayText(`开始阅读 ${matches.length} 个并列组合`) : `Start reading ${matches.length} tied pairings`)}</a>
      </div>
    </section>}
{!result.counts && <p data-weton-insufficient className="leading-8">{zh ? displayText("本次已完成；存在未评分，不显示两组任何个人计数、最高键或匹配。不补零、不推断，35篇公开指南仍可在下方阅读，无需补答。") : "This attempt is complete. An unscored response withholds every personal count, leader and match in both banks. No zero is substituted and no winner inferred. All 35 public guides remain linked below; no further answers are required."}</p>}
    {matches.map(profile => <section key={profile.id} data-weton-profile={profile.id} aria-labelledby={`weton-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`weton-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["reading-2", "reading-3", "reading-4"]} traditional={Boolean(displayCopy)} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayCopy ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("阅读这一原创组合的公开说明") : "Read this original pairing’s public guide"}</Link>
    </section>)}
    <details aria-labelledby="weton-all-guides"><summary id="weton-all-guides" className="min-h-11 cursor-pointer py-2 text-xl font-semibold">{zh ? displayText("全部35篇公开全文") : "All 35 full public guides"}</summary><ul className="space-y-2">{quiz.profiles.map(profile => <li key={profile.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayCopy ? "zh-TW" : locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link></li>)}</ul></details>

    <details className="border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("为什么得到这些组合？查看两组计数") : "Why these pairings? View both count banks"}</summary>
<section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="weton-story-summary">
      <h3 id="weton-story-summary" className="text-xl font-semibold">{zh ? displayText("两组原始计数分别阅读") : "Read two separate raw-count banks"}</h3>
      <p className="leading-8">{zh ? displayText("前21题七角色各出现9次，后14题五视角各出现14次，两组分别比较最高次数；计数总和分别21与14，不混成一项排名或百分位。每个最高角色与每个最高视角交叉，全部匹配全文保留，不强选唯一赢家。") : "Across 21 comparisons each of seven roles appears 9 times; across 14 comparisons each of five lenses appears 14 times. Compare highest counts within each bank. Totals are 21 and 14, without a combined ranking or percentile. Every highest role pairs with every highest lens; every matched guide stays complete, without a forced single winner."}</p>

      {[wetonWeekdays, wetonPasaran].map((bank, i) => <section key={i} data-weton-bank={i} className="space-y-3"><h4 className="font-semibold">{i === 0 ? (zh ? displayText("星期故事角色") : "Weekday story roles") : (zh ? displayText("市日故事视角") : "Pasaran story lenses")}</h4><dl className="space-y-3">{bank.map(key => <div key={key} data-weton-record={key}><dt className="font-medium leading-7">{quiz.directions.find(d => d.id === key)!.title[locale]}</dt><dd>{result.counts ? <span data-weton-count>{result.counts[key]} / {i === 0 ? 9 : 14}</span> : <span>{zh ? displayText("资料不足") : "Insufficient information"}</span>}</dd></div>)}</dl></section>)}
      {result.counts && <p data-weton-match-count className="leading-8">{zh ? displayText(`保留${result.weekdayLeaders.length}个最高角色 × ${result.pasaranLeaders.length}个最高视角，共${result.profileIds.length}篇匹配全文。`) : `${result.weekdayLeaders.length} highest roles × ${result.pasaranLeaders.length} highest lenses: ${result.profileIds.length} complete matched guides.`}</p>}
      <p className="text-sm leading-7">{zh ? displayText("名称是本版原创编辑索引，不是传统性格计分键或已验证类型。问卷不需要生日；独立历法输入不参与计分，也不能验证故事。") : "Names are this edition’s original editorial indexes, without a traditional personality key or validated types. The quiz needs no birthdate; the separate calendar input never enters scoring or validates a story."}</p>
    </section>
    </details>
  </div>;
}
