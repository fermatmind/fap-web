import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CareerAiImpactPreviewSection } from "@/components/career/ai-impact/CareerAiImpactPreviewSection";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { ApiError, apiClient } from "@/lib/api-client";
import {
  hasCareerAiImpactAssetPreviewSlug,
  isCareerAiImpactAssetPreviewEnabled,
  shouldFetchCareerAiImpactAssetPreview,
} from "@/lib/career/aiImpactAssetPreviewConfig";
import {
  fetchCareerAiImpactAssetPreview,
  type CareerAiImpactPreviewAsset,
} from "@/lib/career/api/fetchCareerAiImpactAssetPreview";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildActorsDisplaySurfaceFixture, buildDisplaySurfaceClaimPermissions } from "@/tests/contracts/careerDisplaySurface.fixture";

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

function buildAsset(locale: "zh-CN" | "en" = "en", slug = "actuaries"): CareerAiImpactPreviewAsset {
  const isZh = locale === "zh-CN";

  return {
    slug,
    locale,
    occupation: {
      title: isZh ? "精算师" : "Actuaries",
      title_en: "Actuaries",
      title_zh: "精算师",
    },
    ai_exposure_score: {
      score_1_to_10: 8,
      confidence: "medium",
      exposure_type: "augmentation",
    },
    summary: isZh
      ? "FermatMind 将精算师评为 8/10 AI 任务暴露，重点集中在损失准备金、敏感性测试和报告草稿等可结构化工作流。"
      : "FermatMind rates actuaries at 8/10 AI task exposure, concentrated in reserving triangles, sensitivity testing, and report-drafting workflows.",
    items: {
      most_ai_exposed_workflows: [
        {
          title: isZh ? "准备金三角形检查" : "Reserving triangle review",
          body: isZh
            ? "AI 可以帮助整理历史赔付表、标出异常单元格，并生成供精算师复核的敏感性测试候选。"
            : "AI can organize historical claims triangles, flag unusual cells, and draft sensitivity-test candidates for actuarial review.",
        },
      ],
      human_accountability_anchors: [
        {
          title: isZh ? "假设责任" : "Assumption ownership",
          body: isZh
            ? "最终假设、模型边界和签字责任仍需要精算师解释给管理层、监管和业务团队。"
            : "Final assumptions, model boundaries, and sign-off accountability still require actuaries to explain tradeoffs to management, regulators, and business teams.",
        },
      ],
      how_to_prepare: [
        {
          title: isZh ? "项目证据" : "Project evidence",
          body: isZh
            ? "准备一份包含原始数据、清洗脚本、敏感性测试和结论变更说明的精算项目记录。"
            : "Build a project record that shows source data, cleaning scripts, sensitivity tests, and why final actuarial conclusions changed.",
        },
      ],
      reader_boundary: {
        title: isZh ? "AI 评分边界" : "AI score boundary",
        body: isZh
          ? "这个分数是任务暴露信号，不是个人职业结果预测。"
          : "This score is a task-exposure signal, not an individual career outcome forecast.",
      },
    },
    sources: [
      { name: "O*NET Online", url: "https://www.onetonline.org/link/summary/15-2011.00" },
      { name: "BLS Occupational Outlook Handbook", url: "https://www.bls.gov/ooh/math/actuaries.htm" },
    ],
  };
}

describe("career AI impact asset preview consumer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED;
  });

  it("keeps the preview reader gated by server flag and backend availability", () => {
    expect(isCareerAiImpactAssetPreviewEnabled()).toBe(false);
    expect(shouldFetchCareerAiImpactAssetPreview("actuaries")).toBe(false);

    process.env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED = "true";
    expect(isCareerAiImpactAssetPreviewEnabled()).toBe(true);
    expect(hasCareerAiImpactAssetPreviewSlug("actuaries")).toBe(true);
    expect(hasCareerAiImpactAssetPreviewSlug(" ")).toBe(false);
    expect(shouldFetchCareerAiImpactAssetPreview("actuaries")).toBe(true);
  });

  it("does not call the preview API when the flag is closed or the slug is blank", async () => {
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toBeNull();
    expect(mockedGet).not.toHaveBeenCalled();

    process.env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED = "true";
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: " " })).resolves.toBeNull();
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("fails closed on 404, preview-off payloads, slug mismatch, and internal lineage leakage", async () => {
    process.env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED = "true";
    mockedGet.mockRejectedValueOnce(new ApiError({ status: 404, errorCode: "NOT_FOUND", message: "Not found." }));
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toBeNull();

    mockedGet.mockResolvedValueOnce({ ok: true, preview: false, ai_impact_asset_v1: buildAsset("en") });
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toBeNull();

    mockedGet.mockResolvedValueOnce({ ok: true, preview: true, ai_impact_asset_v1: buildAsset("en", "accountants-and-auditors") });
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toBeNull();

    mockedGet.mockResolvedValueOnce({
      ok: true,
      preview: true,
      ai_impact_asset_v1: {
        ...buildAsset("en"),
        evidence_used: ["ai_impact_actuaries_en_001"],
      },
    });
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toBeNull();
  });

  it("fetches and adapts the staging preview asset by locale", async () => {
    process.env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED = "true";
    mockedGet.mockResolvedValueOnce({ ok: true, preview: true, ai_impact_asset_v1: buildAsset("zh-CN") });

    const asset = await fetchCareerAiImpactAssetPreview({ locale: "zh", slug: "actuaries" });

    expect(asset?.locale).toBe("zh-CN");
    expect(asset?.ai_exposure_score.score_1_to_10).toBe(8);
    expect(asset?.items.reader_boundary.body).toContain("不是个人职业结果预测");
    expect(mockedGet).toHaveBeenCalledWith(
      "/v0.5/career/jobs/actuaries/ai-impact-asset?locale=zh-CN",
      expect.objectContaining({
        locale: "zh",
        skipAuth: true,
      })
    );
  });

  it("rejects English reader payloads that contain Chinese or unsafe outcome wording", async () => {
    process.env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED = "true";
    mockedGet.mockResolvedValueOnce({
      ok: true,
      preview: true,
      ai_impact_asset_v1: {
        ...buildAsset("en"),
        summary: "精算师 AI impact preview",
      },
    });
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toBeNull();

    mockedGet.mockResolvedValueOnce({
      ok: true,
      preview: true,
      ai_impact_asset_v1: {
        ...buildAsset("en"),
        items: {
          ...buildAsset("en").items,
          reader_boundary: {
            title: "AI score boundary",
            body: "This score is a career disappearance risk.",
          },
        },
      },
    });
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toBeNull();
  });

  it("renders reader-facing AI impact preview without raw enum or lineage leakage", () => {
    render(<CareerAiImpactPreviewSection asset={buildAsset("en")} locale="en" />);

    const section = screen.getByTestId("career-ai-impact-preview");
    expect(section).toHaveTextContent("AI Impact");
    expect(section).toHaveTextContent("8/10");
    expect(section).toHaveTextContent("Reserving triangle review");
    expect(section).toHaveTextContent("Assumption ownership");
    expect(section).toHaveTextContent("Project evidence");
    expect(section).toHaveTextContent("This score is a task-exposure signal");
    expect(section).toHaveTextContent("O*NET Online");
    expect(section).not.toHaveTextContent("evidence_id");
    expect(section).not.toHaveTextContent("row_hash");
    expect(section).not.toHaveTextContent("source_id");
    expect(section).not.toHaveTextContent("search_projection");
    expect(section).not.toHaveTextContent("score_rationale");
    expect(section).not.toHaveTextContent("audit_fields");
    expect(section.textContent).not.toMatch(/[\u3400-\u9fff]/);
  });

  it("replaces the legacy display-surface AI table only when a safe preview is present", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");

    render(
      <CareerDisplaySurface
        surface={surface}
        aiImpactSlot={<CareerAiImpactPreviewSection asset={buildAsset("en", "actors")} locale="en" />}
      />
    );

    expect(screen.getByTestId("career-ai-impact-preview")).toHaveTextContent("AI task exposure");
    expect(screen.queryByTestId("ai-impact-block")).not.toBeInTheDocument();
    expect(screen.queryByText("Will AI Replace Actors?")).not.toBeInTheDocument();
  });

  it("keeps AI impact preview hidden when backend claim permission blocks AI strategy", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.claim_permissions = buildDisplaySurfaceClaimPermissions({
      allow_ai_strategy: false,
      blocked_claims: ["ai_exposure_missing"],
    });
    const surface = adaptCareerDisplaySurface(fixture, "en");

    render(
      <CareerDisplaySurface
        surface={surface}
        aiImpactSlot={<CareerAiImpactPreviewSection asset={buildAsset("en", "actors")} locale="en" />}
      />
    );

    expect(screen.queryByTestId("career-ai-impact-preview")).not.toBeInTheDocument();
    expect(screen.getByTestId("claim-permission-notice-ai")).toHaveTextContent("AI strategy language is hidden");
  });

  it("renders nothing when the backend asset is absent", () => {
    const { container } = render(<CareerAiImpactPreviewSection asset={null} locale="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});
