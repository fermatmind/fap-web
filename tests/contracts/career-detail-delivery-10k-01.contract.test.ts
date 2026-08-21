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
import {
  CAREER_DETAIL_PROJECTION_CACHE_VERSION,
  careerDetailCacheTag,
} from "@/lib/career/api/fetchCareerJobBundle";

const ROOT = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

describe("CAREER-DETAIL-DELIVERY-10K-01", () => {
  it("keeps HTML deployment-bound, shares the authority load, and caps render requests", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    const rendererSource = read("components/career/display/CareerProductionDisplaySurface.tsx");

    expect(source).toContain('export const dynamic = "force-dynamic";');
    expect(source).toContain('CAREER_DETAIL_HTML_CACHE_POLICY = "deployment-bound"');
    expect(source).toContain("CAREER_RENDERER_RELEASE = process.env.NEXT_PUBLIC_RELEASE");
    expect(source).toContain("rendererRelease={CAREER_RENDERER_RELEASE}");
    expect(rendererSource).toContain("data-career-renderer-release={rendererRelease}");
    expect(source).not.toContain("export const revalidate = 300;");
    expect(source).toContain("export const CAREER_DETAIL_MAX_BACKEND_REQUESTS_PER_RENDER = 6;");
    expect(source).toContain("const loadCareerJobBundle = cache(async");
    expect(source.match(/loadCareerJobBundle\(locale, slug\)/g)?.length).toBe(2);
    expect(source).toContain("const [salaryAssetPreview, aiImpactAssetPreview] = await Promise.all");
    expect(source).toContain("const [salaryAssetPreview, explainability, nextStepLinks, runtimeConfig] = await Promise.all");
    expect(source).not.toContain('cache: "no-store"');
  });

  it("fails deployment closed unless local and public Career HTML serve the exact build", () => {
    const source = read("scripts/deploy_web_pm2.sh");
    const revisionHeredocEnd = source.indexOf("\nNODE\n");
    const rendererFunctionIndex = source.indexOf("require_career_renderer_revision() {");
    const rendererUseIndex = source.indexOf('require_career_renderer_revision "http://${APP_HOST}:${APP_PORT}"');

    expect(source).toContain("require_career_renderer_revision");
    expect(rendererFunctionIndex).toBeGreaterThan(revisionHeredocEnd);
    expect(rendererUseIndex).toBeGreaterThan(rendererFunctionIndex);
    expect(source).toContain('data-career-renderer-release=\\"${DEPLOY_SHA}\\"');
    expect(source).toContain("rolling reload retained a stale renderer");
    expect(source).toContain('pm2 restart "$APP_NAME" --update-env');
    expect(source).toContain('require_career_renderer_revision "$PUBLIC_BASE_URL" "public"');
  });

  it("tags both detail and SEO authority fetches by normalized locale and slug", () => {
    const source = read("lib/career/api/fetchCareerJobBundle.ts");

    expect(careerDetailCacheTag("zh", "Software-Developer")).toBe("career-detail:zh-CN:software-developer");
    expect(careerDetailCacheTag("en", "Software-Developer")).toBe("career-detail:en:software-developer");
    expect(source.match(/detailCacheOptions\(/g)?.length).toBe(3);
    expect(source).toContain("revalidate: CAREER_DETAIL_REVALIDATE_SECONDS");
    expect(source).toContain('toApiLocale(locale) === "zh-CN"');
    expect(source).toContain('cache: "no-store" as const');
  });

  it("bypasses stale projection data only for the authoritative Chinese bundle", () => {
    const source = read("lib/career/api/fetchCareerJobBundle.ts");

    expect(CAREER_DETAIL_PROJECTION_CACHE_VERSION).toBe("current-26-component-v1");
    expect(source).toContain("function bundleCacheOptions");
    expect(source).toContain("...bundleCacheOptions(input.locale, normalizedSlug)");
    expect(source).toContain('query.set("projection_contract", CAREER_DETAIL_PROJECTION_CACHE_VERSION)');
    expect(source).toContain('headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }');
    expect(source.match(/\.\.\.detailCacheOptions\(input\.locale, input\.normalizedSlug\)/g)).toHaveLength(1);
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
