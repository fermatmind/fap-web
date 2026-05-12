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

function resolveQuestionTitle(question: IqQuestion, index: number, locale: "en" | "zh"): string {
  const prompt =
    normalizeString(question.prompt)
    ?? normalizeString(question.text)
    ?? normalizeString(question.stem?.prompt)
    ?? normalizeString(question.stem?.prompt_zh)
    ?? normalizeString(question.stem?.prompt_en);

  if (prompt) {
    return prompt;
  }

  return locale === "zh" ? `第 ${index + 1} 题` : `Question ${index + 1}`;
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
    const normalized = normalizeIqQuestionForRenderer(question);
    if (!normalized) {
      continue;
    }

    const questionId = normalizeString(question.question_id);
    const itemId = normalizeString(question.item_id);

    normalizedQuestions.push({
      id: normalized.id,
      title: resolveQuestionTitle(question, index, locale),
      options: normalized.options.map((option) => ({
        id: option.code,
        text: option.text,
        ...(option.svg ? { svg: option.svg } : {}),
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
