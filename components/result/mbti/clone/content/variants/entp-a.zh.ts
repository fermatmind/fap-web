/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ENTP_A_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "当机会和逻辑都对上时，你更容易信任自己的跳跃判断，因此会更早试、也更敢把新路线推到现实里。",
  },
  intro: {
    paragraphs: [undefined, "在能快速试错的环境里，你通常更愿意先做一轮验证，再根据反馈调整，而不是被未发生的风险先拖住。"],
  },
  traits: {
    summaryPane: {
      body: "你的稳定感更多来自对想法跳跃与机会判断的信任，想到可行路径时，行动会比别人更快。",
    },
    body: ["你的稳定感更多来自对想法跳跃与机会判断的信任，想到可行路径时，行动会比别人更快。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是压住探索欲，而是让探索欲和收束能力更顺滑地配合，避免每次都把节奏留给最后。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的创新机会与试错空间、成长节奏与关系盲点，帮助你把灵感转成更稳定的推进链。",
  },
});

export default ENTP_A_ZH_PATCH;
