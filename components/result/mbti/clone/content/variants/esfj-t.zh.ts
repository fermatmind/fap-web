/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ESFJ_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使知道该怎么协调和照顾，你仍会继续确认自己的判断会不会让关系失衡，因此更容易把外界反应背进自己心里。",
  },
  intro: {
    paragraphs: [undefined, "当气氛紧张或期待升高时，你更容易一边安抚别人、一边压住自己的不适，因此边界常比需要的更晚才出现。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描关系协调与现实照顾是否还有遗漏，这让你更细，也更容易长时间停在过度投入里。",
    },
    body: ["你的敏感度会持续扫描关系协调与现实照顾是否还有遗漏，这让你更细，也更容易长时间停在过度投入里。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把责任继续加满，而是分辨哪些关系波动真的需要你处理，让关系边界和自我安置不再总被牺牲。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的组织与服务场景、成长节奏与关系盲点，帮助你把高敏感照顾力整理成更稳的长期支持。",
  },
});

export default ESFJ_T_ZH_PATCH;
