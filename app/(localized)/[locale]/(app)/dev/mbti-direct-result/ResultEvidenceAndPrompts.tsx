"use client";

import Image from "next/image";
import { useState } from "react";

const careerPrompt = `我在费马测试中的结果是 ISFJ-A。请把它当作自我探索的线索，不要据此判定我适合某个职业。
我想讨论的岗位或工作困扰是：[填写]。
最近一件让我有成就感的任务是：[填写实际做了什么、结果和感受]；一件让我疲惫的任务是：[填写]。
请先问我 3 个问题，区分任务兴趣、已有技能、工作环境和现实约束，等我回答后再分析。请找出至少一种与类型描述不一致的解释，不要把责任重、资源少的问题都归因于性格。
最后比较两个可探索方向，分别列出吸引我的任务、需要补充的证据、现实成本，以及一次低成本试做。说明试做后观察什么，才能决定继续还是调整。`;

export function ResultEvidenceAndPrompts() {
  const [status, setStatus] = useState("");
  const [copying, setCopying] = useState(false);
  async function copy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(careerPrompt);
      setStatus("已复制。粘贴到你使用的 AI 中，补全方括号里的经历即可。");
    } catch {
      setStatus("未能自动复制，请选中下方提示词后手动复制。");
    } finally {
      setCopying(false);
    }
  }
  return <section aria-labelledby="mbti-ai-title" data-testid="mbti-evidence-and-prompts" className="overflow-hidden rounded-xl border border-[#d6e6dc] border-t-4 border-t-[#31a879] bg-[#e9f5ef] p-5 md:p-8">
    <h2 id="mbti-ai-title" className="mb-7 text-2xl font-semibold text-[#203d31] md:text-3xl">复制提示词，和 AI 聊聊</h2>
    <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-8">
      <Image src="/images/mbti/ai-conversation/isfj.webp" alt="" width={768} height={512} unoptimized className="mx-auto h-auto w-full max-w-md" />
      <div className="min-w-0">
        <h3 className="mb-3 text-lg font-semibold text-[#203d31]">职业探索：分清喜欢、擅长与值得投入</h3>
        <p className="mb-4 text-sm leading-7 text-[#56645c]">复制下方提示词，粘贴到你常用的 AI 中，再补全自己的经历，开始一次职业探索对话。</p>
        <textarea aria-label="职业探索提示词" readOnly value={careerPrompt} rows={10} className="block w-full resize-y rounded-xl border border-[#cbded2] bg-white/80 p-4 text-sm leading-7 text-[#3e5148] focus:outline-emerald-700" />
        <button type="button" disabled={copying} onClick={copy} className="mt-5 min-h-11 rounded-full bg-[#247858] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{copying ? "正在复制…" : "复制 AI 对话提示词"}</button>
        <p role="status" className="mb-0 mt-3 text-sm leading-6 text-[#466253]">{status}</p>
      </div>
    </div>
  </section>;
}
