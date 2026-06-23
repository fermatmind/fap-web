export type QuizVectorPath = {
  d: string;
  fill?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: number | string;
};

export type QuizVectorGraphic = {
  viewBox: string;
  paths: QuizVectorPath[];
};

export type QuizImageGraphic = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type QuizQuestionStem = {
  prompt?: string;
  svg?: QuizVectorGraphic | null;
  image?: QuizImageGraphic | null;
};

export type QuizOption = {
  id: string;
  text: string;
  svg?: QuizVectorGraphic | null;
  image?: QuizImageGraphic | null;
};

export type QuizQuestion = {
  id: string;
  title: string;
  options: QuizOption[];
  stem?: QuizQuestionStem | null;
};
