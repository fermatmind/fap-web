import { cache } from "react";
import { notFound } from "next/navigation";
import { CHANGAN_SLUG } from "@/lib/entertainment/changan";
import { hasTraditionalNatureStory } from "@/lib/i18n/traditionalLegacyStoryPaths";
import { loadTraditionalChangan } from "./changan";
import { loadTraditionalLegacyStory } from "./legacyStories";
import { loadTraditionalNatureStory } from "./natureStories";

export const requireTraditionalLegacyStory = cache(async (slug: string) => {
  const story = await loadTraditionalLegacyStory(slug);
  if (!story) notFound();
  return story;
});

export const requireTraditionalStoryQuiz = cache(async (slug: string) => {
  const quiz = slug === CHANGAN_SLUG ? await loadTraditionalChangan()
    : hasTraditionalNatureStory(slug) ? await loadTraditionalNatureStory(slug)
      : (await requireTraditionalLegacyStory(slug)).quiz;
  if (!quiz) notFound();
  return quiz;
});
