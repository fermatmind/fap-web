import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { getMbtiDesktopAnchorHash } from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneContentPayload,
} from "@/lib/cms/personality-desktop-clone";
import type { ReportResponse } from "@/lib/api/v0_3";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/cms/personality-desktop-clone", () => ({
  fetchPersonalityDesktopCloneContent: vi.fn(async () => null),
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

function getDesktopStickyRail(): HTMLElement {
  return within(getDesktopCloneShell()).getByTestId("mbti-sticky-rail");
}

function getDesktopHero(): HTMLElement {
  return within(getDesktopCloneShell()).getByTestId("mbti-hero");
}

function createReportFixture(): ReportResponse {
  return structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
}

function createProjectionReportFixture(): ReportResponse {
  return applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse);
}

function createDtoPreviewFixture(): ReportResponse {
  const reportData = applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse);
  const sections = reportData.report?.sections as Record<string, unknown> | undefined;
  const growthSection = sections?.growth as { cards?: Array<Record<string, unknown>> } | undefined;

  if (!growthSection) {
    throw new Error("Expected growth section in MBTI fixture");
  }

  growthSection.cards = [];
  reportData.locked = true;
  reportData.variant = "free";
  reportData.access_level = "free";
  reportData.modules_allowed = ["core_free"];
  reportData.modules_preview = ["core_full"];
  reportData.mbti_preview_v1 = {
    mode: "module_preview",
    modules: ["core_full"],
    sections: [
      {
        key: "growth",
        module_code: "core_full",
        has_preview_content: true,
        visible_preview_cards: [
          {
            id: "dto_growth_card",
            title: "DTO preview growth card",
            body: "DTO-owned preview content should render even without raw section cards.",
            bullets: ["DTO path is authoritative"],
            tips: [],
            tags: ["dto"],
            module_code: "core_full",
            access_level: "preview",
          },
        ],
        has_locked_remainder: true,
      },
    ],
  };

  return reportData;
}

function createCustomCta(overrides: Partial<NonNullable<ReportResponse["cta"]>> = {}) {
  return {
    visible: true,
    kind: "upsell",
    title: "解锁完整 MBTI 报告",
    subtitle: "查看更完整的人格层、成长路线、关系洞察与推荐阅读。",
    primary_label: "解锁完整报告",
    secondary_label: "先看免费版",
    benefit_bullets: [
      "获得四大正式模块的完整正文与更深的分析视角",
      "查看稳定输出的推荐阅读与更完整的人格层内容",
      "继续沿用当前结果，无需重新测试即可解锁",
    ],
    badge: "完整版",
    target_sku: "MBTI_REPORT_FULL",
    target_sku_effective: "MBTI_REPORT_FULL_199",
    ...overrides,
  };
}

function createDesktopClonePayload(fullCode: "ENFJ-T"): PersonalityDesktopCloneContentPayload {
  const keywordSet = ["共情", "愿景感", "协调者", "服务型领导", "价值驱动", "自我反思"];
  const listItems = [1, 2, 3, 4, 5, 6].map((index) => ({
    title: `list title ${index}`,
    body: `list body ${index}`,
  })) as [
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
  ];

  return {
    templateKey: "mbti_desktop_clone_v1",
    schemaVersion: "v1",
    fullCode,
    baseCode: "ENFJ",
    locale: "zh-CN",
    content: {
      hero: {
        summary: "desktop clone hero summary",
        profileIdentity: {
          code: "ENFJ-T",
          name: "主人公型",
          nickname: "温柔引路人",
          rarity: "约 2–5%",
          keywords: keywordSet,
        },
      },
      intro: { paragraphs: ["intro paragraph 1", "intro paragraph 2"] },
      lettersIntro: {
        headline: "letters headline",
        letters: [
          { letter: "E", title: "外向", description: "说明一" },
          { letter: "N", title: "直觉", description: "说明二" },
        ],
      },
      overview: {
        title: "overview title",
        paragraphs: ["overview 1", "overview 2"],
      },
      traits: {
        summaryPane: {
          eyebrow: "traits eyebrow",
          title: "traits title",
          value: "67%",
          body: "traits body",
        },
        body: ["traits paragraph 1", "traits paragraph 2"],
      },
      chapters: {
        career: {
          intro: ["career intro 1", "career intro 2"],
          influentialTraits: [
            { label: "trait 1", body: "trait body 1", colorKey: "blue" },
            { label: "trait 2", body: "trait body 2", colorKey: "gold" },
            { label: "trait 3", body: "trait body 3", colorKey: "green" },
            { label: "trait 4", body: "trait body 4", colorKey: "purple" },
          ],
          visibleBlocks: [{ title: "career visible", items: listItems }],
          lockedBlocks: [
            {
              title: "career locked 1",
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: listItems,
            },
            {
              title: "career locked 2",
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: listItems,
            },
          ],
        },
        growth: {
          intro: ["growth intro 1", "growth intro 2"],
          influentialTraits: [
            { label: "trait 1", body: "trait body 1", colorKey: "blue" },
            { label: "trait 2", body: "trait body 2", colorKey: "gold" },
            { label: "trait 3", body: "trait body 3", colorKey: "green" },
            { label: "trait 4", body: "trait body 4", colorKey: "purple" },
          ],
          visibleBlocks: [{ title: "growth visible", items: listItems }],
          lockedBlocks: [
            {
              title: "growth locked 1",
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: listItems,
            },
            {
              title: "growth locked 2",
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: listItems,
            },
          ],
        },
        relationships: {
          intro: ["relationships intro 1", "relationships intro 2"],
          influentialTraits: [
            { label: "trait 1", body: "trait body 1", colorKey: "blue" },
            { label: "trait 2", body: "trait body 2", colorKey: "gold" },
            { label: "trait 3", body: "trait body 3", colorKey: "green" },
            { label: "trait 4", body: "trait body 4", colorKey: "purple" },
          ],
          visibleBlocks: [{ title: "relationships visible", items: listItems }],
          lockedBlocks: [
            {
              title: "relationships locked 1",
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: listItems,
            },
            {
              title: "relationships locked 2",
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: listItems,
            },
          ],
        },
      },
      finalOffer: {
        eyebrow: "final offer eyebrow",
        headline: "final offer headline",
        body: "final offer body",
        priceLabel: "¥199",
        ctaLabel: "解锁完整报告",
        guarantee: "guarantee",
      },
    },
    assetSlots: [],
    meta: {
      authority_source: "storage",
      route_mode: "desktop-clone",
      public_route_type: "full_code_exact",
    },
  };
}

describe("RichResultReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(null);
  });

  it("routes MBTI public hero and canonical sections through projection while keeping commerce and authored layers on legacy", () => {
    const reportData = createProjectionReportFixture();
    expect(reportData.cta).toMatchObject({
      visible: true,
      kind: "upsell",
      target_sku: "MBTI_REPORT_FULL",
      target_sku_effective: "MBTI_REPORT_FULL_199",
    });
    if (!reportData.report) {
      throw new Error("Expected report payload");
    }
    if (!reportData.report.layers?.identity) {
      throw new Error("Expected identity layer");
    }
    reportData.cta = createCustomCta({
      title: "Unified MBTI unlock plan",
      subtitle: "Use one primary commerce surface and keep the rest as mirrors.",
      primary_label: "Unlock the authored MBTI report",
      benefit_bullets: ["Formal entitlement A", "Formal entitlement B"],
      badge: "Primary",
    });

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const hero = getPrimaryByTestId("mbti-hero");
    const stickyRail = getDesktopStickyRail();
    const traitsChapter = screen.getByTestId("mbti-chapter-traits");
    const careerChapter = screen.getByTestId("mbti-chapter-career");
    const growthChapter = screen.getByTestId("mbti-chapter-growth");
    const relationshipsChapter = screen.getByTestId("mbti-chapter-relationships");
    const careerNextStep = screen.getByTestId("mbti-career-next-step");
    const offerComparison = getPrimaryByTestId("mbti-offer-comparison");
    const reads = screen.getByTestId("mbti-recommended-reads");
    const footer = screen.getByTestId("mbti-footer-cta");

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
    expect(hero).toBeInTheDocument();
    expect(traitsChapter).toBeInTheDocument();
    expect(careerChapter).toBeInTheDocument();
    expect(growthChapter).toBeInTheDocument();
    expect(relationshipsChapter).toBeInTheDocument();
    expect(offerComparison).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(stickyRail).toBeInTheDocument();

    expect(traitsChapter.compareDocumentPosition(careerChapter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(careerChapter.compareDocumentPosition(growthChapter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(growthChapter.compareDocumentPosition(relationshipsChapter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(relationshipsChapter.compareDocumentPosition(careerNextStep) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(careerNextStep.compareDocumentPosition(offerComparison) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(offerComparison.compareDocumentPosition(reads) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(reads.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(within(hero).getByRole("heading", { name: /ENFP-T/ })).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(hero).toHaveTextContent("Projection-first summary that should replace the legacy hero copy on result pages.");
    expect(screen.queryByText("Legacy Hero Title Should Lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero subtitle should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero summary should lose to projection summary.")).not.toBeInTheDocument();

    expect(within(offerComparison).getByText("占位标题：完整报告收口位")).toBeInTheDocument();
    expect(within(offerComparison).getByText("¥1.99")).toBeInTheDocument();
    expect(within(offerComparison).getByRole("button", { name: "1.99元直接解锁" })).toBeInTheDocument();
    expect(within(offerComparison).getByRole("link", { name: "邀2人测完领报告" })).toBeInTheDocument();
    expect(within(stickyRail).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("offerFull")
    );
    expect(within(footer).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("offerFull")
    );
    expect(within(footer).getByRole("button", { name: "分享结果" })).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "重新测试" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types/take"
    );
    expect(screen.getByTestId("mbti-career-next-step-cta").getAttribute("href")).toContain(
      "/zh/career/recommendations/mbti/enfp-t?"
    );
    expect(screen.getByTestId("mbti-career-next-step-cta").getAttribute("href")).toContain(
      "carryover_focus_key=growth.next_actions"
    );

    fireEvent.click(screen.getByRole("link", { name: "Read the action note" }));
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "recommended_read_card",
        interaction: "click",
      })
    );
  });

  it("rewires the current visible hero and rail identity to authored desktop clone profileIdentity", async () => {
    const reportData = createProjectionReportFixture();
    const projection = reportData.mbti_public_projection_v1 as Record<string, unknown>;
    const summaryCard = projection.summary_card as Record<string, unknown>;

    projection.runtime_type_code = "ENFJ-T";
    projection.display_type = "ENFJ-T";
    projection.canonical_type_code = "ENFJ";
    projection.variant_code = "T";
    summaryCard.title = "Projection Campaigner";

    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createDesktopClonePayload("ENFJ-T"));

    render(<RichResultReport locale="zh" reportData={reportData} />);

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENFJ-T", "zh");
    });

    await waitFor(() => {
      const hero = getDesktopHero();
      const stickyRail = getDesktopStickyRail();
      const railIdentity = within(stickyRail).getByTestId("mbti-rail-profile-identity");

      expect(within(hero).getByRole("heading", { name: "ENFJ-T" })).toBeInTheDocument();
      expect(within(hero).getByTestId("mbti-hero-identity-line")).toHaveTextContent("主人公型 · 温柔引路人");
      expect(within(hero).getByTestId("mbti-hero-rarity")).toHaveTextContent("稀有度：约 2–5%");
      expect(within(hero).getByTestId("mbti-hero-keywords")).toHaveTextContent("共情");
      expect(within(hero).getByTestId("mbti-hero-keywords")).toHaveTextContent("自我反思");
      expect(hero).not.toHaveTextContent("Projection Campaigner");

      expect(railIdentity).toHaveTextContent("ENFJ-T");
      expect(railIdentity).toHaveTextContent("主人公型 · 温柔引路人");
      expect(railIdentity).toHaveTextContent("稀有度：约 2–5%");
      expect(railIdentity).toHaveTextContent("共情");
      expect(railIdentity).not.toHaveTextContent("Projection Tag Alpha");
    });
  });

  it("prefers mbti_preview_v1 over raw section scraping for MBTI preview chapters", () => {
    render(<RichResultReport locale="zh" reportData={createDtoPreviewFixture()} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-chapter-preview-growth")).not.toBeInTheDocument();
    expect(screen.queryByText("DTO preview growth card")).not.toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-premium-growth-what-energizes")).toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-premium-growth-what-drains")).toBeInTheDocument();
  });

  it("renders MBTI cross-assessment enhancements from backend authority without frontend inference", () => {
    const reportData = createProjectionReportFixture();
    const report = reportData.report as Record<string, unknown>;
    const reportMeta = (report._meta ?? {}) as Record<string, unknown>;
    const reportPersonalization = (reportMeta.personalization ?? {}) as Record<string, unknown>;
    const projection = reportData.mbti_public_projection_v1 as Record<string, unknown>;
    const projectionMeta = (projection._meta ?? {}) as Record<string, unknown>;
    const projectionPersonalization = (projectionMeta.personalization ?? {}) as Record<string, unknown>;
    const crossAssessment = {
      version: "mbti_big5.cross_assessment.v1",
      supporting_scales: ["BIG5_OCEAN"],
      synthesis_keys: [
        "big5.neuroticism.high.buffer_reactivity",
        "big5.conscientiousness.low.use_external_scaffolding",
      ],
      big5_influence_keys: ["big5.band.n.high", "big5.band.c.low"],
      mbti_adjusted_focus_keys: ["growth.stability_confidence", "growth.next_actions"],
      section_enhancements: {
        "growth.stability_confidence": {
          section_key: "growth.stability_confidence",
          supporting_scale: "BIG5_OCEAN",
          synthesis_key: "big5.neuroticism.high.buffer_reactivity",
          title: "Big Five 补充：高情绪性会放大情境敏感",
          body: "Big Five 显示你的情绪性更高，这会放大 MBTI 里情境敏感的体感强度。",
          influence_keys: ["big5.band.n.high"],
        },
        "growth.next_actions": {
          section_key: "growth.next_actions",
          supporting_scale: "BIG5_OCEAN",
          synthesis_key: "big5.conscientiousness.low.use_external_scaffolding",
          title: "Big Five 补充：低尽责性更需要外部支架",
          body: "把动作拆成更小的可逆步骤，再借助外部提醒和固定触发器。",
          influence_keys: ["big5.band.c.low"],
        },
      },
    };

    reportPersonalization.cross_assessment_v1 = crossAssessment;
    reportPersonalization.synthesis_keys = crossAssessment.synthesis_keys;
    reportPersonalization.supporting_scales = crossAssessment.supporting_scales;
    reportPersonalization.big5_influence_keys = crossAssessment.big5_influence_keys;
    reportPersonalization.mbti_adjusted_focus_keys = crossAssessment.mbti_adjusted_focus_keys;
    projectionPersonalization.cross_assessment_v1 = crossAssessment;
    projectionPersonalization.synthesis_keys = crossAssessment.synthesis_keys;
    projectionPersonalization.supporting_scales = crossAssessment.supporting_scales;
    projectionPersonalization.big5_influence_keys = crossAssessment.big5_influence_keys;
    projectionPersonalization.mbti_adjusted_focus_keys = crossAssessment.mbti_adjusted_focus_keys;

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-hero")).toHaveTextContent(
      "Projection-first summary that should replace the legacy hero copy on result pages."
    );
    expect(screen.queryByTestId("mbti-projection-section-growth-stability-confidence")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-projection-section-growth-next-actions")).not.toBeInTheDocument();
    expect(screen.queryByText("Big Five 显示你的情绪性更高")).not.toBeInTheDocument();
    expect(screen.queryByText("外部提醒")).not.toBeInTheDocument();
  });

  it("hides the recommended reads section when the array is empty", () => {
    const reportData = createReportFixture();
    if (!reportData.report) {
      throw new Error("Expected report payload");
    }
    reportData.report.recommended_reads = [];

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "view_result",
      expect.objectContaining({
        attempt_id: "attempt-123",
        typeCode: "ENFP-T",
        locale: "zh",
      })
    );
  });

  it("keeps rendering when authored layers are missing", () => {
    const reportData = createProjectionReportFixture();
    if (reportData.report) {
      reportData.report.layers = undefined;
    }

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-traits")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-footer-cta")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-overview-authored-intro")).not.toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-hero")).toHaveTextContent(
      "Projection-first summary that should replace the legacy hero copy on result pages."
    );
  });

  it("renders controlled narrative when the backend enables it without replacing canonical MBTI truth", () => {
    const reportData = applyMbtiPhase2Fixture(
      structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse,
      { narrativeMode: "mock" }
    );

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(getPrimaryByTestId("mbti-hero")).toHaveTextContent(
      "Projection-first summary that should replace the legacy hero copy on result pages."
    );
    expect(screen.queryByTestId("mbti-cultural-calibration-growth-next-actions")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
  });

  it("renders locale calibration for english while preserving canonical MBTI truth", () => {
    const reportData = applyMbtiPhase2Fixture(
      structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse,
      { narrativeMode: "mock", personalizationLocale: "en-US" }
    );

    render(<RichResultReport locale="en" reportData={reportData} />);

    expect(getPrimaryByTestId("mbti-hero")).toHaveTextContent(
      "Projection-first summary that should replace the legacy hero copy on result pages."
    );
    expect(screen.queryByTestId("mbti-cultural-calibration-growth-next-actions")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
  });

  it("routes BIG5 through assembler-driven shell wiring while keeping canonical content visible", () => {
    const reportData = {
      locked: false,
      variant: "full",
      quality: {
        level: "A",
      },
      norms: {
        status: "READY",
      },
      big5_public_projection_v1: {
        schema_version: "big5.public_projection.v1",
        dominant_traits: [
          { key: "O", label: "Openness", percentile: 81, band: "high", rank: 1 },
          { key: "A", label: "Agreeableness", percentile: 76, band: "high", rank: 2 },
        ],
        scene_fingerprint: {
          novelty: "exploratory",
          structure: "balanced",
          social_energy: "reserved",
        },
        explainability_summary: {
          headline: "This profile is primarily driven by Openness.",
        },
        action_plan_summary: {
          headline: "The best near-term growth lever is Extraversion.",
        },
        controlled_narrative_v1: {
          version: "controlled_narrative.v1",
          narrative_contract_version: "controlled_narrative.v1",
          runtime_mode: "mock",
          provider_name: "mock",
          model_version: "mock-narrative-model",
          prompt_version: "prompt.9d.v1",
          narrative_fingerprint: "big5-narrative-fixture",
          narrative_intro: "Controlled narrative runtime ready for traits Openness/Agreeableness.",
          narrative_summary: "This summary stays separate from the canonical Big Five explainability and action plan.",
          section_narrative_keys: ["traits.overview", "growth.next_actions"],
          enabled: true,
        },
        cultural_calibration_v1: {
          version: "cultural_calibration.v1",
          calibration_contract_version: "cultural_calibration.v1",
          locale_context: "en-US",
          cultural_context: "US.en-US",
          calibrated_section_keys: ["result.summary", "traits.overview"],
          calibration_fingerprint: "big5-calibration-fixture",
          calibration_policy_version: "runtime.locale_policy.v1",
          calibration_source: "runtime_policy",
          narrative_overrides: {
            intro: "Locale calibration: use the profile as a planning aid, not an identity box.",
            summary:
              "In an English-speaking context, trait signals should be framed as planning inputs for work style and environment fit, not as identity labels.",
          },
          section_overrides: {
            "traits.overview": {
              section_key: "traits.overview",
              title: "Locale calibration: turn traits into operating signals",
              body:
                "Frame the profile in terms of decision speed, collaboration style, and environment fit so the user can act on it immediately.",
            },
          },
          enabled: true,
        },
        trait_vector: [
          { key: "O", label: "Openness", percentile: 81, band_label: "exploratory" },
          { key: "C", label: "Conscientiousness", percentile: 61, band_label: "balanced" },
          { key: "E", label: "Extraversion", percentile: 48, band_label: "balanced" },
          { key: "A", label: "Agreeableness", percentile: 76, band_label: "harmonizing" },
          { key: "N", label: "Neuroticism", percentile: 22, band_label: "steady" },
        ],
        variant_keys: ["profile:explorer", "band:o.high"],
      },
      big5_form_v1: {
        form_code: "big5_90",
        label: "90-question standard version",
        short_label: "90 questions",
        question_count: 90,
        estimated_minutes: 11,
        scale_code: "BIG5_OCEAN",
      },
      report: {
        scale_code: "BIG5_OCEAN",
        sections: [
          {
            key: "traits.overview",
            title: "Traits Overview",
            access_level: "free",
            blocks: [
              {
                kind: "paragraph",
                title: "Traits Overview",
                body: "Legacy Big Five copy remains unchanged.",
              },
            ],
          },
        ],
      },
      meta: {
        scale_code: "BIG5_OCEAN",
      },
    } satisfies ReportResponse;

    render(
      <RichResultReport
        locale="en"
        reportData={reportData}
        accessProjection={{
          attemptId: "attempt-big5-123",
          accessState: "ready",
          reportState: "ready",
          pdfState: "ready",
          unlockStage: "full",
          unlockSource: "payment",
          reasonCode: "report_ready",
          accessLevel: "full",
          variant: "full",
          projectionVersion: 1,
          modulesAllowed: ["big5_full", "big5_action_plan"],
          modulesPreview: [],
          actions: {
            pageHref: "/en/result/attempt-big5-123",
            pdfHref: "/api/v0.3/attempts/attempt-big5-123/report.pdf",
            waitHref: null,
            historyHref: "/en/history/big5",
            lookupHref: "/en/orders/lookup",
          },
          meta: {
            producedAt: "2026-03-26T00:00:00Z",
            refreshedAt: "2026-03-26T00:00:00Z",
          },
        }}
      />
    );

    expect(screen.queryByTestId("mbti-result-shell")).not.toBeInTheDocument();
    expect(screen.getByTestId("big5-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("big5-form-summary")).toHaveTextContent("Big Five · 90-question standard version");
    expect(screen.getByTestId("big5-access-summary")).toBeInTheDocument();
    expect(screen.getByTestId("big5-dimensions")).toBeInTheDocument();
    expect(screen.getByTestId("big5-sections")).toBeInTheDocument();
    expect(screen.getByTestId("big5-actions-card")).toBeInTheDocument();
    expect(screen.getByTestId("big5-pdf-entry")).toBeInTheDocument();
    expect(screen.getByTestId("big5-foundation-summary")).toBeInTheDocument();
    expect(screen.getByTestId("big5-controlled-narrative")).toHaveAttribute("data-runtime-mode", "mock");
    expect(screen.getByTestId("big5-cultural-calibration")).toHaveAttribute(
      "data-cultural-context",
      "US.en-US"
    );
    expect(screen.getByTestId("big5-cultural-calibration")).toHaveTextContent(
      "Locale calibration: use the profile as a planning aid, not an identity box."
    );
    expect(screen.getByTestId("big5-controlled-narrative")).toHaveTextContent(
      "Controlled narrative runtime ready for traits Openness/Agreeableness."
    );
    expect(screen.getByTestId("big5-scene-fingerprint")).toHaveTextContent("novelty");
    expect(screen.getByTestId("big5-action-plan-summary")).toHaveTextContent(
      "The best near-term growth lever is Extraversion."
    );
    expect(screen.queryByText("Result status")).not.toBeInTheDocument();
    expect(screen.queryByText("Available modules")).not.toBeInTheDocument();
    expect(screen.getByText("You can read now")).toBeInTheDocument();
    expect(screen.getByText("Included in this report")).toBeInTheDocument();
    expect(screen.queryByText("Bring the paid modules back into the formal result path")).not.toBeInTheDocument();
    expect(screen.getByText("Step 1 · Page 1")).toBeInTheDocument();
    expect(screen.getByText("Step 8 · Page 8")).toBeInTheDocument();
    expect(screen.getAllByText("Domains Overview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Methodology and Access").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Traits Overview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Legacy Big Five copy remains unchanged.").length).toBeGreaterThan(0);
  });

  it("keeps BIG5 full runtime payload fully readable even when paid-tagged sections are present", () => {
    const reportData = {
      ok: true,
      locked: false,
      variant: "full",
      access_level: "full",
      modules_allowed: ["big5_core", "big5_full", "big5_action_plan"],
      offers: [],
      report: {
        scale_code: "BIG5_OCEAN",
        sections: [
          {
            key: "traits.overview",
            title: "Traits Overview",
            access_level: "free",
            blocks: [{ kind: "paragraph", body: "Visible overview." }],
          },
          {
            key: "growth.next_actions",
            title: "Next actions",
            access_level: "paid",
            module_code: "big5_action_plan",
            blocks: [{ kind: "paragraph", body: "Paid-tagged block should still render in full path." }],
          },
        ],
      },
      meta: {
        scale_code: "BIG5_OCEAN",
      },
    } as ReportResponse;

    render(
      <RichResultReport
        locale="zh"
        reportData={reportData}
        accessProjection={{
          attemptId: "attempt-big5-full",
          accessState: "ready",
          reportState: "ready",
          pdfState: "ready",
          unlockStage: "full",
          unlockSource: "payment",
          reasonCode: "report_ready",
          accessLevel: "full",
          variant: "full",
          projectionVersion: 1,
          modulesAllowed: ["big5_core", "big5_full", "big5_action_plan"],
          modulesPreview: [],
          actions: {
            pageHref: "/zh/result/attempt-big5-full",
            pdfHref: "/api/v0.3/attempts/attempt-big5-full/report.pdf",
            waitHref: null,
            historyHref: "/zh/history/big5",
            lookupHref: "/zh/orders/lookup",
          },
          meta: {
            producedAt: "2026-03-26T00:00:00Z",
            refreshedAt: "2026-03-26T00:00:00Z",
          },
        }}
      />
    );

    expect(screen.queryByTestId("big5-locked-sections")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-offer-surface")).not.toBeInTheDocument();
    expect(screen.queryByText("解锁完整报告")).not.toBeInTheDocument();
  });

  it("renders BIG5 comparative guidance without mutating the foundation summary", () => {
    const reportData = {
      ok: true,
      locked: true,
      variant: "free",
      big5_public_projection_v1: {
        schema_version: "big5.public_projection.v1",
        dominant_traits: [{ key: "O", label: "Openness", percentile: 81, band: "high", rank: 1 }],
        scene_fingerprint: { novelty: "exploratory" },
        explainability_summary: {
          headline: "This profile is primarily driven by Openness.",
        },
        action_plan_summary: {
          headline: "The best near-term growth lever is Extraversion.",
        },
        comparative_v1: {
          version: "comparative.norming.v1",
          comparative_contract_version: "comparative.norming.v1",
          enabled: true,
          percentile: { metric_key: "O", metric_label: "Openness", value: 81 },
          cohort_relative_position: {
            key: "cohort.upper_quartile",
            label: "Above most peers in this cohort",
            summary: "This trait cluster sits in the upper quartile of the current norming cohort.",
          },
          same_type_contrast: {
            key: "same_type.lead_trait_high",
            label: "Higher-openness version of this profile",
            summary: "Compared with nearby profiles, Openness is the clearest separating signal.",
          },
          norming_version: "2026Q1",
          norming_scope: "US.en-US.big5_population",
          norming_source: "scale_norms",
          comparative_fingerprint: "big5-comparative-fixture",
        },
      },
      report: {
        scale_code: "BIG5_OCEAN",
        profile: { type_name: "Openness-led profile" },
      },
    } as ReportResponse;

    render(<RichResultReport locale="en" reportData={reportData} />);

    expect(screen.getByTestId("big5-comparative")).toHaveAttribute("data-norming-version", "2026Q1");
    expect(screen.getByTestId("big5-comparative")).toHaveTextContent("Openness lands at the 81th percentile");
    expect(screen.getByTestId("big5-foundation-summary")).toHaveTextContent("This profile is primarily driven by Openness.");
  });

  it("renders BIG5 locked sections with unlock offers while keeping the shell on the formal result path", () => {
    const reportData = {
      ok: true,
      locked: true,
      variant: "free",
      offers: [
        {
          sku: "BIG5_REPORT_FULL",
          title: "BIG5 Full Report",
          formatted_price: "¥99",
          modules_included: ["big5_full", "big5_action_plan"],
        },
      ],
      big5_public_projection_v1: {
        schema_version: "big5.public_projection.v1",
        explainability_summary: {
          headline: "This profile is primarily driven by Openness.",
        },
        trait_vector: [{ key: "O", label: "Openness", percentile: 81, band_label: "exploratory" }],
      },
      report: {
        scale_code: "BIG5_OCEAN",
        sections: [
          {
            key: "traits.overview",
            title: "Traits Overview",
            access_level: "free",
            blocks: [{ kind: "paragraph", body: "Visible overview." }],
          },
          {
            key: "growth.next_actions",
            title: "Next actions",
            access_level: "paid",
            module_code: "big5_action_plan",
            blocks: [],
          },
        ],
      },
      meta: {
        scale_code: "BIG5_OCEAN",
      },
    } as ReportResponse;

    render(
      <RichResultReport
        locale="zh"
        reportData={reportData}
        accessProjection={{
          attemptId: "attempt-big5-locked",
          accessState: "locked",
          reportState: "ready",
          pdfState: "unavailable",
          unlockStage: "locked",
          unlockSource: "none",
          reasonCode: "payment_required",
          accessLevel: "preview",
          variant: "free",
          projectionVersion: 1,
          modulesAllowed: [],
          modulesPreview: ["big5_core"],
          actions: {
            pageHref: "/zh/result/attempt-big5-locked",
            pdfHref: null,
            waitHref: null,
            historyHref: "/zh/history/big5",
            lookupHref: "/zh/orders/lookup",
          },
          meta: {
            producedAt: "2026-03-26T00:00:00Z",
            refreshedAt: "2026-03-26T00:00:00Z",
          },
        }}
      />
    );

    expect(screen.getByTestId("big5-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("big5-locked-sections")).toBeInTheDocument();
    expect(screen.getByTestId("big5-offer-surface")).toBeInTheDocument();
    expect(screen.getByText("当前可读")).toBeInTheDocument();
    expect(screen.getByText("解锁后可继续")).toBeInTheDocument();
    expect(screen.getByText("解锁更深入的特质解释与行动建议")).toBeInTheDocument();
    expect(screen.getByText("BIG5 Full Report")).toBeInTheDocument();
    expect(screen.getByText("¥99")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "解锁后下载 PDF" })).toBeDisabled();
  });

  it("keeps MBTI preview locking behavior when full module is absent", () => {
    const reportData = createReportFixture();
    reportData.locked = true;
    reportData.variant = "free";
    reportData.access_level = "free";
    reportData.modules_allowed = ["core_free"];
    reportData.modules_preview = ["core_full"];
    reportData.offers = [];
    reportData.cta = createCustomCta();

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const stickyRail = getDesktopStickyRail();
    expect(within(stickyRail).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(screen.getByTestId("mbti-footer-cta")).toBeInTheDocument();
  });
});
