import { cache } from "react";
import { notFound } from "next/navigation";
import { loadTraditionalLegacyStory } from "./legacyStories";

export const requireTraditionalLegacyStory = cache(async (slug: string) => {
  const story = await loadTraditionalLegacyStory(slug);
  if (!story) notFound();
  return story;
});
