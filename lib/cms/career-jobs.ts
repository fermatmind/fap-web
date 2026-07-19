import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw, SeoSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import {
  createUnavailableCareerScoreResult,
  normalizeCareerAssetMaster,
  normalizeCareerClaimPermissions,
  normalizeCareerTrustManifest,
  type CareerAssetMaster,
  type CareerClaimPermissions,
  type CareerTrustManifest,
} from "@/lib/career/contracts";
import { getCareerJobRenderState, type CareerJobRenderState } from "@/lib/career/protocolReadiness";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { canonicalUrl } from "@/lib/site";

/**
 * Legacy CMS adapter only.
 * Do not use this file as authority for backend-owned Career bundle pages.
 */
const DEFAULT_ORG_ID = "0";
type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C";

type CmsCareerJobApiSeoMeta = {
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image_url?: string | null;
  robots?: string | null;
  jsonld_overrides_json?: unknown;
} | null;

type CmsCareerJobApiRecord = {
  id?: number;
  org_id?: number;
  job_code?: string;
  occupation_uuid?: string | null;
  slug?: string;
  locale?: string;
  title?: string;
  subtitle?: string | null;
  excerpt?: string | null;
  hero_kicker?: string | null;
  hero_quote?: string | null;
  cover_image_url?: string | null;
  industry_slug?: string | null;
  industry_label?: string | null;
  body_md?: string | null;
  body_html?: string | null;
  status?: string;
  is_public?: boolean;
  is_indexable?: boolean;
  published_at?: string | null;
  updated_at?: string | null;
  salary?: unknown;
  outlook?: unknown;
  skills?: unknown;
  work_contents?: unknown;
  growth_path?: unknown;
  fit_personality_codes?: unknown;
  mbti_primary_codes?: unknown;
  mbti_secondary_codes?: unknown;
  riasec_profile?: unknown;
  seo_meta?: CmsCareerJobApiSeoMeta;
  career_asset_master_v4_1?: unknown;
  trust_manifest?: unknown;
  claim_permissions?: unknown;
  index_state?: string | null;
  index_eligible?: boolean;
  dataset_eligible?: boolean;
  article_eligible?: boolean;
};

type CmsCareerJobApiSection = {
  section_key?: string;
  title?: string | null;
  render_variant?: string;
  body_md?: string | null;
  body_html?: string | null;
  payload_json?: unknown;
  sort_order?: number;
  is_enabled?: boolean;
};

type CmsCareerJobListApiResponse = {
  ok?: boolean;
  items?: CmsCareerJobApiRecord[];
  pagination?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
};

type CmsCareerJobDetailApiResponse = {
  ok?: boolean;
  job?: CmsCareerJobApiRecord | null;
  sections?: CmsCareerJobApiSection[];
  seo_meta?: CmsCareerJobApiSeoMeta;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
};

type CmsCareerJobSeoApiResponse = {
  meta?: {
    title?: string;
    description?: string;
    canonical?: string | null;
    alternates?: Record<string, string>;
    og?: {
      title?: string;
      description?: string;
      image?: string | null;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      image?: string | null;
    };
    robots?: string;
  };
  jsonld?: unknown;
  seo_surface_v1?: SeoSurfaceRaw | null;
};

export type CareerJobSeoMetaSummary = {
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
  robots: string | null;
  jsonldOverrides: unknown;
};

export type CareerJobSectionViewModel = {
  sectionKey: string;
  title: string;
  renderVariant: string;
  bodyMarkdown: string;
  bodyHtml: string;
  payloadJson: unknown;
  sortOrder: number;
  isEnabled: boolean;
};

export type CareerJobRiasecVector = Record<RiasecKey, number | null>;

export type CareerJobListItem = {
  slug: string;
  title: string;
  summary: string;
  salaryText: string;
  href: string;
};

export type CareerJobProtocolBundle = {
  careerAsset: CareerAssetMaster | null;
  trustManifest: CareerTrustManifest | null;
  claimPermissions: CareerClaimPermissions;
};

export type CareerJobAdapterViewModel = {
  id: number | null;
  orgId: number;
  jobCode: string;
  slug: string;
  locale: string;
  title: string;
  summary: string;
  industrySlug: string;
  industryLabel: string;
  heroKicker: string;
  heroQuote: string;
  coverImageUrl: string | null;
  workContents: string[];
  skills: string[];
  salaryText: string;
  outlookText: string;
  growthPathItems: string[];
  fitPersonalityItems: string[];
  mbtiPrimary: string[];
  mbtiSecondary: string[];
  riasecVector: CareerJobRiasecVector;
  bodyMarkdown: string;
  bodyHtml: string;
  sections: CareerJobSectionViewModel[];
  seoMeta: CareerJobSeoMetaSummary | null;
  landingSurface: LandingSurfaceViewModel | null;
  answerSurface: AnswerSurfaceViewModel | null;
  renderState: CareerJobRenderState;
  protocol: CareerJobProtocolBundle;
  status: string;
  isPublic: boolean;
  isIndexable: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
};

/**
 * @deprecated Adapter-layer export retained for existing page imports.
 * The canonical protocol authority now lives under `lib/career/contracts`.
 */
export type CareerJobViewModel = CareerJobAdapterViewModel;

export type CareerJobSeoViewModel = {
  meta: {
    title: string;
    description: string;
    canonical: string | null;
    alternates: {
      en: string | null;
      "zh-CN": string | null;
    };
    og: {
      title: string;
      description: string;
      image: string | null;
      type: string;
    };
    twitter: {
      card: string;
      title: string;
      description: string;
      image: string | null;
    };
    robots: string;
  };
  jsonld: unknown;
  surface: SeoSurfaceViewModel | null;
};

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

function fallbackText(...candidates: Array<unknown>): string {
  for (const candidate of candidates) {
    const normalized = String(candidate ?? "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeIsoValue(value: unknown): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => fallbackText(item))
      .filter(Boolean);
  }

  const text = fallbackText(value);
  return text ? [text] : [];
}

function splitLooseListText(value: string): string[] {
  const normalized = String(value ?? "").replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized
    .split("\n")
    .map((line) => line.replace(/^[\s>*-]+/, "").trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  const delimited = normalized
    .split(/\s*[;；•]\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);

  return delimited.length > 1 ? delimited : [normalized];
}

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function normalizeRawText(value: unknown): string {
  return String(value ?? "").trim();
}

function matchesRequestedLocale(jobLocale: string, locale: Locale | string): boolean {
  return toApiLocale(jobLocale) === mapFrontendLocaleToCareerApiLocale(locale);
}

function normalizeCareerJobSeoMeta(seoMeta: CmsCareerJobApiSeoMeta): CareerJobSeoMetaSummary | null {
  if (!seoMeta || typeof seoMeta !== "object") {
    return null;
  }

  return {
    seoTitle: fallbackText(seoMeta.seo_title) || null,
    seoDescription: fallbackText(seoMeta.seo_description) || null,
    canonicalUrl: normalizeIsoValue(seoMeta.canonical_url),
    ogTitle: fallbackText(seoMeta.og_title) || null,
    ogDescription: fallbackText(seoMeta.og_description) || null,
    ogImageUrl: normalizeIsoValue(seoMeta.og_image_url),
    twitterTitle: fallbackText(seoMeta.twitter_title) || null,
    twitterDescription: fallbackText(seoMeta.twitter_description) || null,
    twitterImageUrl: normalizeIsoValue(seoMeta.twitter_image_url),
    robots: fallbackText(seoMeta.robots) || null,
    jsonldOverrides: seoMeta.jsonld_overrides_json ?? null,
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatSalaryNumber(value: number, currency: string | null, locale: Locale | string): string {
  const localeTag = normalizeLocale(locale) === "zh" ? "zh-CN" : "en-US";

  if (currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat(localeTag, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${currency} ${new Intl.NumberFormat(localeTag).format(value)}`;
    }
  }

  return new Intl.NumberFormat(localeTag).format(value);
}

function normalizeSalaryText(salary: unknown, locale: Locale | string): string {
  const salaryRecord = asRecord(salary);
  if (!salaryRecord) {
    return "";
  }

  const raw = fallbackText(salaryRecord.raw);
  if (raw) {
    return raw;
  }

  const currency = fallbackText(salaryRecord.currency).toUpperCase() || null;
  const low = toNumber(salaryRecord.low);
  const median = toNumber(salaryRecord.median);
  const high = toNumber(salaryRecord.high);
  const notes = fallbackText(salaryRecord.notes);

  let summary = "";

  if (low !== null && high !== null) {
    summary = `${formatSalaryNumber(low, currency, locale)} - ${formatSalaryNumber(high, currency, locale)}`;
    if (median !== null) {
      summary += normalizeLocale(locale) === "zh"
        ? `（中位数 ${formatSalaryNumber(median, currency, locale)}）`
        : ` (median ${formatSalaryNumber(median, currency, locale)})`;
    }
  } else if (median !== null) {
    summary = normalizeLocale(locale) === "zh"
      ? `中位数约 ${formatSalaryNumber(median, currency, locale)}`
      : `Median ${formatSalaryNumber(median, currency, locale)}`;
  } else if (low !== null) {
    summary = normalizeLocale(locale) === "zh"
      ? `约 ${formatSalaryNumber(low, currency, locale)} 起`
      : `From ${formatSalaryNumber(low, currency, locale)}`;
  } else if (high !== null) {
    summary = normalizeLocale(locale) === "zh"
      ? `最高约 ${formatSalaryNumber(high, currency, locale)}`
      : `Up to ${formatSalaryNumber(high, currency, locale)}`;
  }

  if (summary && notes) {
    return `${summary}. ${notes}`;
  }

  return summary || notes;
}

function normalizeWorkContents(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(normalizeStringArray(value));
  }

  const payload = asRecord(value);
  if (!payload) {
    return [];
  }

  const raw = normalizeRawText(payload.raw);
  if (raw) {
    return uniqueStrings(splitLooseListText(raw));
  }

  return uniqueStrings(normalizeStringArray(payload.items));
}

function normalizeSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(normalizeStringArray(value));
  }

  const payload = asRecord(value);
  if (!payload) {
    return [];
  }

  const raw = normalizeRawText(payload.raw);
  if (raw) {
    return uniqueStrings(splitLooseListText(raw));
  }

  const groupedItems = [
    ...normalizeStringArray(payload.core),
    ...normalizeStringArray(payload.supporting),
  ];

  if (groupedItems.length > 0) {
    return uniqueStrings(groupedItems);
  }

  const flattened = Object.values(payload).flatMap((item) => normalizeStringArray(item));
  return uniqueStrings(flattened);
}

function normalizeOutlookText(value: unknown): string {
  const payload = asRecord(value);
  if (!payload) {
    return fallbackText(value);
  }

  return fallbackText(payload.summary, payload.raw, payload.notes);
}

function normalizeGrowthPath(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(normalizeStringArray(value));
  }

  const payload = asRecord(value);
  if (!payload) {
    return [];
  }

  const raw = normalizeRawText(payload.raw);
  if (raw) {
    return uniqueStrings(splitLooseListText(raw));
  }

  const ordered = ["entry", "mid", "senior", "lead", "principal", "executive"]
    .flatMap((key) => normalizeStringArray(payload[key]));

  if (ordered.length > 0) {
    return uniqueStrings(ordered);
  }

  return uniqueStrings(Object.values(payload).flatMap((item) => normalizeStringArray(item)));
}

function normalizeCodeItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value
        .map((item) => fallbackText(item).toUpperCase())
        .filter(Boolean)
    );
  }

  const payload = asRecord(value);
  if (payload?.raw) {
    return uniqueStrings(splitLooseListText(normalizeRawText(payload.raw)).map((item) => item.toUpperCase()));
  }

  return [];
}

function normalizeRiasecVector(value: unknown): CareerJobRiasecVector {
  const payload = asRecord(value);

  return {
    R: toNumber(payload?.R),
    I: toNumber(payload?.I),
    A: toNumber(payload?.A),
    S: toNumber(payload?.S),
    E: toNumber(payload?.E),
    C: toNumber(payload?.C),
  };
}

function normalizeSection(section: CmsCareerJobApiSection): CareerJobSectionViewModel | null {
  const sectionKey = fallbackText(section.section_key).toLowerCase();
  if (!sectionKey) {
    return null;
  }

  return {
    sectionKey,
    title: fallbackText(section.title, section.section_key),
    renderVariant: fallbackText(section.render_variant, "rich_text"),
    bodyMarkdown: String(section.body_md ?? ""),
    bodyHtml: String(section.body_html ?? ""),
    payloadJson: section.payload_json ?? null,
    sortOrder: typeof section.sort_order === "number" ? section.sort_order : 0,
    isEnabled: section.is_enabled !== false,
  };
}

function replaceCanonicalValue(
  value: string,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string
): string {
  const normalizedCanonical = canonicalUrl(localizedCanonicalPath);
  const normalizedSourceCanonical = String(sourceCanonical ?? "").trim();

  if (normalizedSourceCanonical) {
    if (value === normalizedSourceCanonical) {
      return normalizedCanonical;
    }

    if (value.startsWith(`${normalizedSourceCanonical}#`)) {
      return `${normalizedCanonical}${value.slice(normalizedSourceCanonical.length)}`;
    }
  }

  return value;
}

function normalizeCareerJobJsonLd(
  jsonld: unknown,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string
): unknown {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, walk(nested)]));
    }

    if (typeof value === "string") {
      return replaceCanonicalValue(value, sourceCanonical, localizedCanonicalPath);
    }

    return value;
  };

  return jsonld ? walk(jsonld) : null;
}

function isIndexEligibleFromLegacyState(indexState: string | null): boolean | null {
  const normalized = String(indexState ?? "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized === "indexable" || normalized === "promotion_candidate" || normalized === "seed_index") {
    return true;
  }

  if (normalized === "noindex" || normalized === "blocked" || normalized === "excluded") {
    return false;
  }

  return null;
}

function buildCareerJobProtocolBundle(raw: CmsCareerJobApiRecord, locale: Locale | string): CareerJobProtocolBundle {
  const explicitAsset = normalizeCareerAssetMaster(raw.career_asset_master_v4_1);
  const trustManifest = normalizeCareerTrustManifest(raw.trust_manifest);
  const claimPermissions = normalizeCareerClaimPermissions(raw.claim_permissions);

  if (explicitAsset) {
    return {
      careerAsset: {
        ...explicitAsset,
        claim_permissions: claimPermissions,
      },
      trustManifest,
      claimPermissions,
    };
  }

  const slug = normalizeCareerJobSlug(String(raw.slug ?? raw.job_code ?? ""));
  const canonicalPath = slug ? buildCareerJobFrontendUrl(locale, slug) : null;
  const authoritySource = fallbackText(raw.job_code, raw.slug);
  const explicitIndexState = fallbackText(raw.index_state) || null;
  const explicitIndexEligible = normalizeBoolean(raw.index_eligible) ?? isIndexEligibleFromLegacyState(explicitIndexState);

  return {
    careerAsset: {
      envelope: {
        asset_version: "career_asset_master_v4.1",
        schema_version: "career.asset_master.schema.v4.1",
        protocol_version: "career.protocol.v1",
        generated_at: null,
        content_version: "unknown",
        data_version: "unknown",
        logic_version: "unknown",
      },
      identity: {
        occupation_uuid: normalizeIsoValue(raw.occupation_uuid),
        canonical_slug: slug,
        entity_level: "career_job_detail",
        family_uuid: null,
        parent_uuid: null,
      },
      locale_policy: {
        truth_market: null,
        display_market: normalizeLocale(locale) === "zh" ? "CN" : "US",
        crosswalk_mode: null,
        locale_warning: null,
        truth_notice_required: false,
      },
      titles: {
        canonical_en: fallbackText(raw.title) || null,
        canonical_zh: fallbackText(raw.title) || null,
        search_h1_zh: fallbackText(raw.title) || null,
        short_title_en: fallbackText(raw.title) || null,
        short_title_zh: fallbackText(raw.title) || null,
      },
      alias_index: [],
      ontology: {
        task_prototype_signature: {},
        structural_stability: null,
        task_prototype_overlap: null,
        market_semantics_gap: null,
        regulatory_divergence: null,
        toolchain_divergence: null,
        skill_gap_threshold: null,
        trust_inheritance_scope: {},
      },
      crosswalks: {
        us_soc: [],
        cn_occ: [],
        market_titles: [],
      },
      truth_layer: {
        source_refs: authoritySource ? [authoritySource] : [],
        median_pay_usd_annual: null,
        jobs_2024: null,
        projected_jobs_2034: null,
        employment_change: null,
        outlook_pct_2024_2034: null,
        outlook_description: null,
        entry_education: null,
        work_experience: null,
        on_the_job_training: null,
        ai_exposure: null,
        ai_rationale: null,
        bls_url: null,
        truth_last_reviewed_at: null,
      },
      derived_signals: {
        ai_risk_band: null,
        growth_band: null,
        pay_band: null,
        entry_barrier: null,
        human_moat_tags: [],
        work_structure_tags: [],
        collaboration_load: null,
        abstraction_level: null,
        autonomy_level: null,
        variability_level: null,
        people_intensity: null,
        closure_demand: null,
        cadence_rigidity: null,
        process_repeatability: null,
        deadline_hardness: null,
        likely_fit_types: normalizeCodeItems(raw.fit_personality_codes),
        likely_strain_types: [],
        derivation_refs: authoritySource ? [authoritySource] : [],
      },
      scoring: {
        fit_score: createUnavailableCareerScoreResult("score_result.fit_score"),
        strain_score: createUnavailableCareerScoreResult("score_result.strain_score"),
        ai_survival_score: createUnavailableCareerScoreResult("score_result.ai_survival_score"),
        mobility_score: createUnavailableCareerScoreResult("score_result.mobility_score"),
        confidence_score: createUnavailableCareerScoreResult("score_result.confidence_score"),
      },
      warnings: {
        red_flags: [],
        amber_flags: [],
        blocked_claims: claimPermissions.reason_codes,
      },
      claim_permissions: claimPermissions,
      transition_seed: {
        bridge_candidate_refs: [],
        hedge_candidate_refs: [],
        stable_upside_candidate_refs: [],
      },
      seo_contract: {
        route_family: "career_job_detail",
        canonical_path: canonicalPath,
        index_state: explicitIndexState,
        index_eligible: explicitIndexEligible,
        dataset_eligible: normalizeBoolean(raw.dataset_eligible),
        article_eligible: normalizeBoolean(raw.article_eligible),
        canonical_target: canonicalPath ? canonicalUrl(canonicalPath) : null,
      },
      trust_contract: {
        trust_manifest_ref: trustManifest ? `${trustManifest.entity_id}:${trustManifest.page_type}:${trustManifest.page_slug}` : null,
        review_required: !trustManifest,
        editorial_patch_required: !trustManifest,
        editorial_patch_status: trustManifest ? "provided" : "missing",
      },
      audit: {
        created_by: authoritySource || null,
        reviewed_by: null,
        created_at: null,
        last_substantive_update_at: trustManifest?.last_substantive_update_at ?? null,
        schema_hash: null,
      },
    },
    trustManifest,
    claimPermissions,
  };
}

function buildCareerJobRenderStateForViewModel(job: CareerJobAdapterViewModel): CareerJobRenderState {
  return getCareerJobRenderState({
    answerSurface: job.answerSurface,
    authoritySource: job.protocol.careerAsset?.audit.created_by ?? job.jobCode,
    claimPermissions: job.protocol.claimPermissions,
    trustManifest: job.protocol.trustManifest,
    careerAsset: job.protocol.careerAsset,
    hasSalaryData: Boolean(job.salaryText),
    hasOutlookData: Boolean(job.outlookText),
    hasFitData:
      job.fitPersonalityItems.length > 0 ||
      job.mbtiPrimary.length > 0 ||
      job.mbtiSecondary.length > 0 ||
      Object.values(job.riasecVector).some((value) => value !== null),
  });
}

export function mapFrontendLocaleToCareerApiLocale(locale: Locale | string): "en" | "zh-CN" {
  return toApiLocale(locale);
}

export function normalizeCareerJobSlug(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

export function buildCareerJobFrontendUrl(locale: Locale | string, slug: string): string {
  return localizedPath(`/career/jobs/${normalizeCareerJobSlug(slug)}`, normalizeLocale(locale));
}

export function adaptCareerJobListItem(raw: CmsCareerJobApiRecord, locale: Locale | string): CareerJobListItem | null {
  const slug = normalizeCareerJobSlug(String(raw.slug ?? raw.job_code ?? ""));
  const title = fallbackText(raw.title);

  if (!slug || !title) {
    return null;
  }

  return {
    slug,
    title,
    summary: fallbackText(raw.excerpt, raw.subtitle),
    salaryText: normalizeSalaryText(raw.salary, locale),
    href: buildCareerJobFrontendUrl(locale, slug),
  };
}

export function adaptCareerJobDetail(
  raw: CmsCareerJobApiRecord | null,
  options: {
    locale: Locale | string;
    sections?: CmsCareerJobApiSection[];
    seoMeta?: CmsCareerJobApiSeoMeta;
  }
): CareerJobAdapterViewModel | null {
  if (!raw) {
    return null;
  }

  const slug = normalizeCareerJobSlug(String(raw.slug ?? raw.job_code ?? ""));
  const title = fallbackText(raw.title);

  if (!slug || !title) {
    return null;
  }

  const workContents = normalizeWorkContents(raw.work_contents);
  const skills = normalizeSkills(raw.skills);
  const fitPersonalityItems = normalizeCodeItems(raw.fit_personality_codes);
  const protocol = buildCareerJobProtocolBundle(raw, options.locale);
  const sections = Array.isArray(options.sections)
    ? options.sections
        .map(normalizeSection)
        .filter((section): section is CareerJobSectionViewModel => section !== null)
        .filter((section) => section.isEnabled)
        .sort((left, right) => left.sortOrder - right.sortOrder)
    : [];

  const job: CareerJobAdapterViewModel = {
    id: typeof raw.id === "number" ? raw.id : null,
    orgId: typeof raw.org_id === "number" ? raw.org_id : 0,
    jobCode: fallbackText(raw.job_code, slug),
    slug,
    locale: fallbackText(raw.locale, mapFrontendLocaleToCareerApiLocale(options.locale)),
    title,
    summary: fallbackText(raw.excerpt, raw.subtitle),
    industrySlug: fallbackText(raw.industry_slug),
    industryLabel: fallbackText(raw.industry_label),
    heroKicker: fallbackText(raw.hero_kicker, raw.industry_label),
    heroQuote: fallbackText(raw.hero_quote),
    coverImageUrl: normalizeIsoValue(raw.cover_image_url),
    workContents,
    skills,
    salaryText: normalizeSalaryText(raw.salary, options.locale),
    outlookText: normalizeOutlookText(raw.outlook),
    growthPathItems: normalizeGrowthPath(raw.growth_path),
    fitPersonalityItems,
    mbtiPrimary: normalizeCodeItems(raw.mbti_primary_codes),
    mbtiSecondary: normalizeCodeItems(raw.mbti_secondary_codes),
    riasecVector: normalizeRiasecVector(raw.riasec_profile),
    bodyMarkdown: String(raw.body_md ?? ""),
    bodyHtml: String(raw.body_html ?? ""),
    sections,
    seoMeta: normalizeCareerJobSeoMeta(options.seoMeta ?? raw.seo_meta ?? null),
    landingSurface: null,
    answerSurface: null,
    renderState: {
      careerDataStatus: "trust_limited",
      canRenderSalarySurface: false,
      canRenderOutlookSurface: false,
      canRenderFitSurface: false,
      canRenderAnswerSurface: false,
      canRenderStructuredData: false,
      canIndexPage: false,
      missingFields: ["career_job_protocol_pending"],
    },
    protocol,
    status: fallbackText(raw.status),
    isPublic: Boolean(raw.is_public),
    isIndexable: Boolean(raw.is_indexable),
    publishedAt: normalizeIsoValue(raw.published_at),
    updatedAt: normalizeIsoValue(raw.updated_at),
  };

  job.renderState = buildCareerJobRenderStateForViewModel(job);

  return job;
}

export function adaptCareerJobSeoPayload(
  raw: CmsCareerJobSeoApiResponse | null,
  locale: Locale | string,
  slug: string
): CareerJobSeoViewModel | null {
  if (!raw) {
    return null;
  }

  const canonicalPath = buildCareerJobFrontendUrl(locale, slug);

  return {
    meta: {
      title: fallbackText(raw.meta?.title),
      description: fallbackText(raw.meta?.description),
      canonical: canonicalUrl(canonicalPath),
      alternates: {
        en: canonicalUrl(buildCareerJobFrontendUrl("en", slug)),
        "zh-CN": canonicalUrl(buildCareerJobFrontendUrl("zh", slug)),
      },
      og: {
        title: fallbackText(raw.meta?.og?.title, raw.meta?.title),
        description: fallbackText(raw.meta?.og?.description, raw.meta?.description),
        image: normalizeIsoValue(raw.meta?.og?.image),
        type: fallbackText(raw.meta?.og?.type, "article"),
      },
      twitter: {
        card: fallbackText(raw.meta?.twitter?.card, "summary_large_image"),
        title: fallbackText(raw.meta?.twitter?.title, raw.meta?.title),
        description: fallbackText(raw.meta?.twitter?.description, raw.meta?.description),
        image: normalizeIsoValue(raw.meta?.twitter?.image ?? raw.meta?.og?.image),
      },
      robots: fallbackText(raw.meta?.robots, "index,follow"),
    },
    jsonld: normalizeCareerJobJsonLd(raw.jsonld ?? null, raw.meta?.canonical, canonicalPath),
    surface: normalizeSeoSurface(raw.seo_surface_v1 ?? null),
  };
}

export async function listCareerJobsFromCms(options: { locale: Locale | string }): Promise<CareerJobListItem[]> {
  const query = buildQuery({
    locale: mapFrontendLocaleToCareerApiLocale(options.locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerJobListApiResponse>(`/v0.5/career-jobs${query}`, {
      locale: options.locale,
      skipAuth: true,
      ...PUBLIC_API_CACHE_OPTIONS,
    });

    return Array.isArray(response.items)
      ? response.items
          .filter((item) => matchesRequestedLocale(fallbackText(item.locale, "en"), options.locale))
          .map((item) => adaptCareerJobListItem(item, options.locale))
          .filter((item): item is CareerJobListItem => item !== null)
      : [];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getCareerJobFromCmsBySlug(options: {
  slug: string;
  locale: Locale | string;
}): Promise<CareerJobAdapterViewModel | null> {
  const normalizedSlug = normalizeCareerJobSlug(options.slug);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: mapFrontendLocaleToCareerApiLocale(options.locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerJobDetailApiResponse>(
      `/v0.5/career-jobs/${encodeURIComponent(normalizedSlug)}${query}`,
      {
        locale: options.locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    const job = adaptCareerJobDetail(response.job ?? null, {
      locale: options.locale,
      sections: response.sections,
      seoMeta: response.seo_meta ?? null,
    });

    if (job) {
      job.landingSurface = normalizeLandingSurface(response.landing_surface_v1 ?? null);
      job.answerSurface = normalizeAnswerSurface(response.answer_surface_v1 ?? null);
      job.renderState = buildCareerJobRenderStateForViewModel(job);
    }

    return job && matchesRequestedLocale(job.locale, options.locale) ? job : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getCareerJobSeoFromCmsBySlug(options: {
  slug: string;
  locale: Locale | string;
}): Promise<CareerJobSeoViewModel | null> {
  const normalizedSlug = normalizeCareerJobSlug(options.slug);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: mapFrontendLocaleToCareerApiLocale(options.locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerJobSeoApiResponse>(
      `/v0.5/career-jobs/${encodeURIComponent(normalizedSlug)}/seo${query}`,
      {
        locale: options.locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    return adaptCareerJobSeoPayload(response, options.locale, normalizedSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
