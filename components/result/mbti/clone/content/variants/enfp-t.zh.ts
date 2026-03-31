/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ENFP_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使看到很多可能性，你仍会继续评估感觉判断是否会带来失望，因此热情和犹豫常会一起出现。",
  },
  intro: {
    paragraphs: [undefined, "当外界反馈复杂时，你更容易一边想冲出去、一边担心自己会不会选错方向，因此节奏会更波动。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描可能性判断与情绪感染力是否还有代价没看见，这让你更细，也更容易被反馈牵动。",
    },
    body: ["你的敏感度会持续扫描可能性判断与情绪感染力是否还有代价没看见，这让你更细，也更容易被反馈牵动。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再逼自己稳定，而是知道哪些期待需要降噪，让热情分配和收束节奏不再总在彼此拉扯。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的创意表达与人群连接、成长节奏与关系盲点，帮助你把波动热情整理成更稳的持续输出。",
  },
});

export default ENFP_T_ZH_PATCH;
