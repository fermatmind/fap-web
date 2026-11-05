import type { Locale } from "@/lib/i18n/locales";
import type { Text } from "@/lib/questionnaires/types";

export function ObservationChoiceCounts<Category extends string>({
  categories,
  counts,
  locale,
  shortLabels,
}: {
  categories: readonly { id: Category; label: Text }[];
  counts: Record<Category, number>;
  locale: Locale;
  shortLabels?: Partial<Record<Category, Text>>;
}) {
  return <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm leading-6" aria-label={locale === "zh" ? "各类别的题目数" : "Number of prompts in each selected category"}>
    {categories.filter(({ id }) => counts[id] > 0).map(({ id, label }) => (
      <li key={id} className="min-w-0"><span>{(shortLabels?.[id] ?? label)[locale]}</span>{" "}<span className="font-semibold tabular-nums">{counts[id]}</span></li>
    ))}
  </ul>;
}
