import { describe, expect, it } from "vitest";

import rawPool from "../../content/career-recommendation/riasec-curated-pool.zh-CN.json";
import rawRoutes from "../../content/career-recommendation/riasec-flat-routes.zh-CN.json";
import rawScenes from "../../content/career-recommendation/scene-clusters.zh-CN.json";
import release from "../../lib/career/interestRelease.json";
import {
  derivePrimaryRiasec,
  profileStandardDeviation,
  selectFlatRoutes,
  simulateRankedPool,
  validateCareerRecommendation,
} from "../../lib/career/curatedPoolSchema";

const validate = () => validateCareerRecommendation(rawPool, rawScenes, rawRoutes, release);
const sampleA = [50, 65, 60, 55, 52.5, 40];
const sampleB = [62.5, 55, 37.5, 72.5, 67.5, 75];

describe("zh-CN career recommendation release", () => {
  it("validates the signed pool, roles, education coverage and exclusions", () => {
    const { pool, scenes } = validate();
    const entries = new Map(pool.entries.map((entry) => [entry.slug, entry]));
    expect(entries.size).toBe(339);
    expect(Object.keys(scenes.clusters)).toHaveLength(111);
    expect(pool.entries.filter((entry) => entry.card_depth === "deep")).toHaveLength(30);
    expect(entries.get("airline-pilots-copilots-and-flight-engineers")?.display_name_zh).toBe("民航飞行员");
    expect(entries.has("airline-and-commercial-pilots")).toBe(false);
    expect(entries.has("software-developers")).toBe(false);
    expect(entries.has("business-intelligence-analysts")).toBe(false);
    expect(entries.has("occupational-health-and-safety-specialists")).toBe(false);
    expect(entries.get("database-architects")?.display_name_zh).toBe("数据库架构师");
    expect(entries.get("film-and-video-editors")?.display_name_zh).toBe("影视与视频剪辑师");
    const scene = (slug: string) => entries.get(slug)?.scene_cluster;
    expect(scene("data-warehousing-specialists")).toBe(scene("database-administrators"));
    expect(scene("penetration-testers")).toBe(scene("information-security-analysts"));
    expect(scene("telecommunications-line-installers-and-repairers")).not.toBe(scene("web-administrators"));
  });

  it("derives real vector order and gives reproducible priority to tied dimensions", () => {
    expect(derivePrimaryRiasec([3, 6, 6, 2, 3, 1])).toEqual(["I", "A", "R"]);
    expect(() => derivePrimaryRiasec([1, 2])).toThrow(/six finite/);
  });

  it.each([
    "高薪少加班",
    "必录保过",
    "这是唯一方向",
    "少见复合型",
    "3 个月内耗崩溃",
    "低分淘汰",
    "综合匹配度 95％",
    "三轴合成总分 95%",
  ])("rejects public copy with unsupported claims (%s)", (text) => {
    const [first, ...remaining] = rawPool.entries;
    const modified = { ...rawPool, entries: [{ ...first, display_name_zh: text }, ...remaining] };
    expect(() => validateCareerRecommendation(modified, rawScenes, rawRoutes, release)).toThrow(/prohibited claim/);
  });

  it("rejects vector drift and unavailable routes", () => {
    const [first, ...remaining] = rawPool.entries;
    const modified = { ...rawPool, entries: [{ ...first, primary_riasec: [] }, ...remaining] };
    expect(() => validateCareerRecommendation(modified, rawScenes, rawRoutes, release)).toThrow(/vector or SOC mismatch/);
    const routes = { ...rawRoutes, default_pair: [
      { example_slugs: ["software-developers"], activity: "micro_trial" }, rawRoutes.default_pair[1],
    ] };
    expect(() => validateCareerRecommendation(rawPool, rawScenes, routes, release)).toThrow(/deep career/);
  });

  it("stops ranking for IAS and uses both fallback levels", () => {
    const { pool, scenes, routes } = validate();
    expect(profileStandardDeviation(sampleA)).toBeCloseTo(7.87, 2);
    expect(selectFlatRoutes(sampleA, routes)?.map(({ example_slugs }) => example_slugs[0]))
      .toEqual(["market-research-analysts", "instructional-coordinators"]);
    expect(() => simulateRankedPool(sampleA, pool, scenes, release)).toThrow(/stop ranking/);
    expect(selectFlatRoutes(sampleA, { ...routes, by_top_two: {} })).toEqual(routes.by_leading.I);
    expect(selectFlatRoutes(sampleA, { ...routes, by_top_two: {}, by_leading: {} })).toEqual(routes.default_pair);
    expect(selectFlatRoutes(sampleB, routes)).toBeNull();
  });

  it("preserves the C/S near tie and applies scene and vertical caps before taking five", () => {
    const { pool, scenes, routes } = validate();
    expect(routes.by_top_two.EC?.map(({ example_slugs }) => example_slugs[0]))
      .toEqual(["compliance-officers", "training-and-development-specialists"]);
    const { chosen, topTwoGap } = simulateRankedPool(sampleB, pool, scenes, release);
    expect(topTwoGap).toBe(2.5);
    expect(chosen).toHaveLength(5);
    expect(new Set(chosen.map((entry) => entry.scene_cluster)).size).toBe(5);
    expect(chosen.filter((entry) => entry.exposure_tier === "specialized_track").length).toBeLessThanOrEqual(2);
  });
  it("chooses the scene representative before applying the vertical cap", () => {
    const { pool, scenes } = validate();
    const [base] = pool.entries;
    const entries = ["a", "b", "c", "d", "e"].map((slug, index) => ({
      ...base,
      slug,
      scene_cluster: ["first", "second", "overlap", "overlap", "last"][index],
      exposure_tier: index < 3 ? "specialized_track" as const : "broad_mainstream" as const,
    }));
    const vectors = { careers: Object.fromEntries(entries.map(({ slug }) =>
      [slug, { onet: base.onet_soc_code, interestVector: sampleB }])) };
    const { chosen } = simulateRankedPool(sampleB, { ...pool, entries }, scenes, vectors);
    expect(chosen.map(({ slug }) => slug)).toEqual(["a", "b", "e"]);
  });
});
