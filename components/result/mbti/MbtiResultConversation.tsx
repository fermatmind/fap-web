"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./MbtiResultConversation.module.css";
import type { DisplayLocale } from "@/lib/i18n/locales";

const promptFor = (fullCode: string) => `我在费马测试中的结果是 ${fullCode}。请把它当作自我探索的线索，不要据此判定我适合某个职业。
我想讨论的岗位或工作困扰是：[填写]。
最近一件让我有成就感的任务是：[填写实际做了什么、结果和感受]；一件让我疲惫的任务是：[填写]。
请先问我 3 个问题，区分任务兴趣、已有技能、工作环境和现实约束，等我回答后再分析。请找出至少一种与类型描述不一致的解释，不要把责任重、资源少的问题都归因于性格。
最后比较两个可探索方向，分别列出吸引我的任务、需要补充的证据、现实成本，以及一次低成本试做。说明试做后观察什么，才能决定继续还是调整。`;

const traditionalPromptFor = (fullCode: string) => `我在費馬測試中的結果是 ${fullCode}。請把它當作自我探索的線索，不要據此判定我適合某個職業。
我想討論的職務或工作上的困擾是：[填寫]。
最近一件讓我有成就感的任務是：[填寫實際做了什麼、結果和感受]；一件讓我疲憊的任務是：[填寫]。
請先問我 3 個問題，區分任務興趣、已有技能、工作環境和現實限制，等我回答後再分析。請找出至少一種與類型描述不一致的解釋，不要把責任重、資源少的問題都歸因於性格。
最後比較兩個可探索方向，分別列出吸引我的任務、需要補充的證據、現實成本，以及一次低成本試做。說明試做後觀察什麼，才能決定繼續還是調整。`;
const englishPromptFor = (fullCode: string) => `My FermatMind result is ${fullCode}. Treat it as a starting point for self-exploration, not a basis for deciding which career suits me.
The role or work difficulty I want to discuss is: [fill in].
A recent task that felt rewarding was: [what I actually did, the outcome and how it felt]. A task that drained me was: [fill in].
Ask me 3 questions first to distinguish task interests, existing skills, working conditions and practical constraints. Wait for my answers before analyzing. Identify at least one explanation that does not fit the type description, and do not attribute heavy responsibilities or inadequate resources entirely to personality.
Then compare two directions to explore. For each, name the appealing tasks, evidence still needed, practical costs and one low-cost trial. Explain what to observe afterwards to decide whether to continue or adjust.`;
const interfaceCopy = {
  zh: { title: "与AI探索人生", copy: "复制 AI 对话提示词", copying: "正在复制…", copied: "已复制", failure: "未能自动复制，请选中上方提示词后手动复制。", pdf: "下载完整PDF" },
  "zh-TW": { title: "與 AI 探索人生", copy: "複製 AI 對話提示詞", copying: "正在複製…", copied: "已複製", failure: "無法自動複製，請選取上方提示詞後手動複製。", pdf: "下載完整 PDF" },
  en: { title: "Explore your next steps with AI", copy: "Copy AI prompt", copying: "Copying…", copied: "Copied", failure: "Automatic copying was unavailable. Select the prompt above and copy it manually.", pdf: "Download PDF" },
};

export function ResultEvidenceAndPrompts({ fullCode = "ISFJ-A", language = "zh", historyHref, pdfAvailable = false, onDownloadPdf }: {
  fullCode?: string; language?: DisplayLocale; historyHref?: string; pdfAvailable?: boolean; onDownloadPdf?: () => Promise<void>;
}) {
  const safeCode = /^[EI][SN][TF][JP]-[AT]$/.test(fullCode) ? fullCode : "ISFJ-A";
  const careerPrompt = language === "en" ? englishPromptFor(safeCode) : language === "zh-TW" ? traditionalPromptFor(safeCode) : promptFor(safeCode);
  const ui = interfaceCopy[language];
  const [status, setStatus] = useState("");
  const [copying, setCopying] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "busy" | "requested" | "failed">("idle");
  async function downloadPdf() {
    if (!pdfAvailable || !onDownloadPdf || pdfStatus === "busy") return;
    setPdfStatus("busy");
    try { await onDownloadPdf(); setPdfStatus("requested"); } catch { setPdfStatus("failed"); }
  }
  const history = historyHref || `/${language}/history/mbti`;
  const historyLabel = language === "en" ? "View my reports" : language === "zh-TW" ? "檢視我的報告" : "查看我的报告";
  const pdfMessage = pdfStatus === "failed"
    ? language === "en" ? "PDF download could not start. Please try again." : language === "zh-TW" ? "無法開始下載 PDF，請稍後再試。" : "PDF 下载未能开始，请稍后再试。"
    : language === "en" ? "PDF download requested. Check your browser's downloads." : language === "zh-TW" ? "已請求下載 PDF，請檢查瀏覽器下載清單。" : "已请求 PDF 下载，请检查浏览器下载列表。";
  async function copy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(careerPrompt);
      setStatus("copied");
    } catch {
      setStatus("failed");
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
        <h2 id="mbti-ai-title" className={styles.title}>{ui.title}</h2>
        <p data-testid="mbti-ai-prompt-text" className={styles.promptText}>{careerPrompt}</p>
        <div className={styles.actions}>
          <button type="button" disabled={copying} onClick={copy} className={styles.button}>{copying ? ui.copying : status === "copied" ? ui.copied : ui.copy}</button>
          {pdfAvailable && onDownloadPdf
            ? <button type="button" className={styles.pdfButton} disabled={pdfStatus === "busy"} onClick={() => void downloadPdf()}>{pdfStatus === "busy" ? language === "en" ? "Requesting PDF…" : "PDF…" : ui.pdf}</button>
            : <a href={history} className={styles.pdfButton}>{historyLabel}</a>}

        </div>
        {pdfStatus === "requested" || pdfStatus === "failed" ? <p role="status" className={styles.error}>{pdfMessage}</p> : null}
        {status === "failed" ? <p role="status" className={styles.error}>{ui.failure}</p> : null}
      </div>
    </div>
  </section>;
}
