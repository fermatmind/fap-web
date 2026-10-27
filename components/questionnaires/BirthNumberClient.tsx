"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { BIRTH_NUMBER_METHODS, calculateBirthDateNumber, deviceCalendarDate, isBirthNumberConfigurationValid, joinBirthDateFields, type BirthNumberMethod, type BirthNumberQuestionnaire, type BirthNumberResult } from "@/lib/questionnaires/birthNumber";
import { BirthNumberReport } from "./BirthNumberReport";

type Complete = Extract<BirthNumberResult, { status: "complete" }>;
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function BirthNumberClient({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isBirthNumberConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "计算器内容暂不可用。" : "The calculator content is unavailable."}</p>;
  return <ValidBirthNumberClient key={locale} quiz={quiz} locale={locale} />;
}

function ValidBirthNumberClient({ quiz, locale }: { quiz: BirthNumberQuestionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const zh = locale === "zh", [year, setYear] = useState(""), [month, setMonth] = useState(""), [day, setDay] = useState("");
  const [method, setMethod] = useState<BirthNumberMethod>("separate-parts"), [message, setMessage] = useState("");
  const [finished, setFinished] = useState<{ date: string; results: Complete[] } | null>(null), [manual, setManual] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const revision = useRef(0);
  const invalidate = useCallback(() => { revision.current += 1; setFinished(null); setManual(""); setMessage(""); }, []);
  const clear = useCallback(() => { setYear(""); setMonth(""); setDay(""); invalidate(); }, [invalidate]);
  useEffect(() => {
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revision.current += 1; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (finished) resultHeading.current?.focus(); }, [finished]);
  function failure(status: string, reason?: string) {
    setFinished(null); setManual("");
    setMessage(status === "unavailable" ? (zh ? "当前设备日期无法用于计算，请检查设备日期后重试。" : "The device date is unavailable for this calculation. Check it and try again.")
      : reason === "future-date" ? (zh ? "出生日期不能晚于当前设备日历显示的今天。" : "A birth date cannot be later than today on this device’s calendar.")
        : reason === "date-range" ? (zh ? "请输入1900年1月1日起、且不晚于今天的公历日期。" : "Enter a Gregorian date from January 1, 1900 through today.")
          : reason === "calendar-date" ? (zh ? "这个公历日期不存在，请核对月份、日期及闰年。" : "This Gregorian date does not exist. Check the month, day and leap year.")
            : (zh ? "请填写完整的公历年月日：年份四位，月和日各一至两位数字。" : "Enter a complete Gregorian date: four year digits and one or two digits each for month and day."));
  }
  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    invalidate();
    const date = joinBirthDateFields(year, month, day);
    if (!date) { failure("invalid", "date-format"); return; }
    const result = calculateBirthDateNumber(date, method, deviceCalendarDate());
    if (result.status !== "complete") { failure(result.status, "reason" in result ? result.reason : undefined); return; }
    setFinished({ date, results: [result] }); setManual(""); setMessage("");
  }
  function compare() {
    if (!finished) return;
    invalidate();
    const other = method === "separate-parts" ? "all-date-digits" : "separate-parts";
    const result = calculateBirthDateNumber(finished.date, other, deviceCalendarDate());
    if (result.status !== "complete") { failure(result.status, "reason" in result ? result.reason : undefined); return; }
    setFinished({ ...finished, results: [finished.results[0], result] }); setManual(""); setMessage("");
  }
  async function copy() {
    if (!finished) return;
    const selected = finished.results[0], profile = quiz.profiles.find(item => item.symbol === selected.number)!;
    const text = `${profile.title[locale]}\n${quiz.birthNumber.methods.find(item => item.id === selected.method)!.label[locale]}`;
    const copiedRevision = revision.current;
    try {
      await navigator.clipboard.writeText(text);
      if (copiedRevision !== revision.current) return;
      setManual(""); setMessage(zh ? "已复制符号标签与方法，不含生日或算式。" : "Copied the symbolic label and method, without a date or operations.");
    } catch {
      if (copiedRevision !== revision.current) return;
      setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制。" : "Automatic copying is unavailable. Copy the text below manually.");
    }
  }
  return <section id="take-test" data-birth-number-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7" aria-labelledby="birth-number-input-title">
    <h2 id="birth-number-input-title" className="text-2xl font-semibold">{zh ? "选择规则，输入公历日期" : "Choose a rule and enter a Gregorian date"}</h2>
    <p id="birth-number-input-note" className="my-4 text-sm leading-7 text-slate-600">{zh ? "范围为1900年1月1日至当前设备显示的今天。无需姓名、性别、出生时间或地点。输入只在本页内存中，清除、离开、刷新或换语会移除。" : "Use January 1, 1900 through today on this device. No name, gender, birth time or place is needed. Input stays in this page’s memory; clearing, leaving, reloading or changing language removes it."}</p>
    <form onSubmit={calculate} aria-describedby="birth-number-input-note" noValidate>
      <fieldset disabled={!ready} aria-labelledby="birth-number-input-title" className="min-w-0 p-0">
      <div className="mb-5"><label htmlFor="birth-number-rule" className="mb-2 block font-semibold">{zh ? "计算规则" : "Calculation rule"}</label><select id="birth-number-rule" value={method} className="min-h-12 w-full rounded-lg border border-slate-300 bg-white p-3" onChange={event => {
        invalidate(); if (BIRTH_NUMBER_METHODS.includes(event.target.value as BirthNumberMethod)) setMethod(event.target.value as BirthNumberMethod);
      }}>{quiz.birthNumber.methods.map(item => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select><p className="mt-2 text-sm leading-7 text-slate-600">{quiz.birthNumber.methods.find(item => item.id === method)!.description[locale]}</p></div>
      <div className="grid grid-cols-3 gap-3">{[
        { id: "year", label: zh ? "年（四位数字）" : "Year (four digits)", value: year, set: setYear, length: 4, placeholder: "YYYY" },
        { id: "month", label: zh ? "月" : "Month", value: month, set: setMonth, length: 2, placeholder: "MM" },
        { id: "day", label: zh ? "日" : "Day", value: day, set: setDay, length: 2, placeholder: "DD" },
      ].map(field => <div key={field.id}><label htmlFor={`birth-number-${field.id}`} className="mb-2 block min-h-12 font-semibold sm:min-h-6">{field.label}</label><input id={`birth-number-${field.id}`} type="text" inputMode="numeric" autoComplete="off" maxLength={field.length} placeholder={field.placeholder} value={field.value} className="min-h-12 w-full min-w-0 rounded-lg border border-slate-300 p-3" onChange={event => { invalidate(); field.set(event.target.value); }} /></div>)}</div>
      <div className="my-5 flex flex-wrap gap-3"><button type="submit" className={button}>{zh ? "计算符号数字" : "Calculate symbolic number"}</button><button type="button" className={button} onClick={clear}>{zh ? "清除输入与结果" : "Clear input and result"}</button></div>
      </fieldset>
    </form>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备本页计算器，请稍候。" : "Preparing this calculator. Please wait.")}</p>
    {finished && <section aria-labelledby="birth-number-result-title">
      <h2 id="birth-number-result-title" ref={resultHeading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading![locale]}</h2>
      <div className="my-4 flex flex-wrap gap-3">{finished.results.length === 1 && <button type="button" className={button} onClick={compare}>{zh ? "比较另一种规则" : "Compare the other rule"}</button>}<button type="button" className={button} onClick={copy}>{zh ? "复制标签与方法" : "Copy label and method"}</button></div>
      {manual && <label className="my-4 block">{zh ? "手动复制文字" : "Text for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3" /></label>}
      <BirthNumberReport quiz={quiz} results={finished.results} locale={locale} />
    </section>}
    <noscript><p>{zh ? "计算需要浏览器启用JavaScript；下方公开方法与指南仍可阅读。" : "Calculation requires JavaScript; the public methods and guides below remain readable."}</p></noscript>
  </section>;
}
