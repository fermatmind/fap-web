import type {
  CareerFirstWaveDiscoverabilityManifestAdapter,
  CareerFirstWaveDiscoverabilityState,
  CareerFirstWaveLaunchTier,
  CareerFirstWaveLaunchTierSummaryAdapter,
} from "@/lib/career/adapters/types";
import { isCareerJobsQueryPage, stripLocalePrefix } from "@/lib/seo/indexingPolicy";

export const CAREER_LAUNCH_STATES = ["stable", "candidate", "hold", "noindex"] as const;

export type CareerLaunchState = (typeof CAREER_LAUNCH_STATES)[number];
export const CAREER_LAUNCH_TIER_AUTHORITY_ROUTE_KEYS = ["career_job_detail"] as const;
export type CareerLaunchTierAuthorityRouteKey = (typeof CAREER_LAUNCH_TIER_AUTHORITY_ROUTE_KEYS)[number];
export const CAREER_DISCOVERABILITY_MANIFEST_AUTHORITY_ROUTE_KEYS = [
  "career_job_detail",
  "career_family_hub_detail",
] as const;
export type CareerDiscoverabilityManifestAuthorityRouteKey =
  (typeof CAREER_DISCOVERABILITY_MANIFEST_AUTHORITY_ROUTE_KEYS)[number];

export type CareerLaunchRouteKey =
  | "career_landing"
  | "career_jobs_index"
  | "career_job_detail"
  | "career_family_hub_detail"
  | "career_recommendations_index"
  | "career_mbti_recommendation_detail"
  | "career_guides_index"
  | "career_guide_detail"
  | "career_industries_index"
  | "career_industry_detail"
  | "career_tests_index"
  | "career_legacy_slug_bridge"
  | "career_big5_recommendation_detail"
  | "career_jobs_query";

export type CareerLaunchRouteEntry = {
  key: CareerLaunchRouteKey;
  route: string;
  authorityOwner: string | readonly string[];
  rationale: string;
};

export type CareerLaunchSmokeEntry = {
  key: CareerLaunchRouteKey;
  route: string;
  launchState: CareerLaunchState;
  authorityOwner: string | readonly string[];
  renderMode: "render" | "redirect";
  canonicalMode: "self" | "backend_explicit_gate" | "base_jobs" | "legacy_redirect";
  robotsMode: "index" | "noindex" | "backend_explicit_gate" | "family_visibility_gate";
  requiresBackendExplicitGate: boolean;
  requiresLocalizedRoute: boolean;
  requiresNextStepOrPrimaryCta: boolean;
  notes: string;
};

export const CAREER_LAUNCH_POLICY_METADATA = {
  manifestVersion: "1.0.0",
  generatedFrom: "lib/career/launchPolicy.ts",
  generatedAt: "2026-04-09T00:00:00Z",
  waveName: "career-first-wave-launch",
} as const;

export const CAREER_STABLE_ROUTES = [
  {
    key: "career_landing",
    route: "/career",
    authorityOwner: [
      "editorial_local_wrapper",
      "backend_lightweight_jobs",
      "backend_lightweight_recommendations",
    ],
    rationale: "Hybrid landing is the stable public entry surface for the current Career launch.",
  },
  {
    key: "career_jobs_index",
    route: "/career/jobs",
    authorityOwner: "backend_lightweight_jobs",
    rationale: "Backend B5/B6 jobs surface is the stable public job library.",
  },
  {
    key: "career_job_detail",
    route: "/career/jobs/[slug]",
    authorityOwner: "backend_career_job_bundle",
    rationale: "Job detail routes are stable only when the backend explicit seo gate allows indexing.",
  },
  {
    key: "career_recommendations_index",
    route: "/career/recommendations",
    authorityOwner: "backend_lightweight_recommendations",
    rationale: "Recommendation index is a stable public recommendation entry surface and must not degrade into a job list.",
  },
  {
    key: "career_mbti_recommendation_detail",
    route: "/career/recommendations/mbti/[type]",
    authorityOwner: "backend_career_recommendation_bundle",
    rationale: "MBTI recommendation detail routes are stable only when the backend explicit seo gate allows indexing.",
  },
] as const satisfies readonly CareerLaunchRouteEntry[];

export const CAREER_CANDIDATE_ROUTES = [
  {
    key: "career_family_hub_detail",
    route: "/career/family/[slug]",
    authorityOwner: "backend_career_family_hub_bundle",
    rationale:
      "Family hub detail routes are backend-owned candidate surfaces and should become discoverable only when the backend exposes at least one visible child.",
  },
  {
    key: "career_guides_index",
    route: "/career/guides",
    authorityOwner: "editorial_cms_guides",
    rationale: "Guides are live editorial surfaces but not first-wave backend authority-critical routes.",
  },
  {
    key: "career_guide_detail",
    route: "/career/guides/[slug]",
    authorityOwner: "editorial_cms_guides",
    rationale: "Guide detail pages remain live editorial surfaces and should stay out of the stable launch tier.",
  },
  {
    key: "career_industries_index",
    route: "/career/industries",
    authorityOwner: "editorial_local_industries",
    rationale: "Industry hubs are reachable and indexable but not part of the backend-owned first-wave authority path.",
  },
  {
    key: "career_industry_detail",
    route: "/career/industries/[slug]",
    authorityOwner: "editorial_local_industries",
    rationale: "Industry details are live supporting surfaces and should remain candidate-tier.",
  },
  {
    key: "career_tests_index",
    route: "/career/tests",
    authorityOwner: "editorial_cta_only",
    rationale: "Career tests are live entry surfaces but not first-wave backend authority-critical routes.",
  },
] as const satisfies readonly CareerLaunchRouteEntry[];

export const CAREER_HOLD_ROUTES = [
  {
    key: "career_legacy_slug_bridge",
    route: "/career/[slug]",
    authorityOwner: "legacy_cms_redirect_bridge",
    rationale: "Legacy slug bridge remains reachable but must stay out of launch-facing exposure.",
  },
  {
    key: "career_big5_recommendation_detail",
    route: "/career/recommendations/big5/[trait]",
    authorityOwner: "backend_future_big5",
    rationale: "Big5 recommendation detail is intentionally reachable but not part of the backend-owned first-wave recommendation launch.",
  },
] as const satisfies readonly CareerLaunchRouteEntry[];

export const CAREER_NOINDEX_ROUTES = [
  {
    key: "career_jobs_query",
    route: "/career/jobs?q={query}",
    authorityOwner: "backend_conservative_search",
    rationale: "Query/result search pages must stay noindex and outside launch discoverability inventory.",
  },
] as const satisfies readonly CareerLaunchRouteEntry[];

export const CAREER_LAUNCH_MANIFEST = {
  manifest_version: CAREER_LAUNCH_POLICY_METADATA.manifestVersion,
  generated_from: CAREER_LAUNCH_POLICY_METADATA.generatedFrom,
  generated_at: CAREER_LAUNCH_POLICY_METADATA.generatedAt,
  wave_name: CAREER_LAUNCH_POLICY_METADATA.waveName,
  stable_routes: CAREER_STABLE_ROUTES,
  candidate_routes: CAREER_CANDIDATE_ROUTES,
  hold_routes: CAREER_HOLD_ROUTES,
  noindex_routes: CAREER_NOINDEX_ROUTES,
  notes: {
    stable:
      "Stable routes map to the current backend-safe entry and detail classes. Detail classes remain gated by backend explicit seo contracts.",
    candidate:
      "Candidate routes are intentionally live but not first-wave backend authority-critical and should not be promoted to stable by discoverability helpers alone.",
    hold:
      "Hold routes remain reachable or legacy but are intentionally excluded from launch-facing exposure.",
    noindex:
      "Noindex routes are excluded from launch inventory and public discoverability even when reachable.",
  },
} as const;

export const CAREER_LAUNCH_SMOKE_MATRIX = {
  manifest_version: CAREER_LAUNCH_POLICY_METADATA.manifestVersion,
  generated_from: CAREER_LAUNCH_POLICY_METADATA.generatedFrom,
  generated_at: CAREER_LAUNCH_POLICY_METADATA.generatedAt,
  wave_name: CAREER_LAUNCH_POLICY_METADATA.waveName,
  route_classes: [
    {
      key: "career_landing",
      route: "/career",
      launchState: "stable",
      authorityOwner: [
        "editorial_local_wrapper",
        "backend_lightweight_jobs",
        "backend_lightweight_recommendations",
      ],
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: true,
      notes: "Verify hybrid authority sections, search entry wiring, and stable landing exposure.",
    },
    {
      key: "career_jobs_index",
      route: "/career/jobs",
      launchState: "stable",
      authorityOwner: "backend_lightweight_jobs",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: false,
      notes: "Verify backend index rendering and conservative search entry without CMS fallback.",
    },
    {
      key: "career_job_detail",
      route: "/career/jobs/[slug]",
      launchState: "stable",
      authorityOwner: "backend_career_job_bundle",
      renderMode: "render",
      canonicalMode: "backend_explicit_gate",
      robotsMode: "backend_explicit_gate",
      requiresBackendExplicitGate: true,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: true,
      notes: "Verify detail routing, canonical path, and backend explicit gate behavior.",
    },
    {
      key: "career_recommendations_index",
      route: "/career/recommendations",
      launchState: "stable",
      authorityOwner: "backend_lightweight_recommendations",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: true,
      notes: "Verify recommendation index stays recommendation-shaped and does not flatten into job search logic.",
    },
    {
      key: "career_mbti_recommendation_detail",
      route: "/career/recommendations/mbti/[type]",
      launchState: "stable",
      authorityOwner: "backend_career_recommendation_bundle",
      renderMode: "render",
      canonicalMode: "backend_explicit_gate",
      robotsMode: "backend_explicit_gate",
      requiresBackendExplicitGate: true,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: true,
      notes: "Verify MBTI detail routing, attribution continuity, and backend explicit gate behavior.",
    },
    {
      key: "career_family_hub_detail",
      route: "/career/family/[slug]",
      launchState: "candidate",
      authorityOwner: "backend_career_family_hub_bundle",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "family_visibility_gate",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: false,
      notes:
        "Verify family identity renders, blocked rows stay counts-only, and zero-visible pages remain valid but stay out of discoverability.",
    },
    {
      key: "career_guides_index",
      route: "/career/guides",
      launchState: "candidate",
      authorityOwner: "editorial_cms_guides",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: false,
      notes: "Verify guides remain candidate-tier editorial surfaces.",
    },
    {
      key: "career_guide_detail",
      route: "/career/guides/[slug]",
      launchState: "candidate",
      authorityOwner: "editorial_cms_guides",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: false,
      notes: "Verify guide detail remains candidate-tier and does not become backend authority.",
    },
    {
      key: "career_industries_index",
      route: "/career/industries",
      launchState: "candidate",
      authorityOwner: "editorial_local_industries",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: false,
      notes: "Verify industries remain candidate-tier local editorial surfaces.",
    },
    {
      key: "career_industry_detail",
      route: "/career/industries/[slug]",
      launchState: "candidate",
      authorityOwner: "editorial_local_industries",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: false,
      notes: "Verify industry detail remains candidate-tier and does not drift into backend authority.",
    },
    {
      key: "career_tests_index",
      route: "/career/tests",
      launchState: "candidate",
      authorityOwner: "editorial_cta_only",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: true,
      notes: "Verify career tests remain candidate-tier CTA-led entry surfaces.",
    },
    {
      key: "career_jobs_query",
      route: "/career/jobs?q={query}",
      launchState: "noindex",
      authorityOwner: "backend_conservative_search",
      renderMode: "render",
      canonicalMode: "base_jobs",
      robotsMode: "noindex",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: false,
      notes: "Verify real query pages canonicalize to /career/jobs and remain outside launch discoverability.",
    },
    {
      key: "career_legacy_slug_bridge",
      route: "/career/[slug]",
      launchState: "hold",
      authorityOwner: "legacy_cms_redirect_bridge",
      renderMode: "redirect",
      canonicalMode: "legacy_redirect",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: false,
      notes: "Verify the legacy bridge stays explicitly held out and never becomes stable launch authority.",
    },
    {
      key: "career_big5_recommendation_detail",
      route: "/career/recommendations/big5/[trait]",
      launchState: "hold",
      authorityOwner: "backend_future_big5",
      renderMode: "render",
      canonicalMode: "self",
      robotsMode: "index",
      requiresBackendExplicitGate: false,
      requiresLocalizedRoute: true,
      requiresNextStepOrPrimaryCta: true,
      notes: "Verify Big5 recommendation detail stays held out from launch-facing recommendation authority.",
    },
  ],
} as const satisfies {
  manifest_version: string;
  generated_from: string;
  generated_at: string;
  wave_name: string;
  route_classes: readonly CareerLaunchSmokeEntry[];
};

const JOB_DETAIL_RE = /^\/career\/jobs\/[^/]+$/;
const MBTI_RECOMMENDATION_DETAIL_RE = /^\/career\/recommendations\/mbti\/[^/]+$/;
const GUIDE_DETAIL_RE = /^\/career\/guides\/[^/]+$/;
const INDUSTRY_DETAIL_RE = /^\/career\/industries\/[^/]+$/;
const BIG5_RECOMMENDATION_DETAIL_RE = /^\/career\/recommendations\/big5\/[^/]+$/;
const LEGACY_CAREER_SLUG_RE = /^\/career\/[^/]+$/;

export function getCareerLaunchRouteKey(pathname: string): CareerLaunchRouteKey | null {
  if (isCareerJobsQueryPage(pathname)) {
    return "career_jobs_query";
  }

  const stripped = stripLocalePrefix(pathname);

  if (stripped === "/career") return "career_landing";
  if (stripped === "/career/jobs") return "career_jobs_index";
  if (stripped === "/career/recommendations") return "career_recommendations_index";
  if (stripped === "/career/guides") return "career_guides_index";
  if (stripped === "/career/industries") return "career_industries_index";
  if (stripped === "/career/tests") return "career_tests_index";
  if (JOB_DETAIL_RE.test(stripped)) return "career_job_detail";
  if (MBTI_RECOMMENDATION_DETAIL_RE.test(stripped)) return "career_mbti_recommendation_detail";
  if (GUIDE_DETAIL_RE.test(stripped)) return "career_guide_detail";
  if (INDUSTRY_DETAIL_RE.test(stripped)) return "career_industry_detail";
  if (BIG5_RECOMMENDATION_DETAIL_RE.test(stripped)) return "career_big5_recommendation_detail";

  if (LEGACY_CAREER_SLUG_RE.test(stripped)) {
    return "career_legacy_slug_bridge";
  }

  return null;
}

export function getCareerLaunchState(pathname: string): CareerLaunchState | null {
  const key = getCareerLaunchRouteKey(pathname);

  if (!key) {
    return null;
  }

  if (CAREER_STABLE_ROUTES.some((entry) => entry.key === key)) return "stable";
  if (CAREER_CANDIDATE_ROUTES.some((entry) => entry.key === key)) return "candidate";
  if (CAREER_HOLD_ROUTES.some((entry) => entry.key === key)) return "hold";
  if (CAREER_NOINDEX_ROUTES.some((entry) => entry.key === key)) return "noindex";

  return null;
}

export function getCareerLaunchManifestRouteKeys(): CareerLaunchRouteKey[] {
  return [
    ...CAREER_STABLE_ROUTES,
    ...CAREER_CANDIDATE_ROUTES,
    ...CAREER_HOLD_ROUTES,
    ...CAREER_NOINDEX_ROUTES,
  ].map((entry) => entry.key);
}

export function isCareerLaunchTierAuthorityRouteKey(
  key: CareerLaunchRouteKey | null | undefined
): key is CareerLaunchTierAuthorityRouteKey {
  return key === "career_job_detail";
}

export function isCareerDiscoverabilityManifestAuthorityRouteKey(
  key: CareerLaunchRouteKey | null | undefined
): key is CareerDiscoverabilityManifestAuthorityRouteKey {
  return key === "career_job_detail" || key === "career_family_hub_detail";
}

export function getCareerOccupationLaunchTier(
  summary: CareerFirstWaveLaunchTierSummaryAdapter | null,
  slug: string | null | undefined
): CareerFirstWaveLaunchTier | null {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  if (!summary || !normalizedSlug) {
    return null;
  }

  return summary.launchTierBySlug[normalizedSlug] ?? null;
}

export function isCareerJobDetailStableByLaunchTier(
  summary: CareerFirstWaveLaunchTierSummaryAdapter | null,
  slug: string | null | undefined
): boolean {
  return getCareerOccupationLaunchTier(summary, slug) === "stable";
}

export function getCareerJobDetailDiscoverabilityState(
  manifest: CareerFirstWaveDiscoverabilityManifestAdapter | null,
  slug: string | null | undefined
): CareerFirstWaveDiscoverabilityState | null {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  if (!manifest || !normalizedSlug) {
    return null;
  }

  return manifest.jobDetailBySlug[normalizedSlug]?.discoverabilityState ?? null;
}

export function getCareerFamilyHubDiscoverabilityState(
  manifest: CareerFirstWaveDiscoverabilityManifestAdapter | null,
  slug: string | null | undefined
): CareerFirstWaveDiscoverabilityState | null {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  if (!manifest || !normalizedSlug) {
    return null;
  }

  return manifest.familyHubBySlug[normalizedSlug]?.discoverabilityState ?? null;
}

export function isCareerJobDetailDiscoverableByManifest(
  manifest: CareerFirstWaveDiscoverabilityManifestAdapter | null,
  slug: string | null | undefined
): boolean {
  return getCareerJobDetailDiscoverabilityState(manifest, slug) === "discoverable";
}

export function isCareerFamilyHubDiscoverableByManifest(
  manifest: CareerFirstWaveDiscoverabilityManifestAdapter | null,
  slug: string | null | undefined
): boolean {
  return getCareerFamilyHubDiscoverabilityState(manifest, slug) === "discoverable";
}
