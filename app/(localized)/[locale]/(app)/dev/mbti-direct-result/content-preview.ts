import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import type { MbtiApplicationContent, MbtiDesktopCloneContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import pack from "./content-candidates.zh-CN.json";
import { applicationPreview } from "./application-preview";
import { previewStrengths } from "./strengths-preview";

type Candidate = { chapters: MbtiDesktopCloneContent["chapters"]; applications: MbtiApplicationContent };
// Local editorial candidates only. Runtime publication remains owned by backend CMS.
const candidates = pack.types as unknown as Record<string, Candidate>;
export const previewCodes = Object.keys(candidates).flatMap((type) => [`${type}-A`, `${type}-T`]);

export function applyChinesePreview(data: PersonalityDesktopCloneContentPayload) {
  if (data.locale !== "zh-CN" || !previewCodes.includes(data.fullCode)) {
    throw new Error("This editorial preview requires a supported zh-CN MBTI identity.");
  }
  const type = data.fullCode.slice(0, 4);
  if (type === "ISFJ") {
    // Both suffixes share the accepted sample; suffix differences remain in the score interpretation.
    const sample = previewStrengths({ ...data, fullCode: "ISFJ-A" });
    return { data: { ...sample, fullCode: data.fullCode }, applications: applicationPreview };
  }
  const candidate = candidates[type];
  return { data: { ...data, content: { ...data.content, chapters: {
    career: { ...data.content.chapters.career, ...candidate.chapters.career },
    growth: { ...data.content.chapters.growth, ...candidate.chapters.growth },
    relationships: { ...data.content.chapters.relationships, ...candidate.chapters.relationships },
  } } }, applications: candidate.applications };
}

export function previewDimensions(code: string) {
  if (!previewCodes.includes(code)) throw new Error("Unsupported preview identity");
  const axes = [
    ["EI", "E", "I", "外向", "内向"], ["SN", "S", "N", "实感", "直觉"],
    ["TF", "T", "F", "思考", "情感"], ["JP", "J", "P", "判断", "知觉"],
    ["AT", "A", "T", "坚定", "敏感"],
  ];
  const poles = [...code.slice(0, 4), code.slice(-1)];
  const sample = code === "ISFJ-A" ? [49, 65, 47, 54, 50] : null;
  return axes.map(([axisCode, leftCode, rightCode, leftLabel, rightLabel], index) => {
    const dominantPole = poles[index];
    const rawFirstPolePct = sample?.[index] ?? (dominantPole === leftCode ? 55 : 45);
    return { axisCode, leftCode, rightCode, leftLabel, rightLabel, dominantPole,
      dominantLabel: dominantPole === leftCode ? leftLabel : rightLabel,
      rawFirstPolePct, dominantPct: dominantPole === leftCode ? rawFirstPolePct : 100 - rawFirstPolePct };
  });
}
