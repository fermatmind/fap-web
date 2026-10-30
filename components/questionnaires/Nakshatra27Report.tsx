import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { NakshatraReadout } from "@/lib/questionnaires/nakshatra27Calculation";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

const degrees = (n: number) => `${(Math.floor(n * 100) / 100).toFixed(2)}°`;
export function Nakshatra27Report({ quiz, reading: r, locale }: { quiz: Questionnaire; reading: NakshatraReadout; locale: Locale }) {
  const zh = locale === "zh";
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
    <p className="rounded-lg bg-violet-50 p-4 leading-8">{zh ? "这是明确标注的Spica参考几何模型，不声称等同精确Lahiri、Swiss True Chitra或印度气象局历书。数字是坐标，传统符号与下方原创场景是文化读法，不是人格测量或预言。" : "This is an explicitly labeled geometric Spica-reference model. It is not certified as exact Lahiri, Swiss True Chitra or an IMD almanac. Numbers describe coordinates; traditional symbols and the original scenes below are cultural readings, not personality measurements or predictions."}</p>
    <dl className="space-y-4 rounded-lg border border-slate-200 p-4">{fields.map(([label, value]) => <div key={label}><dt className="font-semibold leading-7">{label}</dt><dd className="mt-1 leading-7">{value}</dd></div>)}</dl>
    <p data-nakshatra-boundary className="leading-8">{r.comparison ? (zh ? "本落点距宿边界不超过0.25°，同时保留相邻两篇完整解释，不强认唯一出生宿。这是网站比较窗口，不是经过校准的置信区间，也不能覆盖未知出生时间或所有计算口径差异。" : "This position lies within 0.25° of a mansion boundary. Both adjacent full readings remain visible, without asserting one certain birth star. This website comparison window is not a calibrated confidence interval and cannot cover an unknown birth time or every difference between calculation conventions.") : (zh ? "落点在本网站0.25°边界比较窗口之外，呈现本区段的一篇完整解释。这仍不能保证出生记录或其他岁差口径给出同一宿。" : "The position is outside this website’s 0.25° boundary comparison window, so one full sector reading appears. This does not guarantee the birth record or another ayanamsa convention gives the same mansion.")}</p>
    <p className="text-sm leading-7">{zh ? "先按未舍入位置分区，再向下截取至两位小数显示。四分区只是该宿的四等分，不生成四种人格。地点只用于把当地钟表时间解析为UTC，不用于地平视差、宫位或上升点。" : "Sectors are assigned from unrounded positions, then displayed degrees are truncated to two decimals. Padas divide each mansion into four; they do not create four personality types. The location zone resolves civil time to UTC, without topocentric parallax, houses or an Ascendant."}</p>
    {r.before1970 && <p data-nakshatra-history className="rounded-lg bg-amber-50 p-4 leading-8">{zh ? "该记录早于1970年，历史民用时间资料与设备时区库可能不完整或有差异。请核对当时当地记录；本工具无法替你确认历史时区。" : "This record predates 1970. Historical civil-time records and device time-zone data may be incomplete or differ. Check the location’s records for that date; this tool cannot certify the historical zone."}</p>}
    {quiz.profiles.filter(p => r.profileIds.includes(p.id as typeof r.id)).map(p => <section data-nakshatra-profile={p.id} key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h3><QuestionnaireReport profile={p} locale={locale} headingLevel={4} idPrefix={`nakshatra-result-${p.id}`} /><Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, p.id)} className="mt-5 inline-block min-h-11 py-2 underline">{zh ? "阅读这篇公开指南" : "Read this public guide"}</Link></section>)}
  </div>;
}
