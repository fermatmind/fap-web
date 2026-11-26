import { Compass, Feather, Sparkles, Moon } from "lucide-react";
import { ResultHonorCard } from "@/components/questionnaires/ArchetypeHonorCard";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { ShareMethod } from "@/lib/entertainment/activity";
import { changanPortraitPath, CHANGAN_SLUG } from "@/lib/entertainment/changan";
import type { resolveFunQuiz } from "@/lib/entertainment/scoring";
import type { FunQuiz } from "@/lib/entertainment/types";
import { storyHonorLabels, storyHonorRunnerUp, wave3aStoryVariant } from "@/lib/entertainment/wave3aStory";
import { getWave3aStoryHonorCopy } from "@/lib/questionnaires/wave3aStoryHonorCopy";

const marks = { neon: Sparkles, dusk: Moon, slate: Compass, gold: Feather };

export function Wave3aStoryHonorCard({ quiz, locale, textLocale, translate, result, onRetake, onShare }: {
  quiz: FunQuiz; locale: DisplayLocale; textLocale: Locale; translate: (value: string) => string;
  result: ReturnType<typeof resolveFunQuiz>; onRetake: () => void; onShare?: (method: ShareMethod) => void;
}) {
  const variant = wave3aStoryVariant(quiz.slug);
  if (!variant || !result.complete) return null;
  const matches = result.resultIds.map(id => ({ id, name: translate(quiz.results.find(portrait => portrait.id === id)!.title[textLocale]) }));
  const labels = storyHonorLabels[locale];
  const reading = matches.length === 1 ? getWave3aStoryHonorCopy(quiz.slug, matches[0].id, locale) : labels.tiedReading;
  const runner = storyHonorRunnerUp(quiz, result);
  const Mark = marks[variant.theme];
  return <ResultHonorCard slug={quiz.slug} locale={locale} theme={variant.theme} matches={matches} reading={reading}
    shortTitle={getWave3aStoryHonorCopy(quiz.slug, matches[0].id, locale).shortTitle}
    runnerUp={runner && translate(runner.title[textLocale])}
    portraitPath={quiz.slug === CHANGAN_SLUG ? changanPortraitPath(matches[0].id) : undefined}
    artworkMark={matches.length === 1 && <Mark className="size-16" strokeWidth={1.5} />}
    storyMode={variant.mechanism} spaceAfterActions onRetake={onRetake} onShare={onShare} />;
}
