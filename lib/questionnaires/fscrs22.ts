import type { Questionnaire, Text } from "./types";

/** Source Table 1 groups; 2019 paper values 1–5, without reverse-scoring RS. */
export const FSCRS22_PART_KEYS = {
  inadequate: [1, 2, 4, 6, 7, 14, 17, 18, 20],
  hated: [9, 10, 12, 15, 22],
  reassured: [3, 5, 8, 11, 13, 16, 19, 21],
} as const;

export type Fscrs22PartId = keyof typeof FSCRS22_PART_KEYS;
export type Fscrs22Choice = 1 | 2 | 3 | 4 | 5 | "na";
export type Fscrs22PartReadout = {
  numericCount: number;
  skippedCount: number;
  requiredCount: number;
  sum: number | null;
  mean: number | null;
};
export type Fscrs22Readout = {
  completed: true;
  parts: Record<Fscrs22PartId, Fscrs22PartReadout>;
};

const questionId = (number: number) => `fscrs-${String(number).padStart(2, "0")}`;
const questionIds = new Set(Array.from({ length: 22 }, (_, index) => questionId(index + 1)));
const isChoice = (value: unknown): value is Fscrs22Choice => value === "na"
  || (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5);

/** Finish requires all22 explicit choices. An explicit skip never becomes a number. */
export function readFscrs22(input: unknown): Fscrs22Readout | null {
  if (!Array.isArray(input) || input.length !== 22) return null;
  const responses = new Map<string, Fscrs22Choice>();
  for (const row of Array.from(input)) {
    if (row === null || typeof row !== "object" || Array.isArray(row)) return null;
    const fields = Reflect.ownKeys(row);
    if (fields.length !== 2 || !fields.includes("id") || !fields.includes("value")) return null;
    const { id, value } = row as { id: unknown; value: unknown };
    if (typeof id !== "string" || !questionIds.has(id) || responses.has(id) || !isChoice(value)) return null;
    responses.set(id, value);
  }
  if (responses.size !== 22) return null;

  const part = (numbers: readonly number[]): Fscrs22PartReadout => {
    let numericCount = 0;
    let sum = 0;
    for (const number of numbers) {
      const value = responses.get(questionId(number));
      if (typeof value === "number") { numericCount += 1; sum += value; }
    }
    const complete = numericCount === numbers.length;
    return { numericCount, skippedCount: numbers.length - numericCount, requiredCount: numbers.length,
      sum: complete ? sum : null, mean: complete ? sum / numbers.length : null };
  };
  return { completed: true, parts: {
    inadequate: part(FSCRS22_PART_KEYS.inadequate),
    hated: part(FSCRS22_PART_KEYS.hated),
    reassured: part(FSCRS22_PART_KEYS.reassured),
  } };
}

const sourceItems = [
  {
    "id": "fscrs-01",
    "en": "I am easily disappointed with myself.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-02",
    "en": "There is a part of me that puts me down.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-03",
    "en": "I am able to remind myself of positive things about myself.",
    "part": "reassured"
  },
  {
    "id": "fscrs-04",
    "en": "I find it difficult to control my anger and frustration at myself.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-05",
    "en": "I find it easy to forgive myself.",
    "part": "reassured"
  },
  {
    "id": "fscrs-06",
    "en": "There is a part of me that feels I am not good enough.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-07",
    "en": "I feel beaten down by my own self-critical thoughts.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-08",
    "en": "I still like being me.",
    "part": "reassured"
  },
  {
    "id": "fscrs-09",
    "en": "I have become so angry with myself that I want to hurt or injure myself.",
    "part": "hated"
  },
  {
    "id": "fscrs-10",
    "en": "I have a sense of disgust with myself.",
    "part": "hated"
  },
  {
    "id": "fscrs-11",
    "en": "I can still feel lovable and acceptable.",
    "part": "reassured"
  },
  {
    "id": "fscrs-12",
    "en": "I stop caring about myself.",
    "part": "hated"
  },
  {
    "id": "fscrs-13",
    "en": "I find it easy to like myself.",
    "part": "reassured"
  },
  {
    "id": "fscrs-14",
    "en": "I remember and dwell on my failings.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-15",
    "en": "I call myself names.",
    "part": "hated"
  },
  {
    "id": "fscrs-16",
    "en": "I am gentle and supportive with myself.",
    "part": "reassured"
  },
  {
    "id": "fscrs-17",
    "en": "I can’t accept failures and setbacks without feeling inadequate.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-18",
    "en": "I think I deserve my self-criticism.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-19",
    "en": "I am able to care and look after myself.",
    "part": "reassured"
  },
  {
    "id": "fscrs-20",
    "en": "There is a part of me that wants to get rid of the bits I don’t like.",
    "part": "inadequate"
  },
  {
    "id": "fscrs-21",
    "en": "I encourage myself for the future.",
    "part": "reassured"
  },
  {
    "id": "fscrs-22",
    "en": "I do not like being me.",
    "part": "hated"
  }
] as const;

export type Fscrs22Questionnaire = Omit<Questionnaire, "kind"> & { kind: "fscrs22"; fscrs22: {
  subtitle: Text; intro: Text[]; sensitiveNotice: Text; privacy: Text; attribution: Text;
  support: { urgent: Text; nonUrgent: Text };
} };
export type Fscrs22Result = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 22; fscrs22: Fscrs22Readout };
export const FSCRS22_PARTS = ["inadequate", "hated", "reassured"] as const;
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const text = (value: unknown) => object(value) && typeof value.en === "string" && Boolean(value.en.trim())
  && typeof value.zh === "string" && Boolean(value.zh.trim());

export function isFscrs22ConfigurationValid(quiz: unknown): quiz is Fscrs22Questionnaire {
  if (!object(quiz) || quiz.kind !== "fscrs22" || quiz.slug !== "inner-critic-voice-test" || quiz.code !== "FSCRS22_HALAMOVA_2019"
    || !object(quiz.source) || quiz.source.kind !== "fscrs22_2019_ccby_working_zh"
    || quiz.source.formCode !== "fscrs22_2019_1to5_fm_zh_working_v1" || quiz.source.itemBankVersion !== quiz.source.formCode
    || quiz.source.scoringVersion !== "fscrs22_three9_5_8_complete_parts_rawsum_mean_optional_na_v1"
    || quiz.source.psychometricValidationCompleted !== false || !text(quiz.instructions)
    || !object(quiz.fscrs22) || !text(quiz.fscrs22.subtitle) || !text(quiz.fscrs22.sensitiveNotice)
    || !text(quiz.fscrs22.privacy) || !text(quiz.fscrs22.attribution) || !object(quiz.fscrs22.support)
    || !text(quiz.fscrs22.support.urgent) || !text(quiz.fscrs22.support.nonUrgent)
    || !Array.isArray(quiz.fscrs22.intro) || quiz.fscrs22.intro.length !== 2 || !Array.from(quiz.fscrs22.intro).every(text)
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 22
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!Array.from(quiz.directions).every((direction, index) => object(direction) && direction.id === FSCRS22_PARTS[index]
    && direction.itemCount === FSCRS22_PART_KEYS[FSCRS22_PARTS[index]].length && text(direction.title))) return false;
  if (!Array.from(quiz.profiles).every((profile, index) => object(profile) && profile.id === FSCRS22_PARTS[index]
    && Array.isArray(profile.directionIds) && profile.directionIds.length === 1 && profile.directionIds[0] === profile.id
    && text(profile.title) && text(profile.headline) && text(profile.summary) && text(profile.scoreReading)
    && object(profile.seo) && text(profile.seo.title) && text(profile.seo.description)
    && Array.isArray(profile.sections) && profile.sections.length === 8
    && new Set(profile.sections.map(section => object(section) ? section.id : null)).size === 8
    && Array.from(profile.sections).every(section => object(section) && typeof section.id === "string" && Boolean(section.id)
      && text(section.title) && Array.isArray(section.paragraphs) && section.paragraphs.length === 2
      && Array.from(section.paragraphs).every(text)))) return false;
  return Array.from(quiz.questions).every((question, index) => {
    const source = sourceItems[index];
    return object(question) && question.id === source.id && question.reverse === false && question.correctOptionId === undefined
      && object(question.prompt) && question.prompt.en === source.en && text(question.prompt)
      && Array.isArray(question.options) && question.options.length === 6
      && Array.from(question.options).every((option, position) => {
        const value = position === 5 ? null : position + 1;
        const label = position === 0 ? "Not at all like me" : position === 4 ? "Extremely like me"
          : position === 5 ? "Skip this statement" : String(value);
        return object(option) && option.id === (position === 5 ? "na" : String(value)) && option.score === value
          && option.directionId === source.part && object(option.label) && option.label.en === label && text(option.label)
          && (position < 1 || position > 3 || option.label.zh === String(value));
      });
  });
}

/** The UI stores IDs as strings; only the source's five explicit options map to numeric values. */
export function scoreFscrs22Questionnaire(quiz: unknown, answers: unknown): Fscrs22Result {
  if (!isFscrs22ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers) || Reflect.ownKeys(answers).length !== Object.keys(answers).length) return { status: "invalid", answered: 0 };
  const rows: { id: string; value: Fscrs22Choice }[] = [];
  for (const [id, value] of Object.entries(answers)) {
    const question = quiz.questions.find(item => item.id === id);
    const option = typeof value === "string" ? question?.options.find(item => item.id === value) : undefined;
    if (!option) return { status: "invalid", answered: rows.length };
    rows.push({ id, value: option.id === "na" ? "na" : option.score as Fscrs22Choice });
  }
  if (rows.length !== 22) return { status: "incomplete", answered: rows.length };
  const readout = readFscrs22(rows);
  return readout ? { status: "complete", answered: 22, fscrs22: readout } : { status: "invalid", answered: rows.length };
}
