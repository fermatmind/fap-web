import type { Questionnaire } from "@/lib/questionnaires/types";
import { standardFacetConfig } from "./standard-facet-config";
import { bindFacetSampleAnswers } from "./facet-samples";

const basic = standardFacetConfig(240, 35, 40, {
  en: { headline: "Preliminary IPIP 240 items · Six full domain guides free", stylesTitle: "Six domains of this preliminary IPIP form", focus: "Which trait descriptions feel accurate in everyday life", output: "Six independent means and guides" },
  zh: { headline: "IPIP 初步版 240 题 · 六份完整领域指南免费", stylesTitle: "初步 IPIP 题组里的六个观察领域", focus: "日常生活中，哪些特质陈述与你相符", output: "六项独立均分和领域指南" },
  "zh-TW": { headline: "IPIP 初步版 240 題 · 六份完整領域指南免費", stylesTitle: "從六個領域認識這份 IPIP 初步版", focus: "平日哪些行為描述比較符合你", output: "六項各自的均分與領域指南" },
}, ["3".repeat(240), "3".repeat(240), "N" + "3".repeat(239)]);

export const hexacoConfig = {
  ...basic,
  facets: {
    ...basic.facets,
    decimals: 2,
    answers: (quiz: Questionnaire, id: string) => id !== "varied" ? basic.facets.answers(quiz, id)
      : bindFacetSampleAnswers(quiz, quiz.questions.map(question => {
        const group = quiz.directions.findIndex(direction => direction.id === question.options[0].directionId);
        const level = [5, 4, 3, 2, 1, 4][group];
        return String(question.reverse ? 6 - level : level);
      }).join("")),
  },
};
