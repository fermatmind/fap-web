export const ARTICLE_AUTHOR_NAME = "FermatMind";

function hasRootSchemaType(record: Record<string, unknown>, expectedType: string): boolean {
  const type = record["@type"];
  return type === expectedType || (Array.isArray(type) && type.includes(expectedType));
}

function normalizeProjectedStructuredDataFragment(data: unknown, expectedType: string): unknown | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, unknown>;
  if (!hasRootSchemaType(record, expectedType)) {
    return null;
  }

  // A stale backend fragment must not reintroduce the unverified legacy default.
  if (expectedType === "Article" && [record.author, record.publisher].some((value) => value && typeof value === "object"
    && !Array.isArray(value) && String((value as Record<string, unknown>).name ?? "").trim().toLowerCase() === "fermat institute")) return null;
  const structuredData = { ...record };
  delete structuredData.enabled;

  return structuredData;
}

export function normalizeArticleJsonLdAuthorityPayload(data: unknown): unknown | null {
  return normalizeProjectedStructuredDataFragment(data, "Article");
}

export function normalizeArticleBreadcrumbJsonLdAuthorityPayload(data: unknown): unknown | null {
  return normalizeProjectedStructuredDataFragment(data, "BreadcrumbList");
}
