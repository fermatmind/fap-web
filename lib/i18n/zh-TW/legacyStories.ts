import { additionalStoryEditorials } from "@/components/entertainment/AdditionalStoryEditorials";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { hasTraditionalLegacyStory } from "@/lib/i18n/traditionalLegacyStoryPaths";
import generated from "./legacy-stories.generated.json";

type TextUnits = Readonly<Record<string, { text: string }>>;

function readerCopy<T>(value: T, path: string, units: TextUnits): T {
  if (value && typeof value === "object" && "zh" in value && "en" in value && typeof value.zh === "string" && typeof value.en === "string") {
    const unit = units[path];
    if (!unit) throw new Error(`Missing Taiwan story text: ${path}`);
    return { ...value, zh: unit.text };
  }
  if (Array.isArray(value)) return value.map((item, index) => readerCopy(item, `${path}/${index}`, units)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, readerCopy(child, `${path}/${key}`, units)])) as T;
  }
  return value;
}

export async function loadTraditionalLegacyStory(slug: string) {
  if (!hasTraditionalLegacyStory(slug)) return null;
  const quiz = await loadFunQuiz(slug);
  const editorial = additionalStoryEditorials[slug];
  if (!quiz || !editorial) return null;
  return {
    quiz: readerCopy(quiz, `lib/entertainment/data/${slug}.json`, generated.quizUnits),
    editorial: readerCopy(editorial, `/${slug}`, generated.editorialUnits),
  };
}


export function traditionalLegacyStoryTitle(slug: string): string {
  const unit = (generated.quizUnits as TextUnits)[`lib/entertainment/data/${slug}.json/title`];
  if (!unit) throw new Error(`Missing Taiwan story title: ${slug}`);
  return unit.text;
}
