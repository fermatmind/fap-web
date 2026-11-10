import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { hasTraditionalBespokeStory } from "@/lib/i18n/traditionalLegacyStoryPaths";
import generated from "./bespoke-stories.generated.json";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

const quizUnits: TextUnits = generated.quizUnits;

export function traditionalBespokeStoryTitle(slug: string): string {
  const unit = quizUnits[`lib/entertainment/data/${slug}.json/title`];
  if (!unit) throw new Error(`Missing Taiwan bespoke story title: ${slug}`);
  return unit.text;
}

export async function loadTraditionalBespokeStory(slug: string) {
  if (!hasTraditionalBespokeStory(slug)) return null;
  const quiz = await loadFunQuiz(slug);
  return quiz ? projectStoryCopy(quiz, `lib/entertainment/data/${slug}.json`, quizUnits) : null;
}

export function traditionalBespokeEditorial<T>(slug: string, editorial: T): T {
  return projectStoryCopy(editorial, slug, generated.editorialUnits);
}
