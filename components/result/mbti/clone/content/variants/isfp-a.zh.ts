/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ISFP_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当感受和偏好已经站稳时，你更容易信任自己的判断，因此会更自然地把边界、选择和喜欢的方向表达出来。",
  },
  intro: {
    paragraphs: [undefined, "在不被过度催促的环境里，你通常更愿意按自己的节奏做选择，而不是长期等到所有人都满意才行动。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对感受判断与审美取向的信任，认定方向后，会更自在地把喜欢变成现实选择。",
    },
    body: ["你的稳定感更多来自对感受判断与审美取向的信任，认定方向后，会更自在地把喜欢变成现实选择。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再多证明自己，而是让自我表达和节奏保护同时在线，减少为了外界期待而长期偏离自己。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的创作与体验型路径、成长节奏与关系盲点，帮助你把真实偏好更稳地放进生活安排。",
  },
});

export default ISFP_A_ZH_PATCH;
