import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(async () => ({ ok: true as const, nonceHash: "career-detail-test" })),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

vi.mock("@/lib/security/contentReleaseRevalidationAuth", () => ({
  authenticateContentReleaseRevalidation: mocks.authenticate,
}));

import { collectPathDecisions, POST } from "@/app/api/content-release/revalidate/route";
import { careerDetailCacheTag } from "@/lib/career/api/fetchCareerJobBundle";

const ROOT = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

describe("CAREER-DETAIL-DELIVERY-10K-01", () => {
  it("keeps bounded HTML revalidation, shares the authority load, and caps render requests", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain("export const revalidate = 300;");
    expect(source).toContain("export const CAREER_DETAIL_MAX_BACKEND_REQUESTS_PER_RENDER = 6;");
    expect(source).toContain("const loadCareerJobBundle = cache(async");
    expect(source.match(/loadCareerJobBundle\(locale, slug\)/g)?.length).toBe(2);
    expect(source).toContain("const [salaryAssetPreview, aiImpactAssetPreview] = await Promise.all");
    expect(source).toContain("const [salaryAssetPreview, explainability, nextStepLinks, runtimeConfig] = await Promise.all");
    expect(source).not.toContain('cache: "no-store"');
  });

  it("tags both detail and SEO authority fetches by normalized locale and slug", () => {
    const source = read("lib/career/api/fetchCareerJobBundle.ts");

    expect(careerDetailCacheTag("zh", "Software-Developer")).toBe("career-detail:zh-CN:software-developer");
    expect(careerDetailCacheTag("en", "Software-Developer")).toBe("career-detail:en:software-developer");
    expect(source.match(/detailCacheOptions\(/g)?.length).toBe(3);
    expect(source).toContain("revalidate: CAREER_DETAIL_REVALIDATE_SECONDS");
    expect(source).not.toContain('cache: "no-store"');
  });

  it("derives the exact localized detail path and hard-expires its tag on signed release events", async () => {
    const decisions = collectPathDecisions({
      content: { type: "career_job", slug: "software-developer", locale: "zh-CN" },
    });
    expect(decisions.accepted).toEqual(["/zh/career/jobs/software-developer"]);

    const body = JSON.stringify({
      content: { type: "career_job", slug: "software-developer", locale: "zh-CN" },
    });
    const response = await POST(
      new NextRequest("https://fermatmind.com/api/content-release/revalidate", { method: "POST", body })
    );
    const payload = (await response.json()) as { invalidated_tags: string[] };

    expect(response.status).toBe(200);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/zh/career/jobs/software-developer");
    expect(mocks.revalidateTag).toHaveBeenCalledWith("career-detail:zh-CN:software-developer", { expire: 0 });
    expect(payload.invalidated_tags).toEqual(["career-detail:zh-CN:software-developer"]);
  });
});
