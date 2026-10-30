"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isNakshatra27ConfigurationValid, nakshatraPublicLinks } from "@/lib/questionnaires/nakshatra27";
import type { NakshatraInput, NakshatraReadout, NakshatraResult } from "@/lib/questionnaires/nakshatra27Calculation";
import type { NatalTimeChoice } from "@/lib/questionnaires/natalChartTime";
import { Nakshatra27Report } from "./Nakshatra27Report";
const subscribeReady = () => () => {};
const inputClass = "mt-2 min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white p-3";
const buttonClass = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const zoneExamples = ["Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo", "Asia/Jakarta", "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "Australia/Sydney", "Pacific/Auckland"];
export function Nakshatra27Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isNakshatra27ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "出生宿内容暂不可用。" : "The birth-star content is unavailable."}</p>;
  return <ValidNakshatra27Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidNakshatra27Client({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [date, setDate] = useState(""), [time, setTime] = useState(""), [zone, setZone] = useState("");
  const [unknownTime, setUnknownTime] = useState(false), [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false);
  const [occurrence, setOccurrence] = useState<"" | "earlier" | "later">(""), [choices, setChoices] = useState<NatalTimeChoice[]>([]);
  const [reading, setReading] = useState<NakshatraReadout | null>(null), [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const revision = useRef(0), resultHeading = useRef<HTMLHeadingElement>(null), ambiguityHeading = useRef<HTMLLegendElement>(null);
  const invalidate = useCallback(() => { revision.current++; setReading(null); setChoices([]); setOccurrence(""); setMessage(""); setManual(""); setBusy(false); }, []);
  const clear = useCallback(() => { invalidate(); setDate(""); setTime(""); setZone(""); setConfirmed(false); setUnknownTime(false); }, [invalidate]);
  useEffect(() => {
    const cancelPending = () => { revision.current++; };
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { cancelPending(); window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (reading) resultHeading.current?.focus(); }, [reading]);
  useEffect(() => { if (choices.length) ambiguityHeading.current?.focus(); }, [choices]);
  function error(result: Exclude<NakshatraResult, { status: "complete" | "choose-time" }>) {
    if (result.status === "unavailable") { setMessage(zh ? "计算暂不可用，没有生成替代出生宿。全部公开指南仍可阅读。" : "Calculation is unavailable; no substitute birth star was generated. All public guides remain available."); return; }
    const messages = {
      input: zh ? "无法读取当前输入，请清除后重新填写。" : "These inputs cannot be read. Clear them and enter the details again.",
      "known-time": zh ? "需要已知出生时间；不会代填中午。可以直接阅读全部27篇指南。" : "A known birth time is required; noon will not be substituted. Read all 27 guides without calculating.",
      date: zh ? "请输入完整且真实存在的公历日期。" : "Enter a complete Gregorian date that actually exists.",
      time: zh ? "请输入已知当地出生时间，使用24小时的小时与分钟。" : "Enter the known local birth time in 24-hour hours and minutes.",
      zone: zh ? "请输入出生地在该日期适用的IANA时区，例如Asia/Kolkata；不接受数字偏移代替。" : "Enter the birthplace’s IANA zone for that date, such as Asia/Kolkata; a numeric offset is not a substitute.",
      gap: zh ? "该当地钟表时间不存在，可能遇到夏令时跳时。请核对记录，不会自动平移时间。" : "That local clock time does not exist, possibly because of a daylight-saving jump. Check the record; the time will not be shifted.",
      occurrence: zh ? "请选择重复钟表时间中的第一次或第二次，再计算。" : "Choose the first or second occurrence of the repeated clock time, then calculate.",
      range: zh ? "当地出生日期须从1900年1月1日起。" : "The local birth date must be January 1, 1900 or later.",
      future: zh ? "解析的出生时刻晚于设备当前时刻，请核对日期、时间、时区与重复时间选择。" : "The resolved birth instant is later than this device’s current time. Check the date, time, zone and occurrence choice.",
      clock: zh ? "设备时钟无法用于计算，请检查后重试。" : "The device clock cannot be used for calculation. Check it and try again.",
      place: zh ? "请确认所填时区适用于出生地与该日期，不要直接使用设备当前时区。" : "Confirm that this zone applies to the birthplace and date; do not assume the device’s current zone.",
    };
    setMessage(messages[result.reason]);
  }
  async function calculate() {
    const current = ++revision.current;
    setReading(null); setMessage(""); setManual(""); setBusy(true);
    const values: NakshatraInput = { date, time, zone, knownTime: !unknownTime, placeConfirmed: confirmed, occurrence };
    try {
      const { calculateNakshatra } = await import("@/lib/questionnaires/nakshatra27Calculation");
      if (revision.current !== current) return;
      const result = calculateNakshatra(values, Date.now());
      if (result.status === "complete") { setReading(result.reading); setChoices([]); }
      else if (result.status === "choose-time") { setChoices(result.choices); setMessage(zh ? "该当地分钟发生两次，请依据原始记录选择。" : "That local minute occurred twice. Choose using the original record."); }
      else error(result);
    } catch { if (revision.current === current) setMessage(zh ? "计算模块暂不可用，输入未上传，也没有生成替代结果。" : "The calculation module is unavailable. Inputs were not uploaded and no substitute result was generated."); }
    finally { if (revision.current === current) setBusy(false); }
  }
  async function copy() {
    const value = nakshatraPublicLinks(quiz, locale), current = revision.current;
    try { await navigator.clipboard.writeText(value); if (revision.current === current) { setManual(""); setMessage(zh ? "已复制公开入口和27篇指南网址，不含出生资料或计算数值。" : "Copied the public calculator and 27 guide URLs, without birth details or calculated values."); } }
    catch { if (revision.current === current) { setManual(value); setMessage(zh ? "自动复制不可用，可手动复制下方公开网址。" : "Automatic copying is unavailable. Copy the public URLs below manually."); } }
  }
  return <section id="take-test" data-nakshatra-client aria-busy={!ready || busy} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7" aria-labelledby="nakshatra-input-title">
    <h2 id="nakshatra-input-title" className="text-2xl font-semibold">{zh ? "出生日期、已知时间与出生地时区" : "Birth date, known time and birthplace zone"}</h2>
    <p className="my-4 text-sm leading-7">{zh ? "输入与结果仅保留在本页内存；清除、离开、刷新或切换语言会移除。本工具不上传出生输入，不保存答卷，不统计开始、结果或分享动作。公开网址与图片只含固定指南内容。" : "Inputs and results stay in this page’s memory and are removed on clearing, leaving, reloading or changing language. This tool uploads no birth inputs, stores no attempt, and records no start, result or share activity. Public URLs and images contain only fixed guide content."}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{quiz.title[locale]}</legend>
      <div className="grid gap-5 sm:grid-cols-2"><label className="block font-semibold" htmlFor="nakshatra-date">{zh ? "当地公历出生日期" : "Local Gregorian birth date"}<input id="nakshatra-date" type="date" min="1900-01-01" autoComplete="off" value={date} className={inputClass} onChange={e => { invalidate(); setDate(e.target.value); }} /></label>
        <label className="block font-semibold" htmlFor="nakshatra-time">{zh ? "当地出生时间（24小时）" : "Local birth time (24-hour)"}<input id="nakshatra-time" type="time" step="60" autoComplete="off" disabled={unknownTime} value={time} className={inputClass} onChange={e => { invalidate(); setTime(e.target.value); }} /></label></div>
      <label className="flex min-h-12 items-start gap-3 leading-7"><input id="nakshatra-unknown" type="checkbox" checked={unknownTime} className="mt-1 size-5 shrink-0" onChange={e => { invalidate(); setUnknownTime(e.target.checked); if (e.target.checked) setTime(""); }} /><span>{zh ? "我不知道出生时间" : "I do not know the birth time"}</span></label>
      {unknownTime && <p data-nakshatra-unknown-notice className="rounded-lg bg-slate-50 p-4 leading-8">{zh ? "时间未知时不计算，不代填中午，也不根据人格选宿。全部27篇完整公开指南无需输入即可阅读。" : "No calculation is made without a known time. Noon is not substituted and a mansion is not selected from personality answers. All 27 full public guides remain available without inputs."}</p>}
      <label className="block font-semibold" htmlFor="nakshatra-zone-example">{zh ? "常见出生地时区示例（需自行核对）" : "Common birthplace-zone examples (verify before use)"}<select id="nakshatra-zone-example" value={zoneExamples.includes(zone) ? zone : ""} className={inputClass} onChange={e => { invalidate(); setZone(e.target.value); setConfirmed(false); }}><option value="">{zh ? "选择示例，或在下方自行填写" : "Choose an example or enter a zone below"}</option>{zoneExamples.map(z => <option key={z} value={z}>{z}</option>)}</select></label>
      <label className="block font-semibold" htmlFor="nakshatra-zone">{zh ? "出生地在该日期适用的IANA时区" : "Birthplace’s IANA time zone for that date"}<input id="nakshatra-zone" type="text" maxLength={128} autoComplete="off" spellCheck={false} placeholder="Asia/Kolkata" value={zone} className={inputClass} onChange={e => { invalidate(); setZone(e.target.value); setConfirmed(false); }} /></label>
      <p className="text-sm leading-7">{zh ? "地点通过其历史时区参与UTC换算，不按浏览器或语言猜测。该模型计算地心月球，不需要街道、经纬度或定位许可，也不计算上升点或宫位。1970年前的历史时区资料可能不完整，需核对原始记录。" : "The birthplace enters through its historical time zone when converting to UTC; browser and language settings are not guesses for it. This model calculates the geocentric Moon and needs no street address, coordinates or location permission. It does not calculate an Ascendant or houses. Pre-1970 zone records may be incomplete; check original records."}</p>
      <label className="flex min-h-12 items-start gap-3 leading-7"><input id="nakshatra-confirm" type="checkbox" checked={confirmed} className="mt-1 size-5 shrink-0" onChange={e => { invalidate(); setConfirmed(e.target.checked); }} /><span>{zh ? "我已核对该时区适用于出生地与出生日期。" : "I checked that this zone applies to the birthplace and birth date."}</span></label>
      {choices.length > 0 && <fieldset className="space-y-3 rounded-lg border border-amber-300 p-4"><legend tabIndex={-1} ref={ambiguityHeading} className="font-semibold">{zh ? "该当地分钟重复了两次" : "This local minute occurred twice"}</legend>{choices.map((c, i) => <label key={c.occurrence} className="flex min-h-12 items-start gap-3 leading-7"><input type="radio" name="nakshatra-occurrence" checked={occurrence === c.occurrence} value={c.occurrence} className="mt-1 size-5 shrink-0" onChange={() => { revision.current++; setOccurrence(c.occurrence); setReading(null); setBusy(false); setMessage(""); setManual(""); }} /><span>{zh ? (i === 0 ? "第一次" : "第二次") : (i === 0 ? "First occurrence" : "Second occurrence")} · UTC{c.offset} · {c.utc}{c.future && <span className="block">{zh ? "该时刻晚于设备当前时间。" : "This instant is later than the device clock."}</span>}</span></label>)}</fieldset>}
      <div className="flex flex-wrap gap-3"><button type="button" disabled={unknownTime || busy} onClick={calculate} className={buttonClass}>{zh ? "计算Spica参考出生宿" : "Calculate Spica-reference birth star"}</button><button type="button" onClick={clear} className={buttonClass}>{zh ? "清除输入与结果" : "Clear input and result"}</button></div>
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{!ready ? (zh ? "正在准备计算器，请稍候。" : "Preparing the calculator. Please wait.") : busy ? (zh ? "正在本页计算，输入不会上传。" : "Calculating on this page; inputs are not uploaded.") : message}</p>
    {reading && <section className="mt-7" aria-labelledby="nakshatra-result-title"><h2 ref={resultHeading} id="nakshatra-result-title" tabIndex={-1} className="mb-5 scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading![locale]}</h2><Nakshatra27Report quiz={quiz} reading={reading} locale={locale} /></section>}
    <button type="button" disabled={!ready} onClick={copy} className={buttonClass}>{zh ? "复制公开入口和全部指南网址" : "Copy public calculator and all guide URLs"}</button>
    {manual && <label className="mt-4 block leading-7">{zh ? "手动复制公开网址" : "Public URLs for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-40 w-full rounded-lg border border-slate-300 p-3" /></label>}
    <noscript><p>{zh ? "计算器需要JavaScript，全部公开指南仍可直接阅读。" : "Calculation needs JavaScript; all public guides remain directly readable."}</p></noscript>
  </section>;
}
