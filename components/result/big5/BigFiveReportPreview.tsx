import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, ArrowUpRight, BookOpen, BriefcaseBusiness, Check, ChevronDown, Compass,
  HeartHandshake, Leaf, Lightbulb, ListChecks, ScanLine, Users, Wallet, Waves,
} from "lucide-react";
import type { ReactNode } from "react";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import {
  actionPlan, careerDirections, insights, money, people, portrait, readingNotes,
  relationships, stress, traits, workplace,
} from "./bigFiveReportPreviewCopy";
import styles from "./BigFiveReportPreview.module.css";

const traitOrder = ["O", "C", "E", "A", "N"] as const;
type Domain = { key: string; percentile: number };
type Facet = { code: string; label: string; domain: string; percentile: number };
type Reference = { name: string; count: number; ageRange: string; version: string };

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

export function BigFiveReportPreview({
  domains, facets, reference, questionCount,
}: {
  domains: Domain[];
  facets: Facet[];
  reference: Reference;
  questionCount: number;
}) {
  const scores = traitOrder.map((key) => domains.find((domain) => domain.key === key)?.percentile);
  if (!scores.every((score): score is number => typeof score === "number" && score >= 0 && score <= 100)) {
    return <p role="status">暂时无法读取示例报告的五维分数。</p>;
  }

  const heroFacets = portrait.facetCodes.flatMap((code) => facets.filter((facet) => facet.code === code));

  return (
    <main className={styles.report}>
      <div className={styles.heroContainer}>
        <p className={styles.issue}><span>本地示例报告 · 根据固定样例作答生成</span><span>{questionCount} 题完整版</span></p>

        <header className={styles.hero}>
          <h1>大五人格报告</h1>
          <div className={styles.heroGrid}>
            <div className={styles.heroPortrait}>
              <p className={styles.kicker}>本次特写维度</p>
              <p className={styles.heroTrait}>开放性</p>
              <p className={styles.heroScore}>第 {scores[0]} 百分位 · Openness</p>
              <Image className={styles.heroArt} src="/images/big-five/openness-character.webp"
                width={560} height={700} sizes="(max-width: 640px) 230px, 280px" preload
                alt="小熊猫手艺人坐在木凳上，端详手中的折纸鸟" />
            </div>
            <div className={styles.heroReading}>
              <p className={styles.kicker}>开放性的三个面向 · 百分位</p>
              <h2>{portrait.title}</h2>
              <p>{portrait.intro}</p>
              <dl className={styles.heroFacets}>
                {heroFacets.map((facet) => (
                  <div key={facet.code}><dt>{facet.label}</dt><dd>{facet.percentile}</dd></div>
                ))}
              </dl>
              <a className={styles.heroContinue} href="#profile">查看完整五维画像 <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
          <div className={styles.heroStory}>
            <h2 className={styles.heroLabel}>结果里的关键线索</h2>
            <ul className={styles.heroClues}>
              {portrait.clues.map((clue) => <li key={clue}><Check size={16} aria-hidden="true" /><span>{clue}</span></li>)}
            </ul>
            <h2 className={styles.heroLabel}>可以发挥的地方</h2>
            <div className={styles.heroSignature}>
              <h3>{portrait.signature.title}</h3>
              <p>{portrait.signature.body}</p>
            </div>
            <section className={styles.heroNext}>
              <h2>{portrait.next.title}</h2>
              <p>{portrait.next.body}</p>
              <div><Leaf size={17} aria-hidden="true" /><p>{portrait.next.practice}</p></div>
            </section>
          </div>
        </header>
      </div>

      <div className={styles.container}>
        <section id="profile" className={styles.profile}>
          <h2>五维总览</h2>
          <p>图上的点越靠外，该特质的百分位越高。虚线是第 50 百分位。</p>
          <Radar scores={scores} />
        </section>

        <Chapter id="traits" title="特质图谱" icon={<ScanLine size={18} />}>
          {traitOrder.map((key, index) => {
            const trait = traits[key];
            return (
              <article key={key} className={styles.traitCard} data-trait={key}>
                <div className={styles.traitHeader}>
                  <span className={styles.traitCode} aria-hidden="true">{key}</span>
                  <div><h3>{trait.name}</h3><span>{trait.english}</span></div>
                  <strong>第 {scores[index]} 百分位</strong>
                </div>
                <Meter value={scores[index]} />
                <h4>{trait.title}</h4>
                <p>{trait.description}</p>
                <dl className={styles.traitAdvice}>
                  <div><dt>可以发挥的地方</dt><dd>{trait.strength}</dd></div>
                  <div><dt>可以试的调整</dt><dd>{trait.growth}</dd></div>
                </dl>
                <details className={styles.facets}>
                  <summary>六个细分面向 <ChevronDown size={16} aria-hidden="true" /></summary>
                  <ul>
                    {facets.filter((facet) => facet.domain === key).map((facet) => (
                      <li key={facet.code}><span>{facet.label}</span><Meter value={facet.percentile} /><b>{facet.percentile}</b></li>
                    ))}
                  </ul>
                </details>
              </article>
            );
          })}
        </Chapter>

        <Chapter id="career" title="职业方向" icon={<Compass size={18} />}>
          <div className={styles.card}>
            <h3>职业方向一览</h3>
            <p>从样例里突出的审美感受出发，比较感兴趣的任务和工作条件。</p>
            <ul className={styles.careerOverview}>
              {careerDirections.map((item) => <li key={item.id}><a href={`#career-${item.id}`}>{item.name}<span>{item.focus}</span></a></li>)}
            </ul>
          </div>
          <div className={styles.stack}>
            {careerDirections.map((item) => (
              <article className={styles.card} id={`career-${item.id}`} key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.why}</p>
                <p><strong>可以试做</strong> {item.task}</p>
                <ul className={styles.tags} aria-label="值得核对的工作要求">{item.check.map((label) => <li key={label}>{label}</li>)}</ul>
              </article>
            ))}
          </div>
        </Chapter>

        <Chapter id="work" title="工作中的表现" icon={<BriefcaseBusiness size={18} />}>
          <StoryCards items={workplace} />
        </Chapter>

        <Chapter id="stress" title="压力之下" icon={<Waves size={18} />}>
          <div className={styles.card}><h3>压力体验</h3><p>{stress.pattern}</p></div>
          <div className={styles.grid}>
            <article className={styles.card}><h3>值得留意的线索</h3><ul className={styles.bullets}>{stress.cues.map((cue) => <li key={cue}>{cue}</li>)}</ul></article>
            <article className={styles.card}><h3>可以尝试的方法</h3><ul className={styles.bullets}>{stress.responses.map((response) => <li key={response}>{response}</li>)}</ul></article>
          </div>
        </Chapter>

        <Chapter id="money" title="金钱习惯" icon={<Wallet size={18} />}>
          <StoryCards items={money} />
        </Chapter>

        <Chapter id="relationships" title="人际关系" icon={<HeartHandshake size={18} />}>
          <StoryCards items={relationships} />
        </Chapter>

        <Chapter id="people" title="人物案例" icon={<Users size={18} />}>
          <p className={styles.lead}>这些案例来自公开的创作记录。可以借鉴他们验证想法的方法。</p>
          <div className={styles.grid}>
            {people.map((person) => (
              <article className={styles.card} key={person.name}>
                <h3>{person.name}</h3><p className={styles.caption}>{person.area}</p><p>{person.body}</p>
                <a className={styles.source} href={person.url}>{person.source} <ArrowUpRight size={13} aria-hidden="true" /></a>
              </article>
            ))}
          </div>
        </Chapter>

        <Chapter id="plan" title="行动计划" icon={<ListChecks size={18} />}>
          <ol className={styles.timeline}>
            {actionPlan.map((step) => (
              <li key={step.time}>
                <span className={styles.time}>{step.time}</span>
                <div><h3>{step.title}</h3><p>{step.body}</p><p className={styles.caption}>{step.output}</p></div>
              </li>
            ))}
          </ol>
        </Chapter>

        <Chapter id="insights" title="重新看自己" icon={<Lightbulb size={18} />}>
          <StoryCards items={insights} />
        </Chapter>

        <Chapter id="method" title="科学与计分说明" icon={<BookOpen size={18} />}>
          <div className={styles.card}>
            <h3>五个维度与三十个面向</h3>
            <p>这份 120 题示例在五个连续维度下展示 30 个面向。可对照 IPIP-NEO-120 的面向结构阅读，各项数字以本报告的参考样本为准。</p>
            <p>参考人群为{reference.name}，共 {reference.count.toLocaleString("zh-CN")} 人，年龄 {reference.ageRange} 岁。常模版本 {reference.version}。</p>
            <a className={styles.source} href="https://ipip.ori.org/30FacetNEO-PI-RItems.htm">IPIP-NEO-120 面向资料 <ArrowUpRight size={13} aria-hidden="true" /></a>
          </div>
          {readingNotes.map((item) => (
            <details key={item.title} className={styles.note}>
              <summary>{item.title}<ChevronDown size={18} aria-hidden="true" /></summary>
              <p>{item.body}</p>
            </details>
          ))}
        </Chapter>

        <footer className={styles.footer}>
          <h2>看看自己的五维画像</h2>
          <Link className={styles.primary} href={`/zh/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}`}>了解大五人格测试 <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </footer>
      </div>
    </main>
  );
}
