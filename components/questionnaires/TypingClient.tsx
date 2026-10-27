"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { TYPING_DURATION_MS, isTypingConfigurationValid, normalizeTypingText, scoreTypingRound, typingCharacters, type TypingConfiguration, type TypingResult } from "@/lib/questionnaires/typing";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};
type Active = { mode: number; started: number; wallStarted: number; committed: string };
type Complete = Extract<TypingResult, { status: "complete" }>;

export function TypingClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (!isTypingConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "打字练习配置或浏览器字符支持暂不可用。" : "Typing configuration or browser character support is unavailable."}</p>;
  return <ValidTypingClient quiz={quiz} locale={locale} />;
}
function ValidTypingClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const config = (quiz as Questionnaire & { typing: TypingConfiguration }).typing;
  const zh = locale === "zh";
  const [mode, setMode] = useState(0), [phase, setPhase] = useState<"ready" | "running" | "result">("ready");
  const [text, setText] = useState(""), [committed, setCommitted] = useState(""), [remaining, setRemaining] = useState(TYPING_DURATION_MS);
  const [message, setMessage] = useState(""), [finished, setFinished] = useState<Complete | null>(null), [manual, setManual] = useState("");
  const active = useRef<Active | null>(null), composing = useRef(false), input = useRef<HTMLTextAreaElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const passageBox = useRef<HTMLDivElement>(null), cursor = useRef<HTMLSpanElement>(null);
  const round = config.rounds[mode];
  const target = useMemo(() => typingCharacters(round.passage), [round.passage]);
  const entered = useMemo(() => typingCharacters(committed), [committed]);
  const reset = useCallback((reason = "") => {
    active.current = null; composing.current = false; if (passageBox.current) passageBox.current.scrollTop = 0; setText(""); setCommitted(""); setRemaining(TYPING_DURATION_MS);
    setFinished(null); setManual(""); setMessage(reason); setPhase("ready");
  }, []);
  const finish = useCallback((elapsed: number) => {
    const attempt = active.current;
    if (!attempt || elapsed < TYPING_DURATION_MS) return;
    const result = scoreTypingRound(config.rounds[attempt.mode], attempt.committed, elapsed);
    active.current = null; composing.current = false; setText(""); setCommitted(""); setRemaining(0);
    if (result.status !== "complete") { reset(zh ? "本轮输入无法核对，已清空。请重新开始。" : "This round could not be checked and was cleared. Start again."); return; }
    setFinished(result); setMessage(""); setPhase("result");
  }, [config.rounds, reset, zh]);
  const current = useCallback(() => {
    const attempt = active.current;
    if (!attempt) return null;
    const elapsed = performance.now() - attempt.started;
    if (document.visibilityState !== "visible" || Math.abs(Date.now() - attempt.wallStarted - elapsed) > 1500) {
      reset(zh ? "页面隐藏或时钟发生偏差，本轮已取消并清空，请重新开始。" : "The page was hidden or the clocks diverged. This round was cancelled and cleared. Start again."); return null;
    }
    if (elapsed >= TYPING_DURATION_MS) { finish(elapsed); return null; }
    return { attempt, elapsed };
  }, [finish, reset, zh]);
  useEffect(() => {
    if (phase !== "running") return;
    let timer: number;
    const tick = () => { const now = current(); if (!now) return; setRemaining(TYPING_DURATION_MS - now.elapsed); timer = window.setTimeout(tick, 100); };
    timer = window.setTimeout(tick, 100);
    const hidden = () => { if (document.visibilityState !== "visible") reset(zh ? "切换到后台后本轮已取消并清空。" : "This round was cancelled and cleared when the page moved to the background."); };
    const leave = () => reset(zh ? "离开页面后本轮已取消并清空。" : "This round was cancelled and cleared when leaving the page.");
    const restore = (event: PageTransitionEvent) => { if (event.persisted) reset(zh ? "从页面缓存恢复后本轮已清空，请重新开始。" : "The cached page was restored. This round was cleared; start again."); };
    document.addEventListener("visibilitychange", hidden); window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", hidden); window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [phase, current, reset, zh]);
  const previousPhase = useRef(phase);
  useEffect(() => {
    if (previousPhase.current === phase) return;
    previousPhase.current = phase;
    if (phase === "running") { heading.current?.scrollIntoView?.({ block: "start" }); input.current?.focus({ preventScroll: true }); }
    else { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView?.({ block: "start" }); }
  }, [phase]);
  useEffect(() => {
    const box = passageBox.current, node = cursor.current;
    if (phase !== "running" || !box || !node) return;
    const top = node.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    if (top < box.scrollTop + 12 || top > box.scrollTop + box.clientHeight - 40) box.scrollTop = Math.max(0, top - 36);
  }, [entered.length, phase]);
  useEffect(() => () => { active.current = null; composing.current = false; }, []);
  const commit = (value: string) => {
    const now = current(); if (!now) return;
    const normalized = normalizeTypingText(value), chars = typingCharacters(normalized);
    if (chars.length > target.length) { setText(now.attempt.committed); setMessage(zh ? "本段已到末尾；可改错并等待60秒结束。" : "You reached the passage limit. You may correct the text and wait for 60 seconds."); return; }
    now.attempt.committed = normalized; setText(normalized); setCommitted(normalized); setMessage("");
  };
  const start = () => {
    if (!ready || active.current || document.visibilityState !== "visible") return;
    active.current = { mode, started: performance.now(), wallStarted: Date.now(), committed: "" };
    composing.current = false; setText(""); setCommitted(""); setRemaining(TYPING_DURATION_MS); setFinished(null); setManual(""); setMessage(""); setPhase("running");
  };
  const share = async () => {
    const value = `${quiz.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/${quiz.slug}`;
    try { await navigator.clipboard.writeText(value); setMessage(zh ? "已复制公开练习链接，不含输入和成绩。" : "Public practice link copied without input or results."); }
    catch { setManual(value); setMessage(zh ? "复制不可用，可手动复制公开链接。" : "Copy is unavailable. Copy the public link manually."); }
  };
  return <section id="take-test" className="my-8 rounded-2xl border border-violet-200 bg-white p-5 [overflow-wrap:anywhere]" aria-labelledby="typing-heading">
    <h2 id="typing-heading" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{phase === "result" ? (zh ? "本轮60秒打字结果" : "Your 60-second typing result") : phase === "running" ? round.title[locale] : (zh ? "选择语言，开始真实60秒练习" : "Choose a language for a real 60-second round")}</h2>
    {phase !== "result" && <>
      {phase === "ready" && <><label className="mt-4 block font-medium" htmlFor="typing-mode">{zh ? "原文语言（切换界面不翻译原文）" : "Passage language (the interface does not translate it)"}</label>
      <select id="typing-mode" className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-3" value={mode} onChange={event => { reset(); setMode(Number(event.target.value)); }}>
        {config.rounds.map((value, index) => <option key={value.id} value={index}>{value.title[locale]}</option>)}
      </select>
      <p className="my-3 text-sm leading-6 text-slate-600">{zh ? "按开始后立即计时，允许退格和改写。仅计60秒内已提交的最终文本；输入法仍在组字的内容不计。原文含空格、数字及标点，均按字符核对。" : "Timing starts immediately when you press start. Backspace and corrections are allowed. Only the final text committed within 60 seconds counts; unfinished IME composition does not. Spaces, numbers and punctuation count."}</p></>}
      <p data-typing-remaining className="font-semibold" aria-live="off">{zh ? `剩余 ${Math.ceil(remaining / 1000)} 秒` : `${Math.ceil(remaining / 1000)} seconds remaining`}</p>
      <progress className="my-2 h-3 w-full" aria-label={zh ? "本轮剩余时间" : "Time remaining in this round"} value={remaining} max={TYPING_DURATION_MS} />
      <p id="typing-source-label" className="mt-2 font-medium">{zh ? "原创原文（按原样输入）" : "Original passage (copy it exactly)"}</p>
      <div ref={passageBox} className={`mt-2 ${phase === "running" ? "max-h-30" : "max-h-40"} overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 leading-8`} lang={round.language} aria-labelledby="typing-source-label" data-typing-passage>
        {target.map((value, index) => <span key={index} ref={index === entered.length ? cursor : undefined} className={index < entered.length ? (value === entered[index] ? "bg-emerald-100" : "bg-red-100 underline decoration-red-700") : index === entered.length && phase === "running" ? "border-l-2 border-violet-700" : undefined}>{value}</span>)}
      </div>
      <label className="mt-4 block font-medium" htmlFor="typing-input">{zh ? "在此输入（禁止粘贴或拖入）" : "Type here (pasting and dropping are blocked)"}</label>
      <textarea ref={input} id="typing-input" className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 text-base leading-7" lang={round.language} value={text} disabled={phase !== "running"} maxLength={20000} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} aria-describedby="typing-input-help"
        onChange={event => { if (!current()) return; if (composing.current || (event.nativeEvent as InputEvent).isComposing) setText(event.target.value); else commit(event.target.value); }}
        onCompositionStart={() => { if (current()) composing.current = true; }} onCompositionEnd={event => { composing.current = false; commit(event.currentTarget.value); }}
        onPaste={event => { event.preventDefault(); setMessage(zh ? "请手动输入原文，本练习不接收粘贴。" : "Type the passage manually. Paste is not accepted in this practice."); }}
        onDrop={event => { event.preventDefault(); setMessage(zh ? "请手动输入，本练习不接收拖放文本。" : "Type manually. Dropped text is not accepted."); }}
        onBeforeInput={event => { const type = (event.nativeEvent as InputEvent).inputType; if (type === "insertFromPaste" || type === "insertFromDrop") event.preventDefault(); }} />
      <p id="typing-input-help" className="mt-2 text-sm leading-6 text-slate-600">{zh ? `已提交 ${entered.length} / ${target.length} 个字符。下划线标出与原文同位置不一致的字符。可在计时内改错；整段录完后等待计时结束。` : `${entered.length} / ${target.length} characters committed. Underlines mark positional mismatches. Correct them within the timed round; if you reach the end, wait for the timer.`}</p>
      <div className="mt-4 flex flex-wrap gap-3">{phase === "ready" ? <button className={`${button} bg-violet-700 text-white`} onClick={start} disabled={!ready}>{zh ? "开始60秒练习" : "Start 60-second round"}</button> : <button className={button} onClick={() => reset(zh ? "已取消并清空，本轮不产生速度结果。" : "Cancelled and cleared. No speed result was produced.")}>{zh ? "取消并清空本轮" : "Cancel and clear this round"}</button>}</div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{zh ? "切换到后台或时钟明显偏差会取消本轮；刷新丢失进度。输入只在本页内存中使用，不保存草稿、不发送到服务器、不加入链接或分析事件。设备和输入法建议可能影响结果，本练习不作监考认证。" : "Moving the page to the background or a clock divergence cancels the round; refresh loses progress. Input stays in page memory: no drafts, server submission, link payload or analytics event. Device and IME suggestions can affect results; this is not a proctored certification."}</p>
    </>}
    {phase === "result" && finished && <div data-typing-result data-observed-elapsed-ms={finished.observedElapsedMs} data-typing-language={finished.language} className="mt-5 space-y-6 leading-8">
      <p>{round.title[locale]} · {zh ? "固定60秒；仅计时限内已提交文本" : "Fixed 60 seconds; only text committed before the deadline"}</p>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div><dt>{zh ? "最终字符 / 分钟（CPM）" : "Final characters per minute (CPM)"}</dt><dd data-typing-cpm className="text-2xl font-semibold">{finished.cpm.toFixed(1)}</dd></div>
        <div><dt>{zh ? "同位置正确字符 / 分钟" : "Position-correct characters per minute"}</dt><dd data-typing-correct-cpm className="text-2xl font-semibold">{finished.correctCpm.toFixed(1)}</dd></div>
        {finished.language === "en" && <>
          <div><dt>{zh ? "英文总 WPM（5字符折1词）" : "Gross English WPM (5-character units)"}</dt><dd data-typing-wpm className="text-2xl font-semibold">{finished.grossWpm!.toFixed(1)}</dd></div>
          <div><dt>{zh ? "英文同位置正确 WPM" : "Position-correct English WPM"}</dt><dd data-typing-correct-wpm className="text-2xl font-semibold">{finished.correctWpm!.toFixed(1)}</dd></div>
        </>}
        <div><dt>{zh ? "最终文本同位置准确率" : "Final-text positional accuracy"}</dt><dd data-typing-accuracy className="text-2xl font-semibold">{finished.accuracy === null ? (zh ? "未输入，准确率不适用" : "No input; accuracy not applicable") : `${finished.accuracy.toFixed(1)}%`}</dd></div>
        <div><dt>{zh ? "最终已输入 / 原文字符" : "Final entered / source characters"}</dt><dd data-typing-count>{finished.typedCharacters} / {finished.targetCharacters}</dd></div>
        <div><dt>{zh ? "同位置匹配 / 不匹配字符" : "Position-matched / mismatched characters"}</dt><dd data-typing-errors>{finished.correctCharacters} / {finished.incorrectCharacters}</dd></div>
      </dl>
      <p>{finished.language === "zh" ? (zh ? "中文仅报字符/分钟，不折算英文WPM。标点、数字和空格均计为字符；不是输入法按键数或语言能力分。" : "Chinese reports characters per minute without an English-WPM conversion. Punctuation, digits and spaces count as characters; this is neither IME keystrokes nor language proficiency.") : (zh ? "WPM按5个最终字符折1词，不是词典单词数。正确WPM只计与原文同位置相符的字符，不采用每1%错误扣2WPM等其他网站罚分。" : "WPM uses five final characters per unit, not dictionary words. Position-correct WPM counts only matching positions; it does not use another site's error penalties.")}</p>
      <p>{zh ? "改掉并删除的旧字符不累计；未输入的原文余量不作错字。插入或漏掉一个字符可能使后续位置错开；这是逐位置比较，不是编辑距离。原始输入在结束时已清空，只保留本页内聚合结果。不分快慢档、不提供常模、雇主通过线或证书。" : "Deleted or corrected characters do not accumulate. The untyped source remainder is not treated as errors. An insertion or omission can shift later positions: this is positional matching, not edit distance. Raw input was cleared at the end; only page-local aggregate results remain. No speed band, norm, employer cutoff or certificate is supplied."}</p>
      <div className="flex flex-wrap gap-3"><button className={button} onClick={() => reset()}>{zh ? "重新选择并练习" : "Choose again and practise"}</button><button className={button} onClick={share}>{zh ? "复制公开练习链接" : "Copy public practice link"}</button></div>
      {manual && <label className="block">{zh ? "手动复制公开链接" : "Public link for manual copying"}<textarea className="mt-2 min-h-24 w-full rounded-lg border p-3" readOnly value={manual} /></label>}
      <h3 className="text-xl font-semibold">{zh ? "两份完整复习指南，均免费" : "Both complete revision guides, free"}</h3>
      {quiz.profiles.map(profile => <section key={profile.id} data-typing-guide={profile.id}><h3 className="text-xl font-semibold">{profile.title[locale]}</h3><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`typing-guide-${profile.id}`} /></section>)}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试与练习" : "Back to all tests and practice"}</Link>
    </div>}
    <p role="status" className="mt-4 leading-7">{message}</p>
  </section>;
}
