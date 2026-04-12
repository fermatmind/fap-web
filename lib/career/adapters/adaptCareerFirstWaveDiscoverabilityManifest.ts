import type { CareerFirstWaveDiscoverabilityManifestResponseRaw } from "@/lib/career/api/types";
import type {
  CareerFirstWaveDiscoverabilityManifestAdapter,
  CareerFirstWaveDiscoverabilityManifestFamilyHubRouteAdapter,
  CareerFirstWaveDiscoverabilityManifestJobDetailRouteAdapter,
  CareerFirstWaveDiscoverabilityManifestRouteAdapter,
  CareerFirstWaveDiscoverabilityState,
  CareerFirstWaveLaunchTier,
} from "@/lib/career/adapters/types";

type AdaptCareerFirstWaveDiscoverabilityManifestInput = {
  payload: CareerFirstWaveDiscoverabilityManifestResponseRaw | null;
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

  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeLaunchTier(value: unknown): CareerFirstWaveLaunchTier | null {
  const normalized = normalizeString(value);

  if (normalized === "stable" || normalized === "candidate" || normalized === "hold") {
    return normalized;
  }

  return null;
}

function normalizeDiscoverabilityState(value: unknown): CareerFirstWaveDiscoverabilityState | null {
  const normalized = normalizeString(value);

  if (normalized === "discoverable" || normalized === "excluded") {
    return normalized;
  }

  return null;
}

function adaptJobDetailRoute(raw: Record<string, unknown>): CareerFirstWaveDiscoverabilityManifestJobDetailRouteAdapter | null {
  const canonicalPath = normalizeString(raw.canonical_path);
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const discoverabilityState = normalizeDiscoverabilityState(raw.discoverability_state);

  if (!canonicalPath || !canonicalSlug || !discoverabilityState) {
    return null;
  }

  return {
    routeKind: "career_job_detail",
    canonicalPath,
    discoverabilityState,
    reasonCodes: normalizeStringArray(raw.reason_codes),
    occupationUuid: normalizeString(raw.occupation_uuid),
    canonicalSlug,
    canonicalTitleEn: normalizeString(raw.canonical_title_en),
    launchTier: normalizeLaunchTier(raw.launch_tier),
    readinessStatus: normalizeString(raw.readiness_status),
    publicIndexState: normalizeString(raw.public_index_state),
    indexEligible: normalizeBoolean(raw.index_eligible),
    reviewerStatus: normalizeString(raw.reviewer_status),
    crosswalkMode: normalizeString(raw.crosswalk_mode),
    blockedGovernanceStatus: normalizeString(raw.blocked_governance_status),
  };
}

function adaptFamilyHubRoute(raw: Record<string, unknown>): CareerFirstWaveDiscoverabilityManifestFamilyHubRouteAdapter | null {
  const canonicalPath = normalizeString(raw.canonical_path);
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const discoverabilityState = normalizeDiscoverabilityState(raw.discoverability_state);

  if (!canonicalPath || !canonicalSlug || !discoverabilityState) {
    return null;
  }

  return {
    routeKind: "career_family_hub",
    canonicalPath,
    discoverabilityState,
    reasonCodes: normalizeStringArray(raw.reason_codes),
    familyUuid: normalizeString(raw.family_uuid),
    canonicalSlug,
    titleEn: normalizeString(raw.title_en),
    visibleChildrenCount: normalizeNumber(raw.visible_children_count),
  };
}

function adaptRoute(raw: Record<string, unknown>): CareerFirstWaveDiscoverabilityManifestRouteAdapter | null {
  const routeKind = normalizeString(raw.route_kind);

  if (routeKind === "career_job_detail") {
    return adaptJobDetailRoute(raw);
  }

  if (routeKind === "career_family_hub") {
    return adaptFamilyHubRoute(raw);
  }

  return null;
}

export function adaptCareerFirstWaveDiscoverabilityManifest(
  input: AdaptCareerFirstWaveDiscoverabilityManifestInput
): CareerFirstWaveDiscoverabilityManifestAdapter | null {
  const raw = input.payload;
  if (!raw || !isRecord(raw)) {
    return null;
  }

  const routes = Array.isArray(raw.routes)
    ? raw.routes
        .filter(isRecord)
        .map(adaptRoute)
        .filter((item): item is CareerFirstWaveDiscoverabilityManifestRouteAdapter => item !== null)
    : [];

  const jobDetailRoutes = routes.filter(
    (route): route is CareerFirstWaveDiscoverabilityManifestJobDetailRouteAdapter => route.routeKind === "career_job_detail"
  );
  const familyHubRoutes = routes.filter(
    (route): route is CareerFirstWaveDiscoverabilityManifestFamilyHubRouteAdapter => route.routeKind === "career_family_hub"
  );

  return {
    authoritySource: "career_backend_first_wave_discoverability_manifest.v0.5",
    manifestKind: normalizeString(raw.manifest_kind) ?? "career_first_wave_discoverability_manifest",
    manifestVersion: normalizeString(raw.manifest_version) ?? "unknown",
    scope: normalizeString(raw.scope) ?? "unknown",
    routes,
    routesByPath: Object.fromEntries(routes.map((route) => [route.canonicalPath, route])),
    jobDetailBySlug: Object.fromEntries(jobDetailRoutes.map((route) => [route.canonicalSlug, route])),
    familyHubBySlug: Object.fromEntries(familyHubRoutes.map((route) => [route.canonicalSlug, route])),
    discoverableJobDetailSlugs: jobDetailRoutes
      .filter((route) => route.discoverabilityState === "discoverable")
      .map((route) => route.canonicalSlug),
    discoverableFamilyHubSlugs: familyHubRoutes
      .filter((route) => route.discoverabilityState === "discoverable")
      .map((route) => route.canonicalSlug),
  };
}
