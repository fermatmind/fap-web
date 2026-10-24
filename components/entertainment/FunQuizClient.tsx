"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { readFunDraft, resolveFunQuiz } from "@/lib/entertainment/scoring";
import type { Locale } from "@/lib/i18n/locales";
import { listMbtiFormMetas } from "@/lib/mbti/forms";
import { trackEvent } from "@/lib/analytics";
import { appendSeoCtaContextParamsToHref, buildSeoCtaContextParams, buildSeoCtaTrackingPayload } from "@/lib/tracking/seoCtaAttribution";
import catalog from "@/lib/entertainment/catalog.json";

function subscribeDraft(listener: () => void) {
  window.addEventListener("fm-fun-draft", listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener("fm-fun-draft", listener); window.removeEventListener("storage", listener); };
}

function saveDraftToTab(key: string, version: string, answers: Answers) {
  sessionStorage.setItem(key, JSON.stringify({ version, savedAt: Date.now(), answers }));
  window.dispatchEvent(new Event("fm-fun-draft"));
}

const action = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";

export function FunQuizClient({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  const zh = locale === "zh";
  const [answers, setAnswers] = useState<Answers>({});
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [copyFallback, setCopyFallback] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const submitted = useRef(false);
  const entered = useRef(false);
  const viewed = useRef(false);
  const storageKey = `fm_fun_draft:${quiz.slug}`;
  const savedRaw = useSyncExternalStore(subscribeDraft, () => {
    try { const raw = sessionStorage.getItem(storageKey); return readFunDraft(quiz, raw) ? raw : null; } catch { return null; }
  }, () => null);
  const draft: Answers | null = savedRaw ? JSON.parse(savedRaw).answers : null;
  const mbtiVersions = listMbtiFormMetas().map(form => zh ? `${form.questionCount} 题（约 ${form.estimatedMinutes} 分钟）` : `${form.questionCount} questions (about ${form.estimatedMinutes} min)`).join(zh ? "、" : " or ");
  const mbtiBaseHref = `/${locale}/tests/mbti-personality-test-16-personality-types`;
  const recommendation = { locale, sourceRouteFamily: "test_detail" as const, sourceSlug: quiz.slug, sourcePath: `/${locale}/tests/play/${quiz.slug}`, href: mbtiBaseHref, ctaId: "entertainment_result_mbti", targetAction: "entertainment_result_mbti", targetTestSlug: "mbti-personality-test-16-personality-types" };
  const mbtiHref = appendSeoCtaContextParamsToHref(mbtiBaseHref, buildSeoCtaContextParams(recommendation));
  const resolved = resolveFunQuiz(quiz, answers);
  const questionId = resolved.path[position];
  const question = quiz.questions.find(q => q.id === questionId);
  const result = quiz.results.find(r => r.id === resolved.resultIds[0]);
  const emit = (event: string) => trackEvent(event, { slug: quiz.slug, locale, entry_surface: "entertainment", scale_code: "ENTERTAINMENT", test_type: "entertainment", page_type: "entertainment", form_code: `fun_${quiz.slug}_v1` });

  useEffect(() => {
    if (!entered.current) {
      entered.current = true;
      trackEvent("landing_view", { slug: quiz.slug, locale, entry_surface: "entertainment", scale_code: "ENTERTAINMENT", form_code: `fun_${quiz.slug}_v1` });
    }
  }, [quiz, locale, storageKey]);

  useEffect(() => {
    if (stage !== "welcome") heading.current?.focus();
  }, [position, stage]);

  useEffect(() => {
    if (stage !== "result" || viewed.current) return;
    viewed.current = true;
    trackEvent("view_result", { slug: quiz.slug, locale, entry_surface: "entertainment", scale_code: "ENTERTAINMENT", test_type: "entertainment", page_type: "entertainment", form_code: `fun_${quiz.slug}_v1` });
  }, [stage, quiz.slug, quiz.version, locale]);

  function clearDraft() {
    try { sessionStorage.removeItem(storageKey); } catch { /* Optional storage. */ }
    window.dispatchEvent(new Event("fm-fun-draft"));
  }
  function persist(nextAnswers: Answers, enabled: boolean) {
    if (!enabled) return;
    try {
      saveDraftToTab(storageKey, quiz.version, nextAnswers);
    } catch {
      setMessage(zh ? "浏览器未允许保存。仍可继续作答，但刷新可能丢失进度。" : "This browser could not save progress. You can continue, but refreshing may clear your answers.");
    }
  }
  function start(resume = false) {
    submitted.current = false;
    viewed.current = false;
    const restored = resume && draft ? draft : {};
    setAnswers(restored);
    setPosition(Math.max(0, resolveFunQuiz(quiz, restored).path.length - 1));
    setSaving(resume);
    if (!resume) clearDraft();
    setMessage(""); setCopyFallback(""); setStage("answer");
    emit("start_test");
  }
  function choose(optionId: string) {
    if (!question || submitted.current) return;
    let nextAnswers = { ...answers, [question.id]: optionId };
    if (quiz.mechanism === "branch") {
      // Changing a branch invalidates all later answers, including a previous ending.
      nextAnswers = Object.fromEntries(Object.entries(nextAnswers).filter(([id]) => resolved.path.slice(0, position + 1).includes(id)));
    }
    setAnswers(nextAnswers); setMessage(""); persist(nextAnswers, saving);
  }
  function advance() {
    if (!question || !answers[question.id]) {
      setMessage(zh ? "请先选择一个选项，再继续。" : "Choose an option before continuing."); return;
    }
    if (position < resolved.path.length - 1) { setPosition(position + 1); setMessage(""); return; }
    if (!resolved.complete || submitted.current) return;
    submitted.current = true;
    emit("complete_test"); clearDraft(); setStage("result"); setMessage("");
  }
  async function copy() {
    if (!result) return;
    const url = `https://fermatmind.com/${locale}/tests/play/${quiz.slug}`;
    const sharedTitle = resolved.resultIds.length > 1 ? `${zh ? "并列画像：" : "Tied portraits: "}${resolved.resultIds.map(id => quiz.results.find(portrait => portrait.id === id)!.title[locale]).join(zh ? "、" : "; ")}` : result.title[locale];
    const text = `${quiz.title[locale]}\n${sharedTitle}\n${zh ? "趣味测试结果，仅供娱乐。" : "A playful quiz result, for entertainment."}\n${url}`;
    try { await navigator.clipboard.writeText(text); setMessage(zh ? "已复制结果名称与测试链接。" : "Copied the result name and quiz link."); }
    catch { setCopyFallback(text); setMessage(zh ? "无法自动复制，请选中下方文字手动复制。" : "Automatic copying is unavailable. Select and copy the text below."); }
  }

  return <section id="play" aria-label={zh ? "开始娱乐测试" : "Play the quiz"} className="my-8 rounded-xl border border-violet-200 bg-white p-5 shadow-sm sm:p-8">
    {stage === "welcome" && <>
      <h2 className="text-2xl font-semibold">{zh ? "准备好开始了吗？" : "Ready to try the quiz?"}</h2>
      <p className="my-4 text-slate-600">{zh ? "请按每题说明选择。没有标准答案，完整结果直接显示；不会提交六测答卷。" : "Follow each question’s wording. There are no right answers, and your complete result appears here immediately."}</p>
      <div className="flex flex-wrap gap-3"><button className={`${action} bg-violet-700 text-white`} onClick={() => start()}>{zh ? "开始测试" : "Start quiz"}</button>
        {draft && <button className={action} onClick={() => start(true)}>{zh ? "恢复本标签页进度" : "Resume this tab’s progress"}</button>}
        {draft && <button className={action} onClick={clearDraft}>{zh ? "清除已存进度" : "Delete saved progress"}</button>}
      </div>
    </>}
    {stage === "answer" && question && <>
      <p className="mb-3 text-sm text-slate-600">{zh ? `第 ${position + 1} 题` : `Question ${position + 1}`} · {zh ? `${resolved.path.filter(id => answers[id]).length} 题已答` : `${resolved.path.filter(id => answers[id]).length} answered`}</p>
      <progress aria-label={zh ? "作答进度" : "Quiz progress"} className="mb-5 w-full accent-violet-700" max={resolved.complete ? resolved.path.length : catalog.find(q => q.slug === quiz.slug)!.questionCount} value={resolved.path.filter(id => answers[id]).length} />
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-relaxed outline-none">{question.prompt[locale]}</h2>
      <fieldset className="mt-5 grid gap-3"><legend className="sr-only">{question.prompt[locale]}</legend>
        {question.options.map(option => <label key={option.id} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-4 ${answers[question.id] === option.id ? "border-violet-600 bg-violet-50" : "border-slate-300"}`}>
          <input className="mt-1 size-5 shrink-0 accent-violet-700" type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => choose(option.id)} />
          <span className="min-w-0 leading-relaxed [overflow-wrap:anywhere]">{option.label[locale]}</span>
        </label>)}
      </fieldset>
      <div className="mt-6 flex flex-wrap gap-3"><button className={action} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button>
        <button className={`${action} bg-violet-700 text-white`} onClick={advance}>{resolved.complete && position === resolved.path.length - 1 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next")}</button>
      </div>
      <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={saving} onChange={event => { setSaving(event.target.checked); if (!event.target.checked) clearDraft(); else persist(answers, true); }} /><span>{zh ? "在本标签页临时保存进度，刷新后可主动恢复；24小时后失效，完成或重测即清除。不会跨设备保存。" : "Save progress in this tab so I can resume after a refresh. It expires after 24 hours and clears on completion or retake. No cross-device storage."}</span></label>
      <button className="mt-3 min-h-11 text-sm underline" onClick={() => { clearDraft(); setAnswers({}); setPosition(0); setSaving(false); setStage("welcome"); }}>{zh ? "退出并清除本次进度" : "Exit and clear this attempt"}</button>
    </>}
    {stage === "result" && result && <>
      <p className="text-sm font-medium text-violet-800">{zh ? "你的趣味测试结果" : "Your playful quiz result"}</p>
      <h2 ref={heading} tabIndex={-1} className="mt-2 text-3xl font-semibold leading-snug outline-none [overflow-wrap:anywhere]">{result.title[locale]}</h2>
      {quiz.mechanism === "tally" && <div className="mt-5 rounded-lg bg-slate-50 p-4"><p className="text-sm font-medium">{zh ? "本次选项的累计分（不是心理量尺）" : "Choice point totals (not a psychological scale)"}</p><dl className="mt-2 space-y-2">{quiz.results.map(portrait => <div className="flex flex-wrap justify-between gap-3 text-sm" key={portrait.id}><dt>{portrait.title[locale]}</dt><dd>{resolved.scores[portrait.id]}</dd></div>)}</dl></div>}
      {resolved.resultIds.length > 1 && <p className="mt-4 rounded-lg bg-amber-50 p-4">{zh ? "本次并列：" : "A tie this time: "}{resolved.resultIds.map(id => quiz.results.find(r => r.id === id)!.title[locale]).join(zh ? "、" : "; ")}{zh ? "。下方按事先设定的展示顺序展开，并列不代表你只能属于一类。" : ". The portraits below follow the declared display order. You do not have to fit just one."}</p>}
      {resolved.resultIds.map(id => {
        const portrait = quiz.results.find(r => r.id === id)!;
        return <article key={id} className="mt-6 space-y-5">
          {resolved.resultIds.length > 1 && <h3 className="text-xl font-semibold">{portrait.title[locale]}</h3>}
          <p className="leading-8">{portrait.summary[locale]}</p>
          {([ ["example", zh ? "生活里的一个例子" : "A small everyday example"], ["strength", zh ? "你带来的好处" : "What you bring"], ["tradeoff", zh ? "也有这样的取舍" : "The tradeoff"], ["experiment", zh ? "可以尝试的小行动" : "One thing to try"] ] as const).map(([key, label]) => <section key={key}><h3 className="font-semibold">{label}</h3><p className="mt-2 leading-8 text-slate-700">{portrait[key][locale]}</p></section>)}
        </article>;
      })}
      <p className="mt-6 border-t pt-5 text-sm leading-6 text-slate-600">{zh ? "结果来自本测试的选项规则，不是人格诊断、能力分数或职业建议，也不能换算为 MBTI 类型。今天的情境与偏好可能影响选择。" : "This result follows this quiz’s choice rules. It is not a diagnosis, ability score, career recommendation, or MBTI equivalent. Your current mood and context can change your choices."}</p>
      <div className="mt-6 flex flex-wrap gap-3"><button className={action} onClick={copy}>{zh ? "复制结果与链接" : "Copy result and link"}</button><button className={action} onClick={() => start()}>{zh ? "重新测试" : "Retake quiz"}</button></div>
      {copyFallback && <textarea aria-label={zh ? "手动复制结果" : "Result text for manual copying"} readOnly value={copyFallback} className="mt-4 min-h-40 w-full rounded border p-3" onFocus={event => event.target.select()} />}
      <section className="mt-10 border-t pt-7" aria-label={zh ? "可选下一步" : "Optional next steps"}>
        <h3 className="text-xl font-semibold">{zh ? "完整结果已呈现，下一步由你选择" : "That is your complete result. What next?"}</h3>
        <p className="my-3 leading-7 text-slate-600">{zh ? `想用另一套框架继续认识自己？MBTI 探索偏好，与你刚才的故事独立计分。可选题本为 ${mbtiVersions}，需另行完整作答；也可以直接继续玩或离开。` : `If you want a different framework, MBTI explores preferences through its own questionnaire. The versions are ${mbtiVersions}; each needs a separate full attempt. You can also keep playing or stop here.`}</p>
        <Link prefetch={false} className="inline-block min-h-11 py-2 font-medium underline" onClick={() => trackEvent("article_to_test_click", buildSeoCtaTrackingPayload(recommendation))} href={mbtiHref}>{zh ? "了解 MBTI 与题本选择" : "Explore MBTI and its versions"}</Link>
        <ul className="mt-4 space-y-3">{catalog.filter(q => q.slug !== quiz.slug).slice(0, 3).map(q => <li key={q.slug}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/play/${q.slug}`}>{q.title[locale]}</Link></li>)}</ul>
        <Link className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "浏览所有更多测试" : "Browse all More Tests"}</Link>
      </section>
    </>}
    <p role="status" aria-live="polite" className="mt-4 text-sm leading-6 text-slate-700">{message}</p>
  </section>;
}
