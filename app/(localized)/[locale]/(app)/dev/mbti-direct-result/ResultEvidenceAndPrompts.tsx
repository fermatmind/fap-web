"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./ai-conversation.module.css";

const careerPrompt = `我在费马测试中的结果是 ISFJ-A。请把它当作自我探索的线索，不要据此判定我适合某个职业。
我想讨论的岗位或工作困扰是：[填写]。
最近一件让我有成就感的任务是：[填写实际做了什么、结果和感受]；一件让我疲惫的任务是：[填写]。
请先问我 3 个问题，区分任务兴趣、已有技能、工作环境和现实约束，等我回答后再分析。请找出至少一种与类型描述不一致的解释，不要把责任重、资源少的问题都归因于性格。
最后比较两个可探索方向，分别列出吸引我的任务、需要补充的证据、现实成本，以及一次低成本试做。说明试做后观察什么，才能决定继续还是调整。`;

export function ResultEvidenceAndPrompts() {
  const [status, setStatus] = useState("");
  const [copying, setCopying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  async function copy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(careerPrompt);
      setStatus("已复制。粘贴到你使用的 AI 中，补全方括号里的经历即可。");
    } catch {
      setExpanded(true);
      setStatus("未能自动复制，请选中下方提示词后手动复制。");
    } finally {
      setCopying(false);
    }
  }
  return <section aria-labelledby="mbti-ai-title" data-testid="mbti-evidence-and-prompts" className={styles.section}>
    <div className={styles.layout}>
      <div className={styles.art}>
        <Image src="/images/mbti/ai-conversation/isfj.webp" alt="" width={768} height={512} unoptimized className={styles.image} />
      </div>
      <div className={styles.body}>
        <h2 id="mbti-ai-title" className={styles.title}>和 AI 聊聊<br />你的下一步</h2>
        <p className={styles.description}>哪些工作让你投入，哪些让你疲惫？<br />带着这份结果，聊一聊自己的真实经历。</p>
        <button type="button" disabled={copying} onClick={copy} className={styles.button}>{copying ? "正在复制…" : "复制 AI 对话提示词"}<span aria-hidden="true">↗</span></button>
        <p className={styles.hint}>复制后，粘贴到你常用的 AI 中开始对话。</p>
        <button type="button" aria-expanded={expanded} aria-controls="mbti-ai-prompt" onClick={() => setExpanded(!expanded)} className={styles.toggle}>{expanded ? "收起提示词 −" : "查看提示词 +"}</button>
        <p role="status" className={styles.status}>{status}</p>
      </div>
    </div>
    {expanded ? <div id="mbti-ai-prompt" className={styles.prompt}>
      <label htmlFor="mbti-ai-prompt-text">职业探索提示词</label>
      <textarea id="mbti-ai-prompt-text" aria-label="职业探索提示词" readOnly value={careerPrompt} rows={7} />
    </div> : null}
  </section>;
}
