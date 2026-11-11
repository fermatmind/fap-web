"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { EightQuizPersonalCard } from "./EightQuizPersonalCard";
import { QuestionnaireLegacyControl, useQuestionnaireTake } from "./QuestionnaireTakeContext";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { resolveMbtiFormMeta } from "@/lib/mbti/forms";
import { isSbti31ConfigurationValid, scoreSbti31, type Sbti31Questionnaire, type Sbti31Result } from "@/lib/questionnaires/sbti31";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { Sbti31Portrait } from "./Sbti31Portrait";
import { Sbti31ModelReadouts } from "./Sbti31ModelReadouts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import styles from "./Sbti31Result.module.css";
const subscribe = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
type Complete = Extract<Sbti31Result, { status: "complete" }>;
export function QuestionnaireSbti31Client({ quiz, locale, displayQuiz }: { quiz: unknown; locale: Locale; displayQuiz?: Questionnaire }) {
  const { displayText } = useQuestionnaireDisplayCopy();
  if (!isSbti31ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? displayText("题目暂不可用。") : "This edition is unavailable."}</p>;
  return <ValidClient key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} displayQuiz={displayQuiz} />;
}
function ValidClient({ quiz, locale, displayQuiz }: { quiz: Sbti31Questionnaire; locale: Locale; displayQuiz?: Questionnaire }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const shown = displayQuiz ? { ...quiz, ...displayQuiz } as Sbti31Questionnaire : quiz;
  const zh = locale === "zh", ready = useSyncExternalStore(subscribe, () => true, () => false);
  const standalone = useQuestionnaireTake();
  const metrics = useEntertainmentMetrics(shown.slug, shown.version, locale, true, displayText);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Complete | null>(null), [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), copyGeneration = useRef(0), submitted = useRef(false);
  const model = useRef<HTMLDetailsElement>(null);
  const invalidateCopy = useCallback(() => { copyGeneration.current++; }, []);
  const clear = useCallback(() => { copyGeneration.current++; submitted.current = false; setAnswers({}); setPosition(0); setResult(null); setMessage(""); setStage("welcome"); }, []);
  useEffect(() => {
    const restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", clear); window.addEventListener("pageshow", restore);
    return () => { invalidateCopy(); window.removeEventListener("pagehide", clear); window.removeEventListener("pageshow", restore); };
  }, [clear, invalidateCopy]);
  useEffect(() => {
    if (stage === "welcome") return;
    heading.current?.focus({ preventScroll: true });
    if (standalone && stage === "result") window.scrollTo({ top: 0, behavior: "instant" });
    else heading.current?.scrollIntoView({ block: "start" });
  }, [stage, position, standalone]);
  useEntertainmentResultView(metrics.view, stage === "result");
  const question = shown.questions[position], profile = result ? shown.profiles.find(p => p.id === result.profileId) : undefined;
  const deep = resolveMbtiFormMeta("mbti_144"), quick = resolveMbtiFormMeta("mbti_93");
  function next() {
    if (stage !== "answer" || submitted.current) return;
    if (!Object.hasOwn(answers, question.id)) { setMessage(zh ? displayText("请先选择一项。") : "Choose one option first."); return; }
    const checked = scoreSbti31(answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? displayText("回答无法读取，请清除后重做。") : "These answers cannot be read. Clear and start again."); return; }
    setMessage("");
    if (position < 30) setPosition(position + 1);
    else if (checked.status === "complete") { submitted.current = true; setResult(checked); setStage("result"); metrics.complete(); }
    else setMessage(zh ? displayText("还有未答题目，请返回检查。") : "Some questions are unanswered. Go back to check.");
  }
  async function copyGuide() {
    if (!profile) return;
    const generation = ++copyGeneration.current;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${questionnaireGuidePath(traditional ? "zh-TW" : locale, shown.slug, profile.id)}`);
      if (generation === copyGeneration.current) { setMessage(zh ? displayText("已复制公开画像说明链接，不含答卷或分数。") : "Public guide link copied, without answers or scores."); metrics.share(); }
    } catch { if (generation === copyGeneration.current) setMessage(zh ? displayText("未能复制；可以打开下方公开指南。") : "Copy did not succeed. Open the public guide below instead."); }
  }
  return <section id="take-test" data-stage={stage} data-sbti31-client className="my-8 scroll-mt-24 rounded-xl border bg-white p-5 sm:p-7">
    {stage === "welcome" ? <>
      <button data-explore-start type="button" disabled={!ready} className={`${button} sbti31-primary`} onClick={() => { submitted.current = false; setStage("answer"); setMessage(""); metrics.start(); }}>{zh ? displayText("开始31题") : "Start 31 questions"}</button>
      <h2 className="text-2xl font-semibold">{zh ? displayText("开始 SBTI 测试") : "Start the SBTI test"}</h2>
      <p className="my-4 leading-8">{shown.instructions[locale]}</p>
      <p className="my-4 text-sm leading-7">{zh ? displayText("本页不存草稿；刷新、离开、换语言或重测会清除回答。") : "No draft is saved. Reloading, leaving, changing language or retaking clears your answers."}</p>
      {metrics.consent}

      <noscript><p>{zh ? displayText("作答需要JavaScript；公开说明仍可阅读。") : "Answering needs JavaScript; the public guides remain readable."}</p></noscript>
    </> : stage === "answer" ? <>
      <p className="mb-4 text-sm" aria-live="polite">{zh ? displayText(`第 ${position + 1} / 31 题`) : `Question ${position + 1} / 31`}</p>
      <h2 ref={heading} tabIndex={-1} id="sbti31-question" className="mb-5 scroll-mt-24 text-2xl leading-relaxed outline-none">{question.prompt[locale]}</h2>
      <fieldset aria-labelledby="sbti31-question" className="space-y-3"><legend className="sr-only">{zh ? displayText("选择一项") : "Choose one option"}</legend>{question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-4 leading-8"><input className="mt-2" type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { setAnswers(current => ({ ...current, [question.id]: option.id })); setMessage(""); }} /><span>{option.label[locale]}</span></label>)}</fieldset>
      <div className="my-5 flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? displayText("上一题") : "Back"}</button><button data-questionnaire-next type="button" className={button} onClick={next}>{position === 30 ? (zh ? displayText("查看完整结果") : "See the complete result") : (zh ? displayText("下一题") : "Next")}</button><QuestionnaireLegacyControl><button type="button" className={button} onClick={clear}>{zh ? displayText("退出并清除回答") : "Exit and clear answers"}</button></QuestionnaireLegacyControl></div>
    </> : result && profile ? <div className={styles.report} data-sbti31-report>
      <header className={styles.hero} data-sbti31-hero>
        <div>
          <p className={styles.eyebrow}>{zh ? displayText("SBTI · 你的趣味画像") : "SBTI · Your playful portrait"}</p>
          <h2 ref={heading} tabIndex={-1} className={styles.title} data-sbti31-result={result.profileCode}>{profile.headline[locale]} <span>{result.profileCode}</span></h2>
          <p className={styles.summary}>{zh ? displayText("31 题已完成 · 娱乐画像") : "31 questions completed · Playful portrait"}</p>
          <div className={styles.readLinks}>
            <a className={styles.readLink} href="#sbti31-readings">{zh ? displayText("解读这幅画像") : "Read your portrait"} <span aria-hidden="true">↓</span></a>
            <a className={styles.readLink} href="#sbti31-model" onClick={() => { if (model.current) model.current.open = true; }}>{zh ? displayText("直接看 15 项读数") : "Jump to your 15 readouts"} <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <Sbti31Portrait key={result.profileCode} code={result.profileCode} name={profile.headline[locale]} locale={locale} traditional={traditional} />
      </header>
      <EightQuizPersonalCard quiz={shown} result={result} locale={locale} />
      <div id="sbti31-readings" tabIndex={-1} className={styles.body}>
        <QuestionnaireResultReading quizSlug={shown.slug} profile={{ ...profile, sections: profile.sections.filter(section => section.id !== "original-dimensions") }} locale={locale} traditional={traditional} headingLevel={3} idPrefix="sbti31-full" mode="result" showHeadline={false} showSummary={false} previewSectionIds={["original-portrait", "scene", "reflection"]} />
        <details ref={model} className={styles.model}>
          <summary id="sbti31-model" className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("查看15项模型读数与匹配说明") : "View all 15 model readouts and match details"}</summary>
          <Sbti31ModelReadouts quiz={shown} profile={profile} result={result} locale={locale} />
        </details>
        <div className="my-6 flex flex-wrap gap-4"><button type="button" className={button} onClick={copyGuide}>{zh ? displayText("复制公开画像说明链接") : "Copy public portrait guide link"}</button><Link prefetch={false} className="min-h-12 py-3 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, shown.slug, profile.id)} target="_blank" rel="noopener">{zh ? displayText("打开公开指南") : "Open public guide"}</Link><button type="button" className={button} onClick={clear}>{zh ? displayText("清除并重测31题") : "Clear and retake 31 questions"}</button></div>
        <aside className="rounded-lg border p-4 leading-8"><p>{zh ? displayText(`可选下一步：独立MBTI偏好测评，默认${deep.questionCount}题约${deep.estimatedMinutes}分钟，短版${quick.questionCount}题约${quick.estimatedMinutes}分钟；不传送本页回答。完整SBTI结果已免费开放。`) : `Optional next step: a separate MBTI preference assessment. The default ${deep.questionCount}-item form takes about ${deep.estimatedMinutes} minutes; the ${quick.questionCount}-item shorter form about ${quick.estimatedMinutes}. These answers are not transferred, and your full SBTI result is already free.`}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests/mbti-personality-test-16-personality-types`}>{zh ? displayText("了解MBTI版本与边界") : "See MBTI versions and scope"}</Link></aside>
      </div>
    </div> : <p>{zh ? displayText("结果暂不可用，请退出重做。") : "Result unavailable. Exit and start again."}</p>}
    <p role="status" className="mt-4 text-sm leading-7">{message}</p>
  </section>;
}
