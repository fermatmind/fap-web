import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { NatalChartQuestionnaire, NatalSignProfile } from "@/lib/questionnaires/natalChart";
import type { NatalChartReadout } from "@/lib/questionnaires/natalChartCalculation";
import type { NatalBody, NatalCoordinate } from "@/lib/questionnaires/natalChartCoordinates";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { calculateNatalAspects } from "@/lib/questionnaires/natalChartAspects";
import { QuestionnaireReport } from "./QuestionnaireReport";

function coordinateLabel(quiz: NatalChartQuestionnaire, coordinate: NatalCoordinate, locale: Locale) {
  return `${quiz.profiles[coordinate.signIndex].signName[locale]} ${coordinate.displayDegrees.toFixed(1)}°`;
}

function NatalWheel({ quiz, chart, locale }: { quiz: NatalChartQuestionnaire; chart: NatalChartReadout; locale: Locale }) {
  const zh = locale === "zh";
  const point = (degrees: number, radius: number) => {
    const angle = (degrees - 90) * Math.PI / 180;
    return { x: 200 + radius * Math.cos(angle), y: 200 + radius * Math.sin(angle) };
  };
  return <figure className="mx-auto my-6 max-w-md">
    <svg viewBox="0 0 400 400" role="img" aria-label={zh ? "十天体回归黄道示意图；完整数值见下方表格" : "Ten-body tropical zodiac diagram; full values are in the following table"} className="h-auto w-full">
      <title>{zh ? "计算落点的黄道示意图" : "Zodiac diagram of calculated placements"}</title>
      <desc>{zh ? "白羊起点在上方，黄经顺时针增加。圆点编号对应数值表，径向分层仅便于阅读，不表示天体距离。" : "Aries begins at the top and longitude increases clockwise. Numbered dots match the table. Radial lanes aid reading and do not indicate celestial distances."}</desc>
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
    <figcaption className="text-sm leading-7 text-slate-600">{zh ? "数字1—10对应下表天体；内圈数字为整宫制宫位。示意图使用固定黄道方向，不是当地夜空地图；圆点可能重叠，以下表为准。" : "Numbers 1–10 match the bodies below; inner numbers are whole-sign houses. This fixed zodiac layout is not a local sky map. Dots may overlap; use the table for every value."}</figcaption>
  </figure>;
}

export function NatalChartAttribution({ quiz, locale }: { quiz: NatalChartQuestionnaire; locale: Locale }) {
  const zh = locale === "zh";
  return <section aria-labelledby="natal-attribution" className="my-8 space-y-4 text-sm leading-7 text-slate-600">
    <h2 id="natal-attribution" className="text-xl font-semibold text-slate-950">{zh ? "计算、符号与来源" : "Computation, symbols and sources"}</h2>
    <p>{zh ? "计算采用Astronomy Engine2.1.19（MIT）默认时标模型，民用时间解析采用Temporal polyfill0.5.1（ISC）；参考点来自IANA2026e公有领域表，浏览器时区规则可能使用不同版本的数据。天体采用视地心回归黄道位置，上升点通过真赤道与地平坐标变换求东方交点，宫位为整宫制。" : "Computation uses Astronomy Engine2.1.19 (MIT), with its default time-scale model, and Temporal polyfill0.5.1 (ISC) for civil time. Reference points come from IANA's public-domain2026e table; the browser may use a different time-zone data version. Positions are apparent geocentric tropical longitudes. The Ascendant is the eastern horizon intersection using true-equator/horizon rotations, with whole-sign houses."}</p>
    <p>{quiz.natalChart.boundaries.calculationVsMeaning[locale]}</p>
    <p>{zh ? "星座与天体资料只用于说明出版方的符号约定。正文、例子与反思问题由费马原创，不复制竞品报告，也不继承心理测量效度或作者背书。本版展示十天体落点、上升点、MC／IC／DSC、整宫制宫位、五类主要相位、视运动标签和符号读法，以及明示模型下的月交点、二体密切黑月莉莉丝与福点。" : "Sign and body references explain publisher conventions. FermatMind wrote the prose, scenes and reflection questions without copying a competitor report or claiming psychometric validation or author endorsement. This edition shows ten body placements, the Ascendant, MC/IC/DSC, whole-sign houses, five major aspects, apparent motion labels and symbolic readings. It also calculates lunar nodes, two-body osculating Black Moon Lilith and the Lot of Fortune under the named models."}</p>
    <details><summary className="cursor-pointer font-semibold">{zh ? "展开原始参考来源" : "Open original references"}</summary><ul className="mt-3 list-disc space-y-2 pl-5">{quiz.references.map(reference => <li key={reference.url}><a href={reference.url} className="underline">{reference.title[locale]}</a></li>)}</ul></details>
    <p><a className="underline" href="/licenses/natal-chart-third-party.txt">{zh ? "计算组件的版权与软件许可原文" : "Calculation software copyright and license notices"}</a></p>
  </section>;
}

export function NatalSignGuideBody({ profile, locale, idPrefix = "natal-sign" }: { profile: NatalSignProfile; locale: Locale; idPrefix?: string }) {
  return <QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix={idPrefix} />;
}

export function NatalAspectGuide({ quiz, locale }: { quiz: NatalChartQuestionnaire; locale: Locale }) {
  const zh = locale === "zh", aspects = quiz.natalChart.aspects;
  return <section data-natal-aspect-guide aria-labelledby="natal-aspect-guide-title" className="my-8 space-y-5 leading-8">
    <h2 id="natal-aspect-guide-title" className="text-2xl font-semibold">{zh ? "五类主要相位完整读法（无需出生资料）" : "Complete five-aspect reference, without birth information"}</h2>
    <p>{aspects.introduction[locale]}</p><p>{aspects.orbExplanation[locale]}</p><p data-natal-aspect-convention>{aspects.convention[locale]}</p>
    {aspects.readings.map(reading => <section key={reading.id} id={`natal-aspect-${reading.id}`} data-natal-aspect-definition={reading.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-semibold">{reading.name[locale]} · {reading.targetDegrees}°</h3><p className="mt-3 font-semibold">{reading.theme[locale]}</p>
      {reading.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
    </section>)}
  </section>;
}

export function NatalMotionGuide({ quiz, locale }: { quiz: NatalChartQuestionnaire; locale: Locale }) {
  return <section data-natal-motion-guide aria-labelledby="natal-motion-guide-title" className="my-8 space-y-4 leading-8">
    <h2 id="natal-motion-guide-title" className="text-2xl font-semibold">{quiz.natalChart.motion.name[locale]}</h2>
    {quiz.natalChart.motion.paragraphs.map((p, index) => <p key={index}>{p[locale]}</p>)}
  </section>;
}

export function NatalAnglesGuide({ quiz, locale }: { quiz: NatalChartQuestionnaire; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-natal-angles-guide aria-labelledby="natal-angles-guide-title" className="my-8 space-y-5 leading-8">
    <h2 id="natal-angles-guide-title" className="text-2xl font-semibold">{zh ? "MC、IC 与 DSC 完整参考（无需出生资料）" : "Complete MC, IC and DSC reference, without birth information"}</h2>
    <p>{quiz.natalChart.angles.methodReading[locale]}</p>
    {quiz.natalChart.angles.roles.map(role => <section key={role.id} id={`natal-angle-guide-${role.id}`} data-natal-angle-reference={role.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-semibold">{role.name[locale]}</h3><p className="mt-3 font-semibold">{role.topic[locale]}</p>
      {role.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
    </section>)}
  </section>;
}

export function NatalPointsGuide({ quiz, locale }: { quiz: NatalChartQuestionnaire; locale: Locale }) {
  const zh = locale === "zh", points = quiz.natalChart.points;
  return <section data-natal-points-guide aria-labelledby="natal-points-guide-title" className="my-8 space-y-5 leading-8">
    <h2 id="natal-points-guide-title" className="text-2xl font-semibold">{zh ? "四个数学点完整参考（无需出生资料）" : "Complete four-point reference, without birth information"}</h2>
    <h3 className="text-xl font-semibold">{points.name[locale]}</h3>{points.paragraphs.map((p, index) => <p key={index}>{p[locale]}</p>)}
    {points.roles.map(role => <section key={role.id} id={`natal-point-guide-${role.id}`} data-natal-point-reference={role.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-semibold">{role.name[locale]}</h3><p className="mt-3 font-semibold">{role.topic[locale]}</p>
      {role.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
    </section>)}
  </section>;
}

export function NatalChartReport({ quiz, chart, locale }: { quiz: NatalChartQuestionnaire; chart: NatalChartReadout; locale: Locale }) {
  const zh = locale === "zh", c = quiz.natalChart;
  const aspects = calculateNatalAspects(chart.placements);
  const degrees = (value: number) => `${(Math.floor(value * 10) / 10).toFixed(1)}°`;
  const bodyName = (id: string) => c.bodyRoles.find(role => role.id === id)!.name[locale];
  const motionCell = (body: NatalBody) => {
    const value = chart.motion[body], state = value.status === "computed" ? value.motion : "unavailable";
    const labels = { direct: zh ? "顺行" : "Direct", retrograde: zh ? "Rx · 视逆行" : "Rx · Apparent retrograde", "near-stationary": zh ? "接近停滞" : "Near-stationary", unavailable: zh ? "不可用" : "Unavailable" };
    return <td data-natal-motion={body} data-natal-motion-state={state} className="border-b border-slate-200 p-3">{labels[state]}</td>;
  };
  const signContext = (coordinate: NatalCoordinate, role: string) => quiz.profiles[coordinate.signIndex].sections.find(section => section.id === role)!;
  const roleCard = (placement: NatalChartReadout["placements"][number], primary: boolean) => {
    const role = c.bodyRoles.find(item => item.id === placement.body)!, profile = quiz.profiles[placement.coordinate.signIndex];
    const context = signContext(placement.coordinate, primary ? placement.body : "symbol");
    const house = placement.house === null ? null : c.houseContexts[placement.house - 1];
    return <section key={placement.body} id={`natal-body-role-${placement.body}`} data-natal-body-reading={placement.body} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 leading-8">
      <h3 className="text-xl font-semibold">{role.name[locale]} · {coordinateLabel(quiz, placement.coordinate, locale)}</h3>
      <p className="my-3 font-semibold">{role.topic[locale]}</p>
      {role.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
      <h4 className="mt-5 font-semibold">{context.title[locale]}</h4>{context.paragraphs.map((p, index) => <p key={index} className="mt-3">{p[locale]}</p>)}
      {house && <><h4 className="mt-5 font-semibold">{zh ? `整宫制第${house.number}宫` : `Whole-sign house${house.number}`} · {house.topic[locale]}</h4><p className="mt-3">{house.reading[locale]}</p></>}
      <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? `阅读${profile.signName.zh}的完整六节解释` : `Read all six sections of the ${profile.signName.en} guide`}</Link>
    </section>;
  };
  return <div data-natal-result className="space-y-8">
    <p className="leading-8">{zh ? `本次采用UTC ${chart.utc}，当地偏移${chart.offset}。这些是本页内存中的私人计算数值，不会加入公开链接。` : `This calculation uses UTC ${chart.utc}, local offset${chart.offset}. These private values stay in this page's memory and are excluded from public links.`}</p>
    {chart.before1970 && <p data-natal-history-warning className="rounded-lg border border-amber-300 bg-amber-50 p-4 leading-8">{c.boundaries.timezone[locale]}</p>}
    <p className="leading-8">{c.boundaries.rounding[locale]}</p>
    {chart.ascendant.status === "unavailable" && <p data-natal-angle-unavailable role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 leading-8">{zh ? "该坐标与时刻无法确定本版本要求的唯一东方上升点。十天体位置和计数保留，上升点与全部宫位不可用，不补造角度。" : "This time and location do not provide a unique eastern rising point under this version's method. The ten body positions and counts remain available; the Ascendant and all houses are unavailable, without a substituted angle."}</p>}
    <NatalWheel quiz={quiz} chart={chart} locale={locale} />
    <h3 id="natal-placements-title" className="text-xl font-semibold">{zh ? "十天体位置、视运动、角点与数学点" : "Ten body positions, apparent motion, angles and mathematical points"}</h3>
    <p className="text-sm leading-7">{zh ? "窄屏可横向滚动表格，查看全部列。视运动的数值约定见下方公开方法说明。" : "On narrow screens, scroll the table horizontally to see every column. The numerical motion convention is explained in the public method below."}</p>
    <div className="overflow-x-auto" role="region" tabIndex={0} aria-label={zh ? "天体位置、视运动与宫位表" : "Body positions, apparent motion and houses table"}><table aria-labelledby="natal-placements-title" className="min-w-max w-full border-collapse text-left text-sm leading-7" data-natal-table>
      <thead><tr>{[zh ? "天体／点" : "Body / point", zh ? "星座内度数" : "Degrees within sign", zh ? "视运动" : "Apparent motion", zh ? "整宫制宫位" : "Whole-sign house"].map((label, index) => <th key={label} scope="col" className={`border-b border-slate-300 p-3${index === 0 ? " sticky left-0 z-20 bg-white" : ""}`}>{label}</th>)}</tr></thead>
      <tbody>{chart.placements.map((p, index) => <tr key={p.body} data-natal-body={p.body}><th scope="row" className="sticky left-0 z-10 border-b border-slate-200 bg-white p-3">{index + 1}. {bodyName(p.body)}</th><td className="border-b border-slate-200 p-3">{coordinateLabel(quiz, p.coordinate, locale)}{p.coordinate.nearDisplayBoundary && <span className="block text-xs">{zh ? "距星座边界小于一个显示步长" : "Within one display step of a sign boundary"}</span>}</td>{motionCell(p.body)}<td className="border-b border-slate-200 p-3">{p.house ?? (zh ? "不可用" : "Unavailable")}</td></tr>)}
        <tr data-natal-ascendant><th scope="row" className="sticky left-0 z-10 bg-white p-3">{zh ? "上升点 ASC" : "Ascendant ASC"}</th><td className="p-3">{chart.ascendant.status === "computed" ? coordinateLabel(quiz, chart.ascendant.coordinate, locale) : (zh ? "不可用" : "Unavailable")}</td><td className="p-3">{zh ? "不适用" : "Not applicable"}</td><td className="p-3">{chart.ascendant.status === "computed" ? "1" : (zh ? "不可用" : "Unavailable")}</td></tr>
        {c.angles.roles.map(role => {
          const angle = chart.angles[role.id];
          return <tr key={role.id} data-natal-angle={role.id}><th scope="row" className="sticky left-0 z-10 border-b border-slate-200 bg-white p-3">{role.name[locale]}</th><td className="border-b border-slate-200 p-3">{angle.status === "computed" ? coordinateLabel(quiz, angle.coordinate, locale) : (zh ? "不可用" : "Unavailable")}</td><td className="border-b border-slate-200 p-3">{zh ? "不适用" : "Not applicable"}</td><td data-natal-angle-house className="border-b border-slate-200 p-3">{angle.status === "computed" && angle.house !== null ? angle.house : (zh ? "不可用" : "Unavailable")}</td></tr>;
        })}
        {c.points.roles.map(role => {
          const point = chart.points[role.id];
          return <tr key={role.id} data-natal-point={role.id}><th scope="row" className="sticky left-0 z-10 border-b border-slate-200 bg-white p-3">{role.name[locale]}</th><td className="border-b border-slate-200 p-3">{point.status === "computed" ? coordinateLabel(quiz, point.coordinate, locale) : (zh ? "不可用" : "Unavailable")}</td><td className="border-b border-slate-200 p-3">{zh ? "不适用" : "Not applicable"}</td><td data-natal-point-house className="border-b border-slate-200 p-3">{point.status === "computed" && point.house !== null ? point.house : (zh ? "不可用" : "Unavailable")}</td></tr>;
        })}
      </tbody></table></div>
    <section aria-labelledby="natal-aspects-title" data-natal-aspects className="space-y-4 leading-8">
      <h3 id="natal-aspects-title" className="text-2xl font-semibold">{zh ? "本次十天体主要相位" : "This chart’s major ten-body aspects"}</h3>
      <p>{c.aspects.convention[locale]}</p>
      {aspects.status === "unavailable" ? <p role="status" data-natal-aspects-unavailable>{zh ? "完整十天体黄经不可用，无法计算相位；不显示部分列表。" : "The complete ten-body longitudes are unavailable, so aspects cannot be calculated. No partial list is shown."}</p> : <>
        <p data-natal-aspects-summary>{zh ? `已比较${aspects.comparisons}个无序对，按本页规则纳入${aspects.aspects.length}对。` : `Compared ${aspects.comparisons} unordered pairs; ${aspects.aspects.length} meet this page’s rule.`}</p>
        {aspects.aspects.length === 0 ? <p data-natal-aspects-empty>{zh ? "没有天体对符合这项角度与容许度约定。这不表示某种能力、关系或经历缺失。" : "No pair meets these angle and orb conventions. This does not mean an ability, relationship or experience is missing."}</p> : <ol className="space-y-4">{aspects.aspects.map(aspect => {
          const reading = c.aspects.readings.find(item => item.id === aspect.type)!;
          return <li key={aspect.id} data-natal-aspect-pair={aspect.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <h4 className="font-semibold"><a className="underline" href={`#natal-aspect-${aspect.type}`}>{reading.name[locale]} · {aspect.targetDegrees}°</a></h4>
            <ul className="mt-2 space-y-2">{[aspect.first, aspect.second].map(body => {
              const placement = chart.placements.find(item => item.body === body)!;
              return <li key={body}><a className="inline-block min-h-11 py-2 underline" href={`#natal-body-role-${body}`}>{bodyName(body)}</a>{" · "}<Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, placement.coordinate.sign)}>{coordinateLabel(quiz, placement.coordinate, locale)}</Link></li>;
            })}</ul>
            <dl className="mt-2"><div><dt className="inline">{zh ? "实际黄经间距：" : "Longitude separation: "}</dt><dd data-natal-aspect-separation className="inline">{degrees(aspect.separationDegrees)}</dd></div><div><dt className="inline">{zh ? "容许度：" : "Orb: "}</dt><dd data-natal-aspect-orb className="inline">{degrees(aspect.orbDegrees)}</dd></div></dl>
          </li>;
        })}</ol>}
      </>}
    </section>
    <section aria-labelledby="natal-inventory" className="space-y-4 leading-8"><h3 id="natal-inventory" className="text-xl font-semibold">{zh ? "十天体元素与性质计数" : "Ten-body element and modality counts"}</h3><p>{c.inventoryReading.definition[locale]}</p>
      <div className="grid gap-5 sm:grid-cols-2"><dl className="rounded-lg bg-slate-50 p-4">{([ ["fire", "Fire", "火"], ["earth", "Earth", "土"], ["air", "Air", "风"], ["water", "Water", "水"] ] as const).map(([key, en, cn]) => <div key={key} className="flex justify-between"><dt>{zh ? cn : en}</dt><dd data-natal-element={key}>{chart.inventory.elements[key]}</dd></div>)}</dl><dl className="rounded-lg bg-slate-50 p-4">{([ ["cardinal", "Cardinal", "基本"], ["fixed", "Fixed", "固定"], ["mutable", "Mutable", "变动"] ] as const).map(([key, en, cn]) => <div key={key} className="flex justify-between"><dt>{zh ? cn : en}</dt><dd data-natal-modality={key}>{chart.inventory.modalities[key]}</dd></div>)}</dl></div><p>{c.inventoryReading.zero[locale]}</p>
    </section>
    <section aria-labelledby="natal-three" className="space-y-5"><h3 id="natal-three" className="text-2xl font-semibold">{zh ? "本次太阳、月亮与上升读法" : "This chart's Sun, Moon and rising readings"}</h3>
      {chart.placements.slice(0, 2).map(p => roleCard(p, true))}
      {chart.ascendant.status === "computed" && <section data-natal-rising-reading className="rounded-lg border border-slate-200 bg-white p-5 leading-8"><h3 className="text-xl font-semibold">{zh ? "上升" : "Rising"} · {coordinateLabel(quiz, chart.ascendant.coordinate, locale)}</h3>{c.ascendantRole.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}<h4 className="mt-5 font-semibold">{signContext(chart.ascendant.coordinate, "ascendant").title[locale]}</h4>{signContext(chart.ascendant.coordinate, "ascendant").paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}<Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, chart.ascendant.coordinate.sign)}>{zh ? "阅读这个星座的完整解释" : "Read the complete sign guide"}</Link></section>}
    </section>
    <section aria-labelledby="natal-other-bodies" className="space-y-5"><h3 id="natal-other-bodies" className="text-2xl font-semibold">{zh ? "其他八天体：角色、符号与宫位" : "The other eight bodies: role, symbol and house"}</h3>{chart.placements.slice(2).map(p => roleCard(p, false))}</section>
    <section aria-labelledby="natal-additional-angle-readings" className="space-y-5 leading-8"><h3 id="natal-additional-angle-readings" className="text-2xl font-semibold">{zh ? "本次 MC、IC 与 DSC 读法" : "This chart’s MC, IC and DSC readings"}</h3>
      {!Object.values(chart.angles).some(angle => angle.status === "computed") && <p data-natal-no-angles>{zh ? "本次没有可用的额外角点，请参照上表状态；公开角点说明仍可阅读。" : "No additional angle is available for this calculation. Use the table’s states; the public angle reference remains available."}</p>}
      {c.angles.roles.map(role => {
        const angle = chart.angles[role.id]; if (angle.status !== "computed") return null;
        const profile = quiz.profiles[angle.coordinate.signIndex], context = profile.sections.find(section => section.id === "symbol")!;
        const house = angle.house === null ? null : c.houseContexts[angle.house - 1];
        return <section key={role.id} data-natal-angle-reading={role.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
          <h4 className="text-xl font-semibold">{role.name[locale]} · {coordinateLabel(quiz, angle.coordinate, locale)}</h4><p className="mt-3 font-semibold">{role.topic[locale]}</p>
          {role.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}
          <h5 className="mt-5 font-semibold">{context.title[locale]}</h5>{context.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}
          {house ? <><h5 className="mt-5 font-semibold">{zh ? `整宫制第${house.number}宫` : `Whole-sign house ${house.number}`} · {house.topic[locale]}</h5><p className="mt-3">{house.reading[locale]}</p></> : <p className="mt-3">{zh ? "整宫制宫位不可用；不代填宫位。" : "The whole-sign house is unavailable; no house is substituted."}</p>}
          <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这个星座的完整解释" : "Read the complete sign guide"}</Link>{" · "}<a className="inline-block min-h-11 py-2 underline" href={`#natal-angle-guide-${role.id}`}>{zh ? "阅读角点角色参考" : "Read the angle-role reference"}</a>
        </section>;
      })}
    </section>
    <section aria-labelledby="natal-point-readings-title" data-natal-point-readings className="space-y-5 leading-8"><h3 id="natal-point-readings-title" className="text-2xl font-semibold">{zh ? "本次数学点读法" : "This chart’s mathematical-point readings"}</h3>
      {Object.values(chart.points).some(point => point.status === "unavailable") && <p data-natal-point-unavailable role="status">{zh ? "不可用的数学点不生成个人读法，也不补造坐标。公开模型与角色参考仍可阅读。" : "Unavailable mathematical points do not receive a personal reading or substituted coordinate. The public model and role references remain available."}</p>}
      {c.points.roles.map(role => {
        const point = chart.points[role.id]; if (point.status !== "computed") return null;
        const profile = quiz.profiles[point.coordinate.signIndex], context = profile.sections.find(section => section.id === "symbol")!;
        const house = point.house === null ? null : c.houseContexts[point.house - 1];
        return <section key={role.id} data-natal-point-reading={role.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5">
          <h4 className="text-xl font-semibold">{role.name[locale]} · {coordinateLabel(quiz, point.coordinate, locale)}</h4><p className="mt-3 font-semibold">{role.topic[locale]}</p>
          {point.period && <p className="mt-3" data-natal-fortune-period={point.period}>{zh ? (point.period === "day" ? "本次采用数值昼间公式" : "本次采用数值夜间公式") : (point.period === "day" ? "This calculation uses the numerical day formula" : "This calculation uses the numerical night formula")}</p>}
          {role.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}
          <h5 className="mt-5 font-semibold">{context.title[locale]}</h5>{context.paragraphs.map((p, index) => <p className="mt-3" key={index}>{p[locale]}</p>)}
          {house ? <><h5 className="mt-5 font-semibold">{zh ? `整宫制第${house.number}宫` : `Whole-sign house ${house.number}`} · {house.topic[locale]}</h5><p className="mt-3">{house.reading[locale]}</p></> : <p className="mt-3">{zh ? "整宫制宫位不可用；不代填宫位。" : "The whole-sign house is unavailable; no house is substituted."}</p>}
          <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这个星座的完整解释" : "Read the complete sign guide"}</Link>{" · "}<a className="inline-block min-h-11 py-2 underline" href={`#natal-point-guide-${role.id}`}>{zh ? "阅读数学点角色参考" : "Read the mathematical-point role reference"}</a>
        </section>;
      })}
    </section>
    <p className="leading-8">{c.boundaries.calculationVsMeaning[locale]}</p>
  </div>;
}
