"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { ResultSection, ResultScoreRow } from "./QuestionnaireResultPresentation";
import { QuestionnaireLegacyControl } from "./QuestionnaireTakeContext";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { ANGER20_TOPICS, isAnger20ConfigurationValid, scoreAnger20, type Anger20Questionnaire, type Anger20Result } from "@/lib/questionnaires/anger20";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function Anger20Client({ quiz, locale, readingProfiles, displayQuiz }: { quiz: unknown; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[]; displayQuiz?: Questionnaire }) {
  const { displayText } = useQuestionnaireDisplayCopy();
  if (!isAnger20ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? displayText("问卷内容暂不可用。") : "The questionnaire content is unavailable."}</p>;
  return <ValidAnger20Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} readingProfiles={readingProfiles} displayQuiz={displayQuiz} />;
}
function ValidAnger20Client({ quiz, locale, readingProfiles, displayQuiz }: { quiz: Anger20Questionnaire; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[]; displayQuiz?: Questionnaire }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const shown = displayQuiz ? { ...quiz, ...displayQuiz } : quiz;
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const { start: recordStart, complete: recordComplete, view: recordView, share: recordShare, consent: activityConsent } = useEntertainmentMetrics(shown.slug, shown.version, locale, true, displayText);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Anger20Result | null>(null);
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
    const checked = scoreAnger20(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? displayText("当前回答无法读取，请清除后重新开始。") : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, shown.questions[position].id)) { setMessage(zh ? displayText("请选择一个数字，或明确选择跳过此项。") : "Choose a number, or explicitly skip this statement."); return; }
    setMessage("");
    if (position < 19) setPosition(position + 1);
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
  return <section id="take-test" data-stage={stage} data-anger20-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {stage === "welcome" && <button data-explore-start type="button" disabled={!ready} className={`${button} anger20-primary`} onClick={() => { revision.current++; setStage("answer"); setPosition(0); setMessage(""); recordStart(); }}>{zh ? displayText("开始测试") : "Start test"}</button>}
    <p className="mb-4 text-sm leading-7 text-slate-600">{shown.anger20.privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{shown.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{shown.anger20.subtitle[locale]}</h2>
        <p className="leading-8">{shown.instructions?.[locale]}</p>
        <p className="leading-8">{zh ? displayText("面向18岁及以上成年人；回顾过去四周普通情境。前五条看相关情境中的生气，后十五条看已生气的场合；没有生气机会时后十五条选不计分，不填零。不诱发或重现怒意。") : "For adults aged 18 and over. Recall ordinary situations in the past four weeks. The first five concern anger in relevant situations; the last fifteen concern occasions already feeling angry. With no angry occasions, use unscored for those fifteen, not zero. Do not provoke or recreate anger."}</p>
      </>}
      {stage === "answer" && <>
        <p data-anger20-progress className="text-sm text-slate-600">{zh ? displayText(`第 ${position + 1} / 20 条描述`) : `Prompt ${position + 1} of 20`}</p>
        <h2 id="anger20-question" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{question.prompt[locale]}</h2>
        <p data-anger20-context className="rounded-lg bg-violet-50 p-3 leading-7">{zh ? (position < 5 ? "本部分：相关普通情境发生时，多常生气或挫败。" : "本部分：已经生气的场合，多常有以下回应。没有生气机会时选不计分，不填零。") : (position < 5 ? "This part: anger or frustration when the ordinary situation occurred." : "This part: responses on occasions when you already felt angry. No angry occasions means unscored, not zero.")}</p>
        <div role="radiogroup" aria-labelledby="anger20-question" className="space-y-3">{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={question.id} value={o.id} checked={answers[question.id] === o.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current++; setAnswers({ ...answers, [question.id]: o.id }); setMessage(""); setManual(""); }} />
          <span className="leading-7">{o.id !== "na" ? `${o.id} — ` : ""}{o.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? displayText("上一题") : "Back"}</button><button data-questionnaire-next type="button" className={button} onClick={next}>{position === 19 ? (zh ? displayText("查看四组读数与完整读法") : "See four readings and full guides") : (zh ? displayText("下一题") : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{shown.resultHeading?.[locale]}</h2>
        <p className="leading-8">{zh ? displayText("20项均已作明确选择，包括不计分项。四组分开显示，无总分、赢家、风险分段或诊断。外显不自动等于失控，保留不自动等于不健康，选择感不是已展示能力或安全证明。均分只是所选频率描述的摘要。") : "All 20 prompts have an explicit choice, including unscored responses. Four topics are separate, without a total, winner, risk band or diagnosis. Expression is not automatically failed control; privacy is not automatically unhealthy; perceived choice is not demonstrated skill or safety. Means summarize selected frequency descriptions only."}</p>
        <ResultSection tone="framed" title={zh ? displayText("回想一个情境，再看自己的反应") : "Recall a context, then look at your response"} description={zh ? displayText("感受到愤怒、表达出来、保留感受以及感觉有选择，分开呈现。选一个主题进入例子和私人回答。") : "Feeling anger, expressing it, keeping it private and feeling a choice are shown separately. Open a topic for its examples and private responses."} className="rounded-xl border border-teal-200 bg-teal-50/65">
          <div className="grid gap-x-8 sm:grid-cols-2">{ANGER20_TOPICS.map(id => {
            const score = result[id];
            return <ResultScoreRow key={id} label={<a className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 text-teal-950 decoration-teal-400" href={`#anger20-${id}`}>{shown.profiles.find(profile => profile.id === id)!.title[locale]}</a>} value={score.mean === null ? (zh ? displayText("未计分") : "Unscored") : `${score.mean.toFixed(2)} / 4`} score={score.mean} min={0} max={4} description={<span className="block text-sm">{zh ? displayText(`原始均分范围0–4；${score.numericCount}/${score.requiredCount}条数字答案`) : `Raw mean range 0–4; ${score.numericCount}/${score.requiredCount} numeric responses`}</span>} />;
          })}</div>
        </ResultSection>
        <div data-anger20-result className="space-y-6">{ANGER20_TOPICS.map(id => {
          const score = result[id], profile = shown.profiles.find(p => p.id === id)!;
          const readingProfile = readingProfiles?.find(item => item.id === profile.id && item.directionIds.length === 1 && item.directionIds[0] === id && item.resultReading?.quizSlug === shown.slug && item.resultReading.profileId === profile.id) ?? profile;
          return <section key={id} data-anger20-part={id} aria-labelledby={`anger20-${id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 id={`anger20-${id}`} className="scroll-mt-24 text-xl font-semibold">{profile.title[locale]}</h3>
            <p data-anger20-count className="my-3 leading-7">{zh ? displayText(`数字答案 ${score.numericCount}/${score.requiredCount}；跳过 ${score.skippedCount} 条。`) : `Numeric responses ${score.numericCount}/${score.requiredCount}; ${score.skippedCount} skipped.`}</p>
            {score.sum === null || score.mean === null ? <p data-anger20-unscored className="my-4 rounded-lg bg-slate-50 p-4 leading-8">{zh ? displayText("未计分：五条中存在不计分项；本组需五条数字答案，不把无机会或跳过当零，也不补填。") : "Unscored: a prompt was skipped. All five numeric responses are required; no opportunity or a skip never counts as zero and no values are filled in."}</p> : <div className="my-4 space-y-3 rounded-lg bg-slate-50 p-4 leading-8">
              <p data-anger20-sum className="text-xl font-semibold">{zh ? displayText(`已答数字合计：${score.sum}（范围 0—${score.numericCount * 4}）`) : `Rated sum: ${score.sum} (range 0–${score.numericCount * 4})`}</p>
              <p data-anger20-mean>{zh ? displayText(`均分：${score.mean.toFixed(2)}（范围0—4）；合计除以${score.numericCount}，不是百分比或百分位。`) : `Mean: ${score.mean.toFixed(2)} (range 0–4); sum divided by ${score.numericCount}, not a percentage or percentile.`}</p>
            </div>}
            <details data-anger20-response-review className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? displayText("查看这五条私人回答") : "Review these five private responses"}</summary><ol className="my-4 space-y-4">{shown.questions.filter(q => q.options[0].directionId === id).map(q => <li key={q.id} className="rounded-lg bg-slate-50 p-3 leading-7"><p>{q.prompt[locale]}</p><p className="mt-2 font-semibold">{q.options.find(o => o.id === answers[q.id])!.label[locale]}</p></li>)}</ol></details>
            <QuestionnaireResultReading quizSlug={shown.slug} profile={readingProfile} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`anger20-${id}`} mode="result" previewSectionIds={["example", "context"]} />
            <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, shown.slug, id)}>{zh ? displayText("阅读完整公开指南") : "Read the complete public guide"}</Link>
          </section>;
        })}</div>
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
