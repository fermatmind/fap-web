"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, ArrowUpRight, BookOpen, BriefcaseBusiness, Check, ChevronDown, Compass,
  HeartHandshake, Leaf, Lightbulb, ListChecks, ScanLine, Wallet, Waves,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { LiveTraitReading } from "@/lib/big5/liveReportLayout";
import { BIG5_DOMAIN_ORDER as traitOrder } from "@/lib/big5/taxonomy";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import {
  actionPlan, careerDirections, careerMatchLabels, insights, methodology, money,
  overviewPatterns, relationships, scienceSources, stress, traits, workplace,
} from "./bigFiveReportPreviewCopy";
import { bigFivePreviewPortraits, type BigFivePreviewFocus } from "./bigFivePreviewPortraits";
import { BigFivePreviewPrompt } from "./BigFivePreviewPrompt";
import styles from "./BigFiveReportPreview.module.css";

type Domain = { key: string; percentile: number | null; band: string; reading?: LiveTraitReading };
type Facet = { key: string; percentile: number; label: string };

const bandLabels: Record<string, string> = { low: "偏低", mid: "中等", high: "偏高" };
const chapters = [
  { id: "profile", title: "五维总览" }, { id: "traits", title: "特质图谱" },
  { id: "career", title: "职业" }, { id: "career-life", title: "日常场景" },
  { id: "plan", title: "行动计划" }, { id: "insights", title: "重新看自己" },
  { id: "method", title: "科学依据" }, { id: "prompt", title: "AI 继续探索" },
] as const;

function radarPoint(index: number, percentile: number) {
  const angle = index * (2 * Math.PI / traitOrder.length) - Math.PI / 2;
  return { x: 200 + Math.cos(angle) * percentile, y: 151 + Math.sin(angle) * percentile };
}

function radarPolygon(percentiles: number[]) {
  return percentiles.map((score, index) => {
    const { x, y } = radarPoint(index, score);
    return `${x},${y}`;
  }).join(" ");
}

function Radar({ scores }: { scores: number[] }) {
  const labelOffsets = [[0, -28], [43, -10], [45, 18], [-45, 18], [-43, -10]];
  return (
    <svg className={styles.radar} viewBox="0 0 400 277" role="img" aria-label={
      traitOrder.map((key, index) => `${traits[key].name}第 ${scores[index]} 百分位`).join("，")
    }>
      {[25, 50, 75, 100].map((tick) => (
        <polygon key={tick} points={radarPolygon(traitOrder.map(() => tick))} fill="none"
          stroke="var(--line-strong)" strokeDasharray={tick === 50 ? "3 4" : undefined} />
      ))}
      {traitOrder.map((key, index) => {
        const endpoint = radarPoint(index, 100);
        const [dx, dy] = labelOffsets[index];
        return (
          <g key={key}>
            <line x1="200" y1="151" x2={endpoint.x} y2={endpoint.y} stroke="var(--line-strong)" />
            <text x={endpoint.x + dx} y={endpoint.y + dy} textAnchor="middle" className={styles.radarLabel}>{traits[key].name}</text>
            <text x={endpoint.x + dx} y={endpoint.y + dy + 16} textAnchor="middle" className={styles.radarValue}>第 {scores[index]} 百分位</text>
          </g>
        );
      })}
      <polygon className={styles.radarShape} points={radarPolygon(scores)} />
      {scores.map((score, index) => {
        const point = radarPoint(index, score);
        return <circle key={traitOrder[index]} cx={point.x} cy={point.y} r="4.5"
          fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />;
      })}
    </svg>
  );
}

function Meter({ value }: { value: number }) {
  return (
    <svg className={styles.meter} viewBox="0 0 100 5" preserveAspectRatio="none" aria-hidden="true">
      <rect width={value} height="5" fill="var(--accent)" />
    </svg>
  );
}

function Scale({ score, continuous }: { score: number; continuous: boolean }) {
  return (
    <div className={styles.scale} aria-hidden="true">
      <svg viewBox="0 0 100 10" preserveAspectRatio="none">
        <path d={continuous ? "M1 5H99" : "M1 5H30 M31 5H69 M70 5H99"} />
        <line x1="1" x2={Math.max(1, Math.min(99, score))} y1="5" y2="5" />
      </svg>
      <svg className={styles.scaleDots} viewBox="0 0 100 10" preserveAspectRatio="none">
        <line x1={score} x2={score} y1="1.5" y2="8.5" />
      </svg>
    </div>
  );
}

function TraitMark({ code, score }: { code: string; score: number }) {
  return (
    <div className={styles.traitCode} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" />
        <circle cx="24" cy="24" r="20" pathLength="100" strokeDasharray={`${score} 100`} transform="rotate(-90 24 24)" />
      </svg>
      <span>{code}</span>
    </div>
  );
}

function TraitAdvice({ title, items, development }: { title: string; items: readonly string[]; development?: boolean }) {
  const Icon = development ? ArrowUpRight : Check;
  return <div data-development={development || undefined}>
    <h5>{title}</h5>
    <ul>{items.map((item) => <li key={item}><Icon size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul>
  </div>;
}

function Chapter({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <details id={id} className={styles.chapter} open>
      <summary>
        <span className={styles.chapterIcon} aria-hidden="true">{icon}</span>
        <h2>{title}</h2>
        <ChevronDown size={19} className={styles.chevron} aria-hidden="true" />
      </summary>
      <div className={styles.chapterBody}>{children}</div>
    </details>
  );
}

function StoryCards({ items }: { items: ReadonlyArray<{ title: string; body: string }> }) {
  return (
    <div className={styles.grid}>
      {items.map((item) => <article className={styles.card} key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}
    </div>
  );
}

function ScenarioRow({ id, title, takeaway, icon, children }: {
  id: string; title: string; takeaway: string; icon: ReactNode; children: ReactNode;
}) {
  return (
    <details id={id} className={styles.scenarioRow}>
      <summary>
        <span className={styles.scenarioIcon}>{icon}</span>
        <span className={styles.disclosureTitle}><strong>{title}</strong><span>{takeaway}</span></span>
        <ChevronDown size={16} className={styles.disclosureChevron} aria-hidden="true" />
      </summary>
      <div className={styles.disclosureBody}>{children}</div>
    </details>
  );
}

function ApplicationNotes({ items }: { items: ReadonlyArray<{ title: string; body: string; observe: string }> }) {
  return (
    <div className={styles.applicationNotes}>
      {items.map((item) => (
        <div key={item.title}>
          <h4>{item.title}</h4>
          <p>{item.body}</p>
          <p><strong>怎么核对</strong> {item.observe}</p>
        </div>
      ))}
    </div>
  );
}

export function BigFiveReportPreview({
  domains, facets, focus: initialFocus, showPercentiles, referenceGroup, questionCount, live,
}: {
  domains: Domain[];
  facets: Facet[];
  focus: BigFivePreviewFocus;
  showPercentiles: boolean;
  referenceGroup: string;
  questionCount: number;
  live?: { notice?: string; allowExercises: boolean; qualityNotice?: ReactNode; facetDetails?: ReactNode; plan?: ReactNode; insights?: ReactNode; method?: ReactNode };
}) {
  const [selectedFocus, setSelectedFocus] = useState<BigFivePreviewFocus>(initialFocus);
  const focus = live ? selectedFocus : initialFocus;
  const showExercises = !live || live.allowExercises;
  const scores = traitOrder.map((key) => domains.find((domain) => domain.key === key)?.percentile);
  const radarScores = showPercentiles && scores.every((score): score is number =>
    typeof score === "number" && score >= 0 && score <= 100
  ) ? scores : null;

  const portrait = bigFivePreviewPortraits[focus];
  const art = `/images/big-five/${portrait.art}-character.webp`;
  const focusName = focus === "overview" ? "五维导读" : traits[focus].name;
  const current = focus === "overview" ? null : domains.find((domain) => domain.key === focus);
  const scoreLabel = (domain?: Domain) =>
    showPercentiles && typeof domain?.percentile === "number"
      ? `第 ${domain.percentile} 百分位`
      : bandLabels[domain?.band ?? ""] || "暂无可展示结果";
  const summary = live ? {
    title: current?.reading?.headline ?? "从五个维度读这次作答",
    intro: current?.reading?.interpretation ?? "先看每个维度的位置，再结合具体面向和真实经历理解差异。",
    clues: [current?.reading?.observation ?? "挑一个近期反复遇到的情境，写下你当时有什么选择、实际做了什么。"],
    signature: { title: "可以运用的做法", body: current?.reading?.application ?? "把条件相近的经历放在一起，看看哪种做法反复出现，以及在什么情况下会变。" },
    next: { title: "下次可以试什么", body: current?.reading?.experiment ?? "选一个可撤回的小调整，记下实际结果与成本。", practice: "保留一次条件相似、表现不同的经历，方便回看。" },
  } : portrait;
  const prompt = [
    live ? "我在读自己的费马大五人格 90 题报告。请先问我想讨论哪个场景，等我主动提供愿意分享的结果。"
      : "我在读一份费马大五人格 90 题的固定示例。这些数据来自样例，与我的个人成绩无关。",
    ...(!live ? [domains.map((domain) => `${traits[domain.key as keyof typeof traits].name} ${scoreLabel(domain)}`).join("、") + "。"] : []),
    "每次只问一个问题。请我说清当时的任务、机会、做法和结果，区分发生的事、我的解释以及未知信息。找一个同样条件下的反例，也确认是否只是没有机会。",
    showExercises
      ? "根据我提供的经历，给出两种可能解释，再和我选一个可撤回的尝试。定好观察指标、成本和回看时间。提醒我省略姓名、单位和其他识别信息。"
      : "请帮我记录发生的事和待核实的问题，等有可比经历再一起回看。提醒我省略姓名、单位和其他识别信息。",
  ].join("\n");

  const Layout = live ? "section" : "main";
  return (
    <Layout className={styles.report} data-testid={live ? "big5-90-report-layout" : undefined}>
      <div className={styles.heroContainer}>
        <p className={styles.issue}><span>{live ? "本次大五人格结果" : "本地示例报告 · 固定结果样例"}</span><span>{questionCount} 题</span></p>

        {live?.qualityNotice}
        <header className={styles.hero}>
          <h1>大五人格报告</h1>
          <nav className={styles.focusNav} aria-label="切换首屏特写">
            {(["overview", ...traitOrder] as const).map((key) => live ? (
              <button key={key} type="button" aria-pressed={focus === key} onClick={() => setSelectedFocus(key)}>
                {key === "overview" ? "五维导读" : traits[key].name}
              </button>
            ) : (
              <Link key={key} href={key === "overview" ? "?" : `?focus=${key}`}
                aria-current={focus === key ? "page" : undefined}>
                {key === "overview" ? "五维导读" : traits[key].name}
              </Link>
            ))}
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroPortrait}>
              <p className={styles.kicker}>报告阅读视角</p>
              <p className={styles.heroTrait}>{focusName}</p>
              {current ? <p className={styles.heroScore}>{scoreLabel(current)}</p> : null}
              <Image className={styles.heroArt} src={art}
                width={560} height={700} sizes="(max-width: 640px) 230px, 280px" preload
                alt={portrait.alt} />
            </div>
            <div className={styles.heroReading}>
              <h2>{summary.title}</h2>
              <p>{summary.intro}</p>
              <a className={styles.heroContinue} href="#profile">查看完整五维画像 <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
          <div className={styles.heroStory}>
            <h2 className={styles.heroLabel}>先留意什么</h2>
            <ul className={styles.heroClues}>
              {summary.clues.map((clue) => <li key={clue}><Check size={16} aria-hidden="true" /><span>{clue}</span></li>)}
            </ul>
            {showExercises ? <>
            <h2 className={styles.heroLabel}>怎么带到真实场景</h2>
            <div className={styles.heroSignature}>
              <h3>{summary.signature.title}</h3>
              <p>{summary.signature.body}</p>
            </div>
            <section className={styles.heroNext}>
              <h2>{summary.next.title}</h2>
              <p>{summary.next.body}</p>
              <div><Leaf size={17} aria-hidden="true" /><p>{summary.next.practice}</p></div>
            </section>
            </> : null}
          </div>
        </header>
      </div>

      <div className={styles.reportLayout}>
      <nav className={styles.chapterNav} aria-label="报告目录">
        <strong>报告目录</strong>
        <ul>{chapters.filter(({ id }) => showExercises || (id !== "career" && id !== "career-life")).map(({ id, title }) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ul>
      </nav>
      <div className={styles.container}>
        <section id="profile" className={styles.profile}>
          <h2>五维总览</h2>
          {live?.notice ? <p role="note">{live.notice}</p> : null}
          <p>{radarScores ? `点越靠外，在对应参考分布中的位置越高。虚线标出第 50 百分位。比如第 42 百分位，大致对应参考分布中从低到高的 42% 位置。五维参考样本为${referenceGroup}。` : "这份结果按可用的分档信息展示。"}</p>
          <div className={styles.overviewGrid}>
            {radarScores ? <Radar scores={radarScores} /> : null}
            <ul className={styles.scoreList} aria-label="按特质查看解读">
              {traitOrder.map((key) => {
                const domain = domains.find((item) => item.key === key);
                const score = domain?.percentile;
                return <li key={key} data-trait={key}><a href={`#trait-${key}`}>{traits[key].name}{showPercentiles && typeof score === "number" ? <Meter value={score} /> : null}<span>{scoreLabel(domain)}</span></a></li>;
              })}
            </ul>
          </div>
          {!live && showPercentiles ? <StoryCards items={overviewPatterns} /> : null}
        </section>

        <Chapter id="traits" title="特质图谱" icon={<ScanLine size={18} />}>
          {showPercentiles && facets.length ? <p>{live ? "列出本次报告中可用的面向位置。每个面向按自己的参考分布解读。" : "每个维度选两个面向，说明总览下面有哪些不同的自报线索。"}</p> : null}
          {traitOrder.map((key) => {
            const trait = traits[key];
            const domain = domains.find((item) => item.key === key);
            const band = domain?.band ?? "";
            const score = showPercentiles ? domain?.percentile ?? null : null;
            const reading = domain?.reading;
            const facetHighlights = live
              ? facets.filter((facet) => facet.key.startsWith(key)).sort((a, b) => b.percentile - a.percentile)
              : trait.facetPair.flatMap((code) => {
                  const facet = facets.find((candidate) => candidate.key === code);
                  return facet ? [facet] : [];
                });
            return (
              <article key={key} className={styles.traitCard} data-trait={key} data-band={band} id={`trait-${key}`}>
                <div className={styles.traitHeader}>
                  <TraitMark code={key} score={score ?? 0} />
                  <div><h3>{trait.name}</h3><span>{trait.english}</span></div>
                  <div className={styles.traitScore}>
                    {score !== null ? <strong>{scoreLabel(domain)}</strong> : null}
                    {bandLabels[band] ? <span>{bandLabels[band]}</span> : null}
                  </div>
                </div>
                {score !== null ? <Scale score={score} continuous={Boolean(live)} /> : null}
                <h4>{reading?.headline ?? trait.title}</h4>
                <p className={styles.traitLead}>{reading?.definition ?? trait.definition}</p>
                {reading ? <p>{reading.interpretation}</p> : null}
                {reading?.qualifier ? <p role="note">{reading.qualifier}</p> : null}
                {showPercentiles && facetHighlights.length > 0 ? (
                  <div className={styles.facetHighlight}>
                    <ul aria-label={live ? `${trait.name}面向百分位` : "样例面向百分位"}>
                      {facetHighlights.map(({ key: code, label, percentile }) => (
                        <li key={code}><strong>{label}</strong> 第 {percentile} 百分位</li>
                      ))}
                    </ul>
                    {!live ? <p>{trait.interpretation}</p> : null}
                  </div>
                ) : null}
                <ul className={styles.observations}>
                  {(reading ? [reading.observation] : trait.observations).map((item) => <li key={item}>{item}</li>)}
                </ul>
                {showExercises ? <div className={styles.traitAdvice}>
                  <TraitAdvice title="可以运用的做法" items={reading ? [reading.application] : trait.strengths} />
                  <TraitAdvice title="下一次试什么" items={reading ? [reading.experiment] : trait.growth} development />
                </div> : null}
              </article>
            );
          })}
          {live?.facetDetails ? <details className={styles.scenarioRow}>
            <summary>
              <span className={styles.disclosureTitle}><strong>面向说明与完整解读</strong></span>
              <ChevronDown size={16} className={styles.disclosureChevron} aria-hidden="true" />
            </summary>
            <div className={styles.disclosureBody}>{live.facetDetails}</div>
          </details> : null}
        </Chapter>

        {showExercises ? <>
        <Chapter id="career" title="职业" icon={<Compass size={18} />}>
          <section className={styles.careerMatch} aria-labelledby="career-match-title">
            <h3 id="career-match-title">可以试做的职业任务</h3>
            <p>{live ? "下面是通用的试做示例。选一项你本来就想了解的任务，再用兴趣、技能和实际工作条件判断是否愿意继续探索。" : "先从一项具体任务试起。「直接试做」围绕表达和呈现，「拓展试做」加入访谈、协调或复核。职业选择还需要结合兴趣、技能和实际工作条件。"}</p>
            <ul className={styles.careerList}>
              {careerDirections.map((item) => (
                <li key={item.id}>
                  <details id={`career-${item.id}`} className={styles.careerRow}>
                    <summary>
                      <span className={styles.disclosureTitle}><strong>{item.name}</strong><span>{item.focus}</span></span>
                      {!live ? <span className={styles.matchBadge} data-match={item.match}>{careerMatchLabels[item.match]}</span> : null}
                      <ChevronDown size={16} className={styles.disclosureChevron} aria-hidden="true" />
                      </summary>
                    <div className={styles.disclosureBody}>
                      <p>{item.why}</p>
                      <p><strong>可以试做</strong> {item.task}</p>
                      <p><strong>工作要求</strong> {item.check.join("、")}</p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
            <p className={styles.matchBasis}>想比较自己愿意长期投入的活动，可以结合 <Link href={`/zh/tests/${SCALE_CANONICAL_SLUG_MAP.RIASEC}`}>霍兰德职业兴趣</Link>。</p>
          </section>
        </Chapter>

        <Chapter id="career-life" title="日常场景" icon={<Leaf size={18} />}>
          {live ? <p>下面是通用的情境练习。挑一个近期遇到过的情况，先用自己的经历核对。</p> : null}
          <div className={styles.scenarioList}>
            <ScenarioRow id="work" title="工作表现" takeaway="交接时写清标准，有意见可先写下来。" icon={<BriefcaseBusiness size={16} aria-hidden="true" />}>
              <ApplicationNotes items={workplace} />
            </ScenarioRow>
            <ScenarioRow id="stress" title="压力与恢复" takeaway="分别记录发生了什么、感受和持续时间。" icon={<Waves size={16} aria-hidden="true" />}>
              <p>{live ? "回看压力时，分别记录触发事件、感受、持续时间和生活影响。先用实际经历区分担忧、恼火或低落。" : stress.pattern}</p>
              <ul className={styles.bullets}>{[...stress.cues, ...stress.responses].map((note) => <li key={note}>{note}</li>)}</ul>
            </ScenarioRow>
            <ScenarioRow id="money" title="金钱习惯" takeaway="先分清喜欢和需要，再用账目核对。" icon={<Wallet size={16} aria-hidden="true" />}>
              <ApplicationNotes items={money} />
            </ScenarioRow>
            <ScenarioRow id="relationships" title="人际关系" takeaway="先问清对方的处境，再说明自己的需要。" icon={<HeartHandshake size={16} aria-hidden="true" />}>
              <ApplicationNotes items={relationships} />
            </ScenarioRow>
          </div>
        </Chapter>

        </> : null}

        <Chapter id="plan" title="行动计划" icon={<ListChecks size={18} />}>
          {!live ? <ol className={styles.timeline}>
            {actionPlan.map((step, index) => (
              <li key={step.time}>
                <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                <div className={styles.stepCard}>
                  <p className={styles.time}>{step.time}</p>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <p className={styles.stepOutput}><Check size={15} aria-hidden="true" /><span>{step.output}</span></p>
                </div>
              </li>
            ))}
          </ol> : null}
          {live?.plan}
        </Chapter>

        <Chapter id="insights" title="重新看自己" icon={<Lightbulb size={18} />}>
          {live ? live.insights : <StoryCards items={insights} />}
        </Chapter>

        <Chapter id="method" title="科学依据" icon={<BookOpen size={18} />}>
          {live ? live.method : <StoryCards items={methodology} />}
          <ol className={styles.references} aria-label="参考研究">
            {scienceSources.map((source, index) => (
              <li key={source.url}>
                <span aria-hidden="true">{index + 1}</span>
                <div>
                  <a className={styles.source} href={source.url}>{source.title} <ArrowUpRight size={13} aria-hidden="true" /></a>
                  <p>{source.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Chapter>

        <BigFivePreviewPrompt prompt={prompt} art={art} alt={portrait.alt} />
      </div>
      </div>
    </Layout>
  );
}
