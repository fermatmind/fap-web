import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ENFJ_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当关系目标已经清楚时，你更容易信任自己的带动判断，因此会更早定节奏、给支持，也更敢把话说直。",
  },
  intro: {
    paragraphs: [undefined, "在熟悉的人际场域里，你通常更愿意直接组织关系和资源，而不是因为顾虑感受就把判断往后放。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对关系组织与带动能力的信任，看清局面后，会更自然地站出来定调。",
    },
    body: ["你的稳定感更多来自对关系组织与带动能力的信任，看清局面后，会更自然地站出来定调。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再多扛一点，而是让付出边界和自我校准同时在线，避免总把自己放在最后。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的带人与整合场景、成长节奏与关系盲点，帮助你把影响力更稳地落到长期协作里。",
  },
});

export default ENFJ_A_ZH_PATCH;
