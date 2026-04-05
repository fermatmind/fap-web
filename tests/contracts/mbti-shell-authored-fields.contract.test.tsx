import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { getMbtiDesktopAnchorHash } from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { ReportResponse } from "@/lib/api/v0_3";
import { buildMbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function createReportFixture(
  options?: Parameters<typeof applyMbtiPhase2Fixture>[1]
): ReportResponse {
  return applyMbtiPhase2Fixture(
    structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse,
    options
  );
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getPrimaryByTestId(testId: string): HTMLElement {
  return screen.getAllByTestId(testId)[0] as HTMLElement;
}

function getSectionPersonalization(reportData: ReportResponse, sectionKey: string) {
  const viewModel = buildMbtiResultProjectionViewModel(reportData);
  const section = viewModel.sections.find((item) => item.key === sectionKey);
  const personalization = asRecord(asRecord(section?.payload)?.personalization);

  if (!section || !personalization) {
    throw new Error(`Expected personalization payload for section: ${sectionKey}`);
  }

  return { viewModel, personalization };
}

function overrideProjectionSectionSelection(
  reportData: ReportResponse,
  sectionKey: string,
  selectedBlockIds: string[],
  sectionSelectionKey: string
) {
  const projection = asRecord(reportData.mbti_public_projection_v1);
  const sections = Array.isArray(projection?.sections) ? projection.sections : [];
  const section = sections.find((item) => asRecord(item)?.key === sectionKey);
  const sectionRecord = asRecord(section);
  const payload = asRecord(sectionRecord?.payload);
  const personalization = asRecord(payload?.personalization);
  const metaPersonalization = asRecord(asRecord(projection?._meta)?.personalization);

  if (!sectionRecord || !payload || !personalization || !metaPersonalization) {
    throw new Error(`Expected projection section personalization for ${sectionKey}`);
  }

  personalization.selected_blocks = selectedBlockIds;
  personalization.section_selection_key = sectionSelectionKey;

  const sectionSelectionKeys = asRecord(metaPersonalization.section_selection_keys) ?? {};
  sectionSelectionKeys[sectionKey] = sectionSelectionKey;
  metaPersonalization.section_selection_keys = sectionSelectionKeys;
}

describe("MBTI shell authored fields contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("keeps projection-first hero telemetry and a single clone shell while authored metadata stays available in the view model", () => {
    const reportData = createReportFixture();
    reportData.cta = createCustomCta({
      title: "正式商业主位标题",
      subtitle: "正式商业主位副标题",
      primary_label: "解锁作者化完整版",
      benefit_bullets: ["权益一", "权益二"],
      badge: "主推",
    });

    const viewModel = buildMbtiResultProjectionViewModel(reportData);

    expect(viewModel.personalization?.readContract?.version).toBe("mbti.read_contract.v1");
    expect(viewModel.personalization?.readContract?.overlayPatch?.personalizationFields).toContain(
      "longitudinal_memory_v1"
    );
    expect(viewModel.personalization?.readContract?.overlayPatch?.personalizationFields).toContain(
      "adaptive_selection_v1"
    );
    expect(viewModel.personalization?.readContract?.telemetryParityFields).toContain(
      "orchestration.primary_focus_key"
    );
    expect(viewModel.personalization?.longitudinalMemory?.memoryRewriteReason).toBe(
      "resume_growth_actions"
    );
    expect(viewModel.personalization?.adaptiveSelection?.selectionRewriteReason).toBe(
      "career_followthrough_loop"
    );
    expect(viewModel.personalization?.toneProfile?.toneFingerprint).toBe(
      "fixture-tone-fingerprint"
    );

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const hero = getPrimaryByTestId("mbti-hero");
    const stickyRail = getPrimaryByTestId("mbti-sticky-rail");

    expect(screen.getByTestId("mbti-result-shell")).toHaveAttribute(
      "data-profile-seed-key",
      "same_type.seed.name_decision_rule.jp"
    );
    expect(screen.getByTestId("mbti-result-shell")).toHaveAttribute(
      "data-selection-fingerprint",
      "fixture-selection-fingerprint"
    );
    expect(screen.getByTestId("mbti-result-shell")).toHaveAttribute(
      "data-memory-fingerprint",
      "fixture-memory-fingerprint"
    );
    expect(screen.getByTestId("mbti-result-shell")).toHaveAttribute(
      "data-memory-rewrite-reason",
      "resume_growth_actions"
    );
    expect(screen.getByTestId("mbti-result-shell")).toHaveAttribute(
      "data-adaptive-fingerprint",
      "fixture-adaptive-fingerprint"
    );
    expect(screen.getByTestId("mbti-result-shell")).toHaveAttribute(
      "data-selection-rewrite-reason",
      "career_followthrough_loop"
    );
    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-relationships")).toBeInTheDocument();
    expect(within(hero).getByRole("heading", { level: 1, name: /ENFP-T/ })).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(hero).toHaveTextContent(
      "Projection-first summary that should replace the legacy hero copy on result pages."
    );
    expect(screen.getByTestId("mbti-career-next-step")).toHaveAttribute("data-cta-rank", "2");
    expect(screen.getByTestId("mbti-career-next-step-cta").getAttribute("href")).toContain(
      "carryover_focus_key=growth.next_actions"
    );
    expect(screen.getByTestId("mbti-recommended-reads")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
      "data-recommendation-key",
      "read-action"
    );
    expect(getPrimaryByTestId("mbti-offers-primary-cta")).toHaveTextContent("1.99元直接解锁");
    expect(
      within(stickyRail).getByRole("link", { name: "解锁完整报告" })
    ).toHaveAttribute("href", getMbtiDesktopAnchorHash("offerFull"));

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "view_result",
      expect.objectContaining({
        attemptIdMasked: "attemp...-123",
        typeCode: "ENFP-T",
        identity: "T",
        variantKey: "overview:EI.E.clear:identity.T:boundary.none",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
        primaryFocusKey: "growth.next_actions",
        readingFocusKey: "read-action",
        actionFocusKey: "weekly_action.theme.name_decision_rule",
      })
    );
  });

  it("renders different memory rewrite selections through the projection model without forking the shell", () => {
    const actionFirst = createReportFixture({
      isRevisit: true,
      hasActionEngagement: true,
      memoryRewriteReason: "resume_growth_actions",
      memoryState: "active",
    });
    const clarityFirst = createReportFixture({
      isRevisit: true,
      hasFeedback: true,
      memoryRewriteReason: "refine_type_clarity",
      memoryState: "refining",
    });

    overrideProjectionSectionSelection(
      actionFirst,
      "growth.next_actions",
      [
        "growth.next_actions.next_action.EI.E",
        "growth.next_actions.identity.t",
        "growth.next_actions.boundary.TF",
      ],
      "growth.next_actions:memory.resume_growth_actions:mode.memory.action_resume"
    );
    overrideProjectionSectionSelection(
      clarityFirst,
      "growth.next_actions",
      [
        "growth.next_actions.axis_strength.EI.E.clear",
        "growth.next_actions.boundary.TF",
      ],
      "growth.next_actions:memory.refine_type_clarity:mode.memory.action_refine"
    );

    const actionSection = getSectionPersonalization(actionFirst, "growth.next_actions");
    const claritySection = getSectionPersonalization(clarityFirst, "growth.next_actions");

    expect(actionSection.personalization.section_selection_key).toContain("memory.resume_growth_actions");
    expect(actionSection.personalization.selected_blocks).toEqual([
      "growth.next_actions.next_action.EI.E",
      "growth.next_actions.identity.t",
      "growth.next_actions.boundary.TF",
    ]);
    expect(claritySection.personalization.section_selection_key).toContain("memory.refine_type_clarity");
    expect(claritySection.personalization.selected_blocks).toEqual([
      "growth.next_actions.axis_strength.EI.E.clear",
      "growth.next_actions.boundary.TF",
    ]);

    const { rerender } = render(<RichResultReport locale="zh" reportData={actionFirst} />);

    expect(screen.getByTestId("mbti-result-shell")).toHaveAttribute(
      "data-memory-rewrite-reason",
      "resume_growth_actions"
    );
    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();

    rerender(<RichResultReport locale="zh" reportData={clarityFirst} />);

    expect(screen.getByTestId("mbti-result-shell")).toHaveAttribute(
      "data-memory-rewrite-reason",
      "refine_type_clarity"
    );
    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
  });

  it("shows same-type section selection differences in the projection model while keeping the single shell stable", () => {
    const clearReport = createReportFixture();
    const strongReport = createReportFixture();

    overrideProjectionSectionSelection(
      clearReport,
      "growth.next_actions",
      [
        "growth.next_actions.next_action.EI.E",
        "growth.next_actions.identity.t",
      ],
      "growth.next_actions:seed.same_type_seed_name_decision_rule_jp:mode.action_identity_anchor"
    );
    overrideProjectionSectionSelection(
      strongReport,
      "growth.next_actions",
      [
        "growth.next_actions.next_action.EI.E",
        "growth.next_actions.boundary.TF",
      ],
      "growth.next_actions:seed.same_type_seed_name_decision_rule_jp:mode.action_boundary_buffered"
    );

    const clearSection = getSectionPersonalization(clearReport, "growth.next_actions");
    const strongSection = getSectionPersonalization(strongReport, "growth.next_actions");

    expect(clearSection.personalization.selected_blocks).toEqual([
      "growth.next_actions.next_action.EI.E",
      "growth.next_actions.identity.t",
    ]);
    expect(strongSection.personalization.selected_blocks).toEqual([
      "growth.next_actions.next_action.EI.E",
      "growth.next_actions.boundary.TF",
    ]);
    expect(clearSection.personalization.section_selection_key).not.toEqual(
      strongSection.personalization.section_selection_key
    );

    render(<RichResultReport locale="zh" reportData={strongReport} />);

    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
  });

  it("reorders the terminal surface on revisit while keeping the same shell", () => {
    const reportData = createReportFixture({
      isRevisit: true,
      hasUnlock: true,
      hasFeedback: true,
      hasShare: true,
      hasActionEngagement: true,
    });

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(getPrimaryByTestId("mbti-post-purchase-section")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-career-next-step")).toHaveAttribute("data-cta-rank", "1");
    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
      "data-recommendation-key",
      "read-explain"
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "post_purchase_history_entry",
        ctaKey: "workspace_lite",
        ctaRank: 2,
      })
    );
  });

  it("surfaces deeper revisit telemetry without reintroducing legacy shell nodes", () => {
    const reportData = createReportFixture({
      isRevisit: true,
      hasUnlock: true,
      hasFeedback: true,
      hasShare: false,
      hasActionEngagement: false,
      feedbackSentiment: "negative",
      feedbackCoverage: "explainability_only",
      lastDeepReadSection: "traits.close_call_axes",
      currentIntentCluster: "clarify_type",
    });

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(getPrimaryByTestId("mbti-post-purchase-section")).toHaveAttribute("data-cta-rank", "1");
    expect(screen.getByTestId("mbti-career-next-step")).toHaveAttribute("data-cta-rank", "2");
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "view_result",
      expect.objectContaining({
        userState: "first:0|revisit:1|unlock:1|feedback:1|share:0|action:0",
        feedbackSentiment: "negative",
        feedbackCoverage: "explainability_only",
        lastDeepReadSection: "traits.close_call_axes",
        currentIntentCluster: "clarify_type",
        primaryFocusKey: "traits.close_call_axes",
        ctaPriorityKeys: "workspace_lite|career_bridge|share_result",
      })
    );
  });

  it("falls back safely when layers.identity is absent and recommended reads are empty", () => {
    const reportData = createReportFixture();

    if (!reportData.report) {
      throw new Error("Expected report payload");
    }

    reportData.report.layers = {
      ...reportData.report.layers,
      identity: undefined,
    };
    reportData.report.recommended_reads = [];
    reportData.cta = createCustomCta({
      primary_label: "查看正式方案",
    });

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offers-primary-cta")).toHaveTextContent("1.99元直接解锁");
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
  });

  it("replays backend recommendation order when reads rely on synthesized fallback keys", () => {
    const reportData = createReportFixture();

    if (!reportData.report) {
      throw new Error("Expected report payload");
    }

    reportData.report.recommended_reads = [
      {
        id: "recommended-read-1",
        type: "article",
        title: "Fallback read 1",
        desc: "First fallback recommendation body",
        url: null,
        cover: null,
        cta: null,
        priority: 20,
        tags: ["growth"],
        estimated_minutes: null,
        status: null,
        published_at: null,
        updated_at: null,
        canonical_id: null,
        canonical_url: null,
      },
      {
        id: "recommended-read-2",
        type: "article",
        title: "Fallback read 2",
        desc: "Second fallback recommendation body",
        url: null,
        cover: null,
        cta: null,
        priority: 10,
        tags: ["career"],
        estimated_minutes: null,
        status: null,
        published_at: null,
        updated_at: null,
        canonical_id: null,
        canonical_url: null,
      },
    ];

    const personalizationTargets = [
      reportData.report?._meta,
      reportData.mbti_public_projection_v1?._meta,
    ].filter(Boolean) as Array<{ personalization?: Record<string, unknown> }>;

    for (const target of personalizationTargets) {
      if (!target.personalization) {
        continue;
      }

      target.personalization.ordered_recommendation_keys = ["recommended-read-2", "recommended-read-1"];
      target.personalization.recommendation_priority_keys = ["recommended-read-2", "recommended-read-1"];
      target.personalization.reading_focus_key = "recommended-read-2";
    }

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
      "data-recommendation-key",
      "recommended-read-2"
    );
    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
      "data-reading-focus",
      "true"
    );
    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveTextContent(
      "Second fallback recommendation body"
    );
    expect(screen.getByTestId("mbti-recommended-read-card-2")).toHaveAttribute(
      "data-recommendation-key",
      "recommended-read-1"
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "recommended_read_card",
        recommendationKey: "recommended-read-2",
        recommendationRank: 1,
        readingFocusKey: "recommended-read-2",
      })
    );
  });

  it("falls back to default CTA copy when top-level cta is absent", () => {
    const reportData = createReportFixture();

    if (!reportData.report || !reportData.report.layers?.identity) {
      throw new Error("Expected report payload");
    }

    reportData.cta = undefined;
    reportData.report.recommended_reads = [];
    reportData.report.layers.identity = {
      ...reportData.report.layers.identity,
      title: "Legacy authored title still visible",
      subtitle: "Legacy authored subtitle still visible",
      one_liner: "Legacy authored bridge still exists",
    };

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offers-primary-cta")).toHaveTextContent("1.99元直接解锁");
    expect(
      within(screen.getByTestId("mbti-footer-cta")).getByRole("link", { name: "解锁完整报告" })
    ).toHaveAttribute("href", getMbtiDesktopAnchorHash("offerFull"));
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
  });
});
