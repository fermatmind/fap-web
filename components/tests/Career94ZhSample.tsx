"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import styles from "./career94-landing.module.css";
import zh from "./career94-zh-landing.module.css";

const axisLabels = {
  R: ["动手实操", "现实"],
  I: ["研究思考", "研究"],
  A: ["创意表达", "艺术"],
  S: ["帮助他人", "社会"],
  E: ["组织推动", "企业"],
  C: ["规则整理", "常规"],
} as const;

const samples = [
  {
    label: "研创分析向",
    interest: "研究×现实",
    scores: [["I", 93], ["R", 82], ["C", 71], ["A", 61], ["E", 46], ["S", 39]],
    candidates: [["工业工程师", "估算生产成本与变更影响"], ["运筹分析师", "梳理目标约束与评价指标"]],
    style: ["低任务切换", "高方法自由度"],
    conditions: ["看重工时可预期", "不接受固定夜班"],
  },
  {
    label: "组织协作向",
    interest: "企业×社会",
    scores: [["E", 93], ["S", 86], ["C", 75], ["I", 57], ["A", 46], ["R", 39]],
    candidates: [["培训与发展经理", "规划并统筹员工培训"], ["人力资源经理", "协调劳资沟通与制度执行"]],
    style: ["高频对外沟通", "多方协作推进"],
    conditions: ["看重清晰晋升路径", "可考虑频繁过夜出差"],
  },
  {
    label: "设计造物向",
    interest: "艺术×研究",
    scores: [["A", 93], ["I", 86], ["R", 75], ["E", 54], ["S", 46], ["C", 39]],
    candidates: [["工业设计师", "绘制产品草图并验证原型"], ["平面设计师", "设计版式并核对交付文件"]],
    style: ["自主选择工作方法", "中等协作频率"],
    conditions: ["看重可见工作成效", "看重学习支持"],
  },
] as const;

function topCode(sample: (typeof samples)[number]) {
  return sample.scores.slice(0, 3).map(([axis]) => axis).join("");
}

export function Career94ZhSample() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % samples.length; break;
      case "ArrowLeft": next = (index + samples.length - 1) % samples.length; break;
      case "Home": next = 0; break;
      case "End": next = samples.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <section className={`${styles.sample} ${zh.sample}`} aria-labelledby="career94-sample-title">
      <div className={styles.sampleHeader}>
        <h2 id="career94-sample-title">结果样例</h2>
      </div>
      <div className={styles.sampleTabs} role="tablist" aria-label="切换虚构结果样例">
        {samples.map((preset, index) => {
          const code = topCode(preset);
          return (
            <button key={code} id={`career94-tab-${code}`} ref={element => { buttons.current[index] = element; }}
              type="button" role="tab" aria-selected={active === index} aria-controls={`career94-panel-${code}`}
              tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => handleKey(event, index)}>
              {preset.label}
            </button>
          );
        })}
      </div>
      {samples.map((sample, index) => {
        const code = topCode(sample);
        return (
          <div key={code} id={`career94-panel-${code}`} role="tabpanel" aria-labelledby={`career94-tab-${code}`} tabIndex={0} hidden={index !== active}>
            {index === active && <>
              <p className={zh.sampleCode}>
                <b>{sample.label}</b>
                <span>兴趣底色：{sample.interest}</span>
                <span className={zh.codeBadges} aria-label={`三字代码 ${code}`}>
                  {sample.scores.slice(0, 3).map(([axis]) => <span className={styles.badge} data-code={axis} key={axis}>{axis}</span>)}
                </span>
                <span className={zh.fiction}>虚构示例</span>
              </p>
              <section className={zh.sampleFree} aria-labelledby={`career94-free-${code}`}>
                <h3 id={`career94-free-${code}`}>免费基础可见</h3>
                <p className={zh.sampleLabel}>初步候选方向</p>
                <ul className={zh.sampleCandidates}>
                  {sample.candidates.map(([name, task]) => <li key={name}><b>{name}</b><span>{task}</span></li>)}
                </ul>
                <p className={zh.sampleLabel}>核心活动兴趣 Top 3</p>
                <ul className={zh.scoreList} aria-label="核心活动兴趣 Top 3，0–100">
                  {sample.scores.slice(0, 3).map(([axis, score]) => <li data-code={axis} key={axis}>
                    <span className={styles.badge}>{axis}</span><span>{axisLabels[axis][0]}</span>
                    <span className={styles.track} aria-hidden><span style={{ width: `${score}%` }} /></span><b>{score}</b>
                  </li>)}
                </ul>
                <p className={zh.remainingScores}>
                  其余三维：{sample.scores.slice(3).map(([axis, score]) => `${axisLabels[axis][1]} ${axis} ${score}`).join(" · ")}
                </p>
              </section>
              <section className={zh.sampleDeep} aria-labelledby={`career94-deep-${code}`}>
                <div className={zh.sampleDeepHead}>
                  <h3 id={`career94-deep-${code}`}>深度报告展开（可选）</h3>
                  <p>候选按活动兴趣筛选</p>
                </div>
                <dl>
                  <div><dt>工作方式偏好</dt><dd>{sample.style.map(label => <span key={label}>{label}</span>)}</dd></div>
                  <div><dt>必核条件与底线</dt><dd>{sample.conditions.map(label => <span key={label}>{label}</span>)}</dd></div>
                </dl>
              </section>
            </>}
          </div>
        );
      })}
    </section>
  );
}
