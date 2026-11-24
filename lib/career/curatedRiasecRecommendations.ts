import pool from "@/content/career-recommendation/riasec-curated-pool.zh-CN.json";
import flatRoutes from "@/content/career-recommendation/riasec-flat-routes.zh-CN.json";
import type { RiasecDimension } from "@/lib/riasec/resultAssembler";
import { selectFlatRoutes, type CuratedCareer, type CuratedPool, type FlatRoutes } from "./curatedPoolSchema";
import release from "./interestRelease.json";
import { compareInterestSimilarity, interestProfile, interestSimilarity, readRiasecProfile } from "./riasecSimilarity";

// The signed asset validator checks the JSON schema and tuple sizes.
const entries = (pool as CuratedPool).entries;
const signedRoutes = flatRoutes as unknown as FlatRoutes;
const bySlug = new Map(entries.map(career => [career.slug, career]));
const vectors: Record<string, { interestVector: number[] }> = release.careers;

export function recommendCuratedRiasecCareers(scores: readonly RiasecDimension[]) {
  const values = readRiasecProfile(scores);
  if (!values) return { state: "unavailable" as const };

  const routes = selectFlatRoutes(values, signedRoutes);
  if (routes) {
    const trials = routes.map(route => route.example_slugs.map(slug => {
      const career = bySlug.get(slug);
      if (career?.card_depth !== "deep") throw new Error(`Missing trial for curated route: ${slug}`);
      return career;
    }));
    return { state: "flat" as const, trials };
  }

  const profile = interestProfile(values);
  const ranked = entries.map(career => ({
    career,
    slug: career.slug,
    similarity: interestSimilarity(profile, vectors[career.slug].interestVector),
  })).filter(candidate => candidate.similarity > 0).sort(compareInterestSimilarity);

  const seen = new Set<string>();
  const representatives = ranked.flatMap(({ career }) => {
    if (seen.has(career.scene_cluster)) return [];
    seen.add(career.scene_cluster);
    return [career];
  });
  const broad = representatives.filter(career => career.exposure_tier === "broad_mainstream");
  const specialized = representatives.filter(career => career.exposure_tier === "specialized_track");

  // A specialized direction cannot appear before slot four.
  const featured = broad.length >= 3 ? specialized[0] : undefined;
  const top = featured ? [...broad.slice(0, 4), featured] : broad.slice(0, 5);
  const more = specialized.filter(career => career !== featured);
  return { state: "ranked" as const, top, more };
}

export function curatedCareerComparisonHref(careers: readonly CuratedCareer[]) {
  const [first, second] = careers;
  const linked = second && first?.linked_comparison_slugs.find(slug => second.linked_comparison_slugs.includes(slug));
  return linked ? `/zh/career-compare/${linked}` : "/zh/career/compare";
}
