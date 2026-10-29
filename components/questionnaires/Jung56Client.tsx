"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import bank from "@/lib/questionnaires/jung56Bank.json";
import content from "@/lib/questionnaires/jung56Content.json";
import { isJung56ConfigurationValid, isJung56ContentValid, scoreJung56, type Jung56Bank, type Jung56Content, type Jung56Result } from "@/lib/questionnaires/jung56";
import type { Locale } from "@/lib/i18n/locales";
import { recordEntertainmentActivity, type ActivityAction } from "@/lib/entertainment/activity";
import { useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { Jung56GuideContent } from "./Jung56GuideContent";
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};
export default function Jung56Client({ locale }: { locale: Locale }) {
  if (!isJung56ConfigurationValid(bank) || !isJung56ContentValid(content)) return <p role="status">{locale === "zh" ? "此版本暂不可用，请稍后重试。" : "This edition is unavailable. Please try later."}</p>;
  return <ValidJung56Client key={locale} bank={bank} content={content} locale={locale} />;
}
function ValidJung56Client({ bank, content, locale }: { bank: Jung56Bank; content: Jung56Content; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome"), [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}), [result, setResult] = useState<Jung56Result | null>(null);
  const [message, setMessage] = useState(""), [manual, setManual] = useState(""), [permission, setPermission] = useState(false);
  const answersRef = useRef<Record<string, string>>({}), submitted = useRef(false), permissionRef = useRef(false), revision = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null), question = bank.questions[position];
  const clear = useCallback(() => {
    revision.current++; answersRef.current = {}; submitted.current = false;
    setAnswers({}); setResult(null); setPosition(0); setStage("welcome"); setMessage(""); setManual("");
  }, []);
  const send = useCallback((action: ActivityAction) => {
    if (!permissionRef.current) return;
    recordEntertainmentActivity("cognitive-functions-test", bank.edition, locale, action, "single", action === "share" ? "copy" : undefined, true);
  }, [bank.edition, locale]);
  useEntertainmentResultView(() => send("result_view"), stage === "result");
  useEffect(() => {
    const revisionClock = revision, permissionState = permissionRef;
    const leave = () => { permissionState.current = false; setPermission(false); clear(); };
    const restore = (e: PageTransitionEvent) => { if (e.persisted) leave(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revisionClock.current++; permissionState.current = false; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); } }, [position, stage]);
  function choose(value: string) {
    if (stage !== "answer" || submitted.current || !["A", "B"].includes(value)) return;
    revision.current++; answersRef.current = { ...answersRef.current, [question.id]: value }; setAnswers(answersRef.current); setMessage("");
  }
  function next() {
    if (submitted.current) return;
    if (!answersRef.current[question.id]) { setMessage(zh ? "请选择A或B，再继续；也可以退出并清除。" : "Choose A or B before continuing, or exit and clear this attempt."); return; }
    if (position < 55) { setPosition(position + 1); setMessage(""); return; }
    const checked = scoreJung56(bank, { edition: bank.edition, answers: answersRef.current });
    if (checked.status !== "complete") { setMessage(zh ? "本次资料不足或版本不可用，暂不生成结果。可以返回检查，或清除后重来。" : "This attempt is incomplete or unavailable. No result was generated. Go back to check it, or clear it and restart."); return; }
    submitted.current = true; setResult(checked.result); setStage("result"); setMessage(""); send("complete");
  }
  async function copyPublicEntry() {
    const copiedRevision = revision.current, text = `${zh ? "认知功能测试 · 56题二选一版" : "Cognitive Functions Test · 56-choice edition"}\nhttps://fermatmind.com/${locale}/tests/explore/cognitive-functions-test`;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; send("share"); setManual(""); setMessage(zh ? "已复制公开入口，不含回答、次数或方向。" : "Copied the public entry without responses, counts or directions."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? "无法自动复制，请从下方手动复制公开入口。" : "Automatic copying is unavailable. Copy the public entry below manually."); }
  }
  return <section id="take-test" data-jung56-client className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7" aria-busy={!ready}>
    <label className="mb-5 block rounded-lg border p-3 text-sm leading-7"><input type="checkbox" disabled={!ready} checked={permission} onChange={e => { permissionRef.current = e.target.checked; setPermission(e.target.checked); }} className="mr-2" />{zh ? "可选：允许本次56题版匿名动作统计（默认关闭）" : "Optional: allow anonymous actions for this 56-choice edition (off by default)"}<span className="block text-slate-600">{zh ? "同时遵循全站分析选择；仅统计开始、完成、结果查看和分享，不发送回答、次数、方向或身份，不回补开启前的动作；离开或切换方法即失效。常规网页分析仍遵循全站选择。" : "Also respects your site analytics choice. Counts only starts, completions, result views and shares, without responses, counts, directions or identity. Earlier actions are not backfilled; permission ends on leaving or switching methods. Ordinary page analytics still follows your site choice."}</span></label>
    <p className="mb-5 text-sm leading-7">{content.common.web_privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{zh ? "56题荣格方向二选一" : "56 Jungian direction choices"}</legend>
      {stage === "welcome" && <><h2 className="text-2xl font-semibold">{zh ? "56题二选一 · 公开试用版" : "56 choices · Public-preview edition"}</h2><p className="leading-8">{bank.questions[0].instruction[locale]}</p><p className="leading-8">{content.common.forced_choice_method[locale]}</p><p className="leading-8">{zh ? "约15分钟为估计，不限时。全部56题均需选择A或B；不想选择时可以退出，不生成未完成排序。" : "About 15 minutes is an estimate, without a time limit. All 56 questions require A or B. You can exit instead of choosing; incomplete attempts produce no ranking."}</p><p className="leading-8">{content.common.evidence_status[locale]}</p><button type="button" className={button} onClick={() => { setStage("answer"); send("start"); }}>{zh ? "开始56题二选一" : "Start the 56 choices"}</button></>}
      {stage === "answer" && <>
        <p data-jung56-progress className="text-sm">{zh ? `第 ${position + 1} / 56 题` : `Question ${position + 1} / 56`}</p>
        <h2 ref={heading} tabIndex={-1} id="jung56-question" className="scroll-mt-24 text-xl font-semibold">{question.instruction[locale]}</h2>
        <div role="radiogroup" aria-labelledby="jung56-question" className="space-y-3">{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-3"><input type="radio" name={question.id} value={o.id} checked={answers[question.id] === o.id} onChange={() => choose(o.id)} className="mt-1 size-5 shrink-0 accent-violet-700" /><span className="leading-8">{o.id} — {o.label[locale]}</span></label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 55 ? (zh ? "完成并查看八方向" : "Finish and view all eight directions") : (zh ? "下一题" : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{zh ? "本次56题选择记录" : "Your 56-choice record"}</h2>
        <p className="leading-8">{content.common.how_to_read[locale]}</p><p className="leading-8">{content.common.relative_score_explanation[locale]}</p>
        <p data-jung56-tie className="rounded-lg bg-violet-50 p-4 leading-8">{result.topDirectionIds.length === 8 ? (zh ? "八个方向均为7次，全部并列；没有单独最高方向。" : "All eight directions have seven selections and are tied; there is no single highest direction.") : `${zh ? "本次最高选择次数：" : "Highest selection count in this attempt: "}${result.groups[0].wins} / 14 · ${result.topDirectionIds.map(id => content.cards.find(c => c.id === id)!.display_name[locale]).join(zh ? "、" : ", ")}`}</p>
        <p className="leading-8">{content.common.tie_explanation[locale]}</p>
        <dl data-jung56-counts className="space-y-3">{result.rows.map(row => <div key={row.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3"><dt className="font-semibold">{content.cards.find(c => c.id === row.id)!.display_name[locale]} · {row.id[0].toUpperCase() + row.id[1]}</dt><dd data-jung56-count={row.id}>{row.wins} / 14</dd></div>)}</dl>
        <p className="leading-8">{zh ? "八方向共计56次选择；每方向出现14次。次数彼此相关，不是强度、能力、人群百分位、功能栈或MBTI类型；低次数不代表缺失。" : "The eight counts sum to 56 selections; each direction appeared 14 times. Counts depend on one another. They are not strength, ability, population percentiles, a function stack or an MBTI type. Lower counts do not mean absence."}</p>
        {content.cards.map(card => <section key={card.id} className="rounded-lg border p-4 sm:p-6"><h3 className="text-xl font-semibold">{card.display_name[locale]} · {card.id[0].toUpperCase() + card.id[1]}</h3><p className="my-3 leading-8">{card.construct_definition[locale]}</p><details className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "展开本方向完整解释" : "Expand this direction’s full explanation"}</summary><Jung56GuideContent card={card} locale={locale} idPrefix="jung56-result" /></details><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/cognitive-functions-test/results/${card.id}#paired56`}>{zh ? "阅读不含个人次数的公开指南" : "Read the public guide without personal counts"}</Link></section>)}
        <p className="leading-8">{content.common.not_a_fixed_identity[locale]}</p><p className="leading-8">{content.common.retest_guidance[locale]}</p>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={copyPublicEntry}>{zh ? "复制公开入口" : "Copy public entry"}</button><button type="button" className={button} onClick={clear}>{zh ? "清空并重新作答56题" : "Clear and retake the 56 choices"}</button></div>
        {manual && <label className="block leading-7">{zh ? "手动复制公开入口" : "Public entry for manual copying"}<textarea className="mt-2 min-h-32 w-full rounded-lg border p-3" readOnly value={manual} /></label>}
        <p className="leading-8">{zh ? "可以在这里结束，也可另做独立MBTI四偏好测评。它有自己的题目与版本，不能从以上次数换算；完整结果已经免费呈现。" : "You can finish here or choose a separate MBTI four-preference assessment. It has its own questions and editions; these counts cannot be converted into its result. Your full result here is already free."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/mbti-personality-test-16-personality-types`}>{zh ? "查看独立MBTI测评入口" : "View the separate MBTI assessment entry"}</Link>
      </>}
      {stage !== "welcome" && <button type="button" className={button} onClick={clear}>{zh ? "退出并清除56题回答" : "Exit and clear the 56-choice responses"}</button>}
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{message}</p>
  </section>;
}
