"use client";
import { useQuestionnaireTake, QuestionnaireLegacyControl } from "@/components/questionnaires/QuestionnaireTakeContext";
import { QuestionnaireTakeOptions } from "@/components/questionnaires/QuestionnaireTakeOptions";
import sessionStyles from "@/components/questionnaires/QuestionnaireTake.module.css";
import resultStyles from "./FunQuizResult.module.css";
import { ResultPage } from "@/components/questionnaires/QuestionnaireResultPresentation";
import { NightGardenPanel } from "./NightGardenPanel";
import { SnowDayPanel } from "./SnowDayPanel";
import { ThriftShelfPanel } from "./ThriftShelfPanel";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { readFunDraft, resolveFunQuiz } from "@/lib/entertainment/scoring";
import type { Locale } from "@/lib/i18n/locales";
import { listMbtiFormMetas } from "@/lib/mbti/forms";
import { trackEvent } from "@/lib/analytics";
import { appendSeoCtaContextParamsToHref, buildSeoCtaContextParams, buildSeoCtaTrackingPayload } from "@/lib/tracking/seoCtaAttribution";
import catalog from "@/lib/entertainment/catalog.json";
import { relatedFunQuizzes, resultPath } from "@/lib/entertainment/guides";

function subscribeDraft(listener: () => void) {
  window.addEventListener("fm-fun-draft", listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener("fm-fun-draft", listener); window.removeEventListener("storage", listener); };
}

function saveDraftToTab(key: string, version: string, answers: Answers) {
  sessionStorage.setItem(key, JSON.stringify({ version, savedAt: Date.now(), answers }));
  window.dispatchEvent(new Event("fm-fun-draft"));
}

const subscribeHydration = () => () => {};

const action = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";

export function FunQuizClient({ quiz, locale, compactLanding = false, landingInstructions }: { quiz: FunQuiz; locale: Locale; compactLanding?: boolean; landingInstructions?: { en: string; zh: string } }) {
  const standalone = useQuestionnaireTake();
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
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
    if (standalone) return null;
    try { const raw = sessionStorage.getItem(storageKey); return readFunDraft(quiz, raw) ? raw : null; } catch { return null; }
  }, () => null);
  const draft: Answers | null = savedRaw ? JSON.parse(savedRaw).answers : null;
  const mbtiVersions = listMbtiFormMetas().map(form => zh ? `${form.questionCount} 题（约 ${form.estimatedMinutes} 分钟）` : `${form.questionCount} questions (about ${form.estimatedMinutes} min)`).join(zh ? "、" : " or ");
  const mbtiBaseHref = `/${locale}/tests/mbti-personality-test-16-personality-types`;
  const recommendation = { locale, sourceRouteFamily: "test_detail" as const, sourceSlug: quiz.slug, sourcePath: `/${locale}/tests/play/${quiz.slug}`, href: mbtiBaseHref, ctaId: "entertainment_result_mbti", targetAction: "entertainment_result_mbti", targetTestSlug: "mbti-personality-test-16-personality-types", scaleCode: "MBTI" };
  const mbtiHref = appendSeoCtaContextParamsToHref(mbtiBaseHref, buildSeoCtaContextParams(recommendation));
  const resolved = resolveFunQuiz(quiz, answers);
  const questionId = resolved.path[position];
  const question = quiz.questions.find(q => q.id === questionId);
  const result = quiz.results.find(r => r.id === resolved.resultIds[0]);
  const emit = (event: string) => { if (event === "start_test" || event === "complete_test") recordEntertainmentActivity(quiz.slug, quiz.version, locale, event === "start_test" ? "start" : "complete"); trackEvent(event, { slug: quiz.slug, locale, entry_surface: "entertainment", scale_code: "ENTERTAINMENT", test_type: "entertainment", page_type: "entertainment", form_code: `fun_${quiz.slug}_v1` }); };

  useEffect(() => {
    if (!entered.current) {
      entered.current = true;
      trackEvent("landing_view", { slug: quiz.slug, locale, entry_surface: "entertainment", scale_code: "ENTERTAINMENT", form_code: `fun_${quiz.slug}_v1` });
    }
  }, [quiz, locale, storageKey]);

  useEffect(() => {
    if (stage !== "welcome") heading.current?.focus({ preventScroll: standalone });
  }, [position, stage, standalone]);

  useEffect(() => {
    if (stage !== "result" || viewed.current) return;
    viewed.current = true;
    recordEntertainmentActivity(quiz.slug, quiz.version, locale, "result_view");
    trackEvent("view_result", { slug: quiz.slug, locale, entry_surface: "entertainment", scale_code: "ENTERTAINMENT", test_type: "entertainment", page_type: "entertainment", form_code: `fun_${quiz.slug}_v1` });
  }, [stage, quiz.slug, quiz.version, locale]);

  function clearDraft() {
    try { sessionStorage.removeItem(storageKey); } catch { /* Optional storage. */ }
    window.dispatchEvent(new Event("fm-fun-draft"));
  }
  function persist(nextAnswers: Answers, enabled: boolean) {
    if (standalone || !enabled) return;
    try {
      saveDraftToTab(storageKey, quiz.version, nextAnswers);
    } catch {
      setMessage(zh ? "浏览器未允许保存。仍可继续作答，但刷新可能丢失进度。" : "This browser could not save progress. You can continue, but refreshing may clear your answers.");
    }
  }
  function start(resume = false) {
    let restored: Answers = {};
    if (resume && !standalone) {
      // A welcome screen can stay open beyond the draft's lifetime.
      let current: Answers | null = null;
      try { current = readFunDraft(quiz, sessionStorage.getItem(storageKey)); } catch { /* Optional storage. */ }
      if (!current) {
        clearDraft();
        setMessage(zh ? "已存进度已过期或无法读取，请开始新测试。" : "Saved progress expired or is unavailable. Start a new quiz.");
        return;
      }
      restored = current;
    }
    submitted.current = false;
    viewed.current = false;
    setAnswers(restored);
    setPosition(Math.max(0, resolveFunQuiz(quiz, restored).path.length - 1));
    setSaving(resume && !standalone);
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
    const guides = resolved.resultIds.map(id => `https://fermatmind.com${resultPath(locale, quiz.slug, id)}`).join("\n");
    const text = `${quiz.title[locale]}\n${sharedTitle}\n${zh ? "趣味测试结果，仅供娱乐。公开画像指南：" : "A playful quiz result, for entertainment. Public portrait guides:"}\n${guides}\n${url}`;
    try { await navigator.clipboard.writeText(text); recordEntertainmentActivity(quiz.slug, quiz.version, locale, "share", "single", "copy"); setMessage(zh ? "已复制结果名称与测试链接。" : "Copied the result name and quiz link."); }
    catch { setCopyFallback(text); setMessage(zh ? "无法自动复制，请选中下方文字手动复制。" : "Automatic copying is unavailable. Select and copy the text below."); }
  }

  const welcomeActions = <div className="flex flex-wrap gap-3"><button data-explore-start disabled={!hydrated} className={compactLanding ? "min-h-14 min-w-60 rounded-full bg-teal-600 px-8 py-4 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:opacity-50" : `${action} bg-violet-700 text-white`} onClick={() => start()}>{zh ? "开始测试" : "Start quiz"}</button>
    {draft && <button data-questionnaire-resume className={action} onClick={() => start(true)}>{zh ? "恢复本标签页进度" : "Resume this tab’s progress"}</button>}
    {draft && <button className={action} onClick={clearDraft}>{zh ? "清除已存进度" : "Delete saved progress"}</button>}
  </div>;
  return <section id="play" data-story-landing={compactLanding ? true : undefined} data-stage={stage} aria-label={zh ? "开始娱乐测试" : "Play the quiz"} className={compactLanding && stage === "welcome" ? "my-6" : "my-8 rounded-xl border border-violet-200 bg-white p-5 shadow-sm sm:p-8"}>
    {stage === "welcome" && <>
      {compactLanding && welcomeActions}
      <h2 className={compactLanding ? "mt-6 border-t border-teal-100 pt-5 text-sm font-semibold" : "text-2xl font-semibold"}>{compactLanding ? (quiz.mechanism === "branch" ? (zh ? "短篇分支故事的阅读说明" : "Reading a short branching story") : (zh ? "六个想象场景的作答说明" : "Answering six imagined scenes")) : (zh ? "准备好开始了吗？" : "Ready to try the quiz?")}</h2>
      <p className={compactLanding ? "my-3 text-sm leading-7 text-slate-600" : "my-4 text-slate-600"}>{compactLanding ? (landingInstructions?.[locale] ?? (zh ? "每题从三个观看角度选择更想尝试的一项，没有标准答案。六题完成后查看全部计数和最高并列画像；无需勾选同意、保存或另做测试。" : "Choose the viewing angle you would most like to try in each scene. There are no right answers. Finish six questions to see all counts and highest tied portraits, without an agreement, saving requirement or further test.")) : (zh ? "请按每题说明选择。没有标准答案，完整结果直接显示；不会提交六测答卷。" : "Follow each question’s wording. There are no right answers, and your complete result appears here immediately.")}</p>
      {!compactLanding && welcomeActions}
    </>}
    {stage === "answer" && question && <>
      <p className="mb-3 text-sm text-slate-600">{zh ? `第 ${position + 1} 题` : `Question ${position + 1}`} · {zh ? `${resolved.path.filter(id => answers[id]).length} 题已答` : `${resolved.path.filter(id => answers[id]).length} answered`}</p>
      <progress aria-label={zh ? "作答进度" : "Quiz progress"} className="mb-5 w-full accent-violet-700" max={resolved.complete ? resolved.path.length : catalog.find(q => q.slug === quiz.slug)!.questionCount} value={resolved.path.filter(id => answers[id]).length} />
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-relaxed outline-none">{question.prompt[locale]}</h2>
      {quiz.slug === "night-garden" && <NightGardenPanel questionId={question.id} locale={locale} />}
      {quiz.slug === "snow-day" && <SnowDayPanel questionId={question.id} locale={locale} />}
      {quiz.slug === "thrift-shop-find" && question.id === "q1" && <ThriftShelfPanel locale={locale} />}
      {standalone ? <QuestionnaireTakeOptions questionId={question.id} prompt={question.prompt[locale]} options={question.options.map(option => ({ id: option.id, label: option.label[locale] }))} value={answers[question.id]} onChange={choose} /> :       <fieldset className="mt-5 grid gap-3"><legend className="sr-only">{question.prompt[locale]}</legend>
        {question.options.map(option => <label key={option.id} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-4 ${answers[question.id] === option.id ? "border-violet-600 bg-violet-50" : "border-slate-300"}`}>
          <input className="mt-1 size-5 shrink-0 accent-violet-700" type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => choose(option.id)} />
          <span className="min-w-0 leading-relaxed [overflow-wrap:anywhere]">{option.label[locale]}</span>
        </label>)}
      </fieldset>}
      <div className={standalone ? sessionStyles.actions : "mt-6 flex flex-wrap gap-3"}><button className={action} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button>
        <button data-questionnaire-next className={`${action} bg-violet-700 text-white`} onClick={advance}>{resolved.complete && position === resolved.path.length - 1 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next")}</button>
      </div>
      <QuestionnaireLegacyControl><label className="mt-6 flex items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={saving} onChange={event => { setSaving(event.target.checked); if (!event.target.checked) clearDraft(); else persist(answers, true); }} /><span>{zh ? "在本标签页临时保存进度，刷新后可主动恢复；24小时后失效，完成或重测即清除。不会跨设备保存。" : "Save progress in this tab so I can resume after a refresh. It expires after 24 hours and clears on completion or retake. No cross-device storage."}</span></label></QuestionnaireLegacyControl>
      <QuestionnaireLegacyControl><button className="mt-3 min-h-11 text-sm underline" onClick={() => { clearDraft(); setAnswers({}); setPosition(0); setSaving(false); setStage("welcome"); }}>{zh ? "退出并清除本次进度" : "Exit and clear this attempt"}</button></QuestionnaireLegacyControl>
    </>}
    {stage === "result" && result && <>
      <ResultPage variant="story" data-story-mechanism={quiz.mechanism} className={resultStyles.report}>
        <header className={resultStyles.overview}>
          <p className={resultStyles.eyebrow}>{quiz.mechanism === "branch" ? (zh ? "你的故事结局" : "Your story ending") : (zh ? "你的趣味画像" : "Your playful portrait")}</p>
          <h2 ref={heading} tabIndex={-1} className={resultStyles.title}>{resolved.resultIds.length === 1 ? result.title[locale] : (zh ? "这次，你的选择有几个同样突出的方向" : "Your choices led to more than one portrait")}</h2>
          {resolved.resultIds.length > 1 && <p className={resultStyles.context}>{zh ? "下面几幅画像并列，没有先后高低。可以分别看看，哪些情境更像你。" : "The portraits below are tied, with none ranked above another. Explore which situations feel familiar."}</p>}
          <p className={resultStyles.shortLimit}>{zh ? "原创故事，仅供娱乐和交流。" : "An original story for fun and conversation."}</p>
        </header>
        <div id={`${quiz.slug}-result-readings`} className={resultStyles.readings}>
          {resolved.resultIds.map((id, index) => {
            const portrait = quiz.results.find(r => r.id === id)!;
            const Label = resolved.resultIds.length > 1 ? "h4" : "h3";
            return <article key={id} className={resultStyles.portrait} aria-label={portrait.title[locale]}>
              {resolved.resultIds.length > 1 && <h3 className={resultStyles.portraitTitle}>{portrait.title[locale]}</h3>}
              <p className={resultStyles.summary}>{portrait.summary[locale]}</p>
              <div className={resultStyles.details}>
                {([ ["example", zh ? "比如这样的时刻" : "What this could look like"], ["strength", quiz.mechanism === "branch" ? (zh ? "这个结局留下了什么" : "What this ending offers") : (zh ? "这种选择的好处" : "What this choice can bring")], ["tradeoff", zh ? "也可以留意" : "Something to keep in mind"] ] as const).map(([key, label]) => <section key={key}><Label>{label}</Label><p>{portrait[key][locale]}</p></section>)}
              </div>
              <section id={index === 0 ? `${quiz.slug}-result-actions` : undefined} className={resultStyles.experiments}>
                <Label>{quiz.mechanism === "branch" ? (zh ? "想继续玩，可以试试" : "If you would like to keep playing") : (zh ? "下次可以试试" : "One thing to try next time")}</Label>
                <p>{portrait.experiment[locale]}</p>
              </section>
              <Link prefetch={false} className={resultStyles.guide} href={resultPath(locale, quiz.slug, portrait.id)}>{zh ? `阅读「${portrait.title.zh}」公开指南` : `Read the public guide to ${portrait.title.en}`}</Link>
            </article>;
          })}
        </div>
        <details id={`${quiz.slug}-result-rules`} className={resultStyles.rules}>
          <summary>{zh ? "这份结果是怎样产生的？" : "How was this result reached?"}</summary>
          <p>{quiz.mechanism === "tally" ? (zh ? "每次选择按本测试写好的规则累计分数，最高分画像全部保留；同分按预设顺序展示，不额外区分高低。" : "Each choice adds points under this quiz’s authored rules. Every highest-scoring portrait is retained. Tied portraits follow the declared display order, with no extra ranking.") : (zh ? "每次选择沿写好的故事分支前进；同一路线到达同一结局。这次你经过了" + resolved.path.length + "次选择。结局是原创故事，不是心理量尺。" : `Each choice follows an authored story branch. The same route reaches the same ending. Your route took ${resolved.path.length} choices. This is an original story, not a psychological scale.`)}</p>
          {quiz.mechanism === "tally" && <div className={resultStyles.scores}><p>{zh ? "本次选项的累计分（不是心理量尺）" : "Choice point totals (not a psychological scale)"}</p><dl>{quiz.results.map(portrait => <div key={portrait.id}><dt>{portrait.title[locale]}{resolved.resultIds.includes(portrait.id) && <span className={resultStyles.leading}>{zh ? "本次最高" : "Highest this time"}</span>}</dt><dd>{resolved.scores[portrait.id]}</dd></div>)}</dl></div>}
          <p className={resultStyles.limit}>{zh ? "结果来自本测试的选项规则，不是人格诊断、能力分数或职业建议，也不能换算为 MBTI 类型。今天的情境与偏好可能影响选择。" : "This result follows this quiz’s choice rules. It is not a diagnosis, ability score, career recommendation, or MBTI equivalent. Your current mood and context can change your choices."}</p>
        </details>
      </ResultPage>
      <div className="mt-6 flex flex-wrap gap-3"><button className={action} onClick={copy}>{zh ? "复制结果与链接" : "Copy result and link"}</button><button className={action} onClick={() => start()}>{zh ? "重新测试" : "Retake quiz"}</button></div>
      {copyFallback && <textarea aria-label={zh ? "手动复制结果" : "Result text for manual copying"} readOnly value={copyFallback} className="mt-4 min-h-40 w-full rounded border p-3" onFocus={event => event.target.select()} />}
      <section className="mt-10 border-t pt-7" aria-label={zh ? "可选下一步" : "Optional next steps"}>
        <h3 className="text-xl font-semibold">{zh ? "完整结果已呈现，下一步由你选择" : "That is your complete result. What next?"}</h3>
        <p className="my-3 leading-7 text-slate-600">{zh ? `想用另一套框架继续认识自己？MBTI 探索偏好，与你刚才的故事独立计分。可选题本为 ${mbtiVersions}，需另行完整作答；也可以直接继续玩或离开。` : `If you want a different framework, MBTI explores preferences through its own questionnaire. The versions are ${mbtiVersions}; each needs a separate full attempt. You can also keep playing or stop here.`}</p>
        <Link prefetch={false} className="inline-block min-h-11 py-2 font-medium underline" onClick={() => trackEvent("article_to_test_click", buildSeoCtaTrackingPayload(recommendation))} href={mbtiHref}>{zh ? "了解 MBTI 与题本选择" : "Explore MBTI and its versions"}</Link>
        <ul className="mt-4 space-y-3">{relatedFunQuizzes(catalog, quiz).map(q => <li key={q.slug}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/play/${q.slug}`}>{q.title[locale]}</Link></li>)}</ul>
        <Link className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "浏览所有更多测试" : "Browse all More Tests"}</Link>
      </section>
    </>}
    <p role="status" aria-live="polite" className="mt-4 text-sm leading-6 text-slate-700">{message}</p>
  </section>;
}
