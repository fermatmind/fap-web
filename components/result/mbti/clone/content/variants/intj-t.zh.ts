import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const INTJ_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使方向已经出现，你仍会反复校正结构判断是否足够稳妥，因此在推进前常会多做一轮风险扫描。",
  },
  intro: {
    paragraphs: [undefined, "面对变量较多的局面时，你更容易先感到责任和压强，因此会不断修正说法与步骤，直到心里确认逻辑链足够严密。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描路线图与结构判断是否还有漏洞，这让你更细，也更容易在高标准下反复拉齐自己。",
    },
    body: ["你的敏感度会持续扫描路线图与结构判断是否还有漏洞，这让你更细，也更容易在高标准下反复拉齐自己。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把标准拉得更高，而是分辨哪些担心真的值得处理，让长期规划和执行边界不再总被自我拉扯消耗。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的高杠杆职业选择、成长节奏与关系盲点，帮助你把高敏感度整理成更稳的长期路线。",
  },
});

export default INTJ_T_ZH_PATCH;
