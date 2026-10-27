"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { isNatalChartConfigurationValid, natalPublicLinks, type NatalChartQuestionnaire } from "@/lib/questionnaires/natalChart";
import type { NatalChartInput, NatalChartReadout, NatalChartResult } from "@/lib/questionnaires/natalChartCalculation";
import type { NatalTimeChoice } from "@/lib/questionnaires/natalChartTime";
import { NatalChartReport } from "./NatalChartReport";

const subscribeReady = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const inputClass = "mt-2 min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white p-3";

export function NatalChartClient({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isNatalChartConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "星盘内容暂不可用。" : "The chart content is unavailable."}</p>;
  return <ValidNatalChartClient key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}

function ValidNatalChartClient({ quiz, locale }: { quiz: NatalChartQuestionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [date, setDate] = useState(""), [time, setTime] = useState(""), [unknownTime, setUnknownTime] = useState(false);
  const [latitude, setLatitude] = useState(""), [longitude, setLongitude] = useState(""), [zone, setZone] = useState("");
  const [reference, setReference] = useState(""), [confirmed, setConfirmed] = useState(false);
  const [occurrence, setOccurrence] = useState<"" | "earlier" | "later">(""), [choices, setChoices] = useState<NatalTimeChoice[]>([]);
  const [chart, setChart] = useState<NatalChartReadout | null>(null), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null), ambiguityHeading = useRef<HTMLLegendElement>(null);
  const revision = useRef(0);
  const invalidate = useCallback(() => {
    revision.current += 1; setChart(null); setChoices([]); setOccurrence(""); setMessage(""); setManual(""); setBusy(false);
  }, []);
  const clear = useCallback(() => {
    invalidate(); setDate(""); setTime(""); setUnknownTime(false); setLatitude(""); setLongitude(""); setZone(""); setReference(""); setConfirmed(false);
  }, [invalidate]);
  useEffect(() => {
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revision.current += 1; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (chart) resultHeading.current?.focus(); }, [chart]);
  useEffect(() => { if (choices.length) ambiguityHeading.current?.focus(); }, [choices]);

  function error(result: Exclude<NatalChartResult, { status: "complete" | "choose-time" }>) {
    setChart(null); setManual("");
    if (result.status === "unavailable") { setMessage(zh ? "天体位置暂时无法计算；未生成替代结果。公开解释仍可阅读，请稍后重试。" : "The body positions cannot be calculated right now. No substitute result was generated. Public readings remain available; try again later."); return; }
    const messages = {
      "known-time": zh ? "本版本需要已知出生时间；不会代填中午。全部公开解释仍可阅读。" : "This version needs a known birth time and will not substitute noon. All public readings remain available.",
      date: zh ? "请输入完整且真实存在的公历日期。" : "Enter a complete Gregorian date that actually exists.",
      time: zh ? "请输入已知的当地出生时刻，使用24小时的小时和分钟。" : "Enter the known local birth time in 24-hour hours and minutes.",
      zone: zh ? "请输入该地点适用的IANA时区，例如Asia/Shanghai；不能使用数字偏移替代。" : "Enter the location's IANA time zone, such as Asia/Shanghai. A numeric offset is not a substitute.",
      gap: zh ? "该当地钟表时间不存在，可能位于夏令时跳时区间。请核对原始记录并修正；不会自动挪动时间。" : "That local clock time does not exist, possibly because of a daylight-saving jump. Check the original record and correct it; the time will not be shifted automatically.",
      occurrence: zh ? "请明确选择重复钟表时间中的第一次或第二次。" : "Explicitly choose the first or second occurrence of the repeated clock time.",
      range: zh ? "出生公历日期须从1900年1月1日起，解析后的UTC时刻须从1899年12月31日零时起。" : "The local Gregorian date must be January 1, 1900 or later, with a resolved UTC instant from December 31, 1899 at 00:00Z.",
      future: zh ? "选定的实际出生时刻晚于设备当前时刻。请检查日期、钟表时间、时区和重复时间选择。" : "The selected birth instant is later than this device's current instant. Check the date, clock time, zone and occurrence choice.",
      clock: zh ? "当前设备时钟无法用于计算，请检查后重试。" : "The device clock cannot be used for this calculation. Check it and try again.",
      geography: zh ? "请填写有效十进制纬度（−90至90）和经度（−180至180），并确认已核对坐标及时区。" : "Enter decimal latitude (−90 to 90) and longitude (−180 to 180), then confirm you checked the coordinates and time zone.",
      input: zh ? "当前输入格式无法读取，请清除后重新填写。" : "These input fields cannot be read. Clear them and enter the details again.",
    };
    setMessage(messages[result.reason]);
  }

  async function calculate() {
    revision.current += 1;
    const calculationRevision = revision.current;
    setChart(null); setMessage(""); setManual(""); setBusy(true);
    const values: NatalChartInput = { date, time, zone, latitude, longitude, knownTime: !unknownTime, coordinatesConfirmed: confirmed, occurrence };
    try {
      const { calculateNatalChart } = await import("@/lib/questionnaires/natalChartCalculation");
      if (revision.current !== calculationRevision) return;
      const result = calculateNatalChart(values, Date.now());
      if (revision.current !== calculationRevision) return;
      if (result.status === "complete") { setChart(result.chart); setChoices([]); }
      else if (result.status === "choose-time") { setChoices(result.choices); setMessage(zh ? "该分钟发生两次，请按原始记录选择一次，再计算。" : "This minute occurs twice. Choose the occurrence from the original record, then calculate again."); }
      else error(result);
    } catch {
      if (revision.current === calculationRevision) setMessage(zh ? "计算模块暂不可用；输入未上传，未生成替代结果。请稍后重试或阅读公开解释。" : "The calculation module is unavailable. Inputs were not uploaded and no substitute result was generated. Try later or read the public guides.");
    } finally { if (revision.current === calculationRevision) setBusy(false); }
  }

  async function copyPublicLinks() {
    const text = natalPublicLinks(quiz, locale), copiedRevision = revision.current;
    try {
      await navigator.clipboard.writeText(text);
      if (revision.current !== copiedRevision) return;
      setManual(""); setMessage(zh ? "已复制公开入口和十二份指南网址，不含出生资料、星座结果或个人数值。" : "Copied the public entry and twelve guide URLs, without birth details, calculated signs or personal values.");
    } catch {
      if (revision.current !== copiedRevision) return;
      setManual(text); setMessage(zh ? "自动复制不可用，可手动复制以下公开网址。" : "Automatic copying is unavailable. Copy the public URLs below manually.");
    }
  }

  return <section id="take-test" data-natal-client aria-busy={!ready || busy} aria-labelledby="natal-input-title" className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    <h2 id="natal-input-title" className="text-2xl font-semibold">{zh ? "填写已知出生时刻与地点条件" : "Enter the known birth time and location details"}</h2>
    <p className="my-4 text-sm leading-7 text-slate-600">{quiz.natalChart.privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{quiz.title[locale]}</legend>
      <div className="grid gap-5 sm:grid-cols-2"><label className="block font-semibold" htmlFor="natal-date">{zh ? "当地公历出生日期" : "Local Gregorian birth date"}<input id="natal-date" type="date" min="1900-01-01" autoComplete="off" value={date} className={inputClass} onChange={event => { invalidate(); setDate(event.target.value); }} /></label>
        <label className="block font-semibold" htmlFor="natal-time">{zh ? "当地出生时间（24小时）" : "Local birth time (24-hour)"}<input id="natal-time" type="time" step="60" autoComplete="off" disabled={unknownTime} value={time} className={inputClass} onChange={event => { invalidate(); setTime(event.target.value); }} /></label></div>
      <label className="flex min-h-12 items-start gap-3 leading-7"><input id="natal-unknown-time" type="checkbox" checked={unknownTime} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={event => { invalidate(); setUnknownTime(event.target.checked); if (event.target.checked) setTime(""); }} /><span>{zh ? "我不知道出生时间" : "I do not know the birth time"}</span></label>
      {unknownTime && <p data-natal-known-time-notice className="rounded-lg bg-slate-50 p-4 leading-8">{quiz.natalChart.knownTimeNotice[locale]}</p>}
      {/^[0-9]{4}-/.test(date) && Number(date.slice(0, 4)) < 1970 && <p data-natal-input-history className="rounded-lg border border-amber-300 bg-amber-50 p-4 leading-8">{quiz.natalChart.boundaries.timezone[locale]}</p>}
      <p className="text-sm leading-7 text-slate-600">{quiz.natalChart.inputNotice[locale]}</p>
      <label className="block font-semibold" htmlFor="natal-reference">{zh ? "参考点（可选，非准确出生地点）" : "Reference point (optional, not an exact birth site)"}<select id="natal-reference" value={reference} className={inputClass} onChange={event => {
        invalidate(); setReference(event.target.value); setConfirmed(false);
        const p = quiz.natalChart.referencePoints.find(point => point.id === event.target.value);
        if (p) { setLatitude(String(p.latitude)); setLongitude(String(p.longitude)); setZone(p.zone); }
        else { setLatitude(""); setLongitude(""); setZone(""); }
      }}><option value="">{zh ? "自行填写坐标与时区" : "Enter coordinates and time zone manually"}</option>{quiz.natalChart.referencePoints.map(p => <option value={p.id} key={p.id}>{p.name[locale]} · {p.zone}</option>)}</select></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="block font-semibold" htmlFor="natal-latitude">{zh ? "纬度（北正、南负）" : "Latitude (north+, south−)"}<input id="natal-latitude" type="text" inputMode="decimal" maxLength={24} autoComplete="off" value={latitude} className={inputClass} onChange={event => { invalidate(); setLatitude(event.target.value); setReference(""); setConfirmed(false); }} /></label>
        <label className="block font-semibold" htmlFor="natal-longitude">{zh ? "经度（东正、西负）" : "Longitude (east+, west−)"}<input id="natal-longitude" type="text" inputMode="decimal" maxLength={24} autoComplete="off" value={longitude} className={inputClass} onChange={event => { invalidate(); setLongitude(event.target.value); setReference(""); setConfirmed(false); }} /></label></div>
      <label className="block font-semibold" htmlFor="natal-zone">{zh ? "该日期适用的IANA时区" : "IANA time zone for that date"}<input id="natal-zone" type="text" maxLength={128} placeholder="Asia/Shanghai" autoComplete="off" spellCheck={false} value={zone} className={inputClass} onChange={event => { invalidate(); setZone(event.target.value); setReference(""); setConfirmed(false); }} /></label>
      <p className="text-sm leading-7 text-slate-600">{zh ? "坐标范围为纬度−90至90、经度−180至180。时区不会根据浏览器、语言、坐标或当前UTC偏移自动推测。参考点只提供IANA主地点坐标，使用前请自行确认。" : "Latitude ranges from −90 to 90 and longitude from −180 to 180. The zone is never inferred from the browser, language, coordinates or current UTC offset. Reference points supply IANA principal coordinates; confirm before using them."}</p>
      <label className="flex min-h-12 items-start gap-3 leading-7"><input id="natal-confirm" type="checkbox" checked={confirmed} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={event => { invalidate(); setConfirmed(event.target.checked); }} /><span>{zh ? "我已核对以上坐标及时区；如选参考点，接受它是地点近似。" : "I checked these coordinates and time zone; if using a reference point, I accept it as a location approximation."}</span></label>
      {choices.length > 0 && <fieldset className="space-y-3 rounded-lg border border-amber-300 p-4"><legend ref={ambiguityHeading} tabIndex={-1} className="font-semibold">{zh ? "这个当地分钟重复了两次" : "This local minute occurred twice"}</legend>{choices.map((choice, index) => <label className="flex min-h-12 items-start gap-3 leading-7" key={choice.occurrence}><input type="radio" name="natal-occurrence" value={choice.occurrence} checked={occurrence === choice.occurrence} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current += 1; setOccurrence(choice.occurrence); setChart(null); setMessage(""); setManual(""); }} /><span>{zh ? (index === 0 ? "第一次" : "第二次") : (index === 0 ? "First occurrence" : "Second occurrence")} · UTC{choice.offset} · {choice.utc}{choice.future && <span className="block">{zh ? "此时刻晚于设备当前时刻，不能计算为出生时间。" : "This instant is later than the device clock and cannot be used as a birth time."}</span>}</span></label>)}</fieldset>}
      <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={unknownTime || busy} onClick={calculate}>{zh ? "计算本次星盘" : "Calculate this chart"}</button><button type="button" className={button} onClick={clear}>{zh ? "清除输入与结果" : "Clear input and result"}</button></div>
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{!ready ? (zh ? "正在准备计算器，请稍候。" : "Preparing the calculator. Please wait.") : busy ? (zh ? "正在本页计算，出生资料不会上传。" : "Calculating on this page; birth information is not uploaded.") : message}</p>
    {chart && <section aria-labelledby="natal-result-title" className="mt-6"><h2 id="natal-result-title" ref={resultHeading} tabIndex={-1} className="mb-5 scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading[locale]}</h2><NatalChartReport quiz={quiz} chart={chart} locale={locale} /></section>}
    <div className="my-5"><button type="button" disabled={!ready} className={button} onClick={copyPublicLinks}>{zh ? "复制公开入口和指南网址" : "Copy public calculator and guide URLs"}</button>{manual && <label className="mt-4 block leading-7">{zh ? "手动复制公开网址" : "Public URLs for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-40 w-full rounded-lg border border-slate-300 p-3" /></label>}</div>
    <noscript><p>{zh ? "计算器需要启用JavaScript。如果页面停在加载画面，请启用JavaScript后计算和浏览公开指南。" : "The calculator requires JavaScript. If the page remains on its loading screen, enable JavaScript to calculate and browse the public guides."}</p></noscript>
  </section>;
}
