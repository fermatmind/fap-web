export const eightValuesSamples = [
  { id: "neutral", labels: { en: "All neutral", zh: "全部中立", "zh-TW": "全部中立" } },
  { id: "one-change", labels: { en: "One answer changes", zh: "只改一题", "zh-TW": "只改一題" } },
  { id: "social-axis", labels: { en: "Social-axis example", zh: "社会轴算例", "zh-TW": "社會軸算例" } },
] as const;

export const eightValuesPresentation = {
  en: {
    endStart: "Take the 8 Values test", stylesLink: "Explore all eight pole guides", sampleLink: "See sample results",
    headline: "8values adaptation · Full results free", guideFree: "All eight guides are open before you take the quiz.",
    stylesTitle: "Four paired axes and eight reading guides", method: "How 70 responses become four pairs", sample: "Illustrative response patterns",
    trust: "70 questions · About 15 minutes · Free · No sign-up", current: ["Responses across four political-value axes", "70 questions · about 15 minutes", "Four paired scores and eight guides"],
    legend: "Each row is one axis. The two displayed ends add up to 100%, including after rounding.",
    axes: ["Economic", "Diplomatic", "Civil", "Societal"],
    poles: [["Equality", "Markets"], ["Globe", "Nation"], ["Liberty", "Authority"], ["Progress", "Tradition"]],
    effect: (multiplier: number, terms: string) => `This response applies a multiplier of ${multiplier}. It changes the signed sums by ${terms}.`,
  },
  zh: {
    endStart: "开始 8 Values 测试", stylesLink: "浏览八份轴端指南", sampleLink: "先看结果示例",
    headline: "8values 题本改编 · 完整结果免费", guideFree: "八份指南都可在作答前免费阅读。",
    stylesTitle: "四条价值观数轴，八份解读指南", method: "70 道题怎么计算四条数轴", sample: "虚构作答结果示例",
    trust: "70 题 · 约 15 分钟 · 免费 · 免注册", current: ["四条政治价值观数轴上的选择", "70 题 · 约 15 分钟", "四对互补数值和八份指南"],
    legend: "每行是一条轴，四舍五入后，两端显示值的和仍为 100%。",
    axes: ["经济", "外交", "公民", "社会"],
    poles: [["平等", "市场"], ["全球", "国家"], ["公民自由", "权威"], ["进步", "传统"]],
    effect: (multiplier: number, terms: string) => `这项回答的系数是 ${multiplier}。带符号的各轴加权和变动为：${terms}。`,
  },
  "zh-TW": {
    endStart: "開始 8 Values 測驗", stylesLink: "瀏覽八份端點指南", sampleLink: "先看看作答範例",
    headline: "8values 題本改編 · 完整結果免費", guideFree: "八份指南都能在作答前免費閱讀。",
    stylesTitle: "四條價值觀軸線與八份閱讀指南", method: "如何用 70 題算出四組結果？", sample: "模擬答卷的結果",
    trust: "70 題 · 約 15 分鐘 · 免費 · 免註冊", current: ["四條政治價值觀軸線上的選擇", "70 題 · 約 15 分鐘", "四組成對分數與八份指南"],
    legend: "每列是一條軸線。兩端的顯示值互補，四捨五入後加起來仍是 100%。",
    axes: ["經濟", "外交", "公民", "社會"],
    poles: [["平等", "市場"], ["全球", "國家"], ["公民自由", "權威"], ["進步", "傳統"]],
    effect: (multiplier: number, terms: string) => `這個答案採用係數 ${multiplier}。各軸線的帶正負號加權總和變動如下：${terms}。`,
  },
};
