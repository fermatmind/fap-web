"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { ResultPage } from "./QuestionnaireResultPresentation";
import { QuestionnaireLegacyControl } from "./QuestionnaireTakeContext";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { SENS16_TOPICS, isSens16ConfigurationValid, scoreSens16, type Sens16Questionnaire, type Sens16Result } from "@/lib/questionnaires/sens16";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function Sens16Client({ quiz, locale, readingProfiles, displayQuiz }: { quiz: unknown; locale: Locale; readingProfiles?: QuestionnaireProfile[]; displayQuiz?: Questionnaire }) {
  const { displayText } = useQuestionnaireDisplayCopy();
  if (!isSens16ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? displayText("问卷内容暂不可用。") : "The questionnaire content is unavailable."}</p>;
  return <ValidSens16Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} readingProfiles={readingProfiles} displayQuiz={displayQuiz} />;
}
function ValidSens16Client({ quiz, locale, readingProfiles, displayQuiz }: { quiz: Sens16Questionnaire; locale: Locale; readingProfiles?: QuestionnaireProfile[]; displayQuiz?: Questionnaire }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const shown = displayQuiz ? { ...quiz, ...displayQuiz } : quiz;
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const { start: recordStart, complete: recordComplete, view: recordView, share: recordShare, consent: activityConsent } = useEntertainmentMetrics(shown.slug, shown.version, locale, true, displayText);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Sens16Result | null>(null);
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
    const checked = scoreSens16(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? displayText("当前回答无法读取，请清除后重新开始。") : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, shown.questions[position].id)) { setMessage(zh ? displayText("请选择一个数字，或明确选择跳过此项。") : "Choose a number, or explicitly skip this statement."); return; }
    setMessage("");
    if (position < 15) setPosition(position + 1);
    else if (checked.status === "complete") { submitted.current = true; revision.current++; setResult(checked.result); setStage("result"); recordComplete(); }
    else setMessage(zh ? displayText("仍有未选择的题项；空白与跳过不同，请返回检查。") : "Some statements have no choice. Blank and skipped are different; go back to check.");
  }
  async function copyPublicLinks() {
    const text = shown.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(traditional ? "zh-TW" : locale, shown.slug, p.id)}`).join("\n\n");
    const copiedRevision = revision.current;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; recordShare(); setManual(""); setMessage(zh ? displayText("已复制公开解释链接，不含答案或个人分数。") : "Copied public explanation links, without answers or personal scores."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? displayText("无法自动复制，可从下方手动复制公开链接。") : "Automatic copying is unavailable. Copy the public links below manually."); }
  }
  const question = shown.questions[position];
  return <section id="take-test" data-stage={stage} data-sens16-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {stage === "welcome" && <button data-explore-start type="button" disabled={!ready} className={`${button} sens16-primary`} onClick={() => { revision.current++; setStage("answer"); setPosition(0); setMessage(""); recordStart(); }}>{zh ? displayText("开始测试") : "Start test"}</button>}
    <p className="mb-4 text-sm leading-7 text-slate-600">{shown.sens16.privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{shown.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{shown.sens16.subtitle[locale]}</h2>
        <p className="leading-8">{shown.instructions?.[locale]}</p>
        <p className="leading-8">{zh ? displayText("面向18岁及以上成年人；回顾过去四周有相关机会时的反应，不现场尝试刺激。没有机会、不确定或不愿回答可选不计分。") : "For adults aged 18 and over. Recall responses on relevant occasions in the past four weeks; do not try sensory exposure. No opportunity, uncertainty or declining can be unscored."}</p>
      </>}
      {stage === "answer" && <>
        <p data-sens16-progress className="text-sm text-slate-600">{zh ? displayText(`第 ${position + 1} / 16 条描述`) : `Prompt ${position + 1} of 16`}</p>
        <h2 id="sens16-question" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{question.prompt[locale]}</h2>
        <div role="radiogroup" aria-labelledby="sens16-question" className="space-y-3">{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={question.id} value={o.id} checked={answers[question.id] === o.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current++; setAnswers({ ...answers, [question.id]: o.id }); setMessage(""); setManual(""); }} />
          <span className="leading-7">{o.id !== "na" ? `${o.id} — ` : ""}{o.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? displayText("上一题") : "Back"}</button><button data-questionnaire-next type="button" className={button} onClick={next}>{position === 15 ? (zh ? displayText("查看四组读数与完整读法") : "See four readings and full guides") : (zh ? displayText("下一题") : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{shown.resultHeading?.[locale]}</h2>
        <p className="leading-8">{zh ? displayText("16项均已作明确选择，包括不计分项。四组分开显示，不合成总分、不计算阈值轴或赢家、不分配感官类型或诊断。均分只概括所选频率描述，不是校准感官测量或人口比较。") : "All 16 prompts have an explicit choice, including unscored responses. Four topics are shown separately, without a total, threshold axes, winner, sensory type or diagnosis. Means summarize selected frequency descriptions, not calibrated sensory measures or population comparisons."}</p>
        <ResultPage variant="dimensions" data-sens16-result className="space-y-6">
          <section className="border-y border-teal-200 bg-teal-50/55 p-4 sm:p-6" aria-labelledby="sensory-response-start">
            <h3 id="sensory-response-start" className="text-xl font-semibold text-teal-950">{zh ? displayText("从一件遇到感官线索的事读起") : "Start with an occasion involving sensory input"}</h3>
            <p className="mt-3 max-w-prose leading-7">{zh ? displayText("留意、增加、受打断和减少输入分别读。选择一个你想理解的主题，看看不同环境中有哪些例子。") : "Read noticing, adding, being interrupted by and reducing input separately. Open a topic for examples in different settings."}</p>
            <ul className="mt-4 divide-y divide-teal-200 border-t border-teal-200">{SENS16_TOPICS.map(id => <li key={id} className="min-w-0 py-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4">
              <a href={`#sens16-${id}`} className="inline-flex min-h-11 items-center font-semibold text-teal-950 underline underline-offset-4">{shown.profiles.find(profile => profile.id === id)!.title[locale]}</a>
              <p className="text-sm leading-6 tabular-nums">{result[id].sum === null || result[id].mean === null ? (zh ? displayText(`${result[id].numericCount}/${result[id].requiredCount} 项有效，未算均分`) : `${result[id].numericCount}/${result[id].requiredCount} rated, no mean`) : `${result[id].mean!.toFixed(2)} / 4`}</p>
            </li>)}</ul>
          </section>
          {SENS16_TOPICS.map(id => {
          const score = result[id], profile = shown.profiles.find(p => p.id === id)!;
          return <section key={id} data-sens16-part={id} aria-labelledby={`sens16-${id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 id={`sens16-${id}`} className="scroll-mt-24 text-xl font-semibold">{profile.title[locale]}</h3>
            <p data-sens16-count className="my-3 leading-7">{zh ? displayText(`数字答案 ${score.numericCount}/${score.requiredCount}；跳过 ${score.skippedCount} 条。`) : `Numeric responses ${score.numericCount}/${score.requiredCount}; ${score.skippedCount} skipped.`}</p>
            {score.sum === null || score.mean === null ? <p data-sens16-unscored className="my-4 rounded-lg bg-slate-50 p-4 leading-8">{zh ? displayText("未计分：四条中存在不计分项；本组需四条数字答案，不把跳过当零，也不补填。") : "Unscored: a prompt was skipped. All four numeric responses are required; skips never count as zero and no values are filled in."}</p> : <div className="my-4 space-y-3 rounded-lg bg-slate-50 p-4 leading-8">
              <p data-sens16-sum className="text-xl font-semibold">{zh ? displayText(`已答数字合计：${score.sum}（范围 0—${score.numericCount * 4}）`) : `Rated sum: ${score.sum} (range 0–${score.numericCount * 4})`}</p>
              <p data-sens16-mean>{zh ? displayText(`均分：${score.mean.toFixed(2)}（范围0—4）；合计除以${score.numericCount}，不是百分比或百分位。`) : `Mean: ${score.mean.toFixed(2)} (range 0–4); sum divided by ${score.numericCount}, not a percentage or percentile.`}</p>
            </div>}
            <div className="mt-5"><Sens16FullReading profile={profile} locale={locale} readingProfiles={readingProfiles} /></div>
            <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, shown.slug, id)}>{zh ? displayText("阅读完整公开指南") : "Read the complete public guide"}</Link>
          </section>;
        })}</ResultPage>
        <button type="button" className={button} onClick={copyPublicLinks}>{zh ? displayText("复制公开解释链接") : "Copy public explanation links"}</button>
        {manual && <label className="block leading-7">{zh ? displayText("手动复制公开链接") : "Public links for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-40 w-full rounded-lg border border-slate-300 p-3" /></label>}
        <button type="button" className={button} onClick={clear}>{zh ? displayText("清空并重新测试") : "Clear and retake"}</button>
      </>}
      {stage !== "welcome" && <QuestionnaireLegacyControl><button type="button" className={button} onClick={clear}>{zh ? displayText("退出并清除本次回答") : "Exit and clear these responses"}</button></QuestionnaireLegacyControl>}
    </fieldset>
    {activityConsent}
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? displayText("正在准备问卷，请稍候。") : "Preparing the questionnaire. Please wait.")}</p>
    <noscript><p>{zh ? displayText("作答需启用JavaScript；全部公开指南仍可直接阅读。") : "Answering requires JavaScript; all public guides remain readable."}</p></noscript>
  </section>;
}

export function Sens16FullReading({ profile, locale, readingProfiles }: { profile: QuestionnaireProfile; locale: Locale; readingProfiles?: QuestionnaireProfile[] }) {
  const { traditional } = useQuestionnaireDisplayCopy();
  const reading = readingProfiles?.find(p => p.id === profile.id && p.resultReading?.quizSlug === "sensory-sensitivity" && p.resultReading.profileId === profile.id) ?? profile;
  return <QuestionnaireResultReading quizSlug="sensory-sensitivity" profile={reading} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`sens16-${profile.id}`} mode="result" previewSectionIds={["example", "next"]} />;
}
