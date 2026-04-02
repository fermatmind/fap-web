import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
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

function getPrimaryByTestId(testId: string): HTMLElement {
  const [node] = screen.getAllByTestId(testId);
  if (!node) {
    throw new Error(`Missing test id: ${testId}`);
  }

  return node;
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

describe("RichResultReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
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

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-hero")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-relationships")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-footer-cta")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-sticky-rail")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-mobile-chrome")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-recommended-reads")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("Legacy authored overview title");
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("Legacy authored overview subtitle");
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent(
      "Legacy authored one-liner remains available for the authored intro card."
    );

    const orderedChapters = [
      screen.getByTestId("mbti-chapter-traits"),
      screen.getByTestId("mbti-chapter-career"),
      screen.getByTestId("mbti-chapter-growth"),
      screen.getByTestId("mbti-chapter-relationships"),
    ];
    for (let index = 0; index < orderedChapters.length - 1; index += 1) {
      expect(orderedChapters[index].compareDocumentPosition(orderedChapters[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    const intro = screen.getByText("先读人设，再读章节，最后决定是否解锁完整深度").closest("section");
    expect(intro).not.toBeNull();
    const traitsChapter = screen.getByTestId("mbti-chapter-traits");
    const relationships = screen.getByTestId("mbti-chapter-relationships");
    const careerNextStep = screen.getByTestId("mbti-career-next-step");
    const reads = screen.getByTestId("mbti-recommended-reads");
    const offers = getPrimaryByTestId("mbti-offer-comparison");
    expect(intro!.compareDocumentPosition(traitsChapter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(traitsChapter.compareDocumentPosition(relationships) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(relationships.compareDocumentPosition(careerNextStep) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(careerNextStep.compareDocumentPosition(offers) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(offers.compareDocumentPosition(reads) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const hero = getPrimaryByTestId("mbti-hero");
    expect(within(hero).getByRole("heading", { name: /ENFP-T/ })).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(hero).toHaveTextContent("Projection-first summary that should replace the legacy hero copy on result pages.");
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(screen.queryByText("type:ENFP-T")).not.toBeInTheDocument();
    expect(screen.queryByText("axis:EI:E")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy Hero Title Should Lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero subtitle should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero summary should lose to projection summary.")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy keyword should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy rarity should lose")).not.toBeInTheDocument();

    for (const chapter of orderedChapters) {
      expect(within(chapter).queryAllByTestId("mbti-chapter-unlock-card").length).toBeLessThanOrEqual(1);
    }
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
    expect(screen.getByText("Projection letters intro headline.")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveAttribute(
      "data-variant-key",
      "overview:EI.E.clear:identity.T:boundary.none"
    );
    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveTextContent(
      "你已经呈现出稳定的外倾倾向"
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
    expect(screen.getByTestId("mbti-projection-section-traits-decision-style")).toHaveAttribute(
      "data-variant-key",
      "traits.decision_style:TF.T.boundary:identity.T:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-traits-decision-style")).toHaveTextContent(
      "单一路径地下判断"
    );
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
    expect(screen.getByText("Projection career advantage one")).toBeInTheDocument();
    expect(screen.getByText("Projection career weakness one")).toBeInTheDocument();
    expect(screen.getByText("Roles that reward exploratory leadership.")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-projection-section-career-next-step")).toHaveAttribute(
      "data-variant-key",
      "career.next_step:TF.T.boundary:identity.T:boundary.TF:synth.big5_career_next_step_low_reduce_activation_friction"
    );
    expect(screen.getByTestId("mbti-projection-section-career-next-step")).toHaveAttribute(
      "data-synthesis-key",
      "big5.career_next_step.low.reduce_activation_friction"
    );
    expect(screen.getByTestId("mbti-projection-section-career-next-step")).toHaveTextContent(
      "先把你看重的判断标准写清楚"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-summary")).toHaveTextContent(
      "成长上，你更适合先放大这条已经清晰的外倾优势"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stability-confidence")).toHaveAttribute(
      "data-variant-key",
      "growth.stability_confidence:stability.context_sensitive:identity.T:boundary.JP:synth.big5_neuroticism_high_buffer_reactivity"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stability-confidence")).toHaveTextContent(
      "情境敏感型稳定"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stress-recovery")).toHaveAttribute(
      "data-variant-key",
      "growth.stress_recovery:JP.J.boundary:identity.T:boundary.JP"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-stress-recovery")).toHaveTextContent(
      "过载时和恢复时可能会切到不同挡位"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
      "data-variant-key",
      "growth.next_actions:EI.E.clear:identity.T:action.weekly_action_theme_name_decision_rule:boundary.TF:synth.big5_conscientiousness_low_use_external_scaffolding"
    );
    expect(screen.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
      "data-action-key",
      "weekly_action.theme.name_decision_rule"
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
    expect(screen.getByText("Projection motivators teaser.")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-projection-section-growth-drainers")).toHaveTextContent(
      "你在过载时和恢复时可能会切到不同挡位"
    );
    expect(screen.getByTestId("mbti-projection-section-relationships-summary")).toHaveTextContent(
      "你更容易先按逻辑、结构和可验证性来判断"
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
    expect(screen.getByText("Projection relationship risks teaser.")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-projection-section-relationships-rel-risks")).toHaveTextContent(
      "两套判断入口之间来回校准"
    );
    expect(screen.queryByText("Legacy Hero Title Should Lose")).not.toBeInTheDocument();

    expect(within(getPrimaryByTestId("mbti-offer-comparison")).queryByText("¥0.99")).not.toBeInTheDocument();
    expect(screen.getAllByText("E / I").length).toBeGreaterThan(0);
    const footerActions = screen.getByTestId("mbti-footer-cta");
    expect(within(footerActions).getByRole("button", { name: "分享结果" })).toBeInTheDocument();
    expect(within(footerActions).getByRole("link", { name: "重新测试" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types/take"
    );
    const offerComparison = getPrimaryByTestId("mbti-offer-comparison");
    expect(within(offerComparison).getByText("Unified MBTI unlock plan")).toBeInTheDocument();
    expect(within(offerComparison).getByText("Use one primary commerce surface and keep the rest as mirrors.")).toBeInTheDocument();
    expect(within(offerComparison).getByText("Formal entitlement A")).toBeInTheDocument();
    expect(within(offerComparison).getByText("Formal entitlement B")).toBeInTheDocument();
    expect(within(offerComparison).getByRole("button", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(within(getPrimaryByTestId("mbti-sticky-rail")).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#offer-full"
    );
    expect(within(screen.getByTestId("mbti-mobile-chrome")).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#offer-full"
    );
    expect(within(screen.getByTestId("mbti-footer-cta")).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#offer-full"
    );
    expect(within(getPrimaryByTestId("mbti-sticky-rail")).queryByText("Use one primary commerce surface and keep the rest as mirrors.")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-mobile-chrome")).queryByText("Use one primary commerce surface and keep the rest as mirrors.")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-footer-cta")).queryByText("Use one primary commerce surface and keep the rest as mirrors.")).not.toBeInTheDocument();
    expect(screen.getByText("Action experiments that keep the result moving")).toBeInTheDocument();
    expect(screen.queryByText("Legacy hero subtitle should lose")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Read the action note" }));
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "offer_primary_cta",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "recommended_reads",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "recommended_read_card",
        interaction: "click",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
      })
    );
  });

  it("prefers mbti_preview_v1 over raw section scraping for MBTI preview chapters", () => {
    render(<RichResultReport locale="zh" reportData={createDtoPreviewFixture()} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");
    const previewSurface = screen.getByTestId("mbti-chapter-preview-growth");

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(previewSurface).toBeInTheDocument();
    expect(within(previewSurface).getByText("DTO preview growth card")).toBeInTheDocument();
    expect(within(growthChapter).queryByTestId("mbti-chapter-unlock-card")).not.toBeInTheDocument();
    expect(within(growthChapter).getByText("部分预览已开放")).toBeInTheDocument();
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

    const stability = screen.getByTestId("mbti-projection-section-growth-stability-confidence");
    const nextActions = screen.getByTestId("mbti-projection-section-growth-next-actions");
    expect(stability).toHaveAttribute("data-synthesis-key", "big5.neuroticism.high.buffer_reactivity");
    expect(stability).toHaveAttribute("data-supporting-scale", "BIG5_OCEAN");
    expect(stability).toHaveAttribute("data-cross-assessment-version", "mbti_big5.cross_assessment.v1");
    expect(within(stability).getByTestId("mbti-cross-assessment-growth-stability-confidence")).toHaveTextContent(
      "Big Five 显示你的情绪性更高"
    );
    expect(nextActions).toHaveAttribute("data-synthesis-key", "big5.conscientiousness.low.use_external_scaffolding");
    expect(within(nextActions).getByTestId("mbti-cross-assessment-growth-next-actions")).toHaveTextContent(
      "外部提醒"
    );
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
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "offer_primary_cta",
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
    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveTextContent(
      "你已经呈现出稳定的外倾倾向"
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
    expect(
      screen.getByTestId("mbti-cultural-calibration-growth-next-actions")
    ).toHaveTextContent("先用低摩擦动作启动");
  });

  it("renders locale calibration for english while preserving canonical MBTI truth", () => {
    const reportData = applyMbtiPhase2Fixture(
      structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse,
      { narrativeMode: "mock", personalizationLocale: "en-US" }
    );

    render(<RichResultReport locale="en" reportData={reportData} />);

    expect(
      screen.getByTestId("mbti-cultural-calibration-growth-next-actions")
    ).toHaveTextContent("make the next step explicit");
    expect(getPrimaryByTestId("mbti-hero")).toHaveTextContent(
      "Projection-first summary that should replace the legacy hero copy on result pages."
    );
  });

  it("leaves non-MBTI branches on the legacy report normalizer", () => {
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
    expect(screen.getAllByText("Traits Overview").length).toBeGreaterThan(0);
    expect(screen.getByText("Legacy Big Five copy remains unchanged.")).toBeInTheDocument();
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
    expect(screen.getByText("BIG5 Full Report")).toBeInTheDocument();
    expect(screen.getByText("¥99")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "解锁后下载 PDF" })).toBeDisabled();
  });
});
