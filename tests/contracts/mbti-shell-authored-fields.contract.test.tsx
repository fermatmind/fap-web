import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
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

describe("MBTI shell authored fields contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("keeps hero, dimensions, and canonical sections on projection-first authority while legacy authored fields stay available", () => {
    const reportData = createReportFixture();
    if (!reportData.report || !reportData.report.layers?.identity) {
      throw new Error("Expected authored MBTI fixture");
    }

    reportData.cta = createCustomCta({
      title: "正式商业主位标题",
      subtitle: "正式商业主位副标题",
      primary_label: "解锁作者化完整版",
      benefit_bullets: ["权益一", "权益二"],
      badge: "主推",
    });

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    const hero = screen.getByTestId("mbti-hero");
    expect(within(hero).getByRole("heading", { level: 1, name: /ENFP-T/ })).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(hero).toHaveTextContent("Projection-first subtitle");
    expect(hero).toHaveTextContent("Projection-first summary that should replace the legacy hero copy on result pages.");
    expect(hero).toHaveTextContent("Around 6-8%");
    expect(hero).toHaveTextContent("Projection Tag Alpha");
    expect(screen.getByTestId("mbti-projection-section-career-summary")).toHaveAttribute(
      "data-variant-key",
      "career.summary:EI.E.clear:identity.T:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-career-summary")).toHaveTextContent(
      "你更容易先把能量投向外部互动、讨论与现场反馈"
    );
    expect(screen.getByTestId("mbti-projection-section-career-collaboration-fit")).toHaveAttribute(
      "data-variant-key",
      "career.collaboration_fit:EI.E.clear:identity.T:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-career-collaboration-fit")).toHaveTextContent(
      "团队协作"
    );
    expect(screen.getByTestId("mbti-projection-section-career-work-environment")).toHaveAttribute(
      "data-variant-key",
      "career.work_environment:EI.E.clear:identity.T:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-career-work-environment")).toHaveTextContent(
      "工作环境"
    );
    expect(screen.getByTestId("mbti-projection-section-career-work-experiments")).toHaveAttribute(
      "data-variant-key",
      "career.work_experiments:EI.E.clear:identity.T:action.work_experiment_theme_name_decision_rule:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-career-work-experiments")).toHaveAttribute(
      "data-action-key",
      "work_experiment.theme.name_decision_rule"
    );
    expect(screen.getByTestId("mbti-projection-section-career-work-experiments")).toHaveTextContent(
      "工作实验"
    );
    expect(screen.getByTestId("mbti-projection-section-career-next-step")).toHaveAttribute(
      "data-variant-key",
      "career.next_step:TF.T.boundary:identity.T:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-career-next-step")).toHaveTextContent(
      "先把你看重的判断标准写清楚"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-decision-style")).toHaveAttribute(
      "data-variant-key",
      "traits.decision_style:TF.T.boundary:identity.T:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-why-this-type")).toHaveAttribute(
      "data-variant-key",
      "traits.why_this_type:EI.E.clear:identity.T:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-why-this-type")).toHaveTextContent(
      "主类型之所以成立"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-close-call-axes")).toHaveAttribute(
      "data-variant-key",
      "traits.close_call_axes:JP.J.boundary:identity.T:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-close-call-axes")).toHaveTextContent(
      "只拉开了7个点差"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-adjacent-type-contrast")).toHaveAttribute(
      "data-variant-key",
      "traits.adjacent_type_contrast:JP.J.boundary:identity.T:neighbor.ENFJ"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-adjacent-type-contrast")).toHaveAttribute(
      "data-contrast-key",
      "traits.adjacent_type_contrast:neighbor.ENFJ-ENTP"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-adjacent-type-contrast")).toHaveTextContent(
      "最容易把你看成ENFJ"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-decision-style")).toHaveTextContent(
      "两套判断入口之间来回校准"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stress-recovery")).toHaveAttribute(
      "data-variant-key",
      "growth.stress_recovery:JP.J.boundary:identity.T:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stability-confidence")).toHaveAttribute(
      "data-variant-key",
      "growth.stability_confidence:stability.context_sensitive:identity.T:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stability-confidence")).toHaveTextContent(
      "情境敏感型稳定"
    );
    expect(screen.getByTestId("mbti-action-plan-summary")).toHaveTextContent(
      "把成长、关系和工作里的高匹配动作都缩成一周内能重复的小实验"
    );
    expect(screen.getByTestId("mbti-action-plan-summary")).toHaveAttribute("data-primary-focus", "true");
    expect(screen.getByTestId("mbti-carryover-entry")).toHaveTextContent("继续看 下一步动作");
    expect(screen.getByTestId("mbti-carryover-entry")).toHaveTextContent("当前最值得延续的重点");
    expect(screen.getByTestId("mbti-carryover-entry-cta").getAttribute("href")).toContain(
      "carryover_focus_key=growth.next_actions"
    );
    expect(screen.getByTestId("mbti-carryover-entry-cta").getAttribute("href")).toContain(
      "carryover_reason=unlock_to_continue_focus"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
      "data-variant-key",
      "growth.next_actions:EI.E.clear:identity.T:action.weekly_action_theme_name_decision_rule:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
      "data-action-key",
      "weekly_action.theme.name_decision_rule"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
      "data-primary-focus",
      "true"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
      "data-display-order",
      "1"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveTextContent(
      "下一步动作"
    );
    expect(
      screen.getByTestId("mbti-projection-section-growth-next-actions").compareDocumentPosition(
        screen.getByTestId("mbti-projection-section-growth-summary")
      ) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getByTestId("mbti-projection-section-growth-weekly-experiments")).toHaveAttribute(
      "data-variant-key",
      "growth.weekly_experiments:EI.E.clear:identity.T:action.weekly_action_theme_name_decision_rule:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-weekly-experiments")).toHaveTextContent(
      "本周实验"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-watchouts")).toHaveAttribute(
      "data-variant-key",
      "growth.watchouts:JP.J.boundary:identity.T:action.watchout_stability_context_sensitive:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-watchouts")).toHaveAttribute(
      "data-action-key",
      "watchout.stability.context_sensitive"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-watchouts")).toHaveTextContent(
      "风险提醒"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stress-recovery")).toHaveTextContent(
      "过载时和恢复时可能会切到不同挡位"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-close-call-axes")).toHaveAttribute(
      "data-display-order",
      "1"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-adjacent-type-contrast")).toHaveAttribute(
      "data-display-order",
      "2"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-communication-style")).toHaveAttribute(
      "data-variant-key",
      "relationships.communication_style:EI.E.clear:identity.T:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-communication-style")).toHaveTextContent(
      "你的起手表达方式"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-try-this-week")).toHaveAttribute(
      "data-variant-key",
      "relationships.try_this_week:EI.E.clear:identity.T:action.relationship_action_theme_name_decision_rule:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-try-this-week")).toHaveAttribute(
      "data-action-key",
      "relationship_action.theme.name_decision_rule"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-try-this-week")).toHaveTextContent(
      "本周关系练习"
    );
    expect(screen.getByTestId("mbti-career-next-step")).toHaveTextContent("先把你看重的判断标准写清楚");
    expect(screen.getByTestId("mbti-career-next-step")).toHaveAttribute("data-cta-rank", "2");
    expect(
      screen.getByTestId("mbti-offer-comparison").compareDocumentPosition(
        screen.getByTestId("mbti-career-next-step")
      ) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getByTestId("mbti-career-next-step-cta").getAttribute("href")).toContain(
      "/zh/career/recommendations/mbti/enfp-t?"
    );
    expect(screen.getByTestId("mbti-career-next-step-cta").getAttribute("href")).toContain(
      "carryover_focus_key=growth.next_actions"
    );
    expect(screen.getByTestId("mbti-offer-comparison")).toHaveAttribute("data-cta-rank", "1");
    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
      "data-recommendation-key",
      "read-action"
    );
    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
      "data-reading-focus",
      "true"
    );
    expect(screen.getByTestId("mbti-recommended-read-card-2")).toHaveAttribute(
      "data-recommendation-key",
      "read-career"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
      "data-action-rank",
      "1"
    );
    expect(screen.getByTestId("mbti-projection-section-career-work-experiments")).toHaveAttribute(
      "data-action-rank",
      "2"
    );
    expect(screen.getByText("Projection career advantage one")).toBeInTheDocument();
    expect(screen.getByText("Projection relationship risks teaser.")).toBeInTheDocument();
    expect(screen.getByText("Projection trait grid summary.")).toBeInTheDocument();
    expect(screen.getByText("Legacy authored overview title")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-recommended-reads")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("解锁完整报告");
    expect(within(screen.getByTestId("mbti-sticky-rail")).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
    expect(screen.queryByText("Legacy Hero Title Should Lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero subtitle should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero summary should lose to projection summary.")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy keyword should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy rarity should lose")).not.toBeInTheDocument();
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "view_result",
      expect.objectContaining({
        attemptIdMasked: "attemp...-123",
        typeCode: "ENFP-T",
        identity: "T",
        variantKey: "overview:EI.E.clear:identity.T:boundary.none",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
        sceneFingerprint: expect.stringContaining("work:work.primary.EI.E.clear"),
        userState: "first:1|revisit:0|unlock:0|feedback:0|share:0|action:0",
        primaryFocusKey: "growth.next_actions",
        orderedSectionKeys: expect.stringContaining("growth.next_actions"),
        orderedRecommendationKeys: "read-action|read-career|read-relationship|read-explain",
        orderedActionKeys:
          "weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule|watchout.stability.context_sensitive",
        recommendationPriorityKeys: "read-action|read-career|read-relationship",
        actionPriorityKeys:
          "weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule|watchout.stability.context_sensitive",
        readingFocusKey: "read-action",
        actionFocusKey: "weekly_action.theme.name_decision_rule",
        ctaPriorityKeys: "unlock_full_report|career_bridge|share_result",
        carryoverFocusKey: "growth.next_actions",
        carryoverReason: "unlock_to_continue_focus",
        recommendedResumeKeys: "growth.next_actions|traits.close_call_axes|traits.adjacent_type_contrast|career.next_step",
      })
    );
  });

  it("reorders focus and CTA priority when backend user state shifts to revisit", () => {
    const reportData = createReportFixture({
      isRevisit: true,
      hasUnlock: true,
      hasFeedback: true,
      hasShare: true,
      hasActionEngagement: true,
    });

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-projection-section-growth-stability-confidence")).toHaveAttribute(
      "data-primary-focus",
      "true"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stability-confidence")).toHaveAttribute(
      "data-display-order",
      "1"
    );
    expect(
      screen.getByTestId("mbti-projection-section-growth-stability-confidence").compareDocumentPosition(
        screen.getByTestId("mbti-projection-section-growth-next-actions")
      ) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getByTestId("mbti-career-next-step")).toHaveAttribute("data-cta-rank", "1");
    expect(screen.getByTestId("mbti-post-purchase-section")).toHaveAttribute("data-cta-rank", "2");
    expect(
      screen.getByTestId("mbti-career-next-step").compareDocumentPosition(
        screen.getByTestId("mbti-post-purchase-section")
      ) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
      "data-recommendation-key",
      "read-explain"
    );
    expect(screen.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
      "data-reading-focus",
      "true"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-watchouts")).toHaveAttribute(
      "data-action-rank",
      "1"
    );
    expect(screen.getByTestId("mbti-carryover-entry")).toHaveTextContent("继续看 稳定性解释");
    expect(screen.queryByTestId("mbti-offer-comparison")).toBeNull();
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "post_purchase_history_entry",
        ctaKey: "workspace_lite",
        ctaRank: 2,
        orderedRecommendationKeys: "read-explain|read-action|read-career|read-relationship",
        orderedActionKeys:
          "watchout.stability.context_sensitive|weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule",
        readingFocusKey: "read-explain",
        actionFocusKey: "watchout.stability.context_sensitive",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "view_result",
      expect.objectContaining({
        userState: "first:0|revisit:1|unlock:1|feedback:1|share:1|action:1",
        primaryFocusKey: "growth.stability_confidence",
        orderedRecommendationKeys: "read-explain|read-action|read-career|read-relationship",
        orderedActionKeys:
          "watchout.stability.context_sensitive|weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule",
        recommendationPriorityKeys: "read-explain|read-action|read-career",
        actionPriorityKeys:
          "watchout.stability.context_sensitive|weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule",
        readingFocusKey: "read-explain",
        actionFocusKey: "watchout.stability.context_sensitive",
        ctaPriorityKeys: "career_bridge|workspace_lite|share_result",
        carryoverFocusKey: "growth.stability_confidence",
        carryoverReason: "refine_after_feedback",
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
    expect(screen.queryByTestId("mbti-overview-authored-intro")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("解锁完整报告");
    expect(screen.getByTestId("mbti-chapter-overview")).toHaveTextContent("你已经呈现出稳定的外倾倾向");
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
  });

  it("replays backend recommendation order when reads rely on synthesized fallback keys", () => {
    const reportData = createReportFixture();
    if (!reportData.report) {
      throw new Error("Expected report payload");
    }

    reportData.report.recommended_reads = [
      {
        type: "article",
        desc: "First fallback recommendation body",
        priority: 20,
        tags: ["growth"],
      },
      {
        type: "article",
        desc: "Second fallback recommendation body",
        priority: 10,
        tags: ["career"],
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
    expect(screen.getByTestId("mbti-recommended-read-card-2")).toHaveTextContent(
      "First fallback recommendation body"
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
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("Legacy authored title still visible");
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("解锁完整报告");
    expect(screen.getByTestId("mbti-offer-comparison")).toHaveTextContent("解锁完整 MBTI 报告");
    expect(within(screen.getByTestId("mbti-footer-cta")).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#offer-full"
    );
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
  });

  it("renders backend-supplied overview variants for the same type when EI strength changes", () => {
    const clearReportData = createReportFixture();
    const strongReportData = applyMbtiPhase2Fixture(
      structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse,
      { eiBand: "strong", eiPct: 77, eiDelta: 27 }
    );

    const clearOverview = clearReportData.mbti_public_projection_v1?.sections?.find(
      (section) => section.key === "overview"
    ) as Record<string, unknown> | undefined;
    const strongOverview = strongReportData.mbti_public_projection_v1?.sections?.find(
      (section) => section.key === "overview"
    ) as Record<string, unknown> | undefined;

    if (!clearOverview || !strongOverview) {
      throw new Error("Expected overview sections in projection fixture");
    }

    const strongProjectionMeta = strongReportData.mbti_public_projection_v1?._meta as Record<string, unknown> | undefined;
    const strongProjectionPersonalization = strongProjectionMeta?.personalization as Record<string, unknown> | undefined;
    const strongReportMeta = strongReportData.report?._meta as Record<string, unknown> | undefined;
    const strongReportPersonalization = strongReportMeta?.personalization as Record<string, unknown> | undefined;

    for (const personalization of [strongProjectionPersonalization, strongReportPersonalization]) {
      if (!personalization) {
        continue;
      }

      (personalization.axis_bands as Record<string, string>).EI = "strong";
    }

    const { unmount } = render(<RichResultReport locale="zh" reportData={clearReportData} />);

    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveAttribute(
      "data-variant-key",
      "overview:EI.E.clear:identity.T:boundary.none"
    );
    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveTextContent(
      "你已经呈现出稳定的外倾倾向"
    );

    unmount();

    render(<RichResultReport locale="zh" reportData={strongReportData} />);

    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveAttribute(
      "data-variant-key",
      "overview:EI.E.strong:identity.T:boundary.none"
    );
    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveTextContent(
      "你的外倾偏好已经很鲜明"
    );
    expect(screen.getByTestId("mbti-projection-section-overview")).not.toHaveTextContent(
      "你已经呈现出稳定的外倾倾向"
    );
  });

  it("renders scene fingerprint summary and second-wave section variants from backend authority", () => {
    const reportData = createReportFixture();

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-scene-fingerprint")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-scene-card-work")).toHaveAttribute(
      "data-style-key",
      "work.primary.EI.E.clear"
    );
    expect(screen.getByTestId("mbti-scene-card-decision")).toHaveTextContent("你的决策模式");
    expect(screen.getByTestId("mbti-projection-section-growth-drainers")).toHaveAttribute(
      "data-variant-key",
      "growth.drainers:JP.J.boundary:identity.T:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-drainers")).toHaveTextContent(
      "你在过载时和恢复时可能会切到不同挡位"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stress-recovery")).toHaveTextContent(
      "你最先启动的自救方式"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveTextContent(
      "下一步动作"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-weekly-experiments")).toHaveTextContent(
      "本周实验"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-watchouts")).toHaveTextContent(
      "风险提醒"
    );
    expect(screen.getByTestId("mbti-projection-section-career-work-experiments")).toHaveTextContent(
      "工作实验"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-try-this-week")).toHaveTextContent(
      "本周关系练习"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-rel-risks")).toHaveTextContent(
      "两套判断入口之间来回校准"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-communication-style")).toHaveTextContent(
      "你的起手表达方式"
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        sectionKey: "traits.why_this_type",
        contrastKey: "traits.why_this_type:dominant.EI.E.clear",
        closeCallAxes: "JP:boundary:7|TF:boundary:9",
        neighborTypeKeys: "ENFJ|ENTP",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        sectionKey: "traits.decision_style",
        sceneKey: "decision",
        variantKey: "traits.decision_style:TF.T.boundary:identity.T:boundary.TF",
      })
    );

    fireEvent.click(screen.getByTestId("mbti-projection-section-traits-decision-style"));
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        sectionKey: "traits.decision_style",
        sceneKey: "decision",
        variantKey: "traits.decision_style:TF.T.boundary:identity.T:boundary.TF",
        interaction: "click",
      })
    );

    fireEvent.click(
      within(screen.getByTestId("mbti-projection-section-traits-why-this-type")).getByRole("button", {
        name: "解释很像我",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "accuracy_feedback",
      expect.objectContaining({
        feedback: "accurate",
        sectionKey: "traits.why_this_type",
        contrastKey: "traits.why_this_type:dominant.EI.E.clear",
        closeCallAxes: "JP:boundary:7|TF:boundary:9",
        neighborTypeKeys: "ENFJ|ENTP",
        typeCode: "ENFP-T",
        identity: "T",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
        sceneFingerprint: expect.stringContaining("work:work.primary.EI.E.clear"),
        userState: "first:1|revisit:0|unlock:0|feedback:0|share:0|action:0",
        primaryFocusKey: "growth.next_actions",
        secondaryFocusKeys: "traits.close_call_axes|traits.adjacent_type_contrast",
        orderedSectionKeys: expect.stringContaining("growth.next_actions"),
        orderedRecommendationKeys: "read-action|read-career|read-relationship|read-explain",
        orderedActionKeys:
          "weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule|watchout.stability.context_sensitive",
        recommendationPriorityKeys: "read-action|read-career|read-relationship",
        actionPriorityKeys:
          "weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule|watchout.stability.context_sensitive",
        readingFocusKey: "read-action",
        actionFocusKey: "weekly_action.theme.name_decision_rule",
        ctaPriorityKeys: "unlock_full_report|career_bridge|share_result",
        carryoverFocusKey: "growth.next_actions",
        carryoverReason: "unlock_to_continue_focus",
        recommendedResumeKeys: "growth.next_actions|traits.close_call_axes|traits.adjacent_type_contrast|career.next_step",
        displayOrder: 6,
        isPrimaryFocus: false,
      })
    );

    fireEvent.click(
      within(screen.getByTestId("mbti-projection-section-growth-next-actions")).getByRole("button", {
        name: "这条建议有帮助",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "accuracy_feedback",
      expect.objectContaining({
        feedback: "helpful_action",
        sectionKey: "growth.next_actions",
        actionKey: "weekly_action.theme.name_decision_rule",
        typeCode: "ENFP-T",
        identity: "T",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
        userState: "first:1|revisit:0|unlock:0|feedback:0|share:0|action:0",
        primaryFocusKey: "growth.next_actions",
        secondaryFocusKeys: "traits.close_call_axes|traits.adjacent_type_contrast",
        orderedSectionKeys: expect.stringContaining("growth.next_actions"),
        orderedRecommendationKeys: "read-action|read-career|read-relationship|read-explain",
        orderedActionKeys:
          "weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule|watchout.stability.context_sensitive",
        recommendationPriorityKeys: "read-action|read-career|read-relationship",
        actionPriorityKeys:
          "weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule|watchout.stability.context_sensitive",
        readingFocusKey: "read-action",
        actionFocusKey: "weekly_action.theme.name_decision_rule",
        ctaPriorityKeys: "unlock_full_report|career_bridge|share_result",
        carryoverFocusKey: "growth.next_actions",
        carryoverReason: "unlock_to_continue_focus",
        recommendedResumeKeys: "growth.next_actions|traits.close_call_axes|traits.adjacent_type_contrast|career.next_step",
        displayOrder: 1,
        isPrimaryFocus: true,
      })
    );

    fireEvent.click(
      within(screen.getByTestId("mbti-recommended-read-card-1")).getByRole("link", {
        name: "Read the action note",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "recommended_read_card",
        interaction: "click",
        recommendationKey: "read-action",
        recommendationRank: 1,
        orderedRecommendationKeys: "read-action|read-career|read-relationship|read-explain",
        orderedActionKeys:
          "weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule|watchout.stability.context_sensitive",
        recommendationPriorityKeys: "read-action|read-career|read-relationship",
        actionPriorityKeys:
          "weekly_action.theme.name_decision_rule|work_experiment.theme.name_decision_rule|relationship_action.theme.name_decision_rule|watchout.stability.context_sensitive",
        readingFocusKey: "read-action",
        actionFocusKey: "weekly_action.theme.name_decision_rule",
      })
    );
  });
});
