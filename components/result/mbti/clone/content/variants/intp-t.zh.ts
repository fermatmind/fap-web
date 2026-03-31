/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const INTP_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使思路已经相当完整，你仍会继续测试解释框架是否有遗漏，因此常在表达前再加一层自我验证。",
  },
  intro: {
    paragraphs: [undefined, "面对开放问题时，你更容易被新的可能性继续拉走，因此会一边推进、一边回头修补还没完全想透的部分。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描概念推演与解释框架是否还缺关键条件，这让你更细，也更容易延迟最终表态。",
    },
    body: ["你的敏感度会持续扫描概念推演与解释框架是否还缺关键条件，这让你更细，也更容易延迟最终表态。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把自己逼成更快的人，而是区分哪些问题值得继续展开，让好奇心和落地节奏不再长期互相牵制。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的问题研究与解决路径、成长节奏与关系盲点，帮助你把过度验证收束成更稳的行动节奏。",
  },
});

export default INTP_T_ZH_PATCH;
