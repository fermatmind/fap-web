"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { SYNES15_TOPICS, isSynes15ConfigurationValid, scoreSynes15, type Synes15Questionnaire, type Synes15Result } from "@/lib/questionnaires/synes15";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function Synes15Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isSynes15ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "问卷内容暂不可用。" : "The questionnaire content is unavailable."}</p>;
  return <ValidSynes15Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidSynes15Client({ quiz, locale }: { quiz: Synes15Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const { start: recordStart, complete: recordComplete, view: recordView, share: recordShare, consent: activityConsent } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Synes15Result | null>(null);
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
    const checked = scoreSynes15(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? "当前回答无法读取，请清除后重新开始。" : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请选择一种回答，包括不确定或无机会／不愿回答。" : "Choose a response, including unsure or no opportunity / prefer not to answer."); return; }
    setMessage("");
    if (position < 14) setPosition(position + 1);
    else if (checked.status === "complete") { submitted.current = true; revision.current++; setResult(checked.result); setStage("result"); recordComplete(); }
    else setMessage(zh ? "仍有未选择的题项；空白与跳过不同，请返回检查。" : "Some statements have no choice. Blank and skipped are different; go back to check.");
  }
  async function copyPublicLinks() {
    const text = quiz.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, p.id)}`).join("\n\n");
    const copiedRevision = revision.current;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; recordShare(); setManual(""); setMessage(zh ? "已复制公开解释链接，不含答案或个人计数。" : "Copied public explanation links, without answers or personal counts."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制公开链接。" : "Automatic copying is unavailable. Copy the public links below manually."); }
  }
  const question = quiz.questions[position];
  return <section id="take-test" data-synes15-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {activityConsent}
    <p className="mb-4 text-sm leading-7 text-slate-600">{quiz.synes15.privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{quiz.synes15.subtitle[locale]}</h2>
        <p className="leading-8">{quiz.instructions?.[locale]}</p>
        <p className="leading-8">{quiz.synes15.editionNotice[locale]}</p>
        <p className="leading-8">{zh ? "面向18岁及以上成年人，仅回顾近三个月普通场合。无需诱发体验；不确定与无机会／不愿回答分别保留。" : "For adults aged 18 and over, recalling ordinary occasions in the past three months. No experience needs to be induced; uncertainty and no opportunity / declining remain separate."}</p>
        <button type="button" className={button} onClick={() => { revision.current++; setStage("answer"); setPosition(0); setMessage(""); recordStart(); }}>{zh ? "开始测试" : "Start test"}</button>
      </>}
      {stage === "answer" && <>
        <p data-synes15-progress className="text-sm text-slate-600">{zh ? `第 ${position + 1} / 15 条描述` : `Prompt ${position + 1} of 15`}</p>
        <h2 id="synes15-question" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{question.prompt[locale]}</h2>
        <div role="radiogroup" aria-labelledby="synes15-question" className="space-y-3">{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={question.id} value={o.id} checked={answers[question.id] === o.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current++; setAnswers({ ...answers, [question.id]: o.id }); setMessage(""); setManual(""); }} />
          <span className="leading-7">{o.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 14 ? (zh ? "查看五组记录与完整读法" : "See five records and full guides") : (zh ? "下一题" : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading?.[locale]}</h2>
        <p className="leading-8">{zh ? "15项均已作明确选择。五组分别保留四种回答计数和每条原始选择；不计算总分、均分、强度或概率，不分配类型，也不确认联觉。没有仅指有机会却未记得，不代表终身缺失。" : "All 15 prompts have an explicit choice. Five groups retain four literal response counts and each original choice, without a total, mean, strength, probability, type assignment or confirmation of synaesthesia. No means relevant opportunities but no recollection, not lifetime absence."}</p>
        <div data-synes15-result className="space-y-6">{SYNES15_TOPICS.map(id => {
          const score = result[id], profile = quiz.profiles.find(p => p.id === id)!;
          return <section key={id} data-synes15-part={id} aria-labelledby={`synes15-${id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 id={`synes15-${id}`} className="scroll-mt-24 text-xl font-semibold">{profile.title[locale]}</h3>
            <p data-synes15-count className="my-3 leading-8">{zh ? `三条中的回答计数：有 ${score.counts.yes}；没有 ${score.counts.no}；不确定 ${score.counts.unsure}；无机会／不愿回答 ${score.counts.na}。` : `Response counts out of three: yes ${score.counts.yes}; no ${score.counts.no}; unsure ${score.counts.unsure}; no opportunity / decline ${score.counts.na}.`}</p>
            <ol data-synes15-responses className="my-4 space-y-5">{score.responses.map(response => {
              const item = quiz.questions.find(q => q.id === response.questionId)!;
              const chosen = item.options.find(o => o.id === response.choice)!;
              return <li key={response.questionId} className="rounded-lg bg-slate-50 p-4 leading-8"><p>{item.prompt[locale]}</p><p className="mt-2 font-semibold">{chosen.label[locale]}</p></li>;
            })}</ol>
            <details className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "展开此部分完整读法" : "Expand this full reading"}</summary><div className="mt-5"><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`synes15-${id}`} /></div></details>
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
