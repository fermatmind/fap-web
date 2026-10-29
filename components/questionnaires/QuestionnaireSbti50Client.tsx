"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import type { Locale } from "@/lib/i18n/locales";
import { resolveMbtiFormMeta } from "@/lib/mbti/forms";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isSbti50ConfigurationValid, scoreSbti50, type Sbti50Questionnaire, type Sbti50Result } from "@/lib/questionnaires/sbti50";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

type Complete = Extract<Sbti50Result, { status: "complete" }>;
const subscribeReady = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";

export function QuestionnaireSbti50Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isSbti50ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "此版题目暂不可用。" : "This edition is unavailable."}</p>;
  return <ValidSbti50Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}

function ValidSbti50Client({ quiz, locale }: { quiz: Sbti50Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const mbtiDeep = resolveMbtiFormMeta("mbti_144"), mbtiQuick = resolveMbtiFormMeta("mbti_93");
  const { start, complete, view, share, consent } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Complete | null>(null);
  const [reading, setReading] = useState<string | null>(null), [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), progress = useRef<HTMLParagraphElement>(null);
  const readingPanel = useRef<HTMLDivElement>(null);
  const copyGeneration = useRef(0);
  const submitted = useRef(false);
  const invalidateCopy = useCallback(() => { copyGeneration.current++; }, []);
  const clear = useCallback(() => {
    copyGeneration.current++;
    submitted.current = false;
    setAnswers({}); setStage("welcome"); setPosition(0); setResult(null); setReading(null); setMessage("");
  }, []);
  useEffect(() => {
    const leave = () => clear();
    const restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { invalidateCopy(); window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear, invalidateCopy]);
  useEffect(() => {
    if (stage !== "welcome") {
      heading.current?.focus({ preventScroll: true });
      (stage === "answer" ? progress.current : heading.current)?.scrollIntoView({ block: "start" });
    }
  }, [stage, position]);
  useEffect(() => {
    if (stage === "result" && reading) {
      readingPanel.current?.focus({ preventScroll: true });
      readingPanel.current?.scrollIntoView({ block: "start" });
    }
  }, [stage, reading]);
  useEntertainmentResultView(view, stage === "result");
  function next() {
    if (stage !== "answer" || submitted.current) return;
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请先选择一条；也可以退出并直接阅读指南。" : "Choose one description, or exit and read the guides instead."); return; }
    const checked = scoreSbti50(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? "当前回答无法读取，请清除后重做。" : "These choices cannot be read. Clear and start again."); return; }
    setMessage("");
    if (position < 49) setPosition(position + 1);
    else if (checked.status === "complete") { submitted.current = true; setResult(checked); setStage("result"); complete(); }
    else setMessage(zh ? "还有空白选择，请返回核对。" : "Some choices are missing. Go back to check.");
  }
  async function copyGuide() {
    if (!reading) return;
    const generation = ++copyGeneration.current;
    const publicPath = questionnaireGuidePath(locale, quiz.slug, reading);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      if (generation !== copyGeneration.current) return;
      setMessage(zh ? "已复制公开指南链接；没有个人次数或答案。" : "Public guide link copied, with no personal counts or answers.");
      share("copy");
    } catch {
      if (generation === copyGeneration.current) setMessage(zh ? "未能复制。可打开下方公开指南，再复制其网址。" : "Copy did not succeed. Open the public guide below and copy its address.");
    }
  }
  const question = quiz.questions[position], profile = quiz.profiles.find(item => item.id === reading);
  return <section id="take-test" data-sbti50-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {consent}
    <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "仅本页内存，不存草稿、不上传答案。刷新、离开、换语或重测清除；只复制通用公开指南。可选活动统计默认关闭，并另遵循全站分析选择。" : "Page memory only, with no draft or answer uploads. Reloading, leaving, changing language or retaking clears choices. Copy only general public guides. Optional activity counts are off by default and also respect site analytics consent."}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0">
      <legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{zh ? "五十组比较，不必选出唯一人格" : "Fifty comparisons, without a forced single type"}</h2>
        <p className="leading-8">{quiz.instructions[locale]}</p>
        <p className="leading-8">{zh ? "二十五主题各出现四次。每次选中记一次；全A或全B都可能使所有主题并列。次数不是二十五项人格特质的完整排序。" : "Each of twenty-five themes appears four times. A selection adds one; all-A or all-B choices tie every theme. Counts are not a complete ordering of twenty-five personality traits."}</p>
        <button type="button" className={button} onClick={() => { setStage("answer"); setPosition(0); setMessage(""); start(); }}>{zh ? "开始50组选择" : "Start 50 choices"}</button>
      </>}
      {stage === "answer" && <>
        <p ref={progress} id="sbti50-progress" data-sbti50-progress className="scroll-mt-24 text-sm text-slate-600">{zh ? `第 ${position + 1} / 50 组` : `Pair ${position + 1} of 50`}</p>
        <h2 ref={heading} tabIndex={-1} id="sbti50-question" className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{question.prompt[locale]}</h2>
        <div role="radiogroup" aria-labelledby="sbti50-question" aria-describedby="sbti50-progress" className="space-y-3">{question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { setAnswers({ ...answers, [question.id]: option.id }); setMessage(""); setResult(null); }} />
          <span className="leading-7">{option.id} — {option.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一组" : "Back"}</button>
          <button type="button" className={button} onClick={next}>{position === 49 ? (zh ? "查看本次次数" : "See these counts") : (zh ? "下一组" : "Next")}</button>
        </div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading[locale]}</h2>
        <p data-sbti50-leading className="leading-8">{zh ? `最大原始次数为 ${result.highestCount} / 4；共有 ${result.leadingThemes.length} 个主题同次：` : `Largest raw count: ${result.highestCount} / 4. ${result.leadingThemes.length} ${result.leadingThemes.length === 1 ? "theme shares" : "themes share"} it: `}{result.leadingThemes.map(id => quiz.directions.find(d => d.id === id)!.title[locale]).join(zh ? "、" : ", ")}</p>
        <p className="leading-8">{zh ? "以下按固定顺序列全部主题，不排序人格。面对的比较对象不同，少选不表示没有，多选不确定固定身份。" : "All themes follow in a fixed order, without a personality ranking. They faced different alternatives; fewer choices do not mean absence, and more choices do not establish an identity."}</p>
        <ul id="sbti50-counts" className="scroll-mt-24 space-y-3" data-sbti50-counts>{quiz.directions.map(direction => <li key={direction.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
          <span>{direction.title[locale]}: <strong data-sbti50-count={direction.id}>{result.counts[direction.id as keyof typeof result.counts]} / 4</strong></span>
          <button type="button" className={button} aria-pressed={reading === direction.id} onClick={() => { copyGeneration.current++; setReading(direction.id); setMessage(""); }}>{zh ? `阅读${direction.title.zh}` : `Read ${direction.title.en}`}</button>
        </li>)}</ul>
        <p className="leading-8">{zh ? "在下方阅读所选通用主题说明，可切换全部25篇；说明不是本次个人状态的断言。" : "Read the selected general theme below, or switch among all 25 full guides. The text does not assert your personal state."}</p>
        {profile && reading && <>
          <div ref={readingPanel} tabIndex={-1} aria-label={profile.title[locale]} className="scroll-mt-24" data-sbti50-reading={reading}><QuestionnaireReport profile={profile} locale={locale} headingLevel={3} idPrefix={`sbti50-${reading}`} /></div>
          <a className="inline-block min-h-11 py-2 underline" href="#sbti50-counts">{zh ? "返回全部主题次数" : "Back to all theme counts"}</a>
          <div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={copyGuide}>{zh ? "复制此公开指南链接" : "Copy this public guide link"}</button><Link prefetch={false} className={`${button} underline`} href={questionnaireGuidePath(locale, quiz.slug, reading)}>{zh ? "打开此公开指南" : "Open this public guide"}</Link></div>
        </>}
        <button type="button" className={button} onClick={() => { clear(); setStage("answer"); start(); }}>{zh ? "清除并重新作答" : "Clear and retake"}</button>
        <aside className="rounded-lg border p-4 leading-8"><p>{zh ? `可选下一步：独立MBTI偏好测评，默认${mbtiDeep.questionCount}题约${mbtiDeep.estimatedMinutes}分钟，短版${mbtiQuick.questionCount}题约${mbtiQuick.estimatedMinutes}分钟；与本趣味主题不同，不传送本页答案。完整指南无需继续测评也已免费开放。` : `Optional next step: a separate MBTI preference assessment. The default ${mbtiDeep.questionCount}-item form takes about ${mbtiDeep.estimatedMinutes} minutes; the shorter ${mbtiQuick.questionCount}-item form about ${mbtiQuick.estimatedMinutes}. It serves a different purpose and receives none of these answers. All theme guides are already free without it.`}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/mbti-personality-test-16-personality-types`}>{zh ? "了解MBTI版本与边界" : "See MBTI versions and scope"}</Link></aside>
      </>}
      {stage !== "welcome" && <button type="button" className={button} onClick={clear}>{zh ? "退出并清除本次回答" : "Exit and clear these choices"}</button>}
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备题目。" : "Preparing the choices.")}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${questionnairePath(locale, quiz.slug)}#sbti50-guides`}>{zh ? "不作答，直接阅读全部指南" : "Read every guide without answering"}</Link>
    <noscript><p>{zh ? "互动需要JavaScript；公开说明不要求个人作答。" : "Interaction requires JavaScript; public explanations do not require personal responses."}</p></noscript>
  </section>;
}
