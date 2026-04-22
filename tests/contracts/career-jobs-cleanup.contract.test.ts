import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();
const LEGACY_RIASEC_ROUTE_SEGMENT = ["career", "tests", "riasec"].join("/");
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("career routing cleanup contract", () => {
  it("frontend sitemap config keeps recommendation detail routes out until protocol gating exists and excludes stale private result paths", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          items: [
            { public_route_slug: "intj-a" },
            { public_route_slug: "enfp-t" },
          ],
        })
      )
    );

    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs.some((loc: string) => loc.includes("/career/recommendations/mbti/"))).toBe(false);
    expect(locs.every((loc: string) => !loc.includes(LEGACY_RIASEC_ROUTE_SEGMENT))).toBe(true);
  });

  it("career recommendation detail page exposes protocol-guarded schema and status surfaces without local fallback truth", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(source).toContain("buildItemListJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("renderCareerDataStatus");
    expect(source).toContain("career-recommendation-protocol-status");
    expect(source).toContain('id="recommended-roles"');
    expect(source).toContain('id="faq"');
    expect(source).not.toContain("buildAnswerFirst");
    expect(source).not.toContain('withLocale("/topics/mbti")');
    expect(source).not.toContain('withLocale("/help/faq")');
  });

  it("career job detail page exposes claim-gated protocol status and does not treat legacy vm fields as authority", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain("career-job-protocol-status");
    expect(source).toContain("career-job-claim-gated-status");
    expect(source).toContain("career-job-next-step-links");
    expect(source).toContain("renderState.canRenderSalarySurface");
    expect(source).toContain("renderState.canRenderFitSurface");
    expect(source).toContain("renderState.canRenderAnswerSurface");
    expect(source).not.toContain("CareerTransitionPreviewCard");
    expect(source).not.toContain("best next move");
  });

  it("machine-readable routes keep public career recommendations and skip private flows", () => {
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(llms).toContain('import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex"');
    expect(llms).toContain('import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex"');
    expect(llms).toContain('import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex"');
    expect(llms).toContain('import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex"');
    expect(llmsFull).toContain('import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex"');
    expect(llmsFull).toContain('import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex"');
    expect(llms).not.toContain('import { listCareerJobsFromCms } from "@/lib/cms/career-jobs"');
    expect(llms).not.toContain('import { listMbtiCareerRecommendations } from "@/lib/cms/career-recommendations"');
    expect(llmsFull).not.toContain('import { listCareerJobsFromCms } from "@/lib/cms/career-jobs"');
    expect(llmsFull).not.toContain('import { listMbtiCareerRecommendations } from "@/lib/cms/career-recommendations"');
    expect(llms).not.toContain("listBig5RecommendationTraits");
    expect(llmsFull).not.toContain("listBig5RecommendationTraits");
    expect(llms).not.toContain(LEGACY_RIASEC_ROUTE_SEGMENT);
    expect(llmsFull).not.toContain(LEGACY_RIASEC_ROUTE_SEGMENT);
    expect(llms).not.toContain("?q=");
    expect(llmsFull).not.toContain("?q=");
    expect(llms).not.toContain("/compare/");
    expect(llmsFull).not.toContain("/share/");
  });
});
