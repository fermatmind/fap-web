import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ENFJ_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使知道该如何带动局面，你仍会继续评估关系判断是否足够稳，因此常把更多责任和波动感一并收进来。",
  },
  intro: {
    paragraphs: [undefined, "面对复杂的人际反馈时，你更容易一边照顾大家、一边怀疑自己是不是还不够周全，因此表达和推进都会更谨慎。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描关系组织与带动能力是否还有遗漏，这让你更细，也更容易对自己的影响力要求过高。",
    },
    body: ["你的敏感度会持续扫描关系组织与带动能力是否还有遗漏，这让你更细，也更容易对自己的影响力要求过高。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再把责任感拉满，而是分辨哪些关系波动真的需要你兜住，让付出边界和自我校准不再长期失衡。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的带人与整合场景、成长节奏与关系盲点，帮助你把高责任感整理成更稳的带动力。",
  },
});

export default ENFJ_T_ZH_PATCH;
