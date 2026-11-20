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
  MessageCircle,
} from "lucide-react";
import {
  archetypePreviewDimensions,
  archetypeDeepReadings,
  archetypeProfilePreview,
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
                style={{
                  fill: `color-mix(in srgb, ${archetypeChartColors[row.id].fill} 55%, white)`,
                }}
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
      "今天 · 10 分钟",
      "从一件真实的小事开始",
      "选一次你主动查资料、修改作品或尝试新方法的经历。写下当时想解决什么、自己做了什么，以及哪个环节最让你愿意继续。",
    ],
    [
      "这周 · 30 分钟",
      "让一个想法得到真实反馈",
      "把正在琢磨的东西做成一页草稿，找一位真正会使用它的人试读。先听对方卡在哪里，再决定要继续查证还是先改一版。",
    ],
    [
      "一周后 · 15 分钟",
      "回看兴趣，也回看代价",
      "比较这次行动前后的感受。你想重复的是查证、表达还是探索？哪部分让你耗竭？给下一次尝试加一条更合适的边界。",
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
            <p className={styles.eyebrow}>{"智者 × 创造者 × 探索者"}</p>
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
                          <p>{asset.englishName}</p>
                        </div>
                      </div>
                      <div className={styles.readingScore}>
                        <strong>{dimension.score}</strong>
                        <span>本次维度分 · 0–100</span>
                      </div>
                    </header>
                    <div className={styles.archetypeBody}>
                      <h4 className={styles.archetypeRole}>{asset.role}</h4>
                      <p className={styles.archetypeDefinition}>
                        {asset.definition}
                      </p>
                      <div className={styles.motivePair}>
                        <div>
                          <span>核心追求</span>
                          <p>{asset.pursuit}</p>
                        </div>
                        <div>
                          <span>值得留意</span>
                          <p>{asset.watchFor}</p>
                        </div>
                      </div>
                      <p className={styles.archetypeNarrative}>
                        {asset.narrative}
                      </p>
                      <h4 className={styles.readingSubheading}>
                        你可能熟悉的表现
                      </h4>
                      <ul className={styles.readingTraits}>
                        {asset.traits.map((trait) => (
                          <li key={trait}>
                            <Check size={16} />
                            <span>{trait}</span>
                          </li>
                        ))}
                      </ul>
                      <div className={styles.readingScene}>
                        <p>一个具体场景</p>
                        <h4>{asset.sceneTitle}</h4>
                        <p>{asset.scene}</p>
                      </div>
                      <div className={styles.readingBalance}>
                        <div>
                          <h4>运用得合适时</h4>
                          <p>{asset.balanced}</p>
                        </div>
                        <div>
                          <h4>用得过多时</h4>
                          <p>{asset.overused}</p>
                        </div>
                      </div>
                      <div className={styles.readingCombination}>
                        <h4>与另外两个原型一起看</h4>
                        <p>{asset.combination}</p>
                      </div>
                    </div>
                    <footer className={styles.readingGrowth}>
                      <div>
                        <Leaf size={19} />
                        <h4>这周可以试一次</h4>
                      </div>
                      <p>{asset.action}</p>
                      <p className={styles.readingReflection}>
                        {asset.reflection}
                      </p>
                    </footer>
                  </article>
                );
              })}
            </div>
            <details className={styles.allReadings}>
              <summary>{"查看其余九个原型的解读"}</summary>
              {dimensions.slice(3).map((row) => (
                <article key={row.id}>
                  <h3>
                    {row.id.length === 2 ? row.id + " · " : ""}
                    {row.name} <small>{row.score} 分</small>
                  </h3>
                  <p>{row.reading}</p>
                  <p>
                    <strong>观察一次</strong>　{row.practice}
                  </p>
                </article>
              ))}
            </details>
          </section>

          <section
            id="work"
            className={styles.section}
            aria-labelledby="work-title"
          >
            <p className={styles.eyebrow}>工作与协作</p>
            <h2 id="work-title">{"让理解变成别人用得上的成果"}</h2>
            <p className={styles.lead}>
              {
                "你可以从任务内容和协作方式寻找线索。一次有吸引力的工作，可能同时给你查证的空间、表达的自主权，以及接触反馈的机会。"
              }
            </p>
            <div className={styles.twoColumns}>
              <article>
                <h3>更容易投入的环节</h3>
                <ul>
                  {[
                    "比较多种解释，找出影响决定的关键证据。",
                    "把复杂信息做成指南、方案或可试用的初稿。",
                    "与使用者一起检查哪些地方仍然讲不清。",
                  ].map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </article>
              <article>
                <h3>可以向合作方问清楚</h3>
                <ul>
                  {[
                    "这项任务什么时候算已经查得足够？",
                    "我能参与哪些表达与修改决定？",
                    "完成后，能直接听到使用者的反馈吗？",
                  ].map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </article>
            </div>
            <div className={styles.careerBridge}>
              <div>
                <h3>把动机线索带到真实职业里</h3>
                <p>
                  选一个你正在考虑的岗位，对照每天的任务、训练要求和工作条件，再决定要试哪一小段。
                </p>
              </div>
              <Link href="/zh/career">
                去职业库核对 <ArrowRight size={17} />
              </Link>
            </div>
            <div className={styles.taskExamples}>
              {[
                [
                  "technical-writers",
                  "技术写作者",
                  "把复杂流程改写成清楚的操作说明。",
                ],
                [
                  "training-and-development-specialists",
                  "培训相关任务",
                  "根据学习者的困难，调整内容和练习顺序。",
                ],
              ].map(([slug, name, task]) => (
                <Link key={slug} href={"/zh/career/jobs/" + slug}>
                  <span>{name}</span>
                  <p>{task}</p>
                  <span className={styles.textLink}>
                    查看实际任务 <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section
            id="relationships"
            className={styles.section}
            aria-labelledby="relationships-title"
          >
            <p className={styles.eyebrow}>关系与沟通</p>
            <h2 id="relationships-title">{"先听见感受，再一起寻找解释"}</h2>
            <p className={styles.lead}>
              {
                "你可能习惯用分析和建议表达关心。当对方需要的只是被认真听完时，先确认要不要一起解决问题，会让你的投入更容易被接住。"
              }
            </p>
            <div className={styles.dialogue}>
              <MessageCircle size={23} />
              <div>
                <h3>下一次可以这样开口</h3>
                <p>{"“你现在更希望我先听你讲，还是我们一起想一个办法？”"}</p>
              </div>
            </div>
            <div className={styles.twoColumns}>
              <article>
                <h3>发生分歧时</h3>
                <p>
                  先复述对方最在意的一点，再说明自己的判断与限制。将“你总是这样”换成这一次能共同检查的具体行为。
                </p>
              </article>
              <article>
                <h3>回看一次互动</h3>
                <p>
                  我表达的是事实、推测，还是期待？对方是否真的理解了我提出的请求？哪些部分需要重新问清楚？
                </p>
              </article>
            </div>
          </section>

          <section
            id="stress"
            className={styles.section}
            aria-labelledby="stress-title"
          >
            <p className={styles.eyebrow}>压力与盲区</p>
            <h2 id="stress-title">{"当擅长的做法开始用得太多"}</h2>
            <p className={styles.lead}>
              {
                "持续查资料、反复改初稿，可能帮助你获得把握，也可能让休息和交付不断后移。把这些行为放回当时的任务和负荷里，看看是否需要换一种做法。"
              }
            </p>
            <div className={styles.stressRows}>
              {[
                [
                  "值得观察的信号",
                  "同一个问题查过很多遍，新的资料已经不再改变决定。",
                ],
                [
                  "换一个可执行的动作",
                  "把“还没弄清”写成一条具体待查项，只验证它。",
                ],
                [
                  "给恢复留出空间",
                  "约定一版可以先交出去的结果，明确今天什么时候停下来。",
                ],
              ].map(([heading, text]) => (
                <article key={heading}>
                  <h3>{heading}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="actions"
            className={styles.section}
            aria-labelledby="actions-title"
          >
            <p className={styles.eyebrow}>成长行动</p>
            <h2 id="actions-title">用一周，验证一条线索</h2>
            <p className={styles.lead}>
              挑一项与你当下生活有关的尝试。完成后勾选，再回到自己的经历里看它有没有帮助。
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
              已完成 {completed.length} / 3 项
            </p>
          </section>

          <section
            id="method"
            className={styles.section}
            aria-labelledby="method-title"
          >
            <p className={styles.eyebrow}>测评方法</p>
            <h2 id="method-title">这份结果怎样得到</h2>
            <dl className={styles.method}>
              <div>
                <dt>题本与计分</dt>
                <dd>
                  {
                    "48 道情境自评，每个原型 4 题。按五档作答后，将各维度得分分别换算到 0–100。原型分数相同或接近时，一起比较具体经历。"
                  }
                </dd>
              </div>
              <div>
                <dt>分数怎样使用</dt>
                <dd>
                  参考过去三个月的真实情境，比较自己更常采用的做法。每次作答受到经历、角色与当时状态影响，当前题本尚未建立人群常模。
                </dd>
              </div>
              <div>
                <dt>理论与题本</dt>
                <dd>
                  {
                    "费马原创题本参考荣格原型概念与 Carol S. Pearson 的十二原型应用框架。"
                  }{" "}
                  此预览使用固定虚构分数和待评审的原创解读。
                </dd>
              </div>
            </dl>
            <p className={styles.sources}>
              <a
                href={
                  "https://www.carolspearson.com/about/the-pearson-12-archetype-system"
                }
              >
                {"Pearson 十二原型框架"} <ArrowRight size={14} />
              </a>
              <Link href="/zh/science">
                费马测评方法 <ArrowRight size={14} />
              </Link>
            </p>
          </section>

          <section
            id="ai"
            className={styles.aiSection}
            aria-labelledby="ai-title"
          >
            <div>
              <p className={styles.eyebrow}>继续探索</p>
              <h2 id="ai-title">把报告，变成一次具体的对话</h2>
              <p>
                带着结果和一段真实经历，和 AI
                一起梳理。先核对它有没有读懂报告，再讨论你想改变的事。
              </p>
              <button onClick={() => void copyPrompt()}>
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? "已复制提示词" : "复制提示词"}
              </button>
              <span role="status" className={styles.copyStatus}>
                {copied ? "可以粘贴到你常用的 AI 对话中。" : ""}
              </span>
            </div>
            <details>
              <summary>查看完整提示词</summary>
              <pre>{prompt}</pre>
            </details>
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
