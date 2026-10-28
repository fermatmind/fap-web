"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { CATQ25_GUIDES, isCatQ25ConfigurationValid, scoreCatQ25, type CatQ25Questionnaire, type CatQ25Result } from "@/lib/questionnaires/catq25";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function CatQ25Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isCatQ25ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "问卷内容暂不可用。" : "The questionnaire content is unavailable."}</p>;
  return <ValidCatQ25Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidCatQ25Client({ quiz, locale }: { quiz: CatQ25Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const { start: recordStart, complete: recordComplete, view: recordView, share: recordShare, consent: activityConsent } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<CatQ25Result | null>(null);
  const [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), revision = useRef(0), submitted = useRef(false);
  const clear = useCallback(() => {
    revision.current++; submitted.current = false;
    setAnswers({}); setStage("welcome"); setPosition(0); setResult(null); setMessage(""); setManual("");
  }, []);
  useEffect(() => {
    const revisionClock = revision;
    const leave = () => clear(), restore = (e: PageTransitionEvent) => { if (e.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revisionClock.current++; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); } }, [position, stage]);
  useEntertainmentResultView(recordView, stage === "result");
  function next() {
    if (submitted.current) return;
    const checked = scoreCatQ25(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? "当前回答无法读取，请清除后重新开始。" : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请选择一个数字，或明确选择跳过此项。" : "Choose a number, or explicitly skip this statement."); return; }
    setMessage("");
    if (position < 24) setPosition(position + 1);
    else if (checked.status === "complete") { submitted.current = true; revision.current++; setResult(checked.result); setStage("result"); recordComplete(); }
    else setMessage(zh ? "仍有未选择的题项；空白与跳过不同，请返回检查。" : "Some statements have no choice. Blank and skipped are different; go back to check.");
  }
  async function copyPublicLinks() {
    const text = quiz.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, p.id)}`).join("\n\n");
    const copiedRevision = revision.current;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; recordShare(); setManual(""); setMessage(zh ? "已复制公开解释链接，不含答案或个人分数。" : "Copied public explanation links, without answers or personal scores."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制公开链接。" : "Automatic copying is unavailable. Copy the public links below manually."); }
  }
  const question = quiz.questions[position];
  return <section id="take-test" data-catq25-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {activityConsent}
    <p className="mb-4 text-sm leading-7 text-slate-600">{quiz.catq25.privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{quiz.catq25.subtitle[locale]}</h2>
        <p className="leading-8">{quiz.instructions?.[locale]}</p>
        <p className="leading-8">{quiz.catq25.editionNotice[locale]}</p>
        <p className="leading-8">{zh ? "面向18岁及以上成年人的自我反思。每项可明确跳过；不设过去一周或一个月的时间窗，也没有目标分数。" : "For self-reflection by adults aged 18 and over. Each statement can be explicitly skipped. There is no past-week or past-month window and no target score."}</p>
        <button type="button" className={button} onClick={() => { revision.current++; setStage("answer"); setPosition(0); setMessage(""); recordStart(); }}>{zh ? "开始测试" : "Start test"}</button>
      </>}
      {stage === "answer" && <>
        <p data-catq25-progress className="text-sm text-slate-600">{zh ? `第 ${position + 1} / 25 条` : `Statement ${position + 1} of 25`}</p>
        <h2 id="catq25-question" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{question.prompt[locale]}</h2>
        <div role="radiogroup" aria-labelledby="catq25-question" className="space-y-3">{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={question.id} value={o.id} checked={answers[question.id] === o.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current++; setAnswers({ ...answers, [question.id]: o.id }); setMessage(""); setManual(""); }} />
          <span className="leading-7">{o.id !== "na" ? `${o.id} — ` : ""}{o.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 24 ? (zh ? "查看分数与完整读法" : "See scores and full guides") : (zh ? "下一题" : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading?.[locale]}</h2>
        <p className="leading-8">{zh ? "25项均已作明确选择，包括跳过项。以下是原始合计与均分，不划等级、不选主导类型，也不作诊断。" : "All 25 statements have an explicit choice, including skips. These are raw sums and means, without bands, a dominant type or a diagnosis."}</p>
        <div data-catq25-result className="space-y-6">{CATQ25_GUIDES.map(id => {
          const score = id === "overall" ? result.total : result.parts[id], profile = quiz.profiles.find(p => p.id === id)!;
          return <section key={id} data-catq25-part={id} aria-labelledby={`catq25-${id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 id={`catq25-${id}`} className="scroll-mt-24 text-xl font-semibold">{profile.title[locale]}</h3>
            <p data-catq25-count className="my-3 leading-7">{zh ? `数字答案 ${score.numericCount}/${score.requiredCount}；跳过 ${score.skippedCount} 条。` : `Numeric responses ${score.numericCount}/${score.requiredCount}; ${score.skippedCount} skipped.`}</p>
            {score.sum === null || score.mean === null ? <p data-catq25-unscored className="my-4 rounded-lg bg-slate-50 p-4 leading-8">{zh ? "未计分：存在跳过项，不补填，也不按剩余项计算均分。" : "Unscored: a statement was skipped. No value is filled in and no mean is calculated from the remaining items."}</p> : <div className="my-4 space-y-3 rounded-lg bg-slate-50 p-4 leading-8">
              <p data-catq25-sum className="text-xl font-semibold">{zh ? `原始合计：${score.sum}（范围 ${score.requiredCount}—${score.requiredCount * 7}）` : `Raw sum: ${score.sum} (range ${score.requiredCount}–${score.requiredCount * 7})`}</p>
              <p data-catq25-mean>{zh ? `均分：${score.mean.toFixed(2)}（范围1—7）；合计除以${score.requiredCount}，不是百分位。` : `Mean: ${score.mean.toFixed(2)} (range 1–7); sum divided by ${score.requiredCount}, not a percentile.`}</p>
            </div>}
            <details className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "展开此部分完整读法" : "Expand this full reading"}</summary><div className="mt-5"><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`catq25-${id}`} /></div></details>
            <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "阅读完整公开指南" : "Read the complete public guide"}</Link>
          </section>;
        })}</div>
        <button type="button" className={button} onClick={copyPublicLinks}>{zh ? "复制公开解释链接" : "Copy public explanation links"}</button>
        {manual && <label className="block leading-7">{zh ? "手动复制公开链接" : "Public links for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-40 w-full rounded-lg border border-slate-300 p-3" /></label>}
        <button type="button" className={button} onClick={clear}>{zh ? "清空并重新测试" : "Clear and retake"}</button>
      </>}
      {stage !== "welcome" && <button type="button" className={button} onClick={clear}>{zh ? "退出并清除本次回答" : "Exit and clear these responses"}</button>}
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备问卷，请稍候。" : "Preparing the questionnaire. Please wait.")}</p>
    <noscript><p>{zh ? "作答需启用JavaScript；全部公开指南仍可直接阅读。" : "Answering requires JavaScript; all public guides remain readable."}</p></noscript>
  </section>;
}
