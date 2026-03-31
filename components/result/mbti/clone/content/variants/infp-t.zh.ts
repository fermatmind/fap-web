import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const INFP_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使心里已经有偏好，你仍会继续确认感受判断是否经得起现实，因此更容易在投入前多做一轮自我怀疑。",
  },
  intro: {
    paragraphs: [undefined, "当环境有评价和比较时，你更容易把外界反应吸进来，因此会反复衡量现在表达会不会太早、太重或太冒险。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描内在价值与情绪线索是否还有冲突，这让你更细，也更容易把决定拖到很晚。",
    },
    body: ["你的敏感度会持续扫描内在价值与情绪线索是否还有冲突，这让你更细，也更容易把决定拖到很晚。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再把理想讲清楚，而是知道哪些担心值得继续处理，让理想感和执行稳定不再互相拖拽。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的意义感职业选择、成长节奏与关系盲点，帮助你把细腻感受整理成更稳的行动线。",
  },
});

export default INFP_T_ZH_PATCH;
