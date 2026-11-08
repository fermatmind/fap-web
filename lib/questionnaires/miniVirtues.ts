import type { Questionnaire, Text } from "./types";

export const miniVirtuesDefinitions = [
  { id: "RECOGNITION_SELF_VIEW", profileId: "recognition-reading", sin: { en: "Pride", zh: "傲慢" }, virtue: { en: "Humility", zh: "谦卑" } },
  { id: "RESOURCE_SECURITY_SHARING", profileId: "resources-reading", sin: { en: "Greed", zh: "贪婪" }, virtue: { en: "Generosity", zh: "慷慨" } },
  { id: "DESIRE_BOUNDARY", profileId: "desire-boundaries-reading", sin: { en: "Lust", zh: "色欲" }, virtue: { en: "Chastity", zh: "贞洁" } },
  { id: "COMPARISON_APPRECIATION", profileId: "comparison-reading", sin: { en: "Envy", zh: "嫉妒" }, virtue: { en: "Kindness", zh: "仁爱" } },
  { id: "REWARD_MODERATION", profileId: "rewards-reading", sin: { en: "Gluttony", zh: "暴食" }, virtue: { en: "Temperance", zh: "节制" } },
  { id: "ANGER_PATIENCE", profileId: "anger-reading", sin: { en: "Wrath", zh: "暴怒" }, virtue: { en: "Patience", zh: "耐心" } },
  { id: "ACTIVATION_REST", profileId: "starting-rest-reading", sin: { en: "Sloth", zh: "懒惰" }, virtue: { en: "Diligence", zh: "勤勉" } },
] as const;

type MiniVirtuesQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "mini-virtues" };
type ThemeIdentity = { id: string; profileId: string };
export type MiniVirtuesDualResult = {
  status: "complete";
  answered: 28;
  model: "dual";
  miniVirtues: (ThemeIdentity & { sin: number; virtue: number })[];
};
export type MiniVirtuesResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | MiniVirtuesDualResult | {
  status: "complete";
  answered: 28;
  model?: never;
  miniVirtues: (ThemeIdentity & { rawSum: number; mean: number })[];
  equalFactorGroups: string[][];
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
const sections = (v: unknown): boolean => Array.isArray(v) && v.length > 0
  && Array.from(v).every(s => object(s) && typeof s.id === "string" && Boolean(s.id.trim()) && text(s.title)
    && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
  && new Set(v.map(s => s.id)).size === v.length;

function scoringModel(source: Record<string, unknown>, version: unknown) {
  if (version === "1.0.0" && source.kind === "fermatmind_original_mini_reuse"
    && source.formCode === "virtues_exploration_likert_28"
    && source.itemBankVersion === "0.1.0-preview" && source.scoringVersion === "0.1.0-preview"
    && source.resultContentVersion === "0.2.0-editorial-candidate") return "legacy";
  if ((version === "2.0.0" || version === "2.0.1") && source.kind === "fermatmind_original"
    && source.formCode === "virtues_dual_likert_28"
    && source.itemBankVersion === version && source.scoringVersion === "2.0.0"
    && source.resultContentVersion === "2.0.0") return "dual";
}

/** Keep old mixed-group submissions separate from the independently keyed dual-track form. */
export function isMiniVirtuesConfigurationValid(input: unknown): input is MiniVirtuesQuestionnaire {
  if (!object(input) || input.kind !== "mini-virtues" || input.slug !== "seven-sins-virtues-test"
    || input.code !== "VIRTUES_EXPLORATION" || !object(input.source)
    || input.source.psychometricValidationCompleted !== false || input.minimumRatedItems !== undefined
    || !Array.isArray(input.questions) || input.questions.length !== 28
    || !Array.isArray(input.directions) || input.directions.length !== 7
    || !Array.isArray(input.profiles) || input.profiles.length !== 7 || !text(input.instructions)) return false;
  const model = scoringModel(input.source, input.version);
  if (!model) return false;
  const quiz = input as unknown as MiniVirtuesQuestionnaire;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === miniVirtuesDefinitions[i].id
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  for (const [index, q] of quiz.questions.entries()) {
    const prefix = model === "dual" ? "VIRTUES_DUAL" : "VIRTUES_LK";
    if (!object(q) || q.id !== `${prefix}_${String(index + 1).padStart(3, "0")}` || !text(q.prompt)
      || q.reverse !== false || q.correctOptionId !== undefined || q.explanation !== undefined
      || !Array.isArray(q.options) || q.options.length !== 5) return false;
    if (!Array.from(q.options).every((o, position) => object(o) && o.id === String(position + 1)
      && o.directionId === miniVirtuesDefinitions[Math.floor(index / 4)].id
      && o.score === position + 1 && text(o.label))) return false;
  }
  if (!text(quiz.title) || !text(quiz.seoTitle) || !text(quiz.description) || !text(quiz.introduction)
    || !sections(quiz.guide) || quiz.guide.length < 3
    || !["virtues-scoring", "virtues-complete", "virtues-source"].every((id, i) => quiz.guide[i]?.id === id && quiz.guide[i]?.paragraphs.length === 1)
    || !Array.isArray(quiz.faq) || quiz.faq.length === 0
    || !Array.from(quiz.faq).every(f => object(f) && text(f.question) && text(f.answer))
    || (quiz.references !== undefined && (!Array.isArray(quiz.references)
      || !Array.from(quiz.references).every(r => object(r) && text(r.title) && typeof r.url === "string"
        && /^https:\/\//.test(r.url))))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === miniVirtuesDefinitions[i].profileId
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === miniVirtuesDefinitions[i].id
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && object(p.seo) && text(p.seo.title) && text(p.seo.description)
    && sections(p.sections) && p.sections.length === 8);
}

export function scoreMiniVirtuesQuestionnaire(quiz: unknown, answers: unknown): MiniVirtuesResult {
  if (!isMiniVirtuesConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    if (!ids.has(id) || !["1", "2", "3", "4", "5"].some(option => option === value)) return { status: "invalid", answered };
    answered++;
  }
  // The numeric midpoint is a valid answer. All 28 responses are required.
  if (answered !== 28) return { status: "incomplete", answered };
  if (scoringModel(quiz.source, quiz.version) === "dual") {
    const miniVirtues = miniVirtuesDefinitions.map(({ id, profileId }, index) => {
      const [sinA, virtueA, sinB, virtueB] = quiz.questions.slice(index * 4, index * 4 + 4).map(q => Number(answers[q.id]));
      return { id, profileId, sin: (sinA + sinB - 2) * 12.5, virtue: (virtueA + virtueB - 2) * 12.5 };
    });
    return { status: "complete", answered: 28, model: "dual", miniVirtues };
  }
  const miniVirtues = miniVirtuesDefinitions.map((part, index) => {
    const rawSum = quiz.questions.slice(index * 4, index * 4 + 4).reduce((sum, q) => sum + Number(answers[q.id]), 0);
    return { id: part.id, profileId: part.profileId, rawSum, mean: rawSum / 4 };
  });
  const groups = new Map<number, string[]>();
  for (const part of miniVirtues) groups.set(part.rawSum, [...(groups.get(part.rawSum) ?? []), part.id]);
  return { status: "complete", answered: 28, miniVirtues, equalFactorGroups: [...groups.values()].filter(group => group.length > 1) };
}
