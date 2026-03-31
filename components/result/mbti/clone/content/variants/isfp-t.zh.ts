import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ISFP_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使心里已经有明显偏好，你仍会继续确认感受判断会不会带来摩擦，因此常把真正的决定往后压。",
  },
  intro: {
    paragraphs: [undefined, "当外界评价和期待变多时，你更容易一边感到不适、一边不想把情绪说得太直，因此节奏会更保留。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描感受判断与审美取向是否会与现实冲突，这让你更细，也更容易在关键节点迟疑。",
    },
    body: ["你的敏感度会持续扫描感受判断与审美取向是否会与现实冲突，这让你更细，也更容易在关键节点迟疑。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把情绪压住，而是分辨哪些担心真的值得处理，让自我表达和节奏保护不再总被外界拉走。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的创作与体验型路径、成长节奏与关系盲点，帮助你把细腻感受整理成更稳的生活选择。",
  },
});

export default ISFP_T_ZH_PATCH;
