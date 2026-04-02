import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-preview-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

function getPrimaryByTestId(testId: string): HTMLElement {
  const [node] = screen.getAllByTestId(testId);
  if (!node) {
    throw new Error(`Missing test id: ${testId}`);
  }

  return node;
}

function getDesktopCloneShell(): HTMLElement {
  return screen.getByTestId("mbti-desktop-clone-shell");
}

function createPreviewFixture(modulesPreview: string[] = ["career", "relationships", "core_full"]): ReportResponse {
  const reportData = applyMbtiPhase2Fixture(
    structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse
  );
  const freeFixture = structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
  const projectionSections = reportData.report?.sections as Record<string, unknown> | undefined;
  const freeSections = freeFixture.report?.sections as Record<string, unknown> | undefined;

  if (!projectionSections || !freeSections) {
    throw new Error("Expected MBTI sections in preview fixture");
  }

  projectionSections.growth = structuredClone(freeSections.growth);
  const growthSection = projectionSections.growth as { cards?: Array<Record<string, unknown>> };
  growthSection.cards = [
    ...(Array.isArray(growthSection.cards) ? growthSection.cards : []),
    {
      id: "growth_paid_hidden",
      title: "这个付费卡不应该在 preview 中出现",
      desc: "Paid-only content should remain hidden.",
      access_level: "paid",
      module_code: "core_full",
    },
  ];

  reportData.locked = true;
  reportData.variant = "free";
  reportData.access_level = "free";
  reportData.modules_allowed = ["core_free"];
  reportData.modules_preview = modulesPreview;
  const chapterPreviewVisible = modulesPreview.includes("core_full");
  reportData.mbti_preview_v1 = {
    mode: chapterPreviewVisible ? "module_preview" : "none",
    modules: modulesPreview,
    sections: chapterPreviewVisible
      ? [
          {
            key: "career",
            module_code: "core_full",
            has_preview_content: true,
            visible_preview_cards: [
              {
                id: "career_preview_dto_1",
                title: "把喜欢做的事情变成可持续投入",
                body: "先从你自然愿意反复进入的工作情境里识别出更稳定的职业线索。",
                bullets: ["把偏好写成筛选标准", "先验证能长期投入的工作节奏"],
                tips: ["先排除明显消耗你的岗位环境"],
                tags: ["Career", "Preview"],
                module_code: "core_full",
                access_level: "preview",
              },
            ],
            has_locked_remainder: true,
          },
          {
            key: "growth",
            module_code: "core_full",
            has_preview_content: true,
            visible_preview_cards: [
              {
                id: "growth_preview_dto_1",
                title: "你的成长主线：把强项做成可复用资产",
                body: "先把已经稳定出现的强项沉淀成自己的方法，再逐步扩展到更复杂的场景。",
                bullets: ["把优势写成流程", "优先选择可复用的增长动作"],
                tips: ["先从一周内能重复执行的动作开始"],
                tags: ["Growth", "Preview"],
                module_code: "core_full",
                access_level: "preview",
              },
            ],
            has_locked_remainder: true,
          },
          {
            key: "relationships",
            module_code: "core_full",
            has_preview_content: true,
            visible_preview_cards: [
              {
                id: "relationships_preview_dto_1",
                title: "你会先用稳定和细节建立信任",
                body: "别人通常先从你的可靠、温和和边界感里感受到安全感。",
                bullets: ["关系里先给稳定回应", "用小细节表达在意"],
                tips: ["冲突出现时先确认彼此真实需求"],
                tags: ["Relationships", "Preview"],
                module_code: "core_full",
                access_level: "preview",
              },
            ],
            has_locked_remainder: true,
          },
        ]
      : [],
  };

  return reportData;
}

describe("MBTI preview semantics contract", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("keeps teaser surfaces on the desktop clone shell when the preview module is allowed", () => {
    render(<RichResultReport locale="zh" reportData={createPreviewFixture()} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");
    const desktopCloneShell = within(getDesktopCloneShell());

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-chapter-preview-growth")).not.toBeInTheDocument();
    expect(screen.queryByText("你的成长主线：把强项做成可复用资产")).not.toBeInTheDocument();
    expect(desktopCloneShell.getByTestId("mbti-premium-career-career-ideas")).toBeInTheDocument();
    expect(desktopCloneShell.getByTestId("mbti-premium-career-work-styles")).toBeInTheDocument();
    expect(desktopCloneShell.getByTestId("mbti-premium-growth-what-energizes")).toBeInTheDocument();
    expect(desktopCloneShell.getByTestId("mbti-premium-growth-what-drains")).toBeInTheDocument();
    expect(desktopCloneShell.getByTestId("mbti-premium-relationships-superpowers")).toBeInTheDocument();
    expect(desktopCloneShell.getByTestId("mbti-premium-relationships-pitfalls")).toBeInTheDocument();
    expect(screen.queryByText("这个付费卡不应该在 preview 中出现")).not.toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-growth-traits-lock-panel")).toBeInTheDocument();
  });

  it("keeps teaser rendering even when the raw section no longer carries preview cards", () => {
    const reportData = createPreviewFixture();
    const sections = reportData.report?.sections as Record<string, unknown> | undefined;
    const growthSection = sections?.growth as { cards?: Array<Record<string, unknown>> } | undefined;

    if (!growthSection) {
      throw new Error("Expected growth section in MBTI fixture");
    }

    growthSection.cards = growthSection.cards?.filter((card) => card.access_level !== "preview") ?? [];

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");

    expect(screen.queryByTestId("mbti-chapter-preview-growth")).not.toBeInTheDocument();
    expect(screen.queryByText("你的成长主线：把强项做成可复用资产")).not.toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-growth-traits-lock-panel")).toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-premium-growth-what-energizes")).toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-premium-growth-what-drains")).toBeInTheDocument();
  });

  it("keeps the teaser path when the preview module does not match", () => {
    render(<RichResultReport locale="zh" reportData={createPreviewFixture(["career"])} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");

    expect(screen.queryByTestId("mbti-chapter-preview-growth")).not.toBeInTheDocument();
    expect(screen.queryByText("你的成长主线：把强项做成可复用资产")).not.toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-growth-traits-lock-panel")).toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-premium-growth-what-energizes")).toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-premium-growth-what-drains")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
  });
});
