/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ESTP_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使机会已经出现，你仍会继续评估现场判断会不会失手，因此更容易在冲出去之前先感到一层紧张。",
  },
  intro: {
    paragraphs: [undefined, "当局面变化太快又带来结果压力时，你更容易一边想立刻处理、一边对后果保持警觉，因此节奏会更波动。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描现场判断与机会捕捉是否还有代价没看见，这让你更灵，也更容易在压力里过度消耗。",
    },
    body: ["你的敏感度会持续扫描现场判断与机会捕捉是否还有代价没看见，这让你更灵，也更容易在压力里过度消耗。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把自己变慢，而是知道哪些风险值得提前复盘，让冲劲和复盘不再总在事后才碰头。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的高变化高反馈岗位、成长节奏与关系盲点，帮助你把高警觉度整理成更稳的行动节奏。",
  },
});

export default ESTP_T_ZH_PATCH;
