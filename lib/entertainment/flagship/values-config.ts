import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/basicScoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { bindFacetSampleAnswers } from "./facet-samples";
import { facetPresentation } from "./standard-facet-config";

const standard = facetPresentation(30, 6, 3, {
  en: { headline: "Original values reflection · Full results free", stylesTitle: "Ten goals people may consider important", focus: "How important different goals feel in your own life", output: "Raw means, relative readings and ten guides" },
  zh: { headline: "原创个人价值观回顾 · 完整结果免费", stylesTitle: "日常取舍里，有十种目标值得分开想", focus: "不同生活目标在你心里有多重要", output: "原始均分、相对值和十份指南" },
  "zh-TW": { headline: "原創個人價值觀回顧 · 完整結果免費", stylesTitle: "十個生活目標，各有重視它的理由", focus: "不同的人生目標對你有多重要", output: "原始均分、相對值和十份指南" },
});

export const valuesPresentation = {
  en: { ...standard.en, legend: "Bars show raw means. Relative values compare each mean with your own overall mean when all 30 items are rated." },
  zh: { ...standard.zh, legend: "长条显示原始均分。30 题全部有效时，才显示各项均分与本次整体均分的差值。" },
  "zh-TW": { ...standard["zh-TW"], legend: "長條顯示原始均分。30 題都有計分時，才顯示各項均分與本次整體均分的差值。" },
};

const text = {
  en: { titles: ["Same rating for every item", "Different priorities", "A rating is missing"], relative: "relative", missing: "relative values unavailable" },
  zh: { titles: ["每道题选同一个分数", "目标的优先程度不同", "有一道题不计分"], relative: "相对值", missing: "无相对值" },
  "zh-TW": { titles: ["每題都選同一個分數", "優先考量的目標不同", "有一題沒有計分"], relative: "相對值", missing: "無相對值" },
};

export function valuesSamples(quiz: Questionnaire, locale: DisplayLocale, key: Locale) {
  const labels = text[locale];
  const examples = [
    ["uniform", "4".repeat(30)],
    ["different", "4555555555".repeat(3)],
    ["one-missing", "N" + "3".repeat(29)],
  ];
  return examples.map(([id, choices], index) => {
    const result = scoreLikertQuestionnaire(quiz, bindFacetSampleAnswers(quiz, choices));
    if (result.status !== "complete") throw new Error(`Invalid personal values sample ${id}`);
    const parts = Object.values(result.facets);
    const baseline = parts.every(part => part.rated === 3) ? parts.reduce((sum, part) => sum + part.sum, 0) / 30 : null;
    return { id, title: labels.titles[index], axes: quiz.directions.map(({ id: axis, title }) => {
      const facet = result.facets[axis];
      const raw = facet.mean === null ? null : facet.sum / facet.rated;
      const difference = baseline === null || raw === null ? null : raw - baseline;
      return { id: axis, title: title[key], value: raw ?? 0, maximum: 5,
        score: raw === null ? valuesPresentation[locale].insufficient
          : `${raw.toFixed(2)} / 5 · ${difference === null ? labels.missing : `${labels.relative} ${difference > 0 ? "+" : ""}${difference.toFixed(2)}`}` };
    }) };
  });
}
