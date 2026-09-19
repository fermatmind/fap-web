"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CalendarDays, Check, Clipboard, GitCompareArrows, RotateCcw, UserRound, X } from "lucide-react";
import {
  candidateSectionIds,
  chapters,
  comparisons,
  previewTypes,
  scoreFixture,
  type CandidateSectionId,
  type PreviewSection,
  type PreviewTypeId,
} from "./previewContent";
import styles from "./enneagramPreview.module.css";

const candidateIds: PreviewTypeId[] = [8, 3, 9];
const observationDays = [
  ["Day 1", "记录触发", "写下发生了什么，只写可观察事实。"],
  ["Day 2", "捕捉解释", "记录你当时认为这件事意味着什么。"],
  ["Day 3", "寻找反例", "找一次没有沿着候选模式回应的经历。"],
  ["Day 4", "尝试行动", "完成已选的小行动，不追求理想表现。"],
  ["Day 5", "询问反馈", "向可信的人询问一个具体影响，不让对方给你定型。"],
  ["Day 6", "比较候选", "用同一件事比较 8、3、9 的解释力。"],
  ["Day 7", "暂定结论", "写下支持、反对与仍未知的证据。"],
] as const;

function CandidatePicker({ value, onChange }: { value: PreviewTypeId; onChange: (value: PreviewTypeId) => void }) {
  return (
    <div className={styles.candidatePicker} aria-label="切换当前阅读候选" role="group">
      {candidateIds.map((id) => {
        const item = previewTypes[id];
        return (
          <button
            type="button"
            key={id}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            style={{ "--candidate-accent": item.accent } as CSSProperties}
          >
            <strong>{item.shortName}</strong>
            <span>{item.cue}</span>
          </button>
        );
      })}
    </div>
  );
}

const scoreColors = ["#f2c3a2", "#cc7060", "#c16c32", "#685299", "#aea4e0", "#87c1d8", "#caefee", "#afc884", "#f4e9e2"];

function polarPoint(radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180;
  return { x: radius * Math.cos(radians), y: radius * Math.sin(radians) };
}

function PolarScoreChart() {
  return (
    <figure className={styles.resultChart}>
      <div className={styles.polarChartWrap}>
        <svg viewBox="35 50 500 390" role="img" aria-labelledby="polar-title polar-description">
          <title id="polar-title">九种类型的合成排版分布</title>
          <desc id="polar-description">九个扇区分别表示一至九型，扇区越长表示演示分值越高。</desc>
          <g transform="translate(285 285)">
            {scoreFixture.map((score, index) => {
              const startAngle = index * 40 + .5;
              const endAngle = (index + 1) * 40 - .5;
              const radius = score.value / 40 * 250;
              const start = polarPoint(radius, startAngle);
              const end = polarPoint(radius, endAngle);
              const innerStart = polarPoint(3, startAngle);
              const innerEnd = polarPoint(3, endAngle);
              const label = polarPoint(radius + 15, index * 40 + 20);
              return (
                <g key={score.id} className={styles.pieItem}>
                  <path
                    d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A 3 3 0 0 0 ${innerStart.x} ${innerStart.y} Z`}
                    fill={scoreColors[index]}
                  >
                    <title>{`${score.id} 型 ${score.name}：${score.value}`}</title>
                  </path>
                  <text transform={`translate(${label.x} ${label.y})`} fill={scoreColors[index]} className={styles.chartLabel}>{score.id}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <figcaption className={styles.chartCaption}>扇区越长，演示分值越高。</figcaption>
    </figure>
  );
}

function ResultOverview({ readingType }: { readingType: PreviewTypeId }) {
  const current = previewTypes[readingType];
  const overview = current.sections["2.1"];
  const atBest = current.sections["3.1"];
  const possibleCost = current.sections["3.2"];
  const distinction = current.sections["2.5"];
  return (
    <header className={styles.resultOverview} data-testid="result-overview">
      <div className={styles.resultOverviewHeader}>
        <span>01</span>
        <div>
          <h2>你的九型人格测试结果</h2>
          <p>下图呈现九种人格类型在本次测评中的相对得分分布。扇区的径向长度与得分对应；越向外延伸，说明该类型倾向在本次作答中越突出。</p>
        </div>
      </div>
      <div className={styles.resultOverviewGrid}>
        <PolarScoreChart />
        <section className={styles.aboutType} style={{ "--candidate-accent": current.accent } as CSSProperties} aria-labelledby="about-current-type">
          <div className={styles.aboutTitle}>
            <h3 id="about-current-type">关于 {current.name}</h3>
          </div>
          <p className={styles.aboutLead}>{overview.lead}</p>
          <p>{overview.paragraphs[0]}</p>
          <dl className={styles.candidateLens}>
            <div><dt>状态良好时</dt><dd>{atBest.lead}</dd></div>
            <div><dt>倾向过量时</dt><dd>{possibleCost.lead}</dd></div>
            <div><dt>优先寻找的反例</dt><dd>{distinction.question}</dd></div>
          </dl>
          <aside className={styles.resultMethodNote}>
            <strong>怎样理解这段结果</strong>
            <p>这里把注意力焦点、核心需要和惯性反应作为待验证的解释假设。当前预览没有接入正式计分，因此不报告概率、健康度、翼型或发展层次；请结合长期经历、不同压力状态和明确反例继续核对 8、3、9 三个候选。</p>
          </aside>
        </section>
      </div>
    </header>
  );
}

function SharedSection({ id, title, children, className = "" }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={`section-${id}`} data-section-id={id} data-section-scope="report" className={`${styles.reportSection} ${className}`}>
      <div className={styles.sectionNumber}>{id}</div>
      <div className={styles.sectionBody}>
        <h3>{title}</h3>
        {children}
      </div>
    </section>
  );
}

function CandidateSection({ id, section, typeId, onCompare }: { id: CandidateSectionId; section: PreviewSection; typeId: PreviewTypeId; onCompare: () => void }) {
  return (
    <section id={`section-${id}`} data-section-id={id} data-section-scope="candidate" data-reading-type={typeId} className={styles.reportSection}>
      <div className={styles.sectionNumber}>{id}</div>
      <div className={styles.sectionBody}>
        <h3>{section.title}</h3>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <ul className={styles.pointList}>
          {section.points.map((point) => <li key={point}>{point}</li>)}
        </ul>
        {id === "2.5" ? (
          <button type="button" className={styles.textButton} onClick={onCompare}>
            <GitCompareArrows size={17} aria-hidden="true" />打开三组候选对照
          </button>
        ) : null}
        {section.levels ? (
          <div className={styles.levels} aria-label="九层结构样稿">
            <ol>
              {section.levels.map((level, index) => <li key={level}><span>{index + 1}</span><p>{level}</p></li>)}
            </ol>
          </div>
        ) : null}
        <aside className={styles.reflection}><strong>核对问题</strong><p>{section.question}</p></aside>
      </div>
    </section>
  );
}

type ComparisonKey = keyof typeof comparisons;

function ComparisonDialog({ comparisonKey, onSelect, onClose }: { comparisonKey: ComparisonKey; onSelect: (key: ComparisonKey) => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = comparisons[comparisonKey];
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="comparison-title">
        <header>
          <div><span>候选辨析 · 不自动定型</span><h2 id="comparison-title">{item.label}</h2></div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="关闭候选对照"><X aria-hidden="true" /></button>
        </header>
        <nav aria-label="选择对照组合">
          {(Object.keys(comparisons) as ComparisonKey[]).map((key) => <button type="button" key={key} aria-pressed={key === comparisonKey} onClick={() => onSelect(key)}>{comparisons[key].label}</button>)}
        </nav>
        <p className={styles.situation}><strong>共同情境</strong>{item.situation}</p>
        <div className={styles.compareColumns}>
          {[item.left, item.right].map((side) => <article key={side.id} style={{ "--candidate-accent": previewTypes[side.id].accent } as CSSProperties}>
            <h3>{previewTypes[side.id].name}</h3>
            <dl><dt>更可能先关注</dt><dd>{side.focus}</dd><dt>可能回应</dt><dd>{side.response}</dd><dt>值得寻找的反例</dt><dd>{side.counter}</dd></dl>
          </article>)}
        </div>
        <footer><strong>开放问题</strong><p>{item.question}</p></footer>
      </section>
    </div>
  );
}

export function EnneagramPreview() {
  const [readingType, setReadingType] = useState<PreviewTypeId>(8);
  const [activeChapter, setActiveChapter] = useState("chapter-1");
  const [comparisonKey, setComparisonKey] = useState<ComparisonKey | null>(null);
  const [selectedAction, setSelectedAction] = useState<{ typeId: PreviewTypeId; id: string; title: string; detail: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const previousFocus = useRef<HTMLElement | null>(null);
  const current = previewTypes[readingType];
  const actions = current.sections["7.1"].actions ?? [];

  const coverage = useMemo(() => candidateIds.reduce((total, id) => total + candidateSectionIds.filter((sectionId) => previewTypes[id].sections[sectionId]).length, 7), []);

  useEffect(() => {
    const updateActiveChapter = () => {
      const readingLine = Math.max(96, window.innerHeight * 0.12);
      const currentChapter = chapters
        .map((chapter) => document.getElementById(chapter.id))
        .filter((node): node is HTMLElement => Boolean(node))
        .filter((node) => node.getBoundingClientRect().top <= readingLine)
        .at(-1);
      if (currentChapter) setActiveChapter(currentChapter.id);
    };
    updateActiveChapter();
    window.addEventListener("scroll", updateActiveChapter, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveChapter);
  }, []);

  const openComparison = () => {
    previousFocus.current = document.activeElement as HTMLElement;
    const key = readingType === 8 ? "8-3" : readingType === 3 ? "3-9" : "8-9";
    setComparisonKey(key);
  };
  const closeComparison = () => {
    setComparisonKey(null);
    requestAnimationFrame(() => previousFocus.current?.focus());
  };
  const copyPlan = async () => {
    const text = ["九型候选观察计划（前端预览）", selectedAction ? `已选行动：${selectedAction.title}（来自 ${selectedAction.typeId} 型建议）\n${selectedAction.detail}` : "已选行动：尚未选择", notes ? `记录：${notes}` : "记录：尚未填写"].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopyStatus("已复制到剪贴板");
    window.setTimeout(() => setCopyStatus(""), 1800);
  };

  return (
    <main className={styles.page} data-testid="enneagram-preview" data-content-instance-count={coverage}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>九型人格类型测评结果</h1>
          <hr className={styles.heroRule} />
          <div className={styles.heroResultMeta}>
            <span><UserRound size={20} aria-hidden="true" />自我评测</span>
            <span><CalendarDays size={20} aria-hidden="true" />2026 年 9 月 19 日 22:41</span>
          </div>
        </div>
        <div className={styles.heroMark} aria-hidden="true"><span>8</span><span>3</span><span>9</span></div>
      </header>

      <div className={styles.reportShell}>
        <aside className={styles.leftRail}>
          <nav className={styles.chapterNav} aria-label="报告章节">
            <p className={styles.railHeading}>报告章节</p>
            <div className={styles.navInner}>
              {chapters.map((chapter) => <a key={chapter.id} href={`#${chapter.id}`} onClick={() => setActiveChapter(chapter.id)} aria-current={activeChapter === chapter.id ? "location" : undefined}><span>{chapter.number}</span>{chapter.title}</a>)}
            </div>
          </nav>
        </aside>

        <article className={styles.report}>
          <section id="chapter-1" className={styles.chapter}>
            <ResultOverview readingType={readingType} />
            <SharedSection id="1.1" title="本次结果与题型来源">
              <p className={styles.lead}>本页使用独立合成情境验证完整结果页，不对应任何用户、题本或后端记录。</p>
              <div className={styles.snapshot}><div><span>来源</span><strong>前端设计样例</strong></div><div><span>候选状态</span><strong>需要继续比较</strong></div><div><span>阅读范围</span><strong>8 · 3 · 9</strong></div><div><span>真实计分</span><strong>未接入</strong></div></div>
            </SharedSection>
            <SharedSection id="1.2" title="九种类型的完整分布">
              <div className={styles.scoreChart} role="img" aria-label="九型合成排版数值条形图">
                {scoreFixture.map((score) => <div key={score.id} className={candidateIds.includes(score.id as PreviewTypeId) ? styles.scoreCandidate : ""}><span className={styles.scoreCode}>{score.id}</span><span className={styles.scoreName}>{score.name}</span><span className={styles.scoreTrack}><i style={{ width: `${score.value / 40 * 100}%` }} /></span><strong>{score.value}</strong></div>)}
              </div>
            </SharedSection>
            <SharedSection id="1.3" title="值得优先阅读的候选">
              <CandidatePicker value={readingType} onChange={setReadingType} />
            </SharedSection>
            <SharedSection id="1.4" title="怎样阅读、核对与理解这份报告">
              <p className={styles.lead}>把测量数据、类型理论和个人经历分开，才能避免让一段文字替你下结论。</p>
              <div className={styles.readingSteps}><div><span>01</span><strong>先看事实</strong><p>这次只有合成布局数据，没有真实题型、主型、翼型或层次。</p></div><div><span>02</span><strong>再读理论</strong><p>所有类型正文均标为原创预览，待正式理论审核。</p></div><div><span>03</span><strong>回到经历</strong><p>记录触发、解释、行动、反馈与反例，不追求每一段都符合。</p></div></div>
              <div className={styles.method}><ol><li>这种解释能覆盖长期经历，还是只像最近状态？</li><li>相同表现是否可能由另一种动机产生？</li><li>当环境安全时，这种回应是否会变化？</li><li>别人实际收到的影响和你的用意是否一致？</li><li>有哪些明确反例值得保留？</li></ol></div>
            </SharedSection>
          </section>

          {chapters.slice(1, 6).map((chapter) => (
            <section id={chapter.id} key={chapter.id} className={styles.chapter}>
              <ChapterHeader chapter={chapter} />
              <div key={`${readingType}-${chapter.id}`} className={styles.typeContent}>
                {chapter.sectionIds.map((sectionId) => <CandidateSection key={sectionId} id={sectionId as CandidateSectionId} section={current.sections[sectionId as CandidateSectionId]} typeId={readingType} onCompare={openComparison} />)}
              </div>
            </section>
          ))}

          <section id="chapter-7" className={styles.chapter}>
            <ChapterHeader chapter={chapters[6]} />
            <div key={`${readingType}-chapter-7`} className={styles.typeContent}>
              <CandidateSection id="7.1" section={current.sections["7.1"]} typeId={readingType} onCompare={openComparison} />
              <div className={styles.actionChooser} aria-label={`${current.name}建议`}>
                {actions.map((action) => <button type="button" key={action.id} aria-pressed={selectedAction?.id === action.id} onClick={() => setSelectedAction({ typeId: readingType, ...action })}><span>{selectedAction?.id === action.id ? <Check size={17} /> : null}</span><strong>{action.title}</strong><p>{action.detail}</p></button>)}
              </div>
              {selectedAction ? <div className={styles.selectedAction}><span>当前已选行动 · 来自 {selectedAction.typeId} 型建议</span><strong>{selectedAction.title}</strong><p>{selectedAction.detail}</p><button type="button" onClick={() => setSelectedAction(null)}>取消选择</button></div> : null}
            </div>
            <SharedSection id="7.2" title="用事实和反例核对候选">
              <p className={styles.lead}>先记录经历，再比较解释。候选切换不会清空这里的内容。</p>
              <label className={styles.notesLabel} htmlFor="observation-notes">本次预览会话记录 <span>仅保存在当前页面内存，刷新后清除</span></label>
              <textarea id="observation-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="例如：会议临时改方案时，我先注意到……我原本以为……后来得到的实际反馈是……一个反例是……" />
              <button type="button" className={styles.textButton} onClick={openComparison}><GitCompareArrows size={17} />用同一情境比较三个候选</button>
            </SharedSection>
            <SharedSection id="7.3" title="从今天开始的七天观察">
              <p className={styles.lead}>每天只做一件小事。流程不会自动启动，也不会写入账号、分析事件或真实结果。</p>
              <ol className={styles.timeline}>{observationDays.map(([day, title, detail]) => <li key={day}><span>{day}</span><div><strong>{title}</strong><p>{detail}</p></div></li>)}</ol>
            </SharedSection>
            <SharedSection id="7.4" title="怎样利用反馈，何时暂时保留结论">
              <p className={styles.lead}>反馈用于扩充事实，不让朋友、类型文字或一次行为替你做最终判断。</p>
              <div className={styles.feedbackGrid}><div><strong>可以暂定</strong><p>同一关注在不同场景长期出现，并且反例也能被解释。</p></div><div><strong>应该保留</strong><p>多个候选都只覆盖一部分，或最近状态明显影响回答。</p></div><div><strong>需要停止推断</strong><p>缺少真实数据、内容资产待审核，或解释开始变成能力与健康判断。</p></div></div>
              <div className={styles.localTools}><button type="button" onClick={() => void copyPlan()}><Clipboard size={17} />复制行动与记录</button><button type="button" onClick={() => { setNotes(""); setSelectedAction(null); setCopyStatus("已清空本轮预览记录"); }}><RotateCcw size={17} />清空本轮记录</button><span aria-live="polite">{copyStatus}</span></div>
            </SharedSection>
          </section>
        </article>
      </div>

      {comparisonKey ? <ComparisonDialog comparisonKey={comparisonKey} onSelect={setComparisonKey} onClose={closeComparison} /> : null}
    </main>
  );
}

function ChapterHeader({ chapter }: { chapter: (typeof chapters)[number] }) {
  return (
    <header className={styles.chapterHeader}>
      <span>{chapter.number}</span>
      <div><h2>{chapter.title}</h2></div>
    </header>
  );
}
