import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ISFJ_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使知道该怎么照顾与维持秩序，你仍会继续确认自己的判断会不会让别人失望，因此更容易先把压力收进去。",
  },
  intro: {
    paragraphs: [undefined, "当关系里出现期待和波动时，你更容易一边体谅别人、一边压住自己的疲惫，因此边界常会比需要的更晚才说。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描照顾责任与细节秩序是否还有遗漏，这让你更细，也更容易长期处在补位状态。",
    },
    body: ["你的敏感度会持续扫描照顾责任与细节秩序是否还有遗漏，这让你更细，也更容易长期处在补位状态。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再把责任感扛满，而是分辨哪些波动真的需要你兜住，让边界表达和恢复速度不再总被拖慢。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的支持型专业路径、成长节奏与关系盲点，帮助你把高敏感度整理成更稳的自我照顾。",
  },
});

export default ISFJ_T_ZH_PATCH;
