import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ESTJ_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当目标、责任和流程都清楚时，你更容易信任自己的执行判断，因此会更早定规矩、拉进度并压住空转。",
  },
  intro: {
    paragraphs: [undefined, "在熟悉的执行场景里，你通常更愿意直接定标准和分工，而不是被外界的犹豫和模糊反复拖住节奏。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对秩序建立与结果执行的信任，一旦看清路径，就更自然地进入推进状态。",
    },
    body: ["你的稳定感更多来自对秩序建立与结果执行的信任，一旦看清路径，就更自然地进入推进状态。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再把标准拉高，而是让标准感和耐心同时存在，避免只靠压强维持系统运转。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的执行与管理岗位、成长节奏与关系盲点，帮助你把清晰执行力放到更高杠杆的位置。",
  },
});

export default ESTJ_A_ZH_PATCH;
