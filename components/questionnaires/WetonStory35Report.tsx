import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { wetonWeekdays, wetonPasaran, type WetonStoryResult } from "@/lib/questionnaires/wetonStory35";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function WetonStory35Report({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<WetonStoryResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="weton-story-summary">
      <h3 id="weton-story-summary" className="text-xl font-semibold">{zh ? "两组原始计数分别阅读" : "Read two separate raw-count banks"}</h3>
      <p className="leading-8">{zh ? "前21题七角色各出现9次，后14题五视角各出现14次，两组分别比较最高次数；计数总和分别21与14，不混成一项排名或百分位。每个最高角色与每个最高视角交叉，全部匹配全文保留，不强选唯一赢家。" : "Across 21 comparisons each of seven roles appears 9 times; across 14 comparisons each of five lenses appears 14 times. Compare highest counts within each bank. Totals are 21 and 14, without a combined ranking or percentile. Every highest role pairs with every highest lens; every matched guide stays complete, without a forced single winner."}</p>
      {!result.counts && <p data-weton-insufficient className="leading-8">{zh ? "本次已完成；存在未评分，不显示两组任何个人计数、最高键或匹配。不补零、不推断，35篇公开指南仍可在下方阅读，无需补答。" : "This attempt is complete. An unscored response withholds every personal count, leader and match in both banks. No zero is substituted and no winner inferred. All 35 public guides remain linked below; no further answers are required."}</p>}
      {[wetonWeekdays, wetonPasaran].map((bank, i) => <section key={i} data-weton-bank={i} className="space-y-3"><h4 className="font-semibold">{i === 0 ? (zh ? "星期故事角色" : "Weekday story roles") : (zh ? "市日故事视角" : "Pasaran story lenses")}</h4><dl className="space-y-3">{bank.map(key => <div key={key} data-weton-record={key}><dt className="font-medium leading-7">{quiz.directions.find(d => d.id === key)!.title[locale]}</dt><dd>{result.counts ? <span data-weton-count>{result.counts[key]} / {i === 0 ? 9 : 14}</span> : <span>{zh ? "资料不足" : "Insufficient information"}</span>}</dd></div>)}</dl></section>)}
      {result.counts && <p data-weton-match-count className="leading-8">{zh ? `保留${result.weekdayLeaders.length}个最高角色 × ${result.pasaranLeaders.length}个最高视角，共${result.profileIds.length}篇匹配全文。` : `${result.weekdayLeaders.length} highest roles × ${result.pasaranLeaders.length} highest lenses: ${result.profileIds.length} complete matched guides.`}</p>}
      <p className="text-sm leading-7">{zh ? "名称是本版原创编辑索引，不是传统性格计分键或已验证类型。问卷不需要生日；独立历法输入不参与计分，也不能验证故事。" : "Names are this edition’s original editorial indexes, without a traditional personality key or validated types. The quiz needs no birthdate; the separate calendar input never enters scoring or validates a story."}</p>
    </section>
    {quiz.profiles.filter(profile => result.profileIds.includes(profile.id)).map(profile => <section key={profile.id} data-weton-profile={profile.id} aria-labelledby={`weton-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`weton-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一原创组合的公开说明" : "Read this original pairing’s public guide"}</Link>
    </section>)}
    <section aria-labelledby="weton-all-guides"><h3 id="weton-all-guides" className="mb-4 text-xl font-semibold">{zh ? "全部35篇公开全文" : "All 35 full public guides"}</h3><ul className="space-y-2">{quiz.profiles.map(profile => <li key={profile.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link></li>)}</ul></section>
  </div>;
}
