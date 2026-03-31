import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const INFJ_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当内在判断已经站稳时，你更容易信任自己的价值感和洞察，因此会更早把边界、立场和节奏说清楚。",
  },
  intro: {
    paragraphs: [undefined, "在关系和环境相对稳定时，你通常更愿意直接表达需求与判断，而不是长期把理解别人放在表达自己之前。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对价值判断与关系感知的信任，想清楚后，更愿意把温和立场真正落到行动上。",
    },
    body: ["你的稳定感更多来自对价值判断与关系感知的信任，想清楚后，更愿意把温和立场真正落到行动上。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再逼自己更柔和，而是让边界感和能量管理更自然地成为日常动作，减少长期内耗。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的洞察型职业路径、成长节奏与关系盲点，帮助你把清晰感更稳定地放进现实关系。",
  },
});

export default INFJ_A_ZH_PATCH;
