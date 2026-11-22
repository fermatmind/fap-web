export const mbtiFunctionDetails = {
  Ni: ["内倾直觉", "把零散的变化连起来，想想接下来可能往哪走。"],
  Ne: ["外倾直觉", "顺着一个新线索想开去，看看还有几种走法。"],
  Si: ["内倾实感", "回想上次的细节，找出这次哪些地方一样、哪些不同。"],
  Se: ["外倾实感", "留意眼前发生了什么，随现场变化调整。"],
  Ti: ["内倾思考", "拆开事情的来龙去脉，看看前后的理由能不能对上。"],
  Te: ["外倾思考", "把条件摆出来，找一个大家可以照着做的标准。"],
  Fi: ["内倾情感", "问问自己最看重什么，哪些地方愿意让步。"],
  Fe: ["外倾情感", "留意这个决定会影响谁，还有谁的想法没听到。"],
} as const;

type CognitiveFunction = keyof typeof mbtiFunctionDetails;
type FunctionStack = readonly [CognitiveFunction, CognitiveFunction, CognitiveFunction, CognitiveFunction];

// The third position follows the alternating-attitude notation used in the
// encyclopedia's INTJ overview. The Foundation describes both possible attitudes.
export const mbtiFunctionStacks = {
  INTJ: ["Ni", "Te", "Fi", "Se"],
  INTP: ["Ti", "Ne", "Si", "Fe"],
  ENTJ: ["Te", "Ni", "Se", "Fi"],
  ENTP: ["Ne", "Ti", "Fe", "Si"],
  INFJ: ["Ni", "Fe", "Ti", "Se"],
  INFP: ["Fi", "Ne", "Si", "Te"],
  ENFJ: ["Fe", "Ni", "Se", "Ti"],
  ENFP: ["Ne", "Fi", "Te", "Si"],
  ISTJ: ["Si", "Te", "Fi", "Ne"],
  ISFJ: ["Si", "Fe", "Ti", "Ne"],
  ESTJ: ["Te", "Si", "Ne", "Fi"],
  ESFJ: ["Fe", "Si", "Ne", "Ti"],
  ISTP: ["Ti", "Se", "Ni", "Fe"],
  ISFP: ["Fi", "Se", "Ni", "Te"],
  ESTP: ["Se", "Ti", "Fe", "Ni"],
  ESFP: ["Se", "Fi", "Te", "Ni"],
} as const satisfies Record<string, FunctionStack>;

export type MbtiLandingType = keyof typeof mbtiFunctionStacks;
