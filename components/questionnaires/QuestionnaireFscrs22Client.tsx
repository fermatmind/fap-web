"use client";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isFscrs22ConfigurationValid, scoreFscrs22Questionnaire, type Fscrs22Questionnaire, type Fscrs22Readout } from "@/lib/questionnaires/fscrs22";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireFscrs22Report } from "./QuestionnaireFscrs22Report";
import { QuestionnaireFscrs22Support } from "./QuestionnaireFscrs22Attribution";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function QuestionnaireFscrs22Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isFscrs22ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "问卷内容暂不可用。" : "The questionnaire content is unavailable."}</p>;
  return <ValidFscrs22Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}

function ValidFscrs22Client({ quiz, locale }: { quiz: Fscrs22Questionnaire; locale: Locale }) {
  const { start: recordStart, complete: recordComplete, view: recordView, consent: activityConsent, share: recordShare } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Fscrs22Readout | null>(null);
  const [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), revision = useRef(0);
  const clear = useCallback(() => {
    revision.current += 1; setAnswers({}); setStage("welcome"); setPosition(0); setResult(null); setMessage(""); setManual("");
  }, []);
  useEffect(() => {
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revision.current += 1; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); } }, [stage, position]);
  function next() {
    const checked = scoreFscrs22Questionnaire(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? "当前回答无法读取，请清除后重新开始。" : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请选择一个数字，或明确选择跳过此项。" : "Choose a number, or explicitly skip this statement."); return; }
    setMessage("");
    if (position < 21) setPosition(position + 1);
    else if (checked.status === "complete") { revision.current += 1; setResult(checked.fscrs22); setStage("result"); recordComplete(); }
    else setMessage(zh ? "还有题目未作选择；空白与跳过不同。请返回检查。" : "Some statements have no choice. Blank and skipped are different; go back to check.");
  }
  async function copyPublicLinks() {
    const text = quiz.profiles.map(profile => `${profile.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, profile.id)}`).join("\n\n");
    const copiedRevision = revision.current;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; recordShare(); setManual(""); setMessage(zh ? "已复制公开解释链接，不含答案或个人数值。" : "Copied public explanation links, without answers or personal values."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制公开链接。" : "Automatic copying is unavailable. Copy the public links below manually."); }
  }
  const question = quiz.questions[position];
  useEntertainmentResultView(recordView, stage === "result");
  return <section id="take-test" data-fscrs22-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {activityConsent}
    <p className="mb-4 text-sm leading-7 text-slate-600">{quiz.fscrs22.privacy[locale]}</p>
    <QuestionnaireFscrs22Support support={quiz.fscrs22.support} locale={locale} />
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0">
      <legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{quiz.fscrs22.subtitle[locale]}</h2>
        {quiz.fscrs22.intro.map((paragraph, index) => <p key={index} className="leading-8">{paragraph[locale]}</p>)}
        <p data-fscrs22-sensitive-notice className="rounded-lg border border-slate-300 p-4 leading-8">{quiz.fscrs22.sensitiveNotice[locale]}</p>
        <button type="button" className={button} onClick={() => { revision.current += 1; setStage("answer"); recordStart(); setPosition(0); setMessage(""); }}>{zh ? "开始测试" : "Start test"}</button>
      </>}
      {stage === "answer" && <>
        <p data-fscrs22-progress className="text-sm text-slate-600">{zh ? `第 ${position + 1} / 22 条` : `Statement ${position + 1} of 22`}</p>
        {position === 8 && <p data-fscrs22-sensitive-notice className="rounded-lg border border-slate-300 p-4 leading-8">{quiz.fscrs22.sensitiveNotice[locale]}</p>}
        <h2 ref={heading} tabIndex={-1} id="fscrs22-question" className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{question.prompt[locale]}</h2>
        <div role="radiogroup" aria-labelledby="fscrs22-question" className="space-y-3">{question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current += 1; setAnswers({ ...answers, [question.id]: option.id }); setMessage(""); setManual(""); setResult(null); }} />
          <span className="leading-7">{option.id !== "na" && !["2", "3", "4"].includes(option.id) ? `${option.id} — ` : ""}{option.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 21 ? (zh ? "查看三个部分" : "See three parts") : (zh ? "下一题" : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading?.[locale]}</h2>
        <QuestionnaireFscrs22Report quiz={quiz} result={result} locale={locale} />
        <button type="button" className={button} onClick={copyPublicLinks}>{zh ? "复制公开解释链接" : "Copy public explanation links"}</button>
        {manual && <label className="block leading-7">{zh ? "手动复制公开链接" : "Public links for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-40 w-full rounded-lg border border-slate-300 p-3" /></label>}
      </>}
      {stage !== "welcome" && <button type="button" className={button} onClick={clear}>{zh ? "退出并清除本次回答" : "Exit and clear these responses"}</button>}
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备问卷，请稍候。" : "Preparing the questionnaire. Please wait.")}</p>
    <noscript><p>{zh ? "作答需要启用 JavaScript；公开解释和支持说明仍可直接阅读。" : "Answering requires JavaScript; public explanations and support information remain readable."}</p></noscript>
  </section>;
}
