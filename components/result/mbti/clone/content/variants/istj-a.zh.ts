import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ISTJ_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当规则和责任边界已经清楚时，你更容易信任自己的执行判断，因此会更稳定地定流程、推进并守住标准。",
  },
  intro: {
    paragraphs: [undefined, "在秩序明确的场景里，你通常更愿意直接按标准执行，而不是因为外部噪音频繁改动已经验证过的做法。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对规则感与责任执行的信任，判断一旦成形，就更愿意把事情按计划推进到底。",
    },
    body: ["你的稳定感更多来自对规则感与责任执行的信任，判断一旦成形，就更愿意把事情按计划推进到底。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再把自己绷得更紧，而是让稳定标准和弹性同时存在，避免把所有变化都看成打断。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的高可靠度岗位、成长节奏与关系盲点，帮助你把稳定执行更好地转成长期优势。",
  },
});

export default ISTJ_A_ZH_PATCH;
