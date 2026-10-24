import type { FunCard, FunQuiz, FunResult } from "./types";

export const resultSlug = (id: string) => id.replaceAll("_", "-");
export const quizPath = (locale: "en" | "zh", slug: string) => `/${locale}/tests/play/${slug}`;
export const resultPath = (locale: "en" | "zh", slug: string, id: string) => `${quizPath(locale, slug)}/results/${resultSlug(id)}`;
export const contentImagePath = (quiz: Pick<FunQuiz, "slug" | "version">, locale: "en" | "zh", id?: string) => `/og/fun/${quiz.slug}?locale=${locale}${id ? `&portrait=${resultSlug(id)}` : ""}&v=${quiz.version}`;

export function findPublicPortrait(quiz: FunQuiz, slug: string): FunResult | undefined {
  return quiz.results.find(result => resultSlug(result.id) === slug);
}

export function relatedFunQuizzes(cards: FunCard[], quiz: Pick<FunQuiz, "slug" | "category">): FunCard[] {
  const others = cards.filter(card => card.slug !== quiz.slug);
  return [...others.filter(card => card.category === quiz.category), ...others.filter(card => card.category !== quiz.category)].slice(0, 3);
}

// This is a public rules example, never a visitor's saved answers or result.
export function portraitRuleExample(quiz: FunQuiz, id: string) {
  if (quiz.mechanism === "tally") return quiz.questions.flatMap(question => question.options
    .filter(option => (option.points?.[id] ?? 0) > 0)
    .map(option => ({ question: question.prompt, choice: option.label }))).slice(0, 2);
  function visit(nodeId: string, seen: Set<string>): { question: typeof quiz.questions[number]["prompt"]; choice: typeof quiz.questions[number]["prompt"] }[] | null {
    if (seen.has(nodeId)) return null;
    const question = quiz.questions.find(q => q.id === nodeId);
    if (!question) return null;
    for (const option of question.options) {
      const step = { question: question.prompt, choice: option.label };
      if (option.result === id) return [step];
      if (option.next) {
        const rest = visit(option.next, new Set([...seen, nodeId]));
        if (rest) return [step, ...rest];
      }
    }
    return null;
  }
  return visit(quiz.questions[0].id, new Set()) ?? [];
}

export function portraitDescription(result: FunResult, locale: "en" | "zh"): string {
  const text = result.summary[locale];
  return text.match(locale === "zh" ? /^.*?[。！？]/u : /^.*?[.!?](?:\s|$)/u)?.[0].trim() ?? text;
}
