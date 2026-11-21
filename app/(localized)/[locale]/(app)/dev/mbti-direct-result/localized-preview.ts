import type { DisplayLocale } from "@/lib/i18n/locales";
import { previewDimensions } from "./content-preview";
export { applyLocalizedContent as applyLocalizedPreview } from "@/lib/mbti/result-content/localized-content";

export function localizedDimensions(code: string, language: DisplayLocale) {
  const dimensions = previewDimensions(code);
  if (language !== "en") return dimensions;
  const labels = [
    ["Energy", "Extraverted", "Introverted"], ["Information", "Sensing", "Intuitive"],
    ["Decisions", "Thinking", "Feeling"], ["Approach", "Judging", "Perceiving"],
    ["Stress and feedback", "Assertive", "Turbulent"],
  ];
  return dimensions.map((axis, i) => ({ ...axis, axisTitle: labels[i][0], leftLabel: labels[i][1], rightLabel: labels[i][2],
    dominantLabel: axis.dominantPole === axis.leftCode ? labels[i][1] : labels[i][2], strengthBand: axis.dominantPct <= 55 ? "boundary" : "clear",
    summary: axis.dominantPct === 50 ? "Both sides have the same direction score. The displayed code follows the scoring version's tie rule; it does not establish a stable preference." + (i === 4 ? " A/T is a FermatMind extension, not an official fifth MBTI preference or a measure of mental health or stress tolerance." : "")
      : i === 4 ? "This slight difference describes current answers about stress, feedback and self-confirmation. A/T is a FermatMind extension, not an official fifth MBTI preference or evidence of mental health, stress tolerance or work ability."
      : axis.dominantPct > 55 ? "These example answers lean toward this preference. The percentage describes weighted answer direction, not ability, certainty, a population percentile or a fixed requirement for your work or relationships."
      : "These example answers show only a slight lean. Both approaches may be useful in different situations; this small difference should not be read as a stable fact about you.",
  }));
}
