import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { ShareMethod } from "@/lib/entertainment/activity";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import { getWave2bHonorCopy } from "@/lib/questionnaires/wave2bHonorCopy";
import { wave2bShortTitle, type wave2bCardData } from "@/lib/questionnaires/wave2bResult";
import { wave2bVariant } from "@/lib/questionnaires/wave2bScope";
import { ResultHonorCard } from "./ArchetypeHonorCard";

export function Wave2bHonorCard({ quiz, data, locale, textLocale, translate, onRetake, onShare }: {
  quiz: Questionnaire;
  data: NonNullable<ReturnType<typeof wave2bCardData>>;
  locale: DisplayLocale;
  textLocale: Locale;
  translate: (value: string) => string;
  onRetake: () => void;
  onShare?: (method: ShareMethod) => void;
}) {
  const variant = wave2bVariant(quiz.slug);
  if (!variant) return null;
  const localize = (text: Text) => translate(text[textLocale]);
  const reading = getWave2bHonorCopy(quiz.slug, data.readingId, locale);
  const title = wave2bShortTitle(quiz, locale, localize);
  return <ResultHonorCard slug={quiz.slug} locale={locale} theme={variant.theme} shortTitle={title}
    matches={data.matches} metrics={data.metrics} reading={reading} spaceAfterActions onRetake={onRetake}
    shareEntryOnly={variant.entryOnly || data.readingId === "missing"} entryOnlyPoster={variant.entryOnlyPoster} shareTitle={localize(quiz.title)}
    onShare={quiz.slug === "intimacy-values" ? undefined : onShare} />;
}
