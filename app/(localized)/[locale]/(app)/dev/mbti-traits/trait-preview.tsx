"use client";

import { useState } from "react";
import { MbtiCloneTraitsSection } from "@/components/result/mbti/clone/MbtiCloneTraitsSection";
import { MBTI_TRAIT_AXES, type MbtiTraitCatalog } from "@/lib/cms/mbti-trait-explanations";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

const labels = { EI: ["外向", "内向"], SN: ["实感", "直觉"], TF: ["思考", "情感"], JP: ["判断", "感知"], AT: ["果断", "敏感"] };
const titles = ["能量", "心智", "天性", "应对方式", "身份特征"];
export function TraitPreview({ catalog }: { catalog: MbtiTraitCatalog }) {
  const [scores, setScores] = useState([67, 63, 66, 68, 59]);
  const [sides, setSides] = useState([1, 1, 0, 1, 0]);
  const fullCode = MBTI_TRAIT_AXES.slice(0, 4).map((axis, index) => axis[sides[index]]).join("") + "-" + "AT"[sides[4]];
  const dimensions = MBTI_TRAIT_AXES.map((axis, index) => ({ axisCode: axis, dominantPole: axis[sides[index]], dominantPct: scores[index],
    dominantLabel: labels[axis][sides[index]], leftCode: axis[0], rightCode: axis[1], leftPole: labels[axis][0], rightPole: labels[axis][1] }));
  return <div className={styles.shell} style={{ maxWidth: 1180, padding: "32px 24px", margin: "0 auto" }}>
    <div style={{ padding: 20, marginBottom: 24, borderRadius: 16, background: "#fff", border: "1px solid #e5e7eb" }}>
      <h1 style={{ fontSize: 22, fontWeight: 650 }}>五维度 · 中文A/B文案预览</h1>
      <p style={{ margin: "8px 0 20px", color: "#64748b", fontSize: 14 }}>示例分数，可自由调整；内容来自本地后端数据库。点击下方色条查看对应解读。10%分段用于组织文案，不是经验证的人格分界。</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {MBTI_TRAIT_AXES.map((axis, index) => <fieldset key={axis} style={{ border: 0, padding: 0, minWidth: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: 8 }}>{titles[index]}</legend>
          <select aria-label={`${titles[index]}方向`} value={sides[index]} onChange={(event) => setSides(sides.map((v, i) => i === index ? Number(event.target.value) : v))}
            style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: 6, width: "100%" }}>
            {labels[axis].map((label, side) => <option value={side} key={label}>{label}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <input aria-label={`${titles[index]}分数`} type="range" min={50} max={100} step={1} value={scores[index]}
              onChange={(event) => setScores(scores.map((v, i) => i === index ? Number(event.target.value) : v))} style={{ width: "100%" }} />
            <output style={{ minWidth: 42 }}>{scores[index]}%</output>
          </label>
        </fieldset>)}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
        {[50, 51, 59, 60, 69, 70, 79, 80, 89, 90, 100].map((score) => <button type="button" key={score} onClick={() => setScores(scores.map(() => score))}
          style={{ padding: "5px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}>全部 {score}%</button>)}
      </div>
    </div>
    <MbtiCloneTraitsSection locale="zh" title="人格特质" illustrationSlotId="traits-illustration" illustrationLabel=""
      dimensions={dimensions} summaryTitleFallback="" summaryValueFallback="" summaryLabelFallback="" summaryDescriptionFallback=""
      summarySlotId="traits-summary-illustration" summarySlotLabel="" traitCatalog={catalog} paragraphs={catalog.overviews.find((row) => row.full_code === fullCode)?.paragraphs ?? []} bodySource="traits" tools={[]} />
    <p style={{ marginTop: 24, color: "#64748b", fontSize: 12 }}>本地修订 {catalog.revision} · 55组解读 / 110段文案 · {fullCode} 两段人格解读</p>
  </div>;
}
