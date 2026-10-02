import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { formatCareerFamilyTitle } from "@/lib/career/datasetDirectory";

vi.mock("@/lib/career/api/fetchCareerDatasetHub", () => ({ fetchCareerDatasetHub: vi.fn(async () => null) }));
vi.mock("@/lib/career/api/fetchCareerJobIndex", () => ({ fetchCareerJobIndex: vi.fn(async () => null) }));

const scopedFamilies = [
  "building-and-grounds-cleaning", "construction-and-extraction", "education-training-and-library",
  "food-preparation-and-serving", "management", "office-and-administrative-support", "production",
  "transportation-and-material-moving",
];

async function render(locale: string, slug: string, q?: string) {
  const { default: Page } = await import("@/app/(localized)/[locale]/career/industries/[slug]/page");
  const page = await Page({ params: Promise.resolve({ locale, slug }), searchParams: Promise.resolve(q ? { q } : {}) });
  return renderToStaticMarkup(createElement(() => page));
}

describe("scoped Chinese career industry directory introduction", () => {
  it.each(scopedFamilies)("renders one named H1 for %s while retaining the directory and search", async (slug) => {
    const html = await render("zh", slug);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(`${formatCareerFamilyTitle(slug, "zh")}职业目录</h1>`);
    expect(html).toContain("本目录不代表实时招聘");
    expect(html).toContain(`action="/zh/career/industries/${slug}"`);
    expect(html).toContain('name="q"');
    expect(html).toContain('data-testid="career-occupation-row"');
    expect(html).toContain("暂不公开详情");
    expect(html).not.toContain('/zh/career/jobs/');
  });

  it("keeps query filtering usable without changing heading identity", async () => {
    const html = await render("zh", "production", "no-such-occupation-987654");
    expect(html).toContain("生产制造职业目录</h1>");
    expect(html).toContain("本行业下没有找到匹配职业。");
    expect(html).toContain('value="no-such-occupation-987654"');
  });

  it.each([["en", "production"], ["zh", "arts-and-design"], ["zh", "design"], ["zh", "technology"]])(
    "preserves unrelated and alias presentation for %s/%s", async (locale, slug) => {
      const html = await render(locale, slug);
      expect(html).not.toContain("职业目录</h1>");
      expect(html).not.toContain("本目录不代表实时招聘");
    }
  );

  it("still rejects an unknown family", async () => {
    await expect(render("zh", "not-a-family-987654")).rejects.toThrow();
  });
});
