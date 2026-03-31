/**
 * Migration artifact only. Runtime owner moved to fap-api storage read path.
 */
import { createMbtiDesktopCloneContentPatch } from "@/components/result/mbti/clone/content/factory";

const ESTJ_T_ZH_PATCH = createMbtiDesktopCloneContentPatch({
  hero: {
    summary: "即使流程已经拉顺，你仍会继续确认执行判断是否足够稳，因此更容易在责任感和紧迫感里持续加压自己。",
  },
  intro: {
    paragraphs: [undefined, "面对低效和模糊时，你更容易先感到焦躁，因此会不停补细节、催进度，确保没有事情在自己手里失控。"],
  },
  traits: {
    summaryPane: {
      body: "你的敏感度会持续扫描秩序建立与结果执行是否还有缺口，这让你更稳，也更容易把自己推向持续高压。",
    },
    body: ["你的敏感度会持续扫描秩序建立与结果执行是否还有缺口，这让你更稳，也更容易把自己推向持续高压。", undefined],
  },
  chapters: {
    growth: {
      intro: [undefined, "成长重点不是把控制抓得更紧，而是分辨哪些问题该立刻处理，让标准感和耐心不再总互相对冲。"],
    },
  },
  finalOffer: {
    body: "解锁后可继续查看更细的执行与管理岗位、成长节奏与关系盲点，帮助你把压力驱动整理成更稳的长期管理力。",
  },
});

export default ESTJ_T_ZH_PATCH;
