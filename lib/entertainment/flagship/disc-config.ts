export const discExamples = [
  { id: "one-highest", answers: "AAAAAAAAABABAAAAAABABABA", labels: { en: "One highest", zh: "单项最高", "zh-TW": "單項最高" } },
  { id: "two-highest", answers: "AAAAAAAAABABAAAAABABBABA", labels: { en: "Two highest", zh: "两项并列", "zh-TW": "兩項並列" } },
  { id: "four-highest", answers: "AAAAAAAAAAAAAAAAAAAAAAAA", labels: { en: "All four tied", zh: "四项并列", "zh-TW": "四項並列" } },
] as const;

export const discFreeAccess = {
  en: "Taking the test and viewing your four basic counts and highest matching result are free. The complete personal report is available as a separate optional purchase.",
  zh: "答题、四个方向的基础次数和最高匹配结果免费。完整个人报告可另行付费解锁。",
  "zh-TW": "作答、四個方向的基礎次數和最高配對結果皆免費。完整個人報告可另行付費解鎖。",
};

export const discPresentation = {
  en: {
    start: "Start the DISC test", endStart: "Take the 24-question DISC test", stylesLink: "Browse DISC result guides", sampleLink: "See sample results",
    headline: "Original style questionnaire · Free basic results", stylesTitle: "15 possible highest-count combinations",
    method: "How the four DISC counts are calculated", sample: "Illustrative response patterns",
    trust: "24 questions · About 5 minutes · Free basic result", current: ["Four work and collaboration approaches", "24 questions · about 5 minutes", "Free basic counts and results · Optional paid report"],
    legend: "Number of choices for each direction, out of 12 appearances. The four counts add up to 24.",
    axes: ["D · Moving things forward", "I · Engaging through expression", "S · Steady support", "C · Standards and checks"],
  },
  zh: {
    start: "开始 DISC 测试", endStart: "开始 24 题 DISC 测试", stylesLink: "浏览 DISC 结果指南", sampleLink: "先看结果示例",
    headline: "自编风格问卷 · 基础结果免费", stylesTitle: "15 种真实的最高结果组合",
    method: "DISC 四个方向怎么计数", sample: "虚构作答结果示例",
    trust: "24 题 · 约 5 分钟 · 基础结果免费", current: ["工作和协作里的四种做事倾向", "24 题 · 约 5 分钟", "基础次数和结果免费 · 报告可选付费"],
    legend: "每个方向出现 12 次。图中显示本例被选中的原始次数，四项合计 24。",
    axes: ["D · 推进处理", "I · 表达带动", "S · 稳定支持", "C · 规范核对"],
  },
  "zh-TW": {
    start: "開始 DISC 測驗", endStart: "開始 24 題 DISC 測驗", stylesLink: "瀏覽 DISC 結果指南", sampleLink: "先看看作答範例",
    headline: "自編風格問卷 · 基礎結果免費", stylesTitle: "15 種可能的最高結果組合",
    method: "DISC 四個方向怎麼計次？", sample: "模擬作答結果",
    trust: "24 題 · 約 5 分鐘 · 基礎結果免費", current: ["工作與合作時的四種行事傾向", "24 題 · 約 5 分鐘", "基礎次數及結果免費 · 可選購報告"],
    legend: "每個方向出現 12 次。圖中是各方向被選中的次數，四項總計 24 次。",
    axes: ["D · 推進處理", "I · 表達帶動", "S · 穩定支持", "C · 規範核對"],
  },
};
