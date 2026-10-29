"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { calculateWetonCalendar, createWetonStory35OptionOrder, isWetonStory35ConfigurationValid, scoreWetonStory35, type SunsetRelation, type WetonCalendarResult } from "@/lib/questionnaires/wetonStory35";
import type { Locale } from "@/lib/i18n/locales";
import { WetonStory35Report } from "./WetonStory35Report";

const subscribeReady = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const capital = (s: string) => s[0].toUpperCase() + s.slice(1);

export function WetonStory35Client({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [position, setPosition] = useState(0);
  const [order, setOrder] = useState<Record<string, string[]>>({});
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome"), [message, setMessage] = useState("");
  const [date, setDate] = useState(""), [sunset, setSunset] = useState<SunsetRelation>("unknown");
  const [calendar, setCalendar] = useState<WetonCalendarResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null), valid = isWetonStory35ConfigurationValid(quiz);
  const result = valid ? scoreWetonStory35(quiz, answers) : null, question = quiz.questions[position];
  useEffect(() => { if (stage !== "welcome") heading.current?.focus(); }, [stage, position]);
  if (!valid) return <section role="alert" className="my-8 rounded-lg border p-5">{zh ? "这份Weton故事题本暂不可用。" : "This Weton story edition is unavailable."}</section>;
  function clearCalendar() { setDate(""); setSunset("unknown"); setCalendar(null); }
  function reset(next: "welcome" | "answer") { clearCalendar(); setOrder(next === "answer" ? createWetonStory35OptionOrder(quiz) : {}); setAnswers({}); setPosition(0); setMessage(""); setStage(next); }
  function advance() {
    if (!question || !answers[question.id]) { setMessage(zh ? "请选择一个选项再继续。" : "Choose an option before continuing."); return; }
    if (position < 34) { setPosition(position + 1); setMessage(""); return; }
    if (result?.status !== "complete") { setMessage(zh ? "请检查完整作答。" : "Check that every item has a response."); return; }
    setStage("result"); setMessage("");
  }
  return <section id="take-test" className="my-8 space-y-8 rounded-xl border border-violet-200 bg-white p-5 sm:p-8" aria-label={zh ? "故事问卷与独立历法" : "Story quiz and separate calendar"}>
    <p data-weton-privacy className="rounded-lg bg-slate-50 p-4 text-sm leading-7">{zh ? "答案与可选日期只留当前页面内存，不保存进度、不发送测试流程统计、不分享个人结果。刷新或换语言重新开始；退出并清除会同时清除问卷和历法输入。" : "Answers and the optional date remain in this page’s memory. No saved draft, quiz-flow statistics or personal-result sharing. Refreshing or changing language starts fresh; Exit and clear discards both quiz and calendar inputs."}</p>
    <div data-weton-story-flow>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{zh ? "开始35题原创故事选择" : "Start 35 original story choices"}</h2>
        <p className="my-4 leading-8">{quiz.instructions?.[locale]}</p>
        {!ready && <p role="status">{zh ? "正在准备测试…" : "Preparing the test…"}</p>}
        <button disabled={!ready} className={`${button} bg-violet-700 text-white`} onClick={() => reset("answer")}>{zh ? "开始测试" : "Start test"}</button>
      </>}
      {stage === "answer" && question && <>
        <p className="mb-3 text-sm">{zh ? `第${position + 1}题，共35题` : `Question ${position + 1} of 35`}</p>
        <progress aria-label={zh ? "已作答题数" : "Questions answered"} max={35} value={Object.keys(answers).length} className="mb-5 w-full accent-violet-700" />
        <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-8 outline-none">{question.prompt[locale]}</h2>
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-7">{position < 21 ? (zh ? "第一组：星期故事角色。选较想尝试的虚构贡献，不是现实能力或传统出生性格。" : "First bank: weekday story roles. Choose an appealing fictional contribution, without rating real ability or traditional birth character.") : (zh ? "第二组：市日故事视角。只比较想让故事保留的关注，不与第一组合并计数。" : "Second bank: pasaran story lenses. Compare what you want a story to retain, separately from the first bank.")}</p>
        <fieldset className="mt-5 space-y-3"><legend className="sr-only">{question.prompt[locale]}</legend>{(order[question.id] ?? []).map(id => question.options.find(o => o.id === id)!).map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-4 has-[:checked]:border-violet-700 has-[:checked]:bg-violet-50">
          <input type="radio" className="mt-1 size-5 shrink-0 accent-violet-700" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { setAnswers({ ...answers, [question.id]: option.id }); setMessage(""); }} /><span className="min-w-0 leading-7 [overflow-wrap:anywhere]">{option.label[locale]}</span>
        </label>)}</fieldset>
        <div className="mt-6 flex flex-wrap gap-3"><button className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button className={`${button} bg-violet-700 text-white`} onClick={advance}>{position === 34 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next")}</button></div>
      </>}
      {stage === "result" && result?.status === "complete" && <>
        <h2 ref={heading} tabIndex={-1} className="text-3xl font-semibold leading-tight outline-none [overflow-wrap:anywhere]">{quiz.resultHeading![locale]}</h2>
        <WetonStory35Report quiz={quiz} result={result} locale={locale} />
        <button className={button} onClick={() => reset("answer")}>{zh ? "重新测试" : "Retake test"}</button>
        <p className="my-4 leading-8">{zh ? "匹配全文已开放，可以在这里结束。故事不决定出生人格、命运或关系；独立日期参考也不能验证故事。" : "Your matched full readings are open. You may finish here. Stories determine no birth personality, fate or relationship; the separate date reference cannot validate them."}</p>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
      </>}
      {message && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm leading-7">{message}</p>}
    </div>
    <section className="space-y-4 border-t pt-6" aria-labelledby="weton-calendar-title">
      <h2 id="weton-calendar-title" className="text-2xl font-semibold">{zh ? "独立可选历法参考" : "Separate optional calendar reference"}</h2>
      <p className="leading-8">{zh ? "输入1900—2099年的公历日期；可用于生日参考，也可用任意示例日，不影响问卷。传统日界在当地日落，只有确知与日落关系时才选之前或之后。不知道就保留两种可能；不猜时区或固定日落钟点，也不从日期判断性格。" : "Enter a Gregorian date from 1900 through 2099, as a birth-date reference or any example day. It never changes the quiz. The traditional day begins at local sunset: choose before or after only when known. Unknown retains two possibilities. No timezone, fixed sunset hour or personality is inferred."}</p>
      <form className="space-y-4" onSubmit={event => { event.preventDefault(); setCalendar(calculateWetonCalendar(date, sunset)); }}>
        <label className="block space-y-2"><span className="block font-medium">{zh ? "公历参考日期" : "Gregorian reference date"}</span><input type="date" min="1900-01-01" max="2099-12-31" required value={date} onChange={event => { setDate(event.target.value); setCalendar(null); }} className="min-h-12 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2" /></label>
        <label className="block space-y-2"><span className="block font-medium">{zh ? "与当地日落的关系" : "Relation to local sunset"}</span><select value={sunset} onChange={event => { setSunset(event.target.value as SunsetRelation); setCalendar(null); }} className="min-h-12 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="unknown">{zh ? "不知道／仅有日期" : "Unknown / date only"}</option><option value="before">{zh ? "已知在当地日落之前" : "Known before local sunset"}</option><option value="after">{zh ? "已知在当地日落或之后" : "Known at or after local sunset"}</option></select></label>
        <div className="flex flex-wrap gap-3"><button disabled={!ready} className={button} type="submit">{zh ? "查看历法参考" : "Show calendar reference"}</button><button type="button" className={button} onClick={clearCalendar}>{zh ? "清除历法输入" : "Clear calendar inputs"}</button></div>
      </form>
      {calendar?.status === "invalid" && <p role="alert">{zh ? "请输入有效的1900—2099年公历日期。" : "Enter a valid Gregorian date from 1900 through 2099."}</p>}
      {calendar?.status === "complete" && <div data-weton-calendar-result role="status" className="space-y-4 rounded-lg bg-slate-50 p-4">
        <p className="leading-8">{calendar.relation === "unknown" ? (zh ? "与当地日落关系未知：保留以下两个可能参考，不选定唯一出生Weton。" : "Relation to local sunset is unknown: both possible references remain; no unique birth Weton is selected.") : (zh ? "按你明确提供的日落关系计算；这里只是历法参考。" : "Calculated using your explicit sunset relation, as a calendar reference only.")}</p>
        <ul className="space-y-4">{calendar.references.map(reference => <li key={reference.civilDate} data-weton-calendar-reference className="leading-8"><span>{reference.civilDate}: {capital(reference.weekday)} {capital(reference.pasaran)}</span><br /><span>{zh ? "neptu传统相加参考" : "Conventional neptu sum"}: {reference.weekdayNeptu} + {reference.pasaranNeptu} = {reference.neptu}</span></li>)}</ul>
        <p className="text-sm leading-7">{zh ? "neptu是传统数值相加，不是能量、吉凶、匹配、健康或人格分。日期参考与故事配对彼此独立，不需要一致。" : "Neptu is a conventional sum, without an energy, fortune, compatibility, health or personality score. Date references and story matches are independent and need not agree."}</p>
      </div>}
    </section>
    <button className="min-h-11 text-sm underline" onClick={() => reset("welcome")}>{zh ? "退出并清除本次进度" : "Exit and clear this attempt"}</button>
  </section>;
}
