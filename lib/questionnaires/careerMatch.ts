import type { Questionnaire } from "./types";
import { CAREER_INTEREST_THEMES } from "@/lib/career/adapters/adaptCareerInterestComparison";

export const CAREER_MATCH_INPUT_RULES = {
  version: "fm_career_theme_comparison_v1",
  themes: CAREER_INTEREST_THEMES,
  minimumThemes: 1, maximumThemes: 6, minimumRoles: 2, maximumRoles: 3,
  comparison: "literal-set-intersection", roleOrder: "user-selection", storage: "memory-only",
  directoryContract: "career.protocol.job_index.v1", pageContract: "career.detail.page.v1",
} as const;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const bilingual = (v: unknown) => record(v) && ["en", "zh"].every(l => typeof v[l] === "string" && (v[l] as string).trim().length > 0);

export function isCareerMatchConfigurationValid(quiz: unknown): quiz is Questionnaire {
  if (!record(quiz) || quiz.slug !== "career-match" || quiz.code !== "FM_CAREER_THEME_COMPARE" || quiz.kind !== "career-theme-compare" ||
    !record(quiz.source) || quiz.source.kind !== "fermatmind_original_career_interest_comparison" ||
    quiz.source.formCode !== CAREER_MATCH_INPUT_RULES.version || quiz.source.itemBankVersion !== CAREER_MATCH_INPUT_RULES.version ||
    quiz.source.scoringVersion !== "fm_career_literal_interest_intersection_v1" || quiz.source.resultContentVersion !== "fm_career_comparison_guidance_v1" ||
    quiz.source.psychometricValidationCompleted !== false ||
    ![quiz.source.itemBankSha256, quiz.source.resultContentSha256].every(h => typeof h === "string" && /^[a-f0-9]{64}$/.test(h)) ||
    ![quiz.title, quiz.description, quiz.seoTitle, quiz.instructions, quiz.introduction, quiz.resultHeading].every(bilingual) ||
    !Array.isArray(quiz.questions) || quiz.questions.length !== 0 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 0 ||
    !Array.isArray(quiz.directions) || quiz.directions.length !== 6 ||
    !Array.from(quiz.directions).every((d, i) => record(d) && d.id === CAREER_INTEREST_THEMES[i] && bilingual(d.title)) ||
    !Array.isArray(quiz.guide) || quiz.guide.length !== 8 ||
    !Array.from(quiz.guide).every((s, i) => record(s) && s.id === ["method", "reading", ...CAREER_INTEREST_THEMES.map(x => `theme-${x}`)][i] && bilingual(s.title) &&
      Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(bilingual)) ||
    !Array.isArray(quiz.faq) || quiz.faq.length !== 6 || !Array.from(quiz.faq).every(f => record(f) && bilingual(f.question) && bilingual(f.answer)) ||
    !Array.isArray(quiz.references) || quiz.references.length !== 1 || !record(quiz.references[0]) ||
    quiz.references[0].url !== "https://www.onetonline.org/find/descriptor/browse/1.B.1/" || !bilingual(quiz.references[0].title)) return false;
  return true;
}
