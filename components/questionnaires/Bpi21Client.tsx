"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { scoreBpi21, isBpi21ConfigurationValid, createBpi21OptionOrder, type Bpi21Result } from "@/lib/questionnaires/bpi21";
import type { Locale } from "@/lib/i18n/locales";
import { Bpi21Report } from "./Bpi21Report";

const subscribeReady = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";

export function Bpi21Client({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [position, setPosition] = useState(0);
  const [order, setOrder] = useState<Record<string, string[]>>({});
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome"), [message, setMessage] = useState("");
  const valid = isBpi21ConfigurationValid(quiz);
  const heading = useRef<HTMLHeadingElement>(null), result: Bpi21Result = valid ? scoreBpi21(quiz, answers) : { status: "unavailable", answered: 0 }, question = quiz.questions[position];
  useEffect(() => { if (stage !== "welcome") heading.current?.focus(); }, [stage, position]);
  if (!valid) return <section role="alert" className="my-8 rounded-lg border p-5">{zh ? "这份BPI-21题本暂不可用。" : "This BPI-21 edition is unavailable."}</section>;
  function reset(next: "welcome" | "answer") { setOrder(next === "answer" ? createBpi21OptionOrder(quiz) : {}); setAnswers({}); setPosition(0); setMessage(""); setStage(next); }
  function advance() {
    if (!question || !answers[question.id]) { setMessage(zh ? "请选择一个选项再继续。" : "Choose an option before continuing."); return; }
    if (position < quiz.questions.length - 1) { setPosition(position + 1); setMessage(""); return; }
    if (result.status !== "complete") { setMessage(zh ? "本次结果暂不可用，请检查完整作答。" : "The result is unavailable. Check that all items have a response."); return; }
    setStage("result"); setMessage("");
  }
  return <section id="take-test" className="my-8 rounded-xl border border-violet-200 bg-white p-5 sm:p-8" aria-label={zh ? "作答与完整结果" : "Questionnaire and full results"}>
    <p data-bpi21-privacy className="mb-5 rounded-lg bg-slate-50 p-4 text-sm leading-7">{zh ? "仅本人作答。答案只留当前页面内存，不保存进度、不发送测试流程统计、不分享个人结果；刷新或换语言会重新开始；可用退出并清除来放弃进度。" : "Answer only for yourself. Answers remain in this page’s memory without saved drafts or personal-result sharing; no quiz-flow statistics are sent. Refreshing or changing language starts fresh. Use Exit and clear to discard current progress."}</p>
    {stage === "welcome" && <>
      <h2 className="text-2xl font-semibold">{zh ? `开始${quiz.questions.length}题BPI-21自评` : `Start your ${quiz.questions.length}-item BPI-21 reflection`}</h2>
      <p className="my-4 leading-8">{quiz.instructions?.[locale]}</p>
      {!ready && <p role="status">{zh ? "正在准备测试…" : "Preparing the test…"}</p>}
      <button disabled={!ready} className={`${button} bg-violet-700 text-white`} onClick={() => reset("answer")}>{zh ? "开始测试" : "Start test"}</button>
    </>}
    {stage === "answer" && question && <>
      <p className="mb-3 text-sm">{zh ? `第${position + 1}题，共${quiz.questions.length}题` : `Question ${position + 1} of ${quiz.questions.length}`}</p>
      <progress aria-label={zh ? "已作答题数" : "Questions answered"} max={quiz.questions.length} value={Object.keys(answers).length} className="mb-5 w-full accent-violet-700" />
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-8 outline-none">{question.prompt[locale]}</h2>
      <p data-bpi21-context className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-7">{zh ? "按自己已熟悉的通常体验，选整体较接近的描述。选项顺序已打乱，未评分始终在最后；不必检查身体或改变习惯。任一未评分就不显示三个个人计数，全部指南仍开放。" : "Use usual experiences you already know and choose the closest overall description. Published alternatives are shuffled; unscored stays last. No new inspection or change of routine is needed. Any unscored answer withholds all three personal counts; every guide stays open."}</p>
      <fieldset className="mt-5 space-y-3"><legend className="sr-only">{question.prompt[locale]}</legend>{(order[question.id] ?? []).map(id => question.options.find(option => option.id === id)!).map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-4 has-[:checked]:border-violet-700 has-[:checked]:bg-violet-50">
        <input type="radio" className="mt-1 size-5 shrink-0 accent-violet-700" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { setAnswers({ ...answers, [question.id]: option.id }); setMessage(""); }} /><span className="min-w-0 leading-7 [overflow-wrap:anywhere]">{option.label[locale]}</span>
      </label>)}</fieldset>
      <div className="mt-6 flex flex-wrap gap-3"><button className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button className={`${button} bg-violet-700 text-white`} onClick={advance}>{position === quiz.questions.length - 1 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next")}</button></div>
      <button className="mt-4 min-h-11 text-sm underline" onClick={() => reset("welcome")}>{zh ? "退出并清除本次进度" : "Exit and clear this attempt"}</button>
    </>}
    {stage === "result" && result.status === "complete" && <>
      <h2 ref={heading} tabIndex={-1} className="text-3xl font-semibold leading-tight outline-none [overflow-wrap:anywhere]">{quiz.resultHeading![locale]}</h2>
      <Bpi21Report quiz={quiz} result={result} locale={locale} />
      <button className={button} onClick={() => reset("answer")}>{zh ? "重新测试" : "Retake test"}</button>
      <section className="mt-10 border-t pt-7"><h3 className="text-xl font-semibold">{zh ? "三份说明已完整开放，可以在这里结束" : "All three guides are open. You may finish here."}</h3>
        <p className="my-4 leading-8">{zh ? "结果是发表问卷中的选择记录，不作医疗体质或健康判断。英文来自Bhargav等人的BPI-21第二版表2，按CC BY 4.0使用；中文为费马工作译文，未继承跨文化或平台验证。" : "This is a record of choices in a published questionnaire, without a medical constitution or health verdict. English comes from Bhargav et al., BPI-21 version 2, Table 2, under CC BY 4.0. Chinese is FermatMind’s working translation without inherited cross-cultural or platform validation."}</p>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
      </section>
    </>}
    {message && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm leading-7">{message}</p>}
  </section>;
}
