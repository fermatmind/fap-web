"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { AFQT32_LIMITS, isAfqt32ConfigurationValid, readAfqt32Clock, scoreAfqt32, type Afqt32Closure, type Afqt32Mode, type Afqt32Questionnaire, type Afqt32Result } from "@/lib/questionnaires/afqt32";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};
const now = () => ({ wall: Date.now(), monotonic: performance.now() });
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
export function Afqt32Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isAfqt32ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "练习内容暂不可用。" : "Practice content is unavailable."}</p>;
  return <ValidAfqt32Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidAfqt32Client({ quiz, locale }: { quiz: Afqt32Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const { start: recordStart, complete: recordComplete, view: recordView, share: recordShare, consent: activityConsent } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [stage, setStage] = useState<"welcome" | "ready" | "answer" | "result">("welcome");
  const [mode, setMode] = useState<Afqt32Mode>("timed"), [section, setSection] = useState(0), [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [result, setResult] = useState<Afqt32Result | null>(null);
  const [remaining, setRemaining] = useState<number>(AFQT32_LIMITS[0]), [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const answerRef = useRef<QuestionnaireAnswers>({}), closures = useRef<Afqt32Closure[]>([]);
  const active = useRef<{ section: number; mode: Afqt32Mode; started: ReturnType<typeof now> } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null), revision = useRef(0), submitted = useRef(false), started = useRef(false);
  const clear = useCallback((notice = "") => {
    revision.current++; active.current = null; closures.current = []; answerRef.current = {}; submitted.current = false; started.current = false;
    setAnswers({}); setStage("welcome"); setSection(0); setPosition(0); setResult(null); setMessage(notice); setManual(""); setRemaining(AFQT32_LIMITS[0]);
  }, []);
  useEffect(() => {
    const revisionClock = revision;
    const leave = () => clear(), restore = (e: PageTransitionEvent) => { if (e.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revisionClock.current++; active.current = null; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); } }, [position, stage, section]);
  useEntertainmentResultView(recordView, stage === "result");
  const closeSection = useCallback((reason: Afqt32Closure["reason"], elapsedMs: number) => {
    const current = active.current;
    if (!current || submitted.current) return;
    active.current = null; revision.current++;
    const next = [...closures.current, { id: quiz.afqt32.sections[current.section].id, reason, elapsedMs }];
    closures.current = next; setManual("");
    setMessage(reason === "expired" ? (zh ? "时间已到，本部分锁定；未做题保留为未答。" : "Time expired. This part is locked; untouched items remain unanswered.") : "");
    if (next.length < 4) { setSection(next.length); setPosition(0); setStage("ready"); return; }
    const checked = scoreAfqt32(quiz, { mode: current.mode, answers: answerRef.current, sections: next });
    if (checked.status !== "complete") { clear(zh ? "本次记录无法读取，已清除。可重新选择模式。" : "The attempt could not be read and was cleared. Choose a mode to restart."); return; }
    submitted.current = true; setResult(checked.result); setStage("result"); recordComplete();
  }, [quiz, zh, clear, recordComplete]);
  const checkClock = useCallback((): number | null => {
    const current = active.current;
    if (!current || submitted.current) return null;
    if (current.mode === "study") return 0;
    const clock = readAfqt32Clock(current.started, now(), AFQT32_LIMITS[current.section]);
    if (clock.status === "invalid") { clear(zh ? "设备计时发生不一致，本次已清除，未生成计时结果。可选不计时学习后重来。" : "The device clocks became inconsistent. This attempt was cleared without a timed result. You can restart in untimed study."); return null; }
    setRemaining(clock.remainingSeconds);
    if (clock.status === "expired") { closeSection("expired", clock.elapsedMs); return null; }
    return clock.elapsedMs;
  }, [clear, closeSection, zh]);
  useEffect(() => {
    if (stage !== "answer") return;
    const timer = window.setInterval(checkClock, 250);
    const visible = () => { if (document.visibilityState === "visible") checkClock(); };
    document.addEventListener("visibilitychange", visible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", visible); };
  }, [stage, checkClock]);
  function beginSection() {
    if (active.current || submitted.current || closures.current.length !== section) return;
    revision.current++; active.current = { section, mode, started: now() };
    setPosition(0); setRemaining(AFQT32_LIMITS[section]); setMessage(""); setStage("answer");
    if (!started.current) { started.current = true; recordStart(); }
  }
  function choose(value: string) {
    if (checkClock() === null) return;
    revision.current++;
    answerRef.current = { ...answerRef.current, [quiz.questions[section * 8 + position].id]: value };
    setAnswers(answerRef.current); setMessage(""); setManual("");
  }
  function next() {
    const elapsed = checkClock(); if (elapsed === null) return;
    if (!Object.hasOwn(answerRef.current, quiz.questions[section * 8 + position].id)) { setMessage(zh ? "请选择A—D，或明确选择留空。" : "Choose A–D, or explicitly leave this question unanswered."); return; }
    setMessage(""); if (position < 7) setPosition(position + 1); else closeSection("finished", elapsed);
  }
  async function copyPublicLinks() {
    const text = quiz.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, p.id)}`).join("\n\n"), copiedRevision = revision.current;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; recordShare(); setManual(""); setMessage(zh ? "已复制四篇公开指南，不含本次答卷或数量。" : "Copied four public guides, without your responses or counts."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制公开链接。" : "Automatic copying is unavailable. Copy the public links below manually."); }
  }
  const current = quiz.afqt32.sections[section], question = quiz.questions[section * 8 + position];
  const counts = (x: { correct: number; wrong: number; unanswered: number; total: number }) => zh ? `正确 ${x.correct}；错误 ${x.wrong}；未答 ${x.unanswered}；共 ${x.total} 题。` : `Correct ${x.correct}; wrong ${x.wrong}; unanswered ${x.unanswered}; total ${x.total}.`;
  return <section id="take-test" data-afqt32-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {activityConsent}<p className="mb-4 text-sm leading-7 text-slate-600">{quiz.afqt32.privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{quiz.afqt32.subtitle[locale]}</h2>
        <p className="leading-8">{quiz.instructions?.[locale]}</p><p className="leading-8">{quiz.afqt32.editionNotice[locale]}</p>
        <div role="radiogroup" aria-label={zh ? "练习模式" : "Practice mode"} className="space-y-3">{(["timed", "study"] as const).map(m => <label key={m} className="flex min-h-12 items-start gap-3 rounded-lg border p-3"><input type="radio" name="afqt32-mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="mt-1 size-5 shrink-0 accent-violet-700" /><span className="leading-7">{m === "timed" ? (zh ? "分段计时：4:00／2:40／4:00／4:00，本站选定上限" : "Section timers: 4:00 / 2:40 / 4:00 / 4:00, site-selected caps") : (zh ? "不计时学习：同一题本，无截止时间" : "Untimed study: the same bank without deadlines")}</span></label>)}</div>
        <button type="button" className={button} onClick={() => { setStage("ready"); setMessage(""); }}>{zh ? "准备第一部分" : "Prepare the first part"}</button>
      </>}
      {stage === "ready" && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{zh ? `第 ${section + 1} / 4 部分：${current.title.zh}` : `Part ${section + 1} of 4: ${current.title.en}`}</h2>
        <p className="leading-8">{zh ? `8道英文题。${mode === "timed" ? `本段上限 ${time(current.limitSeconds)}，点击开始才计时；切后台不会暂停。` : "不计时学习，无截止时间。"}已结束部分不能返回；本段内可返回修改，也可提前结束并保留未答。` : `8 English questions. ${mode === "timed" ? `This part has a ${time(current.limitSeconds)} cap. The start button begins the clock; background tabs do not pause it.` : "Untimed study has no deadline."} Closed parts cannot be reopened. Within this part you can go back, edit, or finish early with blanks.`}</p>
        <button type="button" className={button} onClick={beginSection}>{zh ? "开始本部分" : "Start this part"}</button>
      </>}
      {stage === "answer" && <>
        <p data-afqt32-progress className="text-sm text-slate-600">{zh ? `第 ${section + 1}/4 部分 · 第 ${position + 1}/8 题` : `Part ${section + 1}/4 · Question ${position + 1}/8`}</p>
        <h2 id="afqt32-question" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{current.title[locale]} · {position + 1}/8</h2>
        <p data-afqt32-clock role="timer" aria-live="off" className="font-semibold tabular-nums">{mode === "timed" ? (zh ? `剩余 ${time(remaining)} · 本站练习上限` : `Remaining ${time(remaining)} · Site practice cap`) : (zh ? "不计时学习" : "Untimed study")}</p>
        <p id="afqt32-stem" data-afqt32-stem lang="en" className="whitespace-pre-line leading-8">{question.prompt.en}</p>
        <div role="radiogroup" aria-labelledby="afqt32-question afqt32-stem" className="space-y-3">{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3"><input type="radio" name={question.id} value={o.id} checked={answers[question.id] === o.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => choose(o.id)} /><span lang="en" className="leading-7">{o.id} — {o.label.en}</span></label>)}
          <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3"><input type="radio" name={question.id} value="skip" checked={answers[question.id] === "skip"} onChange={() => choose("skip")} className="mt-1 size-5 shrink-0 accent-violet-700" /><span className="leading-7">{zh ? "留空（记为未答）" : "Leave unanswered"}</span></label>
        </div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { if (checkClock() !== null) { setPosition(position - 1); setMessage(""); } }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 7 ? (zh ? "结束本部分" : "Finish this part") : (zh ? "下一题" : "Next")}</button></div>
        <button type="button" className={button} onClick={() => { const elapsed = checkClock(); if (elapsed !== null) closeSection("finished", elapsed); }}>{zh ? "提前结束本部分，保留未答" : "Finish part early; keep blanks unanswered"}</button>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading?.[locale]}</h2>
        <p data-afqt32-result-mode className="leading-8">{result.mode === "timed" ? (zh ? "分段计时练习 · 本站选定上限" : "Timed section practice · Site-selected caps") : (zh ? "不计时学习" : "Untimed study")}</p>
        <p data-afqt32-overall className="rounded-lg bg-violet-50 p-4 leading-8">{counts(result.overall)}</p>
        <p className="leading-8">{zh ? "以上仅为本题本原始记录，不是AFQT成绩、百分位、通过或资格判定。各部分难度未等值，不按最低正确数判定弱项。全部题目与解析如下免费可读。" : "These are raw records on this bank, not an AFQT score, percentile, pass or qualification decision. Parts are not equated; the lowest count does not diagnose a weakness. Every question and explanation is free below."}</p>
        <div data-afqt32-result className="space-y-6">{result.parts.map((part, i) => {
          const profile = quiz.profiles[i];
          return <section key={part.id} data-afqt32-part={part.id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 className="scroll-mt-24 text-xl font-semibold">{quiz.afqt32.sections[i].title[locale]}</h3>
            <p data-afqt32-count className="my-3 leading-8">{counts(part)}</p><p data-afqt32-closure className="my-3 leading-7">{part.reason === "expired" ? (zh ? "到时结束；空白仍为未答。" : "Closed at the deadline; blanks remain unanswered.") : (zh ? "主动结束本部分。" : "You finished this part.")}</p>
            <details data-afqt32-review className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "查看八题答案与双语解析" : "Review all eight answers and explanations"}</summary><ol className="my-4 space-y-6">{quiz.questions.slice(i * 8, i * 8 + 8).map(q => {
              const item = result.items.find(x => x.id === q.id)!, selected = q.options.find(o => o.id === item.selectedOptionId), key = q.options.find(o => o.id === item.correctOptionId)!;
              return <li key={q.id} data-afqt32-review-item={q.id} className="rounded-lg bg-slate-50 p-3 leading-8"><p lang="en" className="whitespace-pre-line">{q.prompt.en}</p><p className="mt-3">{zh ? "你的选择：" : "Your choice: "}{selected ? <span lang="en">{selected.id} — {selected.label.en}</span> : (zh ? "未答" : "Unanswered")}</p><p>{zh ? "正确答案：" : "Correct answer: "}<span lang="en">{key.id} — {key.label.en}</span></p><p className="mt-3">{q.explanation![locale]}</p></li>;
            })}</ol></details>
            <details data-afqt32-full className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "展开完整学习指南" : "Expand the full study guide"}</summary><div className="mt-5"><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`afqt32-${part.id}`} /></div></details>
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
