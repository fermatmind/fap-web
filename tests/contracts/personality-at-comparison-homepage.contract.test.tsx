import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { listPersonalityComparisons } from "@/lib/cms/personality";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

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

describe("WEB-01 personality A/T comparison homepage module", () => {
  it("adds personality comparisons as a sibling item in the personality nav dropdown", () => {
    const enPersonalityMenu = getHeaderDropdownMenus("en").find((menu) => menu.key === "personality");
    const zhPersonalityMenu = getHeaderDropdownMenus("zh").find((menu) => menu.key === "personality");

    expect(enPersonalityMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/personality#personality-comparisons",
          label: "Personality comparisons",
        }),
      ])
    );
    expect(zhPersonalityMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/personality#personality-comparisons",
          label: "性格对比",
        }),
      ])
    );
  });

  it("consumes the backend A/T comparison list API and excludes cross-type groups", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      expect(url).toContain("/api/v0.5/personality/comparisons?");
      expect(url).toContain("locale=zh-CN");
      expect(url).toContain("org_id=0");
      expect(url).toContain("scale_code=MBTI");

      return jsonResponse({
        ok: true,
        comparison_list_public_projection_v1: {
          comparison_list_contract_version: "mbti.comparison_list.v1",
          locale: "zh-CN",
          scale_code: "MBTI",
          groups: [
            {
              key: "at_comparisons",
              comparison_type: "mbti_at_comparison",
              title: "性格对比",
              description: "Backend owned A/T comparison list.",
              items: [
                {
                  slug: "intj-a-vs-intj-t",
                  comparison_type: "mbti_at_comparison",
                  base_type_code: "INTJ",
                  scale_code: "MBTI",
                  locale: "zh-CN",
                  public_route_type: "at-comparison",
                  title: "INTJ-A vs INTJ-T",
                  description: "Backend owned comparison card.",
                  public_url: "/zh/personality/intj-a-vs-intj-t",
                  canonical_url: "https://fermatmind.com/zh/personality/intj-a-vs-intj-t",
                  is_public: true,
                  is_indexable: true,
                  status: "published",
                },
              ],
            },
            {
              key: "cross_type_comparisons",
              comparison_type: "mbti_cross_type_comparison",
              title: "Commonly confused types",
              description: "Future group.",
              items: [
                {
                  slug: "intj-vs-intp",
                  comparison_type: "mbti_cross_type_comparison",
                  public_route_type: "cross-type-comparison",
                  title: "INTJ vs INTP",
                  description: "Out of WEB-01 scope.",
                  is_public: true,
                },
              ],
            },
          ],
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const comparisonList = await listPersonalityComparisons("zh");

    expect(comparisonList.comparisonListContractVersion).toBe("mbti.comparison_list.v1");
    expect(comparisonList.groups).toHaveLength(1);
    expect(comparisonList.groups[0]?.key).toBe("at_comparisons");
    expect(comparisonList.groups[0]?.title).toBe("性格对比");
    expect(comparisonList.atComparisons).toHaveLength(1);
    expect(comparisonList.atComparisons[0]).toMatchObject({
      slug: "intj-a-vs-intj-t",
      baseTypeCode: "INTJ",
      href: "/zh/personality/intj-a-vs-intj-t",
      title: "INTJ-A vs INTJ-T",
      description: "Backend owned comparison card.",
      isPublic: true,
      isIndexable: true,
    });
  });

  it("wires the personality hub to the backend list API without local comparison content fallback", () => {
    const pageSource = read("app/(localized)/[locale]/personality/page.tsx");
    const adapterSource = read("lib/cms/personality.ts");

    expect(pageSource).toContain("listPersonalityComparisons(locale)");
    expect(pageSource).toContain('id="personality-comparisons"');
    expect(pageSource).toContain('data-testid="personality-at-comparison-module"');
    expect(pageSource).toContain('data-authority-source="comparison_list_public_projection_v1"');
    expect(pageSource).toContain("comparisonGroups={comparisonList.groups}");
    expect(pageSource).toContain("group.items.map");
    expect(pageSource).not.toContain("buildPersonalityComparisonSlugsFromProfiles");
    expect(pageSource).not.toContain("MBTI_COMPARISON_BASE_TYPES");
    expect(pageSource).not.toContain("intj-a-vs-intj-t");

    expect(adapterSource).toContain("/v0.5/personality/comparisons");
    expect(adapterSource).toContain("comparison_list_public_projection_v1");
    expect(adapterSource).toContain('comparisonType !== "mbti_at_comparison"');
    expect(adapterSource).not.toContain("const LOCAL_PERSONALITY_COMPARISON");
  });
});
