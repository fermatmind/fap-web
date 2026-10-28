"use client";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { isTenKeyConfigurationValid, scoreTenKeyRound, TEN_KEY_DURATION_MS, type TenKeyEntry } from "@/lib/questionnaires/tenKey";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};
type DigitEvents = { numpad: number; row: number; other: number };
type Active = { mode: number; started: number; wallStarted: number; entries: TenKeyEntry[]; text: string; events: DigitEvents };
type Finished = { mode: number; entries: TenKeyEntry[]; observedElapsedMs: number; tail: string; events: DigitEvents };

export function TenKeyClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (!isTenKeyConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "数字录入配置暂不可用。" : "Number-entry configuration is unavailable."}</p>;
  return <ValidTenKeyClient quiz={quiz} locale={locale} />;
}

function ValidTenKeyClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const { start: recordStart, complete: recordComplete, view: recordView, consent: activityConsent } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const zh = locale === "zh", rounds = quiz.tenKey!.rounds;
  const [mode, setMode] = useState(0), [phase, setPhase] = useState<"ready" | "running" | "result">("ready");
  const [text, setText] = useState(""), [position, setPosition] = useState(0), [remaining, setRemaining] = useState(TEN_KEY_DURATION_MS);
  const [message, setMessage] = useState(""), [finished, setFinished] = useState<Finished | null>(null);
  const active = useRef<Active | null>(null), composing = useRef(false), input = useRef<HTMLInputElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const round = rounds[mode];
  const result = finished ? scoreTenKeyRound(rounds[finished.mode], finished.entries, finished.observedElapsedMs) : null;
  const cancel = useCallback((reason: string) => {
    active.current = null; composing.current = false; setText(""); setPosition(0); setFinished(null); setRemaining(TEN_KEY_DURATION_MS); setMessage(reason); setPhase("ready");
  }, []);
  const finish = useCallback((elapsed: number) => {
    const attempt = active.current;
    if (!attempt || elapsed < TEN_KEY_DURATION_MS) return;
    active.current = null;
    setFinished({ mode: attempt.mode, entries: attempt.entries, observedElapsedMs: elapsed, tail: attempt.text, events: attempt.events });
    composing.current = false; setRemaining(0); setText(""); setMessage(""); setPhase("result"); recordComplete();
  }, [recordComplete]);
  const current = useCallback(() => {
    const attempt = active.current;
    if (!attempt) return null;
    const elapsed = performance.now() - attempt.started;
    if (document.visibilityState !== "visible" || Math.abs(Date.now() - attempt.wallStarted - elapsed) > 1500) {
      cancel(zh ? "页面隐藏或时钟出现偏差，本轮已取消并清空。准备好后可重新开始。" : "The page was hidden or the clocks diverged. This round was cancelled and cleared. Start again when ready.");
      return null;
    }
    if (elapsed >= TEN_KEY_DURATION_MS) { finish(elapsed); return null; }
    return { attempt, elapsed };
  }, [cancel, finish, zh]);
  useEffect(() => {
    if (phase !== "running") return;
    let timer: number;
    const tick = () => {
      const now = current();
      if (now) {
        const left = TEN_KEY_DURATION_MS - now.elapsed;
        setRemaining(left);
        timer = window.setTimeout(tick, Math.max(1, Math.min(100, left)));
      }
    };
    tick();
    const visibility = () => { if (document.visibilityState !== "visible") current(); };
    document.addEventListener("visibilitychange", visibility);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", visibility); };
  }, [phase, current]);
  useEffect(() => { if (phase === "running") input.current?.focus(); else heading.current?.focus(); }, [phase]);
  useEffect(() => () => { active.current = null; }, []);

  function start() {
    if (document.visibilityState !== "visible") { setMessage(zh ? "请在可见页面开始计时练习。" : "Start the timed practice in a visible page."); return; }
    setFinished(null); setMessage(""); setText(""); setPosition(0); setRemaining(TEN_KEY_DURATION_MS); composing.current = false;
    active.current = { mode, started: performance.now(), wallStarted: Date.now(), entries: [], text: "", events: { numpad: 0, row: 0, other: 0 } };
    setPhase("running"); recordStart();
  }
  function confirm() {
    const now = current();
    if (!now || composing.current || now.attempt.entries.length >= rounds[now.attempt.mode].values.length) return;
    now.attempt.entries.push({ text: now.attempt.text, atMs: now.elapsed });
    now.attempt.text = ""; setText(""); setPosition(now.attempt.entries.length); input.current?.focus();
  }
  const percent = (value: number | null) => value === null ? (zh ? "资料不足" : "Unavailable") : `${value.toFixed(1)}%`;
  useEntertainmentResultView(recordView, phase === "result");
  return <section id="take-test" className="my-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-8" aria-labelledby="ten-key-heading">
    {activityConsent}
    <h2 id="ten-key-heading" ref={heading} tabIndex={-1} className="text-2xl font-semibold focus-visible:outline-2 focus-visible:outline-violet-700">{phase === "result" ? quiz.resultHeading![locale] : (zh ? "真实数字录入练习" : "Real number-entry practice")}</h2>
    {message && <p role="status" className="my-4 leading-7 text-slate-700">{message}</p>}
    {phase === "ready" && <>
      <p className="my-5 leading-8">{quiz.instructions![locale]}</p>
      <fieldset disabled={!ready} className="my-5 space-y-3"><legend className="mb-3 font-semibold">{zh ? "选择本轮模式（每轮60秒）" : "Choose this round’s mode (60 seconds each)"}</legend>{rounds.map((item, index) => <label key={item.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3"><input type="radio" name="ten-key-mode" value={item.id} checked={index === mode} onChange={() => setMode(index)} />{item.title[locale]}</label>)}</fieldset>
      <p className="my-4 leading-7 text-slate-600">{zh ? "输入仅留在当前页内存。没有计时草稿恢复；切换标签页、刷新或换语言后需要重开。可使用数字行或触屏练习，浏览器键码不能认证实体小键盘。" : "Entries stay in this page’s memory. Timed drafts do not resume: changing tabs, reloading or changing language requires a fresh round. Number-row and touch input are welcome for practice; browser codes cannot certify a physical keypad."}</p>
      <button type="button" disabled={!ready} className={button} onClick={start}>{zh ? "开始60秒练习" : "Start 60-second practice"}</button>
    </>}
    {phase === "running" && <>
      <p role="timer" aria-live="off" data-ten-key-timer className="my-5 text-xl font-semibold">{zh ? "剩余" : "Remaining"}: {Math.ceil(remaining / 1000)} {zh ? "秒" : "seconds"}</p>
      <p className="my-3">{round.title[locale]} · {zh ? `已确认${position}条` : `${position} entries confirmed`}</p>
      {position < round.values.length ? <>
        <p id="ten-key-source-label" className="font-semibold">{zh ? "当前源文本" : "Current source"}</p><p data-ten-key-source className="my-3 break-all rounded-lg bg-slate-50 p-4 font-mono text-3xl tracking-wider">{round.values[position]}</p>
        <label htmlFor="ten-key-entry" className="block font-semibold">{zh ? "输入当前源文本" : "Enter the current source"}</label>
        <input id="ten-key-entry" ref={input} type="text" inputMode={round.id === "decimals" ? "decimal" : "numeric"} autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={24} value={text} aria-describedby="ten-key-input-help ten-key-source-label" className="my-3 min-h-12 w-full rounded-lg border border-slate-400 p-3 font-mono text-xl focus-visible:outline-2 focus-visible:outline-violet-700"
          onChange={event => { const now = current(); if (!now) return; const value = event.target.value; if (/^[0-9.]{0,24}$/.test(value)) { now.attempt.text = value; setText(value); } else setMessage(zh ? "请输入0–9和英文小数点；其他字符未录入。" : "Use 0–9 and a period; other characters were not entered."); }}
          onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
          onPaste={event => { event.preventDefault(); setMessage(zh ? "本轮不接受粘贴，请直接输入。" : "Pasting is blocked in this round. Enter the text directly."); }}
          onDrop={event => { event.preventDefault(); setMessage(zh ? "本轮不接受拖入文本。" : "Dropping text is blocked in this round."); }}
          onKeyDown={event => { const now = current(); if (!now) { event.preventDefault(); return; } if (/^[0-9]$/.test(event.key)) { const key = /^Numpad[0-9]$/.test(event.code) ? "numpad" : /^Digit[0-9]$/.test(event.code) ? "row" : "other"; now.attempt.events[key]++; } if (event.key === "Enter") { event.preventDefault(); if (!event.nativeEvent.isComposing && !composing.current) confirm(); } }} />
        <p id="ten-key-input-help" className="mb-4 leading-7 text-slate-600">{zh ? "确认前可退格改错，Enter或按钮确认后不可改写。空白确认算错误条目。未确认尾串不计。先结束输入法组合。" : "Edit with Backspace before confirming. Enter or the button confirms an immutable row; a blank confirmation is incorrect. Unconfirmed text is excluded. Finish input-method composition first."}</p>
        <button type="button" className={button} onClick={confirm}>{zh ? "确认本条" : "Confirm entry"}</button>
      </> : <p className="my-5 leading-8">{zh ? "本列表240条已用完。计时继续到60秒，随后呈现完整结果。" : "All 240 source rows are used. The round continues to its 60-second deadline, then shows the full result."}</p>}
      <button type="button" className={`${button} ml-0 mt-4 block`} onClick={() => cancel(zh ? "本轮已取消，输入已清空。" : "Round cancelled and entries cleared.")}>{zh ? "取消并清空本轮" : "Cancel and clear this round"}</button>
    </>}
    {phase === "result" && result?.status === "complete" && finished && <div data-ten-key-result className="mt-5 space-y-6 leading-8">
      <p>{rounds[finished.mode].title[locale]} · {zh ? "计分窗口：60秒；截止后事件不计入。" : "Scoring window: 60 seconds. Events at or after the deadline are excluded."}</p>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{[
        [zh ? "确认等价KPH" : "Confirmed-equivalent KPH", result.confirmedKph.toFixed(1)],
        [zh ? "完全正确条目KPH" : "Exact-entry KPH", result.exactEntryKph.toFixed(1)],
        [zh ? "已确认条目" : "Confirmed entries", String(result.confirmedEntries)],
        [zh ? "整条正确" : "Entirely correct entries", `${result.correctEntries} / ${result.confirmedEntries}`],
        [zh ? "条目准确率" : "Entry accuracy", percent(result.entryAccuracy)],
        [zh ? "条目错误率" : "Entry error rate", percent(result.entryErrorRate)],
        [zh ? "逐位字符准确率" : "Positional character accuracy", percent(result.characterAccuracy)],
        [zh ? "相同字符位置 / 比较位置" : "Matching / compared character positions", `${result.correctCharacters} / ${result.comparedCharacters}`],
      ].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-4"><dt>{label}</dt><dd className="text-xl font-semibold">{value}</dd></div>)}</dl>
      <p data-ten-key-formula>{zh ? `确认字符${result.confirmedCharacters}＋分隔符${result.separators}，除以60秒，再乘3600。删除的字符、退格与未确认尾串不计产出。` : `${result.confirmedCharacters} confirmed characters + ${result.separators} separators, divided by 60 seconds, multiplied by 3,600. Deleted characters, Backspace and unconfirmed text are not throughput.`}</p>
      <p>{zh ? `观察到的数字keydown事件（含之后被删的数字）：Numpad ${finished.events.numpad}，数字行 ${finished.events.row}，其他/未知 ${finished.events.other}。触屏可能没有键码；这些数字不能认证设备。` : `Observed digit keydown events, including later edits: Numpad ${finished.events.numpad}, number row ${finished.events.row}, other/unknown ${finished.events.other}. Touch input may supply no codes; these counts cannot certify a device.`}</p>
      <p>{zh ? "截止时未确认尾串（排除计分）：" : "Unconfirmed text at the deadline (excluded): "}<span className="break-all font-mono">{finished.tail || (zh ? "无" : "None")}</span></p>
      <section aria-labelledby="ten-key-review"><h3 id="ten-key-review" className="text-xl font-semibold">{zh ? "每条输入的完整核对" : "Complete copied-row review"}</h3>{result.rows.length ? <ol className="mt-4 space-y-4">{result.rows.map((row, index) => <li key={index} data-ten-key-review-row className="rounded-lg border p-4"><p>{index + 1}. {row.correct ? (zh ? "整条正确" : "Exact entry") : (zh ? "不完全匹配" : "Not an exact entry")}</p><p>{zh ? "源文本：" : "Source: "}<span className="break-all font-mono">{row.expected}</span></p><p>{zh ? "输入：" : "Entered: "}<span className="break-all font-mono">{row.entered || (zh ? "空白" : "Blank")}</span></p><p>{zh ? "相同字符位置：" : "Matching character positions: "}{row.matchingCharacters} / {row.comparedCharacters}</p></li>)}</ol> : <p>{zh ? "没有确认条目。KPH为0，准确率与错误率资料不足；这不判定你的能力。" : "No entries were confirmed. KPH is zero and accuracy/error rate are unavailable; this does not establish your ability."}</p>}</section>
      {quiz.profiles.map(profile => <section key={profile.id} data-ten-key-full-guide={profile.id} className="border-t pt-6"><h3 className="mb-4 text-xl font-semibold">{profile.title[locale]}</h3><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`ten-key-${profile.id}`} /></section>)}
      <button type="button" className={button} onClick={() => cancel(zh ? "结果与输入已清空，可选择新模式。" : "Result and entries cleared. Choose a new mode.")}>{zh ? "清空并重新练习" : "Clear and practise again"}</button>
      <section className="border-t pt-6"><h3 className="text-xl font-semibold">{zh ? "下一步由你选择" : "Choose what comes next"}</h3><p className="my-3">{zh ? "可以复核本轮、另选练习或在这里结束。若想另探工作兴趣，RIASEC需要独立完整作答；速度不换算为兴趣或人格。" : "Review this round, choose more practice or stop here. RIASEC explores work interests through its own separate full attempt; speed is never converted into interests or personality."}</p><Link prefetch={false} className="block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link><Link prefetch={false} className="block min-h-11 py-2 underline" href={`/${locale}/tests/holland-career-interest-test-riasec`}>{zh ? "可选：另做RIASEC职业兴趣测试" : "Optional: take a separate RIASEC career-interest test"}</Link><Link prefetch={false} className="block min-h-11 py-2 underline" href={`/${locale}/tests/explore/ten-key-test`}>{zh ? "公开练习入口链接（不含成绩）" : "Public practice link (no scores)"}</Link></section>
    </div>}
    {phase === "result" && result?.status !== "complete" && <p role="status">{zh ? "本轮资料不可用，请清空后重新开始。" : "Round data is unavailable. Clear and start again."}<button type="button" className={`${button} mt-4 block`} onClick={() => cancel("")}>{zh ? "清空并重开" : "Clear and restart"}</button></p>}
  </section>;
}
