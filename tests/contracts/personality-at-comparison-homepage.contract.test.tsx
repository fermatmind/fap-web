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
  it("keeps personality comparisons out of the top personality nav dropdown", () => {
    const enPersonalityMenu = getHeaderDropdownMenus("en").find((menu) => menu.key === "personality");
    const zhPersonalityMenu = getHeaderDropdownMenus("zh").find((menu) => menu.key === "personality");

    expect(enPersonalityMenu?.items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ href: "/personality#personality-comparisons" })])
    );
    expect(zhPersonalityMenu?.items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ href: "/personality#personality-comparisons" })])
    );
  });

  it("consumes the backend comparison list API and keeps A/T and cross-type groups separate", async () => {
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
              comparison_type: "mbti_cross_type",
              title: "易混淆人格对比",
              description: "Backend owned cross-type comparison list.",
              items: [
                {
                  slug: "intj-vs-intp",
                  comparison_type: "mbti_cross_type",
                  left_type: "INTJ",
                  right_type: "INTP",
                  base_type_codes: ["INTJ", "INTP"],
                  public_route_type: "cross-type-comparison",
                  title: "INTJ vs INTP",
                  description: "Backend owned cross-type comparison card.",
                  summary: "Backend owned cross-type summary.",
                  public_url: "/zh/personality/intj-vs-intp",
                  is_public: true,
                  is_indexable: false,
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
    expect(comparisonList.groups).toHaveLength(2);
    expect(comparisonList.groups[0]?.key).toBe("at_comparisons");
    expect(comparisonList.groups[0]?.title).toBe("性格对比");
    expect(comparisonList.groups[1]?.key).toBe("cross_type_comparisons");
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
    expect(comparisonList.crossTypeComparisons).toHaveLength(1);
    expect(comparisonList.crossTypeComparisons[0]).toMatchObject({
      slug: "intj-vs-intp",
      comparisonType: "mbti_cross_type",
      leftType: "INTJ",
      rightType: "INTP",
      href: "/zh/personality/intj-vs-intp",
      title: "INTJ vs INTP",
      description: "Backend owned cross-type comparison card.",
      isPublic: true,
      isIndexable: false,
    });
  });

  it("wires the personality hub to the backend list API without local comparison content fallback", () => {
    const pageSource = read("app/(localized)/[locale]/personality/page.tsx");
    const adapterSource = read("lib/cms/personality.ts");

    expect(pageSource).toContain("listPersonalityComparisons(locale)");
    expect(pageSource).toContain("comparisonGroups={comparisonList.groups}");
    expect(pageSource).toContain("comparisonHrefByBaseType");
    expect(pageSource).toContain("crossComparisonsByBaseType");
    expect(pageSource).toContain('item.comparisonType === "mbti_cross_type"');
    expect(pageSource).toContain("comparisonLabel(item)");
    expect(pageSource).not.toContain('id="personality-comparisons"');
    expect(pageSource).not.toContain('data-testid="personality-at-comparison-module"');
    expect(pageSource).not.toContain("personality-cross-type-comparison-card");
    expect(pageSource).not.toContain("buildPersonalityComparisonSlugsFromProfiles");
    expect(pageSource).not.toContain("MBTI_COMPARISON_BASE_TYPES");
    expect(pageSource).not.toContain("intj-a-vs-intj-t");

    expect(adapterSource).toContain("/v0.5/personality/comparisons");
    expect(adapterSource).toContain("comparison_list_public_projection_v1");
    expect(adapterSource).toContain('comparisonType === "mbti_cross_type"');
    expect(adapterSource).not.toContain("const LOCAL_PERSONALITY_COMPARISON");
  });
});
