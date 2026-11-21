export const bigFivePreviewPortraits = {
  overview: {
    title: "五个维度，读出同一份作答里的不同线索",
    art: "overview",
    alt: "浣熊在桌前观察五件不同的纸艺作品",
    intro: "这份样例在开放性、尽责性和宜人性上读到中档。外向性和情绪性的总览位置较低，但局部面向出现明显反差。先看五维，再挑一件真实经历核对。",
    clues: ["把总览位置相近的维度并排读。", "看看哪些面向值得单独解释。"],
    signature: { title: "从一次真实选择开始", body: "挑一件定方案、推进任务或与人商量的事。分别记下当时的条件和自己的选择。" },
    next: { title: "给观察留下一条记录", body: "用三行写下发生的事、采取的行动和实际结果。", practice: "下次遇到相似机会，再记一条，看看什么重复出现。" },
  },
  O: {
    title: "可以重新审视旧规则，也可以先留着熟悉的做法",
    art: "openness",
    alt: "小熊猫手艺人坐在木凳上，端详手中的折纸鸟",
    intro: "开放性从想象、审美到对新活动和价值差异的态度。这个视角聚焦样例里的价值弹性与行动尝新。",
    clues: ["分别记录你重新审视了什么规则、最后用了什么做法。", "留意当时的试错成本和余地。"],
    signature: { title: "先把想法说清，再决定试不试", body: "解释新方案解决了什么问题，以及它需要改变哪一步。" },
    next: { title: "只试一处可撤回的变化", body: "在一件熟悉的任务里换一个步骤，其余条件尽量相近。", practice: "记下结果和用时，再决定哪一部分值得保留。" },
  },
  C: {
    title: "习惯把事项排清楚，推进仍值得单独观察",
    art: "conscientiousness",
    alt: "海狸手艺人在工作台前查看木质收纳抽屉",
    intro: "尽责性包含秩序、自律和责任等线索。样例的秩序感位置较高，自律续航位置较低。",
    clues: ["分别看任务有没有安排、什么时候开始。", "中断后能不能回来做，也单独记。"],
    signature: { title: "让计划落到一个具体的交接点", body: "写清下一步产出和负责确认的人，让执行遇到阻碍时有地方接上。" },
    next: { title: "给老是搁置的一步预留时间", body: "选一项本周要交付的任务，为第一步安排一个十分钟时段。", practice: "到周末对照实际启动时间和中断情况。" },
  },
  E: {
    title: "表达观点与体验或表达愉快，可以分着读",
    art: "extraversion",
    alt: "水獭端着杯子，向身旁的人打招呼",
    intro: "外向性覆盖多种参与与体验方式。样例的主张表达位置较高，积极情绪位置较低。",
    clues: ["留意有没有需要表达意见的机会。", "把发言行为和当时体验分别记下。"],
    signature: { title: "给观点一个能被听懂的入口", body: "如果一个决定需要你给意见，先准备一句结论和一条依据。" },
    next: { title: "对照两次确实想表达的场合", body: "记下有没有主动发言、意见有没有被准确理解。", practice: "也记下当时的感受，以及两场讨论在角色或准备上有什么差别。" },
  },
  A: {
    title: "愿意关照对方，也可以直说不同意见",
    art: "agreeableness",
    alt: "水豚手艺人把手里的布料展开",
    intro: "宜人性覆盖多种合作与处理分歧的倾向。样例的利他关照位置较高，冲突调停位置较低。",
    clues: ["把愿意提供的帮助和无法接受的条件分开。", "先问清对方最在意哪一部分。"],
    signature: { title: "让分歧落到可以讨论的安排", body: "复述对方的一项要求，再给出你能够接受的替代方案。" },
    next: { title: "完成一次低风险的协商", body: "选一件日常安排，结束时请双方各自复述同意的事项。", practice: "比较双方复述的内容，发现理解不同就补充约定。" },
  },
  N: {
    title: "分开看担忧和恼火各在什么时候出现",
    art: "emotionality",
    alt: "野兔在灯旁的笔记本上写字",
    intro: "这里的情绪性关注负性情绪与压力反应。样例中愤怒反应的位置高于焦虑预警，具体体验仍要回到事件当时。",
    clues: ["分别记发生的事、当时的感受和持续时间。", "也留一条处境相似但感受不同的记录。"],
    signature: { title: "给自己一点时间核实判断", body: "先写下能确认的事实，等缓一会儿再看对当时情境的解释。" },
    next: { title: "试一次容易停止的恢复安排", body: "下次遇到程度相近的忙碌，试用一种你愿意尝试的短暂停顿。", practice: "记录恢复体验、用时及其他变化，再决定是否继续用。" },
  },
} as const;

export type BigFivePreviewFocus = keyof typeof bigFivePreviewPortraits;

export function resolveBigFivePreviewFocus(value: unknown): BigFivePreviewFocus {
  const key = typeof value === "string" ? value.toUpperCase() : "";
  return Object.hasOwn(bigFivePreviewPortraits, key) ? key as BigFivePreviewFocus : "overview";
}
