import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { MiniHabitQuestionnaire } from "@/lib/questionnaires/miniHabit";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

type Complete = Extract<FacetResult, { status: "complete" }>;
export function QuestionnaireHabitReport({ quiz, result, locale }: { quiz: MiniHabitQuestionnaire; result: Complete; locale: Locale }) {
  const zh = locale === "zh", available = quiz.directions.filter(d => result.facets[d.id].mean !== null);
  const scope = zh ? "仅整理同一个非紧急日常习惯过去30天的自报回答，不诊断成瘾，不计算总分、排名或风险等级。数字表示陈述的符合程度，不是行为频率、功能损害或需要治疗的证据。" : "This records self-reported answers about one nonurgent everyday habit over the past 30 days. It does not diagnose addiction or give an overall score, ranking or risk grade. Numbers describe how statements fit, not frequency, impairment or a need for treatment.";
  const privacy = zh ? "回答和结果仅在当前页面内存中；不收习惯名称，不保存草稿或结果，不接分析事件，不提供个人结果分享。刷新、换语或离开会清除。" : "Responses and results remain in current-page memory only: no habit name, saved draft or result, analytics or personal-result sharing. Reloading, changing language or leaving clears them.";
  const support = zh ? "不要根据本页停药、改变处方或实施危险戒断。如果现实影响持续波及休息、任务、关系、财务或安全，可以按实际需要联系具备资质的专业服务；无需由本页数值决定是否寻求支持。现实紧急安全问题应优先联系当地紧急服务或可信任的人。" : "Do not use this page to stop medication, change prescriptions or attempt dangerous withdrawal. Persistent real-world effects on rest, tasks, relationships, finances or safety can be discussed with qualified professional services, without relying on a questionnaire value to decide whether to seek support. For an urgent safety problem, prioritize local emergency services or a trusted person.";
  return <div data-habit-result className="my-6 space-y-8">
    <p className="leading-8">{scope}</p>
    {!available.length ? <section data-habit-all-insufficient role="status" className="rounded-lg border border-slate-200 p-4 leading-8">
      <h3 className="text-xl font-semibold">{zh ? "各部分信息均不足" : "All parts have insufficient information"}</h3>
      <p className="mt-3">{zh ? "每组数字回答均不足三个，不显示个人数值或因素解释。跳过是合法选择，不表示回避或问题，也不要求重新作答。" : "Each part has fewer than three numeric responses. No personal values or factor interpretations are shown. Skips are valid, imply neither avoidance nor a problem, and do not require another attempt."}</p>
    </section> : <>
      <p className="leading-8">{zh ? "五组分开阅读。每组至少三个数字回答才显示原始和与四位小数均值；3是不确定或视情况，仍参与计算，跳过不补零。数值小数位只表达计算，不是心理测量精度。" : "Read the five parts separately. At least three numeric responses make a part’s sum and four-decimal mean available. A 3 is uncertain or depends and remains numeric; a skip is not zero. Decimal places express arithmetic, not psychological precision."}</p>
      {quiz.directions.map(direction => {
        const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
        return <section key={direction.id} data-habit-part={direction.id} aria-labelledby={`habit-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
          <h3 id={`habit-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
          <p data-habit-count className="my-4 leading-8">{zh ? `${score.rated} / 4个数字回答，${4 - score.rated}个跳过。` : `${score.rated} of 4 numeric responses; ${4 - score.rated} skipped.`}</p>
          {score.mean === null ? <p data-habit-insufficient className="leading-8">{zh ? "信息不足：本组不显示原始和、均值或个人解释。不推算、不补答；其他满足条件的组保留。" : "Insufficient information: no sum, mean or personal interpretation for this part. No inference or replacement answer; other available parts remain."}</p> : <>
            <p data-habit-mean className="mb-4 rounded-lg bg-slate-50 p-4 font-semibold">{zh ? `均值：${score.mean.toFixed(4)} / 5（${score.sum} ÷ ${score.rated}，显示至四位小数）` : `Mean: ${score.mean.toFixed(4)} / 5 (${score.sum} ÷ ${score.rated}, rounded to four decimals)`}</p>
            <p data-habit-sum className="mb-4 leading-8">{zh ? `原始和：${score.sum}，由${score.rated}个数字回答相加。描述的是这些回答，不转换为成瘾程度、概率或风险等级。` : `Raw sum: ${score.sum}, from ${score.rated} numeric responses. It describes these answers without conversion to addiction severity, probability or a risk grade.`}</p>
            <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`habit-report-${profile.id}`} />
          </>}
          <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "单独阅读本部分通用全文（不含个人记录）" : "Read this part’s general full guide separately (no personal record)"}</Link>
        </section>;
      })}
    </>}
    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8"><p>{privacy}</p><p className="mt-3">{support}</p></aside>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </div>;
}
