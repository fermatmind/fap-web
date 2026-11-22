"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getMbtiResultPortrait } from "@/lib/mbti/resultPortrait";
import { mbtiFunctionDetails, mbtiFunctionStacks, type MbtiLandingType } from "@/lib/mbti/landingTypeDynamics";
import { mbtiLandingAxes, mbtiLandingChapters, mbtiPublicSampleHref, type MbtiLandingPublicSample } from "@/lib/mbti/landingReportPreview";
import { mbtiTypeGroups } from "@/lib/tests/assessmentLandingEditorial";
import { hollandDimensions } from "@/lib/tests/hollandLanding";
import shared from "./holland-landing.module.css";
import styles from "./assessment-landing-editorial.module.css";

const mbtiDemos = [
  { code: "INTP", scores: [30, 34, 68, 48], note: "52% P，接近中间。订机票时你想把时间定好，周末散步时却喜欢走到哪算哪。哪些事你更想留一点余地？" },
  { code: "ENFJ", scores: [86, 36, 28, 68], note: "86% E，这次作答明显偏向 E。你可能更常在和别人聊的过程中理清想法，也可以享受独处的时间。" },
] as const;
const archetypes = mbtiTypeGroups.flatMap(group => [...group.types]);

const careerSamples = [
  { name: "研究与设计", interest: [43, 86, 79, 48, 39, 45], style: "先独立分析，再与团队评审", conditions: "尽量保留固定工时与学习时间" },
  { name: "教学与组织", interest: [36, 54, 57, 88, 74, 61], style: "高频沟通，分阶段推进项目", conditions: "优先核实导师支持及活动排期" },
  { name: "工程与实作", interest: [88, 76, 51, 36, 42, 66], style: "动手验证，按步骤复核", conditions: "提前了解轮班安排和上岗培训" },
] as const;

export function MbtiLandingReportPreview({ sample, locale = "zh", labels, notes }: {
  sample: MbtiLandingPublicSample;
  locale?: "zh" | "en" | "zh-TW";
  labels?: readonly string[];
  notes?: readonly string[];
}) {
  const [active, setActive] = useState(0);
  const [chapter, setChapter] = useState(0);
  const demo = active === 0 ? null : mbtiDemos[active - 1];
  const type = demo?.code ?? "ISFJ";
  const [, name, portraitLine] = archetypes.find(([code]) => code === type)!;
  const portrait = getMbtiResultPortrait(type);
  const scores = demo?.scores ?? sample.scores;
  const t = (zh: string, en: string, tw: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const sampleLabels = labels ?? ["ISFJ-T · 守卫者", "INTP · 逻辑学家", "ENFJ · 主人公"];
  const axisNames = locale === "en" ? ["Energy", "Information", "Decisions", "Structure"] : ["精力來源", "接收資訊", "決策偏好", "生活步調"];
  const localizedChapters = locale === "en" ? ["Personality", "Career", "Growth", "Relationships"]
    : locale === "zh-TW" ? ["人格特質", "職涯道路", "個人成長", "人際關係"] : mbtiLandingChapters;
  return <aside className={styles.mbtiReport} aria-label={t("MBTI 报告样张", "Sample MBTI report", "MBTI 報告範例")}>
    <div className={styles.reportHeader}>
      <h2>{t("你的报告会是什么样？", "See what your report looks like", "看看你會收到怎樣的報告")}</h2>
      <span>{demo ? t("演示数据", "Illustrative data", "示意資料") : t("真实公开样张", "Fixed public sample", "公開固定範例")}</span>
    </div>
    <div className={styles.reportTabs} role="group" aria-label={t("切换报告样张", "Switch sample profile", "切換報告範例")}>
      {sampleLabels.map((label, index) =>
        <button key={label} type="button" aria-pressed={index === active} aria-controls="mbti-sample-profile"
          onClick={() => { setActive(index); setChapter(0); }}>{label}</button>)}
    </div>
    <div id="mbti-sample-profile" className={styles.sampleBody}>
      <div className={styles.reportIdentity}>
        <div><p><strong>{demo?.code ?? sample.code}</strong> <span>{locale === "zh" ? name : sampleLabels[active].split(" · ")[1]}</span></p>
          <p>{demo ? (notes?.[active] ?? portraitLine) : sample.portraitLine}</p></div>
        {portrait && <Image src={portrait} alt="" width={360} height={520} sizes="(max-width: 570px) 53px, 68px" loading={active === 0 ? "eager" : "lazy"} />}
      </div>
      <ul className={styles.axisList} aria-label={t("四组偏好分数", "Four preference scores", "四組偏好分數")}>{mbtiLandingAxes.map(([axis, left, right, label], index) => {
        const score = scores[index];
        const offset = Math.abs(score - 50);
        const direction = score > 50 ? "left" : score < 50 ? "right" : "even";
        return <li key={axis} data-axis={axis} data-direction={direction}>
          <div className={styles.axisLegend}>
            <span><b data-winner={direction === "left"}>{left}</b> {score}%</span>
            <span>{locale === "zh" ? label : axisNames[index]} <small>· {t("清晰度", "Clarity", "清晰度")} {offset * 2}</small></span>
            <span>{100 - score}% <b data-winner={direction === "right"}>{right}</b></span>
          </div>
          <div className={styles.divergingBar} aria-hidden="true">
            <span data-preference-fill style={{ width: `${offset}%` }} />
          </div>
        </li>;
      })}</ul>
      <p className={styles.stack}>{t("常见理论功能栈", "Common theoretical function stack", "常見理論功能序列")} <strong>{mbtiFunctionStacks[type].join(" · ")}</strong></p>
      {demo ? <p className={styles.reportNote}>{locale === "zh" ? demo.note : null}</p> : <div className={styles.chapters}>
        <div className={styles.chapterTabs} role="group" aria-label={t("四章报告摘读", "Read excerpts from four chapters", "四章報告摘要")}>
          {localizedChapters.map((label, index) => <button key={label} type="button"
            aria-controls="mbti-sample-chapter" aria-pressed={index === chapter} onClick={() => setChapter(index)}>{label}</button>)}
        </div>
        <p id="mbti-sample-chapter" aria-live="polite">{sample.chapters[chapter]}</p>
      </div>}
    </div>
    {!demo && <Link className={styles.fullSampleLink} href={locale === "zh" ? mbtiPublicSampleHref : `/${locale}/reports/samples/mbti`} prefetch={false}>
      {t("查看完整四章公开样张报告", "Read the complete four-chapter sample", "閱讀完整四章公開範例")} <ArrowUpRight size={16} aria-hidden="true" />
    </Link>}
  </aside>;
}

export function AssessmentReportSample() {
  const [active, setActive] = useState(0);
  const career = careerSamples[active];
  return <aside className={shared.heroReport} aria-label="报告样张">
    <div className={shared.reportBar}><strong>职业探索报告</strong><span>演示数据</span></div>
    <div className={shared.sampleTabs} role="group" aria-label="切换报告样张">
      {careerSamples.map(({ name }, index) => <button key={name} type="button" aria-pressed={index === active}
        aria-controls="assessment-sample-profile" onClick={() => setActive(index)}>{name}</button>)}
    </div>
    <div id="assessment-sample-profile" aria-live="polite" className={styles.sampleBody}>
        <div className={styles.sampleSummary}><strong>{career.name}</strong><span>兴趣、方式与条件示例</span></div>
        <dl className={styles.careerSample}>
          <div><dt>职业兴趣 · 0–100</dt><dd className={styles.miniScores}>
            {hollandDimensions.map(([code, label], index) => <span key={code} data-dimension={code} aria-label={`${code} ${label} ${career.interest[index]} 分`}>
              <b className={shared.letter}>{code}</b><span>{career.interest[index]}</span><i aria-hidden="true"><i style={{ width: `${career.interest[index]}%` }} /></i>
            </span>)}
          </dd></div>
          <div><dt>工作方式</dt><dd>{career.style}</dd></div>
          <div><dt>工时与学习支持</dt><dd>{career.conditions}</dd></div>
        </dl>
        <p className={shared.reportTip}>样张展示三类信息的关系，免费结果包括六维兴趣概览与初步职业候选。</p>
    </div>
  </aside>;
}

const careerPrinciples = [
    ["兴趣", "先看任务", "同样做产品，一份工作以用户访谈为主，另一份以数据分析为主。列出你愿意重复做的任务。"],
    ["方式", "再看怎样工作", "即使任务相近，独立分析和高频协作也会带来不同体验。用过去的一周来回想。"],
    ["条件", "确认现实约束", "核实工时、通勤、入行学习和组织支持，把必须满足的条件写下来。"],
    ["现状", "确认下一步", "把当前经验、可用时间和学习资源分开记录，选一个这周就能尝试的小任务。"],
] as const;

export function AssessmentPrinciple() {
  const [active, setActive] = useState(0);
  const rows = careerPrinciples;
  const [key, title, detail] = rows[active];
  return <figure className={styles.principle} aria-label="职业决策四部分示意">
    <div className={styles.principlePlot}>
      <svg viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 40 48 H 280" fill="none" stroke="#b3c8c2" strokeWidth="2" />
        {[40, 120, 200, 280].map((x, index) => <circle key={x} cx={x} cy="48" r={active === index ? 25 : 20}
          fill={active === index ? "#c6e8da" : "#eef5f2"} stroke={active === index ? "#307f68" : "#b3c8c2"} />)}
      </svg>
      {rows.map(([label], index) => <button key={label} type="button" aria-pressed={index === active} aria-controls="assessment-principle-detail" onClick={() => setActive(index)}>{label}</button>)}
    </div>
    <figcaption id="assessment-principle-detail" aria-live="polite"><strong>{key} · {title}</strong><p>{detail}</p>
    </figcaption>
  </figure>;
}

const cognition = [
  { label: "E/I", topic: "怎么理清想法", codes: ["E", "I"], sides: ["先聊一会儿，听听大家怎么想。", "我先自己想一想，有了头绪再说。"] },
  { label: "S/N", topic: "先看什么线索", codes: ["S", "N"], sides: ["先确认几点有空、哪儿还开着。", "换个地方的话，会不会有更有意思的安排？"] },
  { label: "T/F", topic: "用什么做决定", codes: ["T", "F"], sides: ["哪种安排最省时间，也符合大家约好的条件？", "谁为了这次见面已经腾出了时间？怎么改更照顾到他们？"] },
  { label: "J/P", topic: "什么时候定下来", codes: ["J", "P"], sides: ["先把时间地点定下来，大家好往下安排。", "留两三个选项，等有新消息再定。"] },
] as const;

const functionPositions = ["主导", "辅助", "第三", "劣势"] as const;

export function MbtiCognitiveExplorer() {
  const [active, setActive] = useState(0);
  const [type, setType] = useState<MbtiLandingType>("INTJ");
  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = cognition.length - 1;
    const next = { ArrowLeft: (index + last) % cognition.length, ArrowRight: (index + 1) % cognition.length,
      ArrowUp: (index + 2) % cognition.length, ArrowDown: (index + 2) % cognition.length, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    event.currentTarget.parentElement?.querySelectorAll("button")[next]?.focus();
  }
  return <div className={styles.cognitionLayout}>
    <section className={styles.scene} aria-labelledby="assessment-principles">
      <h2 id="assessment-principles">同一个消息，为什么你们想到的事不一样？</h2>
      <p className={styles.sceneBubble}>「周末那家店订不到了，我们改计划吧？」</p>
      <div className={styles.explorerTabs} role="tablist" aria-label="用哪组偏好读这个场景">
        {cognition.map(({ label, topic }, index) => <button type="button" role="tab" key={label}
          id={`mbti-tab-${index}`} aria-controls={`mbti-panel-${index}`} aria-selected={active === index}
          tabIndex={active === index ? 0 : -1} onKeyDown={event => navigateTabs(event, index)} onClick={() => setActive(index)}>
          <b>{label}</b><span>{topic}</span>
        </button>)}
      </div>
      {cognition.map(({ label, codes, sides }, index) => <div key={label} role="tabpanel" tabIndex={0}
        id={`mbti-panel-${index}`} aria-labelledby={`mbti-tab-${index}`} hidden={active !== index} className={styles.scenePanel}>
        {sides.map((text, side) => <p key={text}><b>{codes[side]}</b>{text}</p>)}
      </div>)}
      <p className={styles.sceneFootnote}>这是一个虚构场景。你可能两边都想过，也会随事情的重要程度换一种做法。</p>
    </section>
    <section className={styles.explorer} aria-labelledby="mbti-cognition-model">
      <div className={styles.explorerHeader}>
        <h3 id="mbti-cognition-model">四维偏好 × 荣格八维</h3>
        <label>看看不同类型 <select value={type} onChange={event => setType(event.currentTarget.value as MbtiLandingType)}>
          {mbtiTypeGroups.map(group => <optgroup label={group.name} key={group.code}>
            {group.types.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}
          </optgroup>)}
        </select></label>
      </div>
      <ol className={styles.functionLadder} aria-label={`${type} 的四位置理论功能栈`}>
        <svg viewBox="0 0 24 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M12 8v95m-5-6 5 8 5-8" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {mbtiFunctionStacks[type].map((code, index) => {
          const highlighted = active === 0 ? code.endsWith(type.startsWith("E") ? "e" : "i")
            : active === 1 ? /^[SN]/.test(code)
            : active === 2 ? /^[TF]/.test(code)
            : index < 2 && code.endsWith("e");
          const [name, detail] = mbtiFunctionDetails[code];
          return <li key={code} data-highlighted={highlighted}>
            <span>{code}</span><div><b>{functionPositions[index]} · {name}</b><p>{detail}</p></div>
          </li>;
        })}
      </ol>
      <p className={styles.explorerNote}>功能栈来自类型理论，四维分数来自你的作答。第三功能采用站内百科的常见写法，理论上也有另一种内外倾标法。</p>
    </section>
  </div>;
}
