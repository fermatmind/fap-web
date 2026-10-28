import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { MiniConflictQuestionnaire } from "@/lib/questionnaires/miniConflict";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

type Complete = Extract<FacetResult, { status: "complete" }>;
export function QuestionnaireConflictReport({ quiz, result, locale }: { quiz: MiniConflictQuestionnaire; result: Complete; locale: Locale }) {
  const zh = locale === "zh", available = quiz.directions.filter(d => result.facets[d.id].mean !== null);
  const scope = zh ? "仅整理本人过去三个月具体行为的符合程度回答，四组独立阅读，不计算总分、排名或危险等级，不作诊断或预测。不能凭数字确立或排除真实伤害，也不能推断他人感受或动机。" : "This records how concrete statements fit your own past three months. Read four parts separately, without a total, ranking, danger grade, diagnosis or prediction. Values cannot establish or rule out actual harm or infer another person’s feelings or motives.";
  const privacy = zh ? "回答和结果仅在当前页面内存；不保存草稿或结果，不接分析事件，不提供个人结果分享。刷新、换语、离开或重测会清除。" : "Responses and results remain in current-page memory only: no saved draft or result, analytics or personal-result sharing. Reloading, changing language, leaving or retaking clears them.";
  const support = zh ? "现实中若已有威胁、暴力、强迫、跟踪或紧急安全问题，应优先联系当地紧急服务、可信任的支持者或具备资质的专业服务，不等待分数。任何观察都可不做，不要求不安全的联系、原谅或恢复信任。" : "For actual threats, violence, coercion, stalking or urgent safety concerns, prioritize local emergency services, a trusted supporter or qualified professional services as appropriate, without waiting for a score. Observations are optional and never require unsafe contact, forgiveness or restored trust.";
  return <div data-conflict-result className="my-6 space-y-8">
    <p className="leading-8">{scope}</p>
    {!available.length ? <section data-conflict-all-insufficient role="status" className="rounded-lg border border-slate-200 p-4 leading-8">
      <h3 className="text-xl font-semibold">{zh ? "各部分信息均不足" : "All parts have insufficient information"}</h3>
      <p className="mt-3">{zh ? "每组数字回答均不足四个，不显示个人数值或因素解释。跳过是合法选择，不表示回避或问题，也不要求重新作答。" : "Each part has fewer than four numeric responses. No personal values or factor interpretations are shown. Skips are valid, imply neither avoidance nor a problem, and do not require another attempt."}</p>
    </section> : <>
      <p className="leading-8">{zh ? "四组分开阅读。每组至少四个数字回答才显示原始和与四位小数均值；3是不确定或视情况，仍参与计算，跳过不补零。数值小数位只表达计算，不是心理测量精度。" : "Read the four parts separately. At least four numeric responses make a part’s sum and four-decimal mean available. A 3 is uncertain or depends and remains numeric; a skip is not zero. Decimal places express arithmetic, not psychological precision."}</p>
      {quiz.directions.map(direction => {
        const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
        return <section key={direction.id} data-conflict-part={direction.id} aria-labelledby={`conflict-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
          <h3 id={`conflict-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
          <p data-conflict-count className="my-4 leading-8">{zh ? `${score.rated} / 6个数字回答，${6 - score.rated}个跳过。` : `${score.rated} of 6 numeric responses; ${6 - score.rated} skipped.`}</p>
          {score.mean === null ? <p data-conflict-insufficient className="leading-8">{zh ? "信息不足：本组不显示原始和、均值或个人解释。不推算、不补答；其他满足条件的组保留。" : "Insufficient information: no sum, mean or personal interpretation for this part. No inference or replacement answer; other available parts remain."}</p> : <>
            <p data-conflict-mean className="mb-4 rounded-lg bg-slate-50 p-4 font-semibold">{zh ? `均值：${score.mean.toFixed(4)} / 5（${score.sum} ÷ ${score.rated}，显示至四位小数）` : `Mean: ${score.mean.toFixed(4)} / 5 (${score.sum} ÷ ${score.rated}, rounded to four decimals)`}</p>
            <p data-conflict-sum className="mb-4 leading-8">{zh ? `原始和：${score.sum}，由${score.rated}个数字回答相加。描述的是这些回答，不转换为危险程度、概率或风险等级。` : `Raw sum: ${score.sum}, from ${score.rated} numeric responses. It describes these answers without conversion to dangerousness, probability or a risk grade.`}</p>
            <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`conflict-report-${profile.id}`} />
          </>}
          <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "单独阅读本部分通用全文（不含个人记录）" : "Read this part’s general full guide separately (no personal record)"}</Link>
        </section>;
      })}
    </>}
    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8"><p>{privacy}</p><p className="mt-3">{support}</p></aside>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </div>;
}
