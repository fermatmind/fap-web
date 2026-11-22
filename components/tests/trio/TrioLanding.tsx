import Image from "next/image";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import { getMbtiResultPortrait } from "@/lib/mbti/resultPortrait";
import { assessmentLandingPaths, getLocalizedLanding } from "@/lib/tests/localized-landings";
import type { LocalizedLandingKind, LocalizedLandingLocale, LocalizedLandingProfile } from "@/lib/tests/localized-landings/types";
import { landingUi, sectionHeadings } from "@/lib/tests/localized-landings/ui";
import { loadLocalizedSamples, localizedSamplePath } from "@/lib/tests/localized-landings/samples";
import { mbtiFunctionStacks } from "@/lib/mbti/landingTypeDynamics";
import { ArrowDown, ArrowRight, ArrowUpRight, ChartNoAxesColumn, GitCompareArrows, Map } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { newSampleLinks } from "@/lib/tests/extendedAssessmentLanding";
import type { LandingFaq } from "@/lib/tests/mbtiLandingEditorial";
import { loadTrioSamples, trioProfiles, trioRoutes, type TrioKind } from "@/lib/tests/trioLanding";
import { MatrixExercise, TrioExplorer, TrioSample, TrioStart, TrioSticky, type Entry } from "./TrioLandingInteractions";
import styles from "./trio-landing.module.css";

const valueIcons = [ChartNoAxesColumn, GitCompareArrows, Map];
const selectorRows = [
  ["big5","大五人格","探索五种连续倾向","90 题 · 约 11 分钟","想读懂习惯与性格差异"],
  ["enneagram","九型人格","对照行为背后的动机","105 题 · 约 12 分钟","想辨认关系和压力下的反应"],
  ["iq","智商测试","观察本次图形或综合推理表现","30 题 · 约 20 分钟；另有 40 题","想体验矩阵、数字或文字推理"],
] as const;
const extendedRows = [
  ["jung","荣格十二原型","探索近期角色与动机","48 题 · 约 10 分钟","想比较在不同场合采用的角色"],
  ["disc","DISC 行为风格","回顾推进与协作方式","24 题 · 约 5 分钟","想观察沟通和协作时的先手"],
  ["eq","情商测试","反思情绪与关系","60 题 · 约 10 分钟","想练习觉察、调节和沟通"],
] as const;
const sampleLinks = {...newSampleLinks,big5:"/zh/reports/samples/big5", iq:"/zh/reports/samples/iq30", enneagram:"/zh/reports/samples/enneagram"};

type LegacyProps = {kind: TrioKind; title: string; locale?: undefined};
type LocalizedProps = {kind: LocalizedLandingKind; title?: undefined; locale: LocalizedLandingLocale; localizedProfile?: LocalizedLandingProfile};

export async function TrioLanding(props: (LegacyProps | LocalizedProps) & {
  entries: Entry[]; faq: LandingFaq[]; additional?: ReactNode; report?: ReactNode; explorer?: ReactNode;
  entryNote?: string;
}) {
  const {kind, locale, entries, faq, additional, report, explorer, entryNote} = props;
  const profile = locale ? (props.localizedProfile ?? getLocalizedLanding(locale, kind)) : trioProfiles[kind];
  const local = locale ? (props.localizedProfile ?? getLocalizedLanding(locale, kind)) : null;
  const ui = locale ? landingUi[locale] : null;
  const sampleSet = report ? [] : locale && local ? await loadLocalizedSamples(kind, locale, local) : await loadTrioSamples(kind as TrioKind);
  const active = entries.filter(entry=>entry.href);
  const primary = active[0];
  const comparison = extendedRows.some(row=>row[0]===kind) ? extendedRows : selectorRows;
  const hrefFor = (path: string) => {
    if (!locale || !path.startsWith("/")) return path;
    if (/^\/personality\//u.test(path)) return `/${locale}${path}`;
    return displayNavigationPath(path, locale);
  };
  const relatedKinds = kind === "mbti" || kind === "holland" || kind === "career"
    ? ["mbti", "holland", "career"] as const
    : comparison.map(([id]) => id);
  const localizedComparison = locale ? relatedKinds.map(id => {
    const option = getLocalizedLanding(locale, id);
    return [id, option.name, option.subheading, option.facts.slice(0, 2).map(([, value]) => value).join(" · "), option.scenarios[0][1]] as const;
  }) : null;
  const headings = sectionHeadings[kind];
  const resultHeading = locale ? headings[locale === "en" ? 0 : 2] : "做完之后，可以看到什么？";
  const scenarioHeading = locale ? headings[locale === "en" ? 1 : 3] : kind === "iq" ? "把结果变成下一次练习" : "把结果用在真实生活里";

  return <div className={styles.page} data-trio-landing={kind} data-landing-locale={locale}>
    <header className={styles.hero} id="what-it-is">
      <div className={styles.wrap}>
        <nav aria-label={ui?.breadcrumbs ?? "面包屑"} className={styles.breadcrumb}><Link href={`/${locale ?? "zh"}`}>{ui?.home ?? "首页"}</Link><span aria-hidden>/</span><Link href={`/${locale ?? "zh"}/${kind === "career" ? "career" : "tests"}`}>
          {kind === "career" ? locale === "en" ? "Careers" : "職涯" : (ui?.tests ?? "测试")}</Link><span aria-hidden>/</span><span aria-current="page">{profile.name}</span></nav>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} id="choose-version">
            <h1>{local?.h1 ?? props.title}{local ? (local.headline && <span>{local.headline}</span>) : <span>{profile.subheading}</span>}</h1>
            <p className={styles.heroLead}>{profile.hero}</p>
            <dl className={styles.facts}>{profile.facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <div className={styles.heroActions} id={kind === "disc" ? "take-test" : undefined}>
              {active.map((entry,index) => <TrioStart key={entry.testId} identify className={index === 0 ? styles.cta : styles.secondary} entry={entry}/>) }
              {active.length === 0 ? <p>{ui?.unavailable ?? "作答入口暂不可用。"}</p> : null}
              {kind !== "iq" ? <a className={styles.secondary} href="#trio-exploration">{ui?.explore ?? `先了解${profile.name}`} <ArrowDown size={16} aria-hidden /></a> : null}
            </div>
            {entryNote && <p className={styles.entryNote}>{entryNote}</p>}
          </div>
          {report ?? <TrioSample kind={kind} locale={locale} sampleSet={sampleSet} sampleLink={locale ? localizedSamplePath(kind, locale) : sampleLinks[kind as TrioKind]}/>}
        </div>
      </div>
    </header>

    <section className={`${styles.wrap} ${styles.section}`} id="how-it-works" aria-labelledby="trio-results">
      <h2 id="trio-results">{resultHeading}</h2>
      <p className={styles.lead}>{profile.intro}</p>
      <div className={styles.valueGrid}>{profile.benefits.map(([heading, body, href],index) => {
        const Icon = valueIcons[index];
        return <article key={heading}><Icon size={24} aria-hidden/><h3>{heading}</h3><p>{body}</p>{href && <Link className={styles.detailLink} href={hrefFor(href)} prefetch={false}>{ui?.related ?? "打开相关内容"} <ArrowRight size={15} aria-hidden /></Link>}</article>;
      })}</div>
      {kind === "career" && locale && <Link className={`${styles.detailLink} ${styles.sampleFollowup}`} href={localizedSamplePath(kind, locale)} prefetch={false}>
        {locale === "en" ? "Read the full sample interest report" : "閱讀完整興趣報告範例（簡體中文）"} <ArrowUpRight size={15} aria-hidden />
      </Link>}
    </section>

    <section className={styles.insight} id="trio-insight" aria-labelledby="trio-insight-heading">
      <div className={`${styles.wrap} ${styles.section} ${styles.insightGrid}`}>
        <div><h2 id="trio-insight-heading">{profile.insight[0]}</h2><p className={styles.lead}>{profile.insight[1]}</p></div>
        {explorer ?? (kind === "iq" ? <MatrixExercise locale={locale}/> : <TrioExplorer locale={locale} kind={kind} items={profile.explorer}/>)}
      </div>
    </section>

    <section className={`${styles.wrap} ${styles.section}`} id="trio-exploration" aria-labelledby="trio-matrix-heading">
      {kind === "jung" && <span id="archetypes" />}
      <div className={styles.sectionHeading}>
        <div><h2 id="trio-matrix-heading">{profile.matrix[0]}</h2><p className={styles.lead}>{profile.matrix[1]}</p></div>
        <Link className={styles.detailLink} href={hrefFor(profile.link[1])} prefetch={false}>{profile.link[0]} <ArrowRight size={17} aria-hidden/></Link>
      </div>
      <div className={styles.matrix}>{profile.cards.map(([code,heading,body,href])=>{
        const target = href ?? (kind === "enneagram" ? `/personality/enneagram/type-${code}` : null);
        const portrait = local && kind === "mbti" ? getMbtiResultPortrait(code) : null;
        const stack = local && kind === "mbti" ? mbtiFunctionStacks[code as keyof typeof mbtiFunctionStacks] : null;
        return <article key={code} data-card-code={code}>{portrait && <Image className={styles.typePortrait} src={portrait} alt="" loading="lazy" width={72} height={104}/>}<span className={styles.badge} aria-hidden>{code}</span><h3>{heading}</h3><p>{body}</p>{stack && <p className={styles.functionStack}>{stack.join(" · ")}</p>}{target && <Link className={styles.detailLink} href={locale ? hrefFor(target) : (href ?? `/zh${target}`)} prefetch={false} aria-label={ui ? `${ui.read} · ${heading}` : undefined}>{ui?.read ?? `了解${heading.split(" · ")[0]}`} <ArrowUpRight size={15} aria-hidden/></Link>}</article>;
      })}</div>
    </section>

    <section className={styles.scenario} aria-labelledby="trio-scenario-heading">
      <div className={`${styles.wrap} ${styles.section}`}>
        <h2 id="trio-scenario-heading">{scenarioHeading}</h2>
        <div className={styles.valueGrid}>{profile.scenarios.map(([number,heading,body,href]) => <article key={heading}>
          <span className={styles.scenarioNumber} aria-hidden>{number}</span><h3>{heading}</h3><p>{body}</p>{href && <Link className={styles.detailLink} href={hrefFor(href)} prefetch={false}>{ui?.next ?? "继续探索"} <ArrowRight size={15} aria-hidden/></Link>}
        </article>)}</div>
      </div>
    </section>

    <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="trio-choice-heading">
      <h2 id="trio-choice-heading">{ui?.compare ?? "不同测评，怎么选？"}</h2>
      <div className={styles.tableWrap} tabIndex={0} aria-label={ui?.table ?? "测评对照表，可横向滚动"}>
        <table>
          <thead><tr>{(ui?.columns ?? ["测评", "想解决什么问题", "题量与用时", "适合谁"]).map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{(localizedComparison ?? comparison).map(([id,name,goal,time,audience]) => <tr key={id} data-current={id===kind}><th scope="row">{id===kind ? name : <Link href={locale ? hrefFor(assessmentLandingPaths[id]) : trioRoutes[id as TrioKind]} prefetch={false}>{name}</Link>}</th><td>{goal}</td><td>{time}</td><td>{audience}</td></tr>)}</tbody>
        </table>
      </div>
    </section>

    {faq.length > 0 ? <section className={`${styles.wrap} ${styles.section} ${styles.faq}`} id="faq" aria-labelledby="trio-faq-heading">
      {kind === "jung" && <div id="assessment-faq" />}
      <h2 id="trio-faq-heading">{ui?.faq ?? "常见问题"}</h2>
      {faq.map(({q,a},index)=><details key={q} open={kind === "career" || index < 3}><summary>{q}<span aria-hidden /></summary><p>{a}</p></details>)}
    </section> : null}

    <section className={styles.science} id="trio-method" aria-labelledby="trio-method-heading">
      <div className={`${styles.wrap} ${styles.section}`}>
        <h2 id="trio-method-heading">{ui?.method ?? "计分方法与结果边界"}</h2>
        <div className={styles.valueGrid}>{profile.science.map(([heading,body,href])=><article key={heading}><h3>{heading}</h3><p>{body}</p>{href && <Link className={styles.detailLink} href={hrefFor(href)} prefetch={false}>{ui?.related ?? "查看相关说明"} <ArrowRight size={15} aria-hidden/></Link>}</article>)}</div>
        {!locale && kind === "enneagram" ? <Link className={styles.detailLink} href={trioRoutes.enneagram+"/technical-note"} prefetch={false}>查看九型人格技术说明 <ArrowRight size={15} aria-hidden/></Link> : null}
        {additional}
        {primary?.href && <div className={styles.closing}><TrioStart entry={primary} className={styles.cta}/></div>}
      </div>
    </section>
    {primary && <TrioSticky entry={primary} name={profile.name}/>}
  </div>;
}
