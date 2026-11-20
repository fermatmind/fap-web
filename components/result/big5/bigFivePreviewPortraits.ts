export const bigFivePreviewPortraits = {
  overview: {
    title: "把五个维度放在一起看",
    art: "overview",
    alt: "浣熊在桌前观察五件不同的纸艺作品",
    intro: "同一份作答可以同时体现好奇、计划习惯和社交偏好。先选一个最近发生过的场景，再看看有哪些回答与它相符。",
    clues: ["先看五维各自描述什么。", "找一个与描述不同的经历。"],
    signature: { title: "用具体事件读结果", body: "回想一次和往常不同的表现，比较当天的任务、同伴和时间压力。" },
    next: { title: "留下一条可以重看的记录", body: "写下当时发生了什么、你做了什么、结果怎样。", practice: "等下一次类似场景出现，用同样三个问题作比较。" },
  },
  O: {
    title: "哪些变化会吸引你",
    art: "openness",
    alt: "小熊猫手艺人坐在木凳上，端详手中的折纸鸟",
    intro: "开放性涉及想象、审美体验和对新做法的兴趣。喜欢作品的表达方式，和愿不愿意换一套工具，可以分开观察。",
    clues: ["想象、审美和尝新在日常里有不同表现。", "回想最近一次你主动改动表达的经历。"],
    signature: { title: "说清表达的差异", body: "比较两份内容时，指出哪一处让人停下来、哪一处更容易理解，再用读者反馈核对。" },
    next: { title: "用熟悉的工具换一个表达细节", body: "选一份这周要完成的东西，只改开头、画面顺序或材料中的一项。", practice: "请一位读者看两个版本，分别说出第一眼注意到了什么。" },
  },
  C: {
    title: "什么让一件事推进下去",
    art: "conscientiousness",
    alt: "海狸手艺人在工作台前查看木质收纳抽屉",
    intro: "尽责性涉及组织、目标推进和持续执行。可以回想自己在任务开始、推进和交接时分别用了什么办法。",
    clues: ["把安排步骤和坚持执行分开看。", "比较目标清楚和目标模糊的两次任务。"],
    signature: { title: "把交付标准提前写下来", body: "在开始之前写清产出、时间和确认人，观察哪个条件能帮你少返工。" },
    next: { title: "给下一项任务安排一个检查点", body: "选一项本周要交接的任务，给第一步留出一段明确时间。", practice: "交接后记下还需要补问什么。" },
  },
  E: {
    title: "在哪些场合更容易参与",
    art: "extraversion",
    alt: "水獭端着杯子，向身旁的人打招呼",
    intro: "外向性涵盖主动交流、在群体中表达和寻求活动等倾向。参与了多少、当时是否享受，可以分开回顾。",
    clues: ["比较小组与一对一的交流。", "留意话题、熟悉程度和准备时间。"],
    signature: { title: "给想说的事找一个入口", body: "有观点想提出时，试着提前写一句结论和一条依据，再选择适合的表达时机。" },
    next: { title: "比较两次相近的交流", body: "记录自己想说什么、实际说了什么，以及有没有得到回应。", practice: "留意变化来自准备、同伴还是交流方式。" },
  },
  A: {
    title: "合作里怎样表达善意和分歧",
    art: "agreeableness",
    alt: "水豚手艺人把手里的布料展开",
    intro: "宜人性涉及信任、体谅与合作倾向。回看一段具体互动时，可以分别记下你如何理解对方，以及你怎样表达自己的需要。",
    clues: ["把对动机的推测和对方原话分开。", "留意你在什么条件下愿意让步。"],
    signature: { title: "把分歧说成可以讨论的条件", body: "先复述对方在意的一点，再说清自己希望保留的一项条件。" },
    next: { title: "结束前确认一次共同理解", body: "选一次低风险的协商，请双方各自复述最后同意的事项。", practice: "记下哪句话让条件更清楚。" },
  },
  N: {
    title: "分开看担忧、低落和生气",
    art: "emotionality",
    alt: "野兔在灯旁的笔记本上写字",
    intro: "情绪性反映作答中报告的负面情绪与压力反应倾向。理解一次体验还需要当时的处境、持续时间和实际影响。",
    clues: ["把不同的情绪体验分别记下来。", "也记一次处境相似、感受不同的经历。"],
    signature: { title: "还原一件事情的经过", body: "先写发生的事，再写自己的感觉和当时采取的行动。" },
    next: { title: "看看哪种安排确实帮过你", body: "挑一项低成本的恢复安排，在两次程度相近的忙碌后观察感受。", practice: "记下感受、时长和生活影响。困扰持续时可带着记录向专业人员求助。" },
  },
} as const;

export type BigFivePreviewFocus = keyof typeof bigFivePreviewPortraits;

export function resolveBigFivePreviewFocus(value: unknown): BigFivePreviewFocus {
  const key = typeof value === "string" ? value.toUpperCase() : "";
  return Object.hasOwn(bigFivePreviewPortraits, key) ? key as BigFivePreviewFocus : "overview";
}
