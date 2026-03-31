/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ENTJ_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使方向已经明确，你仍会反复评估统筹判断是否足够稳，因此在推进时更容易同时背着结果压力往前走。",
  },
  intro: {
    paragraphs: [undefined, "变量多、阻力大的场景里，你更容易把压力直接收进自己身上，因此会一边推进、一边不停修正节奏和分工。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描方向判断与资源统筹是否还有短板，这让你更谨慎，也更容易把自己推到过载边缘。",
    },
    body: ["你的敏感度会持续扫描方向判断与资源统筹是否还有短板，这让你更谨慎，也更容易把自己推到过载边缘。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把控制感抓得更紧，而是分辨哪些风险需要立即处理，让推进力和调速能力不再总被焦躁牵着走。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的高杠杆决策场、成长节奏与关系盲点，帮助你把压力感整理成更稳的长期推进力。",
  },
});

export default ENTJ_T_ZH_PATCH;
