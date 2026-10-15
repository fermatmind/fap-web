import type { IqAttemptAnswer, IqQuestion } from "@/lib/iq/contracts";
import { normalizeIqQuestionForRenderer } from "@/lib/iq/renderer";
import type { QuizQuestion } from "@/lib/quiz/types";

export type IqTakeQuestion = QuizQuestion & {
  sourceQuestionId?: string;
  sourceItemId?: string;
};

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

/** Locale-specific fields win; an English view never falls back to Chinese copy. */
function localizedText(record: Record<string, unknown>, fields: string[], locale: "en" | "zh", localizedOnly = false): string | undefined {
  for (const field of fields) {
    const selected = normalizeString(record[`${field}_${locale}`]);
    if (selected && (locale === "zh" || !/\p{Script=Han}/u.test(selected))) return selected;
  }
  if (localizedOnly) return undefined;
  for (const field of fields) {
    if (record[`${field}_en`] !== undefined || record[`${field}_zh`] !== undefined) continue;
    const generic = normalizeString(record[field]);
    if (generic && (locale === "zh" || !/\p{Script=Han}/u.test(generic))) return generic;
  }
  return undefined;
}

function localizeImage(value: unknown, locale: "en" | "zh"): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const source = value as Record<string, unknown>;
  const result = { ...source };
  for (const field of ["alt", "accessibility_label"]) {
    if (source[field] !== undefined || source[`${field}_en`] !== undefined || source[`${field}_zh`] !== undefined) {
      result[field] = localizedText(source, [field], locale)
        ?? (locale === "en" ? "English image description unavailable." : "图片说明暂缺。");
    }
  }
  if (source.image) result.image = localizeImage(source.image, locale);
  return result;
}

function localizeQuestion(question: IqQuestion, index: number, locale: "en" | "zh"): IqQuestion {
  const source = question as Record<string, unknown>;
  const stem = question.stem as Record<string, unknown> | undefined;
  const title = localizedText(source, ["prompt", "text", "title"], locale, true)
    ?? (stem ? localizedText(stem, ["prompt", "text"], locale, true) : undefined)
    ?? localizedText(source, ["prompt", "text", "title"], locale)
    ?? (stem ? localizedText(stem, ["prompt", "text"], locale) : undefined)
    ?? (locale === "en" ? `Question ${index + 1}: English instructions unavailable.` : `第 ${index + 1} 题`);
  return {
    ...question,
    title, prompt: title, text: title,
    ...(stem ? { stem: { ...localizeImage(stem, locale) as object, prompt: title } } : {}),
    options: (question.options ?? []).map((option) => {
      const source = option as Record<string, unknown>;
      const text = localizedText(source, ["text", "label"], locale);
      return { ...localizeImage(option, locale) as NonNullable<IqQuestion["options"]>[number],
        text: text ?? (locale === "en" ? "English option text unavailable." : "选项文字暂缺。"),
        label: text ?? (locale === "en" ? "English option text unavailable." : "选项文字暂缺。"),
      };
    }),
  };
}

export function normalizeIqQuestionsForTake({
  items,
  locale,
}: {
  items: IqQuestion[];
  locale: "en" | "zh";
}): IqTakeQuestion[] {
  const normalizedQuestions: IqTakeQuestion[] = [];

  for (const [index, question] of items.entries()) {
    const normalized = normalizeIqQuestionForRenderer(localizeQuestion(question, index, locale));
    if (!normalized) {
      continue;
    }

    const questionId = normalizeString(question.question_id);
    const itemId = normalizeString(question.item_id);

    normalizedQuestions.push({
      id: normalized.id,
      title: normalized.prompt ?? (locale === "zh" ? `第 ${index + 1} 题` : `Question ${index + 1}`),
      options: normalized.options.map((option) => ({
        id: option.code,
        text: option.text,
        ...(option.svg ? { svg: option.svg } : {}),
        ...(option.image ? { image: option.image } : {}),
      })),
      ...(normalized.stem ? { stem: normalized.stem } : {}),
      ...(questionId ? { sourceQuestionId: questionId } : {}),
      ...(itemId ? { sourceItemId: itemId } : {}),
    });
  }

  return normalizedQuestions;
}

export function buildIqSubmitAnswers({
  questions,
  answersByQuestionId,
}: {
  questions: IqTakeQuestion[];
  answersByQuestionId: Record<string, string>;
}): IqAttemptAnswer[] {
  return questions.map((question, questionIndex) => {
    const optionCode = answersByQuestionId[question.id] ?? "";

    return {
      ...(question.sourceQuestionId
        ? { question_id: question.sourceQuestionId }
        : { item_id: question.sourceItemId ?? question.id }),
      option_code: optionCode,
      question_index: questionIndex,
    };
  });
}
