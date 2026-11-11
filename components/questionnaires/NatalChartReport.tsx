import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { NatalChartQuestionnaire, NatalSignProfile } from "@/lib/questionnaires/natalChart";
import type { NatalChartReadout } from "@/lib/questionnaires/natalChartCalculation";
import type { NatalBody, NatalCoordinate } from "@/lib/questionnaires/natalChartCoordinates";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { calculateNatalAspects } from "@/lib/questionnaires/natalChartAspects";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

function coordinateLabel(quiz: NatalChartQuestionnaire, coordinate: NatalCoordinate, locale: Locale) {
  return `${quiz.profiles[coordinate.signIndex].signName[locale]} ${coordinate.displayDegrees.toFixed(1)}°`;
}

function NatalWheel({ quiz, chart, locale, displayCopy }: { quiz: NatalChartQuestionnaire; chart: NatalChartReadout; locale: Locale; displayCopy?: (text: string) => string }) {
  const displayText = (text: string) => displayCopy?.(text) ?? text;
  const zh = locale === "zh";
  const point = (degrees: number, radius: number) => {
    const angle = (degrees - 90) * Math.PI / 180;
    return { x: 200 + radius * Math.cos(angle), y: 200 + radius * Math.sin(angle) };
  };
  return <figure className="mx-auto w-full max-w-[24rem]">
    <svg viewBox="0 0 400 400" role="img" aria-label={zh ? displayText("十天体回归黄道示意图；完整数值见下方表格") : "Ten-body tropical zodiac diagram; full values are in the following table"} className="h-auto w-full">
      <title>{zh ? displayText("计算落点的黄道示意图") : "Zodiac diagram of calculated placements"}</title>
      <desc>{zh ? displayText("白羊起点在上方，黄经顺时针增加。圆点编号对应数值表，径向分层仅便于阅读，不表示天体距离。") : "Aries begins at the top and longitude increases clockwise. Numbered dots match the table. Radial lanes aid reading and do not indicate celestial distances."}</desc>
      <circle cx="200" cy="200" r="156" fill="#faf5ff" stroke="#7c3aed" />
      {quiz.profiles.map((profile, index) => {
        const edge = point(index * 30, 156), label = point(index * 30 + 15, 178), houseLabel = point(index * 30 + 15, 138);
        const house = chart.ascendant.status === "computed" ? (index - chart.ascendant.coordinate.signIndex + 12) % 12 + 1 : null;
        return <g key={profile.id}>
          <line x1="200" y1="200" x2={edge.x} y2={edge.y} stroke="#ddd6fe" />
          <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize="11">{zh ? profile.signName.zh.replace("座", "") : profile.signName.en.slice(0, 3)}</text>
          {house !== null && <text x={houseLabel.x} y={houseLabel.y} textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="10">{house}</text>}
        </g>;
      })}
      {chart.placements.map((placement, index) => {
        const p = point(placement.coordinate.longitude, [50, 74, 98, 122][index % 4]);
        return <g key={placement.body}><circle cx={p.x} cy={p.y} r="10" fill="#5b21b6" /><text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#ffffff">{index + 1}</text></g>;
      })}
      {chart.ascendant.status === "computed" && (() => {
        const p = point(chart.ascendant.coordinate.longitude, 156);
        return <g><circle cx={p.x} cy={p.y} r="12" fill="#ffffff" stroke="#5b21b6" strokeWidth="2" /><text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#1e293b">ASC</text></g>;
      })()}
    </svg>
    <figcaption className="text-sm leading-7 text-slate-600">{zh ? displayText("数字1—10对应下表天体；内圈数字为整宫制宫位。示意图使用固定黄道方向，不是当地夜空地图；圆点可能重叠，以下表为准。") : "Numbers 1–10 match the bodies below; inner numbers are whole-sign houses. This fixed zodiac layout is not a local sky map. Dots may overlap; use the table for every value."}</figcaption>
  </figure>;
}

export function NatalChartAttribution({ quiz, locale, displayCopy }: { quiz: NatalChartQuestionnaire; locale: Locale; displayCopy?: (text: string) => string }) {
  const displayText = (text: string) => displayCopy?.(text) ?? text;
  const zh = locale === "zh";
  return <section aria-labelledby="natal-attribution" className="my-8 space-y-4 text-sm leading-7 text-slate-600">
    <h2 id="natal-attribution" className="text-xl font-semibold text-slate-950">{zh ? displayText("计算、符号与来源") : "Computation, symbols and sources"}</h2>
    <p>{zh ? displayText("计算采用Astronomy Engine2.1.19（MIT）默认时标模型，民用时间解析采用Temporal polyfill0.5.1（ISC）；参考点来自IANA2026e公有领域表，浏览器时区规则可能使用不同版本的数据。天体采用视地心回归黄道位置，上升点通过真赤道与地平坐标变换求东方交点，宫位为整宫制。") : "Computation uses Astronomy Engine2.1.19 (MIT), with its default time-scale model, and Temporal polyfill0.5.1 (ISC) for civil time. Reference points come from IANA's public-domain2026e table; the browser may use a different time-zone data version. Positions are apparent geocentric tropical longitudes. The Ascendant is the eastern horizon intersection using true-equator/horizon rotations, with whole-sign houses."}</p>
    <p>{quiz.natalChart.boundaries.calculationVsMeaning[locale]}</p>
    <p>{zh ? displayText("星座与天体资料只用于说明出版方的符号约定。正文、例子与反思问题由费马原创，不复制竞品报告，也不继承心理测量效度或作者背书。本版展示十天体落点、上升点、MC／IC／DSC、整宫制宫位、五类主要相位、视运动标签和符号读法，以及明示模型下的月交点、二体密切黑月莉莉丝与福点。") : "Sign and body references explain publisher conventions. FermatMind wrote the prose, scenes and reflection questions without copying a competitor report or claiming psychometric validation or author endorsement. This edition shows ten body placements, the Ascendant, MC/IC/DSC, whole-sign houses, five major aspects, apparent motion labels and symbolic readings. It also calculates lunar nodes, two-body osculating Black Moon Lilith and the Lot of Fortune under the named models."}</p>
    <details><summary className="cursor-pointer font-semibold">{zh ? displayText("展开原始参考来源") : "Open original references"}</summary><ul className="mt-3 list-disc space-y-2 pl-5">{quiz.references.map(reference => <li key={reference.url}><a href={reference.url} className="underline">{reference.title[locale]}</a></li>)}</ul></details>
    <p><a className="underline" href="/licenses/natal-chart-third-party.txt">{zh ? displayText("计算组件的版权与软件许可原文") : "Calculation software copyright and license notices"}</a></p>
  </section>;
}

export function NatalSignGuideBody({ profile, locale, idPrefix = "natal-sign", displayCopy }: { profile: NatalSignProfile; locale: Locale; idPrefix?: string; displayCopy?: (text: string) => string }) {
  return <QuestionnaireResultReading quizSlug="natal-chart" profile={profile} locale={locale} headingLevel={2} idPrefix={idPrefix} traditional={Boolean(displayCopy)} />;
}

export function NatalAspectGuide({ quiz, locale, displayCopy }: { quiz: NatalChartQuestionnaire; locale: Locale; displayCopy?: (text: string) => string }) {
  const displayText = (text: string) => displayCopy?.(text) ?? text;
  const zh = locale === "zh", aspects = quiz.natalChart.aspects;
  return <section data-natal-aspect-guide aria-labelledby="natal-aspect-guide-title" className="my-8 space-y-5 leading-8">
    <h2 id="natal-aspect-guide-title" className="text-xl font-semibold leading-snug sm:text-2xl">{zh ? displayText("五类主要相位完整读法（无需出生资料）") : "Complete five-aspect reference, without birth information"}</h2>
    <p>{aspects.introduction[locale]}</p><p>{aspects.orbExplanation[locale]}</p><p data-natal-aspect-convention>{aspects.convention[locale]}</p>
    {aspects.readings.map(reading => <section key={reading.id} id={`natal-aspect-${reading.id}`} data-natal-aspect-definition={reading.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-semibold">{reading.name[locale]} · {reading.targetDegrees}°</h3><p className="mt-3 font-semibold">{reading.theme[locale]}</p>
      {reading.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
    </section>)}
  </section>;
}

export function NatalMotionGuide({ quiz, locale }: { quiz: NatalChartQuestionnaire; locale: Locale }) {
  return <section data-natal-motion-guide aria-labelledby="natal-motion-guide-title" className="my-8 space-y-4 leading-8">
    <h2 id="natal-motion-guide-title" className="text-xl font-semibold leading-snug sm:text-2xl">{quiz.natalChart.motion.name[locale]}</h2>
    {quiz.natalChart.motion.paragraphs.map((p, index) => <p key={index}>{p[locale]}</p>)}
  </section>;
}

export function NatalAnglesGuide({ quiz, locale, displayCopy }: { quiz: NatalChartQuestionnaire; locale: Locale; displayCopy?: (text: string) => string }) {
  const displayText = (text: string) => displayCopy?.(text) ?? text;
  const zh = locale === "zh";
  return <section data-natal-angles-guide aria-labelledby="natal-angles-guide-title" className="my-8 space-y-5 leading-8">
    <h2 id="natal-angles-guide-title" className="text-xl font-semibold leading-snug sm:text-2xl">{zh ? displayText("MC、IC 与 DSC 完整参考（无需出生资料）") : "Complete MC, IC and DSC reference, without birth information"}</h2>
    <p>{quiz.natalChart.angles.methodReading[locale]}</p>
    {quiz.natalChart.angles.roles.map(role => <section key={role.id} id={`natal-angle-guide-${role.id}`} data-natal-angle-reference={role.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-semibold">{role.name[locale]}</h3><p className="mt-3 font-semibold">{role.topic[locale]}</p>
      {role.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
    </section>)}
  </section>;
}

export function NatalPointsGuide({ quiz, locale, displayCopy }: { quiz: NatalChartQuestionnaire; locale: Locale; displayCopy?: (text: string) => string }) {
  const displayText = (text: string) => displayCopy?.(text) ?? text;
  const zh = locale === "zh", points = quiz.natalChart.points;
  return <section data-natal-points-guide aria-labelledby="natal-points-guide-title" className="my-8 space-y-5 leading-8">
    <h2 id="natal-points-guide-title" className="text-xl font-semibold leading-snug sm:text-2xl">{zh ? displayText("四个数学点完整参考（无需出生资料）") : "Complete four-point reference, without birth information"}</h2>
    <h3 className="text-xl font-semibold">{points.name[locale]}</h3>{points.paragraphs.map((p, index) => <p key={index}>{p[locale]}</p>)}
    {points.roles.map(role => <section key={role.id} id={`natal-point-guide-${role.id}`} data-natal-point-reference={role.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-semibold">{role.name[locale]}</h3><p className="mt-3 font-semibold">{role.topic[locale]}</p>
      {role.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
    </section>)}
  </section>;
}

export function NatalChartReport({ quiz, chart, locale, readingProfiles, displayCopy }: { quiz: NatalChartQuestionnaire; chart: NatalChartReadout; locale: Locale; readingProfiles?: readonly NatalSignProfile[]; displayCopy?: (text: string) => string }) {
  const displayText = (text: string) => displayCopy?.(text) ?? text;
  const zh = locale === "zh", c = quiz.natalChart;
  const aspects = calculateNatalAspects(chart.placements);
  const degrees = (value: number) => `${(Math.floor(value * 10) / 10).toFixed(1)}°`;
  const bodyName = (id: string) => c.bodyRoles.find(role => role.id === id)!.name[locale];
  const motionCell = (body: NatalBody) => {
    const value = chart.motion[body], state = value.status === "computed" ? value.motion : "unavailable";
    const labels = { direct: zh ? displayText("顺行") : "Direct", retrograde: zh ? displayText("Rx · 视逆行") : "Rx · Apparent retrograde", "near-stationary": zh ? displayText("接近停滞") : "Near-stationary", unavailable: zh ? displayText("不可用") : "Unavailable" };
    return <td data-natal-motion={body} data-natal-motion-state={state} className="border-b border-slate-200 p-3">{labels[state]}</td>;
  };
  const projected = (profile: NatalSignProfile) => readingProfiles?.find(item => item.id === profile.id && item.element === profile.element && item.modality === profile.modality && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === profile.id) ?? profile;
  const signContext = (coordinate: NatalCoordinate, role: string) => projected(quiz.profiles[coordinate.signIndex]).sections.find(section => section.id === role)!;
  const roleCard = (placement: NatalChartReadout["placements"][number], primary: boolean) => {
    const role = c.bodyRoles.find(item => item.id === placement.body)!, profile = quiz.profiles[placement.coordinate.signIndex];
    const context = signContext(placement.coordinate, primary ? placement.body : "symbol");
    const house = placement.house === null ? null : c.houseContexts[placement.house - 1];
    return <section key={placement.body} id={`natal-body-role-${placement.body}`} data-natal-body-reading={placement.body} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 leading-8">
      <h3 className="text-xl font-semibold">{role.name[locale]} · {coordinateLabel(quiz, placement.coordinate, locale)}</h3>
      <p className="my-3 font-semibold">{role.topic[locale]}</p>
      {role.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
      <h4 className="mt-5 font-semibold">{context.title[locale]}</h4>{context.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
      {house && <><h4 className="mt-5 font-semibold">{zh ? displayText(`整宫制第${house.number}宫`) : `Whole-sign house${house.number}`} · {house.topic[locale]}</h4><p className="mt-3">{house.reading[locale]}</p></>}
      <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayCopy ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText(`阅读${profile.signName.zh}的完整六节解释`) : `Read all six sections of the ${profile.signName.en} guide`}</Link>
    </section>;
  };
  return <div data-natal-result className="space-y-8">
    {chart.before1970 && <p data-natal-history-warning className="rounded-lg border border-amber-300 bg-amber-50 p-4 leading-8">{c.boundaries.timezone[locale]}</p>}
    {chart.ascendant.status === "unavailable" && <p data-natal-angle-unavailable role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 leading-8">{zh ? displayText("该坐标与时刻无法确定本版本要求的唯一东方上升点。十天体位置和计数保留，上升点与全部宫位不可用，不补造角度。") : "This time and location do not provide a unique eastern rising point under this version's method. The ten body positions and counts remain available; the Ascendant and all houses are unavailable, without a substituted angle."}</p>}
    <section aria-labelledby="natal-summary-title" className="overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/70">
      <div className="grid items-center gap-5 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-indigo-900">{zh ? displayText("回归黄道 · 整宫制") : "Tropical zodiac · Whole-sign houses"}</p>
          <h3 id="natal-summary-title" className="mt-2 text-xl font-semibold text-indigo-950">{zh ? displayText("太阳、月亮与上升") : "Sun, Moon and rising"}</h3>
          <dl className="mt-4 divide-y divide-indigo-200">
            {chart.placements.slice(0, 2).map(placement => <div key={placement.body} className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
              <dt>{bodyName(placement.body)}</dt><dd className="font-semibold tabular-nums"><a className="inline-block min-h-11 py-2 underline" href={`#natal-body-role-${placement.body}`}>{coordinateLabel(quiz, placement.coordinate, locale)}</a></dd>
            </div>)}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
              <dt>{zh ? displayText("上升") : "Rising"}</dt><dd className="font-semibold tabular-nums">{chart.ascendant.status === "computed" ? <a className="inline-block min-h-11 py-2 underline" href="#natal-rising-reading">{coordinateLabel(quiz, chart.ascendant.coordinate, locale)}</a> : (zh ? displayText("不可用") : "Unavailable")}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm leading-6 text-slate-700">{zh ? displayText("可点开上方落点的符号读法，或向下核对全部计算位置。") : "Open the symbolic reading for a position above, or review all calculated positions below."}</p>
          <a className="mt-2 inline-block min-h-11 py-2 font-medium underline" href="#natal-placements-title">{zh ? displayText("查看完整位置表") : "View the full placements table"}</a>
        </div>
        <NatalWheel quiz={quiz} chart={chart} locale={locale} displayCopy={displayCopy} />
      </div>
      <details className="border-t border-indigo-200 bg-white px-4 py-1 sm:px-6">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("本次时区与坐标显示规则") : "Time zone and coordinate display"}</summary>
        <p className="text-sm leading-7">{zh ? displayText(`本次采用 UTC ${chart.utc}，当地偏移 ${chart.offset}。这些计算数值只留当前页面，公开链接仅指向参考指南。`) : `This calculation uses UTC ${chart.utc}, local offset ${chart.offset}. The values stay on this page. Public links point to the reference guides.`}</p>
        <p className="pb-3 text-sm leading-7">{c.boundaries.rounding[locale]}</p>
      </details>
    </section>
    <h3 id="natal-placements-title" className="scroll-mt-24 text-xl font-semibold">{zh ? displayText("十天体位置、视运动、角点与数学点") : "Ten body positions, apparent motion, angles and mathematical points"}</h3>
    <p className="text-sm leading-7">{zh ? displayText("窄屏可横向滚动表格，查看全部列。视运动的数值约定见下方公开方法说明。") : "On narrow screens, scroll the table horizontally to see every column. The numerical motion convention is explained in the public method below."}</p>
    <div className="overflow-x-auto" role="region" tabIndex={0} aria-label={zh ? displayText("天体位置、视运动与宫位表") : "Body positions, apparent motion and houses table"}><table aria-labelledby="natal-placements-title" className="min-w-max w-full border-collapse text-left text-sm leading-7" data-natal-table>
      <thead><tr>{[zh ? displayText("天体／点") : "Body / point", zh ? displayText("星座内度数") : "Degrees within sign", zh ? displayText("视运动") : "Apparent motion", zh ? displayText("整宫制宫位") : "Whole-sign house"].map((label, index) => <th key={label} scope="col" className={`border-b border-slate-300 p-3${index === 0 ? " sticky left-0 z-20 bg-white" : ""}`}>{label}</th>)}</tr></thead>
      <tbody>{chart.placements.map((p, index) => <tr key={p.body} data-natal-body={p.body}><th scope="row" className="sticky left-0 z-10 border-b border-slate-200 bg-white p-3">{index + 1}. {bodyName(p.body)}</th><td className="border-b border-slate-200 p-3">{coordinateLabel(quiz, p.coordinate, locale)}{p.coordinate.nearDisplayBoundary && <span className="block text-xs">{zh ? displayText("距星座边界小于一个显示步长") : "Within one display step of a sign boundary"}</span>}</td>{motionCell(p.body)}<td className="border-b border-slate-200 p-3">{p.house ?? (zh ? displayText("不可用") : "Unavailable")}</td></tr>)}
        <tr data-natal-ascendant><th scope="row" className="sticky left-0 z-10 bg-white p-3">{zh ? displayText("上升点 ASC") : "Ascendant ASC"}</th><td className="p-3">{chart.ascendant.status === "computed" ? coordinateLabel(quiz, chart.ascendant.coordinate, locale) : (zh ? displayText("不可用") : "Unavailable")}</td><td className="p-3">{zh ? displayText("不适用") : "Not applicable"}</td><td className="p-3">{chart.ascendant.status === "computed" ? "1" : (zh ? displayText("不可用") : "Unavailable")}</td></tr>
        {c.angles.roles.map(role => {
          const angle = chart.angles[role.id];
          return <tr key={role.id} data-natal-angle={role.id}><th scope="row" className="sticky left-0 z-10 border-b border-slate-200 bg-white p-3">{role.name[locale]}</th><td className="border-b border-slate-200 p-3">{angle.status === "computed" ? coordinateLabel(quiz, angle.coordinate, locale) : (zh ? displayText("不可用") : "Unavailable")}</td><td className="border-b border-slate-200 p-3">{zh ? displayText("不适用") : "Not applicable"}</td><td data-natal-angle-house className="border-b border-slate-200 p-3">{angle.status === "computed" && angle.house !== null ? angle.house : (zh ? displayText("不可用") : "Unavailable")}</td></tr>;
        })}
        {c.points.roles.map(role => {
          const point = chart.points[role.id];
          return <tr key={role.id} data-natal-point={role.id}><th scope="row" className="sticky left-0 z-10 border-b border-slate-200 bg-white p-3">{role.name[locale]}</th><td className="border-b border-slate-200 p-3">{point.status === "computed" ? coordinateLabel(quiz, point.coordinate, locale) : (zh ? displayText("不可用") : "Unavailable")}</td><td className="border-b border-slate-200 p-3">{zh ? displayText("不适用") : "Not applicable"}</td><td data-natal-point-house className="border-b border-slate-200 p-3">{point.status === "computed" && point.house !== null ? point.house : (zh ? displayText("不可用") : "Unavailable")}</td></tr>;
        })}
      </tbody></table></div>
    <section aria-labelledby="natal-aspects-title" data-natal-aspects className="space-y-4 leading-8">
      <h3 id="natal-aspects-title" className="text-xl font-semibold leading-snug sm:text-2xl">{zh ? displayText("本次十天体主要相位") : "This chart’s major ten-body aspects"}</h3>
      <p>{c.aspects.convention[locale]}</p>
      {aspects.status === "unavailable" ? <p role="status" data-natal-aspects-unavailable>{zh ? displayText("完整十天体黄经不可用，无法计算相位；不显示部分列表。") : "The complete ten-body longitudes are unavailable, so aspects cannot be calculated. No partial list is shown."}</p> : <>
        <p data-natal-aspects-summary>{zh ? displayText(`已比较${aspects.comparisons}个无序对，按本页规则纳入${aspects.aspects.length}对。`) : `Compared ${aspects.comparisons} unordered pairs; ${aspects.aspects.length} meet this page’s rule.`}</p>
        {aspects.aspects.length === 0 ? <p data-natal-aspects-empty>{zh ? displayText("没有天体对符合这项角度与容许度约定。这不表示某种能力、关系或经历缺失。") : "No pair meets these angle and orb conventions. This does not mean an ability, relationship or experience is missing."}</p> : <ol className="space-y-4">{aspects.aspects.map(aspect => {
          const reading = c.aspects.readings.find(item => item.id === aspect.type)!;
          return <li key={aspect.id} data-natal-aspect-pair={aspect.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <h4 className="font-semibold"><a className="underline" href={`#natal-aspect-${aspect.type}`}>{reading.name[locale]} · {aspect.targetDegrees}°</a></h4>
            <ul className="mt-2 space-y-2">{[aspect.first, aspect.second].map(body => {
              const placement = chart.placements.find(item => item.body === body)!;
              return <li key={body}><a className="inline-block min-h-11 py-2 underline" href={`#natal-body-role-${body}`}>{bodyName(body)}</a>{" · "}<Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayCopy ? "zh-TW" : locale, quiz.slug, placement.coordinate.sign)}>{coordinateLabel(quiz, placement.coordinate, locale)}</Link></li>;
            })}</ul>
            <dl className="mt-2"><div><dt className="inline">{zh ? displayText("实际黄经间距：") : "Longitude separation: "}</dt><dd data-natal-aspect-separation className="inline">{degrees(aspect.separationDegrees)}</dd></div><div><dt className="inline">{zh ? displayText("容许度：") : "Orb: "}</dt><dd data-natal-aspect-orb className="inline">{degrees(aspect.orbDegrees)}</dd></div></dl>
          </li>;
        })}</ol>}
      </>}
    </section>
    <section aria-labelledby="natal-inventory" className="space-y-4 leading-8"><h3 id="natal-inventory" className="text-xl font-semibold">{zh ? displayText("十天体元素与性质计数") : "Ten-body element and modality counts"}</h3><p>{c.inventoryReading.definition[locale]}</p>
      <div className="grid gap-5 sm:grid-cols-2"><dl className="rounded-lg bg-slate-50 p-4">{([ ["fire", "Fire", "火"], ["earth", "Earth", "土"], ["air", "Air", "风"], ["water", "Water", "水"] ] as const).map(([key, en, cn]) => <div key={key} className="flex justify-between"><dt>{zh ? cn : en}</dt><dd data-natal-element={key}>{chart.inventory.elements[key]}</dd></div>)}</dl><dl className="rounded-lg bg-slate-50 p-4">{([ ["cardinal", "Cardinal", "基本"], ["fixed", "Fixed", "固定"], ["mutable", "Mutable", "变动"] ] as const).map(([key, en, cn]) => <div key={key} className="flex justify-between"><dt>{zh ? cn : en}</dt><dd data-natal-modality={key}>{chart.inventory.modalities[key]}</dd></div>)}</dl></div><p>{c.inventoryReading.zero[locale]}</p>
    </section>
    <section aria-labelledby="natal-three" className="space-y-5"><h3 id="natal-three" className="text-xl font-semibold leading-snug sm:text-2xl">{zh ? displayText("本次太阳、月亮与上升读法") : "This chart's Sun, Moon and rising readings"}</h3>
      {chart.placements.slice(0, 2).map(p => roleCard(p, true))}
      {chart.ascendant.status === "computed" && <section id="natal-rising-reading" data-natal-rising-reading className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 leading-8"><h3 className="text-xl font-semibold">{zh ? displayText("上升") : "Rising"} · {coordinateLabel(quiz, chart.ascendant.coordinate, locale)}</h3>{c.ascendantRole.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}<h4 className="mt-5 font-semibold">{signContext(chart.ascendant.coordinate, "ascendant").title[locale]}</h4>{signContext(chart.ascendant.coordinate, "ascendant").paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}<Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayCopy ? "zh-TW" : locale, quiz.slug, chart.ascendant.coordinate.sign)}>{zh ? displayText("阅读这个星座的完整解释") : "Read the complete sign guide"}</Link></section>}
    </section>
    <section aria-labelledby="natal-other-bodies" className="space-y-5"><h3 id="natal-other-bodies" className="text-xl font-semibold leading-snug sm:text-2xl">{zh ? displayText("其他八天体：角色、符号与宫位") : "The other eight bodies: role, symbol and house"}</h3>{chart.placements.slice(2).map(p => roleCard(p, false))}</section>
    <section aria-labelledby="natal-additional-angle-readings" className="space-y-5 leading-8"><h3 id="natal-additional-angle-readings" className="text-xl font-semibold leading-snug sm:text-2xl">{zh ? displayText("本次 MC、IC 与 DSC 读法") : "This chart’s MC, IC and DSC readings"}</h3>
      {!Object.values(chart.angles).some(angle => angle.status === "computed") && <p data-natal-no-angles>{zh ? displayText("本次没有可用的额外角点，请参照上表状态；公开角点说明仍可阅读。") : "No additional angle is available for this calculation. Use the table’s states; the public angle reference remains available."}</p>}
      {c.angles.roles.map(role => {
        const angle = chart.angles[role.id]; if (angle.status !== "computed") return null;
        const profile = quiz.profiles[angle.coordinate.signIndex], context = projected(profile).sections.find(section => section.id === "symbol")!;
        const house = angle.house === null ? null : c.houseContexts[angle.house - 1];
        return <section key={role.id} data-natal-angle-reading={role.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
          <h4 className="text-xl font-semibold">{role.name[locale]} · {coordinateLabel(quiz, angle.coordinate, locale)}</h4><p className="mt-3 font-semibold">{role.topic[locale]}</p>
          {role.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}
          <h5 className="mt-5 font-semibold">{context.title[locale]}</h5>{context.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}
          {house ? <><h5 className="mt-5 font-semibold">{zh ? displayText(`整宫制第${house.number}宫`) : `Whole-sign house ${house.number}`} · {house.topic[locale]}</h5><p className="mt-3">{house.reading[locale]}</p></> : <p className="mt-3">{zh ? displayText("整宫制宫位不可用；不代填宫位。") : "The whole-sign house is unavailable; no house is substituted."}</p>}
          <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayCopy ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("阅读这个星座的完整解释") : "Read the complete sign guide"}</Link>{" · "}<a className="inline-block min-h-11 py-2 underline" href={`#natal-angle-guide-${role.id}`}>{zh ? displayText("阅读角点角色参考") : "Read the angle-role reference"}</a>
        </section>;
      })}
    </section>
    <section aria-labelledby="natal-point-readings-title" data-natal-point-readings className="space-y-5 leading-8"><h3 id="natal-point-readings-title" className="text-xl font-semibold leading-snug sm:text-2xl">{zh ? displayText("本次数学点读法") : "This chart’s mathematical-point readings"}</h3>
      {Object.values(chart.points).some(point => point.status === "unavailable") && <p data-natal-point-unavailable role="status">{zh ? displayText("不可用的数学点不生成个人读法，也不补造坐标。公开模型与角色参考仍可阅读。") : "Unavailable mathematical points do not receive a personal reading or substituted coordinate. The public model and role references remain available."}</p>}
      {c.points.roles.map(role => {
        const point = chart.points[role.id]; if (point.status !== "computed") return null;
        const profile = quiz.profiles[point.coordinate.signIndex], context = projected(profile).sections.find(section => section.id === "symbol")!;
        const house = point.house === null ? null : c.houseContexts[point.house - 1];
        return <section key={role.id} data-natal-point-reading={role.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
          <h4 className="text-xl font-semibold">{role.name[locale]} · {coordinateLabel(quiz, point.coordinate, locale)}</h4><p className="mt-3 font-semibold">{role.topic[locale]}</p>
          {point.period && <p className="mt-3" data-natal-fortune-period={point.period}>{zh ? (point.period === "day" ? "本次采用数值昼间公式" : "本次采用数值夜间公式") : (point.period === "day" ? "This calculation uses the numerical day formula" : "This calculation uses the numerical night formula")}</p>}
          {role.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}
          <h5 className="mt-5 font-semibold">{context.title[locale]}</h5>{context.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}
          {house ? <><h5 className="mt-5 font-semibold">{zh ? displayText(`整宫制第${house.number}宫`) : `Whole-sign house ${house.number}`} · {house.topic[locale]}</h5><p className="mt-3">{house.reading[locale]}</p></> : <p className="mt-3">{zh ? displayText("整宫制宫位不可用；不代填宫位。") : "The whole-sign house is unavailable; no house is substituted."}</p>}
          <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayCopy ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("阅读这个星座的完整解释") : "Read the complete sign guide"}</Link>{" · "}<a className="inline-block min-h-11 py-2 underline" href={`#natal-point-guide-${role.id}`}>{zh ? displayText("阅读数学点角色参考") : "Read the mathematical-point role reference"}</a>
        </section>;
      })}
    </section>
    <p className="leading-8">{c.boundaries.calculationVsMeaning[locale]}</p>
  </div>;
}
