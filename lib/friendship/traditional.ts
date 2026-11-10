import type { Locale } from "./core";
import copyData from "./traditional-copy.json";
import questionData from "./traditional-questions.json";

export type FriendshipDisplayLocale = Locale | "zh-TW";

const traditionalCopy: Readonly<Record<string, string>> = copyData;
type VisibleQuestion = { prompt: string; options: readonly string[] };
const traditionalQuestions: Readonly<Record<string, { source: VisibleQuestion; text: VisibleQuestion }>> = questionData;

export function friendshipSourceLocale(locale: FriendshipDisplayLocale): Locale {
  return locale === "zh-TW" ? "zh" : locale;
}

export function friendshipCopy(locale: FriendshipDisplayLocale) {
  function translate(text: string): string {
    return locale === "zh-TW" && Object.hasOwn(traditionalCopy, text) ? traditionalCopy[text] : text;
  }

  // A tagged template localizes its authored fragments while leaving participant
  // names, scores and other interpolated values exactly as they were.
  return (text: string | TemplateStringsArray, ...values: unknown[]): string => {
    if (typeof text === "string") return translate(text);
    return text.reduce((result, part, index) => result + (index ? String(values[index - 1]) : "") + translate(part), "");
  };
}

export function friendshipQuestionText(question: { id: string } & Record<Locale, VisibleQuestion>, locale: FriendshipDisplayLocale): VisibleQuestion {
  if (locale !== "zh-TW") return question[locale];
  const candidate = Object.hasOwn(traditionalQuestions, question.id) ? traditionalQuestions[question.id] : undefined;
  const original = question.zh;

  // Existing challenges freeze their actual source. Match both option positions
  // before applying this edition, even when an older invite uses the same ID.
  if (candidate?.source.prompt === original.prompt && original.options.length === 2 && candidate.source.options[0] === original.options[0]
    && candidate.source.options[1] === original.options[1]) return candidate.text;
  return original;
}
