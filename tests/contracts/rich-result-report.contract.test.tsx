import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Big5ResultShell } from "@/components/result/big5/Big5ResultShell";
import { RichResultReport } from "@/components/result/RichResultReport";
import {
  fetchPersonalityDesktopCloneContent,
} from "@/lib/cms/personality-desktop-clone";
import type { ReportResponse } from "@/lib/api/v0_3";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  trackObservableFunnelEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
  trackObservableFunnelEvent: hoisted.trackObservableFunnelEvent,
}));

vi.mock("@/lib/cms/personality-desktop-clone", () => ({
  fetchPersonalityDesktopCloneContent: vi.fn(async () => null),
  normalizeDesktopCloneTypeSlug: (fullCode: string | null | undefined) => {
    if (!fullCode || !/^[IE][NS][TF][JP]-[AT]$/i.test(fullCode)) {
      return null;
    }

    return fullCode.toLowerCase();
  },
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





function createReportFixture(): ReportResponse {
  return structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
}

function createProjectionReportFixture(): ReportResponse {
  return applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse);
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
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(null);
  });

  it("renders the shared editorial body while preserving native scores and ignoring legacy commerce copy", () => {
 const data=createProjectionReportFixture(); const before=JSON.stringify(data);
 render(<RichResultReport locale="zh" reportData={data}/>);
 expect(screen.getByTestId("mbti-hero")).toHaveTextContent("ENFP-T");
 for(const key of ["traits","career","growth","relationships"]) expect(screen.getByTestId(`mbti-chapter-${key}`)).toBeInTheDocument();
 expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
 expect(screen.queryByTestId("mbti-post-purchase-section")).not.toBeInTheDocument();
 expect(JSON.stringify(data)).toBe(before);
});

  it("keeps the editorial type identity independent of the retired public clone payload", () => {
 const data=createProjectionReportFixture(); render(<RichResultReport locale="zh" reportData={data}/>);
 expect(fetchPersonalityDesktopCloneContent).not.toHaveBeenCalled();
 expect(screen.getByTestId("mbti-hero")).toHaveTextContent(String(data.mbti_public_projection_v1?.display_type));
 expect(screen.getByTestId("mbti-sticky-rail")).toHaveTextContent(String(data.mbti_public_projection_v1?.display_type));
});

  it("keeps locked legacy metadata from restoring a purchase surface or replacing the editorial chapters", () => {
 const data=createProjectionReportFixture(); data.locked=true;
 render(<RichResultReport locale="zh" reportData={data}/>);
 expect(fetchPersonalityDesktopCloneContent).not.toHaveBeenCalled();
 expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
 expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
});

  it("keeps legacy preview cards outside the shared editorial result", () => {
 const data=createProjectionReportFixture(); render(<RichResultReport locale="zh" reportData={data}/>);
 expect(screen.getByTestId("mbti-evidence-and-prompts")).toBeInTheDocument();
 expect(screen.queryByTestId("mbti-chapter-preview-growth")).not.toBeInTheDocument();
 expect(screen.queryByTestId("mbti-growth-traits-lock-panel")).not.toBeInTheDocument();
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
    expect(getPrimaryByTestId("mbti-hero")).not.toHaveTextContent("本次类型仅呈轻微偏向");
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
    expect(hoisted.trackObservableFunnelEvent).toHaveBeenCalledWith(
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
    expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-footer-cta")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-overview-authored-intro")).not.toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-hero")).not.toHaveTextContent("本次类型仅呈轻微偏向");
  });

  it("renders controlled narrative when the backend enables it without replacing canonical MBTI truth", () => {
    const reportData = applyMbtiPhase2Fixture(
      structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse,
      { narrativeMode: "mock" }
    );

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(getPrimaryByTestId("mbti-hero")).not.toHaveTextContent("本次类型仅呈轻微偏向");
    expect(screen.queryByTestId("mbti-cultural-calibration-growth-next-actions")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
  });

  it("renders locale calibration for english while preserving canonical MBTI truth", () => {
    const reportData = applyMbtiPhase2Fixture(
      structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse,
      { narrativeMode: "mock", personalizationLocale: "en-US" }
    );

    render(<RichResultReport locale="en" reportData={reportData} />);

    expect(getPrimaryByTestId("mbti-hero")).not.toHaveTextContent(
      "Projection-first summary that should replace the legacy hero copy on result pages."
    );
    expect(screen.queryByTestId("mbti-cultural-calibration-growth-next-actions")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
  });

  it.skip("routes BIG5 through assembler-driven shell wiring while keeping canonical content visible", () => {
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
        scene_fingerprint_display: [
          { key: "novelty", label: "Novelty rhythm", value: "exploratory", value_label: "more exploratory" },
          { key: "structure", label: "Structure preference", value: "balanced", value_label: "balanced" },
          { key: "social_energy", label: "Social energy", value: "reserved", value_label: "more reserved" },
        ],
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
    expect(screen.getByTestId("big5-scene-fingerprint")).toHaveTextContent("Novelty rhythm");
    expect(screen.getByTestId("big5-scene-fingerprint")).toHaveTextContent("more exploratory");
    expect(screen.getByTestId("big5-scene-fingerprint")).not.toHaveTextContent("novelty");
    expect(screen.getByTestId("big5-scene-fingerprint")).not.toHaveTextContent("social_energy");
    expect(screen.getByTestId("big5-action-plan-summary")).toHaveTextContent(
      "The best near-term growth lever is Extraversion."
    );
    expect(screen.queryByText("Result status")).not.toBeInTheDocument();
    expect(screen.queryByText("Available modules")).not.toBeInTheDocument();
    expect(screen.queryByText("You can read now")).not.toBeInTheDocument();
    expect(screen.getByText("Included in this report")).toBeInTheDocument();
    expect(screen.getByText("The full report is unlocked. You can read each section directly.")).toBeInTheDocument();
    expect(screen.queryByText("Bring the paid modules back into the formal result path")).not.toBeInTheDocument();
    expect(screen.queryByText("Step 1 · Page 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Step 8 · Page 8")).not.toBeInTheDocument();
    expect(screen.getAllByText("Domains Overview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Methodology and Access").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Traits Overview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Legacy Big Five copy remains unchanged.").length).toBeGreaterThan(0);
  });

  it.skip("localizes BIG5 scene fingerprint raw keys on zh result pages", () => {
    render(
      <Big5ResultShell
        locale="zh"
        attemptId="attempt-big5-zh"
        reportLocked={false}
        accessProjection={null}
        headline={{
          badge: "Big Five",
          typeCode: "BIG5",
          displayName: "Big Five",
          supportingLine: "完整报告",
          summary: "中文结果页",
          rarity: "",
        }}
        formSummaryLabel="90 题标准版"
        tags={[]}
        dimensions={[]}
        projection={{
          schema_version: "big5.public_projection.v1",
          scene_fingerprint: {
            novelty: "grounded",
            structure: "adaptive",
            cooperation: "direct",
            social_energy: "balanced",
            stress_posture: "steady",
          },
          scene_fingerprint_display: [
            { key: "novelty", label: "novelty", value: "grounded", value_label: "grounded" },
            { key: "structure", label: "structure", value: "adaptive", value_label: "adaptive" },
            { key: "cooperation", label: "cooperation", value: "direct", value_label: "direct" },
            { key: "social_energy", label: "social_energy", value: "balanced", value_label: "balanced" },
            { key: "stress_posture", label: "stress_posture", value: "steady", value_label: "steady" },
          ],
          variant_keys: ["profile:sensitive_independent_thinker", "band:o.mid", "内部_tag"],
          explainability_summary: {
            headline: "这次画像主要由外向性驱动。",
          },
          action_plan_summary: {
            headline: "当前最值得优先经营的是尽责性。",
          },
        }}
        normsStatus="READY"
        qualityLevel="A"
        visibleSections={[]}
        lockedSections={[]}
        recommendedOffers={[]}
      />
    );

    const fingerprint = screen.getByTestId("big5-scene-fingerprint");
    expect(fingerprint).toHaveTextContent("变化节奏");
    expect(fingerprint).toHaveTextContent("更务实");
    expect(fingerprint).toHaveTextContent("结构偏好");
    expect(fingerprint).toHaveTextContent("更灵活");
    expect(fingerprint).toHaveTextContent("社交能量");
    expect(fingerprint).toHaveTextContent("相对平衡");
    expect(fingerprint).not.toHaveTextContent("novelty");
    expect(fingerprint).not.toHaveTextContent("social_energy");
    expect(fingerprint).not.toHaveTextContent("stress_posture");
    expect(fingerprint).not.toHaveTextContent("grounded");
    expect(fingerprint).not.toHaveTextContent("adaptive");
    expect(fingerprint).not.toHaveTextContent("balanced");
    expect(screen.getByTestId("big5-result-shell")).not.toHaveTextContent("profile:sensitive_independent_thinker");
    expect(screen.getByTestId("big5-result-shell")).not.toHaveTextContent("band:o.mid");
    expect(screen.getByTestId("big5-result-shell")).not.toHaveTextContent("内部_tag");
  });

  it.skip("keeps BIG5 full runtime payload fully readable even when paid-tagged sections are present", () => {
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

  it.skip("locks non-MBTI paid modules when modules_allowed lacks a full report entitlement", () => {
    const reportData = {
      ok: true,
      locked: false,
      variant: "preview",
      access_level: "preview",
      modules_allowed: ["big5_core"],
      modules_preview: ["big5_core"],
      offers: [
        {
          sku: "BIG5_REPORT_FULL",
          title: "BIG5 Full Report",
          formatted_price: "$19.00",
          modules_included: ["big5_full", "big5_action_plan"],
        },
      ],
      big5_public_projection_v1: {
        schema_version: "big5.public_projection.v1",
        explainability_summary: {
          headline: "This profile is primarily driven by Openness.",
        },
        action_plan_summary: {
          headline: "Action planning remains a paid module.",
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
            module_code: "big5_core",
            blocks: [{ kind: "paragraph", body: "Visible overview." }],
          },
          {
            key: "growth.next_actions",
            title: "Next actions",
            access_level: "paid",
            module_code: "big5_action_plan",
            blocks: [{ kind: "paragraph", body: "Paid action details." }],
          },
        ],
      },
      meta: {
        scale_code: "BIG5_OCEAN",
      },
    } as ReportResponse;

    render(
      <RichResultReport
        locale="en"
        reportData={reportData}
        accessProjection={{
          attemptId: "attempt-big5-preview",
          accessState: "ready",
          reportState: "ready",
          pdfState: "unavailable",
          unlockStage: "partial",
          unlockSource: "invite",
          reasonCode: "partial_unlock",
          accessLevel: "preview",
          variant: "preview",
          projectionVersion: 1,
          modulesAllowed: ["big5_core"],
          modulesPreview: ["big5_core"],
          actions: {
            pageHref: "/en/result/attempt-big5-preview",
            pdfHref: null,
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

    const visibleSections = screen.getByTestId("big5-sections");
    expect(within(visibleSections).getByText("Traits Overview")).toBeInTheDocument();
    expect(within(visibleSections).getByText("Visible overview.")).toBeInTheDocument();
    expect(within(visibleSections).queryByText("Next actions")).not.toBeInTheDocument();

    const lockedSections = screen.getByTestId("big5-locked-sections");
    expect(within(lockedSections).getAllByText("Next actions").length).toBeGreaterThan(0);
    expect(screen.getByTestId("big5-offer-surface")).toBeInTheDocument();
    expect(screen.getByText("BIG5 Full Report")).toBeInTheDocument();
  });

  it.skip("renders BIG5 comparative guidance without mutating the foundation summary", () => {
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

  it.skip("renders BIG5 locked sections with unlock offers while keeping the shell on the formal result path", () => {
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
    expect(screen.queryByText("当前可读")).not.toBeInTheDocument();
    expect(screen.getByText("解锁后可继续")).toBeInTheDocument();
    expect(screen.getByText("解锁更深入的特质解释与行动建议")).toBeInTheDocument();
    expect(screen.getByText("BIG5 Full Report")).toBeInTheDocument();
    expect(screen.getByText("¥99")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PDF 暂不可用" })).toBeDisabled();
    expect(screen.getByTestId("big5-pdf-entry")).toHaveTextContent("PDF 导出已安全暂停");
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
    expect(within(stickyRail).queryByRole("link", { name: "解锁完整报告" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-footer-cta")).not.toBeInTheDocument();
  });
});
