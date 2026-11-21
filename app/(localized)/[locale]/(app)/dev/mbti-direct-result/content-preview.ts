import { resultCodes as previewCodes } from "@/lib/mbti/result-content/chinese-content";
export { resultCodes as previewCodes, applyChineseContent as applyChinesePreview } from "@/lib/mbti/result-content/chinese-content";

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
