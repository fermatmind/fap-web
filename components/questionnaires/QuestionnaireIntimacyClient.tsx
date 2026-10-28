"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import { isMiniIntimacyConfigurationValid, scoreMiniIntimacyQuestionnaire, type MiniIntimacyQuestionnaire } from "@/lib/questionnaires/miniIntimacy";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireIntimacyReport } from "./QuestionnaireIntimacyReport";

type Complete = Extract<FacetResult, { status: "complete" }>;
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function QuestionnaireIntimacyClient({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isMiniIntimacyConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "问卷内容暂不可用。" : "The questionnaire content is unavailable."}</p>;
  return <ValidIntimacyClient key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}

function ValidIntimacyClient({ quiz, locale }: { quiz: MiniIntimacyQuestionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Complete | null>(null);
  const [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), progress = useRef<HTMLParagraphElement>(null), revision = useRef(0);
  const clear = useCallback(() => {
    revision.current += 1; setAnswers({}); setStage("welcome"); setPosition(0); setResult(null); setMessage(""); setManual("");
  }, []);
  useEffect(() => {
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revision.current += 1; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus({ preventScroll: true }); (stage === "answer" ? progress.current : heading.current)?.scrollIntoView({ block: "start" }); } }, [stage, position]);
  function next() {
    const checked = scoreMiniIntimacyQuestionnaire(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? "当前回答无法读取，请清除后重新开始。" : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请选择一个数字，或明确选择不计分。" : "Choose a number, or explicitly choose unscored."); return; }
    setMessage("");
    if (position < 23) setPosition(position + 1);
    else if (checked.status === "complete") { revision.current += 1; setResult(checked); setStage("result"); }
    else setMessage(zh ? "还有题目未作选择；空白与不计分不同。请返回检查。" : "Some statements have no choice. Blank and unscored are different; go back to check.");
  }
  async function copyPublicLinks() {
    const text = quiz.profiles.map(profile => `${profile.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, profile.id)}`).join("\n\n");
    const copiedRevision = revision.current;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; setManual(""); setMessage(zh ? "已复制公开解释链接，不含答案或个人数值。" : "Copied public explanation links, without answers or personal values."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制公开链接。" : "Automatic copying is unavailable. Copy the public links below manually."); }
  }
  return <section id="take-test" data-intimacy-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "只使用当前页面内存；不保存草稿或结果，不上传逐题选择。刷新、换语或离开会清除。" : "Current-page memory only: no draft or result is saved and choices are not uploaded. Reloading, changing language or leaving clears answers."}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0">
      <legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{zh ? "成年人互动偏好，按自己的节奏回答" : "Adult interaction preferences, at your own pace"}</h2>
        <p className="leading-8">{quiz.introduction[locale]}</p>
        <p className="leading-8">{quiz.instructions[locale]}</p>
        <p className="rounded-lg border border-slate-300 p-4 leading-8">{zh ? "偏好不代替当下同意；没有分数可以要求接触、公开或披露。任何题都可选不计分，四份全文始终可读。" : "Preferences do not replace present consent. No score can demand contact, publicity or disclosure. Any item can be unscored, and all four full guides remain open."}</p>
        <button type="button" className={button} onClick={() => { revision.current += 1; setStage("answer"); setPosition(0); setMessage(""); }}>{zh ? "开始测试" : "Start test"}</button>
      </>}
      {stage === "answer" && <>
        <p ref={progress} data-intimacy-progress className="scroll-mt-24 text-sm text-slate-600">{zh ? `第 ${position + 1} / 24 条` : `Statement ${position + 1} of 24`}</p>
        <h2 ref={heading} tabIndex={-1} id="intimacy-question" className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{quiz.questions[position].prompt[locale]}</h2>
        <div role="radiogroup" aria-labelledby="intimacy-question" className="space-y-3">{quiz.questions[position].options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={quiz.questions[position].id} value={option.id} checked={answers[quiz.questions[position].id] === option.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current += 1; setAnswers({ ...answers, [quiz.questions[position].id]: option.id }); setMessage(""); setManual(""); setResult(null); }} />
          <span className="leading-7">{option.id === "na" ? "" : `${option.id} — `}{option.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 23 ? (zh ? "查看四个部分" : "See four parts") : (zh ? "下一题" : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading[locale]}</h2>
        <QuestionnaireIntimacyReport quiz={quiz} result={result} locale={locale} />
        <button type="button" className={button} onClick={copyPublicLinks}>{zh ? "复制公开解释链接" : "Copy public explanation links"}</button>
        {manual && <label className="block leading-7">{zh ? "手动复制公开链接" : "Public links for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-40 w-full rounded-lg border border-slate-300 p-3" /></label>}
        <button type="button" className={button} onClick={() => { clear(); setStage("answer"); }}>{zh ? "重新测试（清除本次回答）" : "Retake with empty answers"}</button>
      </>}
      {stage !== "welcome" && <button type="button" className={button} onClick={clear}>{zh ? "退出并清除本次回答" : "Exit and clear these responses"}</button>}
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备问卷，请稍候。" : "Preparing the questionnaire. Please wait.")}</p>
    <noscript><p>{zh ? "互动答题需要JavaScript；禁用时本网站部分页面可能停在加载画面。" : "Interactive answering requires JavaScript. Some pages on this website may remain at a loading screen when it is disabled."}</p></noscript>
  </section>;
}
