import { additionalStoryEditorials } from "@/components/entertainment/AdditionalStoryEditorials";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { hasTraditionalLegacyStory } from "@/lib/i18n/traditionalLegacyStoryPaths";
import generated from "./legacy-stories.generated.json";

import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

export async function loadTraditionalLegacyStory(slug: string) {
  if (!hasTraditionalLegacyStory(slug)) return null;
  const quiz = await loadFunQuiz(slug);
  const editorial = additionalStoryEditorials[slug];
  if (!quiz || !editorial) return null;
  return {
    quiz: projectStoryCopy(quiz, `lib/entertainment/data/${slug}.json`, generated.quizUnits),
    editorial: projectStoryCopy(editorial, `/${slug}`, generated.editorialUnits),
  };
}


export function traditionalLegacyStoryTitle(slug: string): string {
  const unit = (generated.quizUnits as TextUnits)[`lib/entertainment/data/${slug}.json/title`];
  if (!unit) throw new Error(`Missing Taiwan story title: ${slug}`);
  return unit.text;
}
