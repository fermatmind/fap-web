export type Copy = { en: string; zh: string };
export type FunResult = {
  id: string; title: Copy; summary: Copy; example: Copy;
  strength: Copy; tradeoff: Copy; experiment: Copy;
};
export type FunOption = { id: string; label: Copy; points?: Record<string, number>; next?: string; result?: string };
export type FunQuestion = { id: string; prompt: Copy; options: FunOption[] };
export type FunQuiz = {
  slug: string; version: string; updated: string; category: string;
  title: Copy; description: Copy; introduction: Copy; focus: Copy;
  minutes: number; mechanism: "tally" | "branch";
  questions: FunQuestion[]; results: FunResult[]; tieOrder: string[];
};
export type FunCard = Pick<FunQuiz, "slug" | "version" | "updated" | "category" | "title" | "description" | "minutes"> & { questionCount: number; minQuestionCount: number };
export type Answers = Record<string, string>;
