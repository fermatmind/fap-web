import { buildCareerAttributionPayload } from "@/lib/career/attribution";
import type { AnalyticsProperties } from "@/lib/analytics";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { appendAttributionParamsToHref, type AttributionParams } from "@/lib/tracking/attribution";

export const CAREER_DISPLAY_SURFACE_VERSION = "display_surface_v1" as const;
export const CAREER_DISPLAY_TEMPLATE_VERSION = "v4.2" as const;
export const CAREER_DISPLAY_ACTORS_SLUG = "actors" as const;
export const CAREER_DISPLAY_RIASEC_TEST_SLUG = "holland-career-interest-test-riasec" as const;

export const CAREER_DISPLAY_FORBIDDEN_FIELDS = [
  "release_gate",
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

export type CareerDisplaySurfaceViewModel = {
  surfaceVersion: typeof CAREER_DISPLAY_SURFACE_VERSION;
  templateVersion: typeof CAREER_DISPLAY_TEMPLATE_VERSION;
  assetType: typeof DISPLAY_ASSET_TYPE;
  assetRole: typeof DISPLAY_ASSET_ROLE;
  status: typeof READY_STATUS;
  locale: Locale;
  subject: {
    canonicalSlug: typeof CAREER_DISPLAY_ACTORS_SLUG;
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
  cta: {
    label: string;
    href: string;
    testSlug: typeof CAREER_DISPLAY_RIASEC_TEST_SLUG;
    targetAction: "start_riasec_test";
    eventPayload: AnalyticsProperties;
  };
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

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => normalizeString(item)).filter((item): item is string => Boolean(item)))];
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

  return isRecord(content) ? content : null;
}

function normalizeCta(value: unknown): CareerDisplayCta | null {
  const raw = isRecord(value) ? value : null;
  const label = normalizeString(raw?.label);
  const href = normalizeString(raw?.href);

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

function normalizeHero(value: unknown): CareerDisplayHeroViewModel | null {
  const raw = isRecord(value) ? value : null;
  const h1 = normalizeString(raw?.h1);
  const quickAnswer = normalizeString(raw?.quick_answer);
  const primaryCta = normalizeCta(raw?.primary_cta);

  if (!raw || !h1 || !quickAnswer || !primaryCta) {
    return null;
  }

  const secondary = isRecord(raw?.secondary_cta) ? raw.secondary_cta : null;
  const secondaryLabel = normalizeString(secondary?.label);
  const secondaryHrefs = normalizeStringArray(secondary?.hrefs).filter(isKnownTestHref);

  return {
    h1,
    ...(normalizeString(raw?.subtitle) ? { subtitle: normalizeString(raw.subtitle) ?? undefined } : {}),
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

  return Object.entries(raw)
    .map(([key, item]) => {
      if (!isRecord(item)) {
        return null;
      }

      const label = normalizeString(item.label);
      if (!label) {
        return null;
      }

      return {
        key,
        label,
        ...(normalizeString(item.url) ? { url: normalizeString(item.url) ?? undefined } : {}),
        ...(normalizeString(item.usage) ? { usage: normalizeString(item.usage) ?? undefined } : {}),
        ...(normalizeString(item.captured_at) ? { capturedAt: normalizeString(item.captured_at) ?? undefined } : {}),
        ...(normalizeString(item.expires_at) ? { expiresAt: normalizeString(item.expires_at) ?? undefined } : {}),
      };
    })
    .filter((source): source is CareerDisplaySource => source !== null);
}

function normalizeBoundaryNotice(root: Record<string, unknown>, locale: Locale): string[] {
  const support = isRecord(root.support_components) ? root.support_components : {};
  const boundary = isRecord(support.boundary_notice) ? support.boundary_notice : {};
  return normalizeStringArray(boundary[locale]);
}

function normalizeReviewValidity(root: Record<string, unknown>): CareerDisplayReviewValidity | null {
  const support = isRecord(root.support_components) ? root.support_components : {};
  const review = isRecord(support.review_validity) ? support.review_validity : null;
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
  attributionParams = {},
}: {
  locale: Locale;
  landingPath: string;
  attributionParams?: AttributionParams;
}): string {
  const href = localizedPath(`/tests/${CAREER_DISPLAY_RIASEC_TEST_SLUG}`, locale);
  const searchParams = new URLSearchParams({
    entry_surface: "career_job_detail",
    source_page_type: "career_job_detail",
    target_action: "start_riasec_test",
    test_slug: CAREER_DISPLAY_RIASEC_TEST_SLUG,
    subject_kind: "job_slug",
    subject_key: CAREER_DISPLAY_ACTORS_SLUG,
    landing_path: landingPath,
  });

  return appendAttributionParamsToHref(`${href}?${searchParams.toString()}`, attributionParams);
}

export function buildCareerDisplayCtaAttribution({
  locale,
  landingPath,
}: {
  locale: Locale;
  landingPath: string;
}) {
  return buildCareerAttributionPayload({
    locale,
    entrySurface: "career_job_detail",
    sourcePageType: "career_job_detail",
    targetAction: "start_riasec_test",
    landingPath,
    routeFamily: "job_detail",
    subjectKind: "job_slug",
    subjectKey: CAREER_DISPLAY_ACTORS_SLUG,
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
  attributionParams?: AttributionParams
): CareerDisplaySurfaceViewModel | null {
  const locale = normalizeCareerDisplayLocale(localeInput);
  const surfaceRoot = resolveSurfaceRoot(rawDisplaySurface);
  const root = isRecord(stripCareerDisplayForbiddenFields(surfaceRoot)) ? stripCareerDisplayForbiddenFields(surfaceRoot) : null;

  if (!locale || !isRecord(root)) {
    return null;
  }

  const asset = isRecord(root.asset) ? root.asset : {};
  const subject = isRecord(root.subject) ? root.subject : {};
  const surfaceVersion = normalizeString(root.surface_version);
  const templateVersion = normalizeString(root.template_version) ?? normalizeString(asset.template_version);
  const assetType = normalizeString(root.asset_type) ?? normalizeString(asset.asset_type);
  const assetRole = normalizeString(root.asset_role) ?? normalizeString(asset.asset_role);
  const status = normalizeString(root.status);
  const canonicalSlug = normalizeString(subject.canonical_slug);
  const componentOrder = normalizeComponentOrder(root.component_order);
  const page = resolveLocalizedPage(root, locale);
  const hero = normalizeHero(page?.hero);
  const sections = normalizeSections(page?.sections);
  const path = normalizeString(page?.path) ?? localizedPath(`/career/jobs/${CAREER_DISPLAY_ACTORS_SLUG}`, locale);

  if (
    surfaceVersion !== CAREER_DISPLAY_SURFACE_VERSION ||
    templateVersion !== CAREER_DISPLAY_TEMPLATE_VERSION ||
    assetType !== DISPLAY_ASSET_TYPE ||
    assetRole !== DISPLAY_ASSET_ROLE ||
    status !== READY_STATUS ||
    canonicalSlug !== CAREER_DISPLAY_ACTORS_SLUG ||
    !componentOrder ||
    !page ||
    !hero
  ) {
    return null;
  }

  const faqSection = sections.find((section) => section.component === "CareerFAQBlock");
  const faqItems = faqSection?.faqItems ?? [];
  const ctaHref = buildCareerDisplayCtaHref({
    locale,
    landingPath: path,
    attributionParams,
  });

  return {
    surfaceVersion: CAREER_DISPLAY_SURFACE_VERSION,
    templateVersion: CAREER_DISPLAY_TEMPLATE_VERSION,
    assetType: DISPLAY_ASSET_TYPE,
    assetRole: DISPLAY_ASSET_ROLE,
    status: READY_STATUS,
    locale,
    subject: {
      canonicalSlug: CAREER_DISPLAY_ACTORS_SLUG,
      path,
      title: hero.h1,
      ...(hero.subtitle ? { subtitle: hero.subtitle } : {}),
    },
    componentOrder,
    hero,
    sections,
    faqItems,
    sources: normalizeSources(root.sources),
    relatedNextPages: buildRelatedNextPages(locale, hero),
    boundaryNotice: normalizeBoundaryNotice(root, locale),
    reviewValidity: normalizeReviewValidity(root),
    cta: {
      label: hero.primaryCta.label,
      href: ctaHref,
      testSlug: CAREER_DISPLAY_RIASEC_TEST_SLUG,
      targetAction: "start_riasec_test",
      eventPayload: buildCareerDisplayCtaAttribution({ locale, landingPath: path }),
    },
  };
}
