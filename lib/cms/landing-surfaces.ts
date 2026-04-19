import { ApiError, apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

const DEFAULT_ORG_ID = "0";

export type CmsPageBlock = {
  blockKey: string;
  blockType: string;
  title: string | null;
  payloadJson: unknown;
  sortOrder: number;
  isEnabled: boolean;
};

export type CmsLandingSurface<TPayload = unknown> = {
  surfaceKey: string;
  locale: Locale;
  title: string | null;
  description: string | null;
  schemaVersion: string;
  payloadJson: TPayload;
  status: string;
  isPublic: boolean;
  isIndexable: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  pageBlocks: CmsPageBlock[];
};

type LandingSurfaceApiBlock = {
  block_key?: string;
  block_type?: string;
  title?: string | null;
  payload_json?: unknown;
  sort_order?: number | string | null;
  is_enabled?: boolean;
};

type LandingSurfaceApiRecord = {
  surface_key?: string;
  locale?: string;
  title?: string | null;
  description?: string | null;
  schema_version?: string;
  payload_json?: unknown;
  status?: string;
  is_public?: boolean;
  is_indexable?: boolean;
  published_at?: string | null;
  scheduled_at?: string | null;
  page_blocks?: LandingSurfaceApiBlock[];
};

type LandingSurfaceApiResponse = {
  ok?: boolean;
  surface?: LandingSurfaceApiRecord | null;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

function normalizeLocale(value: unknown): Locale {
  return String(value ?? "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function normalizeText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeNullableText(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeBlock(record: LandingSurfaceApiBlock): CmsPageBlock | null {
  const blockKey = normalizeText(record.block_key);
  if (!blockKey) {
    return null;
  }

  return {
    blockKey,
    blockType: normalizeText(record.block_type) || "json",
    title: normalizeNullableText(record.title),
    payloadJson: record.payload_json ?? {},
    sortOrder: Number(record.sort_order ?? 0) || 0,
    isEnabled: record.is_enabled !== false,
  };
}

function normalizeLandingSurface<TPayload>(record: LandingSurfaceApiRecord): CmsLandingSurface<TPayload> | null {
  const surfaceKey = normalizeText(record.surface_key);
  if (!surfaceKey) {
    return null;
  }

  return {
    surfaceKey,
    locale: normalizeLocale(record.locale),
    title: normalizeNullableText(record.title),
    description: normalizeNullableText(record.description),
    schemaVersion: normalizeText(record.schema_version) || "v1",
    payloadJson: (record.payload_json ?? {}) as TPayload,
    status: normalizeText(record.status) || "published",
    isPublic: record.is_public !== false,
    isIndexable: record.is_indexable !== false,
    publishedAt: normalizeNullableText(record.published_at),
    scheduledAt: normalizeNullableText(record.scheduled_at),
    pageBlocks: Array.isArray(record.page_blocks)
      ? record.page_blocks.map(normalizeBlock).filter((block): block is CmsPageBlock => block !== null)
      : [],
  };
}

export async function getCmsLandingSurface<TPayload>(
  surfaceKey: string,
  locale: Locale,
): Promise<CmsLandingSurface<TPayload>> {
  const query = buildQuery({
    locale: toApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  const response = await apiClient.get<LandingSurfaceApiResponse>(
    `/v0.5/landing-surfaces/${encodeURIComponent(surfaceKey)}${query}`,
    {
      locale,
      skipAuth: true,
      ...PUBLIC_API_CACHE_OPTIONS,
    },
  );

  if (!response?.ok || !response.surface) {
    throw new ApiError({
      status: 502,
      errorCode: "INVALID_LANDING_SURFACE_PAYLOAD",
      message: `Invalid landing surface payload for ${surfaceKey}.`,
    });
  }

  const surface = normalizeLandingSurface<TPayload>(response.surface);
  if (!surface) {
    throw new ApiError({
      status: 502,
      errorCode: "INVALID_LANDING_SURFACE_RECORD",
      message: `Invalid landing surface record for ${surfaceKey}.`,
    });
  }

  return surface;
}
