import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const INFP_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当内在价值已经站稳时，你更容易信任自己的感受判断，因此会更早把偏好、边界和投入方向说清楚。",
  },
  intro: {
    paragraphs: [undefined, "只要环境不逼迫你过度迎合，你通常更愿意按自己的节奏表达真实想法，而不是一直等到绝对安全才开口。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对内在价值与情绪线索的信任，认定了方向后，会更自然地把感受落成选择。",
    },
    body: ["你的稳定感更多来自对内在价值与情绪线索的信任，认定了方向后，会更自然地把感受落成选择。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再证明自己足够真诚，而是让理想感和执行稳定更顺畅地并存，减少长期悬置。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的意义感职业选择、成长节奏与关系盲点，帮助你把真实偏好更稳地变成现实路径。",
  },
});

export default INFP_A_ZH_PATCH;
