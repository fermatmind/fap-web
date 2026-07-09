import { ApiError, apiClient } from "@/lib/api-client";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { normalizeInternalHref, normalizeMediaAssetUrl } from "@/lib/url/safeContentUrls";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import {
  buildBigFivePublicContentPath,
  type BigFivePublicEntityType,
  type BigFivePublicRouteEntry,
} from "@/lib/personality/bigFivePublicRoutes";
import {
  buildEnneagramPublicContentPath,
  type EnneagramPublicEntityType,
  type EnneagramPublicRouteEntry,
} from "@/lib/personality/enneagramPublicRoutes";

export type PersonalityPublicFramework = "big_five" | "enneagram";
export type PersonalityPublicEntityType = BigFivePublicEntityType | EnneagramPublicEntityType;
type PersonalityPublicRouteEntry = BigFivePublicRouteEntry | EnneagramPublicRouteEntry;

export type PersonalityPublicContentSection = {
  key: string;
  title: string;
  bodyMd: string;
  bodyHtml: string;
};

export type PersonalityPublicContentFaqItem = {
  question: string;
  answer: string;
};

export type PersonalityPublicContentInternalLink = {
  label: string;
  href: string;
  relationship: string | null;
  targetCode: string | null;
};

export type PersonalityPublicContentMedia = {
  status: string | null;
  imageUrl: string | null;
  alt: string | null;
};

export type PersonalityPublicContentMethodBoundary = {
  summary: string;
  notFor: string[];
};

export type PersonalityPublicContentEvidenceNote = {
  sourceType: string | null;
  note: string;
};

export type PersonalityPublicContentAsset = {
  framework: PersonalityPublicFramework;
  entityType: PersonalityPublicEntityType;
  code: string;
  slug: string;
  locale: "en" | "zh-CN";
  title: string;
  summary: string;
  seo: {
    title: string;
    description: string;
  };
  robots: "index,follow" | "noindex,follow" | "noindex,nofollow";
  canonicalPath: string;
  hreflang: {
    en: string | null;
    "zh-CN": string | null;
  };
  faq: PersonalityPublicContentFaqItem[];
  media: PersonalityPublicContentMedia;
  schemaType: string | null;
  schemaRuntimeEligible: boolean;
  methodBoundary: PersonalityPublicContentMethodBoundary | null;
  evidenceNotes: PersonalityPublicContentEvidenceNote[];
  internalLinks: PersonalityPublicContentInternalLink[];
  sections: PersonalityPublicContentSection[];
  isPublic: boolean;
  indexEligible: boolean;
  sitemapEligible: boolean;
  llmsEligible: boolean;
  launchState: string;
  reviewState: string;
  lastReviewedAt: string | null;
  updatedAt: string | null;
};

type PersonalityPublicContentAssetResponse = {
  ok?: boolean;
  asset?: unknown;
  personality_public_content_asset_v1?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function asNullableString(value: unknown): string | null {
  const normalized = asString(value);
  return normalized ? normalized : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeRobots(value: unknown): PersonalityPublicContentAsset["robots"] {
  const normalized = asString(value).toLowerCase().replace(/\s+/g, "");
  if (normalized === "index,follow" || normalized === "noindex,nofollow") {
    return normalized;
  }

  return "noindex,follow";
}

function normalizeEntityType(value: unknown): PersonalityPublicEntityType | null {
  const normalized = asString(value).toLowerCase();
  if (
    normalized === "hub" ||
    normalized === "domain" ||
    normalized === "polarity" ||
    normalized === "facet_hub" ||
    normalized === "facet_detail" ||
    normalized === "center" ||
    normalized === "core_type"
  ) {
    return normalized;
  }

  return null;
}

function isReadableLaunchState(value: string): boolean {
  return value === "content_ready" || value === "published";
}

function normalizeSections(value: unknown): PersonalityPublicContentSection[] {
  return asArray(value)
    .map((item): PersonalityPublicContentSection | null => {
      const record = asRecord(item);
      const key = asString(record.key);
      const title = asString(record.title);
      const bodyMd = asString(record.body_md ?? record.bodyMd);
      const bodyHtml = asString(record.body_html ?? record.bodyHtml);

      if (!key || (!title && !bodyMd && !bodyHtml)) {
        return null;
      }

      return {
        key,
        title,
        bodyMd,
        bodyHtml,
      };
    })
    .filter((item): item is PersonalityPublicContentSection => item !== null);
}

function normalizeFaq(value: unknown): PersonalityPublicContentFaqItem[] {
  return asArray(value)
    .map((item): PersonalityPublicContentFaqItem | null => {
      const record = asRecord(item);
      const question = asString(record.question);
      const answer = asString(record.answer);

      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is PersonalityPublicContentFaqItem => item !== null);
}

function normalizeInternalLinks(value: unknown): PersonalityPublicContentInternalLink[] {
  return asArray(value)
    .map((item): PersonalityPublicContentInternalLink | null => {
      const record = asRecord(item);
      const label = asString(record.label);
      const href = normalizeInternalHref(record.href);
      if (!label || !href) {
        return null;
      }

      return {
        label,
        href,
        relationship: asNullableString(record.relationship),
        targetCode: asNullableString(record.target_code ?? record.targetCode),
      };
    })
    .filter((item): item is PersonalityPublicContentInternalLink => item !== null);
}

function normalizeMedia(value: unknown): PersonalityPublicContentMedia {
  const record = asRecord(value);
  const imageUrl = normalizeMediaAssetUrl(
    record.url ?? record.image_url ?? record.imageUrl ?? record.hero_image_url ?? record.heroImageUrl
  );

  return {
    status: asNullableString(record.status),
    imageUrl,
    alt: asNullableString(record.alt),
  };
}

function normalizeMethodBoundary(value: unknown): PersonalityPublicContentMethodBoundary | null {
  const record = asRecord(value);
  const summary = asString(record.summary);
  const notFor = asArray(record.not_for ?? record.notFor).map(asString).filter(Boolean);

  if (!summary && notFor.length === 0) {
    return null;
  }

  return { summary, notFor };
}

function normalizeEvidenceNotes(value: unknown): PersonalityPublicContentEvidenceNote[] {
  return asArray(value)
    .map((item): PersonalityPublicContentEvidenceNote | null => {
      const record = asRecord(item);
      const note = asString(record.note);
      if (!note) {
        return null;
      }

      return {
        sourceType: asNullableString(record.source_type ?? record.sourceType),
        note,
      };
    })
    .filter((item): item is PersonalityPublicContentEvidenceNote => item !== null);
}

function buildExpectedPath(locale: Locale, framework: PersonalityPublicFramework, expected: PersonalityPublicRouteEntry): string {
  return framework === "big_five"
    ? buildBigFivePublicContentPath(locale, expected as BigFivePublicRouteEntry)
    : buildEnneagramPublicContentPath(locale, expected as EnneagramPublicRouteEntry);
}

function normalizeAsset(
  raw: unknown,
  expected: PersonalityPublicRouteEntry,
  locale: Locale,
  expectedFramework: PersonalityPublicFramework
): PersonalityPublicContentAsset | null {
  const record = asRecord(raw);
  const entityType = normalizeEntityType(record.entity_type);
  const apiLocale = toApiLocale(locale);
  const seo = asRecord(record.seo);
  const canonical = asRecord(record.canonical);
  const hreflang = asRecord(record.hreflang);
  const schema = asRecord(record.schema);
  const code = asString(record.code ?? record.entity_key);
  const framework = asString(record.framework);
  const launchState = asString(record.launch_state);
  const isPublic = asBoolean(record.is_public);

  if (
    framework !== expectedFramework ||
    entityType !== expected.entityType ||
    code !== expected.code ||
    asString(record.locale) !== apiLocale ||
    !isReadableLaunchState(launchState) ||
    !isPublic
  ) {
    return null;
  }

  return {
    framework: expectedFramework,
    entityType,
    code,
    slug: asString(record.slug),
    locale: apiLocale,
    title: asString(record.title),
    summary: asString(record.summary),
    seo: {
      title: asString(seo.title) || asString(record.title),
      description: asString(seo.description) || asString(record.summary),
    },
    robots: normalizeRobots(record.robots),
    canonicalPath: asString(record.canonical_path) || asString(canonical.path) || buildExpectedPath(locale, expectedFramework, expected),
    hreflang: {
      en: asNullableString(hreflang.en),
      "zh-CN": asNullableString(hreflang["zh-CN"] ?? hreflang.zh),
    },
    faq: normalizeFaq(record.faq),
    media: normalizeMedia(record.media),
    schemaType: asNullableString(schema["@type"] ?? schema.type),
    schemaRuntimeEligible: asBoolean(record.schema_runtime_eligible ?? record.schemaRuntimeEligible),
    methodBoundary: normalizeMethodBoundary(record.method_boundary),
    evidenceNotes: normalizeEvidenceNotes(record.evidence_notes),
    internalLinks: normalizeInternalLinks(record.internal_links),
    sections: normalizeSections(record.sections ?? record.content_sections),
    isPublic,
    indexEligible: asBoolean(record.index_eligible),
    sitemapEligible: asBoolean(record.sitemap_eligible),
    llmsEligible: asBoolean(record.llms_eligible),
    launchState,
    reviewState: asString(record.review_state),
    lastReviewedAt: asNullableString(record.last_reviewed_at),
    updatedAt: asNullableString(record.updated_at),
  };
}

export async function getBigFivePublicContentAsset(
  locale: Locale,
  entry: BigFivePublicRouteEntry
): Promise<PersonalityPublicContentAsset | null> {
  try {
    const response = await apiClient.get<PersonalityPublicContentAssetResponse>(
      `/v0.5/personality-content-assets/big_five/${entry.entityType}/${entry.code}?locale=${encodeURIComponent(
        toApiLocale(locale)
      )}&org_id=0`,
      {
        ...PUBLIC_API_CACHE_OPTIONS,
        skipAuth: true,
        locale,
        // Bypass fetch cache so CMS content patches are reflected on the next SSR render.
        // The page itself is force-dynamic; this ensures the API response is always fresh.
        cache: "no-store",
      }
    );

    if (response?.ok !== true) {
      return null;
    }

    return normalizeAsset(response.personality_public_content_asset_v1 ?? response.asset, entry, locale, "big_five");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
      return null;
    }

    return null;
  }
}

export async function getEnneagramPublicContentAsset(
  locale: Locale,
  entry: EnneagramPublicRouteEntry
): Promise<PersonalityPublicContentAsset | null> {
  try {
    const response = await apiClient.get<PersonalityPublicContentAssetResponse>(
      `/v0.5/personality-content-assets/enneagram/${entry.entityType}/${entry.code}?locale=${encodeURIComponent(
        toApiLocale(locale)
      )}&org_id=0`,
      {
        ...PUBLIC_API_CACHE_OPTIONS,
        skipAuth: true,
        locale,
      }
    );

    if (response?.ok !== true) {
      return null;
    }

    return normalizeAsset(response.personality_public_content_asset_v1 ?? response.asset, entry, locale, "enneagram");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
      return null;
    }

    return null;
  }
}
