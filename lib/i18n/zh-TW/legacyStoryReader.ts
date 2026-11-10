import { cache } from "react";
import { notFound } from "next/navigation";
import { CHANGAN_SLUG } from "@/lib/entertainment/changan";
import { hasTraditionalBespokeStory } from "@/lib/i18n/traditionalLegacyStoryPaths";
import { loadTraditionalChangan } from "./changan";
import { loadTraditionalLegacyStory } from "./legacyStories";
import { loadTraditionalBespokeStory } from "./bespokeStories";

export const requireTraditionalLegacyStory = cache(async (slug: string) => {
  const story = await loadTraditionalLegacyStory(slug);
  if (!story) notFound();
  return story;
});

export const requireTraditionalStoryQuiz = cache(async (slug: string) => {
  const quiz = slug === CHANGAN_SLUG ? await loadTraditionalChangan()
    : hasTraditionalBespokeStory(slug) ? await loadTraditionalBespokeStory(slug)
      : (await requireTraditionalLegacyStory(slug)).quiz;
  if (!quiz) notFound();
  return quiz;
});
