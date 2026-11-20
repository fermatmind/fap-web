"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { careerDirections, portrait, readingNotes, situations, traits } from "./bigFiveReportPreviewCopy";
import styles from "./BigFiveReportPreview.module.css";

const traitOrder = ["O", "C", "E", "A", "N"] as const;
type TraitKey = (typeof traitOrder)[number];
type Domain = { key: string; percentile: number };
type Facet = { code: string; label: string; domain: string; percentile: number };
type Reference = { name: string; count: number; ageRange: string; version: string };

const reportSections = [
  { id: "profile", label: "五维画像" },
  { id: "work", label: "职业探索" },
  { id: "life", label: "日常应用" },
  { id: "method", label: "报告说明" },
];

function radarPoint(index: number, percentile: number) {
  const angle = index * (2 * Math.PI / traitOrder.length) - Math.PI / 2;
  const radius = percentile * 1.12;
  return { x: 160 + Math.cos(angle) * radius, y: 136 + Math.sin(angle) * radius };
}

function radarPolygon(percentiles: number[]) {
  return percentiles.map((score, index) => {
    const { x, y } = radarPoint(index, score);
    return `${x},${y}`;
  }).join(" ");
}

function Radar({ scores, selected }: { scores: number[]; selected: TraitKey }) {
  return (
    <svg className={styles.radar} viewBox="0 0 320 255" aria-hidden="true">
      {[25, 50, 75, 100].map((tick) => (
        <polygon key={tick} points={radarPolygon(traitOrder.map(() => tick))} fill="none"
          stroke="var(--line-strong)" strokeDasharray={tick === 50 ? "3 4" : undefined} />
      ))}
      {traitOrder.map((key, index) => {
        const endpoint = radarPoint(index, 100);
        const label = radarPoint(index, 115);
        return (
          <g key={key}>
            <line x1="160" y1="136" x2={endpoint.x} y2={endpoint.y} stroke="var(--line-strong)" />
            <text x={label.x} y={label.y + 4} textAnchor="middle" className={styles.radarLabel}>{key}</text>
          </g>
        );
      })}
      <polygon className={styles.radarShape} points={radarPolygon(scores)} />
      {traitOrder.map((key, index) => {
        const point = radarPoint(index, scores[index]);
        return <circle key={key} cx={point.x} cy={point.y} r={key === selected ? 6 : 3.5}
          fill="var(--accent)" stroke="var(--paper)" strokeWidth="2" />;
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

export function BigFiveReportPreview({
  domains, facets, reference, questionCount,
}: {
  domains: Domain[];
  facets: Facet[];
  reference: Reference;
  questionCount: number;
}) {
  const [selected, setSelected] = useState<TraitKey>("O");
  const scores = traitOrder.map((key) => domains.find((domain) => domain.key === key)?.percentile);
  const trait = traits[selected];

  if (!scores.every((score): score is number => typeof score === "number" && score >= 0 && score <= 100)) {
    return <p role="status">暂时无法读取示例报告的五维分数。</p>;
  }

  return (
    <main className={styles.report}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.issue}>
            <strong>大五人格 · 示例报告</strong>
            <span>{questionCount} 题完整版</span>
          </div>
          <div className={styles.hero}>
            <div className={styles.heroText}>
              <p className={styles.kicker}>开放性 · OPENNESS</p>
              <h1>{portrait.title}</h1>
              <p className={styles.lede}>{portrait.intro}</p>
              <a className={styles.primary} href="#profile">查看五维分数 <ArrowDown size={17} aria-hidden="true" /></a>
            </div>
            <figure className={styles.art}>
              <Image src="/images/big-five/openness-preview.webp" width={1280} height={853} preload
                alt="一位观察者端详由多层红纸折成的立体作品" />
            </figure>
          </div>
        </div>
      </header>

      <nav className={styles.navigation} aria-label="报告章节">
        <div className={styles.container}>
          {reportSections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}
        </div>
      </nav>

      <div className={styles.container}>
        <section className={styles.highlights} aria-label="样例解读要点">
          {portrait.highlights.map((item) => (
            <div key={item.title}><h2>{item.title}</h2><p>{item.body}</p></div>
          ))}
        </section>

        <section id="profile" className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>五维画像</h2>
            <p>图表显示五项特质在样例参考人群中的百分位。选择一项查看它的六个面向。</p>
          </div>
          <div className={styles.overview}>
            <div className={styles.plot}>
              <Radar scores={scores} selected={selected} />
              <p>虚线为第 50 百分位</p>
            </div>
            <div className={styles.scoreList} role="group" aria-label="选择要解读的特质">
              {traitOrder.map((key, index) => (
                <button key={key} type="button" aria-pressed={selected === key} aria-controls="trait-detail"
                  className={styles.scoreRow} onClick={() => setSelected(key)}>
                  <span className={styles.traitCode} aria-hidden="true">{key}</span>
                  <span className={styles.traitName}>{traits[key].name}</span>
                  <Meter value={scores[index]} />
                  <span className={styles.score}><span className={styles.srOnly}>第 </span>{scores[index]}<span className={styles.srOnly}> 百分位</span></span>
                  <span className={styles.rowArrow} aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>

          <div id="trait-detail" className={styles.detail} aria-live="polite">
            <div className={styles.detailStory} key={selected}>
              <p className={styles.kicker}>{trait.name} · {trait.english}</p>
              <h3>{trait.title}</h3>
              <p>{trait.description}</p>
              <dl>
                <div><dt>可以发挥的地方</dt><dd>{trait.strength}</dd></div>
                <div><dt>可以试的调整</dt><dd>{trait.growth}</dd></div>
              </dl>
            </div>
            <div className={styles.facets}>
              <h4>六个细分面向 <span>百分位</span></h4>
              <ul>
                {facets.filter((facet) => facet.domain === selected).map((facet) => (
                  <li key={facet.code}><span>{facet.label}</span><Meter value={facet.percentile} /><b>{facet.percentile}</b></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="work" className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>职业探索</h2>
            <p>从样例里比较突出的审美感受出发，可以先试做以下任务，再结合技能、兴趣和工作环境判断。</p>
          </div>
          <div className={styles.careerGrid}>
            {careerDirections.map((direction) => (
              <article key={direction.name}>
                <h3>{direction.name}</h3>
                <p>{direction.task}</p>
                <p className={styles.check}>值得核对 · {direction.check}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="life" className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>这些倾向在日常中怎么用</h2>
            <p>挑一个最近遇到的场景，用具体经历核对报告里的解读。</p>
          </div>
          <div className={styles.situations}>
            {situations.map((situation) => (
              <article key={situation.title}>
                <p className={styles.kicker}>{situation.label}</p>
                <h3>{situation.title}</h3>
                <p>{situation.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="method" className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>读懂这份报告</h2>
            <p>样例参考人群为{reference.name}，共 {reference.count.toLocaleString("zh-CN")} 人，年龄 {reference.ageRange} 岁。常模版本 {reference.version}。</p>
          </div>
          {readingNotes.map((item) => (
            <details key={item.title} className={styles.note}>
              <summary>{item.title}<ChevronDown size={18} aria-hidden="true" /></summary>
              <p>{item.body}</p>
            </details>
          ))}
        </section>

        <footer className={styles.footer}>
          <div><h2>看看自己的五维画像</h2><p>完成测评后，费马测试会根据你的作答生成报告。</p></div>
          <Link className={styles.primary} href={`/zh/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}`}>了解大五人格测试 <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </footer>
      </div>
    </main>
  );
}
