import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import {
  getCmsLandingSurfaceWithLastKnownGood,
  type CmsLandingSurface,
} from "@/lib/cms/landing-surfaces";
import type { Locale } from "@/lib/i18n/locales";
import {
  readTestLandingLastKnownGood,
  writeTestLandingLastKnownGood,
} from "@/lib/tests/testLandingLastKnownGood";

export type TestDetailCmsLandingSurfacePayload = {
  seo_title?: string | null;
  seo_description?: string | null;
  h1_or_hero_title?: string | null;
  hero_copy?: string | null;
  primary_cta_label?: string | null;
  aeo_answer_block?: string | null;
  methodology_boundary_note?: string | null;
  approved_internal_link_targets?: unknown;
  claim_risk_notes?: unknown;
};

export type TestLandingCmsEnrichment = {
  value: CmsLandingSurface<TestDetailCmsLandingSurfacePayload> | null;
  source: "fresh" | "last-known-good" | "unavailable";
};

const TEST_DETAIL_CMS_LANDING_SURFACE_KEYS: Partial<Record<string, string>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: "test_detail_mbti_personality_test_16_personality_types",
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: "test_detail_big_five_personality_test_ocean_model",
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: "test_detail_holland_career_interest_test_riasec",
};

const CMS_ENRICHMENT_CONTRACT_VERSION = "v1";
const DEFAULT_CMS_ENRICHMENT_BUDGET_MS = 1_500;
const MAX_CMS_ENRICHMENT_BUDGET_MS = 2_000;
const DEFAULT_CMS_LKG_MAX_AGE_MS = 6 * 60 * 60 * 1_000;
const TIMED_OUT = Symbol("test-landing-cms-enrichment-timeout");

type CmsLoader = (
  surfaceKey: string,
  locale: Locale,
) => ReturnType<
  typeof getCmsLandingSurfaceWithLastKnownGood<TestDetailCmsLandingSurfacePayload>
>;

function positiveEnvNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export function testLandingCmsEnrichmentBudgetMs(): number {
  return Math.min(
    MAX_CMS_ENRICHMENT_BUDGET_MS,
    positiveEnvNumber("TEST_LANDING_CMS_ENRICHMENT_TIMEOUT_MS", DEFAULT_CMS_ENRICHMENT_BUDGET_MS),
  );
}

export function testLandingCmsLkgMaxAgeMs(): number {
  return Math.min(
    24 * 60 * 60 * 1_000,
    positiveEnvNumber(
      "TEST_LANDING_CMS_LKG_MAX_AGE_SECONDS",
      DEFAULT_CMS_LKG_MAX_AGE_MS / 1_000,
    ) * 1_000,
  );
}

function cmsLkgKey(surfaceKey: string, locale: Locale, slug: string): string {
  return [
    "test-landing-cms-lkg",
    CMS_ENRICHMENT_CONTRACT_VERSION,
    locale,
    slug,
    surfaceKey,
  ].join(":");
}

function isUsableCmsSurface(
  value: unknown,
): value is CmsLandingSurface<TestDetailCmsLandingSurfacePayload> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const surface = value as CmsLandingSurface<TestDetailCmsLandingSurfacePayload>;
  return typeof surface.surfaceKey === "string"
    && surface.surfaceKey.length > 0
    && (surface.locale === "en" || surface.locale === "zh")
    && surface.status === "published"
    && surface.isPublic === true
    && Boolean(surface.payloadJson)
    && typeof surface.payloadJson === "object"
    && !Array.isArray(surface.payloadJson);
}

async function withinBudget<T>(promise: Promise<T>, budgetMs: number): Promise<T | typeof TIMED_OUT> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<typeof TIMED_OUT>((resolve) => {
        timer = setTimeout(() => resolve(TIMED_OUT), budgetMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export async function loadTestLandingCmsEnrichment(
  slug: string,
  locale: Locale,
  dependencies: {
    load?: CmsLoader;
    budgetMs?: number;
    lkgMaxAgeMs?: number;
  } = {},
): Promise<TestLandingCmsEnrichment> {
  const surfaceKey = TEST_DETAIL_CMS_LANDING_SURFACE_KEYS[slug];
  if (!surfaceKey) {
    return { value: null, source: "unavailable" };
  }

  const key = cmsLkgKey(surfaceKey, locale, slug);
  const maxAgeMs = dependencies.lkgMaxAgeMs ?? testLandingCmsLkgMaxAgeMs();
  const isUsableForRequest = (
    value: unknown,
  ): value is CmsLandingSurface<TestDetailCmsLandingSurfacePayload> =>
    isUsableCmsSurface(value)
    && value.surfaceKey === surfaceKey
    && value.locale === locale;
  const load: CmsLoader = dependencies.load
    ?? ((key, selectedLocale) =>
      getCmsLandingSurfaceWithLastKnownGood<TestDetailCmsLandingSurfacePayload>(
        key,
        selectedLocale,
      ));
  const freshPromise = load(surfaceKey, locale)
    .then(async (result) => {
      const updatedAtMs = Date.parse(result.updatedAt);
      const staleWithinSafetyWindow = result.source !== "last-known-good"
        || (Number.isFinite(updatedAtMs) && Date.now() - updatedAtMs <= maxAgeMs);
      if (!isUsableForRequest(result.value) || !staleWithinSafetyWindow) {
        return null;
      }
      if (result.source === "fresh") {
        await writeTestLandingLastKnownGood({
          key,
          value: result.value,
          isUsable: isUsableForRequest,
        });
      }
      return {
        value: result.value,
        source: result.source,
      } satisfies Exclude<TestLandingCmsEnrichment, { source: "unavailable" }>;
    })
    .catch(() => null);

  const within = await withinBudget(
    freshPromise,
    dependencies.budgetMs ?? testLandingCmsEnrichmentBudgetMs(),
  );
  if (within !== TIMED_OUT && within !== null) {
    return within;
  }

  const lkg = await readTestLandingLastKnownGood({
    key,
    maxAgeMs,
    isUsable: isUsableForRequest,
  });
  return lkg
    ? { value: lkg, source: "last-known-good" }
    : { value: null, source: "unavailable" };
}
