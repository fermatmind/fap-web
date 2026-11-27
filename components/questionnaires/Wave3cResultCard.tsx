import type { ComponentProps } from "react";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import { getWave3cHonorCopy } from "@/lib/questionnaires/wave3cHonorCopy";
import { wave3cCardData, type Wave3cScore } from "@/lib/questionnaires/wave3cResult";
import { wave3cVariant, type wave3cScope } from "@/lib/questionnaires/wave3cScope";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { Wave2bHonorCard } from "./Wave2bHonorCard";

const shortEnglishTitles: Record<string, string> = {
  "arabic-personality-compass": "Personality Compass",
  "asvab-practice-test": "ASVAB-Style Practice",
  "asvab-science-mechanical-practice-test": "Science & Technical Practice",
  "caliper-style-assessment-test": "Most/Least Practice",
  "competency-test": "Work Behaviors",
  "culture-fit": "Work Arrangement Preferences",
  "empathy": "Compassion Check-In",
  "employer-reasoning-practice-test": "Reasoning Practice",
  "libertarian": "Principles Reflection",
  "remote-work": "Remote Work",
  "freelance-ready": "Freelance Readiness",
  "mote-type": "Mote Type",
  "multiple-intelligences": "Activity Reflection",
  "watson-glaser-practice-test": "Critical Thinking Practice",
  "work-activity-interests": "Work Activity Interests",
  "work-ethics": "Work Habits & Reliability",
};

export function Wave3cResultCard({ quiz, result, locale, onRetake, onShare }: {
  quiz: Questionnaire;
  result: Wave3cScore;
  locale: Locale;
  onRetake: () => void;
  onShare?: ComponentProps<typeof Wave2bHonorCard>["onShare"];
}) {
  const { traditional, displayText } = useQuestionnaireDisplayCopy();
  const displayLocale: DisplayLocale = traditional ? "zh-TW" : locale;
  const variant = wave3cVariant(quiz.slug);
  if (!variant) return null;
  const localize = (text: Text) => displayText(text[locale]);
  const data = wave3cCardData(quiz, result, displayLocale, localize);
  if (!data) return null;
  // Archived reports keep private scores and choices on this page.
  // The export and caption identify only the public quiz.
  const title = (locale === "en" && shortEnglishTitles[quiz.slug]) || localize(quiz.title);
  return <Wave2bHonorCard quiz={quiz} data={data} locale={displayLocale} textLocale={locale} translate={displayText}
    presentation={{
      theme: variant.theme, shortTitle: title, tieMark: "||", shareEntryOnly: true, entryOnlyPoster: true,
      reading: getWave3cHonorCopy(quiz.slug as keyof typeof wave3cScope, data.readingId, displayLocale, data.fields),
    }}
    onRetake={onRetake} onShare={onShare} />;
}
