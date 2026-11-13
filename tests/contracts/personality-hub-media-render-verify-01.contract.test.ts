import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("PERSONALITY-HUB-MEDIA-RENDER-VERIFY-01", () => {
  it("keeps backend personality media on the hub adapter instead of inventing local assets", () => {
    const payload = buildPersonalityHubPayload({
      locale: "en",
      canonicalPath: "/en/personality",
      landingSurface: null,
      personalities: [
        {
          id: 1,
          variantId: 101,
          profileId: 1,
          orgId: 0,
          scaleCode: "MBTI",
          typeCode: "INTJ-A",
          baseTypeCode: "INTJ",
          runtimeTypeCode: "INTJ-A",
          variantCode: "A",
          displayType: "INTJ-A",
          publicRouteSlug: "intj-a",
          publicRouteType: "32-type",
          slug: "intj-a",
          baseSlug: "intj",
          locale: "en",
          title: "INTJ-A Architect",
          subtitle: "",
          excerpt: "Strategic and self-directed.",
          heroImageUrl: "https://assets.fermatmind.com/static/personality/type-icons/intj.png",
          status: "published",
          isPublic: true,
          isIndexable: true,
          publishedAt: null,
          updatedAt: null,
          seoMeta: null,
        },
      ],
    });

    expect(payload.typeDecisionCards).toHaveLength(1);
    expect(payload.typeDecisionCards[0]?.imageUrl).toBe(
      "https://assets.fermatmind.com/static/personality/type-icons/intj.png"
    );
  });

  it("renders hub personality images with decorative portraits, dimensions, priority, lazy loading, and code fallback", () => {
    const source = read("app/(localized)/[locale]/personality/page.tsx");

    expect(source).toContain('from "next/image"');
    expect(source).toContain('data-testid="personality-type-image"');
    expect(source).toContain('data-testid="personality-type-code-fallback"');
    expect(source).toContain('alt=""');
    expect(source).toContain("width={56}");
    expect(source).toContain("height={80}");
    expect(source).toContain('const imageUrl = portrait ?? type?.imageUrl');
    expect(source).toContain("const isPriorityImage = groupIndex === 0 && typeIndex < 4");
    expect(source).toContain('data-loading-strategy={isPriorityImage ? "priority" : "lazy"}');
    expect(source).toContain('priority: true');
    expect(source).toContain('loading: "lazy" as const');
  });

  it("renders a bundled portrait with backend detail hero media fallback in HTML with dimensions and fallback", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain('from "next/image"');
    expect(source).toContain("const heroImageUrl = portrait ?? detail.heroImageUrl");
    expect(source).toContain('data-testid="personality-detail-hero-image"');
    expect(source).toContain('data-testid="personality-detail-hero-image-fallback"');
    expect(source).toContain("alt={formatPersonalityDetailImageAlt(detail, locale)}");
    expect(source).toContain("width={192}");
    expect(source).toContain("height={portrait ? 277 : 192}");
    expect(source).toContain("priority");
  });
});
