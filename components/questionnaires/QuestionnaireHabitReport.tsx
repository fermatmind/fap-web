import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { MiniHabitQuestionnaire } from "@/lib/questionnaires/miniHabit";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

type Complete = Extract<FacetResult, { status: "complete" }>;
export function QuestionnaireHabitReport({ quiz, result, locale, readingProfiles }: { quiz: MiniHabitQuestionnaire; result: Complete; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[] }) {
  const { traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh", available = quiz.directions.filter(d => result.facets[d.id].mean !== null);
  const scope = zh ? (traditional ? "僅整理同一個非緊急日常習慣過去30天的自報回答，不診斷成癮，不計算總分、排名或風險等級。數字表示陳述的符合程度，不是行為頻率、功能損害或需要治療的證據。" : "仅整理同一个非紧急日常习惯过去30天的自报回答，不诊断成瘾，不计算总分、排名或风险等级。数字表示陈述的符合程度，不是行为频率、功能损害或需要治疗的证据。") : "This records self-reported answers about one nonurgent everyday habit over the past 30 days. It does not diagnose addiction or give an overall score, ranking or risk grade. Numbers describe how statements fit, not frequency, impairment or a need for treatment.";
  const privacy = zh ? (traditional ? "回答和結果僅在當前頁面記憶體中；不收習慣名稱，不儲存草稿或結果，不接分析事件，不提供個人結果分享。重新整理、換語或離開會清除。" : "回答和结果仅在当前页面内存中；不收习惯名称，不保存草稿或结果，不接分析事件，不提供个人结果分享。刷新、换语或离开会清除。") : "Responses and results remain in current-page memory only: no habit name, saved draft or result, analytics or personal-result sharing. Reloading, changing language or leaving clears them.";
  const support = zh ? (traditional ? "不要根據本頁停藥、改變處方或實施危險戒斷。如果現實影響持續波及休息、任務、關係、財務或安全，可以按實際需要聯絡具備資質的專業服務；無需由本頁數值決定是否尋求支援。現實緊急安全問題應優先聯絡當地緊急服務或可信任的人。" : "不要根据本页停药、改变处方或实施危险戒断。如果现实影响持续波及休息、任务、关系、财务或安全，可以按实际需要联系具备资质的专业服务；无需由本页数值决定是否寻求支持。现实紧急安全问题应优先联系当地紧急服务或可信任的人。") : "Do not use this page to stop medication, change prescriptions or attempt dangerous withdrawal. Persistent real-world effects on rest, tasks, relationships, finances or safety can be discussed with qualified professional services, without relying on a questionnaire value to decide whether to seek support. For an urgent safety problem, prioritize local emergency services or a trusted person.";
  return <div data-habit-result className="my-6 space-y-8">
    {available.length > 0 && quiz.directions.length > 1 && <ResultReadingNav collapsible label={zh ? (traditional ? "按主題閱讀結果" : "按主题阅读结果") : "Read results by topic"} sections={quiz.directions.map(direction => ({ id: `habit-${direction.id}`, title: direction.title[locale] }))} />}
    <p className="leading-8">{scope}</p>
    {!available.length ? <section data-habit-all-insufficient role="status" className="rounded-lg border border-slate-200 p-4 leading-8">
      <h3 className="text-xl font-semibold">{zh ? (traditional ? "各部分資訊均不足" : "各部分信息均不足") : "All parts have insufficient information"}</h3>
      <p className="mt-3">{zh ? (traditional ? "每組數字回答均不足三個，不顯示個人數值或因素解釋。跳過是合法選擇，不表示迴避或問題，也不要求重新作答。" : "每组数字回答均不足三个，不显示个人数值或因素解释。跳过是合法选择，不表示回避或问题，也不要求重新作答。") : "Each part has fewer than three numeric responses. No personal values or factor interpretations are shown. Skips are valid, imply neither avoidance nor a problem, and do not require another attempt."}</p>
    </section> : <>
      <p className="leading-8">{zh ? (traditional ? "五組分開閱讀。每組至少三個數字回答才顯示原始和與四位小數均值；3是不確定或視情況，仍參與計算，跳過不補零。數值小數位只表達計算，不是心理測量精度。" : "五组分开阅读。每组至少三个数字回答才显示原始和与四位小数均值；3是不确定或视情况，仍参与计算，跳过不补零。数值小数位只表达计算，不是心理测量精度。") : "Read the five parts separately. At least three numeric responses make a part’s sum and four-decimal mean available. A 3 is uncertain or depends and remains numeric; a skip is not zero. Decimal places express arithmetic, not psychological precision."}</p>
      {quiz.directions.map(direction => {
        const score = result.facets[direction.id], sourceProfile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
        const profile = readingProfiles?.find(p => p.id === sourceProfile.id && p.resultReading?.quizSlug === quiz.slug && p.resultReading.profileId === sourceProfile.id) ?? sourceProfile;
        return <section key={direction.id} data-habit-part={direction.id} aria-labelledby={`habit-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
          <h3 id={`habit-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
          <p data-habit-count className="my-4 leading-8">{zh ? (traditional ? `${score.rated} / 4個數字回答，${4 - score.rated}個跳過。` : `${score.rated} / 4个数字回答，${4 - score.rated}个跳过。`) : `${score.rated} of 4 numeric responses; ${4 - score.rated} skipped.`}</p>
          {score.mean === null ? <p data-habit-insufficient className="leading-8">{zh ? (traditional ? "資訊不足：本組不顯示原始和、均值或個人解釋。不推算、不補答；其他滿足條件的組保留。" : "信息不足：本组不显示原始和、均值或个人解释。不推算、不补答；其他满足条件的组保留。") : "Insufficient information: no sum, mean or personal interpretation for this part. No inference or replacement answer; other available parts remain."}</p> : <>
            <p data-habit-mean className="mb-4 rounded-lg bg-slate-50 p-4 font-semibold">{zh ? (traditional ? `均值：${score.mean.toFixed(4)} / 5（${score.sum} ÷ ${score.rated}，顯示至四位小數）` : `均值：${score.mean.toFixed(4)} / 5（${score.sum} ÷ ${score.rated}，显示至四位小数）`) : `Mean: ${score.mean.toFixed(4)} / 5 (${score.sum} ÷ ${score.rated}, rounded to four decimals)`}</p>
            <p data-habit-sum className="mb-4 leading-8">{zh ? (traditional ? `原始和：${score.sum}，由${score.rated}個數字回答相加。描述的是這些回答，不轉換為成癮程度、機率或風險等級。` : `原始和：${score.sum}，由${score.rated}个数字回答相加。描述的是这些回答，不转换为成瘾程度、概率或风险等级。`) : `Raw sum: ${score.sum}, from ${score.rated} numeric responses. It describes these answers without conversion to addiction severity, probability or a risk grade.`}</p>
            <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`habit-report-${profile.id}`} mode="result" previewSectionIds={[`${profile.id}-example`, `${profile.id}-observation`]} />
          </>}
          <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? (traditional ? "單獨閱讀本部分通用全文（不含個人記錄）" : "单独阅读本部分通用全文（不含个人记录）") : "Read this part’s general full guide separately (no personal record)"}</Link>
        </section>;
      })}
    </>}
    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8"><p>{privacy}</p><p className="mt-3">{support}</p></aside>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests#more-tests`}>{zh ? (traditional ? "返回全部測試" : "返回全部测试") : "Back to all tests"}</Link>
  </div>;
}
