import type { Text } from "./types";

/** Entry/result presentation only. The source-bound question bank, scores and full guides are unchanged. */
export const philosopherPresentations: Record<string, { name: Text; conclusion: Text; reason: Text; accent: string }> = {
  socrates: { name: { zh: "苏格拉底", en: "Socrates" }, conclusion: { zh: "先把问题问清楚", en: "Start by examining the question" }, reason: { zh: "在这些题目中，你选择过澄清意思、追问依据和承认未知的理由。", en: "In these questions, you chose reasons about clarifying meanings, asking for grounds and acknowledging what is unknown." }, accent: "#5e705b" },
  aristotle: { name: { zh: "亚里士多德", en: "Aristotle" }, conclusion: { zh: "在具体处境中练习判断", en: "Practise judgment in the situation" }, reason: { zh: "在这些题目中，你选择过考察反复行动形成的做法，以及它是否适合当下处境的理由。", en: "In these questions, you chose reasons about what repeated actions establish and whether a practice fits the circumstances." }, accent: "#7e6449" },
  confucius: { name: { zh: "孔子", en: "Confucius" }, conclusion: { zh: "把学习放进日常相处", en: "Bring learning into relationships" }, reason: { zh: "在这些题目中，你选择过把学习、反省、守约和回应他人联系起来的理由。", en: "In these questions, you chose reasons connecting learning, reflection, keeping agreements and responding to others." }, accent: "#31565a" },
  laozi: { name: { zh: "老子", en: "Laozi" }, conclusion: { zh: "看看哪些强求可以减少", en: "Question unnecessary forcing" }, reason: { zh: "在这些题目中，你选择过检视多余规定、控制和刻意维持表象的理由。", en: "In these questions, you chose reasons about questioning added rules, control and efforts to force an ideal appearance." }, accent: "#617160" },
  epicurus: { name: { zh: "伊壁鸠鲁", en: "Epicurus" }, conclusion: { zh: "把想要的满足和代价一起看", en: "Consider the satisfaction and its costs" }, reason: { zh: "在这些题目中，你选择过考虑一种追求带来什么满足，以及随后的欲望和负担的理由。", en: "In these questions, you chose reasons about what a pursuit offers and the further wants and burdens it may bring." }, accent: "#6f7453" },
  epictetus: { name: { zh: "爱比克泰德", en: "Epictetus" }, conclusion: { zh: "分开自身判断与外在结果", en: "Distinguish judgment from outcomes" }, reason: { zh: "在这些题目中，你选择过区分自己的判断和行动，与无法保证的外在回应的理由。", en: "In these questions, you chose reasons distinguishing your judgment and actions from external responses you cannot guarantee." }, accent: "#5e6655" },
  nietzsche: { name: { zh: "尼采", en: "Friedrich Nietzsche" }, conclusion: { zh: "重新看看自己的尺度", en: "Reconsider your own standards" }, reason: { zh: "在这些题目中，你选择过追问自己沿用的评价标准，以及是否仍愿承担这些追求的理由。", en: "In these questions, you chose reasons about examining inherited standards and whether you would choose those pursuits anew." }, accent: "#4a4f50" },
  "simone-de-beauvoir": { name: { zh: "西蒙娜·德·波伏瓦", en: "Simone de Beauvoir" }, conclusion: { zh: "给彼此的选择留出空间", en: "Leave room for each other’s choices" }, reason: { zh: "在这些题目中，你选择过考虑自己的计划是否让他人仍能提出、拒绝和调整选择的理由。", en: "In these questions, you chose reasons about whether your plans leave others able to propose, decline and revise their choices." }, accent: "#785d66" },
  "marcus-aurelius": { name: { zh: "马可·奥勒留", en: "Marcus Aurelius" }, conclusion: { zh: "认真回应眼前的人与事", en: "Attend to the present response" }, reason: { zh: "在这些题目中，你选择过检视眼前判断、认真完成当前行动并回应他人的理由。", en: "In these questions, you chose reasons about examining present judgments, attending to the task at hand and responding to others." }, accent: "#7e6558" },
};

export const philosopherLandingDescription: Text = {
  en: "In this playful quiz, answer 18 everyday questions to discover which philosopher’s questions you want to explore first. See all tied results, then read the ideas behind them. Free, with no signup.",
  zh: "做一场轻松的趣味测验：回答18道日常选择，看看你更想从哪位哲学家的问题开始思考。并列结果全部保留，再读背后的思想。完整结果免费，无需注册。",
};
