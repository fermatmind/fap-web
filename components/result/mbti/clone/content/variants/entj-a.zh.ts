import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ENTJ_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当方向已经拉直时，你更容易信任自己的统筹判断，因此会更早定节奏、压优先级并推动别人进入执行区。",
  },
  intro: {
    paragraphs: [undefined, "熟悉的高压局面里，你通常更愿意直接定调并承担结果，这让你的推进更稳定，也更不容易被外部阻力拖慢。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对方向判断与资源统筹的信任，一旦看清主轴，就会更自然地进入执行。",
    },
    body: ["你的稳定感更多来自对方向判断与资源统筹的信任，一旦看清主轴，就会更自然地进入执行。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是再把速度抬高，而是让推进力和调速能力同时在线，避免把所有问题都压成单一冲刺。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的高杠杆决策场、成长节奏与关系盲点，帮助你把清晰判断稳稳放到更大的战场里。",
  },
});

export default ENTJ_A_ZH_PATCH;
