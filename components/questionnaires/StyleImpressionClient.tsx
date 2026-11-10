"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { QuestionnaireLegacyControl } from "./QuestionnaireTakeContext";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { scoreArchetypeQuestionnaire, isArchetypeConfigurationValid } from "@/lib/questionnaires/basicScoring";
import type { Locale } from "@/lib/i18n/locales";
import { StyleImpressionReport } from "./StyleImpressionReport";

const subscribeReady = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";

export function StyleImpressionClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const displayLocale = traditional ? "zh-TW" : locale;
  const copy = (text: string) => traditional ? displayText(text).replaceAll("測試", "測驗") : text;
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [position, setPosition] = useState(0);
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome"), [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), valid = quiz.slug === "style-impression-preferences" && quiz.code === "FM_STYLE_IMPRESSIONS16" && quiz.questions.length === 16 && quiz.directions.length === 8 && isArchetypeConfigurationValid(quiz);
  const result = scoreArchetypeQuestionnaire(quiz, answers), question = quiz.questions[position];
  useEffect(() => { if (stage !== "welcome") heading.current?.focus(); }, [stage, position]);
  if (!valid) return <section role="alert" className="my-8 rounded-lg border p-5">{zh ? copy("这份造型偏好题本暂不可用。") : "This style-preference edition is unavailable."}</section>;
  function reset(next: "welcome" | "answer") { setAnswers({}); setPosition(0); setMessage(""); setStage(next); }
  function advance() {
    if (!question || !answers[question.id]) { setMessage(zh ? copy("请选择一个描述再继续。") : "Choose a description before continuing."); return; }
    if (position < quiz.questions.length - 1) { setPosition(position + 1); setMessage(""); return; }
    if (result.status !== "complete") { setMessage(zh ? copy("本次结果暂不可用，请检查完整作答。") : "The result is unavailable. Check that all items have a response."); return; }
    setStage("result"); setMessage("");
  }
  return <section id="take-test" data-stage={stage} className="my-8 rounded-xl border border-violet-200 bg-white p-5 sm:p-8" aria-label={zh ? copy("作答与完整结果") : "Questionnaire and full results"}>
    {stage === "welcome" && <>
      <h2 className="text-2xl font-semibold">{zh ? copy("开始十六次整体造型比较") : "Start sixteen whole-look comparisons"}</h2>
      <p className="my-4 leading-8">{quiz.instructions?.[locale]}</p>
      {!ready && <p role="status">{zh ? copy("正在准备测试…") : "Preparing the test…"}</p>}
      <div className="flex flex-wrap gap-3"><button data-explore-start disabled={!ready} className={`${button} bg-violet-700 text-white`} onClick={() => reset("answer")}>{zh ? copy("开始测试") : "Start test"}</button></div>
    </>}
    {stage === "answer" && question && <>
      <p className="mb-3 text-sm">{zh ? copy(`第${position + 1}次比较，共16次`) : `Comparison ${position + 1} of 16`}</p>
      <progress aria-label={zh ? copy("已选择比较数") : "Comparisons answered"} max={16} value={Object.keys(answers).length} className="mb-5 w-full accent-violet-700" />
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-8 outline-none">{question.prompt[locale]}</h2>
      <p data-sip-context className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-7">{zh ? copy("只比较愿意尝试的整体造型，不评价面部或身体。若描述都无用，可以退出并直接读公开全文。") : "Compare whole looks you would like to try, without rating a face or body. If the descriptions are not useful, you can leave and read every public full guide."}</p>
      <fieldset className="mt-5 space-y-3"><legend className="sr-only">{question.prompt[locale]}</legend>{question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-4 has-[:checked]:border-violet-700 has-[:checked]:bg-violet-50">
        <input type="radio" className="mt-1 size-5 shrink-0 accent-violet-700" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { setAnswers({ ...answers, [question.id]: option.id }); setMessage(""); }} /><span className="min-w-0 leading-7 [overflow-wrap:anywhere]">{option.label[locale]}</span>
      </label>)}</fieldset>
      <div className="mt-6 flex flex-wrap gap-3"><button className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? copy("上一题") : "Back"}</button><button data-questionnaire-next className={`${button} bg-violet-700 text-white`} onClick={advance}>{position === 15 ? (zh ? copy("查看完整结果") : "See full result") : (zh ? copy("下一题") : "Next")}</button></div>
      <QuestionnaireLegacyControl><button className="mt-4 min-h-11 text-sm underline" onClick={() => reset("welcome")}>{zh ? copy("退出并清除本次进度") : "Exit and clear this attempt"}</button></QuestionnaireLegacyControl>
    </>}
    {stage === "result" && result.status === "complete" && <>
      <h2 ref={heading} tabIndex={-1} className="text-3xl font-semibold leading-tight outline-none [overflow-wrap:anywhere]">{quiz.resultHeading![locale]}</h2>
      <StyleImpressionReport quiz={quiz} result={result} locale={locale} displayLocale={displayLocale} copy={copy} />
      <button className={button} onClick={() => reset("answer")}>{zh ? copy("重新测试") : "Retake test"}</button>
      <section className="mt-10 border-t pt-7"><h3 className="text-xl font-semibold">{zh ? copy("完整指南已开放，可以在这里结束") : "Your complete guides are open. You may finish here."}</h3>
        <p className="my-4 leading-8">{zh ? copy("也可以比较其他公开主题。若想单独观察衣服线条，可另做服装线条偏好题本；它记录五项认同均值，本次次数不换算。") : "Compare another public theme if you wish. The separate Outfit Line Preferences form explores five agreement means about garment lines. These counts do not convert into its results."}</p>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${displayLocale}/tests/explore/${quiz.slug}#questionnaire-results`}>{zh ? copy("比较八篇公开完整指南") : "Compare all eight public full guides"}</Link><br />
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/outfit-line-preferences`} lang={traditional ? "zh-CN" : undefined}>{traditional ? "了解獨立的服裝線條偏好（简体中文）" : zh ? copy("了解独立的服装线条偏好") : "Read about the separate Outfit Line Preferences form"}</Link><br />
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${displayLocale}/tests#more-tests`}>{zh ? copy("返回全部测试") : "Back to all tests"}</Link>
      </section>
    </>}
    <p data-sip-privacy className="mb-5 rounded-lg bg-slate-50 p-4 text-sm leading-7">{zh ? copy("仅本人作答。答案只留当前页面内存，不保存进度、不发送测试流程统计、不分享个人结果；刷新、换语言或离开后不能恢复。") : "Answer only for yourself. Answers remain in this page’s memory without saved drafts or personal-result sharing; no quiz-flow statistics are sent. Refreshing, changing language or leaving loses the attempt."}</p>
    {message && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm leading-7">{message}</p>}
  </section>;
}
