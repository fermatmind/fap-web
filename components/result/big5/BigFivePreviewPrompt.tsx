"use client";

import { Check, Copy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import styles from "./BigFiveReportPreview.module.css";

export function BigFivePreviewPrompt({ prompt, art, alt }: { prompt: string; art: string; alt: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <section id="prompt" className={styles.promptSection} aria-labelledby="prompt-title">
      <Image src={art} width={560} height={700}
        sizes="(max-width: 640px) 130px, 185px" alt={alt} />
      <div>
        <h2 id="prompt-title">带着具体经历，和 AI 继续认识自己</h2>
        <p>复制提示词到你常用的 AI，再补充一个你想聊的场景。</p>
        <pre className={styles.promptText}>{prompt}</pre>
        <button type="button" className={styles.copyPrompt} onClick={() => void copyPrompt()}>
          {status === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {status === "copied" ? "已复制提示词" : "复制提示词"}
        </button>
        <span className={styles.copyStatus} role="status">
          {status === "copied" ? "可以粘贴到你常用的 AI 对话中。" : status === "failed" ? "复制失败，请选中文字手动复制。" : ""}
        </span>
      </div>
    </section>
  );
}
