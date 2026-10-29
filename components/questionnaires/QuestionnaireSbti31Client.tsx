"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import type { Locale } from "@/lib/i18n/locales";
import { resolveMbtiFormMeta } from "@/lib/mbti/forms";
import { isSbti31ConfigurationValid, scoreSbti31, type Sbti31Questionnaire, type Sbti31Result } from "@/lib/questionnaires/sbti31";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { Sbti31Portrait } from "./Sbti31Portrait";
import { QuestionnaireReport } from "./QuestionnaireReport";
const subscribe = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
type Complete = Extract<Sbti31Result, { status: "complete" }>;
export function QuestionnaireSbti31Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isSbti31ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "题目暂不可用。" : "This edition is unavailable."}</p>;
  return <ValidClient key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidClient({ quiz, locale }: { quiz: Sbti31Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribe, () => true, () => false);
  const metrics = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Complete | null>(null), [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), copyGeneration = useRef(0), submitted = useRef(false);
  const invalidateCopy = useCallback(() => { copyGeneration.current++; }, []);
  const clear = useCallback(() => { copyGeneration.current++; submitted.current = false; setAnswers({}); setPosition(0); setResult(null); setMessage(""); setStage("welcome"); }, []);
  useEffect(() => {
    const restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", clear); window.addEventListener("pageshow", restore);
    return () => { invalidateCopy(); window.removeEventListener("pagehide", clear); window.removeEventListener("pageshow", restore); };
  }, [clear, invalidateCopy]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "start" }); } }, [stage, position]);
  useEntertainmentResultView(metrics.view, stage === "result");
  const question = quiz.questions[position], profile = result ? quiz.profiles.find(p => p.id === result.profileId) : undefined;
  const deep = resolveMbtiFormMeta("mbti_144"), quick = resolveMbtiFormMeta("mbti_93");
  function next() {
    if (stage !== "answer" || submitted.current) return;
    if (!Object.hasOwn(answers, question.id)) { setMessage(zh ? "请先选择一项。" : "Choose one option first."); return; }
    const checked = scoreSbti31(answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? "回答无法读取，请清除后重做。" : "These answers cannot be read. Clear and start again."); return; }
    setMessage("");
    if (position < 30) setPosition(position + 1);
    else if (checked.status === "complete") { submitted.current = true; setResult(checked); setStage("result"); metrics.complete(); }
    else setMessage(zh ? "还有未答题目，请返回检查。" : "Some questions are unanswered. Go back to check.");
  }
  async function copyGuide() {
    if (!profile) return;
    const generation = ++copyGeneration.current;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${questionnaireGuidePath(locale, quiz.slug, profile.id)}`);
      if (generation === copyGeneration.current) { setMessage(zh ? "已复制公开画像说明链接，不含答卷或分数。" : "Public guide link copied, without answers or scores."); metrics.share(); }
    } catch { if (generation === copyGeneration.current) setMessage(zh ? "未能复制；可以打开下方公开指南。" : "Copy did not succeed. Open the public guide below instead."); }
  }
  return <section id="take-test" data-sbti31-client className="my-8 scroll-mt-24 rounded-xl border bg-white p-5 sm:p-7">
    {stage === "welcome" ? <>
      <h2 className="text-2xl font-semibold">{zh ? "开始小程序原31题" : "Take the original 31 questions"}</h2>
      <p className="my-4 leading-8">{quiz.instructions[locale]}</p>
      <p className="my-4 text-sm leading-7">{zh ? "本页不存草稿；刷新、离开、换语言或重测会清除回答。" : "No draft is saved. Reloading, leaving, changing language or retaking clears your answers."}</p>
      {metrics.consent}
      <button type="button" disabled={!ready} className={button} onClick={() => { submitted.current = false; setStage("answer"); setMessage(""); metrics.start(); }}>{zh ? "开始31题" : "Start 31 questions"}</button>
      <noscript><p>{zh ? "作答需要JavaScript；公开说明仍可阅读。" : "Answering needs JavaScript; the public guides remain readable."}</p></noscript>
    </> : stage === "answer" ? <>
      <p className="mb-4 text-sm" aria-live="polite">{zh ? `第 ${position + 1} / 31 题` : `Question ${position + 1} / 31`}</p>
      <h2 ref={heading} tabIndex={-1} id="sbti31-question" className="mb-5 text-2xl leading-relaxed outline-none">{question.prompt[locale]}</h2>
      <fieldset aria-labelledby="sbti31-question" className="space-y-3"><legend className="sr-only">{zh ? "选择一项" : "Choose one option"}</legend>{question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-4 leading-8"><input className="mt-2" type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { setAnswers(current => ({ ...current, [question.id]: option.id })); setMessage(""); }} /><span>{option.label[locale]}</span></label>)}</fieldset>
      <div className="my-5 flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 30 ? (zh ? "查看完整结果" : "See the complete result") : (zh ? "下一题" : "Next")}</button><button type="button" className={button} onClick={clear}>{zh ? "退出并清除回答" : "Exit and clear answers"}</button></div>
    </> : result && profile ? <>
      <h2 ref={heading} tabIndex={-1} className="text-3xl font-semibold outline-none" data-sbti31-result={result.profileCode}>{profile.headline[locale]} · {result.profileCode}</h2>
      <Sbti31Portrait key={result.profileCode} code={result.profileCode} name={profile.headline[locale]} locale={locale} />
      <p className="my-4 leading-8">{zh ? "这是原31题玩法本次选中的趣味画像。" : "This is the playful portrait selected by the original 31-question game."}</p>
      <dl className="my-5 grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3"><div><dt>{zh ? "原模型匹配展示值" : "Original match display"}</dt><dd data-sbti31-match>{result.matchPercent}%</dd></div><div><dt>{zh ? "模型维度命中数" : "Model band matches"}</dt><dd>{15 - result.mismatchCount} / 15</dd></div><div><dt>{zh ? "原版预设稀有度" : "Original preset rarity"}</dt><dd>{result.presetRarity}</dd></div></dl>
      <p className="my-4 text-sm leading-7">{zh ? "预设稀有度不是人群比例，匹配展示值不是准确率。原文的夸张属于趣味叙述。" : "Preset rarity is not a population proportion, and the match display is not accuracy. Exaggeration in the original portrait is part of its humour."}</p>
      <section className="my-8 space-y-4"><h3 className="text-2xl font-semibold">{zh ? "本次十五维模型读数" : "Your fifteen model readouts"}</h3>{result.dimensionCards.map((card, i) => <div key={card.key} data-sbti31-dimension={card.key} className="rounded-lg border p-4 leading-8"><p className="font-semibold">{quiz.directions[i].title[locale]}：<span data-sbti31-score>{card.score}</span> / 100 · {zh ? ({ L: "偏低", M: "中段", H: "偏高" } as const)[card.band] : ({ L: "Lower band", M: "Middle band", H: "Higher band" } as const)[card.band]}</p><p>{profile.sections[1].paragraphs[i][locale]}</p></div>)}</section>
      <QuestionnaireReport profile={{ ...profile, sections: profile.sections.filter(s => s.id !== "original-dimensions") }} locale={locale} headingLevel={3} idPrefix="sbti31-full" />
      <div className="my-6 flex flex-wrap gap-4"><button type="button" className={button} onClick={copyGuide}>{zh ? "复制公开画像说明链接" : "Copy public portrait guide link"}</button><Link prefetch={false} className="min-h-12 py-3 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "打开公开指南" : "Open public guide"}</Link><button type="button" className={button} onClick={clear}>{zh ? "清除并重测31题" : "Clear and retake 31 questions"}</button></div>
      <aside className="rounded-lg border p-4 leading-8"><p>{zh ? `可选下一步：独立MBTI偏好测评，默认${deep.questionCount}题约${deep.estimatedMinutes}分钟，短版${quick.questionCount}题约${quick.estimatedMinutes}分钟；不传送本页回答。完整SBTI结果已免费开放。` : `Optional next step: a separate MBTI preference assessment. The default ${deep.questionCount}-item form takes about ${deep.estimatedMinutes} minutes; the ${quick.questionCount}-item shorter form about ${quick.estimatedMinutes}. These answers are not transferred, and your full SBTI result is already free.`}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/mbti-personality-test-16-personality-types`}>{zh ? "了解MBTI版本与边界" : "See MBTI versions and scope"}</Link></aside>
    </> : <p>{zh ? "结果暂不可用，请退出重做。" : "Result unavailable. Exit and start again."}</p>}
    <p role="status" className="mt-4 text-sm leading-7">{message}</p>
  </section>;
}
