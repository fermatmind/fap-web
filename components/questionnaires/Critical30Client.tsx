"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { CRITICAL30_LIMIT, isCritical30ConfigurationValid, readCritical30Clock, scoreCritical30, type Critical30Closure, type Critical30Mode, type Critical30Questionnaire, type Critical30Result } from "@/lib/questionnaires/critical30";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};
const now = () => ({ wall: Date.now(), monotonic: performance.now() });
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
export function Critical30Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isCritical30ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "练习内容暂不可用。" : "Practice content is unavailable."}</p>;
  return <ValidCritical30Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidCritical30Client({ quiz, locale }: { quiz: Critical30Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const { start: recordStart, complete: recordComplete, view: recordView, share: recordShare, consent: activityConsent } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [mode, setMode] = useState<Critical30Mode>("timed"), [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [result, setResult] = useState<Critical30Result | null>(null);
  const [remaining, setRemaining] = useState<number>(CRITICAL30_LIMIT), [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const answerRef = useRef<QuestionnaireAnswers>({}), active = useRef<{ mode: Critical30Mode; started: ReturnType<typeof now> } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null), revision = useRef(0), submitted = useRef(false);
  const clear = useCallback((notice = "") => {
    revision.current++; active.current = null; answerRef.current = {}; submitted.current = false;
    setAnswers({}); setStage("welcome"); setIndex(0); setResult(null); setMessage(notice); setManual(""); setRemaining(CRITICAL30_LIMIT);
  }, []);
  useEffect(() => {
    const revisionClock = revision;
    const leave = () => clear(), restore = (e: PageTransitionEvent) => { if (e.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revisionClock.current++; active.current = null; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); } }, [index, stage]);
  useEntertainmentResultView(recordView, stage === "result");
  const finish = useCallback((reason: Critical30Closure["reason"], elapsedMs: number) => {
    const current = active.current;
    if (!current || submitted.current) return;
    active.current = null; revision.current++;
    const checked = scoreCritical30(quiz, { mode: current.mode, answers: answerRef.current, closure: { reason, elapsedMs } });
    if (checked.status !== "complete") { clear(zh ? "本次记录无法读取，已清除。可重新选择模式。" : "The attempt could not be read and was cleared. Choose a mode to restart."); return; }
    submitted.current = true; setResult(checked.result); setStage("result"); setManual("");
    setMessage(reason === "expired" ? (zh ? "整卷时间已到，已锁定；空白保留为未答。" : "The whole-attempt deadline has passed. Responses are locked; blanks remain unanswered.") : ""); recordComplete();
  }, [quiz, zh, clear, recordComplete]);
  const checkClock = useCallback((): number | null => {
    const current = active.current;
    if (!current || submitted.current) return null;
    if (current.mode === "study") return 0;
    const clock = readCritical30Clock(current.started, now(), CRITICAL30_LIMIT);
    if (clock.status === "invalid") { clear(zh ? "设备计时发生不一致，本次已清除，未生成计时结果。可选不计时学习后重来。" : "The device clocks became inconsistent. This attempt was cleared without a timed result. You can restart in untimed study."); return null; }
    setRemaining(clock.remainingSeconds);
    if (clock.status === "expired") { finish("expired", clock.elapsedMs); return null; }
    return clock.elapsedMs;
  }, [clear, finish, zh]);
  useEffect(() => {
    if (stage !== "answer") return;
    const timer = window.setInterval(checkClock, 250), visible = () => { if (document.visibilityState === "visible") checkClock(); };
    document.addEventListener("visibilitychange", visible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", visible); };
  }, [stage, checkClock]);
  function begin() {
    if (active.current || submitted.current) return;
    revision.current++; active.current = { mode, started: now() }; setIndex(0); setRemaining(CRITICAL30_LIMIT); setMessage(""); setStage("answer"); recordStart();
  }
  function choose(value: string) {
    if (checkClock() === null) return;
    revision.current++; answerRef.current = { ...answerRef.current, [quiz.questions[index].id]: value };
    setAnswers(answerRef.current); setMessage(""); setManual("");
  }
  function move(to: number) {
    if (checkClock() === null) return;
    setIndex(to); setMessage("");
  }
  function next() {
    const elapsed = checkClock(); if (elapsed === null) return;
    if (!Object.hasOwn(answerRef.current, quiz.questions[index].id)) { setMessage(zh ? "请选择给定选项，或明确选择留空。" : "Choose an offered option, or explicitly leave this question unanswered."); return; }
    setMessage(""); if (index < 29) setIndex(index + 1); else finish("finished", elapsed);
  }
  async function copyPublicLinks() {
    const text = quiz.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, p.id)}`).join("\n\n"), copiedRevision = revision.current;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; recordShare(); setManual(""); setMessage(zh ? "已复制五篇公开指南，不含本次答卷或数量。" : "Copied five public guides, without your responses or counts."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制公开链接。" : "Automatic copying is unavailable. Copy the public links below manually."); }
  }
  const partIndex = Math.floor(index / 6), current = quiz.critical30.sections[partIndex], question = quiz.questions[index];
  const counts = (x: { correct: number; wrong: number; unanswered: number; total: number }) => zh ? `正确 ${x.correct}；错误 ${x.wrong}；未答 ${x.unanswered}；共 ${x.total} 题。` : `Correct ${x.correct}; wrong ${x.wrong}; unanswered ${x.unanswered}; total ${x.total}.`;
  return <section id="take-test" data-critical30-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {activityConsent}<p className="mb-4 text-sm leading-7 text-slate-600">{quiz.critical30.privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{quiz.critical30.subtitle[locale]}</h2>
        <p className="leading-8">{quiz.instructions?.[locale]}</p><p className="leading-8">{quiz.critical30.editionNotice[locale]}</p>
        <div role="radiogroup" aria-label={zh ? "练习模式" : "Practice mode"} className="space-y-3">{(["timed", "study"] as const).map(m => <label key={m} className="flex min-h-12 items-start gap-3 rounded-lg border p-3"><input type="radio" name="critical30-mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="mt-1 size-5 shrink-0 accent-violet-700" /><span className="leading-7">{m === "timed" ? (zh ? "整卷连续计时：30:00，本站选定上限，换段不暂停" : "One continuous 30:00 clock: site-selected cap, no pause between parts") : (zh ? "不计时学习：同一题本，无截止时间" : "Untimed study: the same bank without deadlines")}</span></label>)}</div>
        <button type="button" className={button} onClick={begin}>{zh ? "开始整份练习" : "Start the whole practice"}</button>
      </>}
      {stage === "answer" && <>
        <p data-critical30-progress className="text-sm text-slate-600">{zh ? `第 ${partIndex + 1}/5 部分 · 全卷第 ${index + 1}/30 题` : `Part ${partIndex + 1}/5 · Question ${index + 1}/30 overall`}</p>
        <h2 id="critical30-question" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{current.title[locale]} · {index % 6 + 1}/6</h2>
        <p data-critical30-clock role="timer" aria-live="off" className="font-semibold tabular-nums">{mode === "timed" ? (zh ? `整卷剩余 ${time(remaining)} · 本站连续练习上限` : `Whole attempt remaining ${time(remaining)} · Site continuous practice cap`) : (zh ? "不计时学习" : "Untimed study")}</p>
        <p className="text-sm leading-7">{zh ? "可用下方按钮转到任一部分首题；整卷计时不会暂停或重置。结束前可返回任题修改。" : "Jump to the first question of any part below. The whole clock does not pause or reset. Any response can be revised before finishing."}</p>
        <nav aria-label={zh ? "练习部分导航" : "Practice part navigation"} className="flex flex-wrap gap-2">{quiz.critical30.sections.map((s, i) => <button type="button" key={s.id} data-critical30-jump={s.id} aria-current={partIndex === i ? "step" : undefined} className={button} onClick={() => move(i * 6)}>{i + 1}. {s.title[locale]}</button>)}</nav>
        <p id="critical30-stem" data-critical30-stem lang="en" className="whitespace-pre-line leading-8">{question.prompt.en}</p>
        <div role="radiogroup" aria-labelledby="critical30-question critical30-stem" className="space-y-3">{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3"><input type="radio" name={question.id} value={o.id} checked={answers[question.id] === o.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => choose(o.id)} /><span lang="en" className="leading-7">{o.id} — {o.label.en}</span></label>)}
          <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3"><input type="radio" name={question.id} value="skip" checked={answers[question.id] === "skip"} onChange={() => choose("skip")} className="mt-1 size-5 shrink-0 accent-violet-700" /><span className="leading-7">{zh ? "留空（记为未答）" : "Leave unanswered"}</span></label>
        </div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={index === 0} onClick={() => move(index - 1)}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{index === 29 ? (zh ? "结束并看解析" : "Finish and review") : (zh ? "下一题" : "Next")}</button></div>
        <button type="button" data-critical30-finish className={button} onClick={() => { const elapsed = checkClock(); if (elapsed !== null) finish("finished", elapsed); }}>{zh ? "现在结束整卷，保留未答" : "Finish now; keep blanks unanswered"}</button>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading?.[locale]}</h2>
        <p data-critical30-result-mode className="leading-8">{result.mode === "timed" ? (zh ? "整卷连续计时练习 · 本站选定上限" : "Continuous whole-attempt practice · Site-selected cap") : (zh ? "不计时学习" : "Untimed study")}</p>
        <p data-critical30-closure className="leading-8">{result.closure.reason === "expired" ? (zh ? "整卷到时结束，空白仍为未答。" : "The whole attempt closed at its deadline; blanks remain unanswered.") : (zh ? "你主动结束了整份练习。" : "You finished the whole practice.")}</p>
        <p data-critical30-overall className="rounded-lg bg-violet-50 p-4 leading-8">{counts(result.overall)}</p>
        <p className="leading-8">{zh ? "仅为本题本原始记录，不是提供方成绩、百分位、表现档或通过预测。各段选项数不同且未等值，不按最低数判定弱项，也不由个人数量断言猜测。全部题目与解析免费如下。" : "These are raw records on this bank, not provider scores, percentiles, performance bands or pass predictions. Parts differ in option count and are not equated; the lowest count does not diagnose a weakness, and an individual count cannot identify guessing. Every question and explanation is free below."}</p>
        <div data-critical30-result className="space-y-6">{result.parts.map((part, i) => {
          const profile = quiz.profiles[i];
          return <section key={part.id} data-critical30-part={part.id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 className="scroll-mt-24 text-xl font-semibold">{quiz.critical30.sections[i].title[locale]}</h3><p data-critical30-count className="my-3 leading-8">{counts(part)}</p>
            <details data-critical30-review className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "查看六题答案与双语解析" : "Review all six answers and explanations"}</summary><ol className="my-4 space-y-6">{quiz.questions.slice(i * 6, i * 6 + 6).map(q => {
              const item = result.items.find(x => x.id === q.id)!, selected = q.options.find(o => o.id === item.selectedOptionId), key = q.options.find(o => o.id === item.correctOptionId)!;
              return <li key={q.id} data-critical30-review-item={q.id} className="rounded-lg bg-slate-50 p-3 leading-8"><p lang="en" className="whitespace-pre-line">{q.prompt.en}</p><p className="mt-3">{zh ? "你的选择：" : "Your choice: "}{selected ? <span lang="en">{selected.id} — {selected.label.en}</span> : (zh ? "未答" : "Unanswered")}</p><p>{zh ? "正确答案：" : "Correct answer: "}<span lang="en">{key.id} — {key.label.en}</span></p><p className="mt-3">{q.explanation![locale]}</p></li>;
            })}</ol></details>
            <details data-critical30-full className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "展开完整学习指南" : "Expand the full study guide"}</summary><div className="mt-5"><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`critical30-${part.id}`} /></div></details>
            <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, part.id)}>{zh ? "阅读完整公开指南" : "Read the complete public guide"}</Link>
          </section>;
        })}</div>
        <button type="button" className={button} onClick={copyPublicLinks}>{zh ? "复制公开指南链接" : "Copy public guide links"}</button>
        {manual && <label className="block leading-7">{zh ? "手动复制公开链接" : "Public links for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-40 w-full rounded-lg border p-3" /></label>}
        <button type="button" className={button} onClick={() => clear()}>{zh ? "清空并重新练习" : "Clear and practise again"}</button>
      </>}
      {stage !== "welcome" && <button type="button" className={button} onClick={() => clear()}>{zh ? "退出并清除本次回答" : "Exit and clear these responses"}</button>}
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备练习，请稍候。" : "Preparing practice. Please wait.")}</p>
    <noscript><p>{zh ? "作答需要JavaScript；全部公开指南仍可阅读。" : "Answering requires JavaScript; all public guides remain readable."}</p></noscript>
  </section>;
}
