import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { NakshatraReadout } from "@/lib/questionnaires/nakshatra27Calculation";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

const degrees = (n: number) => `${(Math.floor(n * 100) / 100).toFixed(2)}°`;
export function Nakshatra27Report({ quiz, reading: r, locale }: { quiz: Questionnaire; reading: NakshatraReadout; locale: Locale }) {
  const zh = locale === "zh";
  const profiles = quiz.profiles.filter(profile => r.profileIds.includes(profile.id as typeof r.id));
  const fields = [
    [zh ? "已解析UTC时刻" : "Resolved UTC instant", r.utc], [zh ? "出生地时区与偏移" : "Birthplace zone and offset", `${r.zone} · UTC${r.offset}`],
    [zh ? "地心月球黄经（日期真黄道）" : "Geocentric Moon longitude (true ecliptic of date)", degrees(r.moonLongitude)],
    [zh ? "固定J2000角宿一参考黄经" : "Fixed-J2000 Spica reference longitude", degrees(r.spicaLongitude)],
    [zh ? "本口径岁差偏移" : "This model’s ayanamsa", degrees(r.ayanamsa)],
    [zh ? "Spica参考恒星黄经" : "Spica-reference sidereal longitude", degrees(r.referenceLongitude)],
    [zh ? "未舍入落点所属区段" : "Sector containing the unrounded position", `${r.index + 1} / 27 · ${r.id}`],
    [zh ? "区段内度数与四分区" : "Degrees within sector and pada", `${degrees(r.degreeWithin)} · ${r.pada} / 4`],
    [zh ? "离最近宿边界" : "Distance to nearest mansion boundary", degrees(r.boundaryDistance)],
  ];
  return <div data-nakshatra-report className="space-y-7">
    <section aria-labelledby="nakshatra-summary-title" className="grid gap-5 rounded-xl border border-sky-200 bg-sky-50 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-sky-900">{zh ? "Spica 参考模型" : "Spica-reference model"}</p>
        <h3 id="nakshatra-summary-title" className="mt-2 text-xl font-semibold text-sky-950">{r.comparison ? (zh ? "靠近边界，保留两篇读法" : "Near a boundary, with two readings") : (zh ? "本次区段的文化读法" : "Cultural reading for this sector")}</h3>
        <ul className="mt-3 space-y-2">{profiles.map(profile => <li key={profile.id}><a className="inline-block min-h-11 py-2 font-medium underline" href={`#nakshatra-reading-${profile.id}`}>{profile.title[locale]}</a></li>)}</ul>
      </div>
      <div className="min-w-0 border-t border-sky-200 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <dl className="space-y-3">
          <div><dt className="text-sm font-medium">{zh ? "参考恒星黄经" : "Reference sidereal longitude"}</dt><dd className="text-xl font-semibold tabular-nums text-sky-950">{degrees(r.referenceLongitude)}</dd></div>
          <div><dt className="text-sm font-medium">{zh ? "离最近区段边界" : "Distance to nearest sector boundary"}</dt><dd className="text-xl font-semibold tabular-nums text-sky-950">{degrees(r.boundaryDistance)}</dd></div>
        </dl>
        <p className="mt-3 text-sm leading-6 text-slate-700">{r.comparison ? (zh ? "两篇相邻文化读法并列，可直接选择阅读。" : "Both adjacent cultural readings are available on equal terms.") : (zh ? "坐标供核对，文化读法用于理解传统符号。" : "The coordinate is for checking; the reading explains the traditional symbol.")}</p>
        <a className="mt-1 inline-block min-h-11 py-2 underline" href="#nakshatra-calculation-details">{zh ? "查看完整计算口径" : "View full calculation conventions"}</a>
      </div>
    </section>
    {r.before1970 && <p data-nakshatra-history className="rounded-lg bg-amber-50 p-4 leading-8">{zh ? "该记录早于1970年，历史民用时间资料与设备时区库可能不完整或有差异。请核对当时当地记录；本工具无法替你确认历史时区。" : "This record predates 1970. Historical civil-time records and device time-zone data may be incomplete or differ. Check the location’s records for that date; this tool cannot certify the historical zone."}</p>}
    {profiles.map(p => <section data-nakshatra-profile={p.id} key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby={`nakshatra-reading-${p.id}`}><h3 id={`nakshatra-reading-${p.id}`} className="mb-5 scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{p.title[locale]}</h3><QuestionnaireResultReading quizSlug={quiz.slug} profile={p} locale={locale} headingLevel={4} idPrefix={`nakshatra-result-${p.id}`} mode="result" previewSectionIds={["reading-3", "reading-6"]} /><Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, p.id)} className="mt-5 inline-block min-h-11 py-2 underline">{zh ? "阅读这篇公开指南" : "Read this public guide"}</Link></section>)}

    <details className="border-t border-slate-200 pt-3"><summary id="nakshatra-calculation-details" className="min-h-11 scroll-mt-24 cursor-pointer py-2 font-semibold">{zh ? "查看出生时刻、坐标与完整计算口径" : "View birth time, coordinates and full calculation conventions"}</summary>
<p className="rounded-lg bg-violet-50 p-4 leading-8">{zh ? "这是明确标注的Spica参考几何模型，不声称等同精确Lahiri、Swiss True Chitra或印度气象局历书。数字是坐标，传统符号与下方原创场景是文化读法，不是人格测量或预言。" : "This is an explicitly labeled geometric Spica-reference model. It is not certified as exact Lahiri, Swiss True Chitra or an IMD almanac. Numbers describe coordinates; traditional symbols and the original scenes below are cultural readings, not personality measurements or predictions."}</p>
<dl className="grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="font-semibold leading-7">{label}</dt><dd className="mt-1 leading-7 [overflow-wrap:anywhere]">{value}</dd></div>)}</dl>
<p data-nakshatra-boundary className="leading-8">{r.comparison ? (zh ? "本落点距宿边界不超过0.25°，同时保留相邻两篇完整解释，不强认唯一出生宿。这是网站比较窗口，不是经过校准的置信区间，也不能覆盖未知出生时间或所有计算口径差异。" : "This position lies within 0.25° of a mansion boundary. Both adjacent full readings remain visible, without asserting one certain birth star. This website comparison window is not a calibrated confidence interval and cannot cover an unknown birth time or every difference between calculation conventions.") : (zh ? "落点在本网站0.25°边界比较窗口之外，呈现本区段的一篇完整解释。这仍不能保证出生记录或其他岁差口径给出同一宿。" : "The position is outside this website’s 0.25° boundary comparison window, so one full sector reading appears. This does not guarantee the birth record or another ayanamsa convention gives the same mansion.")}</p>
<p className="text-sm leading-7">{zh ? "先按未舍入位置分区，再向下截取至两位小数显示。四分区只是该宿的四等分，不生成四种人格。地点只用于把当地钟表时间解析为UTC，不用于地平视差、宫位或上升点。" : "Sectors are assigned from unrounded positions, then displayed degrees are truncated to two decimals. Padas divide each mansion into four; they do not create four personality types. The location zone resolves civil time to UTC, without topocentric parallax, houses or an Ascendant."}</p>
    </details>
  </div>;
}
