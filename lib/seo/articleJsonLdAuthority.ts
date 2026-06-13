export const ARTICLE_AUTHOR_NAME = "Fermat Institute";

const ARTICLE_PUBLISHER = {
  "@type": "Organization",
  name: "FermatMind",
  url: "https://fermatmind.com",
} as const;

function hasStructuredName(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.name === "string" && record.name.trim().length > 0;
}

export function normalizeArticleJsonLdAuthorityPayload(data: unknown): unknown | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, unknown>;

  return {
    ...record,
    author: {
      "@type": "Organization",
      name: ARTICLE_AUTHOR_NAME,
    },
    publisher: hasStructuredName(record.publisher) ? record.publisher : ARTICLE_PUBLISHER,
  };
}
