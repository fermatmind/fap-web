/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ISTJ_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使流程已经跑熟，你仍会继续确认执行判断是否还有漏洞，因此面对变化时会更快进入警戒与补位状态。",
  },
  intro: {
    paragraphs: [undefined, "当规则被打乱或责任不清时，你更容易先感到压力，因此会不断检查细节，确保没有环节在自己手上失控。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描规则感与责任执行是否还有风险点，这让你更稳，也更容易在混乱里持续绷紧。",
    },
    body: ["你的敏感度会持续扫描规则感与责任执行是否还有风险点，这让你更稳，也更容易在混乱里持续绷紧。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再多扛一点，而是分辨哪些变化真的值得你接管，让稳定标准和弹性不再互相抵消。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的高可靠度岗位、成长节奏与关系盲点，帮助你把高责任感整理成更稳的长期节奏。",
  },
});

export default ISTJ_T_ZH_PATCH;
