import { ApiError, apiClient } from "@/lib/api-client";
import { MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type {
  CloneAssetSlot,
  ContentListBlock,
  EnergyBlock,
  IdeaListBlock,
  ListItem,
  LockedListBlock,
  MatchedGuidesBlock,
  MatchedJobsBlock,
  MbtiDesktopCloneContent,
  MbtiDesktopCloneAssetSlotId,
  OverviewBlock,
  ProfileIdentity,
  RelationshipInsightBlock,
  StrengthWeaknessBlock,
  TraitSlot,
  TraitUnlockBlock,
  TraitUnlockItem,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

const DEFAULT_ORG_ID = "0";
const DEFAULT_SCALE_CODE = "MBTI";
const DESKTOP_CLONE_TEMPLATE_KEY = "mbti_desktop_clone_v1";
const MBTI_FULL_CODE_RE = /^[IE][NS][TF][JP]-[AT]$/i;
const ALLOWED_LIST_ITEM_TONES = new Set(["positive", "negative", "neutral"]);
const ALLOWED_TRAIT_COLOR_KEYS = new Set(["blue", "gold", "green", "purple", "red"]);
const ALLOWED_ASSET_SLOT_STATUSES = new Set(["placeholder", "ready", "disabled"]);
const ALLOWED_ASSET_PROVIDERS = new Set(["oss", "cdn", "internal", "placeholder"]);

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

type AxisExplainersRecord = Record<string, Record<string, Record<string, Record<string, unknown>>>>;

export type PersonalityDesktopCloneAssetSlot = CloneAssetSlot & {
  assetRef: {
    provider: string | null;
    path: string | null;
    url: string | null;
    version: string | null;
    checksum: string | null;
  } | null;
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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => normalizeText(entry).length > 0);
}

function isProfileIdentity(value: unknown): value is ProfileIdentity {
  if (!isRecord(value)) {
    return false;
  }

  return normalizeText(value.code).length > 0
    && normalizeText(value.name).length > 0
    && normalizeText(value.nickname).length > 0
    && normalizeText(value.rarity).length > 0
    && isStringArray(value.keywords);
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

function isAxisExplainers(value: unknown): value is AxisExplainersRecord {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((axisValue) => {
    if (!isRecord(axisValue)) {
      return false;
    }

    return Object.values(axisValue).every((poleValue) => {
      if (!isRecord(poleValue)) {
        return false;
      }

      return ["light", "clear", "strong"].every((band) => {
        const bandValue = poleValue[band];
        return isRecord(bandValue) && normalizeText(bandValue.band_nuance ?? bandValue.bandNuance).length > 0;
      });
    });
  });
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

function hasRequiredMbtiDesktopCloneContent(value: unknown): value is MbtiDesktopCloneContent {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.hero) || normalizeText(value.hero.summary).length === 0) {
    return false;
  }

  const hero = value.hero;
  const profileIdentity = isRecord(hero) ? (hero.profile_identity ?? hero.profileIdentity) : null;
  if (profileIdentity != null && !isProfileIdentity(profileIdentity)) {
    return false;
  }

  if (!isRecord(value.intro) || !isTextTuple(value.intro.paragraphs)) {
    return false;
  }

  if (!isRecord(value.traits) || !isSummaryPane(value.traits.summaryPane) || !isTextTuple(value.traits.body)) {
    return false;
  }

  const axisExplainers = value.traits.axis_explainers ?? value.traits.axisExplainers;
  if (axisExplainers != null && !isAxisExplainers(axisExplainers)) {
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

function normalizeStrengthWeakness(value: unknown): StrengthWeaknessBlock | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = normalizeText(value.title);
  if (!title || !Array.isArray(value.items)) {
    return undefined;
  }

  const items = value.items
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const itemTitle = normalizeText(item.title);
      const description = normalizeText(item.description);
      if (!itemTitle || !description) {
        return null;
      }

      return {
        title: itemTitle,
        description,
      };
    })
    .filter((item): item is { title: string; description: string } => item !== null);

  if (items.length === 0) {
    return undefined;
  }

  return {
    title,
    items,
  };
}

function normalizeIdeaListBlock(value: unknown): IdeaListBlock | undefined {
  return normalizeStrengthWeakness(value);
}

function normalizeEnergyBlock(value: unknown): EnergyBlock | undefined {
  return normalizeStrengthWeakness(value);
}

function normalizeRelationshipInsightBlock(value: unknown): RelationshipInsightBlock | undefined {
  return normalizeStrengthWeakness(value);
}

function normalizeOverview(value: unknown): OverviewBlock | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = normalizeText(value.title);
  if (!title || !Array.isArray(value.paragraphs)) {
    return undefined;
  }

  const paragraphs = value.paragraphs
    .map((paragraph) => normalizeText(paragraph))
    .filter((paragraph) => paragraph.length > 0);

  if (paragraphs.length === 0) {
    return undefined;
  }

  return {
    title,
    paragraphs,
  };
}

function normalizeMatchedJobs(value: unknown): MatchedJobsBlock | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = normalizeText(value.title);
  const fitBucket = normalizeText(value.fit_bucket ?? value.fitBucket).toLowerCase();
  const summary = normalizeText(value.summary);
  const fitReason = normalizeText(value.fit_reason ?? value.fitReason);
  const rawJobExamples = value.job_examples ?? value.jobExamples;

  if (!title || !summary || !fitReason || !Array.isArray(rawJobExamples)) {
    return undefined;
  }

  if (fitBucket !== "primary" && fitBucket !== "secondary") {
    return undefined;
  }

  const jobExamples = rawJobExamples
    .map((entry: unknown) => normalizeText(entry))
    .filter((entry: string) => entry.length > 0);

  if (jobExamples.length === 0) {
    return undefined;
  }

  return {
    title,
    fitBucket,
    summary,
    fitReason,
    jobExamples,
  };
}

function normalizeMatchedGuides(value: unknown): MatchedGuidesBlock | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = normalizeText(value.title);
  const summary = normalizeText(value.summary);
  const fitReason = normalizeText(value.fit_reason ?? value.fitReason);

  if (!title || !summary || !fitReason) {
    return undefined;
  }

  return {
    title,
    summary,
    fitReason,
  };
}

function normalizeTraitUnlockLinks(value: unknown): TraitUnlockItem["linksToExistingBlocks"] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const normalizedEntries = Object.entries(value)
    .map(([key, paths]) => {
      const normalizedKey = normalizeText(key);
      if (!normalizedKey || !isStringArray(paths)) {
        return null;
      }

      const normalizedPaths = paths
        .map((path) => normalizeText(path))
        .filter((path): path is string => path.length > 0);

      if (normalizedPaths.length === 0) {
        return null;
      }

      return [normalizedKey, normalizedPaths] as const;
    })
    .filter((entry): entry is readonly [string, string[]] => entry !== null);

  if (normalizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(normalizedEntries);
}

function normalizeTraitUnlockItem(value: unknown, chapterKey: "career" | "growth" | "relationships"): TraitUnlockItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = normalizeText(value.id);
  const label = normalizeText(value.label);
  const role = normalizeText(value.role);
  const definition = normalizeText(value.definition);
  const whyItMatters = normalizeText(value.why_it_matters ?? value.whyItMatters);
  const expression = normalizeText(
    chapterKey === "career"
      ? value.career_expression
      : chapterKey === "growth"
        ? value.growth_expression
        : value.relationship_expression,
  );
  const advantage = normalizeText(
    chapterKey === "career"
      ? value.career_advantage
      : chapterKey === "growth"
        ? value.growth_advantage
        : value.relationship_advantage,
  );
  const overuseRisk = normalizeText(value.overuse_risk ?? value.overuseRisk);
  const realWorldSignal = normalizeText(value.real_world_signal ?? value.realWorldSignal);
  const upgradeHint = normalizeText(value.upgrade_hint ?? value.upgradeHint);

  if (!id || !label || !role || !definition || !whyItMatters || !expression || !advantage || !overuseRisk || !realWorldSignal || !upgradeHint) {
    return null;
  }

  return {
    id,
    label,
    role,
    definition,
    whyItMatters,
    expression,
    advantage,
    overuseRisk,
    realWorldSignal,
    upgradeHint,
    linksToExistingBlocks: normalizeTraitUnlockLinks(value.links_to_existing_blocks ?? value.linksToExistingBlocks),
  };
}

function normalizeTraitsUnlock(value: unknown, chapterKey: "career" | "growth" | "relationships"): TraitUnlockBlock | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = normalizeText(value.title);
  const intro = normalizeText(value.intro);

  if (!title || !intro || !Array.isArray(value.items) || value.items.length !== 4) {
    return undefined;
  }

  const items = value.items
    .map((item) => normalizeTraitUnlockItem(item, chapterKey))
    .filter((item): item is TraitUnlockItem => item !== null);

  if (items.length !== 4) {
    return undefined;
  }

  return {
    title,
    intro,
    items: items as [TraitUnlockItem, TraitUnlockItem, TraitUnlockItem, TraitUnlockItem],
  };
}

function normalizeLettersIntro(value: unknown): MbtiDesktopCloneContent["lettersIntro"] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const headline = normalizeText(value.headline);
  if (!headline || !Array.isArray(value.letters)) {
    return undefined;
  }

  const letters = value.letters
    .map((letter) => {
      if (!isRecord(letter)) {
        return null;
      }

      const initial = normalizeText(letter.letter);
      const title = normalizeText(letter.title);
      const description = normalizeText(letter.description);
      if (!initial || !title || !description) {
        return null;
      }

      return {
        letter: initial,
        title,
        description,
      };
    })
    .filter((letter): letter is { letter: string; title: string; description: string } => letter !== null);

  if (letters.length === 0) {
    return undefined;
  }

  return {
    headline,
    letters,
  };
}

function normalizeAxisExplainers(value: unknown): MbtiDesktopCloneContent["traits"]["axisExplainers"] | undefined {
  if (!isAxisExplainers(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).map(([axisCode, poles]) => [
      axisCode,
      Object.fromEntries(
        Object.entries(poles).map(([pole, bands]) => [
          pole,
          Object.fromEntries(
            ["light", "clear", "strong"]
              .map((band) => {
                const bandValue = bands[band];
                if (!isRecord(bandValue)) {
                  return null;
                }

                const bandNuance = normalizeText(bandValue.band_nuance ?? bandValue.bandNuance);
                if (!bandNuance) {
                  return null;
                }

                return [band, { bandNuance }] as const;
              })
              .filter((entry): entry is readonly [string, { bandNuance: string }] => entry !== null),
          ),
        ]),
      ),
    ]),
  );
}

function normalizeProfileIdentity(value: unknown): ProfileIdentity | undefined {
  if (!isProfileIdentity(value)) {
    return undefined;
  }

  return {
    code: normalizeText(value.code),
    name: normalizeText(value.name),
    nickname: normalizeText(value.nickname),
    rarity: normalizeText(value.rarity),
    keywords: value.keywords.map((keyword) => normalizeText(keyword)).filter((keyword) => keyword.length > 0),
  };
}

function normalizeMbtiDesktopCloneContent(value: unknown): MbtiDesktopCloneContent | null {
  if (!hasRequiredMbtiDesktopCloneContent(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const typedContent = value as MbtiDesktopCloneContent;
  const chapters = isRecord(source.chapters) ? source.chapters : ({} as Record<string, unknown>);
  const career = isRecord(chapters.career) ? chapters.career : ({} as Record<string, unknown>);
  const growth = isRecord(chapters.growth) ? chapters.growth : ({} as Record<string, unknown>);
  const relationships = isRecord(chapters.relationships) ? chapters.relationships : ({} as Record<string, unknown>);
  const traits = isRecord(source.traits) ? source.traits : ({} as Record<string, unknown>);
  const axisExplainers = traits.axis_explainers ?? traits.axisExplainers;
  const hero = isRecord(source.hero) ? source.hero : ({} as Record<string, unknown>);

  return {
    hero: {
      summary: typedContent.hero.summary,
      profileIdentity: normalizeProfileIdentity(hero.profile_identity ?? hero.profileIdentity),
    },
    intro: typedContent.intro,
    lettersIntro: normalizeLettersIntro(source.letters_intro ?? source.lettersIntro),
    overview: normalizeOverview(source.overview),
    traits: {
      ...typedContent.traits,
      axisExplainers: normalizeAxisExplainers(axisExplainers),
    },
    chapters: {
      career: {
        ...typedContent.chapters.career,
        strengths: normalizeStrengthWeakness(career.strengths),
        weaknesses: normalizeStrengthWeakness(career.weaknesses),
        matchedJobs: normalizeMatchedJobs(career.matched_jobs ?? career.matchedJobs),
        matchedGuides: normalizeMatchedGuides(career.matched_guides ?? career.matchedGuides),
        careerIdeas: normalizeIdeaListBlock(career.career_ideas ?? career.careerIdeas),
        workStyles: normalizeIdeaListBlock(career.work_styles ?? career.workStyles),
        traitsUnlock: normalizeTraitsUnlock(career.traits_unlock ?? career.traitsUnlock, "career"),
      },
      growth: {
        ...typedContent.chapters.growth,
        strengths: normalizeStrengthWeakness(growth.strengths),
        weaknesses: normalizeStrengthWeakness(growth.weaknesses),
        whatEnergizes: normalizeEnergyBlock(growth.what_energizes ?? growth.whatEnergizes),
        whatDrains: normalizeEnergyBlock(growth.what_drains ?? growth.whatDrains),
        traitsUnlock: normalizeTraitsUnlock(growth.traits_unlock ?? growth.traitsUnlock, "growth"),
      },
      relationships: {
        ...typedContent.chapters.relationships,
        strengths: normalizeStrengthWeakness(relationships.strengths),
        weaknesses: normalizeStrengthWeakness(relationships.weaknesses),
        superpowers: normalizeRelationshipInsightBlock(relationships.superpowers),
        pitfalls: normalizeRelationshipInsightBlock(relationships.pitfalls),
        traitsUnlock: normalizeTraitsUnlock(relationships.traits_unlock ?? relationships.traitsUnlock, "relationships"),
      },
    },
    finalOffer: typedContent.finalOffer,
  };
}

function normalizeAssetSlot(value: unknown): PersonalityDesktopCloneAssetSlot | null {
  if (!isRecord(value)) {
    return null;
  }

  const slotId = normalizeText(value.slot_id ?? value.slotId);
  const label = normalizeText(value.label);
  const aspectRatio = normalizeText(value.aspect_ratio ?? value.aspectRatio);
  const status = normalizeText(value.status).toLowerCase();
  const alt = value.alt == null ? null : normalizeText(value.alt) || null;
  const slotIdSet = new Set(MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS as readonly string[]);

  if (!slotIdSet.has(slotId) || !label || !aspectRatio || !ALLOWED_ASSET_SLOT_STATUSES.has(status)) {
    return null;
  }

  const rawAssetRef = value.asset_ref ?? value.assetRef;
  const assetRef = normalizeAssetRef(rawAssetRef);
  if (status === "ready" && !assetRef) {
    return null;
  }

  return {
    slotId: slotId as MbtiDesktopCloneAssetSlotId,
    label,
    aspectRatio,
    status: status as CloneAssetSlot["status"],
    assetRef,
    alt,
    meta: isRecord(value.meta) ? value.meta : null,
  };
}

function normalizeAssetSlots(value: unknown): PersonalityDesktopCloneAssetSlot[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const bySlotId = new Map<MbtiDesktopCloneAssetSlotId, PersonalityDesktopCloneAssetSlot>();
  for (const slot of value) {
    const parsed = normalizeAssetSlot(slot);
    if (!parsed) {
      return null;
    }
    if (bySlotId.has(parsed.slotId)) {
      return null;
    }
    bySlotId.set(parsed.slotId, parsed);
  }

  if (bySlotId.size !== MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS.length) {
    return null;
  }

  const ordered = MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS.map((slotId) => bySlotId.get(slotId));
  if (ordered.some((slot) => !slot)) {
    return null;
  }

  return ordered as PersonalityDesktopCloneAssetSlot[];
}

function normalizeAssetRef(value: unknown): PersonalityDesktopCloneAssetSlot["assetRef"] {
  if (!isRecord(value)) {
    return null;
  }

  const provider = normalizeText(value.provider) || null;
  const path = normalizeText(value.path) || null;
  const url = normalizeText(value.url) || null;
  const version = normalizeText(value.version) || null;
  const checksum = normalizeText(value.checksum) || null;

  if (!provider && !path && !url && !version && !checksum) {
    return null;
  }

  if (provider && !ALLOWED_ASSET_PROVIDERS.has(provider)) {
    return null;
  }

  return { provider, path, url, version, checksum };
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

  const content = normalizeMbtiDesktopCloneContent(response.content);
  if (!content) {
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
    content,
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
