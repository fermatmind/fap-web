"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { traditionalQuiz as quiz, traditionalUi as ui } from "@/lib/i18n/zh-TW/chiikawa";
import { TRADITIONAL_QUIZ_PATH } from "@/lib/i18n/traditionalRoutes";
import { CANONICAL_SITE_URL } from "@/lib/site";
import { ChiikawaReading } from "./ChiikawaReading";

const entry = `/zh-TW${TRADITIONAL_QUIZ_PATH}`;
const button = "min-h-11 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-40";
export function ChiikawaTake() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [position, setPosition] = useState(0), [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState(""), [manualCopy, setManualCopy] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const score = scoreArchetypeQuestionnaire(quiz, answers);
  const question = quiz.questions[position];
  useEffect(() => { heading.current?.focus(); }, [position, submitted]);
  function next() {
    if (!answers[question.id]) { setMessage(ui.choose["zh-TW"]); return; }
    setMessage("");
    if (position === quiz.questions.length - 1) setSubmitted(true);
    else setPosition(position + 1);
  }
  function retake() { setAnswers({}); setPosition(0); setSubmitted(false); setManualCopy(""); setMessage(""); }
  async function copy() {
    if (score.status !== "complete") return;
    const profiles = quiz.profiles.filter(profile => score.profileIds.includes(profile.id));
    const path = profiles.length === 1 ? `${entry}/results/${profiles[0].id}` : entry;
    const text = [quiz.resultHeading!["zh-TW"], ...profiles.map(profile => profile.title["zh-TW"]), ui.public["zh-TW"], `${CANONICAL_SITE_URL}${path}`].join("\n");
    try { await navigator.clipboard.writeText(text); setMessage(ui.copied["zh-TW"]); }
    catch { setManualCopy(text); }
  }
  if (score.status === "unavailable" || score.status === "invalid") return <p role="alert">{ui.unavailable["zh-TW"]}</p>;
  return <div className="space-y-6" data-stage={submitted ? "result" : "answer"}>
    <Link href={entry} className="inline-block min-h-11 py-2 underline">{ui.return["zh-TW"]}</Link>
    {submitted && score.status === "complete" ? <>
      <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold">{quiz.resultHeading!["zh-TW"]}</h1>
      <p className="leading-8">{ui.resultNote["zh-TW"]}</p>
      <section aria-label={ui.counts["zh-TW"]}><h2 className="text-xl font-semibold">{ui.counts["zh-TW"]}</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2">{quiz.directions.map(direction => <div key={direction.id} data-count={direction.id} className="rounded-xl border border-slate-200 p-4"><dt>{direction.title["zh-TW"]}</dt><dd>{score.counts[direction.id]} / {direction.comparisons}</dd></div>)}</dl></section>
      {quiz.profiles.filter(profile => score.profileIds.includes(profile.id)).map(profile => <div key={profile.id} className="space-y-3"><ChiikawaReading profile={profile} /><Link className="inline-block min-h-11 py-2 underline" href={`${entry}/results/${profile.id}`} target="_blank" rel="noopener">{ui.guide["zh-TW"]}：{profile.title["zh-TW"]}（新分頁）</Link></div>)}
      <div className="flex flex-wrap gap-4"><button type="button" className={button} onClick={copy}>{ui.copy["zh-TW"]}</button><button type="button" className={button} onClick={retake}>{ui.retake["zh-TW"]}</button></div>
      {manualCopy && <label className="block">{ui.manual["zh-TW"]}<textarea readOnly rows={6} value={manualCopy} className="mt-3 w-full rounded-xl border border-slate-300 p-4" onFocus={event => event.currentTarget.select()} /></label>}
    </> : <>
      <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold">{quiz.title["zh-TW"]}</h1>
      <p className="whitespace-pre-line leading-8">{quiz.instructions!["zh-TW"]}</p>
      <p aria-live="polite">第 {position + 1} / {quiz.questions.length} 題</p>
      <fieldset key={question.id} className="space-y-4"><legend className="mb-5 text-xl font-semibold leading-8">{question.prompt["zh-TW"]}</legend>{question.options.map(option => <label key={option.id} className="flex min-h-14 cursor-pointer items-start gap-4 rounded-xl border border-slate-300 bg-white p-4 leading-7"><input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => { setAnswers(current => ({ ...current, [question.id]: option.id })); setMessage(""); }} className="mt-1.5 size-5 shrink-0" />{option.label["zh-TW"]}</label>)}</fieldset>
      <div className="flex flex-wrap gap-4"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{ui.back["zh-TW"]}</button><button type="button" className={button} onClick={next}>{position === quiz.questions.length - 1 ? ui.submit["zh-TW"] : ui.next["zh-TW"]}</button></div>
    </>}
    <p role="status" className="leading-7">{message}</p><p className="text-sm leading-7 text-slate-600">{ui.privacy["zh-TW"]}</p>
  </div>;
}
