import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { buildMbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import { getMbtiResultContent } from "@/lib/mbti/result-content";
import type { ReportResponse } from "@/lib/api/v0_3";
import fixture from "@/tests/fixtures/report_ready.mbti.projection.json";
vi.mock("next/navigation", () => ({ usePathname: () => "/en/result/attempt-123" }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
vi.mock("@/lib/cms/personality-result-introduction", () => ({ fetchPersonalityResultIntroduction: vi.fn(async () => null) }));
describe("MBTI editorial authority and compatible report metadata", () => {
  it.each(["zh", "en"] as const)("keeps %s projection scores and identity without the retired commerce or recommendation layout", (locale) => {
    const data = structuredClone(fixture) as unknown as ReportResponse;
    const before = JSON.stringify(data);
    const projection = buildMbtiResultProjectionViewModel(data)!;
    const content = getMbtiResultContent(projection.displayType, locale)!;
    render(<RichResultReport locale={locale} reportData={data} />);
    expect(within(screen.getByTestId("mbti-hero")).getByText(projection.displayType)).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent(content.data.content.hero.profileIdentity!.name);
    expect(screen.getByTestId("mbti-traits-card")).toHaveTextContent(`${projection.dimensions[0].dominantPct}%`);
    expect(screen.queryByTestId("mbti-result-faq")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
    expect(JSON.stringify(data)).toBe(before);
  });
  it("keeps shared editorial chapters available when legacy authored layers and recommendations are absent", () => {
    const data = structuredClone(fixture) as unknown as ReportResponse;
    data.report!.layers = undefined;
    data.report!.recommended_reads = [];
    render(<RichResultReport locale="en" reportData={data} />);
    const content = getMbtiResultContent("ENFP-T", "en")!;
    for (const chapter of ["career", "growth", "relationships"] as const) {
      expect(screen.getByTestId(`mbti-chapter-${chapter}`)).toHaveTextContent(content.data.content.chapters[chapter].intro[0]);
    }
  });
  it("does not render unsafe or stale backend recommendations over the shared result content", () => {
    const data = structuredClone(fixture) as unknown as ReportResponse;
    for (const read of data.report!.recommended_reads ?? []) { read.title = "Unsafe backend read"; read.url = "javascript:alert(1)"; read.canonical_url = "javascript:alert(1)"; }
    render(<RichResultReport locale="en" reportData={data} />);
    expect(screen.queryByText("Unsafe backend read")).not.toBeInTheDocument();
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
  });
});

function createReportFixture(
  options?: Parameters<typeof applyMbtiPhase2Fixture>[1]
): ReportResponse {
  return applyMbtiPhase2Fixture(
    structuredClone(fixture) as ReportResponse,
    options
  );
}
function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
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
it("preserves backend memory-rewrite selection metadata without a separate UI",()=>{
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
});
