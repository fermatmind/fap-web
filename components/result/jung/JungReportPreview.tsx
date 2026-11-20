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
  Sparkles,
} from "lucide-react";
import {
  archetypePreviewDimensions,
  functionPreviewDimensions,
  previewCandidates,
  reportChapters,
  type JungPreviewDimension,
  type JungPreviewForm,
} from "./jungReportPreviewData";
import styles from "./JungReportPreview.module.css";

function coordinates(index: number, count: number, radius: number) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return [210 + Math.cos(angle) * radius, 210 + Math.sin(angle) * radius].map(
    (value) => Number(value.toFixed(3)),
  );
}

function ProfileChart({ dimensions }: { dimensions: JungPreviewDimension[] }) {
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
              >
                {count === 8 ? row.id : row.name}
              </text>
            </g>
          );
        })}
        <polygon
          points={values}
          fill="#3b8c7e"
          fillOpacity=".18"
          stroke="#368576"
          strokeWidth="2.5"
        />
        {dimensions.map((row, i) => {
          const [cx, cy] = coordinates(i, count, row.score * 1.34);
          return (
            <circle
              key={row.id}
              cx={cx}
              cy={cy}
              r="4"
              fill="#246b60"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <figcaption>维度分 · 0–100</figcaption>
    </figure>
  );
}

export function JungReportPreview({ form }: { form: JungPreviewForm }) {
  const archetypes = form === "archetypes";
  const dimensions = archetypes
    ? archetypePreviewDimensions
    : functionPreviewDimensions;
  const [selectedId, setSelectedId] = useState(dimensions[0].id);
  const [chapter, setChapter] = useState("profile");
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const selected =
    dimensions.find((item) => item.id === selectedId) ?? dimensions[0];
  const title = archetypes ? "荣格十二原型报告" : "荣格八维认知功能报告";
  const topThree = dimensions.slice(0, 3);
  const chartOrder = archetypes
    ? [
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
      ]
    : ["Ni", "Ne", "Ti", "Te", "Fi", "Fe", "Si", "Se"];
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

  const actionItems = archetypes
    ? [
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
      ]
    : [
        [
          "今天 · 10 分钟",
          "回看一次你协调过的分歧",
          "写下你先注意到的是谁的反应、过去的经验，还是某个可能的后果。尽量记录当时真正做过的事。",
        ],
        [
          "这周 · 一次对话",
          "给自己的判断留出位置",
          "在下一次共同决策里，先用一句话说明你的判断及依据，再听其他人的补充。观察讨论是否因此更清楚。",
        ],
        [
          "一周后 · 15 分钟",
          "比较两种做法的效果",
          "挑一次沿用熟悉经验、一次尝试新方法的决定。比较各自适用的条件，记录哪些步骤值得保留。",
        ],
      ];

  return (
    <main className={styles.page} data-result-visible-root>
      <div className={styles.previewBar}>
        <p>本地示例报告 · 固定虚构分数</p>
        <nav aria-label="切换报告题本">
          <Link
            href="?form=archetypes"
            aria-current={archetypes ? "page" : undefined}
          >
            十二原型 · 48 题
          </Link>
          <Link
            href="?form=functions"
            aria-current={!archetypes ? "page" : undefined}
          >
            八维认知功能 · 64 题
          </Link>
        </nav>
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
            <p>{archetypes ? "本次更突出的动机" : "本次更常采用的策略"}</p>
            <h2>{archetypes ? "智者" : "Fe × Si"}</h2>
            <span>
              {archetypes ? "理解之后，让想法有形" : "外倾情感 × 内倾感觉"}
            </span>
            <Image
              src={
                archetypes
                  ? "/images/riasec/ias-researcher.webp"
                  : "/images/riasec/social.webp"
              }
              width={480}
              height={480}
              priority
              alt={
                archetypes
                  ? "费马狐狸插画，坐下核对图表与记录"
                  : "费马狐狸插画，耐心示范并邀请对方参与"
              }
            />
          </div>
          <div className={styles.heroReading}>
            <p className={styles.eyebrow}>
              {archetypes ? "智者 × 创造者 × 探索者" : "先看策略，再比较候选"}
            </p>
            <h3>
              {archetypes
                ? "想弄明白，也想亲手做出来"
                : "让大家接得上，也让事情有章可循"}
            </h3>
            <p>
              {archetypes
                ? "面对复杂问题，你可能先查清依据，再把理解变成一份别人能用的东西。新的问题会点燃好奇，真正让你投入的，是找到解释并看见它开始起作用。"
                : "这组示例回答里，关注参与者的需要、借助熟悉经验安排下一步，两种策略相对突出。你可能常在协调关系与维持事情连续性之间来回切换。"}
            </p>
            <div className={styles.topScores}>
              {topThree.map((row) => (
                <div key={row.id}>
                  <span>
                    {archetypes ? row.name : row.id + " · " + row.name}
                  </span>
                  <strong>{row.score}</strong>
                </div>
              ))}
            </div>
            <div className={styles.heroInsight}>
              <Sparkles size={20} />
              <p>
                {archetypes
                  ? "可以留意一个取舍：当“再弄清一点”和“先交出一版”同时出现时，你通常会先做哪一个？"
                  : "可以留意一个取舍：当大家期待你答应，而自己的判断还有疑问时，你通常会先照顾什么？"}
              </p>
            </div>
            <a className={styles.heroContinue} href="#dimensions">
              看看这些线索怎样组合起来 <ArrowDown size={17} />
            </a>
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
                <h2 id="dimension-title">
                  {archetypes ? "你的十二原型分布" : "你的八维认知功能分布"}
                </h2>
              </div>
              <span>点击维度，查看解读</span>
            </div>
            <p className={styles.lead}>
              {archetypes
                ? "先看整体分布，再比较相邻的高分。一个人可以在不同情境里采用多种动机模式。"
                : "先看各功能在本次回答中的位置，再回到具体决定，核对你通常怎样获取信息和作出判断。"}
            </p>
            <div className={styles.scoreGrid}>
              <ProfileChart dimensions={chartDimensions} />
              <div className={styles.scoreList}>
                {dimensions.map((row) => (
                  <button
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    aria-pressed={selected.id === row.id}
                    className={styles.scoreRow}
                  >
                    <span>{archetypes ? row.name : row.id}</span>
                    <div className={styles.bar}>
                      <i style={{ width: row.score + "%" }} />
                    </div>
                    <b>{row.score}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.selectedReading}>
              <span>
                {archetypes
                  ? selected.name
                  : selected.id + " · " + selected.name}
              </span>
              <p>{selected.reading}</p>
            </div>
            {!archetypes && (
              <div className={styles.axes}>
                <h3>四组功能轴</h3>
                <p>
                  同一轴的两项分数各自计分。分差可以提示接下来值得核对的做法。
                </p>
                {[
                  ["Ni", "Se"],
                  ["Ne", "Si"],
                  ["Ti", "Fe"],
                  ["Te", "Fi"],
                ].map(([left, right]) => {
                  const a = dimensions.find((row) => row.id === left)!;
                  const b = dimensions.find((row) => row.id === right)!;
                  return (
                    <div key={left}>
                      <span>
                        {left} / {right}
                      </span>
                      <strong>{a.score > b.score ? left : right} 较高</strong>
                      <span>相差 {Math.abs(a.score - b.score)} 分</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section
            id="reading"
            className={styles.section}
            aria-labelledby="reading-title"
          >
            <p className={styles.eyebrow}>深入解读</p>
            <h2 id="reading-title">
              {archetypes
                ? "三种动机，怎样一起出现在你身上"
                : "从常用策略，到功能栈候选"}
            </h2>
            {archetypes ? (
              <>
                <p className={styles.lead}>
                  同一次任务里，你可能先想弄清原因，接着想做出自己的版本，最后又对另一种做法产生好奇。以下用三个不同的关注点拆开看。
                </p>
                {topThree.map((row, i) => (
                  <article className={styles.deepReading} key={row.id}>
                    <div className={styles.readingTitle}>
                      <span>{row.name}</span>
                      <h3>{row.question}</h3>
                    </div>
                    <p>{row.reading}</p>
                    <div className={styles.twoColumns}>
                      <div>
                        <h4>能带来的贡献</h4>
                        <p>{row.strength}</p>
                      </div>
                      <div>
                        <h4>值得留意的代价</h4>
                        <p>{row.blindSpot}</p>
                      </div>
                    </div>
                    <p className={styles.practice}>
                      <Leaf size={17} />
                      <span>{row.practice}</span>
                    </p>
                    {i === 0 && (
                      <blockquote>
                        比如要给同事介绍一套新工具。你先比较资料、弄清原理，再写成操作指南。值得观察的是，什么时候这份指南已经足够让一个人先试起来。
                      </blockquote>
                    )}
                  </article>
                ))}
              </>
            ) : (
              <>
                <p className={styles.lead}>
                  根据这组固定示例，先比较以下功能栈的组织方式。候选顺序只表示当前题本模型的排序，最终需要用自己的经历逐项核对。
                </p>
                <div className={styles.candidates}>
                  {previewCandidates.map((candidate) => (
                    <article key={candidate.type}>
                      <h3>{candidate.type}</h3>
                      <p className={styles.stack}>
                        {candidate.stack.join(" → ")}
                      </p>
                      <p>{candidate.question}</p>
                    </article>
                  ))}
                </div>
                <h3>把相似候选分开的两个问题</h3>
                <p>
                  面对一个陌生团队，你会先了解大家的需要，还是先弄清既有分工和习惯？当熟悉流程不再奏效，你更愿意沿着实际反馈逐步调整，还是先形成一个新的长期方向？各找一件真实的事来回答，比只选择一个标签更容易看出差异。
                </p>
                <div className={styles.twoColumns}>
                  {topThree.slice(0, 2).map((row) => (
                    <article key={row.id}>
                      <h3>
                        {row.id} · {row.name}
                      </h3>
                      <p>{row.reading}</p>
                      <h4>可以试一次</h4>
                      <p>{row.practice}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
            <details className={styles.allReadings}>
              <summary>
                {archetypes
                  ? "查看其余九个原型的解读"
                  : "查看其余六个功能的解读"}
              </summary>
              {dimensions.slice(archetypes ? 3 : 2).map((row) => (
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
            <h2 id="work-title">
              {archetypes
                ? "让理解变成别人用得上的成果"
                : "让共识成为一项清楚的约定"}
            </h2>
            <p className={styles.lead}>
              {archetypes
                ? "你可以从任务内容和协作方式寻找线索。一次有吸引力的工作，可能同时给你查证的空间、表达的自主权，以及接触反馈的机会。"
                : "当团队需要对齐期待、延续一个已有流程时，这组常用策略可能派上用场。也值得观察，协调工作是否挤占了你独立判断和恢复精力的时间。"}
            </p>
            <div className={styles.twoColumns}>
              <article>
                <h3>更容易投入的环节</h3>
                <ul>
                  {(archetypes
                    ? [
                        "比较多种解释，找出影响决定的关键证据。",
                        "把复杂信息做成指南、方案或可试用的初稿。",
                        "与使用者一起检查哪些地方仍然讲不清。",
                      ]
                    : [
                        "发现大家对同一个任务其实有不同理解。",
                        "用清楚的分工、经验和提醒减少遗漏。",
                        "跟进一项安排是否真正照顾到参与者的需要。",
                      ]
                  ).map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </article>
              <article>
                <h3>可以向合作方问清楚</h3>
                <ul>
                  {(archetypes
                    ? [
                        "这项任务什么时候算已经查得足够？",
                        "我能参与哪些表达与修改决定？",
                        "完成后，能直接听到使用者的反馈吗？",
                      ]
                    : [
                        "哪些事情由我决定，哪些需要共同确认？",
                        "出现分歧时，怎样保留不同意见？",
                        "协调与跟进的投入是否有明确的时间边界？",
                      ]
                  ).map((text) => (
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
              {(archetypes
                ? [
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
                  ]
                : [
                    [
                      "training-and-development-specialists",
                      "培训相关任务",
                      "听清学习者的难点，再组织示范和反馈。",
                    ],
                    [
                      "technical-writers",
                      "技术写作者",
                      "把共同约定转成别人能照着做的说明。",
                    ],
                  ]
              ).map(([slug, name, task]) => (
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
            <h2 id="relationships-title">
              {archetypes
                ? "先听见感受，再一起寻找解释"
                : "照顾关系，也说清自己的需要"}
            </h2>
            <p className={styles.lead}>
              {archetypes
                ? "你可能习惯用分析和建议表达关心。当对方需要的只是被认真听完时，先确认要不要一起解决问题，会让你的投入更容易被接住。"
                : "你可能会主动注意别人是否舒服、事情是否顺利。持续的关系也需要对方听见你的偏好和限制，尤其是当“我都可以”已经变成不自觉的习惯。"}
            </p>
            <div className={styles.dialogue}>
              <MessageCircle size={23} />
              <div>
                <h3>下一次可以这样开口</h3>
                <p>
                  {archetypes
                    ? "“你现在更希望我先听你讲，还是我们一起想一个办法？”"
                    : "“我想把这件事安排好，也需要留出一点自己的时间。我们可以一起重新分一下吗？”"}
                </p>
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
            <h2 id="stress-title">
              {archetypes
                ? "当擅长的做法开始用得太多"
                : "当协调变成反复检查与自我消耗"}
            </h2>
            <p className={styles.lead}>
              {archetypes
                ? "持续查资料、反复改初稿，可能帮助你获得把握，也可能让休息和交付不断后移。把这些行为放回当时的任务和负荷里，看看是否需要换一种做法。"
                : "在需求不断增加时，你可能更频繁确认别人是否满意、流程是否出错。先看工作量、睡眠和责任范围，再观察自己是否一直重复同一种策略。"}
            </p>
            <div className={styles.stressRows}>
              {(archetypes
                ? [
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
                  ]
                : [
                    [
                      "值得观察的信号",
                      "反复确认别人的反应，却还没问自己是否愿意承担。",
                    ],
                    [
                      "换一个可执行的动作",
                      "将最担心的后果写下来，与相关的人确认发生时怎样处理。",
                    ],
                    [
                      "给恢复留出空间",
                      "减少一项可以延期的协调任务，给独处和休息留出时间。",
                    ],
                  ]
              ).map(([heading, text]) => (
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
                  {archetypes
                    ? "48 道情境自评，每个原型 4 题。按五档作答后，将各维度得分分别换算到 0–100。原型分数相同或接近时，一起比较具体经历。"
                    : "64 道情境自评，每个功能 8 题。各功能独立换算到 0–100，四组功能轴显示两项之差。候选按费马功能栈配对规则排序，近分时需要保留多个解释。"}
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
                  {archetypes
                    ? "费马原创题本参考荣格原型概念与 Carol S. Pearson 的十二原型应用框架。"
                    : "费马原创题本参考荣格心理类型与八种认知功能的解释框架。功能栈候选采用本题本的规则。"}{" "}
                  此预览使用固定虚构分数和待评审的原创解读。
                </dd>
              </div>
            </dl>
            <p className={styles.sources}>
              <a
                href={
                  archetypes
                    ? "https://www.carolspearson.com/about/the-pearson-12-archetype-system"
                    : "https://archive.org/details/psychologicaltyp00jung"
                }
              >
                {archetypes ? "Pearson 十二原型框架" : "荣格《心理类型》"}{" "}
                <ArrowRight size={14} />
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
              <p>
                {archetypes
                  ? selected.name
                  : selected.id + " · " + selected.name}
              </p>
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
          了解荣格两套测试 <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}
