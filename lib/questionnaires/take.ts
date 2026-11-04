import catalog from "./catalog.json";

/** Forms and workspaces retain their own interaction; questionnaires use /take. */
export const INLINE_QUESTIONNAIRE_TOOLS = ["career-match", "life-path-number", "nine-star-ki", "natal-chart", "nakshatra-spica-reference"] as const;
export function hasQuestionnaireTake(slug: string) {
  return catalog.some(item => item.slug === slug && item.questionCount > 0) && !INLINE_QUESTIONNAIRE_TOOLS.some(tool => tool === slug);
}
