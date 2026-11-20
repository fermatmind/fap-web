import Link from "next/link";
import {
  fixedComparisonPairs,
  fixedComparisonPath,
  isFixedComparisonLocale,
  isFixedComparisonPreviewEnabled,
} from "@/lib/career/fixedComparisonPreview";

export function FixedComparisonPreviewEntry({ locale, slug }: { locale: string; slug: string }) {
  if (!isFixedComparisonPreviewEnabled() || !isFixedComparisonLocale(locale)) return null;
  const pairs = fixedComparisonPairs.filter(({ slugs, labels }) => labels[locale] && slugs.some((candidate) => candidate === slug));
  if (!pairs.length) return null;
  return (
    <nav data-fixed-comparison-entry aria-label={locale === "zh" ? "固定职业对比" : locale === "zh-TW" ? "職業對比" : "Career comparisons"}
      className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <ul className="flex flex-wrap gap-3">
        {pairs.map((pair) => (
          <li key={pair.slugs.join("-vs-")}>
            <Link href={fixedComparisonPath(locale, pair)}
              className="block rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-4 py-3 font-semibold text-[var(--fm-text)] hover:underline focus-visible:outline-2">
              {pair.labels[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
