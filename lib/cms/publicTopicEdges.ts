import { apiClient } from "@/lib/api-client";

export const PUBLIC_TOPIC_EDGE_SCHEMA_VERSION = "public-topic-edges.v1";
export const PUBLIC_TOPIC_EDGE_AUTHORITY_VERSION = "cms-public-topic-edge-authority.v1";
export const PUBLIC_TOPIC_EDGE_CAREER_GATE = "CLOSED";

export const PUBLIC_TOPIC_EDGE_ENTITY_TYPES = [
  "article",
  "content_page",
  "personality_profile",
  "topic",
] as const;

export const PUBLIC_TOPIC_EDGE_RELATION_TYPES = [
  "breadcrumb",
  "learn_more",
  "take_assessment",
] as const;

export type PublicTopicEdgeEntityType = (typeof PUBLIC_TOPIC_EDGE_ENTITY_TYPES)[number];
export type PublicTopicEdgeRelationType = (typeof PUBLIC_TOPIC_EDGE_RELATION_TYPES)[number];
export type PublicTopicEdgeLocale = "en" | "zh-CN";

export type PublicTopicEdgeSource = {
  type: PublicTopicEdgeEntityType;
  id: number;
  locale: PublicTopicEdgeLocale;
};

export type PublicTopicEdgeItem = {
  identity: string;
  sourceType: PublicTopicEdgeEntityType;
  sourceId: number;
  sourceLocale: PublicTopicEdgeLocale;
  sourceCanonical: string;
  relationType: PublicTopicEdgeRelationType;
  targetType: PublicTopicEdgeEntityType;
  targetId: number;
  targetLocale: PublicTopicEdgeLocale;
  crossLocaleApproved: boolean;
  visibleLabel: string;
  context: string | null;
  position: number;
  targetCanonical: string;
};

export type PublicTopicEdgeProjection = {
  schemaVersion: typeof PUBLIC_TOPIC_EDGE_SCHEMA_VERSION;
  authorityVersion: typeof PUBLIC_TOPIC_EDGE_AUTHORITY_VERSION;
  source: PublicTopicEdgeSource;
  sourceCanonical: string;
  items: PublicTopicEdgeItem[];
};

const PRIVATE_PATH_SEGMENTS = new Set([
  "attempt",
  "attempts",
  "checkout",
  "history",
  "order",
  "orders",
  "pay",
  "payment",
  "report",
  "reports",
  "result",
  "results",
  "share",
  "take",
]);
const FIRST_PARTY_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);
const IDENTITY_PATTERN = /^[a-f0-9]{64}$/;
const EVIDENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isEntityType(value: unknown): value is PublicTopicEdgeEntityType {
  return PUBLIC_TOPIC_EDGE_ENTITY_TYPES.includes(value as PublicTopicEdgeEntityType);
}

function isRelationType(value: unknown): value is PublicTopicEdgeRelationType {
  return PUBLIC_TOPIC_EDGE_RELATION_TYPES.includes(value as PublicTopicEdgeRelationType);
}

function isLocale(value: unknown): value is PublicTopicEdgeLocale {
  return value === "en" || value === "zh-CN";
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function decodePathname(value: string): string {
  let decoded = value;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

function isPrivatePath(pathname: string): boolean {
  return decodePathname(pathname)
    .split("/")
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean)
    .some((segment) => PRIVATE_PATH_SEGMENTS.has(segment));
}

function validCanonical(value: unknown, locale: PublicTopicEdgeLocale): string | null {
  if (typeof value !== "string" || value !== value.trim() || !value) return null;

  try {
    const parsed = new URL(value);
    const expectedLocaleSegment = locale === "zh-CN" ? "zh" : "en";
    const [localeSegment] = parsed.pathname.split("/").filter(Boolean);

    if (
      parsed.protocol !== "https:" ||
      !FIRST_PARTY_HOSTS.has(parsed.hostname.toLowerCase()) ||
      parsed.port ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      localeSegment !== expectedLocaleSegment ||
      isPrivatePath(parsed.pathname)
    ) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

function validDateWindow(validFrom: unknown, validUntil: unknown, now: number): boolean {
  if (validFrom !== null && validFrom !== undefined) {
    if (typeof validFrom !== "string") return false;
    const from = Date.parse(validFrom);
    if (!Number.isFinite(from) || from > now) return false;
  }

  if (validUntil !== null && validUntil !== undefined) {
    if (typeof validUntil !== "string") return false;
    const until = Date.parse(validUntil);
    if (!Number.isFinite(until) || until <= now) return false;
  }

  return true;
}

function normalizeItem(
  value: unknown,
  source: PublicTopicEdgeSource,
  sourceCanonical: string,
  now: number,
): PublicTopicEdgeItem | null {
  const item = asRecord(value);
  if (!item) return null;

  const identity = typeof item.identity === "string" ? item.identity : "";
  const sourceType = item.source_type;
  const sourceId = item.source_id;
  const sourceLocale = item.source_locale;
  const itemSourceCanonical = item.source_canonical;
  const relationType = item.relation_type;
  const targetType = item.target_type;
  const targetId = item.target_id;
  const targetLocale = item.target_locale;
  const crossLocaleApproved = item.cross_locale_approved;
  const visibleLabel = typeof item.visible_label === "string" ? item.visible_label.trim() : "";
  const context = typeof item.context === "string" ? item.context.trim() || null : null;
  const position = item.position;

  if (
    !IDENTITY_PATTERN.test(identity) ||
    sourceType !== source.type ||
    sourceId !== source.id ||
    sourceLocale !== source.locale ||
    itemSourceCanonical !== sourceCanonical ||
    !isRelationType(relationType) ||
    !isEntityType(targetType) ||
    !isPositiveInteger(targetId) ||
    !isLocale(targetLocale) ||
    typeof crossLocaleApproved !== "boolean" ||
    !visibleLabel ||
    typeof position !== "number" ||
    !Number.isSafeInteger(position) ||
    position < 0 ||
    item.active !== true ||
    item.publication_allowed !== true ||
    item.target_publication_eligible !== true ||
    item.review_state !== "approved" ||
    item.blocker !== null ||
    typeof item.version !== "string" ||
    !item.version.trim() ||
    !validDateWindow(item.valid_from, item.valid_until, now)
  ) {
    return null;
  }

  const evidenceRefs = Array.isArray(item.evidence_refs) ? item.evidence_refs : [];
  if (
    evidenceRefs.length === 0 ||
    evidenceRefs.some((reference) => typeof reference !== "string" || !EVIDENCE_PATTERN.test(reference))
  ) {
    return null;
  }

  if (sourceLocale !== targetLocale && crossLocaleApproved !== true) {
    return null;
  }

  const targetCanonical = validCanonical(item.target_canonical, targetLocale);
  if (!targetCanonical) return null;

  return {
    identity,
    sourceType: source.type,
    sourceId: source.id,
    sourceLocale: source.locale,
    sourceCanonical,
    relationType,
    targetType,
    targetId,
    targetLocale,
    crossLocaleApproved,
    visibleLabel,
    context,
    position,
    targetCanonical,
  };
}

export function normalizePublicTopicEdgeProjection(
  value: unknown,
  source: PublicTopicEdgeSource,
  now = Date.now(),
): PublicTopicEdgeProjection | null {
  const payload = asRecord(value);
  const authority = asRecord(payload?.authority);
  const rawItems = Array.isArray(payload?.items) ? payload.items : null;

  if (
    !payload ||
    !authority ||
    !rawItems ||
    payload.schema_version !== PUBLIC_TOPIC_EDGE_SCHEMA_VERSION ||
    authority.owner !== "fap-api/cms" ||
    authority.authority_version !== PUBLIC_TOPIC_EDGE_AUTHORITY_VERSION ||
    authority.source_type !== source.type ||
    authority.source_id !== source.id ||
    authority.source_locale !== source.locale ||
    authority.source_publication_eligible !== true ||
    authority.frontend_fallback_allowed !== false ||
    authority.target_truth_readback !== "live" ||
    authority.career_link_publication_gate !== PUBLIC_TOPIC_EDGE_CAREER_GATE ||
    authority.reason !== "OK" ||
    authority.eligible_item_count !== rawItems.length
  ) {
    return null;
  }

  const sourceCanonical = validCanonical(authority.source_canonical, source.locale);
  if (!sourceCanonical) return null;

  const seen = new Set<string>();
  const items = rawItems
    .map((item) => normalizeItem(item, source, sourceCanonical, now))
    .filter((item): item is PublicTopicEdgeItem => item !== null)
    .sort((left, right) => left.position - right.position || left.identity.localeCompare(right.identity))
    .filter((item) => {
      if (seen.has(item.identity)) return false;
      seen.add(item.identity);
      return true;
    });

  return {
    schemaVersion: PUBLIC_TOPIC_EDGE_SCHEMA_VERSION,
    authorityVersion: PUBLIC_TOPIC_EDGE_AUTHORITY_VERSION,
    source,
    sourceCanonical,
    items,
  };
}

export async function loadPublicTopicEdges(
  source: PublicTopicEdgeSource,
): Promise<PublicTopicEdgeProjection | null> {
  if (!isEntityType(source.type) || !isPositiveInteger(source.id) || !isLocale(source.locale)) {
    return null;
  }

  const query = new URLSearchParams({
    source_type: source.type,
    source_id: String(source.id),
    locale: source.locale,
  });

  try {
    const payload = await apiClient.getPublic<unknown>(`/v0.5/public-topic-edges?${query.toString()}`, {
      cache: "no-store",
      locale: source.locale,
      skipAuth: true,
      timeoutMs: 5000,
    });

    return normalizePublicTopicEdgeProjection(payload, source);
  } catch {
    return null;
  }
}
