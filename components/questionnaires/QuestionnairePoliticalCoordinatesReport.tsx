import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { PoliticalCoordinatesResult, PoliticalCoordinateAxis } from "@/lib/questionnaires/politicalCoordinates";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnairePoliticalCoordinatesReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<PoliticalCoordinatesResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  const economic = result.politicalCoordinates.economic, social = result.politicalCoordinates.social;
  const x = economic.difference, y = social.difference, pointAvailable = x !== null && y !== null;
  const endpoints = { economic: [zh ? "经济左向" : "Economic left", zh ? "经济右向" : "Economic right"], social: [zh ? "共同体优先" : "Communitarian", zh ? "个人自由优先" : "Liberal"] };
  const signed = (n: number) => n > 0 ? `+${n}` : String(n);
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "两轴只汇总本原创题本给出的公共政策方案，不代表完整政治身份、政党或人口位置。每轴十八项全部有效才显示两端次数和原始差值；任一NA只使所属轴不足，两轴都完整才画组合点。以下四份完整指南始终可读，不按分数解锁。" : "The two axes summarize only the public-policy proposals in this original bank, not a complete political identity, party or population position. An axis needs all eighteen valid choices for endpoint counts and a raw difference; any NA withholds only its own axis. Both axes must be complete for a combined point. All four full guides below remain available at every result."}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {(["economic", "social"] as PoliticalCoordinateAxis[]).map(axis => {
        const score = result.politicalCoordinates[axis], available = score.difference !== null;
        return <section key={axis} data-political-axis={axis} aria-labelledby={`political-axis-${axis}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 id={`political-axis-${axis}`} className="text-xl font-semibold">{axis === "economic" ? (zh ? "经济左—右" : "Economic left–right") : (zh ? "共同体—个人自由" : "Communitarian–liberal")}</h3>
          <dl className="mt-4 space-y-3">
            <div className="flex flex-wrap justify-between gap-2"><dt>{endpoints[axis][0]}</dt><dd data-political-negative>{available ? score.negativeCount : missing}</dd></div>
            <div className="flex flex-wrap justify-between gap-2"><dt>{endpoints[axis][1]}</dt><dd data-political-positive>{available ? score.positiveCount : missing}</dd></div>
            <div className="flex flex-wrap justify-between gap-2 font-semibold"><dt>{zh ? "原始差值（−18至+18）" : "Raw difference (−18 to +18)"}</dt><dd data-political-difference>{available ? signed(score.difference!) : missing}</dd></div>
            <div className="text-sm leading-7 text-slate-600"><dt className="sr-only">{zh ? "有效选择" : "Valid selections"}</dt><dd data-political-rated>{zh ? `${score.rated} / 18项有效选择` : `${score.rated} / 18 valid selections`}</dd></div>
          </dl>
          <p className="mt-4 text-sm leading-7 text-slate-600">{axis === "economic" ? (zh ? "经济差值＝右向次数减左向次数。" : "Economic difference = right count minus left count.") : (zh ? "社会差值＝个人自由优先次数减共同体优先次数。" : "Social difference = liberal count minus communitarian count.")}</p>
          {!available ? <p data-political-insufficient className="mt-4 leading-8">{zh ? "本轴资料不足，没有生成个人两端次数或坐标；另一完整轴仍可单独阅读。无需猜答，以下指南是通用说明。" : "This axis has insufficient information, so no personal endpoint counts or coordinate were generated. The other complete axis can still be read. There is no need to guess; the guides below are general information."}</p> : score.difference === 0 ? <p data-political-axis-tie className="mt-4 leading-8">{zh ? "九比九是有效并列，不是资料不足；保留两侧读法，也不表示冷漠或人口平均。" : "Nine to nine is a valid tie rather than missing information. Keep both sides in view; it does not imply indifference or a population average."}</p> : null}
        </section>;
      })}
    </div>
    <section aria-labelledby="political-point-title" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id="political-point-title" className="text-2xl font-semibold">{zh ? "本题本的两轴位置" : "Two-axis position in this bank"}</h3>
      {pointAvailable ? <>
        <p data-political-point className="my-4 font-semibold">{zh ? `原始坐标（x，y）＝（${signed(x)}，${signed(y)}）` : `Raw coordinates (x, y) = (${signed(x)}, ${signed(y)})`}</p>
        <div role="img" aria-label={zh ? `经济x ${signed(x)}，社会y ${signed(y)}。正方向分别为经济右向及个人自由优先。` : `Economic x ${signed(x)}, social y ${signed(y)}. Positive directions are economic right and social liberal.`} className="mx-auto max-w-md py-4 text-center text-xs leading-6 sm:text-sm">
          <p>{zh ? "个人自由优先（y正）" : "Liberal (positive y)"}</p>
          <div className="relative mx-3 my-2 h-64 border border-slate-400 bg-slate-50" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-full border-l border-slate-300" /><div className="absolute left-0 top-1/2 w-full border-t border-slate-300" />
            <span className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-violet-800 ring-1 ring-violet-800" style={{ left: `${(x + 18) / 36 * 100}%`, top: `${(18 - y) / 36 * 100}%` }} />
          </div>
          <div className="flex justify-between gap-4"><span>{zh ? "经济左向（x负）" : "Economic left (negative x)"}</span><span>{zh ? "经济右向（x正）" : "Economic right (positive x)"}</span></div>
          <p className="mt-2">{zh ? "共同体优先（y负）" : "Communitarian (negative y)"}</p>
        </div>
        <p data-political-comparisons className="mt-4 leading-8">{zh ? "按本题原始次数可对照：" : "Comparisons indicated by these raw counts: "}{result.politicalCoordinateProfileIds.map(id => quiz.profiles.find(p => p.id === id)!.title[locale]).join(zh ? "；" : "; ")}{zh ? "。零轴完整保留相邻比较，不指定唯一类型。" : ". A zero axis retains adjacent comparisons without assigning a sole type."}</p>
      </> : <p data-political-no-point className="my-4 leading-8">{zh ? "至少一轴资料不足，本次不生成组合坐标或象限比较。已完整的轴可单独阅读；全部四份完整指南照常提供。" : "At least one axis has insufficient information, so this attempt has no combined coordinate or quadrant comparison. A complete axis can still be read separately, and all four full guides remain available."}</p>}
      <p className="mt-4 text-sm leading-7 text-slate-600">{zh ? "正号和图上方向只是约定，不代表好坏；原始次数不是百分比、重要程度或人口距离。新版原创题、双语表述与计数规则没有心理测量或跨文化等价验证，不提供政党、人物位置或政治劝服。" : "Positive signs and drawing directions are conventions, not approval. Raw counts are not percentages, personal importance or distances within a population. The new original items, bilingual wording and count rule lack established psychometric or cross-cultural equivalence validation. No party, politician placement or political persuasion is provided."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} data-political-guide={profile.id} aria-labelledby={`political-guide-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`political-guide-${profile.id}`} className="mb-4 text-2xl font-semibold">{profile.title[locale]}</h3>
      <p className="mb-5 text-sm leading-7 text-slate-600">{zh ? "完整通用比较，始终可读；不是派给你的身份或私人答案。" : "A complete general comparison, always available; not an assigned identity or private answer record."}</p>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`political-report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这份完整公开说明" : "Read this complete public guide"}</Link>
    </section>)}
  </div>;
}
