import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerFirstWaveDiscoverabilityManifest } from "@/lib/career/adapters/adaptCareerFirstWaveDiscoverabilityManifest";
import { fetchCareerFirstWaveDiscoverabilityManifest } from "@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest";
import {
  isCareerDiscoverabilityManifestAuthorityRouteKey,
  isCareerFamilyHubDiscoverableByManifest,
  isCareerJobDetailDiscoverableByManifest,
} from "@/lib/career/launchPolicy";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("career first-wave discoverability manifest contract", () => {
  it("requests the backend B35 discoverability manifest endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/first-wave/discoverability-manifest?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          manifest_kind: "career_first_wave_discoverability_manifest",
          manifest_version: "career.discoverability.first_wave.v1",
          scope: "career_first_wave_10",
          routes: [],
        });
      })
    );

    const payload = await fetchCareerFirstWaveDiscoverabilityManifest({ locale: "zh" });

    expect(payload).not.toBeNull();
  });

  it("adapts backend B35 rows into route-kind-scoped discoverability inventory without leaking unsupported classes", () => {
    const manifest = adaptCareerFirstWaveDiscoverabilityManifest({
      payload: {
        manifest_kind: "career_first_wave_discoverability_manifest",
        manifest_version: "career.discoverability.first_wave.v1",
        scope: "career_first_wave_10",
        routes: [
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/backend-architect",
            discoverability_state: "discoverable",
            reason_codes: ["stable_launch_tier"],
            occupation_uuid: "occ_job",
            canonical_slug: "backend-architect",
            canonical_title_en: "Backend Architect",
            launch_tier: "stable",
            readiness_status: "publish_ready",
            public_index_state: "indexable",
            index_eligible: true,
            reviewer_status: "approved",
            crosswalk_mode: "exact",
            blocked_governance_status: null,
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/data-science",
            discoverability_state: "discoverable",
            reason_codes: ["visible_children_present"],
            family_uuid: "fam_123",
            canonical_slug: "data-science",
            title_en: "Data Science",
            visible_children_count: 2,
          },
          {
            route_kind: "career_recommendations_index",
            canonical_path: "/career/recommendations",
            discoverability_state: "discoverable",
          },
        ],
      },
    });

    expect(manifest).not.toBeNull();
    expect(manifest?.routes).toHaveLength(2);
    expect(manifest?.discoverableJobDetailSlugs).toEqual(["backend-architect"]);
    expect(manifest?.discoverableFamilyHubSlugs).toEqual(["data-science"]);
    expect(manifest?.jobDetailBySlug["backend-architect"]?.routeKind).toBe("career_job_detail");
    expect(manifest?.familyHubBySlug["data-science"]?.routeKind).toBe("career_family_hub");
    expect(manifest?.routesByPath["/career/recommendations"]).toBeUndefined();
  });

  it("keeps B35 discoverability helpers scoped to supported frontend route classes", () => {
    const manifest = adaptCareerFirstWaveDiscoverabilityManifest({
      payload: {
        manifest_kind: "career_first_wave_discoverability_manifest",
        manifest_version: "career.discoverability.first_wave.v1",
        scope: "career_first_wave_10",
        routes: [
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/backend-architect",
            discoverability_state: "discoverable",
            canonical_slug: "backend-architect",
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/data-science",
            discoverability_state: "excluded",
            canonical_slug: "data-science",
            visible_children_count: 0,
          },
        ],
      },
    });

    expect(isCareerDiscoverabilityManifestAuthorityRouteKey("career_job_detail")).toBe(true);
    expect(isCareerDiscoverabilityManifestAuthorityRouteKey("career_family_hub_detail")).toBe(true);
    expect(isCareerDiscoverabilityManifestAuthorityRouteKey("career_mbti_recommendation_detail")).toBe(false);

    expect(isCareerJobDetailDiscoverableByManifest(manifest, "backend-architect")).toBe(true);
    expect(isCareerFamilyHubDiscoverableByManifest(manifest, "data-science")).toBe(false);
    expect(isCareerJobDetailDiscoverableByManifest(manifest, "unknown-role")).toBe(false);
  });
});
