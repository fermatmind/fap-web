/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ESTP_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当机会已经摆在眼前时，你更容易信任自己的现场判断，因此会更早出手、试探并把反馈转成下一步动作。",
  },
  intro: {
    paragraphs: [undefined, "在变化快、反馈快的环境里，你通常更愿意先进入现场再调整，而不是被还没发生的后果提前拖住。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对现场判断与机会捕捉的信任，看见窗口时，行动会比犹豫更快出现。",
    },
    body: ["你的稳定感更多来自对现场判断与机会捕捉的信任，看见窗口时，行动会比犹豫更快出现。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把冲劲压掉，而是让冲劲和复盘同时在线，避免只在行动后才回头看成本。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的高变化高反馈岗位、成长节奏与关系盲点，帮助你把现场判断更稳地变成长线优势。",
  },
});

export default ESTP_A_ZH_PATCH;
