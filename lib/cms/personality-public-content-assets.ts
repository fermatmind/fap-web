import { ApiError, apiClient } from "@/lib/api-client";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PublicReadError, toPublicReadError } from "@/lib/public-content/readError";
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

export type PersonalityPublicContentMethodBoundary = {
  summary: string;
  notFor: string[];
};

export type PersonalityPublicContentEvidenceNote = {
  sourceType: string | null;
  note: string;
};

export type PersonalityPublicContentAuthorityActor = {
  name: string;
  organization: string | null;
  role: string | null;
};

export type PersonalityPublicContentAuthoritySource = {
  id: string;
  title: string;
  authorOrOrganization: string;
  year: number;
  sourceType: string;
  doi: string | null;
  publicUrl: string | null;
  accessedAt: string | null;
  claimIds: string[];
  limitation: string | null;
};

export type PersonalityPublicContentAuthorityClaimMapping = {
  claimId: string;
  sourceIds: string[];
  limitation: string | null;
};

export type PersonalityPublicContentAuthorityV2 = {
  contractVersion: "personality_public_asset.v2";
  compatibleV1ContractVersion: "personality_public_asset.v1";
  visibleEvidence: {
    sources: PersonalityPublicContentAuthoritySource[];
    claimMapping: PersonalityPublicContentAuthorityClaimMapping[];
    limitations: string[];
    eligible: boolean;
  };
  editorialAuthority: {
    author: PersonalityPublicContentAuthorityActor | null;
    reviewer: PersonalityPublicContentAuthorityActor | null;
    reviewState: string;
    lastReviewedAt: string | null;
    publishedAt: string | null;
    updatedAt: string | null;
  };
  schemaEligible: boolean;
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
  schemaType: string | null;
  schemaRuntimeEligible: boolean;
  methodBoundary: PersonalityPublicContentMethodBoundary | null;
  evidenceNotes: PersonalityPublicContentEvidenceNote[];
  authorityV2?: PersonalityPublicContentAuthorityV2 | null;
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
  personality_public_content_asset_v2?: unknown;
};

type PersonalityPublicContentAssetIndexResponse = {
  ok?: boolean;
  items?: unknown[];
  pagination?: {
    current_page?: unknown;
    per_page?: unknown;
    total?: unknown;
    last_page?: unknown;
  };
};

export type EnneagramLlmsCandidate = {
  entityType: EnneagramPublicEntityType;
  code: string;
  locale: "en" | "zh-CN";
  canonicalPath: string;
  robots: PersonalityPublicContentAsset["robots"];
  isPublic: boolean;
  indexEligible: boolean;
  sitemapEligible: boolean;
  llmsEligible: boolean;
  launchState: string;
};

export type EnneagramLlmsFullCandidate = EnneagramLlmsCandidate & {
  title: string;
  summary: string;
  faq: PersonalityPublicContentFaqItem[];
  methodBoundary: PersonalityPublicContentMethodBoundary | null;
  evidenceNotes: PersonalityPublicContentEvidenceNote[];
  sections: PersonalityPublicContentSection[];
  updatedAt: string | null;
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
    normalized === "core_type" ||
    normalized === "wing" ||
    normalized === "instinctual_subtype"
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
      const title = asString(record.title ?? record.heading);
      const bodyMd = asString(record.body_md ?? record.bodyMd ?? record.body);
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
      const question = asString(record.question ?? record.q);
      const answer = asString(record.answer ?? record.a);

      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is PersonalityPublicContentFaqItem => item !== null);
}

function normalizeInternalLinks(value: unknown): PersonalityPublicContentInternalLink[] {
  return asArray(value)
    .map((item): PersonalityPublicContentInternalLink | null => {
      const record = asRecord(item);
      const label = asString(record.label);
      const href = normalizeInternalHref(record.href ?? record.url);
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

const AUTHORITY_SOURCE_TYPES = new Set([
  "peer_reviewed_research",
  "official_documentation",
  "professional_standard",
  "book",
  "dataset",
  "other_public_source",
]);
const AUTHORITY_ID_PATTERN = /^[a-z0-9][a-z0-9_.-]{0,127}$/i;
const DOI_PATTERN = /^10\.\d{4,9}\/[\-._;()/:a-z0-9]+$/i;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2}))?$/;
const PUBLIC_HOST_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

function normalizeStringList(value: unknown, pattern?: RegExp): string[] {
  return Array.from(
    new Set(
      asArray(value)
        .map(asString)
        .filter((item) => Boolean(item) && (!pattern || pattern.test(item)))
    )
  );
}

function normalizeIsoDateTime(value: unknown): string | null {
  const normalized = asString(value);
  if (!normalized || !ISO_DATE_PATTERN.test(normalized)) {
    return null;
  }

  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function normalizePublicHttpsUrl(value: unknown): string | null {
  const normalized = asString(value);
  if (!normalized || /[<>\\\u0000-\u001f\u007f-\u009f]/.test(normalized)) {
    return null;
  }

  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !PUBLIC_HOST_PATTERN.test(host) ||
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host.endsWith(".test")
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeAuthorityActor(value: unknown): PersonalityPublicContentAuthorityActor | null {
  const record = asRecord(value);
  const name = asString(record.name);
  if (!name) {
    return null;
  }

  return {
    name,
    organization: asNullableString(record.organization),
    role: asNullableString(record.role),
  };
}

function normalizeAuthoritySources(value: unknown): PersonalityPublicContentAuthoritySource[] {
  const sources: PersonalityPublicContentAuthoritySource[] = [];
  const seen = new Set<string>();
  const maxYear = new Date().getUTCFullYear();

  for (const item of asArray(value)) {
    const record = asRecord(item);
    const id = asString(record.id);
    const title = asString(record.title);
    const authorOrOrganization = asString(record.author_or_organization ?? record.authorOrOrganization);
    const sourceType = asString(record.source_type ?? record.sourceType);
    const year = Number(record.year);
    if (
      !AUTHORITY_ID_PATTERN.test(id) ||
      seen.has(id) ||
      !title ||
      !authorOrOrganization ||
      !AUTHORITY_SOURCE_TYPES.has(sourceType) ||
      !Number.isInteger(year) ||
      year < 1800 ||
      year > maxYear
    ) {
      continue;
    }

    const doiCandidate = asNullableString(record.doi);
    seen.add(id);
    sources.push({
      id,
      title,
      authorOrOrganization,
      year,
      sourceType,
      doi: doiCandidate && DOI_PATTERN.test(doiCandidate) ? doiCandidate : null,
      publicUrl: normalizePublicHttpsUrl(record.public_url ?? record.publicUrl),
      accessedAt: normalizeIsoDateTime(record.accessed_at ?? record.accessedAt),
      claimIds: normalizeStringList(record.claim_ids ?? record.claimIds, AUTHORITY_ID_PATTERN),
      limitation: asNullableString(record.limitation),
    });
  }

  return sources;
}

function normalizeAuthorityClaimMapping(
  value: unknown,
  sourceIds: Set<string>
): PersonalityPublicContentAuthorityClaimMapping[] {
  return asArray(value)
    .map((item): PersonalityPublicContentAuthorityClaimMapping | null => {
      const record = asRecord(item);
      const claimId = asString(record.claim_id ?? record.claimId);
      const resolvedSourceIds = normalizeStringList(
        record.source_ids ?? record.sourceIds,
        AUTHORITY_ID_PATTERN
      ).filter((sourceId) => sourceIds.has(sourceId));
      if (!AUTHORITY_ID_PATTERN.test(claimId) || resolvedSourceIds.length === 0) {
        return null;
      }

      return {
        claimId,
        sourceIds: resolvedSourceIds,
        limitation: asNullableString(record.limitation),
      };
    })
    .filter((item): item is PersonalityPublicContentAuthorityClaimMapping => item !== null);
}

function normalizeAuthorityV2(
  raw: unknown,
  asset: PersonalityPublicContentAsset
): PersonalityPublicContentAuthorityV2 | null {
  const record = asRecord(raw);
  const declaredFramework = asString(record.framework);
  const declaredEntityType = normalizeEntityType(record.entity_type ?? record.entityType);
  const declaredCode = asString(record.code ?? record.entity_key);
  const declaredLocale = asString(record.locale);
  const hasDeclaredFramework = Object.hasOwn(record, "framework");
  const hasDeclaredEntityType = Object.hasOwn(record, "entity_type") || Object.hasOwn(record, "entityType");
  const hasDeclaredCode = Object.hasOwn(record, "code") || Object.hasOwn(record, "entity_key");
  const hasDeclaredLocale = Object.hasOwn(record, "locale");
  if (
    asString(record.contract_version ?? record.contractVersion) !== "personality_public_asset.v2" ||
    asString(record.compatible_v1_contract_version ?? record.compatibleV1ContractVersion) !==
      "personality_public_asset.v1" ||
    (hasDeclaredFramework && declaredFramework !== asset.framework) ||
    (hasDeclaredEntityType && declaredEntityType !== asset.entityType) ||
    (hasDeclaredCode && declaredCode !== asset.code) ||
    (hasDeclaredLocale && declaredLocale !== asset.locale)
  ) {
    return null;
  }

  const visibleEvidence = asRecord(record.visible_evidence ?? record.visibleEvidence);
  const sources = normalizeAuthoritySources(visibleEvidence.sources);
  const claimMapping = normalizeAuthorityClaimMapping(
    visibleEvidence.claim_mapping ?? visibleEvidence.claimMapping,
    new Set(sources.map((source) => source.id))
  );
  const visibleEvidenceEligible =
    asBoolean(visibleEvidence.eligible) && sources.length > 0 && claimMapping.length > 0;
  const editorialAuthority = asRecord(record.editorial_authority ?? record.editorialAuthority);
  return {
    contractVersion: "personality_public_asset.v2",
    compatibleV1ContractVersion: "personality_public_asset.v1",
    visibleEvidence: {
      sources,
      claimMapping,
      limitations: normalizeStringList(visibleEvidence.limitations),
      eligible: visibleEvidenceEligible,
    },
    editorialAuthority: {
      author: normalizeAuthorityActor(editorialAuthority.author),
      reviewer: normalizeAuthorityActor(editorialAuthority.reviewer),
      reviewState: asString(editorialAuthority.review_state ?? editorialAuthority.reviewState),
      lastReviewedAt: normalizeIsoDateTime(
        editorialAuthority.last_reviewed_at ?? editorialAuthority.lastReviewedAt
      ),
      publishedAt: normalizeIsoDateTime(editorialAuthority.published_at ?? editorialAuthority.publishedAt),
      updatedAt: normalizeIsoDateTime(editorialAuthority.updated_at ?? editorialAuthority.updatedAt),
    },
    schemaEligible:
      asBoolean(record.schema_eligible ?? record.schemaEligible) &&
      visibleEvidenceEligible &&
      asset.schemaRuntimeEligible,
  };
}

function normalizeAuthorityV2Sibling(
  response: PersonalityPublicContentAssetResponse,
  asset: PersonalityPublicContentAsset
): PersonalityPublicContentAuthorityV2 | null | undefined {
  return Object.hasOwn(response, "personality_public_content_asset_v2")
    ? normalizeAuthorityV2(response.personality_public_content_asset_v2, asset)
    : undefined;
}

export function withBigFiveVisibleAuthorityJsonLd(
  schema: unknown,
  asset: PersonalityPublicContentAsset
): unknown {
  return withVisibleAuthorityJsonLd(schema, asset, "big_five");
}

export function isEnneagramAuthoritySchemaEligible(asset: PersonalityPublicContentAsset): boolean {
  if (asset.framework !== "enneagram" || !asset.schemaRuntimeEligible) {
    return false;
  }

  return Boolean(asset.authorityV2?.schemaEligible && asset.authorityV2.visibleEvidence.eligible);
}

export function withEnneagramVisibleAuthorityJsonLd(
  schema: unknown,
  asset: PersonalityPublicContentAsset
): unknown {
  if (!isEnneagramAuthoritySchemaEligible(asset)) {
    return schema;
  }

  return withVisibleAuthorityJsonLd(schema, asset, "enneagram");
}

function withVisibleAuthorityJsonLd(
  schema: unknown,
  asset: PersonalityPublicContentAsset,
  expectedFramework: PersonalityPublicFramework
): unknown {
  const authority = asset.authorityV2;
  if (
    !isRecord(schema) ||
    asset.framework !== expectedFramework ||
    !asset.schemaRuntimeEligible ||
    !authority?.schemaEligible ||
    !authority.visibleEvidence.eligible
  ) {
    return schema;
  }

  const mappedSourceIds = new Set(
    authority.visibleEvidence.claimMapping.flatMap((mapping) => mapping.sourceIds)
  );
  const citations = authority.visibleEvidence.sources
    .filter((source) => mappedSourceIds.has(source.id))
    .map((source) => source.publicUrl ?? source.title);
  return {
    ...schema,
    ...(citations.length > 0 ? { citation: citations } : {}),
    ...(authority.editorialAuthority.publishedAt
      ? { datePublished: authority.editorialAuthority.publishedAt }
      : {}),
    ...(authority.editorialAuthority.updatedAt
      ? { dateModified: authority.editorialAuthority.updatedAt }
      : {}),
  };
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
  const backendCanonicalPath = asString(record.canonical_path) || asString(canonical.path);

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
    canonicalPath:
      backendCanonicalPath ||
      (expectedFramework === "big_five" ? buildExpectedPath(locale, expectedFramework, expected) : ""),
    hreflang: {
      en: asNullableString(hreflang.en),
      "zh-CN": asNullableString(hreflang["zh-CN"] ?? hreflang.zh),
    },
    faq: normalizeFaq(record.faq),
    schemaType: asNullableString(schema["@type"] ?? schema.type),
    schemaRuntimeEligible: asBoolean(record.schema_runtime_eligible ?? record.schemaRuntimeEligible),
    methodBoundary: normalizeMethodBoundary(record.method_boundary),
    evidenceNotes: normalizeEvidenceNotes(record.evidence_notes),
    authorityV2: null,
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

function publicContentContractError(cause?: unknown): PublicReadError {
  return new PublicReadError({
    kind: "contract",
    cause,
  });
}

function normalizeSingleAsset(
  raw: unknown,
  expected: PersonalityPublicRouteEntry,
  locale: Locale,
  expectedFramework: PersonalityPublicFramework
): PersonalityPublicContentAsset | null {
  const record = asRecord(raw);
  const launchState = asString(record.launch_state);

  if (record.is_public === false || (launchState !== "" && !isReadableLaunchState(launchState))) {
    return null;
  }

  const asset = normalizeAsset(raw, expected, locale, expectedFramework);
  if (!asset) {
    throw publicContentContractError();
  }

  return asset;
}

function handlePublicAssetReadError(error: unknown): null {
  const publicReadError = toPublicReadError(error);
  if (publicReadError.authoritativeAbsence) {
    return null;
  }

  throw publicReadError;
}

export async function getBigFivePublicContentAsset(
  locale: Locale,
  entry: BigFivePublicRouteEntry
): Promise<PersonalityPublicContentAsset | null> {
  try {
    const response = await apiClient.getPublic<PersonalityPublicContentAssetResponse>(
      `/v0.5/personality-content-assets/big_five/${entry.entityType}/${entry.code}?locale=${encodeURIComponent(
        toApiLocale(locale)
      )}&org_id=0`,
      {
        skipAuth: true,
        locale,
        // Use one explicit policy: this force-dynamic page must observe CMS patches on the next SSR render.
        cache: "no-store",
      }
    );

    if (response?.ok !== true) {
      throw publicContentContractError();
    }

    const asset = normalizeSingleAsset(
      response.personality_public_content_asset_v1 ?? response.asset,
      entry,
      locale,
      "big_five"
    );
    if (!asset) {
      return null;
    }

    return {
      ...asset,
      authorityV2: normalizeAuthorityV2Sibling(response, asset),
    };
  } catch (error) {
    return handlePublicAssetReadError(error);
  }
}

export async function getEnneagramPublicContentAsset(
  locale: Locale,
  entry: EnneagramPublicRouteEntry
): Promise<PersonalityPublicContentAsset | null> {
  if (entry.entityType === "instinctual_subtype") {
    try {
      const response = await apiClient.getPublic<PersonalityPublicContentAssetIndexResponse>(
        `/v0.5/personality-content-assets?locale=${encodeURIComponent(toApiLocale(locale))}&framework=enneagram&entity_type=${
          entry.entityType
        }&per_page=100&org_id=0`,
        {
          ...PUBLIC_API_CACHE_OPTIONS,
          skipAuth: true,
          locale,
        }
      );

      if (response?.ok !== true || !Array.isArray(response.items)) {
        throw publicContentContractError();
      }

      let normalized: PersonalityPublicContentAsset | null = null;
      let rawMatch: unknown = null;
      for (const item of response.items) {
        const candidate = normalizeAsset(item, entry, locale, "enneagram");
        if (candidate) {
          normalized = candidate;
          rawMatch = item;
          break;
        }
      }

      if (!normalized) {
        return null;
      }

      const rawContractVersion = asString(
        asRecord(rawMatch).contract_version ?? asRecord(rawMatch).contractVersion
      );
      const shouldRequestAuthorityDetail =
        rawContractVersion === "personality_public_asset.v1" ||
        (!rawContractVersion && (normalized.indexEligible || normalized.schemaRuntimeEligible));
      if (!shouldRequestAuthorityDetail) {
        return normalized;
      }

      try {
        const detailResponse = await apiClient.getPublic<PersonalityPublicContentAssetResponse>(
          `/v0.5/personality-content-assets?locale=${encodeURIComponent(
            toApiLocale(locale)
          )}&framework=enneagram&entity_type=${entry.entityType}&code=${encodeURIComponent(entry.code)}&org_id=0`,
          {
            ...PUBLIC_API_CACHE_OPTIONS,
            skipAuth: true,
            locale,
          }
        );
        if (detailResponse?.ok !== true) {
          throw publicContentContractError();
        }

        const detailAsset = normalizeSingleAsset(
          detailResponse.personality_public_content_asset_v1 ?? detailResponse.asset,
          entry,
          locale,
          "enneagram"
        );
        if (!detailAsset) {
          return normalized;
        }

        return {
          ...detailAsset,
          authorityV2: normalizeAuthorityV2Sibling(detailResponse, detailAsset),
        };
      } catch (error) {
        const detailReadError = toPublicReadError(error);
        if (detailReadError.authoritativeAbsence) {
          return normalized;
        }

        throw detailReadError;
      }
    } catch (error) {
      return handlePublicAssetReadError(error);
    }
  }

  try {
    const response = await apiClient.getPublic<PersonalityPublicContentAssetResponse>(
      `/v0.5/personality-content-assets/enneagram/${entry.entityType}/${encodeURIComponent(
        entry.code
      )}?locale=${encodeURIComponent(toApiLocale(locale))}&org_id=0`,
      {
        ...PUBLIC_API_CACHE_OPTIONS,
        skipAuth: true,
        locale,
      }
    );

    if (response?.ok !== true) {
      throw publicContentContractError();
    }

    const asset = normalizeSingleAsset(
      response.personality_public_content_asset_v1 ?? response.asset,
      entry,
      locale,
      "enneagram"
    );
    if (!asset) {
      return null;
    }

    return {
      ...asset,
      authorityV2: normalizeAuthorityV2Sibling(response, asset),
    };
  } catch (error) {
    return handlePublicAssetReadError(error);
  }
}

export async function listEnneagramLlmsCandidates(
  locale: Locale,
  options: { signal?: AbortSignal } = {}
): Promise<EnneagramLlmsCandidate[]> {
  const apiLocale = toApiLocale(locale);
  const response = await apiClient.get<PersonalityPublicContentAssetIndexResponse>(
    `/v0.5/personality-content-assets?locale=${encodeURIComponent(apiLocale)}&framework=enneagram&per_page=100&org_id=0`,
    {
      ...PUBLIC_API_CACHE_OPTIONS,
      skipAuth: true,
      locale,
      signal: options.signal,
    }
  );

  if (response?.ok !== true || !Array.isArray(response.items)) {
    throw new ApiError({
      status: 502,
      errorCode: "ENNEAGRAM_LLMS_AUTHORITY_INVALID",
      message: "Enneagram llms authority response is invalid.",
    });
  }

  const total = Number(response.pagination?.total);
  if (!Number.isInteger(total) || total !== response.items.length) {
    throw new ApiError({
      status: 502,
      errorCode: "ENNEAGRAM_LLMS_AUTHORITY_COUNT_MISMATCH",
      message: "Enneagram llms authority count does not match the returned cohort.",
    });
  }

  return response.items.map((item) => {
    const record = asRecord(item);
    const entityType = normalizeEntityType(record.entity_type);
    const canonical = asRecord(record.canonical);
    const candidateLocale = asString(record.locale);

    if (
      asString(record.framework) !== "enneagram" ||
      !entityType ||
      !["hub", "center", "core_type", "wing", "instinctual_subtype"].includes(entityType) ||
      candidateLocale !== apiLocale
    ) {
      throw new ApiError({
        status: 502,
        errorCode: "ENNEAGRAM_LLMS_AUTHORITY_IDENTITY_INVALID",
        message: "Enneagram llms authority identity is invalid.",
      });
    }

    return {
      entityType: entityType as EnneagramPublicEntityType,
      code: asString(record.code ?? record.entity_key),
      locale: apiLocale,
      canonicalPath: asString(record.canonical_path) || asString(canonical.path),
      robots: normalizeRobots(record.robots),
      isPublic: asBoolean(record.is_public),
      indexEligible: asBoolean(record.index_eligible),
      sitemapEligible: asBoolean(record.sitemap_eligible),
      llmsEligible: asBoolean(record.llms_eligible),
      launchState: asString(record.launch_state),
    };
  });
}

export async function listEnneagramLlmsFullCandidates(
  locale: Locale,
  options: { signal?: AbortSignal } = {}
): Promise<EnneagramLlmsFullCandidate[]> {
  const apiLocale = toApiLocale(locale);
  const response = await apiClient.get<PersonalityPublicContentAssetIndexResponse>(
    `/v0.5/personality-content-assets?locale=${encodeURIComponent(apiLocale)}&framework=enneagram&per_page=100&org_id=0`,
    {
      ...PUBLIC_API_CACHE_OPTIONS,
      skipAuth: true,
      locale,
      signal: options.signal,
    }
  );

  if (response?.ok !== true || !Array.isArray(response.items)) {
    throw new ApiError({
      status: 502,
      errorCode: "ENNEAGRAM_LLMS_FULL_AUTHORITY_INVALID",
      message: "Enneagram llms-full authority response is invalid.",
    });
  }

  const total = Number(response.pagination?.total);
  if (!Number.isInteger(total) || total !== response.items.length) {
    throw new ApiError({
      status: 502,
      errorCode: "ENNEAGRAM_LLMS_FULL_AUTHORITY_COUNT_MISMATCH",
      message: "Enneagram llms-full authority count does not match the returned cohort.",
    });
  }

  return response.items.map((item) => {
    const record = asRecord(item);
    const entityType = normalizeEntityType(record.entity_type);
    const canonical = asRecord(record.canonical);
    const candidateLocale = asString(record.locale);

    if (
      asString(record.framework) !== "enneagram" ||
      !entityType ||
      !["hub", "center", "core_type", "wing", "instinctual_subtype"].includes(entityType) ||
      candidateLocale !== apiLocale
    ) {
      throw new ApiError({
        status: 502,
        errorCode: "ENNEAGRAM_LLMS_FULL_AUTHORITY_IDENTITY_INVALID",
        message: "Enneagram llms-full authority identity is invalid.",
      });
    }

    return {
      entityType: entityType as EnneagramPublicEntityType,
      code: asString(record.code ?? record.entity_key),
      locale: apiLocale,
      canonicalPath: asString(record.canonical_path) || asString(canonical.path),
      robots: normalizeRobots(record.robots),
      isPublic: asBoolean(record.is_public),
      indexEligible: asBoolean(record.index_eligible),
      sitemapEligible: asBoolean(record.sitemap_eligible),
      llmsEligible: asBoolean(record.llms_eligible),
      launchState: asString(record.launch_state),
      title: asString(record.title),
      summary: asString(record.summary),
      faq: normalizeFaq(record.faq),
      methodBoundary: normalizeMethodBoundary(record.method_boundary),
      evidenceNotes: normalizeEvidenceNotes(record.evidence_notes),
      sections: normalizeSections(record.sections ?? record.content_sections),
      updatedAt: asNullableString(record.updated_at),
    };
  });
}
