import type { DisplayLocale } from "@/lib/i18n/locales";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import type { MbtiApplicationContent, MbtiDesktopCloneContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import traditional from "./content-candidates.zh-TW.json";
import english from "./content-candidates.en.json";
import englishBase from "./preview-base.en.json";
import { applyChinesePreview, previewCodes, previewDimensions } from "./content-preview";

type Candidate = { chapters: MbtiDesktopCloneContent["chapters"]; applications: MbtiApplicationContent };
const packs = { "zh-TW": traditional.types, en: english.types } as unknown as Record<"zh-TW" | "en", Record<string, Candidate>>;
const names: Record<string, string> = { E: "Extraversion", I: "Introversion", S: "Sensing", N: "Intuition", T: "Thinking", F: "Feeling", J: "Judging", P: "Perceiving" };
const bases = englishBase as Record<string, { name: string }>;

export function applyLocalizedPreview(data: PersonalityDesktopCloneContentPayload, language: DisplayLocale) {
  if (language === "zh") return applyChinesePreview(data);
  if (data.locale !== "zh-CN" || !previewCodes.includes(data.fullCode)) throw new Error("Unsupported preview source identity");
  const type = data.fullCode.slice(0, 4);
  const candidate = packs[language][type];
  const content = { ...data.content, chapters: {
    career: { ...data.content.chapters.career, ...candidate.chapters.career },
    growth: { ...data.content.chapters.growth, ...candidate.chapters.growth },
    relationships: { ...data.content.chapters.relationships, ...candidate.chapters.relationships },
  } };
  if (language === "en") {
    const preferences = [...type].map((pole) => names[pole]);
    const introduction = `${type} combines ${preferences.join(", ")}. Use these preferences as questions to explore in real situations, rather than conclusions about ability or career fit.`;
    content.hero = { summary: introduction, profileIdentity: { code: data.fullCode, name: bases[type].name, nickname: "", rarity: "", keywords: [...preferences, "Self-reflection", "Context matters"], introduction } };
    content.intro = { paragraphs: [
      "The descriptions below are perspectives to test against your own experience. Notice which parts fit, which do not, and what changes with the task, available support or setting.",
      "Choose one recent example and compare your intentions, actions and results. A type code cannot establish skills, predict a career outcome or decide how someone will behave in a relationship.",
    ] };
    content.overview = { title: "Reflect on a recent example", paragraphs: content.intro.paragraphs };
    content.lettersIntro = undefined;
    content.traits = {
      summaryPane: { eyebrow: "Preference scores", title: "Your current response pattern", value: "", body: "Percentages describe weighted directions in this set of answers, not ability, reliability, population percentiles or certainty about a lasting trait." },
      body: ["The four-letter part refers to four preference pairs. Scores near the midpoint need particular care: both approaches may be used in different situations.", "A/T is a FermatMind extension about current stress and feedback responses, not an official fifth MBTI preference or a measure of mental health or stress tolerance."],
    };
    // Hidden offer copy remains a projection; the real amount and currency are retained.
    content.finalOffer = { ...content.finalOffer, eyebrow: "Your report", headline: "Explore your results", body: "Review the report and choose an exercise relevant to your current situation.", ctaLabel: "My MBTI reports", guarantee: "" };
  }
  return { data: { ...data, locale: language === "en" ? "en" as const : data.locale, content }, applications: candidate.applications };
}

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
