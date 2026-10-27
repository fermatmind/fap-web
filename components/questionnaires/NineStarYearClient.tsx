"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { calculateNineStarYearFromInput, isNineStarYearConfigurationValid, NINE_STAR_SIDES, type NineStarReference, type NineStarYearQuestionnaire } from "@/lib/questionnaires/nineStarYear";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { NineStarYearReport } from "./NineStarYearReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function NineStarYearClient({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isNineStarYearConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "节年参考暂不可用。" : "The year reference is unavailable."}</p>;
  return <ValidNineStarYearClient key={locale} quiz={quiz} locale={locale} />;
}

function ValidNineStarYearClient({ quiz, locale }: { quiz: NineStarYearQuestionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const [year, setYear] = useState(""), [side, setSide] = useState("");
  const [finished, setFinished] = useState<NineStarReference | null>(null), [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null), yearField = useRef<HTMLInputElement>(null), firstSide = useRef<HTMLInputElement>(null), revision = useRef(0);
  const invalidate = useCallback(() => { revision.current += 1; setFinished(null); setManual(""); setMessage(""); }, []);
  const clear = useCallback(() => { setYear(""); setSide(""); invalidate(); }, [invalidate]);
  useEffect(() => {
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revision.current += 1; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (finished) resultHeading.current?.focus(); }, [finished]);
  const preview = calculateNineStarYearFromInput(year, "uncertain"), validYear = preview.status === "reference";
  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); invalidate();
    const result = calculateNineStarYearFromInput(year, side);
    if (result.status !== "reference") {
      if (result.status === "incomplete" && result.field === "boundarySide") {
        setMessage(zh ? "请明确选择界点之前、之后，或“不确定”。不会默认替你选择。" : "Explicitly choose before, after or uncertain. No side is selected for you."); firstSide.current?.focus();
      } else {
        setMessage(zh ? "请输入1900至2026之间的四位公历年份。其他年份的界点暂不可用。" : "Enter a four-digit Gregorian year from 1900 through 2026. Boundaries for other years are unavailable."); yearField.current?.focus();
      }
      return;
    }
    setFinished(result);
  }
  async function copy() {
    if (!finished) return;
    const text = finished.candidates.map(candidate => {
      const profile = quiz.profiles.find(item => item.star === candidate.star)!;
      return `${profile.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, profile.id)}`;
    }).join("\n\n"), copiedRevision = revision.current;
    try {
      await navigator.clipboard.writeText(text);
      if (copiedRevision !== revision.current) return;
      setManual(""); setMessage(zh ? "已复制公开指南标题和链接，不含年份、界点选择或算式。" : "Copied public guide titles and links, without the year, boundary-side selection or calculations.");
    } catch {
      if (copiedRevision !== revision.current) return;
      setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制公开链接。" : "Automatic copying is unavailable. Copy the public links below manually.");
    }
  }
  const labels = zh ? ["明确在所示界点之前", "明确在所示界点之后", "不确定：保留两个可能结果"] : ["Clearly before the displayed boundary", "Clearly after the displayed boundary", "Uncertain: keep both possibilities"];
  return <section id="take-test" data-nine-star-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7" aria-labelledby="nine-star-input-title">
    <h2 id="nine-star-input-title" className="text-2xl font-semibold">{zh ? "输入年份，再明确选择立春界点前后" : "Enter a year, then explicitly choose a boundary side"}</h2>
    <p id="nine-star-privacy-note" className="my-4 text-sm leading-7 text-slate-600">{zh ? "只需1900至2026的公历年份与界点前后，不收集完整生日、出生时刻、时区、姓名、性别或地点。输入仅在本页内存中，清除、刷新、离开或换语会移除。" : "Only a Gregorian year from 1900–2026 and a boundary side are needed. No full birth date, birth time, time zone, name, sex or location is collected. Input stays in this page’s memory; clearing, reloading, leaving or changing language removes it."}</p>
    <form onSubmit={calculate} aria-describedby="nine-star-privacy-note" noValidate>
      <fieldset disabled={!ready} className="min-w-0 p-0" aria-labelledby="nine-star-input-title">
        <label htmlFor="nine-star-year" className="mb-2 block font-semibold">{zh ? "公历年份（四位数字）" : "Gregorian year (four digits)"}</label>
        <input id="nine-star-year" ref={yearField} type="text" inputMode="numeric" autoComplete="off" maxLength={4} placeholder="YYYY" value={year} className="min-h-12 w-full min-w-0 rounded-lg border border-slate-300 p-3" onChange={event => { invalidate(); setYear(event.target.value); setSide(""); }} />
        {validYear ? <div className="my-5 rounded-lg bg-slate-50 p-4 leading-8">
          <p className="font-semibold">{zh ? "该公历年的立春界点" : "Beginning of Spring boundary in this Gregorian year"}</p>
          <time data-nine-star-preview-boundary dateTime={`${preview.boundaryJst}+09:00`}>{preview.boundaryJst.replace("T", " ")} JST (UTC+09:00)</time>
          <p className="mt-2 text-sm leading-7">{zh ? "这是日本标准时，不是你的出生地时间，显示精度仅到分钟。生日、时刻、时区或换算不清楚，或出生在该界点分钟内，都请选择“不确定”。不按固定2月4日或农历新年推算。" : "This is Japanese Standard Time, not the birth location’s local time, and is displayed only to a minute. Choose uncertain if the birthday, time, time zone or conversion is unknown, or if the birth falls within that boundary minute. No fixed February 4 or Lunar New Year shortcut is used."}</p>
        </div> : <p className="my-4 text-sm leading-7 text-slate-600">{zh ? "输入有效年份后显示该年的实际立春界点。" : "Enter a supported year to see its actual Beginning of Spring boundary."}</p>}
        <fieldset disabled={!validYear} className="my-5 min-w-0 p-0" aria-describedby="nine-star-boundary-note">
          <legend className="mb-3 font-semibold">{zh ? "出生时刻相对所示JST界点的位置" : "The birth moment relative to the displayed JST boundary"}</legend>
          <p id="nine-star-boundary-note" className="mb-3 text-sm leading-7 text-slate-600">{zh ? "无法明确比较时保留两侧，不需要向本页提供出生时刻或时区。" : "Keep both sides when you cannot compare confidently. You do not need to provide the birth time or time zone to this page."}</p>
          <div className="space-y-3">{NINE_STAR_SIDES.map((value, index) => <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-slate-300 p-4 focus-within:outline-2 focus-within:outline-violet-700"><input ref={index === 0 ? firstSide : undefined} type="radio" name="nine-star-boundary-side" value={value} checked={side === value} onChange={() => { invalidate(); setSide(value); }} className="h-5 w-5 shrink-0" /><span>{labels[index]}</span></label>)}</div>
        </fieldset>
        <div className="my-5 flex flex-wrap gap-3"><button type="submit" className={button}>{zh ? "查看节年参考" : "Show year reference"}</button><button type="button" className={button} onClick={() => { clear(); yearField.current?.focus(); }}>{zh ? "清除输入与结果" : "Clear input and result"}</button></div>
      </fieldset>
    </form>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备本页工具，请稍候。" : "Preparing this tool. Please wait.")}</p>
    {finished && <section aria-labelledby="nine-star-result-title">
      <h2 id="nine-star-result-title" ref={resultHeading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading[locale]}</h2>
      <div className="my-4"><button type="button" className={button} onClick={copy}>{zh ? "复制公开指南链接" : "Copy public guide links"}</button></div>
      {manual && <label className="my-4 block">{zh ? "手动复制文字" : "Text for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3" /></label>}
      <NineStarYearReport quiz={quiz} result={finished} locale={locale} />
    </section>}
    <noscript><p>{zh ? "计算需要浏览器启用JavaScript；下方方法和九篇完整文化指南仍可阅读。" : "Calculation requires JavaScript; the methods and all nine complete cultural guides below remain readable."}</p></noscript>
  </section>;
}
