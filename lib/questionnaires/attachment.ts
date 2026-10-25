import type { Questionnaire } from "./types";

export type AttachmentAxis = { sum: number; rated: number; total: number; mean: number | null };
export type AttachmentResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: number; attachmentAxes: Record<string, AttachmentAxis>;
};
const axes = ["anxiety", "avoidance"], profiles = ["secure", "anxious", "avoidant", "fearful"];

// Original adult-context frequency form, not an ECR-family instrument or a category assignment.
export function isAttachmentConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "attachment" || quiz.code !== "ATTACHMENT_REFLECTION_24"
    || quiz.source.formCode !== "fm_attachment_context_frequency_24" || quiz.source.scoringVersion !== "1.0.0"
    || !quiz.instructions || quiz.minimumRatedItems !== 8 || quiz.questions.length !== 24
    || quiz.directions.length !== 2 || quiz.profiles.length !== 4) return false;
  if (new Set(quiz.questions.map(q => q.id)).size !== 24 || new Set(quiz.directions.map(d => d.id)).size !== 2
    || !quiz.directions.every(d => axes.includes(d.id) && d.itemCount === 12)
    || new Set(quiz.profiles.map(p => p.id)).size !== 4
    || !quiz.profiles.every(p => profiles.includes(p.id) && p.directionIds.join("|") === "anxiety|avoidance")) return false;
  return quiz.questions.every(q => {
    const match = /^ATT_(ANX|AVD)_(0[1-9]|1[0-2])$/.exec(q.id);
    if (!match || q.reverse !== (Number(match[2]) >= 9) || q.options.length !== 6 || new Set(q.options.map(o => o.id)).size !== 6) return false;
    return q.options.every(o => o.directionId === (match[1] === "ANX" ? "anxiety" : "avoidance")
      && (o.id === "na" ? o.score === null : /^[1-5]$/.test(o.id) && o.score === Number(o.id)));
  });
}

export function scoreAttachmentQuestionnaire(quiz: Questionnaire, answers: unknown): AttachmentResult {
  if (!isAttachmentConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (answers === null || typeof answers !== "object"
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const attachmentAxes: Record<string, AttachmentAxis> = Object.fromEntries(axes.map(id => [id, { sum: 0, rated: 0, total: 12, mean: null }]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.options.find(o => o.id === value);
    if (!question || !option) return { status: "invalid", answered };
    const axis = attachmentAxes[option.directionId];
    if (typeof option.score === "number") { axis.sum += question.reverse ? 6 - option.score : option.score; axis.rated++; }
    answered++;
  }
  if (answered !== 24) return { status: "incomplete", answered };
  for (const axis of Object.values(attachmentAxes)) {
    if (axis.rated >= 8) axis.mean = Math.round(axis.sum / axis.rated * 10) / 10;
  }
  return { status: "complete", answered, attachmentAxes };
}
