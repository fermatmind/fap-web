export const adultAgeExamples = [
  { id: "one-highest", answers: "AAAAAAAAABABAAAAAB", labels: { en: "One highest count", zh: "单项最高", "zh-TW": "單項最高" } },
  { id: "two-highest", answers: "AAAAAAAAABABAAABAB", labels: { en: "Two-way tie", zh: "两项并列", "zh-TW": "兩項並列" } },
  { id: "three-highest", answers: "AAAAAAAAAAAAAAAAAA", labels: { en: "Three-way tie", zh: "三项并列", "zh-TW": "三項並列" } },
] as const;

export const adultAgePresentation = {
  en: {
    start: "Start the free test", endStart: "Start the age-context test", stylesLink: "See all seven result guides", sampleLink: "See a sample result", headline: "Adult relationship scenarios · Full results free",
    stylesTitle: "Seven possible age-context results", method: "How the three counts are calculated", sample: "Illustrative response patterns",
    trust: "18 questions · About 5 minutes · Free · No sign-up", current: ["Choices across three adult age contexts", "18 questions · about 5 minutes", "Three counts and every leading context"],
    legend: "Number of choices for each context, out of 12 appearances. The three counts add up to 18.",
    axes: ["Older", "Similar age or stage", "Younger"],
  },
  zh: {
    start: "开始免费测试", endStart: "开始年上年下偏好测试", stylesLink: "浏览七种结果指南", sampleLink: "先看结果示例", headline: "成年伴侣情境 · 完整结果免费",
    stylesTitle: "七种成年关系情境结果", method: "三类情境怎么计数", sample: "虚构作答结果示例",
    trust: "18 题 · 约 5 分钟 · 免费 · 免注册", current: ["三类成年伴侣情境中的选择", "18 题 · 约 5 分钟", "三类选择次数及所有最高情境"],
    legend: "每类情境出现 12 次。图中显示该情境被选中的次数，三项合计 18。",
    axes: ["年上", "同龄或同阶段", "年下"],
  },
  "zh-TW": {
    start: "開始免費測驗", endStart: "開始偏好測驗", stylesLink: "瀏覽七種結果指南", sampleLink: "看看三個作答範例", headline: "成年伴侶情境 · 完整結果免費",
    stylesTitle: "七種成年關係情境結果", method: "三類情境怎麼計次？", sample: "模擬作答結果",
    trust: "18 題 · 約 5 分鐘 · 免費 · 免註冊", current: ["三類成年伴侶情境中的選擇", "18 題 · 約 5 分鐘", "三類選擇次數及所有最高情境"],
    legend: "每類情境出現 12 次。圖中顯示你會看到的選擇次數，三項合計 18。",
    axes: ["年上", "同齡或同階段", "年下"],
  },
};
