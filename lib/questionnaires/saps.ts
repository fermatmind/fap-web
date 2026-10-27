import type { Questionnaire } from "@/lib/questionnaires/types";

export type SapsDomain = "standards" | "discrepancy";
export type SapsDomainScore = { sum: number; mean: number; rated: 4; total: 4 };
export type SapsResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number } | {
  status: "complete"; answered: 8; sapsDomains: Record<SapsDomain, SapsDomainScore>;
};
type SapsQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "saps" };
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const text = (value: unknown) => object(value) && typeof value.en === "string" && Boolean(value.en.trim())
  && typeof value.zh === "string" && Boolean(value.zh.trim());
const domains = ["standards", "discrepancy"] as const;
const sourceItems = [
  {
    "id": "saps-01",
    "direction": "standards",
    "en": "I have high expectations for myself."
  },
  {
    "id": "saps-02",
    "direction": "discrepancy",
    "en": "Doing my best never seems to be enough."
  },
  {
    "id": "saps-03",
    "direction": "standards",
    "en": "I set very high standards for myself."
  },
  {
    "id": "saps-04",
    "direction": "discrepancy",
    "en": "I often feel disappointment after completing a task because I know I could have done better."
  },
  {
    "id": "saps-05",
    "direction": "standards",
    "en": "I have a strong need to strive for excellence."
  },
  {
    "id": "saps-06",
    "direction": "discrepancy",
    "en": "My performance rarely measures up to my standards."
  },
  {
    "id": "saps-07",
    "direction": "standards",
    "en": "I expect the best from myself."
  },
  {
    "id": "saps-08",
    "direction": "discrepancy",
    "en": "I am hardly ever satisfied with my performance."
  }
] as const;
const anchors = ["Strongly disagree", "Disagree", "Slightly disagree", "Neutral", "Slightly agree", "Agree", "Strongly agree"] as const;

/** The complete source SAPS: seven anchors, two separate four-item means, no inferred type. */
export function isSapsConfigurationValid(quiz: unknown): quiz is SapsQuestionnaire {
  if (!object(quiz) || quiz.kind !== "saps" || quiz.slug !== "perfectionism" || quiz.code !== "SAPS8_RICE_2014"
    || !object(quiz.source) || quiz.source.kind !== "rice_saps8_author_permission_working_zh"
    || quiz.source.formCode !== "saps8_rice2014_official_en_fm_zh_working_v1"
    || quiz.source.itemBankVersion !== quiz.source.formCode
    || quiz.source.scoringVersion !== "saps8_two4_complete8_unrounded_mean_v1"
    || quiz.source.psychometricValidationCompleted !== false || !text(quiz.instructions)
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 8
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 2
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 2) return false;
  if (!Array.from(quiz.directions).every((direction, index) => object(direction) && direction.id === domains[index]
    && direction.itemCount === 4 && text(direction.title))) return false;
  if (!Array.from(quiz.profiles).every((profile, index) => object(profile) && profile.id === `${domains[index]}-reading`
    && Array.isArray(profile.directionIds) && profile.directionIds.length === 1 && profile.directionIds[0] === domains[index]
    && text(profile.title) && text(profile.headline) && text(profile.summary) && text(profile.scoreReading)
    && object(profile.seo) && text(profile.seo.title) && text(profile.seo.description)
    && Array.isArray(profile.sections) && profile.sections.length === 8
    && Array.from(profile.sections).every(section => object(section) && typeof section.id === "string" && Boolean(section.id)
      && text(section.title) && Array.isArray(section.paragraphs) && section.paragraphs.length > 0
      && Array.from(section.paragraphs).every(text)))) return false;
  return Array.from(quiz.questions).every((question, index) => {
    const source = sourceItems[index];
    return object(question) && question.id === source.id && question.reverse === false && question.correctOptionId === undefined
      && object(question.prompt) && question.prompt.en === source.en && text(question.prompt)
      && Array.isArray(question.options) && question.options.length === 7
      && Array.from(question.options).every((option, position) => object(option) && option.id === String(position + 1)
        && option.score === position + 1 && option.directionId === source.direction
        && object(option.label) && option.label.en === anchors[position] && text(option.label));
  });
}

export function scoreSapsQuestionnaire(quiz: unknown, answers: unknown): SapsResult {
  if (!isSapsConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(question => [question.id, question]));
  const sums = { standards: 0, discrepancy: 0 };
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const question = questions.get(id);
    const option = question?.options.find(candidate => candidate.id === value);
    if (!question || !option || typeof option.score !== "number") return { status: "invalid", answered };
    sums[option.directionId as SapsDomain] += option.score;
    answered += 1;
  }
  if (answered !== 8) return { status: "incomplete", answered };
  return {
    status: "complete", answered: 8,
    sapsDomains: {
      standards: { sum: sums.standards, mean: sums.standards / 4, rated: 4, total: 4 },
      discrepancy: { sum: sums.discrepancy, mean: sums.discrepancy / 4, rated: 4, total: 4 },
    },
  };
}
