/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const INTJ_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当路线图已经成形时，你更容易信任自己的结构判断，因此会更早定下边界、优先级和推进顺序。",
  },
  intro: {
    paragraphs: [undefined, "熟悉的复杂局面里，你通常更愿意直接给出判断并承担后果，这让你的表达更稳定，也更不容易被外部噪音反复带偏。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对路线图与结构判断的信任，一旦想清楚，就更愿意把抽象判断压成明确动作。",
    },
    body: ["你的稳定感更多来自对路线图与结构判断的信任，一旦想清楚，就更愿意把抽象判断压成明确动作。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再证明自己够聪明，而是让长期规划和执行边界更从容地落地，减少不必要的防御性预演。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的高杠杆职业选择、成长节奏与关系盲点，帮助你把稳定判断直接放进长期路径。",
  },
});

export default INTJ_A_ZH_PATCH;
