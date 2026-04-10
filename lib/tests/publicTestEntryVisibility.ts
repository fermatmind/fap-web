const HIDDEN_PUBLIC_TEST_ENTRY_SLUGS = new Set([
  "clinical-depression-anxiety-assessment-professional-edition",
  "depression-screening-test-standard-edition",
]);

function normalizeSlug(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized || null;
}

export function extractTestSlugFromEntryHref(href: string | null | undefined): string | null {
  const normalizedHref = String(href ?? "").trim();
  if (!normalizedHref) {
    return null;
  }

  const matched = normalizedHref.match(/^\/tests\/([^/?#]+)/);
  return normalizeSlug(matched?.[1]);
}

export function isPublicTestEntryVisible(input: {
  slug?: string | null;
  href?: string | null;
}): boolean {
  const slug = normalizeSlug(input.slug) ?? extractTestSlugFromEntryHref(input.href);
  if (!slug) {
    return true;
  }

  return !HIDDEN_PUBLIC_TEST_ENTRY_SLUGS.has(slug);
}

export function filterVisiblePublicTestEntries<T extends { href?: string | null; slug?: string | null; key?: string | null }>(
  items: T[]
): T[] {
  return items.filter((item) =>
    isPublicTestEntryVisible({
      slug: item.slug ?? item.key,
      href: item.href,
    })
  );
}
