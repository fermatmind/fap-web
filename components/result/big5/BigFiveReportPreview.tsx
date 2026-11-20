import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, ArrowUpRight, BookOpen, BriefcaseBusiness, ChartNoAxesColumnIncreasing, Check, ChevronDown, Compass,
  HeartHandshake, Leaf, Lightbulb, ListChecks, ScanLine, ShieldCheck, Wallet, Waves,
} from "lucide-react";
import type { ReactNode } from "react";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import {
  actionPlan, careerDirections, careerMatchLabels, insights, money, portrait, readingNotes,
  overviewPatterns, relationships, scienceSources, stress, traits, workplace,
} from "./bigFiveReportPreviewCopy";
import { BigFivePreviewPrompt } from "./BigFivePreviewPrompt";
import styles from "./BigFiveReportPreview.module.css";

const traitOrder = ["O", "C", "E", "A", "N"] as const;
type Domain = { key: string; percentile: number; band: string };
type Facet = { code: string; label: string; meaning: string; domain: string; percentile: number };
type Reference = { name: string; domainCount: number; facetCount: number | null; ageRange: string; version: string; locale: string; gender: string; updatedAt: string; scoringVersion: string };

const bandLabels: Record<string, string> = { low: "偏低", mid: "中等", high: "偏高" };
const chapters = [
  { id: "profile", title: "五维总览" }, { id: "traits", title: "特质图谱" },
  { id: "career-life", title: "职业与生活" },
  { id: "plan", title: "行动计划" }, { id: "insights", title: "重新看自己" },
  { id: "method", title: "科学与计分" }, { id: "prompt", title: "AI 继续探索" },
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

function ScienceBlock({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.scienceBlock}>
      <span className={styles.scienceIcon} aria-hidden="true">{icon}</span>
      <div><h3>{title}</h3>{children}</div>
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
  const prompt = [
    "我在读一份费马大五人格的固定示例。下面的百分位只用来演示读法，与我的个人成绩无关。",
    traitOrder.map((key, index) => `${traits[key].name} ${scores[index]}`).join("、") + "。",
    heroFacets.map(({ label, percentile }) => `${label} ${percentile}`).join("、") + "。",
    "",
    "先问我有没有自己的结果，或想聊哪个具体场景，一次只问一个问题。若我只提供经历，就从那次发生的事出发。分别整理事实、我的解释和缺少的信息，提出两种可能解释，再问我有没有不符合的例子。",
    "请和我选一个成本低、可撤回的尝试，写清完成方式及何时回看。根据经历讨论倾向，职业能力、关系结果和心理健康需要各自的证据。提醒我省略姓名、单位等可识别信息。",
  ].join("\n");

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

        <Chapter id="career-life" title="职业与生活" icon={<Compass size={18} />}>
          <section id="career" className={styles.scenario} aria-labelledby="career-title">
            <h3 id="career-title">职业匹配线索</h3>
            <p>「直接线索」表示任务涉及形式与呈现，和样例的审美感受有交集。点开任一方向查看依据和试做方法。</p>
            <ul className={styles.careerList}>
              {careerDirections.map((item) => (
                <li key={item.id}>
                  <details id={`career-${item.id}`} className={styles.careerRow}>
                    <summary>
                      <span className={styles.disclosureTitle}><strong>{item.name}</strong><span>{item.focus}</span></span>
                      <span className={styles.matchBadge} data-match={item.match}>{careerMatchLabels[item.match]}</span>
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

          <section className={styles.scenario} aria-labelledby="life-title">
            <h3 id="life-title">日常场景</h3>
            <div className={styles.scenarioList}>
              <ScenarioRow id="work" title="工作表现" takeaway="交接时写清标准，有意见可先写下来。" icon={<BriefcaseBusiness size={16} aria-hidden="true" />}>
                <ApplicationNotes items={workplace} />
              </ScenarioRow>
              <ScenarioRow id="stress" title="压力与恢复" takeaway="分别记录发生了什么、感受和持续时间。" icon={<Waves size={16} aria-hidden="true" />}>
                <p>{stress.pattern}</p>
                <ul className={styles.bullets}>{[...stress.cues, ...stress.responses].map((note) => <li key={note}>{note}</li>)}</ul>
              </ScenarioRow>
              <ScenarioRow id="money" title="金钱习惯" takeaway="先分清喜欢和需要，再用账目核对。" icon={<Wallet size={16} aria-hidden="true" />}>
                <ApplicationNotes items={money} />
              </ScenarioRow>
              <ScenarioRow id="relationships" title="人际关系" takeaway="先问清对方的处境，再说明自己的需要。" icon={<HeartHandshake size={16} aria-hidden="true" />}>
                <ApplicationNotes items={relationships} />
              </ScenarioRow>
            </div>
          </section>
        </Chapter>

        <Chapter id="plan" title="行动计划" icon={<ListChecks size={18} />}>
          <ol className={styles.timeline}>
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
          </ol>
        </Chapter>

        <Chapter id="insights" title="重新看自己" icon={<Lightbulb size={18} />}>
          <StoryCards items={insights} />
        </Chapter>

        <Chapter id="method" title="科学与计分说明" icon={<BookOpen size={18} />}>
          <ScienceBlock title="大五模型与这份题本" icon={<BookOpen size={18} />}>
            <p>这份 120 题示例在五个连续维度下展示 30 个面向。Johnson 的 IPIP-NEO-120 研究提供面向结构的背景。费马中文版的分数以对应题本和常模换算为准。 [1]</p>
          </ScienceBlock>
          <ScienceBlock title="分数怎样换算" icon={<ChartNoAxesColumnIncreasing size={18} />}>
            <p>{readingNotes.percentile}</p>
            <p>{readingNotes.aggregation}</p>
            <dl className={styles.methodFacts}>
              <div><dt>参考人群</dt><dd>{reference.name} · {reference.locale} · {reference.ageRange} 岁 · {reference.gender}</dd></div>
              <div><dt>五维样本量</dt><dd>{reference.domainCount.toLocaleString("zh-CN")} 人</dd></div>
              <div><dt>细分面向</dt><dd>{reference.facetCount === null ? "各面向按对应常模条目换算" : `各条目样本量 ${reference.facetCount.toLocaleString("zh-CN")}`}</dd></div>
              <div><dt>常模与计分版本</dt><dd>{reference.version}（{reference.updatedAt}） · {reference.scoringVersion}</dd></div>
            </dl>
          </ScienceBlock>
          <ScienceBlock title="怎样把结果带进生活" icon={<ShieldCheck size={18} />}>
            <p>{readingNotes.context} 日常记录研究也观察到，同一个人在不同场合的行为会变动。接近的百分位可以并排读，职业任务和情境建议可结合实际经历核对。 [2]</p>
          </ScienceBlock>
          <ScienceBlock title="参考文献" icon={<BookOpen size={18} />}>
            <ol className={styles.references}>
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
          </ScienceBlock>
        </Chapter>

        <BigFivePreviewPrompt prompt={prompt} />
      </div>
      </div>
    </main>
  );
}
