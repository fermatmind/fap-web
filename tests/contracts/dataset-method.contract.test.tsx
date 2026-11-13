import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("dataset method page contract", () => {
  it("renders backend dataset method contract with localized page structured data", () => {
    const source = read("app/(localized)/[locale]/datasets/occupations/method/page.tsx");

    expect(source).toContain("fetchCareerDatasetMethod");
    expect(source).toContain("adaptCareerDatasetMethod");
    expect(source).toContain("DatasetMethodPanel");
    expect(source).toContain("scopeSummary={method.scopeSummary}");
    expect(source).toContain("publication={method.publication}");
    expect(source).toContain("JsonLd");
    expect(source).toContain('id="dataset-method-webpage-jsonld"');
    expect(source).toContain('id="dataset-method-breadcrumb-jsonld"');
    expect(source).toContain('data-testid="dataset-method-page"');
    expect(source).toContain('data-testid="dataset-hub-entry"');
    expect(source).not.toContain("fetchCareerJobBundle");
    expect(source).not.toContain("fetchCareerRecommendationBundle");
  });
});

describe("localized method HTML", () => {
  it.each([
    ["zh", "zh-CN", "职业数据库方法说明", "公开纳入"],
    ["en", "en", "Occupations dataset method", "Included publicly"],
  ])("requests %s content and renders the four sourced sections before scope", async (locale, apiLocale, title, metricLabel) => {
    const ids = ["career-task-evidence", "riasec-free-results", "interest-and-work-style", "try-a-task"];
    const { apiClient } = await import("@/lib/api-client");
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({
      title,
      reader_guide: {
        intro: "Guide introduction",
        sections: ids.map((id) => ({
          id,
          title: id,
          body: "Source-backed explanation",
          sources: [{ label: "Assessment", href: "/tests/holland-career-interest-test-riasec" }],
        })),
      },
      scope_summary: { member_count: 1046, included_count: 1046, excluded_count: 2 },
      publication: {
        license: { name: "Dataset terms", url: "/datasets/occupations/license" },
        distribution: { download_url: "/datasets/occupations/download" },
      },
    });
    const { default: Page, generateMetadata } = await import("@/app/(localized)/[locale]/datasets/occupations/method/page");
    const params = Promise.resolve({ locale });
    const html = renderToStaticMarkup(await Page({ params }));
    const root = document.createElement("div");
    root.innerHTML = html;

    expect(get).toHaveBeenCalledWith(
      `/v0.5/career/datasets/occupations/method?locale=${apiLocale}`,
      expect.objectContaining({ locale, skipAuth: true }),
    );
    expect(root.querySelector("h1")?.textContent).toBe(title);
    expect([...root.querySelectorAll("section[id]")].map((section) => section.id)).toEqual(ids);
    expect(html.indexOf('id="try-a-task"')).toBeLessThan(html.indexOf(metricLabel));
    expect(root.querySelector("#riasec-free-results a")?.getAttribute("href")).toBe(
      `/${locale}/tests/holland-career-interest-test-riasec`,
    );
    expect(root.querySelector('a[href$="/occupations/license"], a[href$="/occupations/download"]')).toBeNull();
    const metadata = await generateMetadata({ params });
    const webpage = JSON.parse(root.querySelector("#dataset-method-webpage-jsonld")!.textContent!);
    const breadcrumb = JSON.parse(root.querySelector("#dataset-method-breadcrumb-jsonld")!.textContent!);
    expect(webpage).toMatchObject({ "@type": "WebPage", url: metadata.alternates?.canonical, inLanguage: apiLocale });
    expect(breadcrumb.itemListElement[1].item).toBe(webpage.url);
  });
});
