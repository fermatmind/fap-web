import additional from "./discAdditionalPreviewContent.json";
import { discPreviewContent } from "./discPreviewContent";

export const discDirections = [
  { code: "D", id: "DOMINANCE", title: "推进处理", guideId: "single-d", body: "当事情需要启动，先明确目标和一个可调整的下一步。" },
  { code: "I", id: "INFLUENCE", title: "表达带动", guideId: "single-i", body: "当大家还没进入讨论，先把想法讲清楚，邀请彼此回应。" },
  { code: "S", id: "STEADINESS", title: "稳定支持", guideId: "single-s", body: "当行动需要持续，先确认大家能承担的节奏与支持。" },
  { code: "C", id: "CONSCIENTIOUSNESS", title: "规范核对", guideId: "single-c", body: "当方案需要落地，先核对依据、标准与容易遗漏的细节。" },
] as const;

export type DiscDirectionCode = typeof discDirections[number]["code"];
type CopyItem = { title: string; body: string };
export type DiscPreviewContent = {
  title: string; headline: string; introduction: string; tags: readonly string[];
  portrait: readonly string[]; strengths: readonly CopyItem[]; edges: readonly CopyItem[];
  work: readonly string[]; relationships: readonly string[];
  careers: readonly { title: string; detail: string }[];
  experiment: { title: string; body: string; phrase: string; review: string };
};

export const contents = { "single-d": discPreviewContent, ...additional } satisfies Record<string, DiscPreviewContent>;
export type DiscPreviewId = keyof typeof contents;

// Complete, reachable illustrative counts. These never replace a visitor's scored attempt.
const definitions: { id: DiscPreviewId; leaders: readonly DiscDirectionCode[]; counts: readonly number[]; alt: string }[] = [
  { id: "single-d", leaders: ["D"], counts: [8,5,4,7], alt: "手持地图、指向前方的推进者" },
  { id: "single-i", leaders: ["I"], counts: [5,9,4,6], alt: "打开画册、邀请交流的表达者" },
  { id: "single-s", leaders: ["S"], counts: [4,5,9,6], alt: "为植物搭起支撑的支持者" },
  { id: "single-c", leaders: ["C"], counts: [5,4,6,9], alt: "用量具核对木制模型的核对者" },
  { id: "tied-d-i", leaders: ["D","I"], counts: [8,8,4,4], alt: "两位角色对照地图和画册讨论下一步" },
  { id: "tied-d-s", leaders: ["D","S"], counts: [8,4,8,4], alt: "两位角色一起确认前进路线与休息位置" },
  { id: "tied-d-c", leaders: ["D","C"], counts: [8,4,4,8], alt: "两位角色核对地图与小桥模型的条件" },
  { id: "tied-i-s", leaders: ["I","S"], counts: [4,8,8,4], alt: "两位角色分享画册并耐心倾听" },
  { id: "tied-i-c", leaders: ["I","C"], counts: [4,8,4,8], alt: "两位角色对照创意草图与木制模型" },
  { id: "tied-s-c", leaders: ["S","C"], counts: [4,4,8,8], alt: "两位角色照料植物并检查支撑结构" },
  { id: "tied-d-i-s", leaders: ["D","I","S"], counts: [7,7,7,3], alt: "三位角色共同讨论野餐的路线、想法和休息安排" },
  { id: "tied-d-i-c", leaders: ["D","I","C"], counts: [7,7,3,7], alt: "三位角色围绕风车模型讨论尝试、草图与测量" },
  { id: "tied-d-s-c", leaders: ["D","S","C"], counts: [7,3,7,7], alt: "三位角色一起搭建、扶稳并核对小桥模型" },
  { id: "tied-i-s-c", leaders: ["I","S","C"], counts: [3,7,7,7], alt: "三位角色围桌分享、倾听并检查模型" },
  { id: "tied-d-i-s-c", leaders: ["D","I","S","C"], counts: [6,6,6,6], alt: "四位平等参与的角色围桌讨论不同做法" },
];

export const discPreviewProfiles = definitions.map(definition => ({
  ...definition,
  content: contents[definition.id],
  artwork: definition.id === "single-d" ? "/images/disc/preview-moving-forward.webp" : `/images/disc/preview/${definition.id}.webp`,
  scores: Object.fromEntries(discDirections.map((direction, index) => [direction.id, definition.counts[index]])),
}));

export function findDiscPreviewProfile(id: unknown) {
  return typeof id === "string" ? discPreviewProfiles.find(profile => profile.id === id) : undefined;
}

export function isDiscPreviewScoreValid(counts: Record<string, number>, leaders: readonly DiscDirectionCode[]) {
  if (Object.keys(counts).length !== 4 || !discDirections.every(({ id }) => Number.isInteger(counts[id]) && counts[id] >= 0 && counts[id] <= 12)
    || discDirections.reduce((sum, { id }) => sum + counts[id], 0) !== 24) return false;
  const highest = Math.max(...discDirections.map(({ id }) => counts[id]));
  const actual = discDirections.filter(({ id }) => counts[id] === highest).map(({ code }) => code);
  return actual.length === leaders.length && actual.every(code => leaders.includes(code));
}

/** Resolve display identity from authoritative counts without modifying the score. */
export function findDiscProfileByCounts(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const counts = value as Record<string, number>;
  return discPreviewProfiles.find(profile => isDiscPreviewScoreValid(counts, profile.leaders));
}
