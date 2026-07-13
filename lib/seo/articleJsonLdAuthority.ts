export const ARTICLE_AUTHOR_NAME = "Fermat Institute";

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
