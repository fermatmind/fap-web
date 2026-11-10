import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { hasTraditionalNatureStory } from "@/lib/i18n/traditionalLegacyStoryPaths";
import generated from "./nature-stories.generated.json";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

const quizUnits: TextUnits = generated.quizUnits;

export function traditionalNatureStoryTitle(slug: string): string {
  const unit = quizUnits[`lib/entertainment/data/${slug}.json/title`];
  if (!unit) throw new Error(`Missing Taiwan nature story title: ${slug}`);
  return unit.text;
}

export async function loadTraditionalNatureStory(slug: string) {
  if (!hasTraditionalNatureStory(slug)) return null;
  const quiz = await loadFunQuiz(slug);
  return quiz ? projectStoryCopy(quiz, `lib/entertainment/data/${slug}.json`, quizUnits) : null;
}

export function traditionalNatureEditorial<T>(slug: string, editorial: T): T {
  return projectStoryCopy(editorial, slug, generated.editorialUnits);
}
