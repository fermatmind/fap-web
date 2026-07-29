import { cache } from "react";
import {
  getTestLookup,
  type Test,
  type TestLookup,
} from "@/lib/content";
import { normalizeSupportedScaleCode, resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import type { Locale } from "@/lib/i18n/locales";
import {
  isRetryablePublicReadError,
  PublicReadError,
  toPublicReadError,
} from "@/lib/public-content/readError";
import {
  loadTestLandingCmsEnrichment,
  type TestLandingCmsEnrichment,
} from "@/lib/tests/testLandingCmsEnrichment";
import {
  clearTestLandingLastKnownGood,
  readTestLandingLastKnownGood,
  writeTestLandingLastKnownGood,
} from "@/lib/tests/testLandingLastKnownGood";

const TEST_LANDING_LKG_SCHEMA_VERSION = "v1";
const TEST_LANDING_LOOKUP_CONTRACT_VERSION = "v0.3";
const DEFAULT_TEST_LANDING_LKG_MAX_AGE_MS = 6 * 60 * 60 * 1_000;

type TestLandingAuthoritySnapshot = {
  contractVersion: typeof TEST_LANDING_LOOKUP_CONTRACT_VERSION;
  locale: Locale;
  slug: string;
  test: Test;
  lookup: TestLookup;
};

export type TestLandingData = TestLandingAuthoritySnapshot & {
  source: "fresh" | "last-known-good";
  cmsLandingSurface: TestLandingCmsEnrichment["value"];
  cmsSource: TestLandingCmsEnrichment["source"];
};

type TestLandingDependencies = {
  lookup?: typeof getTestLookup;
  loadCms?: typeof loadTestLandingCmsEnrichment;
  lkgMaxAgeMs?: number;
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInt(value: unknown): number {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : 0;
}

function lkgMaxAgeMs(): number {
  const configuredSeconds = Number(process.env.TEST_LANDING_LKG_MAX_AGE_SECONDS);
  const configuredMs = Number.isFinite(configuredSeconds) && configuredSeconds > 0
    ? Math.floor(configuredSeconds) * 1_000
    : DEFAULT_TEST_LANDING_LKG_MAX_AGE_MS;

  return Math.min(24 * 60 * 60 * 1_000, configuredMs);
}

function lkgKey(locale: Locale, slug: string): string {
  return [
    "test-landing-lookup-lkg",
    TEST_LANDING_LKG_SCHEMA_VERSION,
    TEST_LANDING_LOOKUP_CONTRACT_VERSION,
    locale,
    slug,
  ].join(":");
}

function localeMatches(responseLocale: string, locale: Locale): boolean {
  const normalized = responseLocale.trim().toLowerCase();
  return locale === "zh"
    ? normalized === "zh" || normalized === "zh-cn"
    : normalized === "en";
}

function localizedContent(
  lookup: TestLookup,
  locale: Locale,
): Record<string, unknown> {
  return toRecord(toRecord(lookup.content_i18n_json)[locale]);
}

function questionCountFromAuthority(
  lookup: TestLookup,
  catalog: Record<string, unknown>,
): number {
  const catalogCount = positiveInt(catalog.questions_count);
  if (catalogCount > 0) {
    return catalogCount;
  }

  const forms = Array.isArray(lookup.forms) ? lookup.forms.map(toRecord) : [];
  const defaultFormCode = toStringValue(toRecord(lookup.capabilities).default_form_code);
  const selected = forms.find((form) => toStringValue(form.form_code) === defaultFormCode)
    ?? forms[0];
  return positiveInt(selected?.question_count);
}

function titleI18nFromAuthority(lookup: TestLookup): Record<string, string> | undefined {
  const content = toRecord(lookup.content_i18n_json);
  const titles = Object.fromEntries(
    Object.entries(content)
      .map(([key, value]) => [key, toStringValue(toRecord(value).title)])
      .filter((entry): entry is [string, string] => entry[1].length > 0),
  );
  return Object.keys(titles).length > 0 ? titles : undefined;
}

function buildAuthoritySnapshot(
  lookup: TestLookup,
  locale: Locale,
  slug: string,
): TestLandingAuthoritySnapshot {
  const primarySlug = resolveCanonicalSlug(lookup.primary_slug);
  const content = localizedContent(lookup, locale);
  const catalog = toRecord(content.catalog);
  const title = toStringValue(content.title) || toStringValue(lookup.seo_title);
  const description = toStringValue(content.description) || toStringValue(lookup.seo_description);
  const questionsCount = questionCountFromAuthority(lookup, catalog);
  const timeMinutes = positiveInt(catalog.time_minutes);
  const scaleCode = normalizeSupportedScaleCode(lookup.scale_code) ?? lookup.scale_code;

  if (
    lookup.ok !== true
    || lookup.is_public !== true
    || primarySlug !== slug
    || !localeMatches(lookup.locale, locale)
    || !title
    || !description
    || questionsCount <= 0
    || timeMinutes <= 0
    || !scaleCode
    || Object.keys(toRecord(lookup.landing_surface_v1)).length === 0
  ) {
    throw new PublicReadError({ kind: "contract", cause: lookup });
  }

  return {
    contractVersion: TEST_LANDING_LOOKUP_CONTRACT_VERSION,
    locale,
    slug,
    test: {
      title,
      title_i18n: titleI18nFromAuthority(lookup),
      slug,
      description,
      cover_image: toStringValue(catalog.cover_image) || toStringValue(lookup.og_image_url),
      questions_count: questionsCount,
      time_minutes: timeMinutes,
      scale_code: scaleCode,
      is_public: true,
      is_indexable: lookup.is_indexable,
    },
    lookup,
  };
}

function isUsableSnapshot(value: unknown): value is TestLandingAuthoritySnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const snapshot = value as TestLandingAuthoritySnapshot;
  return snapshot.contractVersion === TEST_LANDING_LOOKUP_CONTRACT_VERSION
    && (snapshot.locale === "en" || snapshot.locale === "zh")
    && resolveCanonicalSlug(snapshot.slug) === snapshot.slug
    && snapshot.test?.slug === snapshot.slug
    && snapshot.test?.is_public === true
    && toStringValue(snapshot.test?.title).length > 0
    && toStringValue(snapshot.test?.description).length > 0
    && positiveInt(snapshot.test?.questions_count) > 0
    && positiveInt(snapshot.test?.time_minutes) > 0
    && snapshot.lookup?.ok === true
    && snapshot.lookup?.is_public === true
    && resolveCanonicalSlug(snapshot.lookup?.primary_slug) === snapshot.slug
    && localeMatches(snapshot.lookup?.locale ?? "", snapshot.locale);
}

export async function loadTestLandingDataUncached(
  locale: Locale,
  requestedSlug: string,
  dependencies: TestLandingDependencies = {},
): Promise<TestLandingData | null> {
  const slug = resolveCanonicalSlug(requestedSlug);
  if (!slug) {
    return null;
  }

  const key = lkgKey(locale, slug);
  const loadCms = dependencies.loadCms ?? loadTestLandingCmsEnrichment;
  const cmsPromise = loadCms(slug, locale);

  try {
    const lookup = await (dependencies.lookup ?? getTestLookup)(slug, locale);
    if (!lookup) {
      await clearTestLandingLastKnownGood(key);
      return null;
    }

    const snapshot = buildAuthoritySnapshot(lookup, locale, slug);
    await writeTestLandingLastKnownGood({
      key,
      value: snapshot,
      isUsable: isUsableSnapshot,
    });
    const cms = await cmsPromise;

    return {
      ...snapshot,
      source: "fresh",
      cmsLandingSurface: cms.value,
      cmsSource: cms.source,
    };
  } catch (error) {
    if (!isRetryablePublicReadError(error)) {
      if (toPublicReadError(error).kind === "contract") {
        await clearTestLandingLastKnownGood(key);
      }
      throw error;
    }

    const snapshot = await readTestLandingLastKnownGood({
      key,
      maxAgeMs: dependencies.lkgMaxAgeMs ?? lkgMaxAgeMs(),
      isUsable: isUsableSnapshot,
    });
    if (!snapshot) {
      throw error;
    }
    const cms = await cmsPromise;

    return {
      ...snapshot,
      source: "last-known-good",
      cmsLandingSurface: cms.value,
      cmsSource: cms.source,
    };
  }
}

type TestLandingLoader = (
  locale: Locale,
  canonicalSlug: string,
) => Promise<TestLandingData | null>;

export function createTestLandingRequestLoader(
  load: TestLandingLoader = loadTestLandingDataUncached,
  memoize: typeof cache = cache,
): TestLandingLoader {
  return memoize(
    async (locale: Locale, canonicalSlug: string) =>
      load(locale, canonicalSlug),
  );
}

export const loadTestLandingData = createTestLandingRequestLoader();
