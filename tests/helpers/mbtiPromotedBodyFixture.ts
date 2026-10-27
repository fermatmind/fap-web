import type { ReportResponse } from "@/lib/api/v0_3";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportFixture from "@/tests/fixtures/report_ready.mbti.projection.json";
import canonical from "@/tests/fixtures/mbti-promoted-decision-style.json";

export function buildMbtiPromotedBodyFixture({ locked = false, promoted = true, withBlocks = true } = {}): ReportResponse {
  const report = applyMbtiPhase2Fixture(structuredClone(reportFixture) as ReportResponse, {
    personalizationLocale: "en-US", hasUnlock: !locked,
  });
  Object.assign(report, {
    locked, variant: locked ? "free" : "full", access_level: locked ? "free" : "full",
    free_full_report_mode: !locked, paywall_suppressed: !locked,
    ...(locked ? {} : { offers: [], modules_preview: [] }),
  });
  const projection = report.mbti_public_projection_v1 as { sections: Array<Record<string, unknown>> };
  projection.sections = [{
    key: "traits.decision_style", render: "rich_text", title: canonical.title,
    body_md: canonical.body_template.join("\n\n"),
    _meta: promoted ? { authority_source: "content_promotion_w1_mbti_results_v2" } : {},
    payload: {
      summary: canonical.summary_template.replaceAll("{{type_code}}", "INTJ"),
      reflection_prompts: canonical.reflection_prompts,
      ...(withBlocks ? {
        blocks: [{ id: "synthetic-selected-scene", kind: "scene", text: "Existing selected scenario remains available." }],
        personalization: { selected_blocks: ["synthetic-selected-scene"] },
      } : {}),
    },
  }];
  return report;
}
