import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ISFJ_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当照顾责任和秩序边界已经清楚时，你更容易信任自己的判断，因此会更自然地把支持与边界一起表达出来。",
  },
  intro: {
    paragraphs: [undefined, "在稳定关系里，你通常更愿意直接说出自己能做什么、不能做什么，而不是默默把额外负担继续扛在身上。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对照顾责任与细节秩序的信任，确定方向后，会更从容地把体贴落成清晰安排。",
    },
    body: ["你的稳定感更多来自对照顾责任与细节秩序的信任，确定方向后，会更从容地把体贴落成清晰安排。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再多照顾一点，而是让边界表达和恢复速度同时在线，避免总把体力和情绪留到最后才补。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的支持型专业路径、成长节奏与关系盲点，帮助你把稳定照顾力放到更健康的位置。",
  },
});

export default ISFJ_A_ZH_PATCH;
