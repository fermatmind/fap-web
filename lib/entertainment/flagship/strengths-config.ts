import type { Questionnaire } from "@/lib/questionnaires/types";

export const strengthsSampleAxes = ["appreciation-of-beauty", "love", "teamwork", "curiosity", "fairness", "forgiveness"] as const;

export const strengthsSamples = [
  { id: "neutral", labels: { en: "All neutral", zh: "全部选中间项", "zh-TW": "全選中間選項" } },
  { id: "mixed", labels: { en: "Different means", zh: "分项表现不同", "zh-TW": "各分項均分不同" } },
  { id: "missing", labels: { en: "One part without a score", zh: "有一项资料不足", "zh-TW": "有一項資料不足" } },
] as const;

export const strengthsPresentation = {
  en: {
    endStart: "Take the character strengths test", stylesLink: "Read all 24 strengths guides",
    headline: "Public-domain IPIP-VIA-R items · Full results free", guideFree: "Read every guide before or after answering.",
    stylesTitle: "24 strengths, each with its own everyday example", method: "How the four answers for each strength are scored", sample: "Illustrative strengths readouts",
    trust: "96 questions · About 15 minutes · Free · No sign-up", current: ["How you see everyday behaviours", "96 questions · about 15 minutes", "Separate readings and 24 public guides"],
    legend: "Six of the 24 parts are shown in the same order for each sample. A mean uses the 1–5 scale.",
    insufficient: "Insufficient information", answerScore: (points: number) => `This answer contributes ${points} to this part.`,
    unscored: "This answer is unscored. This part requires four rated answers to show a mean.",
  },
  zh: {
    endStart: "开始性格优势测试", stylesLink: "浏览 24 份优势指南",
    headline: "IPIP-VIA-R公有领域条目 · 完整结果免费", guideFree: "作答前后都能免费阅读全部指南。",
    stylesTitle: "把 24 项性格优势放回日常生活里看", method: "每项四道题怎样计分", sample: "性格优势结果样张",
    trust: "96 题 · 约 15 分钟 · 免费 · 免注册", current: ["你如何评价自己的日常行为", "96 题 · 约 15 分钟", "各项独立读数和 24 份公开指南"],
    legend: "样张从 24 项中固定选出六项，按同样的顺序展示 1–5 分均值。",
    insufficient: "资料不足", answerScore: (points: number) => `这个选项为本分项计 ${points} 分。`,
    unscored: "这个选项不计分。本项需要四个计分回答才显示均分。",
  },
  "zh-TW": {
    endStart: "開始性格優勢測驗", stylesLink: "看看 24 份優勢指南",
    headline: "IPIP-VIA-R 公有領域題目 · 完整結果免費", guideFree: "作答前後都能免費閱讀所有指南。",
    stylesTitle: "從 24 種日常情境認識性格優勢", method: "每個分項的四題怎麼計分？", sample: "性格優勢結果範例",
    trust: "96 題 · 約 15 分鐘 · 免費 · 免註冊", current: ["你怎麼看待自己在日常的做法", "96 題 · 約 15 分鐘", "各項獨立讀數和 24 份公開指南"],
    legend: "每份範例都以同一順序節錄 24 項中的六項，均分介於 1 至 5。",
    insufficient: "資料不足", answerScore: (points: number) => `這個選項會在該分項計入 ${points} 分。`,
    unscored: "這個選項不計分。該分項需要四個計分答案才會顯示均分。",
  },
};

export function strengthsSampleAnswers(quiz: Questionnaire, sampleId: string) {
  const fixedMeans: Partial<Record<string, number>> = {
    "appreciation-of-beauty": 5, love: 4, curiosity: 2, fairness: 1, forgiveness: 4,
  };
  let teamworkPosition = 0;
  return Object.fromEntries(quiz.questions.map(question => {
    if (sampleId === "missing" && question.id === "IPIPVIA_APP_1") return [question.id, "na"];
    if (sampleId !== "mixed") return [question.id, "3"];
    const facet = question.options[0].directionId;
    const scored = facet === "teamwork" ? (teamworkPosition++ < 2 ? 3 : 4) : fixedMeans[facet] ?? 3;
    return [question.id, String(question.reverse ? 6 - scored : scored)];
  }));
}
