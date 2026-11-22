import type { LocalizedLandingKind } from "./types";

export const landingUi = {
  en: {
    home: "Home", tests: "Tests", breadcrumbs: "Breadcrumb", report: "Preview your report", types: "12 archetypes",
    switchReport: "Choose a report example", reportLink: "Read the public sample report", referenceReport: "Open the fixed public sample",
    noSample: "Open the public sample for the full report layout.", correct: "Correct answers", accuracy: "Accuracy on this form",
    typeScores: "Nine Enneagram scores", choosePerspective: "Choose a perspective", explore: "Explore the framework",
    unavailable: "This test is currently unavailable.", related: "Read the guide", read: "Explore", next: "Explore next steps",
    method: "Scoring, interpretation and limits", faq: "Frequently asked questions", compare: "Which assessment should I take?",
    columns: ["Assessment", "What it measures", "Questions and time", "Best for"], table: "Assessment comparison, scroll horizontally",
    sampleExercise: "Practice example · unscored", exerciseImage: "The first row has one, two and three circles. The second has one square, two squares and a blank.",
    exerciseOptions: "Complete the second row", squares: "squares", exerciseStart: "Pick the option that fits both clues.",
    exerciseCorrect: "Correct. The shape stays the same across the row and the count goes up by one.",
    exerciseRetry: "Look at the second row again. What comes after one square and two squares?",
  },
  "zh-TW": {
    home: "首頁", tests: "測驗", breadcrumbs: "導覽路徑", report: "看看結果報告範例", types: "十二原型",
    switchReport: "切換報告範例", reportLink: "閱讀完整公開範例", referenceReport: "另看完整公開範例",
    noSample: "可直接開啟公開範例，查看完整報告版面。", correct: "答對題數", accuracy: "本題本答對率",
    typeScores: "九型人格分數分布", choosePerspective: "切換觀察角度", explore: "先認識測驗架構",
    unavailable: "作答入口暫時無法使用。", related: "閱讀使用指南", read: "深入認識", next: "探索下一步",
    method: "計分方式、結果解讀與使用範圍", faq: "常見問題", compare: "不同測驗，該怎麼選？",
    columns: ["測驗工具", "想了解什麼", "題數與所需時間", "適合誰"], table: "測驗比較表，可左右滑動",
    sampleExercise: "原創練習範例 · 不計分", exerciseImage: "第一列有一、二、三個空心圓，第二列有一、二個實心方塊和一個空格。",
    exerciseOptions: "補完第二列", squares: "個方塊", exerciseStart: "選一個符合兩個線索的答案。",
    exerciseCorrect: "答對了。同一列的形狀不變，每一格多一個。", exerciseRetry: "再看第二列。一個、兩個方塊，下一格會有幾個？",
  },
};

export const sectionHeadings: Record<LocalizedLandingKind, readonly [string, string, string, string]> = {
  mbti: ["What’s in your 16-type personality report?", "Put personality preferences into practice", "16 型人格報告可以看到什麼？", "從認識自己到理解彼此"],
  holland: ["What’s in your Holland Code report?", "Use your RIASEC results to explore a direction", "霍蘭德職業興趣測驗報告怎麼看？", "把興趣代碼用在選系、求職和轉職"],
  career: ["What does the free career test report show?", "Career planning for three real decisions", "免費職涯測驗結果包含什麼？", "升學選系、第一份工作與轉職"],
  big5: ["What does your Big Five report show?", "Use your Big Five profile in daily life", "大五人格測驗報告怎麼看？", "把五大特質放回日常生活觀察"],
  iq: ["What does the online IQ test report show?", "Turn your score into a practice plan", "線上智力測驗結果怎麼解讀？", "用解題結果規劃下一次練習"],
  enneagram: ["What’s in your Enneagram report?", "Explore recurring patterns in real life", "九型人格測驗報告包含什麼？", "用生活經驗核對九型人格結果"],
  jung: ["What does your 12 archetypes report show?", "Notice the roles you reach for", "榮格十二原型測驗會得到什麼？", "從日常選擇認識常用的角色"],
  disc: ["What does the DISC report show?", "Put DISC communication styles into practice", "DISC 行為風格測驗結果怎麼看？", "把 DISC 用在溝通與合作"],
  eq: ["What does your emotional intelligence report show?", "Try a small change in a real conversation", "情商測驗結果包含哪些能力？", "從生活情境練習情緒覺察與溝通"],
};
