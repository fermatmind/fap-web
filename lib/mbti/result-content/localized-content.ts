import type { DisplayLocale } from "@/lib/i18n/locales";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import type { MbtiApplicationContent, MbtiDesktopCloneContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import traditional from "./content.zh-TW.json";
import english from "./content.en.json";
import englishBase from "./type-names.en.json";
import { applyChineseContent, resultCodes } from "./chinese-content";

type Candidate = { chapters: MbtiDesktopCloneContent["chapters"]; applications: MbtiApplicationContent };
const packs = { "zh-TW": traditional.types, en: english.types } as unknown as Record<"zh-TW" | "en", Record<string, Candidate>>;
const names: Record<string, string> = { E: "Extraversion", I: "Introversion", S: "Sensing", N: "Intuition", T: "Thinking", F: "Feeling", J: "Judging", P: "Perceiving" };
const bases = englishBase as Record<string, { name: string }>;

export function applyLocalizedContent(data: PersonalityDesktopCloneContentPayload, language: DisplayLocale): { data: PersonalityDesktopCloneContentPayload; applications: MbtiApplicationContent } {
  if (language === "zh") return applyChineseContent(data);
  if (data.locale !== "zh-CN" || !resultCodes.includes(data.fullCode)) throw new Error("Unsupported result content identity");
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
