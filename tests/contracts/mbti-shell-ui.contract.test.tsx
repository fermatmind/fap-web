import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";
import { getMbtiDesktopAnchorHash } from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneContentPayload,
} from "@/lib/cms/personality-desktop-clone";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  trackObservableFunnelEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
  trackObservableFunnelEvent: hoisted.trackObservableFunnelEvent,
}));
vi.mock("@/lib/cms/personality-desktop-clone", () => ({
  fetchPersonalityDesktopCloneContent: vi.fn(async () => null),
  normalizeDesktopCloneTypeSlug: (fullCode: string | null | undefined) => {
    const normalized = String(fullCode ?? "").trim().toUpperCase();
    return /^[IE][NS][TF][JP]-[AT]$/.test(normalized) ? normalized.toLowerCase() : null;
  },
}));

function getPrimaryByTestId(testId: string): HTMLElement {
  const [node] = screen.getAllByTestId(testId);
  if (!node) {
    throw new Error(`Missing test id: ${testId}`);
  }

  return node;
}

function createLockedProjectionFixture(): ReportResponse {
  const reportData = applyMbtiPhase2Fixture(
    structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse
  );
  reportData.mbti_form_v1 = {
    form_code: "mbti_93",
    label: "93题标准版",
    short_label: "93题",
    question_count: 93,
    estimated_minutes: 10,
    scale_code: "MBTI",
  };
  reportData.mbti_preview_v1 = {
    mode: "none",
    modules: [],
    sections: [],
  };

  return reportData;
}

function createLockedIsfpTProjectionFixture(): ReportResponse {
  const reportData = createLockedProjectionFixture();
  if (!reportData.mbti_public_projection_v1) {
    throw new Error("Expected MBTI public projection fixture");
  }

  reportData.mbti_public_projection_v1.canonical_type_code = "ISFP";
  reportData.mbti_public_projection_v1.display_type = "ISFP-T";
  reportData.mbti_public_projection_v1.runtime_type_code = "ISFP-T";
  reportData.mbti_public_projection_v1.variant_code = "T";
  reportData.mbti_public_projection_v1.profile = {
    ...(reportData.mbti_public_projection_v1.profile ?? {}),
    type_name: "探险家型",
    nickname: "温柔感受者",
  };

  return reportData;
}

function createListItems(prefix: string) {
  return [
    { title: `${prefix} 1`, body: `${prefix} body 1` },
    { title: `${prefix} 2`, body: `${prefix} body 2` },
    { title: `${prefix} 3`, body: `${prefix} body 3` },
    { title: `${prefix} 4`, body: `${prefix} body 4` },
    { title: `${prefix} 5`, body: `${prefix} body 5` },
    { title: `${prefix} 6`, body: `${prefix} body 6` },
  ] as [
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
  ];
}

function createStrengthItems(prefix: string) {
  return [1, 2, 3, 4, 5, 6].map((index) => ({
    title: `${prefix} ${index}`,
    description: `${prefix} description ${index}`,
  }));
}

function createLockedBlocks(prefix: string) {
  return [
    {
      title: `${prefix} locked primary`,
      overlayTitle: "解锁完整报告",
      overlayBody: "解锁后查看完整内容。",
      overlayCtaLabel: "解锁完整报告",
      blurredItems: createListItems(`${prefix} locked primary redacted`),
    },
    {
      title: `${prefix} locked secondary`,
      overlayTitle: "解锁完整报告",
      overlayBody: "解锁后查看完整内容。",
      overlayCtaLabel: "解锁完整报告",
      blurredItems: createListItems(`${prefix} locked secondary redacted`),
    },
  ] as [
    {
      title: string;
      overlayTitle: string;
      overlayBody: string;
      overlayCtaLabel: string;
      blurredItems: ReturnType<typeof createListItems>;
    },
    {
      title: string;
      overlayTitle: string;
      overlayBody: string;
      overlayCtaLabel: string;
      blurredItems: ReturnType<typeof createListItems>;
    },
  ];
}

function createPublicIsfpTDesktopClonePayload(): PersonalityDesktopCloneContentPayload {
  const chapter = (prefix: string) => ({
    intro: [`${prefix} public intro one`, `${prefix} public intro two`] as [string, string],
    influentialTraits: [
      { label: `${prefix} trait one`, body: "public trait body one", colorKey: "blue" },
      { label: `${prefix} trait two`, body: "public trait body two", colorKey: "gold" },
      { label: `${prefix} trait three`, body: "public trait body three", colorKey: "green" },
      { label: `${prefix} trait four`, body: "public trait body four", colorKey: "purple" },
    ] as [
      { label: string; body: string; colorKey: "blue" },
      { label: string; body: string; colorKey: "gold" },
      { label: string; body: string; colorKey: "green" },
      { label: string; body: string; colorKey: "purple" },
    ],
    visibleBlocks: [
      {
        title: `${prefix} visible block`,
        items: createListItems(`${prefix} visible item`),
      },
    ] as [{ title: string; items: ReturnType<typeof createListItems> }],
    lockedBlocks: createLockedBlocks(prefix),
  });

  return {
    templateKey: "mbti_desktop_clone_v1",
    schemaVersion: "v1",
    fullCode: "ISFP-T",
    baseCode: "ISFP",
    locale: "zh-CN",
    content: {
      hero: {
        summary: "ISFP-T public storage hero summary",
        profileIdentity: {
          code: "ISFP-T",
          name: "探险家型",
          nickname: "温柔感受者",
          rarity: "约 4-9%",
          keywords: ["感受力", "自由", "当下体验", "审美", "共情", "随性"],
        },
      },
      intro: {
        paragraphs: [
          "ISFP-T public storage intro one",
          "ISFP-T public storage intro two",
        ],
      },
      traits: {
        summaryPane: {
          eyebrow: "能力方向",
          title: "ISFP-T public storage traits title",
          value: "72%",
          body: "ISFP-T public storage traits body",
        },
        body: ["ISFP-T public trait body one", "ISFP-T public trait body two"],
      },
      chapters: {
        career: {
          ...chapter("career"),
          careerIdeas: {
            title: "paid-only career ideas should stay hidden while locked",
            items: createStrengthItems("paid-only career idea"),
          },
        },
        growth: chapter("growth"),
        relationships: chapter("relationships"),
      },
      finalOffer: {
        eyebrow: "完整报告",
        headline: "继续解锁完整报告",
        body: "查看完整报告后获得更细的结果。",
        priceLabel: "¥199",
        ctaLabel: "解锁完整报告",
        guarantee: "安全支付",
      },
    },
    assetSlots: [],
    meta: {
      authority_source: "personality_profile_variant_clone_contents",
      route_mode: "full_code_exact",
      public_route_type: "32-type",
    },
  };
}

function createMbtiAccessHubRaw(attemptId: string, orderNo: string): MbtiAccessHubV1Raw {
  return {
    access_state: "ready",
    report_access: {
      can_view_report: true,
      attempt_id: attemptId,
      order_no: orderNo,
      report_url: `/api/v0.3/attempts/${attemptId}/report`,
      source: "report_gate",
    },
    pdf_access: {
      can_download_pdf: true,
      report_pdf_url: `/api/v0.3/attempts/${attemptId}/report.pdf`,
      source: "attempt_pdf",
    },
    recovery: {
      can_lookup_order: true,
      can_request_claim_email: true,
      can_resend: true,
      attempt_id: attemptId,
      share_id: null,
      compare_invite_id: "cmp_invite_123",
    },
    workspace_lite: {
      has_entry: true,
      entry_kind: "mbti_history",
      attempt_id: attemptId,
    },
  };
}

function createUnlockedFixture(): ReportResponse {
  const reportData = structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
  reportData.locked = false;
  reportData.variant = "full";
  reportData.access_level = "paid";
  reportData.mbti_form_v1 = {
    form_code: "mbti_144",
    label: "144题完整版",
    short_label: "144题",
    question_count: 144,
    estimated_minutes: 15,
    scale_code: "MBTI",
  };
  reportData.modules_allowed = ["core_full", "career", "relationships"];
  reportData.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-unlocked-123", "ord_post_purchase_001");
  return reportData;
}

describe("MBTI shell UI contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchPersonalityDesktopCloneContent).mockReturnValue(new Promise(() => {}));
    window.sessionStorage.clear();
  });

  it("renders the locked current shell path without dormant modules", () => {
    render(<RichResultReport locale="zh" reportData={createLockedProjectionFixture()} />);

    const stickyRail = getPrimaryByTestId("mbti-sticky-rail");

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero-form-summary")).toHaveTextContent("MBTI · 93题标准版");
    expect(getPrimaryByTestId("mbti-hero")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-footer-cta")).toBeInTheDocument();
    expect(stickyRail).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-recommended-reads")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-relationships")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-post-purchase-section")).not.toBeInTheDocument();
    expect(within(stickyRail).getByText("2. Your Career Path")).toBeInTheDocument();
    expect(within(stickyRail).getByText("4. Your Relationships")).toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-footer-cta")).getByRole("button", { name: "分享结果" })).toBeInTheDocument();

    expect(
      within(stickyRail).getByRole("link", { name: "解锁完整报告" })
    ).toHaveAttribute("href", "#mbti-desktop-offer-full");
  });

  it("loads public desktop clone storage on locked MBTI results without leaking paid-only blocks", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createPublicIsfpTDesktopClonePayload());

    render(<RichResultReport locale="zh" reportData={createLockedIsfpTProjectionFixture()} />);

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ISFP-T", "zh");
    });

    expect(await screen.findByText("ISFP-T public storage intro one")).toBeInTheDocument();
    expect(screen.getByText("career public intro one")).toBeInTheDocument();
    expect(screen.getByText("growth public intro one")).toBeInTheDocument();
    expect(screen.getByText("relationships public intro one")).toBeInTheDocument();
    expect(screen.getByText("career trait one")).toBeInTheDocument();
    expect(screen.getByText("growth trait one")).toBeInTheDocument();
    expect(screen.getByText("relationships trait one")).toBeInTheDocument();

    expect(screen.queryByText(/第一段简介用于保留桌面概览位/)).not.toBeInTheDocument();
    expect(screen.queryByText(/职业章节第一段/)).not.toBeInTheDocument();
    expect(screen.queryByText(/成长章节第一段/)).not.toBeInTheDocument();
    expect(screen.queryByText(/关系章节第一段/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Placeholder trait slot/)).not.toBeInTheDocument();
    expect(screen.queryByText("paid-only career ideas should stay hidden while locked")).not.toBeInTheDocument();
    expect(screen.queryByText("paid-only career idea 1")).not.toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
  });

  it("renders the unlocked workspace in the main offer slot", () => {
    render(<RichResultReport locale="zh" reportData={createUnlockedFixture()} />);

    const terminalSurface = getPrimaryByTestId("mbti-post-purchase-section");
    const stickyRail = getPrimaryByTestId("mbti-sticky-rail");
    const footer = screen.getByTestId("mbti-footer-cta");

    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(terminalSurface).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
    expect(within(terminalSurface).getByRole("button", { name: "下载 PDF" })).toBeInTheDocument();
    expect(within(terminalSurface).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute(
      "href",
      "/zh/history/mbti"
    );
    expect(within(terminalSurface).getByRole("link", { name: "关系回访入口" })).toHaveAttribute(
      "href",
      "/zh/relationships/mbti"
    );
    expect(within(stickyRail).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute(
      "href",
      "/zh/history/mbti"
    );
    expect(within(footer).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute(
      "href",
      "/zh/history/mbti"
    );
    expect(screen.getByTestId("mbti-hero-form-summary")).toHaveTextContent("MBTI · 144题完整版");
  });

  it("keeps the clone shell as the only MBTI renderer across viewport buckets", () => {
    const reportData = createLockedProjectionFixture();
    const matchMediaMock = vi.fn((query: string) => ({
      matches: query === "(min-width: 1280px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    vi.stubGlobal("matchMedia", matchMediaMock);

    const desktopRender = render(<RichResultReport locale="zh" reportData={reportData} />);
    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-sticky-rail")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("mbti-sticky-rail")).getByRole("link", { name: "解锁完整报告" })
    ).toHaveAttribute("href", getMbtiDesktopAnchorHash("offerFull"));

    desktopRender.unmount();

    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-sticky-rail")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-relationships")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("mbti-sticky-rail")).getByRole("link", { name: "解锁完整报告" })
    ).toHaveAttribute("href", getMbtiDesktopAnchorHash("offerFull"));
  });

  it("emits shell-first-paint loading phase telemetry when MBTI shell mounts", async () => {
    render(<RichResultReport locale="zh" reportData={createLockedProjectionFixture()} />);

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_report_loading_phase",
        expect.objectContaining({
          scale_code: "MBTI",
          phase: "result_shell_first_paint",
        }),
      );
    });
  });
});
