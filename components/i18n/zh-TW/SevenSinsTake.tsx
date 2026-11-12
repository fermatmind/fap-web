"use client";
import { QuestionnaireTakeOptions } from "@/components/questionnaires/QuestionnaireTakeOptions";
import takeStyles from "@/components/questionnaires/QuestionnaireTake.module.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { traditionalSevenSins as quiz } from "@/lib/i18n/zh-TW/sevenSins";
import { QuestionnaireSevenSinsOverview } from "@/components/questionnaires/QuestionnaireSevenSinsOverview";
import { SevenSinsPersonalCard } from "@/components/questionnaires/SevenSinsPersonalCard";
import { SevenSinsReading } from "./SevenSinsReading";

const entry = "/zh-TW/tests/explore/seven-sins-virtues-test";
const button = "min-h-11 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-40";
export function SevenSinsTake() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [position, setPosition] = useState(0), [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), resultHeading = useRef<HTMLHeadingElement>(null);
  const score = scoreMiniVirtuesQuestionnaire(quiz, answers), question = quiz.questions[position];
  useEffect(() => { if (submitted) resultHeading.current?.focus(); else heading.current?.focus(); }, [position, submitted]);
  function next() {
    if (!answers[question.id]) { setMessage("請選擇一個選項再繼續。"); return; }
    if (position === 27) {
      if (score.status !== "complete" || score.model !== "dual") { setMessage("請完成全部28題後再查看結果。"); return; }
      setSubmitted(true);
    } else setPosition(position + 1);
    setMessage("");
  }
  function retake() { setAnswers({}); setPosition(0); setSubmitted(false); setManual(""); setMessage(""); }
  async function copy() {
    const text = `${quiz.title["zh-TW"]}\nhttps://fermatmind.com${entry}`;
    try { await navigator.clipboard.writeText(text); setMessage("已複製公開測試入口，不含本次分數或答案。"); }
    catch { setManual(text); setMessage("請手動複製下方公開入口。"); }
  }
  if (score.status === "unavailable" || score.status === "invalid") return <p role="alert">本次結果暫不可用，請重新開始。</p>;
  return <Container as="main" className="max-w-3xl space-y-6 py-10" data-stage={submitted ? "result" : "answer"}>
    <Link href={entry} className="inline-block min-h-11 py-2 underline">返回測試介紹</Link>
    {submitted && score.status === "complete" && score.model === "dual" ? <>
      <QuestionnaireSevenSinsOverview result={score} locale="zh-TW" headingRef={resultHeading} />
      <section id="seven-sins-readings" className="space-y-8"><h2 className="text-2xl font-bold">七組完整解讀</h2>{quiz.profiles.map(profile => <section key={profile.id} className="space-y-4"><SevenSinsReading profile={profile} /><Link href={`${entry}/results/${profile.id}`} target="_blank" rel="noopener" className="inline-block min-h-11 py-2 underline">開啟完整公開指南（新分頁）</Link></section>)}</section>
      <SevenSinsPersonalCard result={score} locale="zh-TW" formCode={quiz.source.formCode} />
      <div className="flex flex-wrap gap-4 print:hidden"><button className={button} onClick={copy}>複製公開入口</button><button className={button} onClick={retake}>重新測試</button><button className={button} onClick={() => window.print()}>列印結果</button></div>
      {manual && <label className="block">手動複製公開入口<textarea readOnly rows={4} value={manual} className="mt-3 w-full rounded-xl border border-slate-300 p-4" onFocus={event => event.currentTarget.select()} /></label>}
    </> : <>
      <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold">{quiz.title["zh-TW"]}</h1>
      <p className="whitespace-pre-line leading-8">{quiz.instructions!["zh-TW"]}</p><p aria-live="polite">第 {position + 1} / 28 題</p>
      <h2 className="mb-5 text-xl font-semibold leading-8">{question.prompt["zh-TW"]}</h2>
      <div className={takeStyles.engine}>
        <QuestionnaireTakeOptions questionId={question.id} prompt={question.prompt["zh-TW"]}
          options={question.options.map(option => ({ id: option.id, label: option.label["zh-TW"] }))}
          value={answers[question.id]} scale positiveLast onChange={id => {
            setAnswers(current => ({ ...current, [question.id]: id }));
            setMessage("");
          }} />
      </div>
      <div className="flex flex-wrap gap-4"><button className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>上一題</button><button className={button} onClick={next}>{position === 27 ? "查看結果" : "下一題"}</button></div>
    </>}
    <p role="status" className="leading-7">{message}</p><p className="text-sm leading-7 text-slate-600">作答與計分只留在此頁面記憶體；重新整理、離開或切換語言會開始新一輪。本繁體版本不傳送測評活動統計。</p>
  </Container>;
}
