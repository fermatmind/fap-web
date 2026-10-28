"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import { isMiniConflictConfigurationValid, scoreMiniConflictQuestionnaire, type MiniConflictQuestionnaire } from "@/lib/questionnaires/miniConflict";
import { QuestionnaireConflictReport } from "./QuestionnaireConflictReport";

type Complete = Extract<FacetResult, { status: "complete" }>;
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function QuestionnaireConflictClient({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isMiniConflictConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "问卷内容暂不可用。" : "The questionnaire content is unavailable."}</p>;
  return <ValidConflictClient key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}

function ValidConflictClient({ quiz, locale }: { quiz: MiniConflictQuestionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Complete | null>(null);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), progress = useRef<HTMLParagraphElement>(null);
  const clear = useCallback(() => {
    setAnswers({}); setStage("welcome"); setPosition(0); setResult(null); setMessage("");
  }, []);
  useEffect(() => {
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus({ preventScroll: true }); (stage === "answer" ? progress.current : heading.current)?.scrollIntoView({ block: "start" }); } }, [stage, position]);
  function next() {
    const checked = scoreMiniConflictQuestionnaire(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? "当前回答无法读取，请清除后重新开始。" : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请选择一个数字，或明确选择不想回答。" : "Choose a number, or explicitly prefer not to answer."); return; }
    setMessage("");
    if (position < 23) setPosition(position + 1);
    else if (checked.status === "complete") { setResult(checked); setStage("result"); }
    else setMessage(zh ? "还有题目未作选择；空白与不计分不同。请返回检查。" : "Some statements have no choice. Blank and unscored are different; go back to check.");
  }
  return <section id="take-test" data-conflict-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "只使用当前页面内存；不保存草稿或结果，不上传逐题选择，不接分析事件，不提供个人结果分享。刷新、换语或离开会清除。" : "Current-page memory only: no saved draft or result, choice uploads, analytics or personal-result sharing. Reloading, changing language or leaving clears answers."}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0">
      <legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{zh ? "只回答本人，可随时跳过" : "Your own behavior, with room to skip"}</h2>
        <p className="leading-8">{quiz.introduction[locale]}</p>
        <p className="leading-8">{quiz.instructions[locale]}</p>
        <p className="rounded-lg border border-slate-300 p-4 leading-8">{zh ? "仅回看本人过去三个月。数值不能判定或排除真实伤害、危险性或诊断；不替别人作答。现实安全问题优先寻求适当支持，不等待测试结果。" : "Look back at your own past three months only. Values cannot establish or rule out actual harm, dangerousness or a diagnosis. Do not assess someone else. Prioritize appropriate support for real safety concerns rather than waiting for a result."}</p>
        <button type="button" className={button} onClick={() => { setStage("answer"); setPosition(0); setMessage(""); }}>{zh ? "开始测试" : "Start test"}</button>
      </>}
      {stage === "answer" && <>
        <p ref={progress} data-conflict-progress className="scroll-mt-24 text-sm text-slate-600">{zh ? `第 ${position + 1} / 24 条` : `Statement ${position + 1} of 24`}</p>
        <h2 ref={heading} tabIndex={-1} id="conflict-question" className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{quiz.questions[position].prompt[locale]}</h2>
        <div role="radiogroup" aria-labelledby="conflict-question" className="space-y-3">{quiz.questions[position].options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={quiz.questions[position].id} value={option.id} checked={answers[quiz.questions[position].id] === option.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { setAnswers({ ...answers, [quiz.questions[position].id]: option.id }); setMessage("");  setResult(null); }} />
          <span className="leading-7">{option.id === "na" ? "" : `${option.id} — `}{option.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 23 ? (zh ? "查看本次记录" : "See this record") : (zh ? "下一题" : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading[locale]}</h2>
        <QuestionnaireConflictReport quiz={quiz} result={result} locale={locale} />
        <button type="button" className={button} onClick={() => { clear(); setStage("answer"); }}>{zh ? "愿意时重新作答（清除本次回答）" : "Answer again if you want (empty answers)"}</button>
      </>}
      {stage !== "welcome" && <button type="button" className={button} onClick={clear}>{zh ? "退出并清除本次回答" : "Exit and clear these responses"}</button>}
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备问卷，请稍候。" : "Preparing the questionnaire. Please wait.")}</p>
    <noscript><p>{zh ? "互动答题需要JavaScript；禁用时本网站部分页面可能停在加载画面。" : "Interactive answering requires JavaScript. Some pages on this website may remain at a loading screen when it is disabled."}</p></noscript>
  </section>;
}
