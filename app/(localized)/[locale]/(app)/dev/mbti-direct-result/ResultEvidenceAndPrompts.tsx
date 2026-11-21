"use client";

import Image from "next/image";
import { Crown } from "lucide-react";
import { useState } from "react";
import styles from "./ai-conversation.module.css";

const promptFor = (fullCode: string) => `我在费马测试中的结果是 ${fullCode}。请把它当作自我探索的线索，不要据此判定我适合某个职业。
我想讨论的岗位或工作困扰是：[填写]。
最近一件让我有成就感的任务是：[填写实际做了什么、结果和感受]；一件让我疲惫的任务是：[填写]。
请先问我 3 个问题，区分任务兴趣、已有技能、工作环境和现实约束，等我回答后再分析。请找出至少一种与类型描述不一致的解释，不要把责任重、资源少的问题都归因于性格。
最后比较两个可探索方向，分别列出吸引我的任务、需要补充的证据、现实成本，以及一次低成本试做。说明试做后观察什么，才能决定继续还是调整。`;

export function ResultEvidenceAndPrompts({ fullCode = "ISFJ-A" }: { fullCode?: string }) {
  const safeCode = /^[EI][SN][TF][JP]-[AT]$/.test(fullCode) ? fullCode : "ISFJ-A";
  const careerPrompt = promptFor(safeCode);
  const [status, setStatus] = useState("");
  const [copying, setCopying] = useState(false);
  async function copy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(careerPrompt);
      setStatus("copied");
    } catch {
      setStatus("未能自动复制，请选中上方提示词后手动复制。");
    } finally {
      setCopying(false);
    }
  }
  return <section aria-labelledby="mbti-ai-title" data-testid="mbti-evidence-and-prompts" className={styles.section}>
    <div className={styles.layout}>
      <div className={styles.art}>
        <Image src={`/images/mbti/ai-conversation/${safeCode.slice(0, 4).toLowerCase()}.webp`} alt="" width={768} height={512} unoptimized className={styles.image} />
      </div>
      <div className={styles.body}>
        <h2 id="mbti-ai-title" className={styles.title}>与AI探索人生</h2>
        <p data-testid="mbti-ai-prompt-text" className={styles.promptText}>{careerPrompt}</p>
        <div className={styles.actions}>
          <button type="button" disabled={copying} onClick={copy} className={styles.button}>{copying ? "正在复制…" : status === "copied" ? "已复制" : "复制 AI 对话提示词"}</button>
          <a href="https://fermatmind.com/zh/history/mbti" className={styles.pdfButton} title="付费报告权益：进入我的报告下载完整PDF"><Crown size={15} aria-hidden="true" /><span className={styles.paidLabel}>付费</span>下载完整PDF</a>
        </div>
        {status && status !== "copied" ? <p role="status" className={styles.error}>{status}</p> : null}
      </div>
    </div>
  </section>;
}
