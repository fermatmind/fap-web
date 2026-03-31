/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ESFP_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使现场反馈不错，你仍会继续确认自己的感觉会不会很快反转，因此热情和不安常会一起出现。",
  },
  intro: {
    paragraphs: [undefined, "当人际反馈复杂或评价升高时，你更容易一边想继续投入、一边担心自己会不会让场面失衡，因此节奏更起伏。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描感受驱动与现场带动是否还有代价没看见，这让你更细，也更容易被反馈牵着走。",
    },
    body: ["你的敏感度会持续扫描感受驱动与现场带动是否还有代价没看见，这让你更细，也更容易被反馈牵着走。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把自己变得更克制，而是知道哪些期待需要降噪，让活力管理和持续性不再总靠临场补救。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的表达与互动场景、成长节奏与关系盲点，帮助你把波动热情整理成更稳的长期输出。",
  },
});

export default ESFP_T_ZH_PATCH;
