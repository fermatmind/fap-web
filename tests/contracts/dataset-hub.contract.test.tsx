import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { fetchDataset } = vi.hoisted(() => ({ fetchDataset: vi.fn() }));
vi.mock("@/lib/career/api/fetchCareerDatasetHub", () => ({ fetchCareerDatasetHub: fetchDataset }));
import DatasetHubPage, { generateMetadata } from "@/app/(localized)/[locale]/datasets/occupations/page";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("dataset hub page contract", () => {
  it.each(["zh", "en"])("keeps %s coverage copy consistent with the live dataset count", async (locale) => {
    fetchDataset.mockResolvedValue({
      dataset_name: "Occupations dataset",
      dataset_name_zh: "职业数据库",
      collection_summary: { member_count: 1045 },
      publication: { distribution: { download_url: "/datasets/occupations/download" } },
    });
    const params = Promise.resolve({ locale });
    const html = renderToStaticMarkup(await DatasetHubPage({ params }));
    expect(html).toContain(locale === "zh" ? "覆盖 1045 个职业" : "Covers 1045 tracked occupations");
    expect(html).not.toContain("342");
    const metadata = await generateMetadata({ params });
    expect(metadata.description).not.toContain("342");
  });

  it("keeps unavailable dataset responses distinct from a coverage claim", async () => {
    fetchDataset.mockResolvedValue(null);
    await expect(DatasetHubPage({ params: Promise.resolve({ locale: "en" }) })).rejects.toThrow();
  });

  it("renders backend dataset hub contract with dedicated structured data surface", () => {
    const source = read("app/(localized)/[locale]/datasets/occupations/page.tsx");

    expect(source).toContain("fetchCareerDatasetHub");
    expect(source).toContain("adaptCareerDatasetHub");
    expect(source).toContain("DatasetHubShell");
    expect(source).toContain("DatasetFilterHub");
    expect(source).toContain("DatasetDownloadInfo");
    expect(source).toContain("Included / Excluded");
    expect(source).toContain("publicDetailIndexableCount");
    expect(source).toContain("publicDetailConservativeCount");
    expect(source).toContain("dataset.facetDistributions");
    expect(source).toContain("JsonLd");
    expect(source).toContain('id="dataset-hub-jsonld"');
    expect(source).toContain('id="dataset-hub-breadcrumb-jsonld"');
    expect(source).toContain('data-testid="dataset-hub-page"');
    expect(source).toContain('data-testid="dataset-method-entry"');
    expect(source).not.toContain("fetchCareerJobBundle");
    expect(source).not.toContain("fetchCareerFamilyHub");
    expect(source).not.toContain("fetchCareerRecommendationBundle");
  });
});
