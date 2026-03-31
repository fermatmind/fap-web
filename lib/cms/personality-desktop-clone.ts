import { ApiError, apiClient } from "@/lib/api-client";
import type {
  CloneAssetSlot,
  ContentListBlock,
  ListItem,
  LockedListBlock,
  MbtiDesktopCloneContent,
  TraitSlot,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

const DEFAULT_ORG_ID = "0";
const DEFAULT_SCALE_CODE = "MBTI";
const DESKTOP_CLONE_TEMPLATE_KEY = "mbti_desktop_clone_v1";
const MBTI_FULL_CODE_RE = /^[IE][NS][TF][JP]-[AT]$/i;
const ALLOWED_LIST_ITEM_TONES = new Set(["positive", "negative", "neutral"]);
const ALLOWED_TRAIT_COLOR_KEYS = new Set(["blue", "gold", "green", "purple", "red"]);

type DesktopCloneApiMeta = {
  authority_source?: string | null;
  route_mode?: string | null;
  public_route_type?: string | null;
  [key: string]: unknown;
} | null;

type PersonalityDesktopCloneApiResponse = {
  ok?: boolean;
  template_key?: unknown;
  schema_version?: unknown;
  full_code?: unknown;
  base_code?: unknown;
  locale?: unknown;
  content?: unknown;
  asset_slots?: unknown;
  _meta?: DesktopCloneApiMeta;
};

export type PersonalityDesktopCloneAssetSlot = CloneAssetSlot & {
  assetRef: unknown | null;
  alt: string | null;
  meta: Record<string, unknown> | null;
};

export type PersonalityDesktopCloneContentPayload = {
  templateKey: string;
  schemaVersion: string;
  fullCode: string;
  baseCode: string;
  locale: "zh-CN";
  content: MbtiDesktopCloneContent;
  assetSlots: PersonalityDesktopCloneAssetSlot[];
  meta: DesktopCloneApiMeta;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isTextTuple(value: unknown): value is [string, string] {
  return Array.isArray(value)
    && value.length === 2
    && value.every((entry) => normalizeText(entry).length > 0);
}

function isListItem(value: unknown): value is ListItem {
  if (!isRecord(value)) {
    return false;
  }

  const title = normalizeText(value.title);
  const body = normalizeText(value.body);
  const tone = normalizeText(value.tone);

  if (!title || !body) {
    return false;
  }

  if (!tone) {
    return true;
  }

  return ALLOWED_LIST_ITEM_TONES.has(tone);
}

function isListItemTuple6(value: unknown): value is [ListItem, ListItem, ListItem, ListItem, ListItem, ListItem] {
  return Array.isArray(value) && value.length === 6 && value.every(isListItem);
}

function isContentListBlock(value: unknown): value is ContentListBlock {
  if (!isRecord(value)) {
    return false;
  }

  return normalizeText(value.title).length > 0 && isListItemTuple6(value.items);
}

function isLockedListBlock(value: unknown): value is LockedListBlock {
  if (!isRecord(value)) {
    return false;
  }

  return normalizeText(value.title).length > 0
    && normalizeText(value.overlayTitle).length > 0
    && normalizeText(value.overlayBody).length > 0
    && normalizeText(value.overlayCtaLabel).length > 0
    && isListItemTuple6(value.blurredItems);
}

function isTraitSlot(value: unknown): value is TraitSlot {
  if (!isRecord(value)) {
    return false;
  }

  const label = normalizeText(value.label);
  if (!label) {
    return false;
  }

  const colorKey = normalizeText(value.colorKey);
  if (!colorKey) {
    return true;
  }

  return ALLOWED_TRAIT_COLOR_KEYS.has(colorKey);
}

function isTraitTuple4(value: unknown): value is [TraitSlot, TraitSlot, TraitSlot, TraitSlot] {
  return Array.isArray(value) && value.length === 4 && value.every(isTraitSlot);
}

function isVisibleBlocks(value: unknown): value is [ContentListBlock, ContentListBlock?] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 2) {
    return false;
  }

  return value.every((block) => block == null || isContentListBlock(block));
}

function isLockedBlocks(value: unknown): value is [LockedListBlock, LockedListBlock] {
  return Array.isArray(value) && value.length === 2 && value.every(isLockedListBlock);
}

function isChapterContent(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return isTextTuple(value.intro)
    && isTraitTuple4(value.influentialTraits)
    && isVisibleBlocks(value.visibleBlocks)
    && isLockedBlocks(value.lockedBlocks);
}

function isSummaryPane(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return normalizeText(value.eyebrow).length > 0
    && normalizeText(value.title).length > 0
    && normalizeText(value.value).length > 0
    && normalizeText(value.body).length > 0;
}

function isFinalOffer(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return normalizeText(value.eyebrow).length > 0
    && normalizeText(value.headline).length > 0
    && normalizeText(value.body).length > 0
    && normalizeText(value.priceLabel).length > 0
    && normalizeText(value.ctaLabel).length > 0
    && normalizeText(value.guarantee).length > 0;
}

function isMbtiDesktopCloneContent(value: unknown): value is MbtiDesktopCloneContent {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.hero) || normalizeText(value.hero.summary).length === 0) {
    return false;
  }

  if (!isRecord(value.intro) || !isTextTuple(value.intro.paragraphs)) {
    return false;
  }

  if (!isRecord(value.traits) || !isSummaryPane(value.traits.summaryPane) || !isTextTuple(value.traits.body)) {
    return false;
  }

  if (!isRecord(value.chapters)) {
    return false;
  }

  if (!isChapterContent(value.chapters.career) || !isChapterContent(value.chapters.growth) || !isChapterContent(value.chapters.relationships)) {
    return false;
  }

  return isFinalOffer(value.finalOffer);
}

function normalizeAssetSlot(value: unknown): PersonalityDesktopCloneAssetSlot | null {
  if (!isRecord(value)) {
    return null;
  }

  const slotId = normalizeText(value.slotId);
  const label = normalizeText(value.label);
  const aspectRatio = normalizeText(value.aspectRatio);
  const status = normalizeText(value.status);
  const alt = value.alt == null ? null : normalizeText(value.alt) || null;

  if (!slotId || !label || !aspectRatio || !status) {
    return null;
  }

  return {
    slotId,
    label,
    aspectRatio,
    status: status as CloneAssetSlot["status"],
    assetRef: value.assetRef ?? null,
    alt,
    meta: isRecord(value.meta) ? value.meta : null,
  };
}

function normalizeAssetSlots(value: unknown): PersonalityDesktopCloneAssetSlot[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized: PersonalityDesktopCloneAssetSlot[] = [];
  for (const slot of value) {
    const parsed = normalizeAssetSlot(slot);
    if (!parsed) {
      return null;
    }
    normalized.push(parsed);
  }

  return normalized;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    query.set(key, String(value));
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function normalizeDesktopCloneApiLocale(locale: string | null | undefined): "zh-CN" | null {
  const normalized = normalizeText(locale).toLowerCase();
  if (normalized === "zh" || normalized === "zh-cn") {
    return "zh-CN";
  }

  return null;
}

export function normalizeDesktopCloneTypeSlug(fullCode: string | null | undefined): string | null {
  const normalizedFullCode = normalizeText(fullCode).toUpperCase();
  if (!MBTI_FULL_CODE_RE.test(normalizedFullCode)) {
    return null;
  }

  return normalizedFullCode.toLowerCase();
}

function slugToUpperFullCode(typeSlug: string): string {
  return normalizeText(typeSlug).toUpperCase();
}

function normalizeDesktopCloneResponse(
  response: PersonalityDesktopCloneApiResponse,
  expectedFullCode: string,
  expectedLocale: "zh-CN",
): PersonalityDesktopCloneContentPayload | null {
  const templateKey = normalizeText(response.template_key);
  const schemaVersion = normalizeText(response.schema_version);
  const fullCode = normalizeText(response.full_code).toUpperCase();
  const baseCode = normalizeText(response.base_code).toUpperCase();
  const locale = normalizeText(response.locale);

  if (!templateKey || !schemaVersion || !fullCode || !baseCode || !locale) {
    return null;
  }

  if (templateKey !== DESKTOP_CLONE_TEMPLATE_KEY) {
    return null;
  }

  if (fullCode !== expectedFullCode || locale !== expectedLocale) {
    return null;
  }

  if (!isMbtiDesktopCloneContent(response.content)) {
    return null;
  }

  const assetSlots = normalizeAssetSlots(response.asset_slots);
  if (!assetSlots) {
    return null;
  }

  const routeMode = normalizeText(response._meta?.route_mode);
  if (routeMode && routeMode !== "full_code_exact") {
    return null;
  }

  const publicRouteType = normalizeText(response._meta?.public_route_type);
  if (publicRouteType && publicRouteType !== "32-type") {
    return null;
  }

  return {
    templateKey,
    schemaVersion,
    fullCode,
    baseCode,
    locale: expectedLocale,
    content: response.content,
    assetSlots,
    meta: response._meta ?? null,
  };
}

export async function fetchPersonalityDesktopCloneContent(
  fullCode: string,
  locale: string,
): Promise<PersonalityDesktopCloneContentPayload | null> {
  const apiLocale = normalizeDesktopCloneApiLocale(locale);
  const typeSlug = normalizeDesktopCloneTypeSlug(fullCode);
  if (!apiLocale || !typeSlug) {
    return null;
  }

  const query = buildQuery({
    locale: apiLocale,
    org_id: DEFAULT_ORG_ID,
    scale_code: DEFAULT_SCALE_CODE,
  });

  try {
    const response = await apiClient.get<PersonalityDesktopCloneApiResponse>(
      `/v0.5/personality/${encodeURIComponent(typeSlug)}/desktop-clone${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
      },
    );

    return normalizeDesktopCloneResponse(response, slugToUpperFullCode(typeSlug), apiLocale);
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    return null;
  }
}
