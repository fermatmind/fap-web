export const extraversionExamples = [
  { id: "lower", answers: "2525252525", labels: { en: "Lower range", zh: "较低分段", "zh-TW": "較低分段" } },
  { id: "midpoint", answers: "3333333333", labels: { en: "Scale midpoint", zh: "评分中点", "zh-TW": "量尺中點" } },
  { id: "higher", answers: "5252525252", labels: { en: "Higher range", zh: "较高分段", "zh-TW": "較高分段" } },
] as const;

export const extraversionPresentation = {
  en: {
    endStart: "Take the introvert or extrovert test", stylesLink: "Browse all four reading guides", sampleLink: "See sample results",
    headline: "Public-domain IPIP item reflection · Full results free", guideFree: "All four guides are open before you take the test.",
    stylesTitle: "Four ways to read the same scale", method: "How the 10 responses are scored", sample: "Illustrative score ranges",
    trust: "10 questions · About 2 minutes · Free · No sign-up", current: ["Self-reported extraversion in everyday interactions", "10 questions · about 2 minutes", "Total, mean and relevant reading guide"],
    scoreLabel: "raw score", meanLabel: "mean",
    endpoints: ["Lower on this form", "Higher on this form"] as const,
    answerScore: (points: number) => `This answer contributes ${points} to the raw total.`,
    unscored: "You can choose this answer. The form then gives no total, mean or individual result.",
  },
  zh: {
    endStart: "开始内外向测试", stylesLink: "浏览四个分段指南", sampleLink: "先看结果示例",
    headline: "IPIP公有领域条目自评 · 完整结果免费", guideFree: "四份指南都可在作答前免费阅读。",
    stylesTitle: "同一条尺度上的四种读法", method: "10 道题怎么计分", sample: "分数示例",
    trust: "10 题 · 约 2 分钟 · 免费 · 免注册", current: ["日常交往中的外向性自评", "10 题 · 约 2 分钟", "总分、均分和对应解读"],
    scoreLabel: "原始总分", meanLabel: "均分",
    endpoints: ["本题本较低端", "本题本较高端"] as const,
    answerScore: (points: number) => `这项回答给原始总分计 ${points} 分。`,
    unscored: "可选这项，但本次不会产生总分、均分或个人分段。",
  },
  "zh-TW": {
    endStart: "開始內外向測驗", stylesLink: "瀏覽四份分段指南", sampleLink: "先看看分數範例",
    headline: "IPIP 公有領域題目自評 · 完整結果免費", guideFree: "四份指南都能在作答前免費閱讀。",
    stylesTitle: "用四份指南看懂同一條量尺", method: "這 10 題怎麼計分？", sample: "分數範例",
    trust: "10 題 · 約 2 分鐘 · 免費 · 免註冊", current: ["從日常互動回看外向性", "10 題 · 約 2 分鐘", "總分、平均分、對應的閱讀指南"],
    scoreLabel: "原始總分", meanLabel: "平均分",
    endpoints: ["這份量尺的較低端", "這份量尺的較高端"] as const,
    answerScore: (points: number) => `這個答案會為原始總分計入 ${points} 分。`,
    unscored: "你可以選這項。這次不會產生總分、平均分或個人的分段解讀。",
  },
};
