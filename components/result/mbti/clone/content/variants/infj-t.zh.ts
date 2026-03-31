import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const INFJ_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使直觉已经出现，你仍会继续校准价值判断和关系感知是否足够稳妥，因此在表达前常会先消化更久。",
  },
  intro: {
    paragraphs: [undefined, "当环境带来压力和期待时，你更容易把别人的反应一起算进来，因此会在表达需求前反复权衡会不会造成额外摩擦。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描价值判断与关系感知是否还有遗漏，这让你更细，也更容易先把压力留给自己。",
    },
    body: ["你的敏感度会持续扫描价值判断与关系感知是否还有遗漏，这让你更细，也更容易先把压力留给自己。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把理想再抬高，而是分辨哪些担心真的需要处理，让边界感和能量管理不再总被责任感吞掉。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的洞察型职业路径、成长节奏与关系盲点，帮助你把高敏感度整理成更稳的自我站位。",
  },
});

export default INFJ_T_ZH_PATCH;
