/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ENTP_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使看到很多机会，你仍会继续测试跳跃判断是否过早，因此更容易在兴奋和怀疑之间来回摆动。",
  },
  intro: {
    paragraphs: [undefined, "面对变化快的局面时，你更容易同时被新想法和潜在代价牵住，因此会一边前冲、一边频繁改写策略。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描想法跳跃与机会判断是否还有盲区，这让你更灵，也更容易在关键节点迟疑。",
    },
    body: ["你的敏感度会持续扫描想法跳跃与机会判断是否还有盲区，这让你更灵，也更容易在关键节点迟疑。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把自己压得更规整，而是知道哪些探索值得继续展开，让探索欲和收束能力不再互相打架。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的创新机会与试错空间、成长节奏与关系盲点，帮助你把高波动灵感整理成更稳的节奏。",
  },
});

export default ENTP_T_ZH_PATCH;
