import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EnneagramResultShell } from "@/components/result/enneagram/EnneagramResultShell";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleEnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import { enneagramAssetBackedModuleContentSchema } from "@/lib/enneagram/contracts/schemas";

vi.mock("@/components/big5/pdf/PdfDownloadButton", () => ({
  PdfDownloadButton: () => <button type="button">Download PDF</button>,
}));

const INTERNAL_METADATA = [
  "selection_guidance",
  "editor_note",
  "qa_note",
  "safety_note",
  "codex_policy",
  "qa_policy",
  "replacement_policy",
  "body_quality",
  "avoid_when",
  "import_policy",
];

function createAssetBackedReport(body = "资产正文测试令牌，不是前端兜底文案。"): ReportResponse {
  const assetModule = {
    module_key: "asset_preview_core_motivation",
    kind: "asset_backed_card",
    visibility: "visible",
    state: "clear",
    form_variant: "all",
    content: {
      asset_key: "enneagram_1R_B_t1_core_motivation_v1",
      asset_type: "report_copy",
      category: "core_motivation",
      module_key: "type_deep_dive_summary",
      body_zh: body,
      short_body_zh: "资产短文测试令牌",
      cta_zh: "资产 CTA 测试令牌",
      content_maturity: "staging_preview",
      evidence_level: "descriptive",
      version: "test-preview",
      selection_guidance: "SHOULD_NOT_RENDER_SELECTION_GUIDANCE",
      editor_note: "SHOULD_NOT_RENDER_EDITOR_NOTE",
      qa_note: "SHOULD_NOT_RENDER_QA_NOTE",
      safety_note: "SHOULD_NOT_RENDER_SAFETY_NOTE",
      codex_policy: "SHOULD_NOT_RENDER_CODEX_POLICY",
      qa_policy: "SHOULD_NOT_RENDER_QA_POLICY",
      replacement_policy: "SHOULD_NOT_RENDER_REPLACEMENT_POLICY",
      body_quality: "SHOULD_NOT_RENDER_BODY_QUALITY",
      avoid_when: "SHOULD_NOT_RENDER_AVOID_WHEN",
      import_policy: "SHOULD_NOT_RENDER_IMPORT_POLICY",
    },
    data_refs: [],
    registry_refs: [],
    provenance: {
      projection_refs: [],
      registry_refs: [],
      policy_refs: [],
      content_maturity: "staging_preview",
      evidence_level: "descriptive",
    },
    fallback_policy: "validation_error_only",
  };

  return {
    ok: true,
    scale_code: "ENNEAGRAM",
    report: {
      scale_code: "ENNEAGRAM",
      schema_version: "enneagram.report.v1",
      _meta: {
        enneagram_report_v2: {
          schema_version: "enneagram.report.v2",
          scale_code: "ENNEAGRAM",
          form: {
            form_code: "enneagram_likert_105",
            form_kind: "likert",
            methodology_variant: "asset_preview_only",
          },
          registry: {
            registry_version: "asset_preview_phase_0",
            registry_release_hash: null,
            content_maturity: "staging_preview",
            release_id: null,
          },
          classification: {
            interpretation_scope: "clear",
            confidence_level: "high_confidence",
            interpretation_reason: "asset_preview_fixture",
          },
          pages: [
            {
              page_key: "asset_preview_phase_0",
              title: "ENNEAGRAM asset preview",
              purpose: "staging preview only",
              visibility: "visible",
              source_registry_refs: [],
              modules: [assetModule],
            },
          ],
          modules: [assetModule],
          provenance: {
            report_schema_version: "enneagram.report.v2",
            report_engine_version: "enneagram_asset_preview.phase_0",
          },
        },
      },
    },
  } as ReportResponse;
}

describe("ENNEAGRAM asset-backed renderer contract", () => {
  it("normalizes asset-backed module content with a strict public field allowlist", () => {
    const viewModel = assembleEnneagramResultViewModel({
      reportData: createAssetBackedReport(),
      gate: { isFreeVariant: false },
      locale: "zh",
    });
    const assetModuleViewModel = viewModel.moduleMap.asset_preview_core_motivation;

    expect(enneagramAssetBackedModuleContentSchema.parse(assetModuleViewModel.content)).toEqual({
      asset_key: "enneagram_1R_B_t1_core_motivation_v1",
      asset_type: "report_copy",
      category: "core_motivation",
      module_key: "type_deep_dive_summary",
      body_zh: "资产正文测试令牌，不是前端兜底文案。",
      short_body_zh: "资产短文测试令牌",
      cta_zh: "资产 CTA 测试令牌",
      content_maturity: "staging_preview",
      evidence_level: "descriptive",
      version: "test-preview",
    });
  });

  it("requires an explicit restricted-access gate before rendering asset-backed preview copy", () => {
    const blockedViewModel = assembleEnneagramResultViewModel({
      reportData: createAssetBackedReport(),
      gate: {
        isFreeVariant: true,
        modulesAllowed: new Set(["enneagram_core"]),
        modulesPreview: new Set(),
      },
      locale: "zh",
    });
    expect(blockedViewModel.moduleMap.asset_preview_core_motivation).toBeUndefined();
    expect(blockedViewModel.pages).toHaveLength(0);

    const previewViewModel = assembleEnneagramResultViewModel({
      reportData: createAssetBackedReport(),
      gate: {
        isFreeVariant: true,
        modulesAllowed: new Set(["enneagram_core"]),
        modulesPreview: new Set(["type_deep_dive_summary"]),
      },
      locale: "zh",
    });
    expect(previewViewModel.moduleMap.asset_preview_core_motivation).toBeDefined();
  });

  it("renders backend asset copy while hiding internal metadata", () => {
    const viewModel = assembleEnneagramResultViewModel({
      reportData: createAssetBackedReport(),
      gate: { isFreeVariant: false },
      locale: "zh",
    });

    render(
      <EnneagramResultShell
        locale="zh"
        attemptId="attempt_asset_preview"
        reportLocked={false}
        viewModel={viewModel}
      />
    );

    expect(screen.getByText("资产正文测试令牌，不是前端兜底文案。")).toBeInTheDocument();
    expect(screen.getByText("资产短文测试令牌")).toBeInTheDocument();
    expect(screen.getByText("资产 CTA 测试令牌")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-asset-backed-provenance")).toHaveTextContent("enneagram_1R_B_t1_core_motivation_v1");

    const domText = document.body.textContent ?? "";
    for (const token of INTERNAL_METADATA) {
      expect(domText).not.toContain(token);
      expect(domText).not.toContain(`SHOULD_NOT_RENDER_${token.toUpperCase()}`);
    }
  });

  it("does not invent long prose when backend omits body_zh", () => {
    const viewModel = assembleEnneagramResultViewModel({
      reportData: createAssetBackedReport(""),
      gate: { isFreeVariant: false },
      locale: "zh",
    });

    render(
      <EnneagramResultShell
        locale="zh"
        attemptId="attempt_asset_preview_missing_body"
        reportLocked={false}
        viewModel={viewModel}
      />
    );

    expect(screen.queryByTestId("enneagram-asset-backed-body")).not.toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toContain("This module is using the generic renderer.");
    expect(document.body.textContent ?? "").not.toContain("当前模块使用通用渲染。");
  });
});
