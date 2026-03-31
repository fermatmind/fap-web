/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const INTP_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当一套解释框架已经跑通时，你更容易相信自己的推演结果，因此会更自在地把想法直接抛到现实里测试。",
  },
  intro: {
    paragraphs: [undefined, "只要问题边界够清楚，你通常更愿意先给出假设和判断，而不是在每个细节上继续无限延展。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对概念推演与解释框架的信任，想清楚之后，表达和落地都会更干脆。",
    },
    body: ["你的稳定感更多来自对概念推演与解释框架的信任，想清楚之后，表达和落地都会更干脆。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再证明自己懂得更多，而是让好奇心和落地节奏更顺畅地并存，减少拖到太晚才开始。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的问题研究与解决路径、成长节奏与关系盲点，帮助你把想法更早转成有效动作。",
  },
});

export default INTP_A_ZH_PATCH;
