/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ESFJ_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当关系和现实安排已经清楚时，你更容易信任自己的协调判断，因此会更自然地把照顾、组织和边界一起说出来。",
  },
  intro: {
    paragraphs: [undefined, "在熟悉的人际场域里，你通常更愿意直接安排节奏和支持方式，而不是因为顾虑气氛就把需求一直往后放。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对关系协调与现实照顾的信任，方向一旦清楚，就更愿意主动把局面稳下来。",
    },
    body: ["你的稳定感更多来自对关系协调与现实照顾的信任，方向一旦清楚，就更愿意主动把局面稳下来。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再多照顾一点，而是让关系边界和自我安置同时在线，避免长期只顾别人不顾自己。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的组织与服务场景、成长节奏与关系盲点，帮助你把稳定连接力放到更可持续的位置。",
  },
});

export default ESFJ_A_ZH_PATCH;
