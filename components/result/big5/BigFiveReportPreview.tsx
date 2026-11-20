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
  overviewPatterns, relationships, scienceSources, stress, traits, workplace,
} from "./bigFiveReportPreviewCopy";
import styles from "./BigFiveReportPreview.module.css";

const traitOrder = ["O", "C", "E", "A", "N"] as const;
type Domain = { key: string; percentile: number; band: string };
type Facet = { code: string; label: string; meaning: string; domain: string; percentile: number };
type Reference = { name: string; domainCount: number; facetCount: number | null; ageRange: string; version: string; locale: string; gender: string; updatedAt: string; scoringVersion: string };

const bandLabels: Record<string, string> = { low: "偏低", mid: "中等", high: "偏高" };
const chapters = [
  { id: "profile", title: "五维总览" }, { id: "traits", title: "特质图谱" },
  { id: "career", title: "职业方向" }, { id: "work", title: "工作表现" },
  { id: "stress", title: "压力" }, { id: "money", title: "金钱习惯" },
  { id: "relationships", title: "人际关系" }, { id: "people", title: "人物案例" },
  { id: "plan", title: "行动计划" }, { id: "insights", title: "重新看自己" },
  { id: "method", title: "科学与计分" },
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

function Scale({ score }: { score: number }) {
  return (
    <div className={styles.scale} aria-hidden="true">
      <svg viewBox="0 0 100 10" preserveAspectRatio="none">
        <path d="M1 5H30 M31 5H69 M70 5H99" />
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

function ApplicationCards({ items }: { items: ReadonlyArray<{ title: string; body: string; observe: string }> }) {
  return <div className={styles.grid}>
    {items.map((item) => (
      <article className={`${styles.card} ${styles.applicationCard}`} key={item.title}>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
        <div><h4>怎么核对</h4><p>{item.observe}</p></div>
      </article>
    ))}
  </div>;
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
        <p className={styles.issue}><span>本地示例报告 · 固定结果样例</span><span>{questionCount} 题完整版</span></p>

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

      <div className={styles.reportLayout}>
      <nav className={styles.chapterNav} aria-label="报告目录">
        <strong>报告目录</strong>
        <ul>{chapters.map(({ id, title }) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ul>
      </nav>
      <div className={styles.container}>
        <section id="profile" className={styles.profile}>
          <h2>五维总览</h2>
          <p>图上的点越靠外，该特质的百分位越高。虚线是第 50 百分位。</p>
          <div className={styles.overviewGrid}>
            <Radar scores={scores} />
            <ul className={styles.scoreList} aria-label="按特质查看解读">
              {traitOrder.map((key, index) => (
                <li key={key} data-trait={key}><a href={`#trait-${key}`}>{traits[key].name}<Meter value={scores[index]} /><span>第 {scores[index]} 百分位</span></a></li>
              ))}
            </ul>
          </div>
          <StoryCards items={overviewPatterns} />
        </section>

        <Chapter id="traits" title="特质图谱" icon={<ScanLine size={18} />}>
          {traitOrder.map((key, index) => {
            const trait = traits[key];
            const band = domains.find((domain) => domain.key === key)?.band ?? "";
            return (
              <article key={key} className={styles.traitCard} data-trait={key} id={`trait-${key}`}>
                <div className={styles.traitHeader}>
                  <TraitMark code={key} score={scores[index]} />
                  <div><h3>{trait.name}</h3><span>{trait.english}</span></div>
                  <div className={styles.traitScore}>
                    <strong>第 {scores[index]} 百分位</strong>
                    {bandLabels[band] ? <span>{bandLabels[band]}</span> : null}
                  </div>
                </div>
                <Scale score={scores[index]} />
                <h4>{trait.title}</h4>
                <p className={styles.traitLead}>{trait.description}</p>
                <ul className={styles.observations}>{trait.observations.map((item) => <li key={item}>{item}</li>)}</ul>
                <div className={styles.traitAdvice}>
                  <TraitAdvice title="可发挥的优势" items={trait.strengths} />
                  <TraitAdvice title="成长空间" items={trait.growth} development />
                </div>
                <details className={styles.facets}>
                  <summary>六个细分面向 <ChevronDown size={16} aria-hidden="true" /></summary>
                  <ul>
                    {facets.filter((facet) => facet.domain === key).map((facet) => (
                      <li key={facet.code}>
                        <span>{facet.label}</span><Meter value={facet.percentile} /><b>{facet.percentile}</b>
                        <p>{facet.code === "A2" ? "这些作答涉及处理事实、规则和合作的方式。" : facet.meaning}</p>
                      </li>
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
            <p>从样例里突出的审美感受出发，先选两类任务试做。完成后分别看自己是否想继续、使用者反馈如何、日常工作条件能否接受。</p>
            <ul className={styles.careerOverview}>
              {careerDirections.map((item) => <li key={item.id}><a href={`#career-${item.id}`}>{item.name}<span>{item.focus}</span></a></li>)}
            </ul>
          </div>
          <div className={styles.stack}>
            {careerDirections.map((item) => (
              <article className={`${styles.card} ${styles.careerCard}`} id={`career-${item.id}`} key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.why}</p>
                <p className={styles.tryTask}><strong>可以试做</strong> {item.task}</p>
                <ul className={styles.tags} aria-label="值得核对的工作要求">{item.check.map((label) => <li key={label}>{label}</li>)}</ul>
              </article>
            ))}
          </div>
        </Chapter>

        <Chapter id="work" title="工作中的表现" icon={<BriefcaseBusiness size={18} />}>
          <ApplicationCards items={workplace} />
        </Chapter>

        <Chapter id="stress" title="压力之下" icon={<Waves size={18} />}>
          <div className={styles.card}><h3>压力体验</h3><p>{stress.pattern}</p></div>
          <div className={styles.grid}>
            <article className={styles.card}><h3>值得留意的线索</h3><ul className={styles.bullets}>{stress.cues.map((cue) => <li key={cue}>{cue}</li>)}</ul></article>
            <article className={styles.card}><h3>可以尝试的方法</h3><ul className={styles.bullets}>{stress.responses.map((response) => <li key={response}>{response}</li>)}</ul></article>
          </div>
        </Chapter>

        <Chapter id="money" title="金钱习惯" icon={<Wallet size={18} />}>
          <ApplicationCards items={money} />
        </Chapter>

        <Chapter id="relationships" title="人际关系" icon={<HeartHandshake size={18} />}>
          <ApplicationCards items={relationships} />
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
            <h3>题本与参考人群</h3>
            <p>这份 120 题示例在五个连续维度下展示 30 个面向。五维与细分面向各用对应的常模条目换算。接近的数值，例如 63 和 65，可以并排阅读，没必要分先后。职业任务、人物案例和情境建议用于探索。</p>
            <dl className={styles.methodFacts}>
              <div><dt>五维常模样本量</dt><dd>{reference.name} · {reference.domainCount.toLocaleString("zh-CN")} 人</dd></div>
              <div><dt>细分面向常模</dt><dd>{reference.facetCount === null ? "各面向按对应常模条目换算" : `各面向条目样本量 ${reference.facetCount.toLocaleString("zh-CN")}`}</dd></div>
              <div><dt>地区和年龄</dt><dd>{reference.locale} · {reference.ageRange} 岁 · {reference.gender}</dd></div>
              <div><dt>常模</dt><dd>{reference.version} · {reference.updatedAt}</dd></div>
              <div><dt>计分版本</dt><dd>{reference.scoringVersion}</dd></div>
            </dl>
          </div>
          <div className={styles.grid}>
            {scienceSources.map((source) => (
              <article className={styles.card} key={source.url}>
                <h3>{source.title}</h3><p>{source.body}</p>
                <a className={styles.source} href={source.url}>阅读研究 <ArrowUpRight size={13} aria-hidden="true" /></a>
              </article>
            ))}
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
      </div>
    </main>
  );
}
