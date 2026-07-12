import {
  listEnneagramLlmsCandidates,
  type EnneagramLlmsCandidate,
} from "@/lib/cms/personality-public-content-assets";
import { isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
} from "@/lib/personality/enneagramPublicRoutes";

const EXPECTED_TOTAL = 116;
const EXPECTED_PER_LOCALE = 58;
const EXPECTED_ENTITY_COUNTS = new Map<string, number>([
  ["hub", 2],
  ["center", 6],
  ["core_type", 18],
  ["wing", 36],
  ["instinctual_subtype", 54],
]);

let exactCohortLkg: string[] | null = null;

function identity(candidate: EnneagramLlmsCandidate): string {
  return `${candidate.locale}|${candidate.entityType}|${candidate.code}`;
}

function expectedIdentityPaths(): Map<string, string> {
  const expected = new Map<string, string>();
  for (const locale of ["en", "zh"] as const) {
    const apiLocale = locale === "zh" ? "zh-CN" : "en";
    for (const entry of ENNEAGRAM_PUBLIC_ROUTE_ENTRIES) {
      expected.set(
        `${apiLocale}|${entry.entityType}|${entry.code}`,
        buildEnneagramPublicContentPath(locale, entry)
      );
    }
  }

  return expected;
}

const EXPECTED_IDENTITY_PATHS = expectedIdentityPaths();

function hasSafeExactCanonical(candidate: EnneagramLlmsCandidate): boolean {
  const expectedPath = EXPECTED_IDENTITY_PATHS.get(identity(candidate));
  const path = candidate.canonicalPath;

  return (
    Boolean(expectedPath) &&
    path === expectedPath &&
    path.startsWith(candidate.locale === "en" ? "/en/personality/enneagram" : "/zh/personality/enneagram") &&
    !path.includes("?") &&
    !path.includes("#") &&
    !isSharedDiscoverabilityDeniedPath(path) &&
    shouldIncludeInSitemap(path, { indexEligible: true, indexState: "indexed" })
  );
}

function hasExactIdentityAndEntityCounts(candidates: EnneagramLlmsCandidate[]): boolean {
  if (candidates.length !== EXPECTED_TOTAL) {
    return false;
  }

  const identities = new Set(candidates.map(identity));
  const paths = new Set(candidates.map((candidate) => candidate.canonicalPath));
  if (identities.size !== EXPECTED_TOTAL || paths.size !== EXPECTED_TOTAL) {
    return false;
  }

  for (const locale of ["en", "zh-CN"] as const) {
    if (candidates.filter((candidate) => candidate.locale === locale).length !== EXPECTED_PER_LOCALE) {
      return false;
    }
  }

  for (const [entityType, expectedCount] of EXPECTED_ENTITY_COUNTS) {
    if (candidates.filter((candidate) => candidate.entityType === entityType).length !== expectedCount) {
      return false;
    }
  }

  return [...EXPECTED_IDENTITY_PATHS.keys()].every((expectedIdentity) => identities.has(expectedIdentity));
}

function hasSafePublishedState(candidate: EnneagramLlmsCandidate): boolean {
  return (
    candidate.isPublic &&
    candidate.launchState === "published" &&
    candidate.robots === "index,follow" &&
    candidate.indexEligible &&
    candidate.sitemapEligible &&
    hasSafeExactCanonical(candidate)
  );
}

export function selectExactEnneagramLlmsPaths(candidates: EnneagramLlmsCandidate[]): string[] {
  if (!hasExactIdentityAndEntityCounts(candidates) || !candidates.every(hasSafePublishedState)) {
    return [];
  }

  const eligibleCount = candidates.filter((candidate) => candidate.llmsEligible).length;
  if (eligibleCount === 0) {
    return [];
  }
  if (eligibleCount !== EXPECTED_TOTAL) {
    return [];
  }

  return candidates.map((candidate) => candidate.canonicalPath).sort((left, right) => left.localeCompare(right));
}

export async function listEnneagramLlmsPaths(options: { signal?: AbortSignal } = {}): Promise<string[]> {
  let candidates: EnneagramLlmsCandidate[];
  try {
    const [en, zh] = await Promise.all([
      listEnneagramLlmsCandidates("en", options),
      listEnneagramLlmsCandidates("zh", options),
    ]);
    candidates = [...en, ...zh];
  } catch {
    return exactCohortLkg ? [...exactCohortLkg] : [];
  }

  const selected = selectExactEnneagramLlmsPaths(candidates);
  if (selected.length === EXPECTED_TOTAL) {
    exactCohortLkg = [...selected];
    return selected;
  }

  // A successful held, partial, or invalid authority response revokes stale membership.
  exactCohortLkg = null;
  return [];
}

export function resetEnneagramLlmsSourceCacheForTests(): void {
  exactCohortLkg = null;
}
