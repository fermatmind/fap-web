import { buildCareerAttributionPayload } from "@/lib/career/attribution";
import type { AnalyticsProperties } from "@/lib/analytics";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { appendAttributionParamsToHref, type AttributionParams } from "@/lib/tracking/attribution";

export const CAREER_DISPLAY_SURFACE_VERSION = "display.surface.v1" as const;
export const CAREER_DISPLAY_TEMPLATE_VERSION = "v4.2" as const;
export const CAREER_DISPLAY_ACTORS_SLUG = "actors" as const;
export const CAREER_DISPLAY_MANUAL_HOLD_SLUGS = ["software-developers"] as const;
export const CAREER_DISPLAY_RIASEC_TEST_SLUG = "holland-career-interest-test-riasec" as const;

export const CAREER_DISPLAY_FORBIDDEN_FIELDS = [
  "release_gate",
  "release_gates",
  "qa_risk",
  "admin_review_state",
  "tracking_json",
  "raw_ai_exposure_score",
] as const;

export const CAREER_DISPLAY_COMPONENT_ORDER = [
  "breadcrumb",
  "hero",
  "fermat_decision_card",
  "primary_cta",
  "career_snapshot_primary_locale",
  "career_snapshot_secondary_locale",
  "fit_decision_checklist",
  "riasec_fit_block",
  "personality_fit_block",
  "definition_block",
  "responsibilities_block",
  "work_context_block",
  "market_signal_card",
  "adjacent_career_comparison_table",
  "ai_impact_table",
  "career_risk_cards",
  "contract_project_risk_block",
  "next_steps_block",
  "faq_block",
  "related_next_pages",
  "source_card",
  "review_validity_card",
  "boundary_notice",
  "final_cta",
] as const;

const READY_STATUS = "ready_for_pilot";
const DISPLAY_ASSET_TYPE = "career_job_public_display";
const DISPLAY_ASSET_ROLE = "formal_pilot_master";
const ALLOWED_COMPONENT_ORDER = new Set<string>(CAREER_DISPLAY_COMPONENT_ORDER);
const FORBIDDEN_FIELD_SET = new Set<string>(CAREER_DISPLAY_FORBIDDEN_FIELDS);
const CAREER_DISPLAY_MANUAL_HOLD_SLUG_SET = new Set<string>(CAREER_DISPLAY_MANUAL_HOLD_SLUGS);

export type CareerDisplayComponentId = (typeof CAREER_DISPLAY_COMPONENT_ORDER)[number];
export type CareerDisplayLocaleInput = Locale | "zh-CN";

export type CareerDisplayCta = {
  label: string;
  href: string;
  prompt?: string;
};

export type CareerDisplayHeroViewModel = {
  h1: string;
  subtitle?: string;
  quickAnswer: string;
  primaryCta: CareerDisplayCta;
  secondaryCta?: {
    label: string;
    hrefs: string[];
  };
};

export type CareerDisplayTableRow = [string, string] | [string, string, string];

export type CareerDisplayChecklistItem = {
  title: string;
  question?: string;
  note?: string;
};

export type CareerDisplayStep = {
  title: string;
  items: string[];
};

export type CareerDisplayFAQItem = {
  question: string;
  answer: string;
};

export type CareerDisplaySection = {
  id: string;
  component: string;
  heading: string;
  body?: string | string[];
  intro?: string;
  sourceKey?: string;
  sourceKeys?: string[];
  rows?: CareerDisplayTableRow[];
  items?: string[];
  fitTitle?: string;
  fitItems?: string[];
  cautionTitle?: string;
  cautionItems?: string[];
  checks?: Array<string | CareerDisplayChecklistItem>;
  cta?: CareerDisplayCta;
  profile?: string[];
  answer?: string;
  traits?: string[];
  contexts?: string[];
  entryTable?: CareerDisplayTableRow[];
  signalMeta?: CareerDisplayTableRow[];
  keywords?: string[];
  interpretation?: string;
  linkedinNote?: string;
  score?: string;
  question?: string;
  fermatView?: string;
  careerRisks?: string[];
  caveat?: string;
  warning?: string;
  note?: string;
  steps?: CareerDisplayStep[];
  faqItems?: CareerDisplayFAQItem[];
};

export type CareerDisplaySource = {
  key: string;
  label: string;
  url?: string;
  usage?: string;
  capturedAt?: string;
  expiresAt?: string;
};

export type CareerDisplayRelatedPage = {
  label: string;
  href?: string;
  routeKind: "test" | "job" | "guide";
};

export type CareerDisplayReviewValidity = {
  lastReviewed?: string;
  nextReviewDue?: string;
  marketSignalExpiry?: string;
};

export type CareerDisplayIntegrityState = "full" | "provisional" | "restricted" | "blocked";

export type CareerDisplayEvidenceBasis = {
  salary: "official" | "proxy" | "missing";
  aiExposure: "central_score" | "missing" | "blocked";
  marketSignal: "sample" | "official" | "missing";
  crosswalk: "direct" | "trust_inheritance" | "proxy" | "missing";
};

export type CareerDisplayClaimPermissions = {
  integrityState: CareerDisplayIntegrityState;
  allowStrongClaim: boolean;
  allowAiStrategy: boolean;
  allowSalaryComparison: boolean;
  allowMarketSignal: boolean;
  allowLocalProxyWage: boolean;
  blockedClaims: string[];
  warnings: string[];
  evidenceBasis: CareerDisplayEvidenceBasis;
};

export type CareerDisplaySurfaceViewModel = {
  surfaceVersion: typeof CAREER_DISPLAY_SURFACE_VERSION;
  templateVersion: typeof CAREER_DISPLAY_TEMPLATE_VERSION;
  assetType: typeof DISPLAY_ASSET_TYPE;
  assetRole: typeof DISPLAY_ASSET_ROLE;
  status: typeof READY_STATUS;
  locale: Locale;
  subject: {
    canonicalSlug: string;
    path: string;
    title: string;
    subtitle?: string;
  };
  componentOrder: CareerDisplayComponentId[];
  hero: CareerDisplayHeroViewModel;
  sections: CareerDisplaySection[];
  faqItems: CareerDisplayFAQItem[];
  sources: CareerDisplaySource[];
  relatedNextPages: CareerDisplayRelatedPage[];
  boundaryNotice: string[];
  reviewValidity: CareerDisplayReviewValidity | null;
  claimPermissions: CareerDisplayClaimPermissions;
  cta: {
    label: string;
    href: string;
    testSlug: typeof CAREER_DISPLAY_RIASEC_TEST_SLUG;
    targetAction: "start_riasec_test";
    eventPayload: AnalyticsProperties;
  };
};

type ComponentKeyedSectionDefinition = {
  component: CareerDisplaySection["component"];
  fallbackHeading: Record<Locale, string>;
};

const COMPONENT_KEYED_SECTION_DEFINITIONS: Partial<Record<CareerDisplayComponentId, ComponentKeyedSectionDefinition>> = {
  fermat_decision_card: {
    component: "FermatDecisionCard",
    fallbackHeading: { zh: "费马快速判断", en: "Fermat Quick Fit" },
  },
  career_snapshot_primary_locale: {
    component: "CareerSnapshotCard",
    fallbackHeading: { zh: "职业快照：中国大陆参考", en: "Career Snapshot: U.S. Reference" },
  },
  career_snapshot_secondary_locale: {
    component: "CareerSnapshotCard",
    fallbackHeading: { zh: "海外参考", en: "Secondary Locale Reference" },
  },
  fit_decision_checklist: {
    component: "FitDecisionChecklist",
    fallbackHeading: { zh: "如何判断是否适合", en: "How to Decide Whether This Career Fits You" },
  },
  riasec_fit_block: {
    component: "RIASECFitBlock",
    fallbackHeading: { zh: "RIASEC 兴趣匹配", en: "RIASEC Fit" },
  },
  personality_fit_block: {
    component: "PersonalityFitBlock",
    fallbackHeading: { zh: "人格匹配", en: "Personality Fit" },
  },
  definition_block: {
    component: "DefinitionBlock",
    fallbackHeading: { zh: "职业定义", en: "What Does This Career Do?" },
  },
  responsibilities_block: {
    component: "ResponsibilitiesBlock",
    fallbackHeading: { zh: "核心职责", en: "Core Responsibilities" },
  },
  work_context_block: {
    component: "WorkContextBlock",
    fallbackHeading: { zh: "工作场景", en: "Work Context" },
  },
  market_signal_card: {
    component: "MarketSignalCard",
    fallbackHeading: { zh: "市场信号", en: "What Skills Does the Market Signal?" },
  },
  adjacent_career_comparison_table: {
    component: "AdjacentCareerComparisonTable",
    fallbackHeading: { zh: "相邻职业比较", en: "Adjacent Career Comparison" },
  },
  ai_impact_table: {
    component: "AIImpactTable",
    fallbackHeading: { zh: "AI 影响", en: "Will AI Replace This Career?" },
  },
  career_risk_cards: {
    component: "CareerRiskCards",
    fallbackHeading: { zh: "职业风险", en: "Career Risks" },
  },
  contract_project_risk_block: {
    component: "ContractRiskBlock",
    fallbackHeading: { zh: "合同与项目风险", en: "Contract and Project Risks" },
  },
  next_steps_block: {
    component: "NextStepsBlock",
    fallbackHeading: { zh: "下一步", en: "What Should You Prepare Next?" },
  },
  faq_block: {
    component: "CareerFAQBlock",
    fallbackHeading: { zh: "常见问题", en: "FAQ" },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function containsCjk(value: string): boolean {
  return /[\u3400-\u9fff\uf900-\ufaff]/u.test(value);
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => normalizeString(item)).filter((item): item is string => Boolean(item)))];
}

function isSafeDisplayInternalHref(href: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//") || href.includes("\\")) {
    return false;
  }

  try {
    const parsed = new URL(href, "https://fermatmind.com");
    if (parsed.origin !== "https://fermatmind.com") {
      return false;
    }

    return parsed.pathname.startsWith("/tests/") || /^\/(?:en|zh)\/tests\//.test(parsed.pathname);
  } catch {
    return false;
  }
}

function normalizeSafeDisplayHref(value: unknown): string | null {
  const href = normalizeString(value);
  return href && isSafeDisplayInternalHref(href) ? href : null;
}

function normalizeSafeSourceUrl(value: unknown): string | null {
  const raw = normalizeString(value);
  if (!raw || raw.includes("\\")) {
    return null;
  }

  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function normalizeStringFromValue(value: unknown): string | null {
  const direct = normalizeString(value);
  if (direct) {
    return direct;
  }

  if (!isRecord(value)) {
    return null;
  }

  return (
    normalizeString(value.explanation) ??
    normalizeString(value.body) ??
    normalizeString(value.summary) ??
    normalizeString(value.text) ??
    null
  );
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeOneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const normalized = normalizeString(value);
  return normalized && (allowed as readonly string[]).includes(normalized) ? (normalized as T) : fallback;
}

function containsSchemaType(value: unknown, schemaType: string): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => containsSchemaType(item, schemaType));
  }

  if (!isRecord(value)) {
    return false;
  }

  if (normalizeString(value["@type"]) === schemaType) {
    return true;
  }

  return Object.values(value).some((item) => containsSchemaType(item, schemaType));
}

function isValidCareerDisplaySlug(value: string | null): value is string {
  return Boolean(value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && !CAREER_DISPLAY_MANUAL_HOLD_SLUG_SET.has(value));
}

export function normalizeCareerDisplayLocale(locale: unknown): Locale | null {
  const normalized = normalizeString(locale);

  if (normalized === "zh-CN" || normalized === "zh") {
    return "zh";
  }

  return normalized === "en" ? "en" : null;
}

export function stripCareerDisplayForbiddenFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripCareerDisplayForbiddenFields);
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, item]) => {
    if (!FORBIDDEN_FIELD_SET.has(key)) {
      acc[key] = stripCareerDisplayForbiddenFields(item);
    }

    return acc;
  }, {});
}

function resolveSurfaceRoot(raw: unknown): Record<string, unknown> | null {
  const root = isRecord(raw) ? raw : null;
  if (!root) {
    return null;
  }

  if (isRecord(root.display_surface_v1)) {
    return root.display_surface_v1;
  }

  if (isRecord(root.data)) {
    if (isRecord(root.data.display_surface_v1)) {
      return root.data.display_surface_v1;
    }

    return root.data;
  }

  return root;
}

function normalizeComponentOrder(value: unknown): CareerDisplayComponentId[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const order = value.map((item) => normalizeString(item));
  if (order.some((item) => !item || !ALLOWED_COMPONENT_ORDER.has(item))) {
    return null;
  }

  const deduped = [...new Set(order)] as CareerDisplayComponentId[];
  return deduped.length === order.length ? deduped : null;
}

function resolveLocalizedPage(root: Record<string, unknown>, locale: Locale): Record<string, unknown> | null {
  const page = isRecord(root.page) ? root.page : null;
  if (!page) {
    return null;
  }

  if (isRecord(page[locale])) {
    return page[locale];
  }

  const content = isRecord(page.content) ? page.content : null;
  if (content && isRecord(content[locale])) {
    return content[locale];
  }

  const pageLocale = normalizeCareerDisplayLocale(page.locale);
  if (content && pageLocale && pageLocale !== locale) {
    return null;
  }

  return isRecord(content) ? content : null;
}

function normalizeCta(value: unknown): CareerDisplayCta | null {
  const raw = isRecord(value) ? value : null;
  const label = normalizeString(raw?.label);
  const href = normalizeSafeDisplayHref(raw?.href);

  if (!label || !href) {
    return null;
  }

  return {
    label,
    href,
    ...(normalizeString(raw?.prompt) ? { prompt: normalizeString(raw?.prompt) ?? undefined } : {}),
  };
}

function normalizeRows(value: unknown): CareerDisplayTableRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(Array.isArray)
    .map((row) => row.map((item) => normalizeString(item)).filter((item): item is string => Boolean(item)))
    .filter((row) => row.length >= 2)
    .map((row) => (row.length >= 3 ? [row[0], row[1], row[2]] : [row[0], row[1]]) as CareerDisplayTableRow);
}

function normalizeChecklist(value: unknown): Array<string | CareerDisplayChecklistItem> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return normalizeString(item);
      }

      if (!isRecord(item)) {
        return null;
      }

      const title = normalizeString(item.title);
      if (!title) {
        return null;
      }

      return {
        title,
        ...(normalizeString(item.question) ? { question: normalizeString(item.question) ?? undefined } : {}),
        ...(normalizeString(item.note) ? { note: normalizeString(item.note) ?? undefined } : {}),
      };
    })
    .filter((item): item is string | CareerDisplayChecklistItem => Boolean(item));
}

function normalizeSteps(value: unknown): CareerDisplayStep[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const title = normalizeString(item.title);
      const items = normalizeStringArray(item.items);
      return title && items.length > 0 ? { title, items } : null;
    })
    .filter((item): item is CareerDisplayStep => Boolean(item));
}

function normalizeFaqItems(value: unknown): CareerDisplayFAQItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const question = normalizeString(item.question);
      const answer = normalizeString(item.answer);
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is CareerDisplayFAQItem => Boolean(item));
}

function normalizeSection(value: unknown): CareerDisplaySection | null {
  const raw = isRecord(value) ? value : null;
  const id = normalizeString(raw?.id);
  const component = normalizeString(raw?.component);
  const heading = normalizeString(raw?.heading);

  if (!raw || !id || !component || !heading) {
    return null;
  }

  return {
    id,
    component,
    heading,
    ...(Array.isArray(raw?.body) ? { body: normalizeStringArray(raw.body) } : {}),
    ...(normalizeString(raw?.body) ? { body: normalizeString(raw.body) ?? undefined } : {}),
    ...(normalizeString(raw?.intro) ? { intro: normalizeString(raw.intro) ?? undefined } : {}),
    ...(normalizeString(raw?.source_key) ? { sourceKey: normalizeString(raw.source_key) ?? undefined } : {}),
    ...(normalizeStringArray(raw?.source_keys).length > 0 ? { sourceKeys: normalizeStringArray(raw.source_keys) } : {}),
    ...(normalizeRows(raw?.rows).length > 0 ? { rows: normalizeRows(raw.rows) } : {}),
    ...(normalizeStringArray(raw?.items).length > 0 ? { items: normalizeStringArray(raw.items) } : {}),
    ...(normalizeString(raw?.fit_title) ? { fitTitle: normalizeString(raw.fit_title) ?? undefined } : {}),
    ...(normalizeStringArray(raw?.fit_items).length > 0 ? { fitItems: normalizeStringArray(raw.fit_items) } : {}),
    ...(normalizeString(raw?.caution_title) ? { cautionTitle: normalizeString(raw.caution_title) ?? undefined } : {}),
    ...(normalizeStringArray(raw?.caution_items).length > 0 ? { cautionItems: normalizeStringArray(raw.caution_items) } : {}),
    ...(normalizeChecklist(raw?.checks).length > 0 ? { checks: normalizeChecklist(raw.checks) } : {}),
    ...(normalizeCta(raw?.cta) ? { cta: normalizeCta(raw.cta) ?? undefined } : {}),
    ...(normalizeStringArray(raw?.profile).length > 0 ? { profile: normalizeStringArray(raw.profile) } : {}),
    ...(normalizeString(raw?.answer) ? { answer: normalizeString(raw.answer) ?? undefined } : {}),
    ...(normalizeStringArray(raw?.traits).length > 0 ? { traits: normalizeStringArray(raw.traits) } : {}),
    ...(normalizeStringArray(raw?.contexts).length > 0 ? { contexts: normalizeStringArray(raw.contexts) } : {}),
    ...(normalizeRows(raw?.entry_table).length > 0 ? { entryTable: normalizeRows(raw.entry_table) } : {}),
    ...(normalizeRows(raw?.signal_meta).length > 0 ? { signalMeta: normalizeRows(raw.signal_meta) } : {}),
    ...(normalizeStringArray(raw?.keywords).length > 0 ? { keywords: normalizeStringArray(raw.keywords) } : {}),
    ...(normalizeString(raw?.interpretation) ? { interpretation: normalizeString(raw.interpretation) ?? undefined } : {}),
    ...(normalizeString(raw?.linkedin_note) ? { linkedinNote: normalizeString(raw.linkedin_note) ?? undefined } : {}),
    ...(normalizeString(raw?.score) ? { score: normalizeString(raw.score) ?? undefined } : {}),
    ...(normalizeString(raw?.question) ? { question: normalizeString(raw.question) ?? undefined } : {}),
    ...(normalizeString(raw?.fermat_view) ? { fermatView: normalizeString(raw.fermat_view) ?? undefined } : {}),
    ...(normalizeStringArray(raw?.career_risks).length > 0 ? { careerRisks: normalizeStringArray(raw.career_risks) } : {}),
    ...(normalizeString(raw?.caveat) ? { caveat: normalizeString(raw.caveat) ?? undefined } : {}),
    ...(normalizeString(raw?.warning) ? { warning: normalizeString(raw.warning) ?? undefined } : {}),
    ...(normalizeString(raw?.note) ? { note: normalizeString(raw.note) ?? undefined } : {}),
    ...(normalizeSteps(raw?.steps).length > 0 ? { steps: normalizeSteps(raw.steps) } : {}),
    ...(normalizeFaqItems(raw?.items).length > 0 && component === "CareerFAQBlock"
      ? { faqItems: normalizeFaqItems(raw.items) }
      : {}),
  };
}

function normalizeSections(value: unknown): CareerDisplaySection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizeSection).filter((section): section is CareerDisplaySection => section !== null);
}

function normalizeComponentKeyedSection(
  componentId: CareerDisplayComponentId,
  value: unknown,
  locale: Locale
): CareerDisplaySection | null {
  if (value === undefined || value === null) {
    return null;
  }

  const definition = COMPONENT_KEYED_SECTION_DEFINITIONS[componentId];
  if (!definition) {
    return null;
  }

  const block = isRecord(value) ? value : {};
  const heading = normalizeString(block.heading) ?? normalizeString(block.title) ?? definition.fallbackHeading[locale];
  const base = {
    id: normalizeString(block.id) ?? componentId,
    component: definition.component,
    heading,
  };

  if (componentId === "fermat_decision_card") {
    const summary = normalizeString(block.summary);
    const caveat = normalizeString(block.caveat);
    return normalizeSection({
      ...base,
      fit_title: locale === "zh" ? "适合信号" : "Fit signal",
      fit_items: summary ? [summary] : [],
      caution_title: locale === "zh" ? "使用边界" : "Boundary",
      caution_items: caveat ? [caveat] : [],
    });
  }

  if (componentId === "career_snapshot_secondary_locale") {
    return normalizeSection({
      ...base,
      body: normalizeString(block.limitation),
      rows: normalizeString(block.salary_data_type)
        ? [[locale === "zh" ? "薪资数据类型" : "Salary data type", normalizeString(block.salary_data_type)]]
        : [],
    });
  }

  if (componentId === "definition_block") {
    return normalizeSection({
      ...base,
      body: normalizeString(value),
    });
  }

  if (componentId === "responsibilities_block") {
    return normalizeSection({
      ...base,
      items: normalizeStringArray(value),
    });
  }

  if (componentId === "work_context_block") {
    return normalizeSection({
      ...base,
      contexts: normalizeStringArray(block.target_queries),
      rows: normalizeStringArray(block.search_intent_type).map((item) => [
        locale === "zh" ? "搜索意图" : "Search intent",
        item,
      ]),
    });
  }

  if (componentId === "market_signal_card") {
    const snapshot = isRecord(block.snapshot) ? block.snapshot : {};
    return normalizeSection({
      ...base,
      body: normalizeString(snapshot.body),
      signal_meta: normalizeRows(snapshot.rows),
      note: block.sample_only_notice ? (locale === "zh" ? "样本信号，不代表总体统计。" : "Example only, not market-wide statistics.") : null,
      source_key: normalizeString(snapshot.source_key),
    });
  }

  if (componentId === "adjacent_career_comparison_table") {
    return normalizeSection({
      ...base,
      rows: normalizeRows(value),
    });
  }

  if (componentId === "ai_impact_table") {
    return normalizeSection({
      ...base,
      score: normalizeString(block.score_normalized) ?? normalizeString(block.label),
      body: normalizeStringFromValue(block.explanation),
      fermat_view: normalizeString(block.source),
    });
  }

  if (componentId === "career_risk_cards") {
    return normalizeSection({
      ...base,
      career_risks: normalizeString(block.caveat) ? [normalizeString(block.caveat)] : [],
      caveat: normalizeString(block.caveat),
    });
  }

  const normalizedValue = isRecord(value) ? { ...value, ...base } : base;
  return normalizeSection(normalizedValue);
}

function normalizeDisplaySections(
  page: Record<string, unknown>,
  componentOrder: CareerDisplayComponentId[],
  locale: Locale
): CareerDisplaySection[] {
  const sections = normalizeSections(page.sections);
  if (sections.length > 0) {
    return sections;
  }

  return componentOrder
    .map((componentId) => normalizeComponentKeyedSection(componentId, page[componentId], locale))
    .filter((section): section is CareerDisplaySection => section !== null);
}

function normalizeHero(value: unknown, primaryCtaValue?: unknown, secondaryCtaValue?: unknown): CareerDisplayHeroViewModel | null {
  const raw = isRecord(value) ? value : null;
  const h1 = normalizeString(raw?.h1);
  const quickAnswer = normalizeString(raw?.quick_answer);
  const primaryCta = normalizeCta(raw?.primary_cta) ?? normalizeCta(primaryCtaValue);

  if (!raw || !h1 || !quickAnswer || !primaryCta) {
    return null;
  }

  const secondary = isRecord(raw?.secondary_cta) ? raw.secondary_cta : isRecord(secondaryCtaValue) ? secondaryCtaValue : null;
  const secondaryLabel = normalizeString(secondary?.label);
  const secondaryHrefs = normalizeStringArray(secondary?.hrefs).filter(isKnownTestHref);
  const fallbackTitle = normalizeString(raw?.title);
  const subtitle = normalizeString(raw?.subtitle) ?? (fallbackTitle && fallbackTitle !== h1 ? fallbackTitle : null);

  return {
    h1,
    ...(subtitle ? { subtitle } : {}),
    quickAnswer,
    primaryCta,
    ...(secondaryLabel && secondaryHrefs.length > 0
      ? { secondaryCta: { label: secondaryLabel, hrefs: secondaryHrefs } }
      : {}),
  };
}

function normalizeSources(value: unknown): CareerDisplaySource[] {
  const raw = isRecord(value) ? value : null;
  if (!raw) {
    return [];
  }

  const entries = Array.isArray(raw.references)
    ? raw.references.map((item, index) => [String(index), item] as const)
    : Object.entries(raw);

  return entries
    .map(([key, item]) => {
      if (!isRecord(item)) {
        return null;
      }

      const label = normalizeString(item.label);
      if (!label) {
        return null;
      }

      return {
        key: normalizeString(item.key) ?? key,
        label,
        ...(normalizeSafeSourceUrl(item.url) ? { url: normalizeSafeSourceUrl(item.url) ?? undefined } : {}),
        ...(normalizeString(item.usage) ? { usage: normalizeString(item.usage) ?? undefined } : {}),
        ...(normalizeString(item.captured_at) ? { capturedAt: normalizeString(item.captured_at) ?? undefined } : {}),
        ...(normalizeString(item.expires_at) ? { expiresAt: normalizeString(item.expires_at) ?? undefined } : {}),
      };
    })
    .filter((source): source is CareerDisplaySource => source !== null);
}

function normalizeBoundaryNotice(root: Record<string, unknown>, locale: Locale, page?: Record<string, unknown>): string[] {
  const support = isRecord(root.support_components) ? root.support_components : {};
  const boundary = isRecord(support.boundary_notice) ? support.boundary_notice : {};
  const supportNotices = normalizeStringArray(boundary[locale]);
  if (supportNotices.length > 0) {
    return supportNotices;
  }

  const pageBoundary = isRecord(page?.boundary_notice) ? page.boundary_notice : {};
  return normalizeStringArray(pageBoundary.notices);
}

function normalizeReviewValidity(root: Record<string, unknown>, page?: Record<string, unknown>): CareerDisplayReviewValidity | null {
  const support = isRecord(root.support_components) ? root.support_components : {};
  const review = isRecord(support.review_validity)
    ? support.review_validity
    : isRecord(page?.review_validity_card)
      ? page.review_validity_card
      : null;
  if (!review) {
    return null;
  }

  return {
    ...(normalizeString(review.last_reviewed) ? { lastReviewed: normalizeString(review.last_reviewed) ?? undefined } : {}),
    ...(normalizeString(review.next_review_due) ? { nextReviewDue: normalizeString(review.next_review_due) ?? undefined } : {}),
    ...(normalizeString(review.market_signal_expiry)
      ? { marketSignalExpiry: normalizeString(review.market_signal_expiry) ?? undefined }
      : {}),
  };
}

function normalizeClaimPermissions(value: unknown): CareerDisplayClaimPermissions {
  const raw = isRecord(value) ? value : null;
  if (!raw) {
    return {
      integrityState: "restricted",
      allowStrongClaim: false,
      allowAiStrategy: false,
      allowSalaryComparison: false,
      allowMarketSignal: false,
      allowLocalProxyWage: false,
      blockedClaims: ["missing_claim_permissions"],
      warnings: ["claim_permissions missing; restricted claim rendering applied"],
      evidenceBasis: {
        salary: "missing",
        aiExposure: "missing",
        marketSignal: "missing",
        crosswalk: "missing",
      },
    };
  }

  const evidence = isRecord(raw.evidence_basis) ? raw.evidence_basis : {};

  return {
    integrityState: normalizeOneOf(raw.integrity_state, ["full", "provisional", "restricted", "blocked"] as const, "restricted"),
    allowStrongClaim: normalizeBoolean(raw.allow_strong_claim),
    allowAiStrategy: normalizeBoolean(raw.allow_ai_strategy),
    allowSalaryComparison: normalizeBoolean(raw.allow_salary_comparison),
    allowMarketSignal: normalizeBoolean(raw.allow_market_signal),
    allowLocalProxyWage: normalizeBoolean(raw.allow_local_proxy_wage),
    blockedClaims: normalizeStringArray(raw.blocked_claims),
    warnings: normalizeStringArray(raw.warnings),
    evidenceBasis: {
      salary: normalizeOneOf(evidence.salary, ["official", "proxy", "missing"] as const, "missing"),
      aiExposure: normalizeOneOf(evidence.ai_exposure, ["central_score", "missing", "blocked"] as const, "missing"),
      marketSignal: normalizeOneOf(evidence.market_signal, ["sample", "official", "missing"] as const, "missing"),
      crosswalk: normalizeOneOf(evidence.crosswalk, ["direct", "trust_inheritance", "proxy", "missing"] as const, "missing"),
    },
  };
}

function isKnownTestHref(href: string): boolean {
  return [
    "/tests/holland-career-interest-test-riasec",
    "/tests/mbti-personality-test-16-personality-types",
    "/tests/big-five-personality-test-ocean-model",
    "/en/tests/holland-career-interest-test-riasec",
    "/en/tests/mbti-personality-test-16-personality-types",
    "/en/tests/big-five-personality-test-ocean-model",
    "/zh/tests/holland-career-interest-test-riasec",
    "/zh/tests/mbti-personality-test-16-personality-types",
    "/zh/tests/big-five-personality-test-ocean-model",
  ].some((path) => href === path);
}

function localizeKnownTestHref(locale: Locale, path: string): string {
  if (path.startsWith(`/${locale}/`)) {
    return path;
  }

  if (path.startsWith("/en/") || path.startsWith("/zh/")) {
    return localizedPath(path.replace(/^\/(en|zh)/, ""), locale);
  }

  return localizedPath(path, locale);
}

function localizeDisplayCtaHref(locale: Locale, href: string): string {
  const candidateHrefs = href
    .split("|")
    .map((candidate) => candidate.trim())
    .filter(Boolean);

  const localizedCandidate =
    candidateHrefs.find((candidate) => isKnownTestHref(candidate) && candidate.startsWith(`/${locale}/`)) ??
    candidateHrefs.find(isKnownTestHref);

  if (localizedCandidate) {
    return localizeKnownTestHref(locale, localizedCandidate);
  }

  return isKnownTestHref(href) ? localizeKnownTestHref(locale, href) : href;
}

function localizeDisplayCtaLabel(locale: Locale, label: string): string {
  if (locale === "zh") {
    return label;
  }

  return containsCjk(label) ? "Measure my career interests" : label;
}

function buildRelatedNextPages(locale: Locale, hero: CareerDisplayHeroViewModel): CareerDisplayRelatedPage[] {
  const related = [
    {
      label: locale === "zh" ? "霍兰德职业兴趣测试（RIASEC）" : "Holland Career Interest Test (RIASEC)",
      href: localizeKnownTestHref(locale, hero.primaryCta.href),
      routeKind: "test" as const,
    },
    {
      label: locale === "zh" ? "MBTI 性格测试" : "MBTI personality test",
      href: localizedPath("/tests/mbti-personality-test-16-personality-types", locale),
      routeKind: "test" as const,
    },
    {
      label: locale === "zh" ? "Big Five 大五人格测试" : "Big Five personality test",
      href: localizedPath("/tests/big-five-personality-test-ocean-model", locale),
      routeKind: "test" as const,
    },
  ];

  return related.filter((page) => page.href && isKnownTestHref(page.href));
}

export function buildCareerDisplayCtaHref({
  locale,
  landingPath,
  subjectSlug = CAREER_DISPLAY_ACTORS_SLUG,
  attributionParams = {},
}: {
  locale: Locale;
  landingPath: string;
  subjectSlug?: string;
  attributionParams?: AttributionParams;
}): string {
  const href = localizedPath(`/tests/${CAREER_DISPLAY_RIASEC_TEST_SLUG}`, locale);
  const searchParams = new URLSearchParams({
    entry_surface: "career_job_detail",
    source_page_type: "career_job_detail",
    target_action: "start_riasec_test",
    test_slug: CAREER_DISPLAY_RIASEC_TEST_SLUG,
    subject_kind: "job_slug",
    subject_key: subjectSlug,
    landing_path: landingPath,
  });

  return appendAttributionParamsToHref(`${href}?${searchParams.toString()}`, attributionParams);
}

export function buildCareerDisplayCtaAttribution({
  locale,
  landingPath,
  subjectSlug = CAREER_DISPLAY_ACTORS_SLUG,
}: {
  locale: Locale;
  landingPath: string;
  subjectSlug?: string;
}) {
  return buildCareerAttributionPayload({
    locale,
    entrySurface: "career_job_detail",
    sourcePageType: "career_job_detail",
    targetAction: "start_riasec_test",
    landingPath,
    routeFamily: "job_detail",
    subjectKind: "job_slug",
    subjectKey: subjectSlug,
    queryMode: "non_query",
  });
}

export function buildCareerDisplayFAQPageJsonLd(surface: Pick<CareerDisplaySurfaceViewModel, "faqItems"> | null) {
  if (!surface || surface.faqItems.length === 0) {
    return null;
  }

  return buildFAQPageJsonLd(surface.faqItems);
}

export function adaptCareerDisplaySurface(
  rawDisplaySurface: unknown,
  localeInput: CareerDisplayLocaleInput,
  attributionParams?: AttributionParams,
  expectedSlug?: string,
  titleFallback?: string | null
): CareerDisplaySurfaceViewModel | null {
  const locale = normalizeCareerDisplayLocale(localeInput);
  const surfaceRoot = resolveSurfaceRoot(rawDisplaySurface);
  const root = isRecord(stripCareerDisplayForbiddenFields(surfaceRoot)) ? stripCareerDisplayForbiddenFields(surfaceRoot) : null;

  if (!locale || !isRecord(root) || containsSchemaType(root, "Product")) {
    return null;
  }

  const asset = isRecord(root.asset) ? root.asset : {};
  const subject = isRecord(root.subject) ? root.subject : {};
  const surfaceVersion = normalizeString(root.surface_version);
  const assetVersion = normalizeString(root.asset_version) ?? normalizeString(asset.asset_version);
  const templateVersion = normalizeString(root.template_version) ?? normalizeString(asset.template_version);
  const assetType = normalizeString(root.asset_type) ?? normalizeString(asset.asset_type);
  const assetRole = normalizeString(root.asset_role) ?? normalizeString(asset.asset_role);
  const status = normalizeString(root.status);
  const canonicalSlug = normalizeString(subject.canonical_slug);
  const assetSlug = normalizeString(asset.slug);
  const normalizedExpectedSlug = normalizeString(expectedSlug);
  const componentOrder = normalizeComponentOrder(root.component_order);
  const page = resolveLocalizedPage(root, locale);
  const hero = normalizeHero(page?.hero, page?.primary_cta ?? page?.final_cta, page?.secondary_cta);
  const sections = page && componentOrder ? normalizeDisplaySections(page, componentOrder, locale) : [];
  const path =
    normalizeString(page?.path) ??
    localizedPath(`/career/jobs/${canonicalSlug ?? CAREER_DISPLAY_ACTORS_SLUG}`, locale);

  if (
    surfaceVersion !== CAREER_DISPLAY_SURFACE_VERSION ||
    assetVersion !== CAREER_DISPLAY_TEMPLATE_VERSION ||
    templateVersion !== CAREER_DISPLAY_TEMPLATE_VERSION ||
    assetType !== DISPLAY_ASSET_TYPE ||
    (assetRole !== null && assetRole !== DISPLAY_ASSET_ROLE) ||
    status !== READY_STATUS ||
    !isValidCareerDisplaySlug(canonicalSlug) ||
    (assetSlug !== null && assetSlug !== canonicalSlug) ||
    (normalizedExpectedSlug !== null && canonicalSlug !== normalizedExpectedSlug) ||
    !componentOrder ||
    componentOrder.length !== CAREER_DISPLAY_COMPONENT_ORDER.length ||
    !page ||
    !hero ||
    sections.length === 0 ||
    !isRecord(root.claim_permissions)
  ) {
    return null;
  }

  const faqSection = sections.find((section) => section.component === "CareerFAQBlock");
  const faqItems = faqSection?.faqItems ?? [];
  const ctaHref = buildCareerDisplayCtaHref({
    locale,
    landingPath: path,
    subjectSlug: canonicalSlug,
    attributionParams,
  });
  const heroH1 = locale === "en" && containsCjk(hero.h1)
    ? normalizeString(titleFallback) ?? humanizeSlug(canonicalSlug)
    : hero.h1;
  const heroSubtitle = hero.subtitle && !(locale === "en" && containsCjk(hero.subtitle)) ? hero.subtitle : undefined;
  const localizedHero: CareerDisplayHeroViewModel = {
    ...hero,
    h1: heroH1,
    ...(heroSubtitle ? { subtitle: heroSubtitle } : {}),
    ...(!heroSubtitle ? { subtitle: undefined } : {}),
    primaryCta: {
      ...hero.primaryCta,
      label: localizeDisplayCtaLabel(locale, hero.primaryCta.label),
      href: localizeDisplayCtaHref(locale, hero.primaryCta.href),
    },
  };

  return {
    surfaceVersion: CAREER_DISPLAY_SURFACE_VERSION,
    templateVersion: CAREER_DISPLAY_TEMPLATE_VERSION,
    assetType: DISPLAY_ASSET_TYPE,
    assetRole: DISPLAY_ASSET_ROLE,
    status: READY_STATUS,
    locale,
    subject: {
      canonicalSlug,
      path,
      title: localizedHero.h1,
      ...(localizedHero.subtitle ? { subtitle: localizedHero.subtitle } : {}),
    },
    componentOrder,
    hero: localizedHero,
    sections,
    faqItems,
    sources: normalizeSources(root.sources),
    relatedNextPages: buildRelatedNextPages(locale, localizedHero),
    boundaryNotice: normalizeBoundaryNotice(root, locale, page),
    reviewValidity: normalizeReviewValidity(root, page),
    claimPermissions: normalizeClaimPermissions(root.claim_permissions),
    cta: {
      label: localizedHero.primaryCta.label,
      href: ctaHref,
      testSlug: CAREER_DISPLAY_RIASEC_TEST_SLUG,
      targetAction: "start_riasec_test",
      eventPayload: buildCareerDisplayCtaAttribution({ locale, landingPath: path, subjectSlug: canonicalSlug }),
    },
  };
}
