"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { scoreLikertQuestionnaire, isLikertConfigurationValid, type FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";
import { AttractionExperiencesReport } from "./AttractionExperiencesReport";

const subscribeReady = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";

export function AttractionExperiencesClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [position, setPosition] = useState(0);
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome"), [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), result: FacetResult = isLikertConfigurationValid(quiz) ? scoreLikertQuestionnaire(quiz, answers) : { status: "unavailable", answered: 0 }, question = quiz.questions[position];
  useEffect(() => { if (stage !== "welcome") heading.current?.focus(); }, [stage, position]);
  function reset(next: "welcome" | "answer") { setAnswers({}); setPosition(0); setMessage(""); setStage(next); }
  function advance() {
    if (!question || !answers[question.id]) { setMessage(zh ? "请选择一个选项再继续。" : "Choose an option before continuing."); return; }
    if (position < quiz.questions.length - 1) { setPosition(position + 1); setMessage(""); return; }
    if (result.status !== "complete") { setMessage(zh ? "本次结果暂不可用，请检查完整作答。" : "The result is unavailable. Check that all items have a response."); return; }
    setStage("result"); setMessage("");
  }
  return <section id="take-test" className="my-8 rounded-xl border border-violet-200 bg-white p-5 sm:p-8" aria-label={zh ? "作答与完整结果" : "Questionnaire and full results"}>
    <p data-atr-privacy className="mb-5 rounded-lg bg-slate-50 p-4 text-sm leading-7">{zh ? "仅本人作答。答案只留当前页面内存，不保存进度、不发送测试流程统计、不分享个人结果；刷新、换语言或离开后不能恢复。" : "Answer only for yourself. Answers remain in this page’s memory without saved drafts or personal-result sharing; no quiz-flow statistics are sent. Refreshing, changing language or leaving loses the attempt."}</p>
    {stage === "welcome" && <>
      <h2 className="text-2xl font-semibold">{zh ? `开始${quiz.questions.length}题吸引体验观察` : `Start your ${quiz.questions.length}-item experience reflection`}</h2>
      <p className="my-4 leading-8">{quiz.instructions?.[locale]}</p>
      {!ready && <p role="status">{zh ? "正在准备测试…" : "Preparing the test…"}</p>}
      <button disabled={!ready} className={`${button} bg-violet-700 text-white`} onClick={() => reset("answer")}>{zh ? "开始测试" : "Start test"}</button>
    </>}
    {stage === "answer" && question && <>
      <p className="mb-3 text-sm">{zh ? `第${position + 1}题，共${quiz.questions.length}题` : `Question ${position + 1} of ${quiz.questions.length}`}</p>
      <progress aria-label={zh ? "已作答题数" : "Questions answered"} max={quiz.questions.length} value={Object.keys(answers).length} className="mb-5 w-full accent-violet-700" />
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-8 outline-none">{question.prompt[locale]}</h2>
      <p data-atr-context className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-7">{question.options[0].directionId === "romantic-presence" ? (zh ? "没有浪漫吸引时，可以不同意再次出现的描述；若感受不清楚或不愿评价，请选未评分。" : "No romantic attraction can be meaningful disagreement with recurrence statements. If the feeling is unclear or private, choose unscored.") : (zh ? "只评价有合适经历依据的陈述。没有吸引起点、没有可比较经历或不确定时，请选未评分，不猜一个低数值。" : "Rate only statements supported by suitable experiences. With no attraction onset, no comparison or uncertainty, choose unscored instead of guessing a low number.")}</p>
      <fieldset className="mt-5 space-y-3"><legend className="sr-only">{question.prompt[locale]}</legend>{question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-4 has-[:checked]:border-violet-700 has-[:checked]:bg-violet-50">
        <input type="radio" className="mt-1 size-5 shrink-0 accent-violet-700" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { setAnswers({ ...answers, [question.id]: option.id }); setMessage(""); }} /><span className="min-w-0 leading-7 [overflow-wrap:anywhere]">{option.label[locale]}</span>
      </label>)}</fieldset>
      <div className="mt-6 flex flex-wrap gap-3"><button className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button className={`${button} bg-violet-700 text-white`} onClick={advance}>{position === quiz.questions.length - 1 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next")}</button></div>
      <button className="mt-4 min-h-11 text-sm underline" onClick={() => reset("welcome")}>{zh ? "退出并清除本次进度" : "Exit and clear this attempt"}</button>
    </>}
    {stage === "result" && result.status === "complete" && <>
      <h2 ref={heading} tabIndex={-1} className="text-3xl font-semibold leading-tight outline-none [overflow-wrap:anywhere]">{quiz.resultHeading![locale]}</h2>
      <AttractionExperiencesReport quiz={quiz} result={result} locale={locale} />
      <button className={button} onClick={() => reset("answer")}>{zh ? "重新测试" : "Retake test"}</button>
      <section className="mt-10 border-t pt-7"><h3 className="text-xl font-semibold">{zh ? "五份说明已完整开放，可以在这里结束" : "All five guides are open. You may finish here."}</h3>
        <p className="my-4 leading-8">{zh ? "Mini 20题观察的是辨认、描述、标签和隐私；实际体验与描述能力不同，分数不换算。是否另作答由你决定。" : "The separate Mini 20-item reflection concerns recognising and describing feelings, labels and privacy. Experience and description skills differ; scores do not convert. Another attempt is optional."}</p>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/orientation-exploration-test`}>{zh ? "了解Mini 20题独立观察" : "Read about the separate Mini 20-item reflection"}</Link><br />
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
      </section>
    </>}
    {message && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm leading-7">{message}</p>}
  </section>;
}
