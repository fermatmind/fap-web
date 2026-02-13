export type QuizOption = { id: string; text: string };

export type QuizQuestion = {
  id: string;
  title: string;
  options: QuizOption[];
};
