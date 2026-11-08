import type { Questionnaire } from "./types";

type Question = Questionnaire["questions"][number];

/** Rank/multiple choices remain a private string value in the existing answer map. */
export function selectedChoiceIds(question: Question, value: string | undefined, complete = false): string[] | null {
  if (!value) return question.interaction && !complete ? [] : null;
  if (!question.interaction) return question.options.some(o => o.id === value) ? [value] : null;
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { return null; }
  if (!Array.isArray(parsed) || parsed.some(id => typeof id !== "string" || !question.options.some(o => o.id === id)) || new Set(parsed).size !== parsed.length) return null;
  const max = question.interaction === "rank" ? question.options.length : question.maximumSelections ?? question.options.length;
  const min = question.interaction === "rank" ? max : question.minimumSelections ?? 1;
  return parsed.length > max || (complete && parsed.length < min) ? null : parsed as string[];
}
