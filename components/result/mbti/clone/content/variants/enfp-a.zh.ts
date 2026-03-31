/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ENFP_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当一条可能性已经让你看见亮点时，你更容易信任自己的感觉和判断，因此会更早投入、表达并带动气氛。",
  },
  intro: {
    paragraphs: [undefined, "在允许试错和表达的环境里，你通常更愿意先动起来，再根据反馈调整，而不是先被最坏情况压住热情。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对可能性判断与情绪感染力的信任，一旦被点燃，就更愿意把想法带到现实里。",
    },
    body: ["你的稳定感更多来自对可能性判断与情绪感染力的信任，一旦被点燃，就更愿意把想法带到现实里。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把热情压小，而是让热情分配和收束节奏更自然地并存，减少反复起落。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的创意表达与人群连接、成长节奏与关系盲点，帮助你把灵感更稳地变成持续行动。",
  },
});

export default ENFP_A_ZH_PATCH;
