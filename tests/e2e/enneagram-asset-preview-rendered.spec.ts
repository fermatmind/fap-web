import { expect, test, type Page } from "@playwright/test";

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

const STATES = ["clear", "close_call", "diffuse", "low_quality"] as const;

function createAssetPreviewReport(typeId: number, state: string) {
  const body = `资产正文测试令牌 T${typeId} ${state}，用于真实结果页换行与泄漏检查。`.repeat(8);
  const cta = `资产 CTA 测试令牌 T${typeId} ${state}`;
  const assetModule = {
    module_key: `asset_preview_core_motivation_t${typeId}_${state}`,
    kind: "asset_backed_card",
    visibility: "visible",
    state,
    form_variant: "all",
    content: {
      asset_key: `enneagram_1R_preview_t${typeId}_${state}`,
      asset_type: "report_copy",
      category: "core_motivation",
      module_key: "type_deep_dive_summary",
      body_zh: body,
      short_body_zh: `资产短文测试令牌 T${typeId} ${state}`,
      cta_zh: cta,
      content_maturity: "staging_preview",
      evidence_level: "descriptive",
      version: "e2e-preview",
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
      policy_refs: ["enneagram.asset_preview.phase_0"],
      content_maturity: "staging_preview",
      evidence_level: "descriptive",
    },
    fallback_policy: "validation_error_only",
  };

  return {
    ok: true,
    locked: false,
    variant: "full",
    scale_code: "ENNEAGRAM",
    report: {
      schema_version: "enneagram.report.v1",
      scale_code: "ENNEAGRAM",
      _meta: {
        enneagram_report_v2: {
          schema_version: "enneagram.report.v2",
          scale_code: "ENNEAGRAM",
          preview_mode: true,
          production_import_allowed: false,
          full_replacement_allowed: false,
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
            interpretation_scope: state,
            confidence_level: state === "clear" ? "high_confidence" : state,
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
  };
}

async function installPreviewMocks(page: Page, attemptId: string, report: unknown) {
  await page.route("**/api/track", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });

  await page.route("**/api/v0.3/auth/guest*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, fm_token: "fm_e2e_enneagram_asset_preview" }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report-access(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "ready",
        report_state: "ready",
        pdf_state: "unavailable",
        reason_code: "report_ready",
        actions: {
          page_href: `/en/result/${attemptId}`,
        },
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(report),
    });
  });
}

test.describe("ENNEAGRAM asset preview rendered QA", () => {
  for (const viewport of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    test(`${viewport.name}: result shell renders 9 types x 4 states without metadata leakage or overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const typeId of Array.from({ length: 9 }, (_, index) => index + 1)) {
        for (const state of STATES) {
          const attemptId = `enneagram-asset-preview-t${typeId}-${state}`;
          await installPreviewMocks(page, attemptId, createAssetPreviewReport(typeId, state));
          await page.goto(`/en/result/${attemptId}`);

          await expect(page.getByTestId("enneagram-result-shell")).toBeVisible();
          await expect(page.getByTestId("enneagram-asset-backed-body")).toBeVisible();
          await expect(page.getByTestId("enneagram-asset-backed-cta")).toHaveText(`资产 CTA 测试令牌 T${typeId} ${state}`);

          const text = await page.locator("body").innerText();
          for (const token of INTERNAL_METADATA) {
            expect(text).not.toContain(token);
          }
          expect(text).not.toContain("SHOULD_NOT_RENDER");
          expect(text).not.toContain("This module is using the generic renderer.");
          expect(text).not.toContain("当前模块使用通用渲染。");

          const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
          expect(hasHorizontalOverflow).toBe(false);

          await page.unrouteAll({ behavior: "ignoreErrors" });
        }
      }
    });
  }
});
