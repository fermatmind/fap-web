import { ApiError, apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { shouldFetchCareerAiImpactAssetPreview } from "@/lib/career/aiImpactAssetPreviewConfig";

const CAREER_AI_IMPACT_ASSET_FETCH_TIMEOUT_MS = 12_000;

const INTERNAL_FIELD_NAMES = new Set([
  "audit_fields",
  "derived_from_estimate",
  "derived_from_evidence",
  "derived_from_synthesis",
  "evidence_id",
  "evidence_ids",
  "evidence_used",
  "internal_lineage",
  "lineage",
  "row_hash",
  "score_rationale",
  "search_projection",
  "source_id",
  "source_ids",
]);

const UNSAFE_OUTCOME_PATTERN =
  /(?:career disappearance|job[-\s]?loss risk|wage[-\s]?loss risk|ai[-\s]?proof|岗位会消失|职业会消失|职业消失风险|失业风险|降薪风险)/i;

export type CareerAiImpactPreviewSource = {
  name: string;
  url: string;
};

export type CareerAiImpactPreviewTextItem = {
  title: string;
  body: string;
};

export type CareerAiImpactPreviewScore = {
  score_1_to_10: number;
  confidence: string;
  exposure_type: string;
};

export type CareerAiImpactPreviewAsset = {
  slug: string;
  locale: "zh-CN" | "en";
  occupation: {
    title?: string;
    title_en?: string;
    title_zh?: string;
  };
  ai_exposure_score: CareerAiImpactPreviewScore;
  summary: string;
  items: {
    most_ai_exposed_workflows: CareerAiImpactPreviewTextItem[];
    human_accountability_anchors: CareerAiImpactPreviewTextItem[];
    how_to_prepare: CareerAiImpactPreviewTextItem[];
    reader_boundary: CareerAiImpactPreviewTextItem;
  };
  sources: CareerAiImpactPreviewSource[];
};

type CareerAiImpactAssetPreviewResponseRaw = {
  ok?: unknown;
  preview?: unknown;
  status?: unknown;
  ai_impact_asset_v1?: unknown;
};

const PUBLIC_READABLE_ASSET_STATUS = "production_imported";

type FetchCareerAiImpactAssetPreviewInput = {
  locale: Locale | string;
  slug: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function containsCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

function isSafeUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function hasInternalField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasInternalField);
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).some(([key, nested]) => INTERNAL_FIELD_NAMES.has(key) || hasInternalField(nested));
}

function hasUnsafeOutcomeText(value: unknown): boolean {
  if (typeof value === "string") {
    return UNSAFE_OUTCOME_PATTERN.test(value);
  }

  if (Array.isArray(value)) {
    return value.some(hasUnsafeOutcomeText);
  }

  if (isRecord(value)) {
    return Object.values(value).some(hasUnsafeOutcomeText);
  }

  return false;
}

function hasEnglishReaderCjk(value: unknown): boolean {
  if (typeof value === "string") {
    return containsCjk(value);
  }

  if (Array.isArray(value)) {
    return value.some(hasEnglishReaderCjk);
  }

  if (isRecord(value)) {
    return Object.entries(value).some(([key, nested]) => {
      if (key === "occupation") {
        return false;
      }

      return hasEnglishReaderCjk(nested);
    });
  }

  return false;
}

function isAllowedAiImpactAssetResponse(payload: CareerAiImpactAssetPreviewResponseRaw | null | undefined): boolean {
  if (payload?.ok !== true) {
    return false;
  }

  const status = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";
  return status === PUBLIC_READABLE_ASSET_STATUS && payload.preview !== true;
}

function adaptTextItem(value: unknown): CareerAiImpactPreviewTextItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = isString(value.title) ? value.title.trim() : isString(value.label) ? value.label.trim() : "";
  const body = isString(value.body) ? value.body.trim() : isString(value.description) ? value.description.trim() : "";

  if (!title || !body) {
    return null;
  }

  return { title, body };
}

function adaptTextItems(value: unknown): CareerAiImpactPreviewTextItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(adaptTextItem)
    .filter((item): item is CareerAiImpactPreviewTextItem => item !== null)
    .slice(0, 5);
}

function adaptSources(value: unknown): CareerAiImpactPreviewSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item) || !isString(item.name) || !isString(item.url) || !isSafeUrl(item.url)) {
        return null;
      }

      return {
        name: item.name.trim().replace(/^\//, ""),
        url: item.url.trim(),
      };
    })
    .filter((item): item is CareerAiImpactPreviewSource => item !== null)
    .filter((item) => item.name.length > 0)
    .slice(0, 8);
}

function adaptOccupation(value: unknown): CareerAiImpactPreviewAsset["occupation"] {
  if (!isRecord(value)) {
    return {};
  }

  return {
    title: isString(value.title) ? value.title.trim() : undefined,
    title_en: isString(value.title_en) ? value.title_en.trim() : undefined,
    title_zh: isString(value.title_zh) ? value.title_zh.trim() : undefined,
  };
}

function adaptScore(value: unknown): CareerAiImpactPreviewScore | null {
  if (!isRecord(value)) {
    return null;
  }

  const score = typeof value.score_1_to_10 === "number" ? value.score_1_to_10 : Number(value.score_1_to_10);
  const confidence = isString(value.confidence) ? value.confidence.trim() : "";
  const exposureType = isString(value.exposure_type) ? value.exposure_type.trim() : "";

  if (!Number.isFinite(score) || score < 1 || score > 10 || !confidence || !exposureType) {
    return null;
  }

  return {
    score_1_to_10: Math.round(score),
    confidence,
    exposure_type: exposureType,
  };
}

function adaptAiImpactAsset(value: unknown, expectedSlug: string, expectedLocale: "zh-CN" | "en"): CareerAiImpactPreviewAsset | null {
  if (!isRecord(value) || value.slug !== expectedSlug || value.locale !== expectedLocale || hasInternalField(value)) {
    return null;
  }

  if (hasUnsafeOutcomeText(value) || (expectedLocale === "en" && hasEnglishReaderCjk(value))) {
    return null;
  }

  const score = adaptScore(value.ai_exposure_score);
  const items = isRecord(value.items) ? value.items : null;
  const readerBoundary = items ? adaptTextItem(items.reader_boundary) : null;
  const sources = adaptSources(value.sources);

  const adapted: CareerAiImpactPreviewAsset | null =
    score && items && isString(value.summary) && readerBoundary && sources.length > 0
      ? {
          slug: expectedSlug,
          locale: expectedLocale,
          occupation: adaptOccupation(value.occupation),
          ai_exposure_score: score,
          summary: value.summary.trim(),
          items: {
            most_ai_exposed_workflows: adaptTextItems(items.most_ai_exposed_workflows),
            human_accountability_anchors: adaptTextItems(items.human_accountability_anchors),
            how_to_prepare: adaptTextItems(items.how_to_prepare),
            reader_boundary: readerBoundary,
          },
          sources,
        }
      : null;

  if (
    !adapted ||
    adapted.items.most_ai_exposed_workflows.length === 0 ||
    adapted.items.human_accountability_anchors.length === 0 ||
    adapted.items.how_to_prepare.length === 0
  ) {
    return null;
  }

  return adapted;
}

export async function fetchCareerAiImpactAssetPreview(
  input: FetchCareerAiImpactAssetPreviewInput
): Promise<CareerAiImpactPreviewAsset | null> {
  const normalizedSlug = String(input.slug ?? "").trim().toLowerCase();
  if (!normalizedSlug || !shouldFetchCareerAiImpactAssetPreview(normalizedSlug)) {
    return null;
  }

  const apiLocale = toApiLocale(input.locale);
  const query = new URLSearchParams({ locale: apiLocale });

  try {
    const payload = await apiClient.get<CareerAiImpactAssetPreviewResponseRaw>(
      `/v0.5/career/jobs/${encodeURIComponent(normalizedSlug)}/ai-impact-asset?${query.toString()}`,
      {
        locale: input.locale,
        timeoutMs: CAREER_AI_IMPACT_ASSET_FETCH_TIMEOUT_MS,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    if (!isAllowedAiImpactAssetResponse(payload)) {
      return null;
    }

    return adaptAiImpactAsset(payload.ai_impact_asset_v1, normalizedSlug, apiLocale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}
