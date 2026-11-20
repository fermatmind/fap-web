"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BriefcaseBusiness,
  Gauge,
  Wallet,
  Check,
  CheckCheck,
  Copy,
  Download,
  Leaf,
} from "lucide-react";
import {
  archetypeAssets,
  commonAssets,
  buildReportView,
  makePreviewScores,
  reportChapters,
  type JungPreviewDimension,
  type PreviewPattern,
} from "./jungReportAssets";
import styles from "./JungReportPreview.module.css";
function coordinates(index: number, count: number, radius: number) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return [210 + Math.cos(angle) * radius, 210 + Math.sin(angle) * radius].map(
    (value) => Number(value.toFixed(3)),
  );
}
const archetypeChartColors: Record<string, { fill: string; label: string }> = {
  hero: { fill: "#df8a50", label: "#82421e" },
  sage: { fill: "#9b80cf", label: "#62418f" },
  explorer: { fill: "#5baf85", label: "#286146" },
  creator: { fill: "#e07b9c", label: "#923654" },
  ruler: { fill: "#648fc0", label: "#345a84" },
  caregiver: { fill: "#ddad61", label: "#78531c" },
  magician: { fill: "#ae72ba", label: "#743980" },
  lover: { fill: "#dc7580", label: "#92353f" },
  jester: { fill: "#77b3b5", label: "#32666a" },
  everyperson: { fill: "#9cad65", label: "#53622d" },
  innocent: { fill: "#69a6cc", label: "#326484" },
  rebel: { fill: "#b68368", label: "#754730" },
};

function ProfileChart({
  dimensions,
  selectedId,
  onSelect,
}: {
  dimensions: JungPreviewDimension[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const count = dimensions.length;
  const polygon = (radius: number) =>
    dimensions.map((_, i) => coordinates(i, count, radius).join(",")).join(" ");
  const values = dimensions
    .map((row, i) => coordinates(i, count, row.score * 1.34).join(","))
    .join(" ");
  return (
    <figure className={styles.chart}>
      <svg
        viewBox="0 0 420 420"
        role="img"
        aria-label={dimensions
          .map((row) => row.name + " " + row.score + " 分")
          .join("，")}
      >
        {[25, 50, 75, 100].map((tick) => (
          <polygon
            key={tick}
            points={polygon(tick * 1.34)}
            fill="none"
            stroke="#d3e3df"
          />
        ))}
        {dimensions.map((row, i) => {
          const radius = Number((row.score * 1.34).toFixed(3));
          const [ax, ay] = coordinates(i - 0.46, count, radius);
          const [bx, by] = coordinates(i + 0.46, count, radius);
          return (
            <path
              key={row.id}
              data-color-sector={row.id}
              d={`M210 210 L${ax} ${ay} A${radius} ${radius} 0 0 1 ${bx} ${by} Z`}
              fill={archetypeChartColors[row.id].fill}
              fillOpacity={selectedId === row.id ? 0.88 : 0.65}
              stroke={archetypeChartColors[row.id].fill}
              strokeOpacity=".45"
              strokeWidth="0.8"
            />
          );
        })}
        {dimensions.map((row, i) => {
          const [x, y] = coordinates(i, count, 134);
          const [lx, ly] = coordinates(i, count, 167);
          return (
            <g key={row.id}>
              <path d={`M210 210 L${x} ${y}`} stroke="#d3e3df" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fill: archetypeChartColors[row.id].label }}
              >
                {row.name}
              </text>
            </g>
          );
        })}
        <polygon
          points={values}
          fill="none"
          stroke="#ffffff"
          strokeOpacity=".65"
          strokeWidth="1.3"
        />
        {dimensions.map((row, i) => {
          const [cx, cy] = coordinates(i, count, row.score * 1.34);
          return (
            <circle
              key={row.id}
              cx={cx}
              cy={cy}
              r={selectedId === row.id ? 6 : 4}
              fill={archetypeChartColors[row.id].fill}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <g aria-hidden="true">
          {dimensions.map((row, i) => {
            const [ax, ay] = coordinates(i - 0.5, count, 190);
            const [bx, by] = coordinates(i + 0.5, count, 190);
            return (
              <path
                key={row.id}
                data-dimension={row.id}
                d={`M210 210 L${ax} ${ay} A190 190 0 0 1 ${bx} ${by} Z`}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") onSelect(row.id);
                }}
                onClick={() => onSelect(row.id)}
              />
            );
          })}
        </g>
      </svg>
      <figcaption>维度分 · 0–100</figcaption>
    </figure>
  );
}
export function JungReportPreview({
  initialArchetype = "sage",
  initialPattern = "clear",
}: {
  initialArchetype?: string;
  initialPattern?: PreviewPattern;
}) {
  const [previewId, setPreviewId] = useState(initialArchetype);
  const [previewPattern, setPreviewPattern] =
    useState<PreviewPattern>(initialPattern);
  const view = buildReportView(
    makePreviewScores(previewId, previewPattern),
    previewId,
  );
  const dimensions = view.dimensions;
  const [selectedId, setSelectedId] = useState(initialArchetype);
  const [chapter, setChapter] = useState("profile");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const selected =
    dimensions.find((row) => row.id === selectedId) ?? dimensions[0];
  const title = "荣格十二原型报告";
  const profile = view.profile;
  const archetypeDeepReadings = view.deepReadings;
  const archetypeCareerPreview = view.careers;
  const archetypeApplicationSections = view.sections;
  const resultState = commonAssets.states[view.result.state];
  const hasSingleLeader = view.result.primary.length === 1;
  const topThree =
    view.result.state === "flat"
      ? []
      : dimensions.filter((row) => view.result.readingIds.includes(row.id));
  const chartOrder = [
    "hero",
    "sage",
    "explorer",
    "creator",
    "ruler",
    "caregiver",
    "magician",
    "lover",
    "jester",
    "everyperson",
    "innocent",
    "rebel",
  ];
  const chartDimensions = chartOrder.map(
    (id) => dimensions.find((row) => row.id === id)!,
  );
  const prompt = view.prompt;
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setChapter(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -65% 0px" },
    );
    reportChapters.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  }
  const actionItems = view.actions;
  return (
    <main className={styles.page} data-result-visible-root>
      <div className={styles.previewBar}>
        <p>本地示例报告 · 固定虚构分数</p>
        <div className={styles.previewControls}>
          <label>
            阅读原型
            <select
              aria-label="阅读原型"
              value={previewId}
              onChange={(event) => {
                setPreviewId(event.target.value);
                setSelectedId(event.target.value);
                setCompleted([]);
                setCopied(false);
                setCopyFailed(false);
              }}
            >
              {archetypeAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            结果状态
            <select
              aria-label="结果状态"
              value={previewPattern}
              onChange={(event) => {
                setPreviewPattern(event.target.value as PreviewPattern);
                setCompleted([]);
                setCopied(false);
                setCopyFailed(false);
              }}
            >
              {Object.entries(commonAssets.states).map(([key, state]) => (
                <option key={key} value={key}>
                  {state.label}
                </option>
              ))}
            </select>
          </label>
          <span>十二原型 · 48 题</span>
        </div>
      </div>

      <section
        id="profile"
        className={styles.hero}
        aria-labelledby="jung-report-title"
      >
        <div className={styles.heroHeader}>
          <h1 id="jung-report-title">{title}</h1>
          <button onClick={() => window.print()}>
            <Download size={16} />
            保存为 PDF
          </button>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.portrait}>
            <p>
              {view.result.state === "flat" ? "本次分布" : "本次更突出的原型"}
            </p>
            <h2>
              {hasSingleLeader
                ? profile.name
                : view.result.state === "flat"
                  ? "分布接近"
                  : view.result.primary
                      .map(
                        (id) =>
                          archetypeAssets.find((asset) => asset.id === id)!
                            .name,
                      )
                      .join("、")}
            </h2>
            <span>{hasSingleLeader ? profile.tagline : resultState.label}</span>
            <Image
              src={
                hasSingleLeader
                  ? view.asset.illustration
                  : commonAssets.ai.illustration
              }
              width={480}
              height={480}
              priority
              alt={
                hasSingleLeader
                  ? `${profile.name}原型原创角色插画`
                  : "原型动机参考插画"
              }
            />
          </div>
          <div className={styles.heroReading}>
            <p className={styles.eyebrow}>
              {view.result.state === "flat"
                ? "十二维分布接近"
                : `本次较高分：${topThree.map((row) => row.name).join("、")}`}
            </p>
            <h3>{hasSingleLeader ? profile.headline : resultState.title}</h3>
            <p>{hasSingleLeader ? profile.introduction : resultState.body}</p>
            <div className={styles.topScores}>
              {topThree.map((row) => (
                <div key={row.id}>
                  <span>{row.name}</span>
                  <strong>{row.score}</strong>
                </div>
              ))}
            </div>
            <a className={styles.heroContinue} href="#dimensions">
              看看这些线索怎样组合起来 <ArrowDown size={17} />
            </a>
          </div>
        </div>

        <p className={styles.resultState} data-result-state={view.result.state}>
          <strong>{resultState.label}</strong>　{resultState.body}
        </p>
        {hasSingleLeader && (
          <>
            <div className={styles.profileStory}>
              <div className={styles.profileMotivation}>
                {profile.motivation.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <h3 className={styles.profileSubheading}>核心特质</h3>
              <ul className={styles.profileTraits}>
                {profile.traits.map((trait) => (
                  <li key={trait}>
                    <Check size={18} />
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
              <h3 className={styles.profileSubheading}>你的拿手好戏</h3>
              <div className={styles.profileSignature}>
                <h4>{profile.signature.title}</h4>
                <p>{profile.signature.body}</p>
                <p>{profile.signature.nextStep}</p>
              </div>
            </div>
            <div className={styles.profileGrowth}>
              <p className={styles.eyebrow}>{profile.growth.label}</p>
              <h3>{profile.growth.title}</h3>
              <p>{profile.growth.body}</p>
              <div>
                <Leaf size={19} />
                <p>{profile.growth.practice}</p>
              </div>
            </div>
          </>
        )}
      </section>

      <div className={styles.reportGrid}>
        <div className={styles.chapters}>
          <section
            id="dimensions"
            className={styles.section}
            aria-labelledby="dimension-title"
          >
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>完整分数</p>
                <h2 id="dimension-title">{"你的十二原型分布"}</h2>
              </div>
              <span>悬停或点击维度，查看解读</span>
            </div>
            <p className={styles.lead}>
              {
                "先看整体分布，再比较相邻的高分。一个人可以在不同情境里采用多种动机模式。"
              }
            </p>
            <div className={styles.scoreGrid}>
              <ProfileChart
                dimensions={chartDimensions}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <div className={styles.scoreList}>
                {dimensions.map((row) => (
                  <button
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== "touch") setSelectedId(row.id);
                    }}
                    onFocus={() => setSelectedId(row.id)}
                    aria-pressed={selected.id === row.id}
                    className={styles.scoreRow}
                  >
                    <span>{row.name}</span>
                    <div className={styles.bar}>
                      <i style={{ width: row.score + "%" }} />
                    </div>
                    <b>{row.score}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.selectedReading}>
              <span>{selected.name}</span>
              <p>{selected.reading}</p>
            </div>
          </section>

          <section
            id="reading"
            className={styles.section}
            aria-label="原型解读"
          >
            <div className={styles.readingCards}>
              {archetypeDeepReadings.map((asset, index) => {
                const dimension = dimensions.find(
                  (row) => row.id === asset.id,
                )!;
                return (
                  <article
                    key={asset.id}
                    className={styles.archetypeCard}
                    data-archetype={asset.id}
                  >
                    <header className={styles.archetypeHeader}>
                      <div>
                        <span className={styles.readingIndex}>
                          0{index + 1}
                        </span>
                        <div>
                          <h3>{dimension.name}</h3>
                        </div>
                      </div>
                      <div className={styles.readingScore}>
                        <strong>{dimension.score}</strong>
                        <span>本次维度分 · 0–100</span>
                      </div>
                    </header>
                    <div className={styles.archetypeBody}>
                      <h4 className={styles.archetypeRole}>{asset.role}</h4>
                      <p className={styles.readingText}>
                        {asset.definition}
                        {asset.narrative}
                      </p>
                      <p className={styles.readingMotive}>
                        <strong>核心追求：</strong>
                        {asset.pursuit}。
                      </p>
                      <div className={styles.readingSection}>
                        <h4>核心特质</h4>
                        <ul className={styles.readingTraits}>
                          {asset.traits.map((trait) => (
                            <li key={trait}>
                              <Check size={16} />
                              <span>{trait}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.readingSection}>
                        <h4>这种动机怎样表现</h4>
                        <p className={styles.readingText}>
                          <strong>{asset.sceneTitle}。</strong>
                          {asset.scene}
                          {asset.balanced}
                        </p>
                      </div>
                      <div className={styles.readingSection}>
                        <h4>成长方向</h4>
                        <ul className={styles.readingTraits}>
                          {asset.growth.map((direction) => (
                            <li key={direction}>
                              <ArrowRight size={16} />
                              <span>{direction}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            id="careers"
            className={styles.applicationSection}
            aria-labelledby="careers-title"
          >
            <header className={styles.applicationHeader}>
              <span className={styles.readingIndex}>04</span>
              <h2 id="careers-title">职业匹配</h2>
            </header>
            <div className={styles.applicationBody}>
              <div className={styles.matchOverview}>
                <h3>职业匹配一览</h3>
                <ul>
                  {archetypeCareerPreview.map((career) => (
                    <li key={career.slug}>
                      <Link href={`/zh/career/jobs/${career.slug}`}>
                        <span>{career.name}</span>
                        <span className={styles.matchBadge}>
                          {view.result.state === "flat"
                            ? "原型参考"
                            : "动机匹配"}{" "}
                          <ArrowRight size={13} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p>
                  {view.result.state === "flat"
                    ? `以下按当前阅读的「${view.asset.name}」整理职业任务参考；本次结果不指定主导原型。`
                    : "按本次示例的动机与职业任务关联整理，结合技能、训练要求与工作条件继续核对。"}
                </p>
                <Link className={styles.careerLibraryLink} href="/zh/career">
                  浏览全部 1046 个职业 <ArrowRight size={14} />
                </Link>
              </div>
              <div className={styles.careerMatches}>
                {archetypeCareerPreview.map((career) => (
                  <article key={career.slug}>
                    <div className={styles.careerMatchHeading}>
                      <h4>
                        <Link href={`/zh/career/jobs/${career.slug}`}>
                          {career.name}
                        </Link>
                      </h4>
                      <span>{career.focus}</span>
                    </div>
                    <p className={styles.readingText}>{career.task}</p>
                    <p className={styles.readingText}>{career.connection}</p>
                    <p className={styles.careerCheck}>{career.check}</p>
                    <div className={styles.careerMatchLinks}>
                      <Link href={`/zh/career/jobs/${career.slug}`}>
                        查看职业详情 <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {!hasSingleLeader && (
            <p className={styles.referenceNotice}>
              以下工作、关系与行动内容按当前选择的「{view.asset.name}
              」提供参考，不把它指定为主导原型。可以使用页首“阅读原型”切换了解其他动机。
            </p>
          )}
          {archetypeApplicationSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={styles.applicationSection}
              aria-labelledby={`${section.id}-title`}
            >
              <header className={styles.applicationHeader}>
                <span className={styles.readingIndex}>{section.number}</span>
                <h2 id={`${section.id}-title`}>{section.label}</h2>
              </header>
              <div className={styles.applicationBody}>
                <h3
                  className={
                    section.id === "work" ? styles.workIntroTitle : undefined
                  }
                >
                  {section.id === "work" && (
                    <span className={styles.workIntroIcon} aria-hidden="true">
                      <BriefcaseBusiness size={22} />
                    </span>
                  )}
                  {section.title}
                </h3>
                <p className={styles.readingText}>{section.intro}</p>
                {section.paragraphs.map((paragraph) => (
                  <div
                    className={styles.readingSection}
                    key={paragraph.heading}
                  >
                    <h4
                      className={
                        section.id === "work"
                          ? styles.workTopicHeading
                          : undefined
                      }
                    >
                      {section.id === "work" &&
                        (paragraph.heading.startsWith("工作中") ? (
                          <BriefcaseBusiness size={17} aria-hidden="true" />
                        ) : paragraph.heading.startsWith("压力之下") ? (
                          <Gauge size={17} aria-hidden="true" />
                        ) : (
                          <Wallet size={17} aria-hidden="true" />
                        ))}
                      {paragraph.heading}
                    </h4>
                    <p className={styles.readingText}>{paragraph.body}</p>
                  </div>
                ))}
                <div className={styles.applicationLists}>
                  <div>
                    <h4>值得保留的部分</h4>
                    <ul className={styles.readingTraits}>
                      {section.strengths.map((text) => (
                        <li key={text}>
                          <Check size={16} />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>成长空间</h4>
                    <ul className={styles.readingTraits}>
                      {section.growth.map((text) => (
                        <li key={text}>
                          <ArrowRight size={16} />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {section.id === "work" && (
                  <Link
                    className={styles.applicationCareerLink}
                    href="/zh/career"
                  >
                    带着任务、训练要求和工作条件，继续了解真实职业{" "}
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </section>
          ))}

          <section
            id="actions"
            className={styles.section}
            aria-labelledby="actions-title"
          >
            <h2 id="actions-title">行动计划</h2>
            <p className={styles.lead}>
              按自己的节奏，选择一个与当前生活有关的起点。每个阶段都留下具体经历和反馈，让下一步建立在你实际学到的东西上。
            </p>
            <div className={styles.actionList}>
              {actionItems.map(([time, heading, body], index) => (
                <label
                  key={heading}
                  className={completed.includes(index) ? styles.completed : ""}
                >
                  <input
                    type="checkbox"
                    checked={completed.includes(index)}
                    onChange={() =>
                      setCompleted((current) =>
                        current.includes(index)
                          ? current.filter((i) => i !== index)
                          : [...current, index],
                      )
                    }
                  />
                  <div>
                    <span>{time}</span>
                    <h3>{heading}</h3>
                    <p>{body}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className={styles.completion} role="status">
              <CheckCheck size={16} />
              已完成 {completed.length} / {actionItems.length} 项
            </p>
          </section>

          <section
            id="method"
            className={styles.section}
            aria-labelledby="method-title"
          >
            <h2 id="method-title">科学依据</h2>
            <div className={styles.scienceCopy}>
              {commonAssets.science.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
              <p className={styles.sources}>
                {commonAssets.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.title} <ArrowRight size={14} />
                  </a>
                ))}
                <Link href="/zh/science">
                  费马测评方法 <ArrowRight size={14} />
                </Link>
              </p>
            </div>
          </section>

          <section
            id="ai"
            className={styles.aiSection}
            aria-labelledby="ai-title"
          >
            <div className={styles.aiLayout}>
              <Image
                className={styles.aiIllustration}
                src={commonAssets.ai.illustration}
                width={960}
                height={640}
                sizes="(max-width: 760px) 180px, 220px"
                alt=""
              />
              <div>
                <h2 id="ai-title">{commonAssets.ai.title}</h2>
                <p>{commonAssets.ai.intro}</p>
                <pre className={styles.visiblePrompt}>{prompt}</pre>
                <button onClick={() => void copyPrompt()}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "已复制提示词" : "复制提示词"}
                </button>
                <span role="status" className={styles.copyStatus}>
                  {copied
                    ? "可以粘贴到你常用的 AI 对话中。"
                    : copyFailed
                      ? "复制失败，请选中上方提示词手动复制。"
                      : ""}
                </span>
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.sidebar} aria-label="报告导航">
          <div className={styles.sideInner}>
            <div className={styles.sideInsight}>
              <p>{selected.name}</p>
              <strong>{selected.score}</strong>
              <span>本次维度分</span>
              <h3>{selected.question}</h3>
              <p>{selected.practice}</p>
            </div>
            <nav aria-label="报告章节">
              {reportChapters.map(([id, label]) => (
                <a
                  href={"#" + id}
                  key={id}
                  aria-current={chapter === id ? "location" : undefined}
                  onClick={() => setChapter(id)}
                >
                  {label}
                  <ArrowRight size={14} />
                </a>
              ))}
            </nav>
            <p className={styles.sideNote}>
              从一个具体经历开始，看看哪些解读与你吻合。
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
