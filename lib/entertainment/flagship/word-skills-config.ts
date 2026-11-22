export const wordSkillsSamples = [
  { id: "all-correct", answers: "ABCDABCDABCDABCDABCDABCDA", labels: { en: "25 of 25 correct", zh: "答对 25 题", "zh-TW": "答對 25 題" } },
  { id: "mixed", answers: "ABCDBBCDABCDBAADBAAAABCAB", labels: { en: "15 of 25 correct", zh: "答对 15 题", "zh-TW": "答對 15 題" } },
  { id: "none-correct", answers: "BAAABAAABAAABAAABAAABAAAB", labels: { en: "0 of 25 correct", zh: "答对 0 题", "zh-TW": "答對 0 題" } },
] as const;

export const wordSkillsPresentation = {
  en: {
    endStart: "Start the Word practice", stylesLink: "Browse the five Word guides",
    headline: "Original practice bank · Desktop Word for Windows", guideFree: "All five guides are free to read before answering.",
    stylesTitle: "Five Word topics to practise", method: "How the practice is marked", sample: "Three illustrative answer sets",
    trust: "25 questions · About 12 minutes · Free · No sign-up", current: ["Word for Microsoft 365 on Windows", "25 questions · about 12 minutes", "Correct counts and explanations for every item"],
    legend: "Each bar shows how many of the five questions in that topic the sample gets right.",
    answer: (correct: boolean): string => correct ? "Correct · Add 1 to this topic and to your overall count." : "Incorrect · Add 0 to both counts.",
  },
  zh: {
    endStart: "开始 Word 技能练习", stylesLink: "浏览五份 Word 复习指南",
    headline: "原创练习题 · Windows 桌面版 Word", guideFree: "五份复习指南都可以在答题前免费阅读。",
    stylesTitle: "从五类 Word 操作开始复习", method: "答对一题怎样计分", sample: "三份虚构答卷",
    trust: "25 题 · 约 12 分钟 · 免费 · 免注册", current: ["Windows 版 Microsoft 365 Word", "25 题 · 约 12 分钟", "总正确数、五个分项和逐题解析"],
    legend: "每条柱显示对应主题的 5 道题中答对几道。",
    answer: (correct: boolean): string => correct ? "答对 · 本项和总正确数各加 1。" : "答错 · 本项和总正确数均不增加。",
  },
  "zh-TW": {
    endStart: "開始 Word 技能練習", stylesLink: "看看五份 Word 複習指南",
    headline: "原創練習題 · Windows 桌面版 Word", guideFree: "作答前就能免費閱讀五份複習指南。",
    stylesTitle: "從五類 Word 操作中挑一項複習", method: "答對一題怎麼計分？", sample: "三份模擬答卷",
    trust: "25 題 · 約 12 分鐘 · 免費 · 免註冊", current: ["Windows 版 Microsoft 365 Word", "25 題 · 約 12 分鐘", "總答對題數、五項主題和逐題解析"],
    legend: "每條長條呈現該主題五題中答對幾題。",
    answer: (correct: boolean): string => correct ? "答對 · 該主題和總答對題數各加 1。" : "答錯 · 兩個答對題數都維持原樣。",
  },
};

export const wordSkillsRelatedPaths = [
  "/tests/explore/excel-skills",
  "/tests/explore/workplace-technology",
  "/tests/holland-career-interest-test-riasec",
];

export const wordSkillsRelated = {
  en: [
    ["Excel skills practice", "Practise a different office tool through spreadsheet questions.", "Try Excel practice", "See the practice format", "Answer explanations"],
    ["Workplace technology practice", "Review everyday choices involving documents, spreadsheets and collaboration.", "Try workplace technology", "See the practice format", "Scenario-based explanations"],
    ["Holland Code career interest test", "If you enjoyed organising a document, explore which kinds of work activities interest you.", "Explore career interests", "60 questions", "Six career interest areas"],
  ],
  zh: [
    ["Excel 技能练习", "如果还想练电子表格，可以试试 Excel 的操作题。", "试做 Excel 练习", "查看练习说明", "答案与解析"],
    ["办公技术练习", "复习文档、表格和在线协作中的常见选择。", "试做办公技术练习", "查看练习说明", "办公情境解析"],
    ["霍兰德职业兴趣测试", "如果你喜欢整理一份文档，可以看看自己对哪些工作活动更感兴趣。", "探索职业兴趣", "60 题", "六类职业兴趣"],
  ],
  "zh-TW": [
    ["Excel 技能練習", "還想練習試算表操作？可以接著做 Excel 題目。", "試做 Excel 練習", "查看練習說明", "答案與解析"],
    ["職場科技練習", "複習文件、試算表和線上協作時常遇到的選擇。", "試做職場科技練習", "查看練習說明", "職場情境解析"],
    ["霍蘭德職業興趣測驗", "如果你喜歡整理文件，也可以了解哪些工作活動最能引起你的興趣。", "探索職業興趣", "60 題", "六類職業興趣"],
  ],
};
