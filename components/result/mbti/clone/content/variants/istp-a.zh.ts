import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ISTP_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当问题结构已经看清时，你更容易信任自己的即时判断，因此会更早动手、试解法，并把干扰隔在外面。",
  },
  intro: {
    paragraphs: [undefined, "在需要快速拆解和处理的场景里，你通常更愿意先上手验证，而不是被过多解释和情绪往来拖慢动作。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对问题拆解与即时判断的信任，一旦看出关键点，行动通常比表达更快。",
    },
    body: ["你的稳定感更多来自对问题拆解与即时判断的信任，一旦看出关键点，行动通常比表达更快。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再证明自己独立，而是让独立感和连接感更自然地并存，避免只在完全自由时才愿意投入。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的解决问题型岗位、成长节奏与关系盲点，帮助你把判断速度更稳地放进长期选择。",
  },
});

export default ISTP_A_ZH_PATCH;
