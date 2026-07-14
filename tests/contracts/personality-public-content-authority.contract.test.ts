import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const adapterSource = readFileSync("lib/cms/personality.ts", "utf8");
const pageSource = readFileSync("app/(localized)/[locale]/personality/[type]/page.tsx", "utf8");

describe("personality public content authority", () => {
  it("keeps MBTI profile copy and projection authority in backend/CMS", () => {
    expect(adapterSource).toContain("response.mbti_public_projection_v1");
    expect(adapterSource).toContain("normalizeProjection(response.mbti_public_projection_v1)");
    expect(adapterSource).toContain("normalizeProfileDetail(response.profile, response.sections, response.seo_meta ?? null)");
  });

  it("does not create a frontend personality profile when authority is unavailable", () => {
    for (const forbiddenToken of [
      "buildFallbackProjection",
      "buildFallbackPersonalityDetail",
      "frontend_gateway_fallback",
      'routeMode: "fallback"',
      "content is temporarily unavailable",
      "人格内容暂时不可用",
    ]) {
      expect(pageSource).not.toContain(forbiddenToken);
    }
  });

  it("routes absence and transient failure to their existing public boundaries", () => {
    expect(pageSource).toContain("throw detailResult.reason");
    expect(pageSource).toContain("if (!detail)");
    expect(pageSource).toContain("return notFound()");
    expect(pageSource).not.toContain("detail: buildFallback");
  });
});
