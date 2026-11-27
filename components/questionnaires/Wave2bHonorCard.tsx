import type { ComponentProps } from "react";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { ShareMethod } from "@/lib/entertainment/activity";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import { getWave2bHonorCopy } from "@/lib/questionnaires/wave2bHonorCopy";
import { wave2bShortTitle, type wave2bCardData } from "@/lib/questionnaires/wave2bResult";
import { wave2bVariant } from "@/lib/questionnaires/wave2bScope";
import { ResultHonorCard } from "./ArchetypeHonorCard";

export function Wave2bHonorCard({ quiz, data, locale, textLocale, translate, onRetake, onShare, presentation }: {
  quiz: Questionnaire;
  data: NonNullable<ReturnType<typeof wave2bCardData>>;
  locale: DisplayLocale;
  textLocale: Locale;
  translate: (value: string) => string;
  onRetake: () => void;
  onShare?: (method: ShareMethod) => void;
  presentation?: Pick<ComponentProps<typeof ResultHonorCard>, "theme" | "reading" | "shortTitle" | "shareEntryOnly" | "entryOnlyPoster" | "tieMark">;
}) {
  const variant = wave2bVariant(quiz.slug);
  if (!variant && !presentation) return null;
  const localize = (text: Text) => translate(text[textLocale]);
  const card = presentation ?? {
    theme: variant!.theme,
    reading: getWave2bHonorCopy(quiz.slug, data.readingId, locale),
    shortTitle: wave2bShortTitle(quiz, locale, localize),
    shareEntryOnly: variant!.entryOnly || data.readingId === "missing",
    entryOnlyPoster: variant!.entryOnlyPoster,
  };
  return <ResultHonorCard slug={quiz.slug} locale={locale} {...card}
    matches={data.matches} metrics={data.metrics} spaceAfterActions onRetake={onRetake}
    shareTitle={localize(quiz.title)} onShare={quiz.slug === "intimacy-values" ? undefined : onShare} />;
}
