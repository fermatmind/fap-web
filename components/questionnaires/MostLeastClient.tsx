"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isMostLeastConfigurationValid, scoreMostLeast, type MostLeastAnswers } from "@/lib/questionnaires/mostLeast";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { trackEvent } from "@/lib/analytics";
import { appendSeoCtaContextParamsToHref, buildSeoCtaContextParams, buildSeoCtaTrackingPayload } from "@/lib/tracking/seoCtaAttribution";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function MostLeastClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (!isMostLeastConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "练习暂不可用。" : "Practice is unavailable."}</p>;
  return <ValidMostLeastClient key={`${quiz.slug}:${quiz.version}:${locale}`} quiz={quiz} locale={locale} />;
}

function ValidMostLeastClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const metrics = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [phase, setPhase] = useState<"ready" | "answering" | "result">("ready");
  const [answers, setAnswers] = useState<MostLeastAnswers>({}), [position, setPosition] = useState(0);
  const [message, setMessage] = useState(""), [manualCopy, setManualCopy] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), submitted = useRef(false), previous = useRef("ready:0");
  const result = scoreMostLeast(quiz, answers), q = quiz.questions[position], pair = answers[q.id] ?? {};
  useEntertainmentResultView(metrics.view, phase === "result" && result.status === "complete");
  const reset = () => { submitted.current = false; setAnswers({}); setPosition(0); setMessage(""); setManualCopy(""); setPhase("ready"); };
  useEffect(() => {
    const leave = () => { submitted.current = false; setAnswers({}); setPosition(0); setMessage(""); setManualCopy(""); setPhase("ready"); };
    window.addEventListener("pagehide", leave);
    const restore = (e: PageTransitionEvent) => { if (e.persisted) leave(); };
    window.addEventListener("pageshow", restore);
    return () => { window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, []);
  useEffect(() => {
    const key = `${phase}:${position}`;
    if (previous.current === key) return;
    previous.current = key; heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView?.({ block: "start" });
  }, [phase, position]);
  const start = () => { if (!ready) return; submitted.current = false; setAnswers({}); setPosition(0); setMessage(""); setManualCopy(""); setPhase("answering"); metrics.start(); };
  const choose = (side: "most" | "least", id: string) => {
    if (phase !== "answering" || submitted.current || pair[side === "most" ? "least" : "most"] === id) return;
    setAnswers(a => ({ ...a, [q.id]: { ...a[q.id], [side]: id } })); setMessage("");
  };
  const next = () => {
    if (phase !== "answering" || submitted.current) return;
    if (!pair.most || !pair.least || pair.most === pair.least) { setMessage(zh ? "请选择一条最符合和另一条最不符合，再继续。" : "Choose one Most and one different Least statement before continuing."); return; }
    if (position < quiz.questions.length - 1) { setMessage(""); setPosition(position + 1); return; }
    if (result.status !== "complete") { setMessage(zh ? "记录尚未完整，请返回核对各组选择。" : "The record is incomplete. Go back and check each block."); return; }
    submitted.current = true; setMessage(""); setPhase("result"); metrics.complete();
  };
  const share = async () => {
    const value = `${quiz.title[locale]}\nhttps://fermatmind.com${questionnairePath(locale, quiz.slug)}`;
    try { await navigator.clipboard.writeText(value); metrics.share(); setMessage(zh ? "已复制公开练习链接，不含答案或次数。" : "Public practice link copied without answers or counts."); }
    catch { setManualCopy(value); setMessage(zh ? "复制不可用，请手动复制公开链接。" : "Copy is unavailable. Copy the public link manually."); }
  };
  const recommendation = { locale, sourceRouteFamily: "test_detail" as const, sourceSlug: quiz.slug, sourcePath: questionnairePath(locale, quiz.slug), href: `/${locale}/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}`, ctaId: "questionnaire_result_big5", targetAction: "questionnaire_result_big5", targetTestSlug: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN, scaleCode: "BIG5_OCEAN" };
  const big5Href = appendSeoCtaContextParamsToHref(recommendation.href, buildSeoCtaContextParams(recommendation));

  return <section id="take-test" className="my-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 sm:p-8" aria-labelledby="most-least-heading">
    <h2 id="most-least-heading" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold focus:outline-none">{phase === "result" ? quiz.resultHeading![locale] : phase === "answering" ? (zh ? `第${position + 1}组，共16组` : `Block ${position + 1} of 16`) : (zh ? "开始原创最符合／最不符合练习" : "Start the original Most/Least practice")}</h2>
    <p className="my-4 text-sm leading-7 text-slate-600">{zh ? "进度只在当前页面内存中。刷新、换语言、离开或清空即移除；没有保存草稿。" : "Progress stays only in this page’s memory. Refreshing, changing language, leaving or clearing removes it. No draft is saved."}</p>
    {metrics.consent}
    {phase === "ready" && <><p className="my-4 leading-8">{quiz.instructions![locale]}</p><button type="button" className={button} disabled={!ready} onClick={start}>{zh ? "开始练习" : "Start practice"}</button></>}
    {phase === "answering" && <>
      <p className="my-3 text-sm">{zh ? `已完成${result.answered} / 16组` : `${result.answered} / 16 blocks completed`}</p>
      <fieldset className="my-5 space-y-4"><legend className="mb-4 leading-8">{q.prompt[locale]}</legend>
        {q.options.map(o => <div key={o.id} className="rounded-lg border border-slate-200 p-4"><p className="mb-3 leading-7">{o.label[locale]}</p><div className="flex flex-wrap gap-x-6 gap-y-2">
          {(["most", "least"] as const).map(side => <label key={side} className="flex min-h-11 cursor-pointer items-center gap-2 py-2"><input className="h-5 w-5 accent-violet-700" type="radio" name={`${q.id}-${side}`} value={o.id} checked={pair[side] === o.id} disabled={pair[side === "most" ? "least" : "most"] === o.id} onChange={() => choose(side, o.id)} /><span>{side === "most" ? (zh ? "最符合" : "Most") : (zh ? "最不符合" : "Least")}<span className="sr-only">: {o.label[locale]}</span></span></label>)}
        </div></div>)}
      </fieldset>
      <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一组" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 15 ? (zh ? "查看完整记录" : "See complete record") : (zh ? "下一组" : "Next")}</button><button type="button" className={button} onClick={() => { setAnswers(a => ({ ...a, [q.id]: {} })); setMessage(""); }}>{zh ? "清空本组" : "Clear this block"}</button><button type="button" className={button} onClick={reset}>{zh ? "清空并退出" : "Clear and exit"}</button></div>
    </>}
    {phase === "result" && result.status === "complete" && <>
      <p className="my-5 leading-8">{zh ? "以下是八主题在固定菜单中的原始选择次数。差值＝最符合－最不符合，不排序、不分类，也不换算为Caliper分数。八主题的差值合计恒为零。" : "These are raw selections within fixed menus across all eight topics. Difference = Most − Least. Topics are not ranked or assigned as types, and counts are not converted into Caliper scores. All eight differences sum to zero."}</p>
      <div className="my-5 flex flex-wrap gap-3"><button type="button" className={button} onClick={start}>{zh ? "重新练习" : "Retake practice"}</button><button type="button" className={button} onClick={share}>{zh ? "复制公开练习链接" : "Copy public practice link"}</button><button type="button" className={button} onClick={reset}>{zh ? "清空并退出" : "Clear and exit"}</button></div>
      {quiz.profiles.map(p => { const c = result.counts[p.id]; return <section key={p.id} data-most-least-topic={p.id} className="my-6 rounded-lg border border-slate-200 p-4">
        <h3 className="scroll-mt-24 text-xl font-semibold">{p.title[locale]}</h3><dl className="my-4 grid grid-cols-3 gap-2 text-center text-sm">{(["most", "least", "difference"] as const).map(k => <div key={k}><dt>{k === "most" ? (zh ? "最符合" : "Most") : k === "least" ? (zh ? "最不符合" : "Least") : (zh ? "差值" : "Difference")}</dt><dd data-count={k} className="mt-2 text-lg font-semibold">{c[k]}{k === "difference" ? "" : " / 8"}</dd></div>)}</dl>
        <p className="leading-8">{p.summary[locale]}</p><details className="mt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "展开完整读法" : "Read the full guide"}</summary><QuestionnaireReport profile={p} locale={locale} headingLevel={4} idPrefix={`most-least-${p.id}`} /></details>
        <Link prefetch={false} className="mt-3 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{zh ? "打开不含个人次数的公开指南" : "Open the public guide without personal counts"}</Link>
      </section>; })}
      <aside className="my-6 border-t pt-5"><h3 className="text-xl font-semibold">{zh ? "按需继续，或在这里结束" : "Continue if useful, or finish here"}</h3><p className="my-3 leading-8">{zh ? "大五是另一个独立测评，需另外作答；它的维度不由本页次数推算，也不是查看完整读法的条件。" : "Big Five is a separate assessment with its own questions. Its dimensions are not inferred from these counts, and taking it is not required to read any full guide."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={big5Href} onClick={() => trackEvent("click_test", buildSeoCtaTrackingPayload(recommendation))}>{zh ? "可选：了解大五测试与题本" : "Optional: explore Big Five and its versions"}</Link></aside>
    </>}
    {message && <p role="status" className="my-4 leading-7">{message}</p>}
    {manualCopy && <label className="my-4 block">{zh ? "公开练习链接" : "Public practice link"}<textarea className="mt-2 w-full rounded border p-3" readOnly value={manualCopy} rows={3} onFocus={e => e.target.select()} /></label>}
  </section>;
}
