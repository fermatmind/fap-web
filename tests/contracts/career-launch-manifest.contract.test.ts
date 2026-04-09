import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CAREER_LAUNCH_MANIFEST,
  CAREER_NOINDEX_ROUTES,
  CAREER_STABLE_ROUTES,
  CAREER_CANDIDATE_ROUTES,
  CAREER_HOLD_ROUTES,
} from "@/lib/career/launchPolicy";

const ROOT = process.cwd();

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8")) as T;
}

describe("career launch manifest contract", () => {
  it("keeps the ops-readable launch manifest aligned with the executable career launch policy", () => {
    const json = readJson<typeof CAREER_LAUNCH_MANIFEST>("docs/release/career-launch-manifest.json");

    expect(json).toEqual(CAREER_LAUNCH_MANIFEST);
  });

  it("keeps the required route classes in the expected launch tiers", () => {
    const stableKeys = CAREER_STABLE_ROUTES.map((entry) => entry.key);
    const candidateKeys = CAREER_CANDIDATE_ROUTES.map((entry) => entry.key);
    const holdKeys = CAREER_HOLD_ROUTES.map((entry) => entry.key);
    const noindexKeys = CAREER_NOINDEX_ROUTES.map((entry) => entry.key);

    expect(stableKeys).toEqual([
      "career_landing",
      "career_jobs_index",
      "career_job_detail",
      "career_recommendations_index",
      "career_mbti_recommendation_detail",
    ]);
    expect(candidateKeys).toEqual([
      "career_guides_index",
      "career_guide_detail",
      "career_industries_index",
      "career_industry_detail",
      "career_tests_index",
      "career_riasec_test",
    ]);
    expect(holdKeys).toEqual([
      "career_legacy_slug_bridge",
      "career_big5_recommendation_detail",
    ]);
    expect(noindexKeys).toEqual([
      "career_jobs_query",
      "career_riasec_result",
    ]);
  });

  it("keeps query and result pages explicitly outside the stable and candidate launch inventory", () => {
    const manifestKeys = [
      ...CAREER_STABLE_ROUTES,
      ...CAREER_CANDIDATE_ROUTES,
      ...CAREER_HOLD_ROUTES,
    ].map((entry) => entry.key);

    expect(manifestKeys).not.toContain("career_jobs_query");
    expect(manifestKeys).not.toContain("career_riasec_result");
    expect(CAREER_NOINDEX_ROUTES.map((entry) => entry.route)).toContain("/career/jobs?q={query}");
    expect(CAREER_NOINDEX_ROUTES.map((entry) => entry.route)).toContain("/career/tests/riasec/result");
  });
});
