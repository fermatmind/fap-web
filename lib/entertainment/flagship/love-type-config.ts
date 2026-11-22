export const loveTypeSamples = [
  { id: "single", answers: "LLLLLLLFCCCCCCAARRRRRPPPOOOOOEEE", labels: { en: "One compatible reading", zh: "一份相容解读", "zh-TW": "一個相符組合" } },
  { id: "two-ties", answers: "LLLLFFFFCCCCCCAARRRRPPPPOOOEEEEE", labels: { en: "Two axes tie", zh: "两条轴并列", "zh-TW": "兩條軸並列" } },
  { id: "four-ties", answers: "LLLLFFFFCCCCAAAARRRRPPPPOOOOEEEE", labels: { en: "All four axes tie", zh: "四条轴都并列", "zh-TW": "四條軸皆並列" } },
] as const;

export const loveTypePresentation = {
  en: {
    endStart: "Take the Love Type 16 quiz", stylesLink: "Read all 16 combination guides",
    headline: "Original four-axis quiz · Full results free", guideFree: "Read any of the 16 combinations before or after the quiz.",
    stylesTitle: "16 ways the four choices can come together", method: "How each pair of choices is counted", sample: "Illustrative Love Type 16 readouts",
    trust: "32 questions · About 7 minutes · Free · No sign-up", current: ["Choices about starting, caring, priorities and plans", "32 questions · about 7 minutes", "Four counts in pairs, all compatible readings and an optional PNG"],
    legend: "Each row compares the two sides of one axis across eight answers. A 4–4 tie keeps both sides.",
    axes: ["Opening a direction", "Care in the moment", "First consideration", "Defining the plan"],
  },
  zh: {
    endStart: "开始 16 型恋爱偏好测试", stylesLink: "浏览 16 份组合指南",
    headline: "原创四轴测验 · 完整结果免费", guideFree: "16 份组合指南在答题前后都可以免费阅读。",
    stylesTitle: "四条轴，16 种可能的选择组合", method: "一组两端的选择怎么计数", sample: "16 型恋爱偏好结果样张",
    trust: "32 题 · 约 7 分钟 · 免费 · 免注册", current: ["发起回应、照顾、起点与安排的偏好", "32 题 · 约 7 分钟", "四对次数、所有相容解读和可选 PNG"],
    legend: "每行对比同一条轴的八次选择。4 比 4 时，两端都保留。",
    axes: ["谁先提出方向", "这个时刻的照顾角色", "首先留意什么", "怎样说明安排"],
  },
  "zh-TW": {
    endStart: "開始 16 型戀愛偏好測驗", stylesLink: "看看 16 份組合指南",
    headline: "原創四軸測驗 · 完整結果免費", guideFree: "作答前後都能免費閱讀所有 16 份組合指南。",
    stylesTitle: "四條軸，可以讀成 16 種組合", method: "同一條軸的兩端怎麼計數？", sample: "16 型戀愛偏好結果範例",
    trust: "32 題 · 約 7 分鐘 · 免費 · 免註冊", current: ["你怎麼開口、照顧、作取捨與談安排", "32 題 · 約 7 分鐘", "四組成對次數、所有符合的讀法與 PNG 圖卡"],
    legend: "每列比較同一條軸的八次選擇。若兩端各四次，兩個方向都保留。",
    axes: ["誰先提出方向", "這個時刻的照顧角色", "先留意哪一點", "怎麼談彼此的安排"],
  },
};
