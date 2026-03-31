/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ISTP_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使已经看见问题主轴，你仍会继续测试即时判断是否有遗漏，因此在关键动作前常会多做一轮内部校准。",
  },
  intro: {
    paragraphs: [undefined, "当局面复杂又伴随外部期待时，你更容易一边想迅速解决、一边想避开失误，因此节奏会更内敛也更紧绷。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描问题拆解与即时判断是否还缺关键条件，这让你更细，也更容易先把压力压进身体。",
    },
    body: ["你的敏感度会持续扫描问题拆解与即时判断是否还缺关键条件，这让你更细，也更容易先把压力压进身体。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把自己逼得更快，而是知道哪些担心真的要处理，让独立感和连接感不再彼此拉扯。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的解决问题型岗位、成长节奏与关系盲点，帮助你把高警觉度整理成更稳的长期判断。",
  },
});

export default ISTP_T_ZH_PATCH;
