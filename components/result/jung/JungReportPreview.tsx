"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCheck,
  Copy,
  Download,
  Leaf,
} from "lucide-react";
import {
  archetypePreviewDimensions,
  archetypeDeepReadings,
  archetypeProfilePreview,
  archetypeApplicationSections,
  archetypeCareerPreview,
  reportChapters,
  type JungPreviewDimension,
} from "./jungReportPreviewData";
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
export function JungReportPreview() {
  const dimensions = archetypePreviewDimensions;
  const [selectedId, setSelectedId] = useState(dimensions[0].id);
  const [chapter, setChapter] = useState("profile");
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const selected =
    dimensions.find((item) => item.id === selectedId) ?? dimensions[0];
  const title = "荣格十二原型报告";
  const profile = archetypeProfilePreview;
  const topThree = dimensions.slice(0, 3);
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
  const prompt = `这是费马测试的${title}固定虚构示例，用于讨论报告结构。请先确认我是否已经提供自己的真实结果。\n\n示例分数：${dimensions.map((row) => row.name + "（" + row.id + "）" + row.score).join("、")}。\n\n请先问我一个最近三个月的具体经历，了解当时的任务、限制、做法和结果。结合报告，提出两种可以与经历核对的解释，并指出需要补充的资料。每次只问一个问题。最后整理一个一周内能尝试的小行动和回看标准。分数按题本量尺解释；区分报告给出的信息、我补充的经历与你提出的建议。`;
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
    } catch {
      setCopied(false);
    }
  }
  const actionItems = [
    [
      "本周 · 20 分钟",
      "找到动机出现的真实场景",
      "回看最近一次你愿意持续投入的经历。分别写下：你想弄清什么、想表达什么、想亲自尝试什么。再找一件不符合报告描述的经历，看看情境有什么不同。",
    ],
    [
      "第 2 周 · 一次小任务",
      "让理解接上实际行动",
      "选一个已经思考了一段时间的问题，写下当前判断与最关键的依据，再做出一版能被别人看见或使用的东西。约定交付边界，观察从理解到完成时，哪个环节最吸引你。",
    ],
    [
      "第 3–4 周 · 两次反馈",
      "练习一种平时较少采用的做法",
      "围绕当前任务，选择一个有需要的动作：向他人求助、明确分工、先听完感受，或允许初稿进入试用。记录它有没有改善结果；不必为了补低分而强迫自己练习所有原型。",
    ],
    [
      "第 2 个月 · 一个完整项目",
      "把熟悉的方式与新的做法接起来",
      "选择一个范围清楚的小项目，事先写下目标、投入与完成标准。过程中保留求知和创作的空间，也按约定分享进度。结束后比较兴趣、实际成果和付出的代价。",
    ],
    [
      "每季度 · 30 分钟",
      "用经历更新对自己的理解",
      "回看哪些投入仍有吸引力，哪些做法已经失去帮助，以及角色和环境发生了什么变化。保留有效的习惯，只选一个需要调整的方向进入下一阶段。",
    ],
  ];
  return (
    <main className={styles.page} data-result-visible-root>
      <div className={styles.previewBar}>
        <p>本地示例报告 · 固定虚构分数</p>
        <span>十二原型 · 48 题</span>
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
            <p>本次更突出的原型</p>
            <h2>{profile.name}</h2>
            <span>{profile.tagline}</span>
            <Image
              src={"/images/riasec/ias-researcher.webp"}
              width={480}
              height={480}
              priority
              alt={"费马狐狸插画，坐下核对图表与记录"}
            />
          </div>
          <div className={styles.heroReading}>
            <p className={styles.eyebrow}>
              {"本次较高分：智者、创造者、探索者"}
            </p>
            <h3>{profile.headline}</h3>
            <p>{profile.introduction}</p>
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
        <p className={styles.heroFootnote}>
          本报告展示过去三个月的情境自评读法。各项分数独立换算为
          0–100，当前题本尚无人群常模。
        </p>
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
              <h3>从你愿意投入的任务，寻找职业方向</h3>
              <p className={styles.readingText}>
                结合本次示例中的求知、创作与探索动机，以下三个方向可优先了解。这里展示的是任务关联，不是职业适合度排名；选择时还需要结合兴趣、技能、训练要求和工作条件。
              </p>
              <div className={styles.careerMatches}>
                {archetypeCareerPreview.map((career) => (
                  <article key={career.slug}>
                    <div className={styles.careerMatchHeading}>
                      <h4>{career.name}</h4>
                      <span>{career.focus}</span>
                    </div>
                    <p className={styles.readingText}>{career.task}</p>
                    <p className={styles.readingText}>{career.connection}</p>
                    <p className={styles.careerCheck}>{career.check}</p>
                    <div className={styles.careerMatchLinks}>
                      <Link href={`/zh/career/jobs/${career.slug}`}>
                        查看职业详情 <ArrowRight size={14} />
                      </Link>
                      <a href={career.source} target="_blank" rel="noreferrer">
                        任务来源：O*NET
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

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
                <h3>{section.title}</h3>
                <p className={styles.readingText}>{section.intro}</p>
                {section.paragraphs.map((paragraph) => (
                  <div
                    className={styles.readingSection}
                    key={paragraph.heading}
                  >
                    <h4>{paragraph.heading}</h4>
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
            <p className={styles.eyebrow}>从理解到实践</p>
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
            <p className={styles.eyebrow}>理论来源与测量边界</p>
            <h2 id="method-title">科学依据</h2>
            <div className={styles.scienceCopy}>
              <h3>从荣格的原型概念，到现代十二原型框架</h3>
              <p>
                荣格以原型讨论反复出现在神话、象征与心理经验中的模式。今天常见的十二原型应用框架，由
                Carol S. Pearson
                在荣格等人的思想基础上发展；它不是荣格本人制定的十二种人格分类。原型名称帮助我们讨论动机与生活叙事，不把一个人限定为单一类型。
              </p>
              <h3>理论框架、具体量表与验证证据需要分开</h3>
              <p>
                Pearson-Marr Archetype
                Indicator®（PMAI®）是有独立题目、计分方法和研究资料的量表。费马使用自己的原创题本，因此不能把
                PMAI
                的信效度结果直接当作本题本的验证。当前题本尚未建立人群常模，也没有可用于承诺个体预测准确性的信效度证据。
              </p>
              <h3>这份报告的分数说明什么</h3>
              <p>
                本题本有 48 道五档自评题，每个原型 4 题，各维独立换算到
                0–100。分数表示相关描述在本次回答中得到的认同程度，不是人群百分位，也不代表十二项比例之和为
                100%。回答可能随经历、角色与状态改变；相同或接近的高分应结合具体经历一起看。
              </p>
              <h3>怎样使用更有帮助</h3>
              <p>
                把解读作为可以核对的线索，同时寻找符合与不符合的经历。职业、关系、压力和金钱部分提供反思方向，不据此判断能力、诊断心理问题、预测职业表现或投资适合度。本页使用固定虚构分数，供查看报告结构与内容。
              </p>
              <p className={styles.sources}>
                <a
                  href="https://carolspearson.com/about/the-pearson-12-archetype-system-human-development-and-evolution"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pearson 十二原型框架 <ArrowRight size={14} />
                </a>
                <a
                  href="https://www.storywell.com/about-the-pmai/Why-is-Scientific-Validity-Important.htm"
                  target="_blank"
                  rel="noreferrer"
                >
                  PMAI 的测量与验证说明 <ArrowRight size={14} />
                </a>
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
                src="/images/riasec/ai-career-interests.webp"
                width={960}
                height={640}
                sizes="(max-width: 760px) 180px, 220px"
                alt=""
              />
              <div>
                <p className={styles.eyebrow}>继续探索</p>
                <h2 id="ai-title">和 AI 继续探索你的原型动机</h2>
                <p>
                  带着结果和一段真实经历，和 AI
                  一起梳理。先核对它有没有读懂报告，再讨论你想改变的事。
                </p>
                <pre className={styles.visiblePrompt}>{prompt}</pre>
                <button onClick={() => void copyPrompt()}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "已复制提示词" : "复制提示词"}
                </button>
                <span role="status" className={styles.copyStatus}>
                  {copied ? "可以粘贴到你常用的 AI 对话中。" : ""}
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
      <div className={styles.end}>
        <p>看见一种习惯，也多一种选择。</p>
        <Link href="/zh/tests/jung-test">
          了解荣格十二原型测试 <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}
