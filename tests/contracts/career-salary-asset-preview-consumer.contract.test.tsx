import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CareerSalaryAssetPreviewSection } from "@/components/career/salary/CareerSalaryAssetPreviewSection";
import { ApiError, apiClient } from "@/lib/api-client";
import {
  hasCareerSalaryAssetPreviewSlug,
  isCareerSalaryAssetPreviewEnabled,
  shouldFetchCareerSalaryAssetPreview,
} from "@/lib/career/salaryAssetPreviewConfig";
import { fetchCareerSalaryAssetPreview, type CareerSalaryAssetPreviewAsset } from "@/lib/career/api/fetchCareerSalaryAssetPreview";

vi.mock("@/lib/api-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-client")>("@/lib/api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
    },
  };
});

const mockedGet = vi.mocked(apiClient.get);

function buildAsset(locale: "zh-CN" | "en" = "en", slug = "accountants-and-auditors"): CareerSalaryAssetPreviewAsset {
  const isZh = locale === "zh-CN";
  return {
    slug,
    locale,
    heading: isZh ? "会计师和审计师薪资与就业参考" : "Accountants and auditors salary reference",
    summary: {
      short_answer: isZh
        ? "中国大陆使用招聘市场可见证据，美国、英国和欧盟仅按各自来源边界阅读。"
        : "China is shown only as a recruitment-market signal, while US, UK, and EU references must be read within their source boundaries.",
    },
    china_recruitment_reference: {
      heading: isZh ? "中国招聘市场参考" : "China recruitment-market reference",
      display_monthly_range_cny: isZh ? "约 ¥6,000–10,000/月" : "about ¥6,000–10,000 per month",
      body: isZh
        ? "中国大陆部分只使用已通过审计的招聘市场证据，不是官方职业中位薪资。"
        : "The China section uses passed recruitment-market evidence only; it is not an official occupation wage.",
      data_boundary: isZh
        ? "这是招聘市场参考，不是中国官方单职业中位薪资。"
        : "This is a China recruitment-market reference, not an official Chinese single-occupation median wage.",
      limitations: [
        isZh
          ? "招聘平台样本会受城市、经验和岗位边界影响。"
          : "Platform, city, experience, and adjacent-role boundaries can materially change offers.",
      ],
    },
    us_official_reference: {
      heading: isZh ? "美国官方参考" : "US official reference",
      body: isZh ? "美国部分使用官方或公共职业来源。" : "The US section uses official or public career evidence.",
    },
    uk_reference: {
      heading: isZh ? "英国参考" : "UK reference",
      body: isZh ? "英国部分使用 UK National Careers 或有边界的相邻 profile。" : "The UK section uses a National Careers or audited adjacent profile.",
    },
    eu_context_boundary: {
      heading: isZh ? "欧盟语境边界" : "EU context boundary",
      body: isZh ? "欧盟部分只作为宏观语境边界。" : "The EU section is macro context only.",
    },
    salary_drivers: [
      { factor: isZh ? "岗位边界" : "Role boundary", description: isZh ? "具体岗位职责会改变招聘报价。" : "Exact responsibility scope changes offers." },
      { factor: isZh ? "地区与雇主" : "Location and employer", description: isZh ? "城市和雇主类型会影响区间。" : "City and employer type can materially change ranges." },
    ],
    reader_guidance: [
      isZh ? "中国薪资只读作招聘市场样本信号。" : "Read China pay only as recruitment-market evidence.",
      isZh ? "美国、英国和欧盟来源各有统计口径。" : "US, UK, and EU references use different source boundaries.",
    ],
    sources: [
      { source_id: "cn_001", market: "CN", name: "JobUI", url: "https://www.jobui.com/salary/quanguo-zhongjihuijishi/" },
      { source_id: "us_001", market: "US", name: "BLS OOH", url: "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
    ],
  };
}

describe("career salary asset preview consumer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED;
  });

  it("keeps the preview reader gated by server flag and backend availability instead of a frontend slug allowlist", () => {
    expect(isCareerSalaryAssetPreviewEnabled()).toBe(false);
    expect(shouldFetchCareerSalaryAssetPreview("accountants-and-auditors")).toBe(false);

    process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED = "true";
    expect(isCareerSalaryAssetPreviewEnabled()).toBe(true);
    expect(hasCareerSalaryAssetPreviewSlug("accountants-and-auditors")).toBe(true);
    expect(hasCareerSalaryAssetPreviewSlug("registered-nurses")).toBe(true);
    expect(hasCareerSalaryAssetPreviewSlug(" ")).toBe(false);
    expect(shouldFetchCareerSalaryAssetPreview("registered-nurses")).toBe(true);
  });

  it("does not call the preview API when the flag is closed or the slug is blank", async () => {
    await expect(fetchCareerSalaryAssetPreview({ locale: "en", slug: "accountants-and-auditors" })).resolves.toBeNull();
    expect(mockedGet).not.toHaveBeenCalled();

    process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED = "true";
    await expect(fetchCareerSalaryAssetPreview({ locale: "en", slug: " " })).resolves.toBeNull();
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("fails closed on 404 and invalid preview contracts", async () => {
    process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED = "true";
    mockedGet.mockRejectedValueOnce(new ApiError({ status: 404, errorCode: "NOT_FOUND", message: "Not found." }));
    await expect(fetchCareerSalaryAssetPreview({ locale: "en", slug: "accountants-and-auditors" })).resolves.toBeNull();

    mockedGet.mockResolvedValueOnce({ ok: true, preview: false, salary_asset_v1: buildAsset("en") });
    await expect(fetchCareerSalaryAssetPreview({ locale: "en", slug: "accountants-and-auditors" })).resolves.toBeNull();
  });

  it("accepts production-imported salary assets after the backend import gate", async () => {
    process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED = "true";
    mockedGet.mockResolvedValueOnce({
      ok: true,
      preview: false,
      status: "production_imported",
      salary_asset_v1: buildAsset("en", "accountants-and-auditors"),
    });

    const asset = await fetchCareerSalaryAssetPreview({ locale: "en", slug: "accountants-and-auditors" });

    expect(asset?.slug).toBe("accountants-and-auditors");
    expect(asset?.locale).toBe("en");
  });

  it("fetches and adapts the allowlisted staging preview asset by locale", async () => {
    process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED = "true";
    mockedGet.mockResolvedValueOnce({ ok: true, preview: true, salary_asset_v1: buildAsset("zh-CN") });

    const asset = await fetchCareerSalaryAssetPreview({ locale: "zh", slug: "accountants-and-auditors" });

    expect(asset?.locale).toBe("zh-CN");
    expect(asset?.china_recruitment_reference?.display_monthly_range_cny).toBe("约 ¥6,000–10,000/月");
    expect(mockedGet).toHaveBeenCalledWith(
      "/v0.5/career/jobs/accountants-and-auditors/salary-asset?locale=zh-CN",
      expect.objectContaining({
        locale: "zh",
        skipAuth: true,
      })
    );
  });

  it("fetches 1046-scale backend-governed preview assets beyond the original ten slug smoke list", async () => {
    process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED = "true";
    mockedGet.mockResolvedValueOnce({ ok: true, preview: true, salary_asset_v1: buildAsset("en", "registered-nurses") });

    const asset = await fetchCareerSalaryAssetPreview({ locale: "en", slug: "registered-nurses" });

    expect(asset?.slug).toBe("registered-nurses");
    expect(mockedGet).toHaveBeenCalledWith(
      "/v0.5/career/jobs/registered-nurses/salary-asset?locale=en",
      expect.objectContaining({
        locale: "en",
        skipAuth: true,
      })
    );
  });

  it("renders reader-facing salary preview without raw enum or lineage leakage", () => {
    render(<CareerSalaryAssetPreviewSection asset={buildAsset("en")} locale="en" />);

    const section = screen.getByTestId("career-salary-asset-preview");
    expect(section).toHaveTextContent("Accountants and auditors salary reference");
    expect(section).toHaveTextContent("China recruitment-market reference");
    expect(section).toHaveTextContent("not an official occupation wage");
    expect(section).toHaveTextContent("US official reference");
    expect(section).toHaveTextContent("UK reference");
    expect(section).toHaveTextContent("EU context boundary");
    expect(section).toHaveTextContent("CN: JobUI");
    expect(section).not.toHaveTextContent("industry_proxy");
    expect(section).not.toHaveTextContent("source_bounded_reference_only");
    expect(section).not.toHaveTextContent("recruitment_sample");
    expect(section).not.toHaveTextContent("salary_and_outlook");
    expect(section).not.toHaveTextContent("estimate_row_hash");
    expect(section.textContent).not.toMatch(/[\u3400-\u9fff]/);
  });

  it("keeps zh-CN salary copy locale-safe and avoids sparse official wage cards", () => {
    const asset = buildAsset("zh-CN");
    asset.china_official_context = {
      heading: "中国官方工资语境",
      body: "中国大陆没有在本资产中使用官方单职业中位薪资；官方行业或单位数据只能作为宏观语境。",
    };
    asset.china_recruitment_reference = {
      ...asset.china_recruitment_reference,
      data_boundary:
        "This is a China recruitment-market reference derived from platform samples, posting snippets, salary pages, or adjacent-role evidence; it is not an official Chinese single-occupation median wage.",
      limitations: [
        "China recruitment estimates are platform, posting, or salary-report signals only; they are not official Chinese single-occupation wages and not personal salary predictions.",
      ],
    };
    asset.us_official_reference = {
      ...asset.us_official_reference,
      limitations: [
        "OOH 10th/90th percentile evidence was captured where visible; p25/p75 still require OEWS or CareerOneStop extraction.",
      ],
    };
    asset.eu_context_boundary = {
      ...asset.eu_context_boundary,
      limitations: [
        "Do not present this as a unified EU occupation salary; use only as regional/macro boundary unless occupation-level EU data is later captured.",
      ],
    };

    render(<CareerSalaryAssetPreviewSection asset={asset} locale="zh" />);

    const section = screen.getByTestId("career-salary-asset-preview");
    expect(section).toHaveTextContent("这是基于平台样本、招聘片段、薪资页或相邻岗位证据形成的中国招聘市场参考");
    expect(section).toHaveTextContent("中国招聘薪资仅是平台、岗位片段或薪资报告信号");
    expect(section).toHaveTextContent("美国 OOH 可见的 10/90 分位证据按来源边界阅读");
    expect(section).toHaveTextContent("欧盟部分只作为区域或宏观边界");
    expect(section).toHaveTextContent("中国大陆没有在本资产中使用官方单职业中位薪资");
    expect(screen.queryByRole("heading", { name: "中国官方工资语境" })).not.toBeInTheDocument();
    expect(section).not.toHaveTextContent("This is a China recruitment-market reference");
    expect(section).not.toHaveTextContent("China recruitment estimates are platform");
    expect(section).not.toHaveTextContent("Do not present this");
  });

  it("renders reader-safe sources even when backend projection omits internal source ids", () => {
    const asset = buildAsset("en");
    asset.sources = [
      { market: "CN", name: "JobUI", url: "https://www.jobui.com/salary/quanguo-zhongjihuijishi/" },
      { market: "US", name: "BLS OOH", url: "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
    ];

    render(<CareerSalaryAssetPreviewSection asset={asset} locale="en" />);

    const section = screen.getByTestId("career-salary-asset-preview");
    expect(section).toHaveTextContent("CN: JobUI");
    expect(section).toHaveTextContent("US: BLS OOH");
    expect(section).not.toHaveTextContent("cn_001");
    expect(section).not.toHaveTextContent("us_001");
  });

  it("renders nothing when the backend asset is absent", () => {
    const { container } = render(<CareerSalaryAssetPreviewSection asset={null} locale="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});
