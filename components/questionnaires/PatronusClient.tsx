"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { scorePatronus, PATRONUS_DISTANCE_DENOMINATOR, type PatronusResult } from "@/lib/questionnaires/patronus";
import { selectedChoiceIds } from "@/lib/questionnaires/orderedChoices";
import { questionnairePath, questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { questionnaireTrackingPayload } from "@/lib/questionnaires/tracking";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { trackEvent } from "@/lib/analytics";
import { QuestionnaireChoiceInteraction } from "./QuestionnaireChoiceInteraction";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { FantasyPortrait } from "./FantasyRoster";
import { FantasyPersonalCard } from "./FantasyPersonalCard";

const button = "min-h-12 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700 disabled:opacity-50";
type Complete = Extract<PatronusResult, { status: "complete" }>;

export function PatronusClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh";
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [position, setPosition] = useState(0);
  const [snapshot, setSnapshot] = useState<Complete | null>(null), [comparison, setComparison] = useState<string | null>(null);
  const [query, setQuery] = useState(""), [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const heading = useRef<HTMLHeadingElement>(null), comparedHeading = useRef<HTMLHeadingElement>(null), submitted = useRef(false);
  const computed = useMemo(() => scorePatronus(quiz, answers), [quiz, answers]);
  const answered = quiz.questions.filter(q => selectedChoiceIds(q, answers[q.id], true) !== null).length;
  useEffect(() => { if (stage === "answer") heading.current?.focus(); }, [stage, position]);
  useEffect(() => { if (stage === "result") { resultHeading.current?.scrollIntoView({ block: "start" }); resultHeading.current?.focus({ preventScroll: true }); } }, [stage]);
  useEffect(() => { if (comparison) { comparedHeading.current?.scrollIntoView({ block: "start" }); comparedHeading.current?.focus({ preventScroll: true }); } }, [comparison]);
  if (computed.status === "unavailable") return <section id="take-test"><p role="alert">{zh ? "守护神题本暂时不可用，请返回介绍页重试。" : "The guardian question set is unavailable. Return to the introduction to retry."}</p></section>;
  const landing = questionnairePath(locale, quiz.slug), question = quiz.questions[position];
  const emit = (action: "start" | "complete") => { recordEntertainmentActivity(quiz.slug, quiz.version, locale, action); trackEvent(action === "start" ? "start_test" : "complete_test", questionnaireTrackingPayload(quiz, locale)); };
  function start() { setAnswers({}); setPosition(0); setSnapshot(null); setComparison(null); setQuery(""); setMessage(""); setManual(""); submitted.current = false; setStage("answer"); emit("start"); }
  function advance() {
    if (submitted.current) return;
    const next = question.interaction === "multiple" && !answers[question.id] ? { ...answers, [question.id]: "[]" } : answers;
    if (selectedChoiceIds(question, next[question.id], true) === null) { setMessage(zh ? "请先完成当前题；排序需要全部六项。" : "Complete this screen first; the ranking needs all six items."); return; }
    setAnswers(next); setMessage("");
    if (position < quiz.questions.length - 1) { setPosition(position + 1); return; }
    const finished = scorePatronus(quiz, next);
    if (finished.status !== "complete") { setMessage(zh ? "答卷尚未完整，请返回核对。" : "The answer pattern is incomplete. Go back to check it."); return; }
    submitted.current = true; setSnapshot(finished); setComparison(null); setManual(""); setStage("result"); emit("complete"); recordEntertainmentActivity(quiz.slug, quiz.version, locale, "result_view");
  }
  async function copy() {
    if (!snapshot) return;
    const names = quiz.profiles.filter(p => snapshot.profileIds.includes(p.id)).map(p => p.title[locale]).join(zh ? "、" : ", ");
    const text = `${quiz.title[locale]}\n${names}\n${zh ? "本轮原创守护意象 · 非官方分配" : "This round’s original guardian image · Not an official assignment"}\nhttps://fermatmind.com${landing}`;
    try { await navigator.clipboard.writeText(text); setMessage(zh ? "已复制本轮原始匹配与公开入口，不含回答或计分。" : "Original match and public entry copied, without answers or scoring."); setManual(""); recordEntertainmentActivity(quiz.slug, quiz.version, locale, "share", "single", "copy"); }
    catch { setManual(text); setMessage(zh ? "无法自动复制，请手动复制下方文字。" : "Automatic copy is unavailable. Copy the text below."); }
  }
  if (stage === "result" && snapshot) {
    const matched = quiz.profiles.filter(p => snapshot.profileIds.includes(p.id));
    const compared = quiz.profiles.find(p => p.id === comparison);
    const filtered = quiz.profiles.filter(p => `${p.title.en} ${p.title.zh} ${p.id}`.toLowerCase().includes(query.trim().toLowerCase()));
    return <section id="take-test" data-stage="result" className="my-6 space-y-8 [overflow-wrap:anywhere]">
      <h2 ref={resultHeading} tabIndex={-1} className="scroll-mt-24 text-3xl font-bold">{quiz.resultHeading![locale]}</h2>
      <p className="leading-8">{matched.length === 1 ? (zh ? "这份完整答卷最接近以下守护意象。它是本版的故事联想，不是官方身份或固定人格。" : "This complete answer pattern is closest to the following guardian image. It is this edition’s story metaphor, not an official identity or fixed personality.") : (zh ? `保留全部${matched.length}种同为最近的意象，顺序不分主次。` : `All ${matched.length} equally nearest images are retained, without a primary or secondary order.`)}</p>
      <div className="space-y-6" data-original-patronus-ids={snapshot.profileIds.join("|")}>{matched.map(p => <article key={p.id} data-patronus-match={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className="flex flex-wrap items-center gap-6 bg-slate-950 p-5 text-slate-50"><FantasyPortrait slug={quiz.slug} id={p.id} name={p.title[locale]} large /><div className="min-w-0 flex-1"><h3 className="text-3xl font-bold">{p.title[locale]}</h3><p className="mt-4 text-xl leading-8">{p.headline[locale]}</p><p className="mt-4 leading-8">{p.summary[locale]}</p></div></header>
        <div className="p-5 sm:p-7"><QuestionnaireResultReading quizSlug={quiz.slug} profile={p} locale={locale} headingLevel={4} idPrefix={`patronus-original-${p.id}`} showSummary={false} showHeadline={false} mode="result" /><Link prefetch={false} target="_blank" rel="noopener noreferrer" href={questionnaireGuidePath(locale, quiz.slug, p.id)} className="inline-flex min-h-11 items-center underline">{zh ? "打开完整公开指南与固定演示（新标签页）" : "Open the full public guide and fixed example (new tab)"}</Link></div>
      </article>)}</div>
      <details className="rounded-xl border border-slate-200 bg-slate-50 p-5"><summary className="min-h-11 cursor-pointer font-semibold">{zh ? "本轮六维计数与匹配规则" : "This round’s six counts and matching rule"}</summary><dl className="my-4 space-y-3">{quiz.directions.map((d, i) => <div key={d.id} className="flex justify-between gap-4"><dt>{d.title[locale]}</dt><dd>{snapshot.raw[d.id]} / {quiz.patronus!.maxima[i]}</dd></div>)}</dl>{quiz.guide.find(s => s.id === "six-dimension-method")!.paragraphs.map((p, i) => <p key={i} className="my-4 leading-8">{p[locale]}</p>)}<p className="text-sm leading-7">{zh ? "下方距离显示四位小数；匹配保留所有精确最小距离，并不按显示值打破并列。" : "Distances below display four decimal places. Matching keeps every exactly smallest distance, without breaking ties using rounded displays."}</p></details>
      <div id="patronus-personal-card" className="scroll-mt-24"><FantasyPersonalCard quiz={quiz} ids={snapshot.profileIds} locale={locale} /></div>
      <section className="space-y-5" aria-label={zh ? "比较全部40种守护神" : "Compare all 40 guardians"}>
        <h3 className="text-2xl font-bold">{zh ? "比较40种意象，保留你的个人结果" : "Compare 40 images while keeping your own result"}</h3><p className="leading-8">{zh ? "选择下方动物只切换比较正文。上方个人匹配、结果图片和复制内容始终使用原始结果。" : "Choosing an animal changes only the comparison below. Your match above, personal card and copied text always retain the original result."}</p>
        {compared && <article className="scroll-mt-24 rounded-2xl border border-cyan-300 bg-cyan-50 p-5" data-patronus-comparison={compared.id}><h3 ref={comparedHeading} tabIndex={-1} className="scroll-mt-24 text-2xl font-bold">{zh ? "正在比较：" : "Comparing: "}{compared.title[locale]}</h3><p className="my-4 font-semibold">{snapshot.profileIds.includes(compared.id) ? (zh ? "这也是你的原始匹配之一。" : "This is also one of your original matches.") : (zh ? "这是比较对象，不是你的个人结果。" : "This is a comparison, not your personal result.")}</p><FantasyPortrait slug={quiz.slug} id={compared.id} name={compared.title[locale]} large /><p className="my-4 text-xl leading-8">{compared.headline[locale]}</p><p className="my-4 leading-8">{compared.summary[locale]}</p><p className="my-4">{zh ? "与本轮答卷的距离：" : "Distance from this round: "}{(snapshot.distanceUnits[compared.id] / PATRONUS_DISTANCE_DENOMINATOR).toFixed(4)} · {zh ? "越小越近，不是匹配概率。" : "Smaller is nearer, not a match probability."}</p><QuestionnaireResultReading quizSlug={quiz.slug} profile={compared} locale={locale} headingLevel={4} idPrefix={`patronus-compare-${compared.id}`} showSummary={false} showHeadline={false} mode="result" /><Link prefetch={false} target="_blank" rel="noopener noreferrer" href={questionnaireGuidePath(locale, quiz.slug, compared.id)} className="inline-flex min-h-11 items-center underline">{zh ? "查看此画像的公开指南（新标签页）" : "Read this portrait’s public guide (new tab)"}</Link></article>}
        <label className="block font-semibold">{zh ? "搜索比较动物" : "Find an animal to compare"}<input type="search" value={query} onChange={e => setQuery(e.target.value)} className="mt-3 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 font-normal" /></label><p role="status" className="text-sm">{zh ? `显示${filtered.length} / 40种意象` : `${filtered.length} / 40 images shown`}</p>
        {!filtered.length && <button type="button" className={button} onClick={() => setQuery("")}>{zh ? "清空搜索，显示全部" : "Clear search and show all"}</button>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{filtered.map(p => <button type="button" key={p.id} data-patronus-compare={p.id} aria-label={zh ? `比较${p.title[locale]}` : `Compare ${p.title[locale]}`} aria-pressed={comparison === p.id} onClick={() => setComparison(p.id)} className="flex min-w-0 flex-col items-center gap-3 rounded-xl border border-slate-300 bg-white p-3 text-center font-semibold aria-pressed:border-cyan-700 aria-pressed:bg-cyan-50"><FantasyPortrait slug={quiz.slug} id={p.id} name="" /><span>{p.title[locale]}</span></button>)}</div>
      </section>
      <div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={() => { submitted.current = false; setStage("answer"); setPosition(0); setMessage(""); }}>{zh ? "返回修改回答" : "Edit answers"}</button><button type="button" className={button} onClick={start}>{zh ? "清空并重新测试" : "Clear and retake"}</button><button type="button" className={button} onClick={() => void copy()}>{zh ? "复制我的原始结果" : "Copy my original result"}</button><Link className={`${button} inline-flex items-center`} href={`/${locale}/tests`}>{zh ? "返回全部测试" : "All tests"}</Link></div>
      <p role="status" className="leading-7">{message}</p>{manual && <textarea readOnly value={manual} aria-label={zh ? "手动复制原始结果文字" : "Original result text to copy manually"} onFocus={e => e.target.select()} rows={4} className="w-full rounded-lg border border-slate-300 p-4" />}
    </section>;
  }
  return <section id="take-test" data-stage={stage} data-patronus-screen={stage === "answer" ? question.id : undefined} className="my-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 [overflow-wrap:anywhere]">
    {stage === "welcome" ? <><h2 className="text-2xl font-bold">{zh ? "开始你的守护神旅程" : "Begin your guardian journey"}</h2><p className="leading-8">{quiz.instructions![locale]}</p><p className="text-sm leading-7">{zh ? "共20屏，16道单选、1道排序、3道可空选多选。答案只在本轮浏览器内计算，不保存草稿；刷新会清除。" : "20 screens: 16 single choices, one ranking and three multiple selections allowing none. Answers are calculated in this browser round without a saved draft; reload clears them."}</p><button type="button" data-explore-start className={button} onClick={start}>{zh ? "开始测试" : "Start test"}</button></> : <>
      <div className="flex flex-wrap justify-between gap-3 text-sm"><p>{zh ? `第${position + 1}屏 / 共20屏` : `Screen ${position + 1} of 20`}</p><p>{zh ? `已完整回答${answered}屏` : `${answered} screens fully answered`}</p></div><progress className="h-2 w-full accent-cyan-700" value={answered} max={20} aria-label={zh ? "已完整回答屏数" : "Fully answered screens"} />
      <h2 ref={heading} tabIndex={-1} className="text-2xl font-bold leading-snug">{question.prompt[locale]}</h2>
      {question.interaction ? <QuestionnaireChoiceInteraction question={question} value={answers[question.id]} locale={locale} rankLeastFirst onChange={value => { setAnswers(old => ({ ...old, [question.id]: value })); setMessage(""); }} /> : <fieldset className="space-y-3"><legend className="sr-only">{question.prompt[locale]}</legend>{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-4 has-[:checked]:border-cyan-700 has-[:checked]:bg-cyan-50"><input type="radio" className="mt-1 size-5 shrink-0 accent-cyan-700" name={question.id} value={o.id} checked={answers[question.id] === o.id} onChange={() => { setAnswers(old => ({ ...old, [question.id]: o.id })); setMessage(""); }} /><span className="min-w-0 leading-7">{o.label[locale]}</span></label>)}</fieldset>}
      <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一屏" : "Back"}</button><button type="button" data-questionnaire-next className={`${button} !bg-cyan-900 text-white`} onClick={advance}>{question.interaction === "multiple" && !(selectedChoiceIds(question, answers[question.id])?.length) ? (position === 19 ? (zh ? "不选并查看结果" : "Continue with none and see result") : (zh ? "不选并继续" : "Continue with none")) : position === 19 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一屏" : "Next")}</button></div><p role="status" className="leading-7 text-rose-800">{message}</p>
    </>}
  </section>;
}
