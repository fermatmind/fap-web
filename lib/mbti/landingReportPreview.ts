export const mbtiLandingAxes = [
  ["EI", "E", "I", "精力来源"],
  ["SN", "S", "N", "获取信息"],
  ["TF", "T", "F", "做决定"],
  ["JP", "J", "P", "安排生活"],
] as const;

export const mbtiLandingChapters = ["人格特征", "职业道路", "个人成长", "人际关系"] as const;
export const mbtiPublicSampleHref = "/zh/reports/samples/mbti";

export type MbtiLandingPublicSample = {
  code: string;
  scores: number[];
  portraitLine: string;
  chapters: string[];
};
