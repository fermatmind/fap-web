import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ESFP_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当人群和场景已经给出正反馈时，你更容易信任自己的现场感觉，因此会更自然地投入、表达并带动气氛。",
  },
  intro: {
    paragraphs: [undefined, "在允许互动和试错的环境里，你通常更愿意先把热度带起来，再根据反馈调整，而不是先被顾虑压住。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对感受驱动与现场带动的信任，一旦感到气氛对了，行动会比犹豫更早出现。",
    },
    body: ["你的稳定感更多来自对感受驱动与现场带动的信任，一旦感到气氛对了，行动会比犹豫更早出现。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把活力压小，而是让活力管理和持续性同时在线，避免每次都靠临场情绪撑完全程。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的表达与互动场景、成长节奏与关系盲点，帮助你把感染力更稳地变成长期输出。",
  },
});

export default ESFP_A_ZH_PATCH;
